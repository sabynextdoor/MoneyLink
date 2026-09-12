import { Transaction, CategoryRule, SavingsGoal, ForecastAssumptions, ForecastScenario } from '../types';
import { v4 as uuidv4 } from 'uuid';

const STUDENT_MERCHANTS = {
  income: [
    { name: 'Campus Bookstore', desc: 'Part-time job - Campus Library' },
    { name: 'FreelancePay', desc: 'Freelance web design project' },
    { name: 'University Financial Aid', desc: 'Semester scholarship disbursement' },
    { name: 'Family Transfer', desc: 'Monthly family support' },
    { name: 'Research Lab', desc: 'Research assistant stipend' },
    { name: 'Tutoring Center', desc: 'Math tutoring session' },
  ],
  housing: [
    { name: 'Campus Housing', desc: 'Monthly rent payment' },
    { name: 'City Electric Co', desc: 'Electric bill' },
    { name: 'Water Utility', desc: 'Water and sewer bill' },
    { name: 'Internet Provider', desc: 'Home internet service' },
  ],
  food: [
    { name: 'Campus Dining', desc: 'Meal plan charge' },
    { name: 'FreshMart Grocery', desc: 'Weekly grocery shopping' },
    { name: 'Pizza Palace', desc: 'Friday night pizza' },
    { name: 'Coffee Corner', desc: 'Morning coffee and pastry' },
    { name: 'Burger Barn', desc: 'Lunch with friends' },
    { name: 'Sushi Express', desc: 'Birthday dinner' },
  ],
  transport: [
    { name: 'City Transit', desc: 'Monthly bus pass' },
    { name: 'Gas Station', desc: 'Fuel for car' },
    { name: 'RideShare', desc: 'Ride to airport' },
    { name: 'Campus Parking', desc: 'Semester parking permit' },
  ],
  education: [
    { name: 'University Registrar', desc: 'Tuition payment - Spring semester' },
    { name: 'Campus Bookstore', desc: 'Required textbooks' },
    { name: 'Online Learning', desc: 'Course subscription' },
    { name: 'Print Shop', desc: 'Printing and binding' },
  ],
  subscriptions: [
    { name: 'StreamFlix', desc: 'Monthly streaming subscription' },
    { name: 'MusicStream', desc: 'Music streaming plan' },
    { name: 'Cloud Storage', desc: 'Cloud backup service' },
    { name: 'News Daily', desc: 'Digital news subscription' },
  ],
  entertainment: [
    { name: 'Movie Theater', desc: 'Movie tickets' },
    { name: 'GameZone', desc: 'Video game purchase' },
    { name: 'Concert Hall', desc: 'Concert tickets' },
    { name: 'Bowling Alley', desc: 'Weekend bowling' },
  ],
  personal: [
    { name: 'Campus Gym', desc: 'Monthly gym membership' },
    { name: 'Pharmacy Plus', desc: 'Health supplies' },
    { name: 'Clothing Store', desc: 'New clothes for semester' },
    { name: 'Hair Studio', desc: 'Haircut' },
  ],
};

function randomBetween(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function randomDate(start: Date, end: Date): Date {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date;
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function generateSyntheticTransactions(): Transaction[] {
  const transactions: Transaction[] = [];
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);

  // Generate recurring income
  // Monthly paycheck from part-time job
  for (let month = 0; month < 6; month++) {
    const date = new Date(now.getFullYear(), now.getMonth() - month, 15);
    if (date >= sixMonthsAgo) {
      transactions.push({
        id: uuidv4(),
        date: formatDate(date),
        description: 'Part-time job - Campus Library',
        merchant: 'Campus Bookstore',
        amount: randomBetween(800, 950),
        currency: 'USD',
        type: 'income',
        category: 'Income - Employment',
        source: 'synthetic',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }

  // Bi-weekly freelance income (irregular)
  for (let i = 0; i < 10; i++) {
    const date = randomDate(sixMonthsAgo, now);
    transactions.push({
      id: uuidv4(),
      date: formatDate(date),
      description: `Freelance project #${i + 1}`,
      merchant: 'FreelancePay',
      amount: randomBetween(100, 500),
      currency: 'USD',
      type: 'income',
      category: 'Income - Freelance',
      source: 'synthetic',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  // Monthly family support
  for (let month = 0; month < 6; month++) {
    const date = new Date(now.getFullYear(), now.getMonth() - month, 1);
    if (date >= sixMonthsAgo) {
      transactions.push({
        id: uuidv4(),
        date: formatDate(date),
        description: 'Monthly family support',
        merchant: 'Family Transfer',
        amount: 300,
        currency: 'USD',
        type: 'income',
        category: 'Income - Family Support',
        source: 'synthetic',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }

  // Scholarship (quarterly)
  for (let q = 0; q < 2; q++) {
    const date = new Date(now.getFullYear(), now.getMonth() - (q * 3) - 1, 20);
    if (date >= sixMonthsAgo) {
      transactions.push({
        id: uuidv4(),
        date: formatDate(date),
        description: 'Semester scholarship disbursement',
        merchant: 'University Financial Aid',
        amount: 2500,
        currency: 'USD',
        type: 'income',
        category: 'Income - Scholarship',
        source: 'synthetic',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }

  // Monthly rent
  for (let month = 0; month < 6; month++) {
    const date = new Date(now.getFullYear(), now.getMonth() - month, 1);
    if (date >= sixMonthsAgo) {
      transactions.push({
        id: uuidv4(),
        date: formatDate(date),
        description: 'Monthly rent payment',
        merchant: 'Campus Housing',
        amount: -750,
        currency: 'USD',
        type: 'expense',
        category: 'Housing - Rent',
        source: 'synthetic',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }

  // Monthly utilities
  for (let month = 0; month < 6; month++) {
    const date = new Date(now.getFullYear(), now.getMonth() - month, 10);
    if (date >= sixMonthsAgo) {
      transactions.push({
        id: uuidv4(),
        date: formatDate(date),
        description: 'Electric bill',
        merchant: 'City Electric Co',
        amount: -randomBetween(60, 95),
        currency: 'USD',
        type: 'expense',
        category: 'Housing - Utilities',
        source: 'synthetic',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }

  // Weekly groceries
  for (let week = 0; week < 24; week++) {
    const date = new Date(now.getTime() - week * 7 * 24 * 60 * 60 * 1000);
    if (date >= sixMonthsAgo) {
      transactions.push({
        id: uuidv4(),
        date: formatDate(date),
        description: 'Weekly grocery shopping',
        merchant: 'FreshMart Grocery',
        amount: -randomBetween(45, 85),
        currency: 'USD',
        type: 'expense',
        category: 'Food - Groceries',
        source: 'synthetic',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }

  // Dining out (2-3 times per week)
  for (let i = 0; i < 50; i++) {
    const date = randomDate(sixMonthsAgo, now);
    const merchants = [
      { name: 'Pizza Palace', desc: 'Pizza night' },
      { name: 'Coffee Corner', desc: 'Coffee run' },
      { name: 'Burger Barn', desc: 'Lunch out' },
      { name: 'Sushi Express', desc: 'Sushi dinner' },
    ];
    const m = merchants[Math.floor(Math.random() * merchants.length)];
    transactions.push({
      id: uuidv4(),
      date: formatDate(date),
      description: m.desc,
      merchant: m.name,
      amount: -randomBetween(8, 35),
      currency: 'USD',
      type: 'expense',
      category: 'Food - Dining Out',
      source: 'synthetic',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  // Monthly subscriptions
  for (let month = 0; month < 6; month++) {
    const date = new Date(now.getFullYear(), now.getMonth() - month, 5);
    if (date >= sixMonthsAgo) {
      transactions.push({
        id: uuidv4(),
        date: formatDate(date),
        description: 'Monthly streaming subscription',
        merchant: 'StreamFlix',
        amount: -15.99,
        currency: 'USD',
        type: 'expense',
        category: 'Subscriptions',
        source: 'synthetic',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      transactions.push({
        id: uuidv4(),
        date: formatDate(date),
        description: 'Music streaming plan',
        merchant: 'MusicStream',
        amount: -9.99,
        currency: 'USD',
        type: 'expense',
        category: 'Subscriptions',
        source: 'synthetic',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }

  // Transportation
  for (let month = 0; month < 6; month++) {
    const date = new Date(now.getFullYear(), now.getMonth() - month, 3);
    if (date >= sixMonthsAgo) {
      transactions.push({
        id: uuidv4(),
        date: formatDate(date),
        description: 'Monthly bus pass',
        merchant: 'City Transit',
        amount: -65,
        currency: 'USD',
        type: 'expense',
        category: 'Transportation',
        source: 'synthetic',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }

  // Entertainment (occasional)
  for (let i = 0; i < 12; i++) {
    const date = randomDate(sixMonthsAgo, now);
    const items = [
      { name: 'Movie Theater', desc: 'Movie tickets', amount: randomBetween(12, 25) },
      { name: 'GameZone', desc: 'Video game', amount: randomBetween(20, 60) },
      { name: 'Bowling Alley', desc: 'Bowling night', amount: randomBetween(15, 30) },
    ];
    const item = items[Math.floor(Math.random() * items.length)];
    transactions.push({
      id: uuidv4(),
      date: formatDate(date),
      description: item.desc,
      merchant: item.name,
      amount: -item.amount,
      currency: 'USD',
      type: 'expense',
      category: 'Entertainment',
      source: 'synthetic',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  // Tuition (one-time, beginning of semester)
  transactions.push({
    id: uuidv4(),
    date: formatDate(new Date(now.getFullYear(), now.getMonth() - 4, 15)),
    description: 'Tuition payment - Spring semester',
    merchant: 'University Registrar',
    amount: -3200,
    currency: 'USD',
    type: 'expense',
    category: 'Education - Tuition',
    source: 'synthetic',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // Books
  transactions.push({
    id: uuidv4(),
    date: formatDate(new Date(now.getFullYear(), now.getMonth() - 4, 20)),
    description: 'Required textbooks',
    merchant: 'Campus Bookstore',
    amount: -280,
    currency: 'USD',
    type: 'expense',
    category: 'Education - Books & Supplies',
    source: 'synthetic',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // Personal care
  for (let i = 0; i < 6; i++) {
    const date = randomDate(sixMonthsAgo, now);
    transactions.push({
      id: uuidv4(),
      date: formatDate(date),
      description: 'Haircut',
      merchant: 'Hair Studio',
      amount: -randomBetween(20, 40),
      currency: 'USD',
      type: 'expense',
      category: 'Personal Care',
      source: 'synthetic',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  // Gym
  for (let month = 0; month < 6; month++) {
    const date = new Date(now.getFullYear(), now.getMonth() - month, 2);
    if (date >= sixMonthsAgo) {
      transactions.push({
        id: uuidv4(),
        date: formatDate(date),
        description: 'Monthly gym membership',
        merchant: 'Campus Gym',
        amount: -35,
        currency: 'USD',
        type: 'expense',
        category: 'Personal Care',
        source: 'synthetic',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }

  // DUPLICATES - Add some duplicates for testing
  const duplicateSource = transactions.find(t => t.merchant === 'FreshMart Grocery' && t.status === 'active');
  if (duplicateSource) {
    transactions.push({
      id: uuidv4(),
      date: duplicateSource.date,
      description: duplicateSource.description,
      merchant: duplicateSource.merchant,
      amount: duplicateSource.amount,
      currency: duplicateSource.currency,
      type: duplicateSource.type,
      category: duplicateSource.category,
      source: 'synthetic',
      status: 'duplicate',
      duplicateOf: duplicateSource.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  // Add another duplicate
  const rentSource = transactions.find(t => t.merchant === 'Campus Housing' && t.status === 'active');
  if (rentSource) {
    transactions.push({
      id: uuidv4(),
      date: rentSource.date,
      description: rentSource.description,
      merchant: rentSource.merchant,
      amount: rentSource.amount,
      currency: rentSource.currency,
      type: rentSource.type,
      category: rentSource.category,
      source: 'upload',
      status: 'duplicate',
      duplicateOf: rentSource.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  // Sort by date descending
  transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return transactions;
}

export function getDefaultCategoryRules(): CategoryRule[] {
  return [
    { id: uuidv4(), name: 'Rent Detection', priority: 1, matchType: 'description_keyword', matchValue: 'rent', category: 'Housing - Rent', enabled: true, description: 'Matches transactions containing "rent"' },
    { id: uuidv4(), name: 'Grocery Detection', priority: 2, matchType: 'merchant', matchValue: 'FreshMart', category: 'Food - Groceries', enabled: true, description: 'Matches FreshMart grocery store' },
    { id: uuidv4(), name: 'Dining Out Keywords', priority: 3, matchType: 'description_keyword', matchValue: 'pizza|burger|sushi|coffee|lunch|dinner', category: 'Food - Dining Out', enabled: true, description: 'Regex match for dining keywords' },
    { id: uuidv4(), name: 'Utility Bills', priority: 4, matchType: 'description_keyword', matchValue: 'electric|water|internet|utility', category: 'Housing - Utilities', enabled: true, description: 'Matches utility bill keywords' },
    { id: uuidv4(), name: 'Transportation', priority: 5, matchType: 'merchant', matchValue: 'Transit|Gas Station|RideShare|Parking', category: 'Transportation', enabled: true, description: 'Matches transportation merchants' },
    { id: uuidv4(), name: 'Streaming Subscriptions', priority: 6, matchType: 'merchant', matchValue: 'StreamFlix|MusicStream|Cloud', category: 'Subscriptions', enabled: true, description: 'Matches streaming services' },
    { id: uuidv4(), name: 'Entertainment', priority: 7, matchType: 'description_keyword', matchValue: 'movie|game|concert|bowling', category: 'Entertainment', enabled: true, description: 'Matches entertainment keywords' },
    { id: uuidv4(), name: 'Income - Employment', priority: 8, matchType: 'description_keyword', matchValue: 'part-time|salary|wage|paycheck', category: 'Income - Employment', enabled: true, description: 'Matches employment income' },
    { id: uuidv4(), name: 'Income - Freelance', priority: 9, matchType: 'description_keyword', matchValue: 'freelance|contract|gig', category: 'Income - Freelance', enabled: true, description: 'Matches freelance income' },
    { id: uuidv4(), name: 'Income - Scholarship', priority: 10, matchType: 'description_keyword', matchValue: 'scholarship|financial aid|grant', category: 'Income - Scholarship', enabled: true, description: 'Matches scholarship income' },
    { id: uuidv4(), name: 'Education - Tuition', priority: 11, matchType: 'description_keyword', matchValue: 'tuition|semester fee', category: 'Education - Tuition', enabled: true, description: 'Matches tuition payments' },
    { id: uuidv4(), name: 'Education - Books', priority: 12, matchType: 'description_keyword', matchValue: 'textbook|book|supplies', category: 'Education - Books & Supplies', enabled: true, description: 'Matches book purchases' },
    { id: uuidv4(), name: 'Family Support', priority: 13, matchType: 'description_keyword', matchValue: 'family|parent|support transfer', category: 'Income - Family Support', enabled: true, description: 'Matches family support income' },
    { id: uuidv4(), name: 'Personal Care', priority: 14, matchType: 'merchant', matchValue: 'Gym|Pharmacy|Hair|Clothing', category: 'Personal Care', enabled: true, description: 'Matches personal care merchants' },
  ];
}

export function getDefaultGoals(): SavingsGoal[] {
  return [
    {
      id: uuidv4(),
      name: 'Emergency Fund',
      targetAmount: 2000,
      targetDate: new Date(new Date().getFullYear() + 1, 0, 1).toISOString().split('T')[0],
      currentSaved: 450,
      contributionFrequency: 'monthly',
      priority: 'high',
      notes: 'Building a safety net for unexpected expenses',
      createdAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      name: 'Spring Break Trip',
      targetAmount: 800,
      targetDate: new Date(new Date().getFullYear(), 2, 15).toISOString().split('T')[0],
      currentSaved: 200,
      contributionFrequency: 'weekly',
      priority: 'medium',
      notes: 'Saving for a spring break vacation with friends',
      createdAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      name: 'New Laptop',
      targetAmount: 1500,
      targetDate: new Date(new Date().getFullYear(), 8, 1).toISOString().split('T')[0],
      currentSaved: 350,
      contributionFrequency: 'monthly',
      priority: 'medium',
      notes: 'Need a new laptop for next school year',
      createdAt: new Date().toISOString(),
    },
  ];
}

export function getDefaultAssumptions(): ForecastAssumptions {
  return {
    avgMonthlyIncome: 1800,
    incomeVolatility: 15,
    expenseInflation: 2,
    recurringBills: [
      { name: 'Rent', amount: 750, frequency: 'monthly' },
      { name: 'Utilities', amount: 80, frequency: 'monthly' },
      { name: 'Bus Pass', amount: 65, frequency: 'monthly' },
      { name: 'Gym', amount: 35, frequency: 'monthly' },
      { name: 'Streaming', amount: 26, frequency: 'monthly' },
    ],
    categoryBudgets: [
      { category: 'Food - Groceries', limit: 300 },
      { category: 'Food - Dining Out', limit: 150 },
      { category: 'Entertainment', limit: 80 },
      { category: 'Transportation', limit: 100 },
      { category: 'Personal Care', limit: 60 },
    ],
    oneTimeIncome: [],
    oneTimeExpenses: [],
    savingsContribution: 200,
    bufferPercentage: 10,
    forecastHorizon: 'monthly',
    forecastMonths: 6,
  };
}

export function getDefaultScenarios(): ForecastScenario[] {
  const baseAssumptions = getDefaultAssumptions();

  return [
    {
      id: uuidv4(),
      name: 'Baseline',
      description: 'Uses historical averages and current spending patterns. No changes assumed.',
      assumptions: { ...baseAssumptions },
      color: '#3B82F6',
      isActive: true,
    },
    {
      id: uuidv4(),
      name: 'Savings Boost',
      description: 'Increases savings by $100/month and reduces dining out by 25%. Empowers faster goal achievement.',
      assumptions: {
        ...baseAssumptions,
        savingsContribution: 300,
        categoryBudgets: baseAssumptions.categoryBudgets.map(b =>
          b.category === 'Food - Dining Out' ? { ...b, limit: Math.round(b.limit * 0.75) } : b
        ),
      },
      color: '#10B981',
      isActive: true,
    },
    {
      id: uuidv4(),
      name: 'Conservative',
      description: 'Assumes 10% lower income and 5% higher essential expenses. Prepares for worst-case planning.',
      assumptions: {
        ...baseAssumptions,
        avgMonthlyIncome: Math.round(baseAssumptions.avgMonthlyIncome * 0.9),
        expenseInflation: 5,
        recurringBills: baseAssumptions.recurringBills.map(b => ({ ...b, amount: Math.round(b.amount * 1.05) })),
      },
      color: '#F59E0B',
      isActive: true,
    },
  ];
}

export function generateSampleCSV(): string {
  return `date,description,merchant,amount,currency,type,category,notes
2024-01-15,Part-time job paycheck,Campus Bookstore,875.00,USD,income,Income - Employment,January pay
2024-01-01,Monthly rent,Campus Housing,-750.00,USD,expense,Housing - Rent,January rent
2024-01-05,Electric bill,City Electric Co,-78.50,USD,expense,Housing - Utilities,
2024-01-07,Grocery run,FreshMart Grocery,-62.30,USD,expense,Food - Groceries,Weekly groceries
2024-01-08,Coffee and bagel,Coffee Corner,-7.50,USD,expense,Food - Dining Out,
2024-01-10,Bus pass renewal,City Transit,-65.00,USD,expense,Transportation,Monthly pass
2024-01-12,Freelance payment,FreelancePay,250.00,USD,income,Income - Freelance,Logo design
2024-01-14,Pizza with friends,Pizza Palace,-24.00,USD,expense,Food - Dining Out,
2024-01-18,Streaming subscription,StreamFlix,-15.99,USD,expense,Subscriptions,
2024-01-20,Grocery shopping,FreshMart Grocery,-55.80,USD,expense,Food - Groceries,
2024-01-22,Movie night,Movie Theater,-18.00,USD,expense,Entertainment,
2024-01-25,Family support,Family Transfer,300.00,USD,income,Income - Family Support,Monthly
2024-01-28,Haircut,Hair Studio,-30.00,USD,expense,Personal Care,`;
}
