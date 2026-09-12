import { ForecastAssumptions, ForecastResult, ForecastPeriod, ForecastScenario, SavingsGoal, Transaction } from '../types';

export function calculateForecast(
  scenario: ForecastScenario,
  transactions: Transaction[],
  goals: SavingsGoal[],
  currentBalance: number
): ForecastResult {
  const assumptions = scenario.assumptions;
  const periods: ForecastPeriod[] = [];
  let cumulativeBalance = currentBalance;
  let totalSavings = goals.reduce((sum, g) => sum + g.currentSaved, 0);

  // Calculate historical averages from transactions
  const activeTransactions = transactions.filter(t => t.status === 'active');
  const monthlyIncome = calculateAvgMonthlyIncome(activeTransactions);
  const monthlyExpenses = calculateAvgMonthlyExpenses(activeTransactions);

  const keyDrivers: string[] = [];

  // Compare scenario assumptions to historical
  if (scenario.name !== 'Baseline') {
    if (assumptions.avgMonthlyIncome < monthlyIncome) {
      keyDrivers.push(`Income assumed ${Math.round((1 - assumptions.avgMonthlyIncome / monthlyIncome) * 100)}% lower than historical average`);
    } else if (assumptions.avgMonthlyIncome > monthlyIncome) {
      keyDrivers.push(`Income assumed ${Math.round((assumptions.avgMonthlyIncome / monthlyIncome - 1) * 100)}% higher than historical average`);
    }

    if (assumptions.savingsContribution > 200) {
      keyDrivers.push(`Increased savings contribution to $${assumptions.savingsContribution}/month`);
    }

    const diningBudget = assumptions.categoryBudgets.find(b => b.category === 'Food - Dining Out');
    if (diningBudget) {
      const historicalDining = calculateCategoryAverage(activeTransactions, 'Food - Dining Out');
      if (diningBudget.limit < historicalDining) {
        keyDrivers.push(`Reduced dining out budget by ${Math.round((1 - diningBudget.limit / historicalDining) * 100)}%`);
      }
    }

    if (assumptions.expenseInflation > 2) {
      keyDrivers.push(`Higher expense inflation assumed (${assumptions.expenseInflation}% vs 2% baseline)`);
    }
  } else {
    keyDrivers.push('Using historical averages with no adjustments');
  }

  // Generate forecast periods
  const horizon = assumptions.forecastMonths;
  const isMonthly = assumptions.forecastHorizon === 'monthly';
  const numPeriods = isMonthly ? horizon : horizon * 4;

  for (let i = 1; i <= numPeriods; i++) {
    let periodDate: Date;
    let label: string;

    if (isMonthly) {
      periodDate = new Date(new Date().getFullYear(), new Date().getMonth() + i, 1);
      label = periodDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } else {
      periodDate = new Date(Date.now() + i * 7 * 24 * 60 * 60 * 1000);
      label = `Week ${i}`;
    }

    // Calculate projected income for this period
    let projectedIncome: number;
    if (isMonthly) {
      projectedIncome = assumptions.avgMonthlyIncome * (1 + (Math.random() * 2 - 1) * (assumptions.incomeVolatility / 100));
    } else {
      projectedIncome = (assumptions.avgMonthlyIncome / 4) * (1 + (Math.random() * 2 - 1) * (assumptions.incomeVolatility / 100));
    }

    // Calculate projected expenses
    const recurringTotal = assumptions.recurringBills.reduce((sum, b) => {
      if (isMonthly) return sum + b.amount;
      return sum + (b.frequency === 'monthly' ? b.amount / 4 : b.amount);
    }, 0);

    const categoryTotal = assumptions.categoryBudgets.reduce((sum, b) => {
      if (isMonthly) return sum + b.limit * 0.8; // Assume 80% of budget used
      return sum + (b.limit * 0.8) / 4;
    }, 0);

    let projectedExpenses = recurringTotal + categoryTotal;

    // Apply inflation
    const inflationMultiplier = 1 + (assumptions.expenseInflation / 100) * (i / (isMonthly ? 12 : 52));
    projectedExpenses *= inflationMultiplier;

    // Add buffer
    projectedExpenses *= (1 + assumptions.bufferPercentage / 100);

    // One-time items
    if (isMonthly) {
      const monthStr = `${periodDate.getFullYear()}-${String(periodDate.getMonth() + 1).padStart(2, '0')}`;
      const oneTimeIncome = assumptions.oneTimeIncome
        .filter(e => e.date.startsWith(monthStr))
        .reduce((sum, e) => sum + e.amount, 0);
      const oneTimeExpenses = assumptions.oneTimeExpenses
        .filter(e => e.date.startsWith(monthStr))
        .reduce((sum, e) => sum + e.amount, 0);
      projectedIncome += oneTimeIncome;
      projectedExpenses += Math.abs(oneTimeExpenses);
    }

    // Savings contribution
    const savingsThisPeriod = isMonthly ? assumptions.savingsContribution : assumptions.savingsContribution / 4;

    const netCashFlow = projectedIncome - projectedExpenses - savingsThisPeriod;
    cumulativeBalance += netCashFlow;
    totalSavings += savingsThisPeriod;

    periods.push({
      label,
      date: periodDate.toISOString().split('T')[0],
      projectedIncome: Math.round(projectedIncome * 100) / 100,
      projectedExpenses: Math.round(projectedExpenses * 100) / 100,
      netCashFlow: Math.round(netCashFlow * 100) / 100,
      cumulativeBalance: Math.round(cumulativeBalance * 100) / 100,
      savingsProgress: Math.round(totalSavings * 100) / 100,
    });
  }

  // Calculate goal reached date
  const primaryGoal = goals.find(g => g.priority === 'high') || goals[0];
  let goalReachedDate: string | undefined;
  if (primaryGoal) {
    const remaining = primaryGoal.targetAmount - totalSavings;
    if (remaining <= 0) {
      goalReachedDate = 'Already reached!';
    } else {
      const monthlySavingsRate = assumptions.savingsContribution;
      const monthsToGoal = Math.ceil(remaining / monthlySavingsRate);
      const goalDate = new Date();
      goalDate.setMonth(goalDate.getMonth() + monthsToGoal);
      goalReachedDate = goalDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
  }

  // Confidence language
  let confidence: string;
  if (scenario.name === 'Baseline') {
    confidence = 'Based on historical patterns. Actual results may vary due to income volatility and unexpected expenses.';
  } else if (scenario.name === 'Savings Boost') {
    confidence = 'Optimistic scenario. Requires consistent discipline in reducing discretionary spending.';
  } else if (scenario.name === 'Conservative') {
    confidence = 'Prepared for downside. Accounts for lower income and higher costs. Use as safety planning.';
  } else {
    confidence = 'Custom scenario based on your assumptions. Review assumptions carefully for accuracy.';
  }

  return {
    scenarioId: scenario.id,
    scenarioName: scenario.name,
    periods,
    endingBalance: cumulativeBalance,
    goalReachedDate,
    keyDrivers,
    confidence,
  };
}

function calculateAvgMonthlyIncome(transactions: Transaction[]): number {
  const incomeTransactions = transactions.filter(t => t.amount > 0);
  if (incomeTransactions.length === 0) return 0;

  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
  const dates = incomeTransactions.map(t => new Date(t.date));
  const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
  const months = Math.max(1, (maxDate.getTime() - minDate.getTime()) / (30.44 * 24 * 60 * 60 * 1000));

  return totalIncome / months;
}

function calculateAvgMonthlyExpenses(transactions: Transaction[]): number {
  const expenseTransactions = transactions.filter(t => t.amount < 0);
  if (expenseTransactions.length === 0) return 0;

  const totalExpenses = Math.abs(expenseTransactions.reduce((sum, t) => sum + t.amount, 0));
  const dates = expenseTransactions.map(t => new Date(t.date));
  const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
  const months = Math.max(1, (maxDate.getTime() - minDate.getTime()) / (30.44 * 24 * 60 * 60 * 1000));

  return totalExpenses / months;
}

function calculateCategoryAverage(transactions: Transaction[], category: string): number {
  const catTransactions = transactions.filter(t => t.category === category && t.amount < 0);
  if (catTransactions.length === 0) return 0;

  const total = Math.abs(catTransactions.reduce((sum, t) => sum + t.amount, 0));
  const dates = catTransactions.map(t => new Date(t.date));
  const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
  const months = Math.max(1, (maxDate.getTime() - minDate.getTime()) / (30.44 * 24 * 60 * 60 * 1000));

  return total / months;
}

export function compareScenarios(results: ForecastResult[]): { metric: string; values: { scenario: string; value: number | string }[] }[] {
  const comparisons: { metric: string; values: { scenario: string; value: number | string }[] }[] = [];

  // Ending balance comparison
  comparisons.push({
    metric: 'Projected Ending Balance',
    values: results.map(r => ({ scenario: r.scenarioName, value: `$${r.endingBalance.toFixed(0)}` })),
  });

  // Goal reached date
  comparisons.push({
    metric: 'Savings Goal Reached',
    values: results.map(r => ({ scenario: r.scenarioName, value: r.goalReachedDate || 'Not within horizon' })),
  });

  // Average monthly net
  comparisons.push({
    metric: 'Avg Monthly Net Cash Flow',
    values: results.map(r => {
      const avg = r.periods.reduce((sum, p) => sum + p.netCashFlow, 0) / r.periods.length;
      return { scenario: r.scenarioName, value: `$${avg.toFixed(0)}` };
    }),
  });

  // Total savings accumulated
  comparisons.push({
    metric: 'Total Savings Accumulated',
    values: results.map(r => {
      const total = r.periods[r.periods.length - 1]?.savingsProgress || 0;
      return { scenario: r.scenarioName, value: `$${total.toFixed(0)}` };
    }),
  });

  return comparisons;
}
