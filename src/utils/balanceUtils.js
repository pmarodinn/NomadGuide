/**
 * Calculate the real balance of a trip based on actual transactions
 * @param {Object} trip - The trip object with budget
 * @param {Array} transactions - Array of transactions
 * @returns {number} - Real balance
 */
export const calculateRealBalance = (trip, transactions) => {
  if (!trip || !transactions) return 0;

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return trip.budget + totalIncome - totalExpenses;
};

/**
 * Calculate the projected balance including pending recurrences
 * @param {Object} trip - The trip object
 * @param {Array} transactions - Array of actual transactions
 * @param {Array} recurrences - Array of active recurrences
 * @returns {number} - Projected balance
 */
export const calculateProjectedBalance = (trip, transactions, recurrences) => {
  let balance = calculateRealBalance(trip, transactions);
  const now = new Date();

  // Process each active recurrence
  recurrences.forEach(recurrence => {
    if (!recurrence.isActive || !recurrence.nextDate) return;

    let nextDate = recurrence.nextDate.toDate ? recurrence.nextDate.toDate() : new Date(recurrence.nextDate);
    const endDate = recurrence.endDate.toDate ? recurrence.endDate.toDate() : new Date(recurrence.endDate);
    const intervalHours = recurrence.interval;

    // Count how many occurrences will happen between now and end date
    let occurrences = 0;
    while (nextDate <= endDate && nextDate <= now) {
      occurrences++;
      nextDate = new Date(nextDate.getTime() + intervalHours * 60 * 60 * 1000);
    }

    // Apply the recurrence effect
    if (recurrence.type === 'income') {
      balance += recurrence.amount * occurrences;
    } else {
      balance -= recurrence.amount * occurrences;
    }
  });

  return balance;
};

/**
 * Get daily spending data for charts
 * @param {Array} transactions - Array of transactions
 * @param {Array} recurrences - Array of recurrences
 * @param {number} days - Number of days to analyze (default 7)
 * @returns {Object} - Daily spending data with labels and datasets
 */
export const getDailySpendingData = (transactions, recurrences, days = 7) => {
  const now = new Date();
  const labels = [];
  const realSpending = [];
  const projectedSpending = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
    const displayDate = date.toLocaleDateString('pt-BR', { month: '2-digit', day: '2-digit' });

    labels.push(displayDate);

    // Calculate real spending for this day
    const dayTransactions = transactions.filter(t => {
      const transactionDate = t.date.toDate ? t.date.toDate() : new Date(t.date);
      return transactionDate.toISOString().split('T')[0] === dateString && t.type === 'expense';
    });
    const dayRealSpending = dayTransactions.reduce((sum, t) => sum + t.amount, 0);
    realSpending.push(dayRealSpending);

    // Calculate projected spending (real + recurrences that occurred on this day)
    let dayProjectedSpending = dayRealSpending;
    
    recurrences.forEach(recurrence => {
      if (!recurrence.isActive || recurrence.type !== 'expense') return;

      const startDate = recurrence.startDate.toDate ? recurrence.startDate.toDate() : new Date(recurrence.startDate);
      const intervalMs = recurrence.interval * 60 * 60 * 1000;

      // Check if this recurrence would occur on this date
      let checkDate = new Date(startDate);
      while (checkDate <= date) {
        if (checkDate.toISOString().split('T')[0] === dateString) {
          dayProjectedSpending += recurrence.amount;
          break;
        }
        checkDate = new Date(checkDate.getTime() + intervalMs);
      }
    });

    projectedSpending.push(dayProjectedSpending);
  }

  return {
    labels,
    datasets: [
      {
        data: realSpending,
        color: () => '#F44336', // Red for real spending
        strokeWidth: 2,
      },
      {
        data: projectedSpending,
        color: () => '#FF9800', // Orange for projected spending
        strokeWidth: 2,
      }
    ]
  };
};
