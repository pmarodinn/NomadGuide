// Balance and financial calculation utilities for NomadGuide

export const balanceUtils = {
  // Calculate current balance for a trip
  calculateCurrentBalance: (initialBudget, incomes = [], outcomes = []) => {
    const totalIncome = incomes.reduce((sum, income) => sum + (income.amount || 0), 0);
    const totalOutcome = outcomes.reduce((sum, outcome) => sum + (outcome.amount || 0), 0);
    
    return (initialBudget || 0) + totalIncome - totalOutcome;
  },

  // Calculate total spent
  calculateTotalSpent: (outcomes = []) => {
    return outcomes.reduce((sum, outcome) => sum + (outcome.amount || 0), 0);
  },

  // Calculate total income
  calculateTotalIncome: (incomes = []) => {
    return incomes.reduce((sum, income) => sum + (income.amount || 0), 0);
  },

  // Calculate projected balance including future recurring transactions
  calculateProjectedBalance: (currentBalance, recurringTransactions = [], tripEndDate) => {
    if (!tripEndDate || !recurringTransactions.length) {
      return currentBalance;
    }

    const now = new Date();
    const endDate = tripEndDate.toDate ? tripEndDate.toDate() : new Date(tripEndDate);
    const remainingDays = Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)));

    let projectedImpact = 0;

    recurringTransactions.forEach(recurring => {
      if (!recurring.startDate || !recurring.endDate || !recurring.frequency) return;

      const startDate = recurring.startDate.toDate ? recurring.startDate.toDate() : new Date(recurring.startDate);
      const recurringEndDate = recurring.endDate.toDate ? recurring.endDate.toDate() : new Date(recurring.endDate);

      // Only consider future occurrences within the trip period
      if (startDate <= endDate && recurringEndDate >= now) {
        const effectiveStartDate = Math.max(now, startDate);
        const effectiveEndDate = Math.min(endDate, recurringEndDate);
        const effectiveDays = Math.max(0, Math.ceil((effectiveEndDate - effectiveStartDate) / (1000 * 60 * 60 * 24)));

        let occurrences = 0;
        switch (recurring.frequency) {
          case 'daily':
            occurrences = effectiveDays;
            break;
          case 'weekly':
            occurrences = Math.floor(effectiveDays / 7);
            break;
          case 'monthly':
            occurrences = Math.floor(effectiveDays / 30);
            break;
          case 'quarterly':
            occurrences = Math.floor(effectiveDays / 90);
            break;
          case 'biannual':
            occurrences = Math.floor(effectiveDays / 180);
            break;
        }

        const impact = occurrences * (recurring.amount || 0);
        if (recurring.type === 'income') {
          projectedImpact += impact;
        } else {
          projectedImpact -= impact;
        }
      }
    });

    return currentBalance + projectedImpact;
  },

  // Calculate daily average spending
  calculateDailyAverage: (outcomes = [], tripStartDate) => {
    if (!outcomes.length || !tripStartDate) return 0;

    const startDate = tripStartDate.toDate ? tripStartDate.toDate() : new Date(tripStartDate);
    const now = new Date();
    const daysPassed = Math.max(1, Math.ceil((now - startDate) / (1000 * 60 * 60 * 24)));

    const totalSpent = balanceUtils.calculateTotalSpent(outcomes);
    return totalSpent / daysPassed;
  },

  // Calculate budget usage percentage
  calculateBudgetUsage: (initialBudget, outcomes = []) => {
    if (!initialBudget || initialBudget <= 0) return 0;

    const totalSpent = balanceUtils.calculateTotalSpent(outcomes);
    return Math.min(100, (totalSpent / initialBudget) * 100);
  },

  // Calculate remaining daily budget
  calculateRemainingDailyBudget: (currentBalance, tripEndDate) => {
    if (!tripEndDate || currentBalance <= 0) return 0;

    const now = new Date();
    const endDate = tripEndDate.toDate ? tripEndDate.toDate() : new Date(tripEndDate);
    const remainingDays = Math.max(1, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)));

    return currentBalance / remainingDays;
  },

  // Get spending by category
  getSpendingByCategory: (outcomes = [], categories = []) => {
    const categorySpending = {};

    outcomes.forEach(outcome => {
      const categoryId = outcome.categoryId || 'uncategorized';
      const category = categories.find(cat => cat.id === categoryId);
      const categoryName = category ? category.name : 'Uncategorized';

      if (!categorySpending[categoryName]) {
        categorySpending[categoryName] = {
          name: categoryName,
          amount: 0,
          count: 0,
          color: category ? category.color : '#757575',
          icon: category ? category.icon : 'help-circle',
        };
      }

      categorySpending[categoryName].amount += outcome.amount || 0;
      categorySpending[categoryName].count += 1;
    });

    // Convert to array and sort by amount
    return Object.values(categorySpending).sort((a, b) => b.amount - a.amount);
  },

  // Get daily spending data for charts
  getDailySpendingData: (outcomes = [], tripStartDate, tripEndDate) => {
    if (!tripStartDate || !tripEndDate) return [];

    const startDate = tripStartDate.toDate ? tripStartDate.toDate() : new Date(tripStartDate);
    const endDate = tripEndDate.toDate ? tripEndDate.toDate() : new Date(tripEndDate);
    const now = new Date();
    const effectiveEndDate = now < endDate ? now : endDate;

    const dailyData = [];
    const currentDate = new Date(startDate);

    while (currentDate <= effectiveEndDate) {
      const dateString = currentDate.toISOString().split('T')[0];
      const dayOutcomes = outcomes.filter(outcome => {
        const outcomeDate = outcome.date.toDate ? outcome.date.toDate() : new Date(outcome.date);
        return outcomeDate.toISOString().split('T')[0] === dateString;
      });

      const dayTotal = dayOutcomes.reduce((sum, outcome) => sum + (outcome.amount || 0), 0);

      dailyData.push({
        date: new Date(currentDate),
        dateString,
        amount: dayTotal,
        count: dayOutcomes.length,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dailyData;
  },

  // Format amount as currency
  formatAmount: (amount, currency = 'USD', options = {}) => {
    const {
      showSymbol = true,
      showCode = false,
      decimalPlaces = 2,
      locale = 'en-US',
    } = options;

    if (amount === null || amount === undefined) return '';

    try {
      const formatter = new Intl.NumberFormat(locale, {
        style: showSymbol ? 'currency' : 'decimal',
        currency: currency,
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces,
      });

      let formatted = formatter.format(Math.abs(amount));

      if (showCode && !showSymbol) {
        formatted = `${formatted} ${currency}`;
      }

      return formatted;
    } catch (error) {
      // Fallback formatting
      const formattedAmount = Math.abs(amount).toFixed(decimalPlaces);
      if (showSymbol) {
        return `$${formattedAmount}`;
      }
      return showCode ? `${formattedAmount} ${currency}` : formattedAmount;
    }
  },

  // Get balance status (good, warning, critical)
  getBalanceStatus: (currentBalance, initialBudget) => {
    if (!initialBudget || initialBudget <= 0) {
      return currentBalance >= 0 ? 'good' : 'critical';
    }

    const percentage = (currentBalance / initialBudget) * 100;

    if (percentage >= 20) return 'good';
    if (percentage >= 5) return 'warning';
    return 'critical';
  },

  // Calculate transaction statistics
  getTransactionStats: (incomes = [], outcomes = []) => {
    const totalTransactions = incomes.length + outcomes.length;
    const totalIncome = balanceUtils.calculateTotalIncome(incomes);
    const totalOutcome = balanceUtils.calculateTotalSpent(outcomes);
    const netAmount = totalIncome - totalOutcome;

    const averageIncome = incomes.length > 0 ? totalIncome / incomes.length : 0;
    const averageOutcome = outcomes.length > 0 ? totalOutcome / outcomes.length : 0;

    const largestIncome = incomes.length > 0 ? Math.max(...incomes.map(i => i.amount || 0)) : 0;
    const largestOutcome = outcomes.length > 0 ? Math.max(...outcomes.map(o => o.amount || 0)) : 0;

    return {
      totalTransactions,
      totalIncome,
      totalOutcome,
      netAmount,
      averageIncome,
      averageOutcome,
      largestIncome,
      largestOutcome,
      incomeCount: incomes.length,
      outcomeCount: outcomes.length,
    };
  },

  // Round to 2 decimal places to avoid floating point errors
  roundAmount: (amount) => {
    return Math.round((amount + Number.EPSILON) * 100) / 100;
  },

  // Check if amount is valid
  isValidAmount: (amount) => {
    return typeof amount === 'number' && !isNaN(amount) && isFinite(amount) && amount >= 0;
  },
};

export default balanceUtils;
