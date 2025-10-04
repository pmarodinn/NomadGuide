// Chart data processing utilities for NomadGuide analytics

import { format, parseISO, startOfDay, endOfDay, eachDayOfInterval, subDays, subWeeks, subMonths } from 'date-fns';

export const chartUtils = {
  // Generate colors for chart data
  colors: {
    primary: '#1976D2',
    secondary: '#DC004E',
    success: '#2E7D32',
    warning: '#F57C00',
    error: '#D32F2F',
    info: '#0288D1',
    purple: '#7B1FA2',
    orange: '#E64A19',
    teal: '#00695C',
    pink: '#C2185B',
    indigo: '#303F9F',
    green: '#388E3C',
  },

  // Get a color from the palette
  getColor: (index) => {
    const colorKeys = Object.keys(chartUtils.colors);
    const colorKey = colorKeys[index % colorKeys.length];
    return chartUtils.colors[colorKey];
  },

  // Generate colors for multiple data series
  generateColors: (count, opacity = 1) => {
    const colors = [];
    for (let i = 0; i < count; i++) {
      const color = chartUtils.getColor(i);
      colors.push(opacity < 1 ? `${color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}` : color);
    }
    return colors;
  },

  // Process daily spending data for line charts
  processSpendingData: (transactions = [], startDate, endDate, currency = 'USD') => {
    const start = startDate instanceof Date ? startDate : new Date(startDate);
    const end = endDate instanceof Date ? endDate : new Date(endDate);
    const now = new Date();
    const effectiveEnd = now < end ? now : end;
    
    const days = eachDayOfInterval({ start, end: effectiveEnd });
    const data = {
      labels: [],
      datasets: [{
        data: [],
        color: (opacity = 1) => `rgba(25, 118, 210, ${opacity})`,
        strokeWidth: 2,
      }],
    };

    days.forEach(day => {
      const dayStart = startOfDay(day);
      const dayEnd = endOfDay(day);
      
      const dayTransactions = transactions.filter(transaction => {
        const transactionDate = transaction.date.toDate ? transaction.date.toDate() : new Date(transaction.date);
        return transactionDate >= dayStart && transactionDate <= dayEnd;
      });

      const dayTotal = dayTransactions.reduce((sum, transaction) => {
        return sum + (transaction.amount || 0);
      }, 0);

      data.labels.push(format(day, 'MMM dd'));
      data.datasets[0].data.push(dayTotal);
    });

    return data;
  },

  // Process category spending data for pie charts
  processCategoryData: (transactions = [], categories = []) => {
    const categoryTotals = {};
    const categoryInfo = {};

    // Initialize categories
    categories.forEach(category => {
      categoryTotals[category.id] = 0;
      categoryInfo[category.id] = {
        name: category.name,
        color: category.color || chartUtils.getColor(categories.indexOf(category)),
        icon: category.icon,
      };
    });

    // Add uncategorized
    categoryTotals['uncategorized'] = 0;
    categoryInfo['uncategorized'] = {
      name: 'Uncategorized',
      color: '#757575',
      icon: 'help-circle',
    };

    // Sum transactions by category
    transactions.forEach(transaction => {
      const categoryId = transaction.categoryId || 'uncategorized';
      categoryTotals[categoryId] = (categoryTotals[categoryId] || 0) + (transaction.amount || 0);
    });

    // Convert to chart format
    const data = [];
    const labels = [];
    const colors = [];

    Object.entries(categoryTotals).forEach(([categoryId, total]) => {
      if (total > 0) {
        const info = categoryInfo[categoryId];
        data.push(total);
        labels.push(info.name);
        colors.push(info.color);
      }
    });

    return {
      data,
      labels,
      colors,
      categoryInfo,
    };
  },

  // Process monthly spending trends
  processMonthlyTrends: (transactions = [], months = 6) => {
    const endDate = new Date();
    const startDate = subMonths(endDate, months);
    
    const monthlyData = {};
    const monthLabels = [];

    // Initialize months
    for (let i = months - 1; i >= 0; i--) {
      const month = subMonths(endDate, i);
      const monthKey = format(month, 'yyyy-MM');
      const monthLabel = format(month, 'MMM yyyy');
      
      monthlyData[monthKey] = { income: 0, outcome: 0 };
      monthLabels.push(monthLabel);
    }

    // Process transactions
    transactions.forEach(transaction => {
      const transactionDate = transaction.date.toDate ? transaction.date.toDate() : new Date(transaction.date);
      
      if (transactionDate >= startDate && transactionDate <= endDate) {
        const monthKey = format(transactionDate, 'yyyy-MM');
        
        if (monthlyData[monthKey]) {
          const amount = transaction.amount || 0;
          if (transaction.type === 'income') {
            monthlyData[monthKey].income += amount;
          } else {
            monthlyData[monthKey].outcome += amount;
          }
        }
      }
    });

    return {
      labels: monthLabels,
      datasets: [
        {
          data: Object.values(monthlyData).map(month => month.income),
          color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`,
          strokeWidth: 2,
        },
        {
          data: Object.values(monthlyData).map(month => month.outcome),
          color: (opacity = 1) => `rgba(211, 47, 47, ${opacity})`,
          strokeWidth: 2,
        },
      ],
      legend: ['Income', 'Spending'],
    };
  },

  // Process weekly spending data
  processWeeklyData: (transactions = [], weeks = 8) => {
    const endDate = new Date();
    const startDate = subWeeks(endDate, weeks);
    
    const weeklyData = {};
    const weekLabels = [];

    // Initialize weeks
    for (let i = weeks - 1; i >= 0; i--) {
      const weekStart = startOfDay(subWeeks(endDate, i));
      const weekKey = format(weekStart, 'yyyy-MM-dd');
      const weekLabel = format(weekStart, 'MMM dd');
      
      weeklyData[weekKey] = 0;
      weekLabels.push(weekLabel);
    }

    // Process transactions
    transactions.forEach(transaction => {
      const transactionDate = transaction.date.toDate ? transaction.date.toDate() : new Date(transaction.date);
      
      if (transactionDate >= startDate && transactionDate <= endDate) {
        const weekStart = startOfDay(subWeeks(transactionDate, transactionDate.getDay()));
        const weekKey = format(weekStart, 'yyyy-MM-dd');
        
        if (weeklyData[weekKey] !== undefined) {
          weeklyData[weekKey] += transaction.amount || 0;
        }
      }
    });

    return {
      labels: weekLabels,
      datasets: [{
        data: Object.values(weeklyData),
        color: (opacity = 1) => `rgba(25, 118, 210, ${opacity})`,
        strokeWidth: 2,
      }],
    };
  },

  // Process budget vs actual spending
  processBudgetComparison: (trips = []) => {
    const data = trips.map(trip => ({
      tripName: trip.title,
      budget: trip.initialBudget || 0,
      spent: trip.totalSpent || 0,
      remaining: Math.max(0, (trip.initialBudget || 0) - (trip.totalSpent || 0)),
    }));

    return {
      labels: data.map(item => item.tripName),
      datasets: [
        {
          data: data.map(item => item.budget),
          color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`,
          strokeWidth: 2,
        },
        {
          data: data.map(item => item.spent),
          color: (opacity = 1) => `rgba(211, 47, 47, ${opacity})`,
          strokeWidth: 2,
        },
      ],
      legend: ['Budget', 'Spent'],
      rawData: data,
    };
  },

  // Process currency distribution
  processCurrencyDistribution: (transactions = []) => {
    const currencyTotals = {};
    
    transactions.forEach(transaction => {
      const currency = transaction.currency || 'USD';
      currencyTotals[currency] = (currencyTotals[currency] || 0) + (transaction.amount || 0);
    });

    const sortedCurrencies = Object.entries(currencyTotals)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10); // Top 10 currencies

    return {
      data: sortedCurrencies.map(([, total]) => total),
      labels: sortedCurrencies.map(([currency]) => currency),
      colors: chartUtils.generateColors(sortedCurrencies.length),
    };
  },

  // Calculate moving average
  calculateMovingAverage: (data, windowSize = 7) => {
    const movingAverage = [];
    
    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - Math.floor(windowSize / 2));
      const end = Math.min(data.length - 1, i + Math.floor(windowSize / 2));
      
      let sum = 0;
      let count = 0;
      
      for (let j = start; j <= end; j++) {
        sum += data[j];
        count++;
      }
      
      movingAverage.push(count > 0 ? sum / count : 0);
    }
    
    return movingAverage;
  },

  // Process transaction frequency data
  processTransactionFrequency: (transactions = [], period = 'daily') => {
    const frequencyData = {};
    
    transactions.forEach(transaction => {
      const transactionDate = transaction.date.toDate ? transaction.date.toDate() : new Date(transaction.date);
      let key;
      
      switch (period) {
        case 'hourly':
          key = format(transactionDate, 'HH:00');
          break;
        case 'daily':
          key = format(transactionDate, 'EEEE');
          break;
        case 'weekly':
          key = `Week ${format(transactionDate, 'w')}`;
          break;
        case 'monthly':
          key = format(transactionDate, 'MMMM');
          break;
        default:
          key = format(transactionDate, 'MMM dd');
      }
      
      frequencyData[key] = (frequencyData[key] || 0) + 1;
    });

    return {
      labels: Object.keys(frequencyData),
      data: Object.values(frequencyData),
      colors: chartUtils.generateColors(Object.keys(frequencyData).length, 0.8),
    };
  },

  // Calculate chart statistics
  calculateChartStats: (data) => {
    if (!data || !data.length) {
      return { min: 0, max: 0, average: 0, total: 0 };
    }

    const total = data.reduce((sum, value) => sum + value, 0);
    const average = total / data.length;
    const min = Math.min(...data);
    const max = Math.max(...data);

    return { min, max, average, total };
  },

  // Format chart data for React Native Chart Kit
  formatForChartKit: (processedData, chartType = 'line') => {
    switch (chartType) {
      case 'line':
      case 'bezier':
        return {
          labels: processedData.labels || [],
          datasets: processedData.datasets || [],
          legend: processedData.legend,
        };
        
      case 'bar':
        return {
          labels: processedData.labels || [],
          datasets: processedData.datasets || [],
        };
        
      case 'pie':
        return processedData.data?.map((value, index) => ({
          name: processedData.labels?.[index] || `Item ${index + 1}`,
          population: value,
          color: processedData.colors?.[index] || chartUtils.getColor(index),
          legendFontColor: '#7F7F7F',
          legendFontSize: 15,
        })) || [];
        
      case 'progress':
        return {
          data: processedData.data || [],
          colors: processedData.colors || chartUtils.generateColors(processedData.data?.length || 0),
        };
        
      default:
        return processedData;
    }
  },

  // Get chart configuration
  getChartConfig: (theme = 'light') => {
    const isDark = theme === 'dark';
    
    return {
      backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
      backgroundGradientFrom: isDark ? '#1e1e1e' : '#ffffff',
      backgroundGradientTo: isDark ? '#1e1e1e' : '#ffffff',
      decimalPlaces: 0,
      color: (opacity = 1) => isDark ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
      labelColor: (opacity = 1) => isDark ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
      style: {
        borderRadius: 16,
      },
      propsForDots: {
        r: '4',
        strokeWidth: '2',
        stroke: chartUtils.colors.primary,
      },
      fillShadowGradient: chartUtils.colors.primary,
      fillShadowGradientOpacity: 0.1,
    };
  },
};

export default chartUtils;
