// Core Types for Student Budget & Cashflow Coach

export interface Transaction {
  id: string;
  date: string; // ISO date string
  description: string;
  merchant?: string;
  amount: number; // positive = income, negative = expense
  currency: string;
  type: 'income' | 'expense' | 'transfer';
  category: string;
  notes?: string;
  source: 'synthetic' | 'upload' | 'manual';
  status: 'active' | 'duplicate' | 'corrected' | 'disputed' | 'confirmed_missing';
  duplicateOf?: string;
  originalId?: string;
  correctionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionCorrection {
  id: string;
  transactionId: string;
  field: string;
  oldValue: any;
  newValue: any;
  reason: string;
  timestamp: string;
}

export interface CategoryRule {
  id: string;
  name: string;
  priority: number;
  matchType: 'merchant' | 'description_keyword' | 'amount_range' | 'type' | 'regex' | 'date_pattern';
  matchValue: string;
  category: string;
  enabled: boolean;
  description: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  targetDate: string;
  currentSaved: number;
  contributionFrequency: 'weekly' | 'biweekly' | 'monthly';
  priority: 'high' | 'medium' | 'low';
  notes?: string;
  createdAt: string;
}

export interface ForecastAssumptions {
  avgMonthlyIncome: number;
  incomeVolatility: number; // percentage
  expenseInflation: number; // percentage
  recurringBills: { name: string; amount: number; frequency: string }[];
  categoryBudgets: { category: string; limit: number }[];
  oneTimeIncome: { description: string; amount: number; date: string }[];
  oneTimeExpenses: { description: string; amount: number; date: string }[];
  savingsContribution: number;
  bufferPercentage: number;
  forecastHorizon: 'weekly' | 'monthly';
  forecastMonths: number;
}

export interface ForecastScenario {
  id: string;
  name: string;
  description: string;
  assumptions: ForecastAssumptions;
  color: string;
  isActive: boolean;
}

export interface ForecastResult {
  scenarioId: string;
  scenarioName: string;
  periods: ForecastPeriod[];
  endingBalance: number;
  goalReachedDate?: string;
  keyDrivers: string[];
  confidence: string;
}

export interface ForecastPeriod {
  label: string;
  date: string;
  projectedIncome: number;
  projectedExpenses: number;
  netCashFlow: number;
  cumulativeBalance: number;
  savingsProgress: number;
}

export interface DuplicateGroup {
  id: string;
  transactions: string[]; // transaction IDs
  reason: string;
  confidence: number;
  status: 'pending' | 'confirmed' | 'rejected';
}

export interface MissingTransactionSuggestion {
  id: string;
  description: string;
  expectedDate: string;
  expectedAmount: number;
  category: string;
  reason: string;
  status: 'pending' | 'confirmed' | 'dismissed';
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  oldValue?: any;
  newValue?: any;
}

export interface AppState {
  transactions: Transaction[];
  corrections: TransactionCorrection[];
  categoryRules: CategoryRule[];
  goals: SavingsGoal[];
  scenarios: ForecastScenario[];
  duplicates: DuplicateGroup[];
  missingSuggestions: MissingTransactionSuggestion[];
  auditLog: AuditEvent[];
  assumptions: ForecastAssumptions;
}

export const CATEGORIES = [
  'Income - Employment',
  'Income - Freelance',
  'Income - Scholarship',
  'Income - Family Support',
  'Income - Other',
  'Housing - Rent',
  'Housing - Utilities',
  'Food - Groceries',
  'Food - Dining Out',
  'Transportation',
  'Education - Tuition',
  'Education - Books & Supplies',
  'Subscriptions',
  'Entertainment',
  'Personal Care',
  'Health',
  'Shopping',
  'Savings',
  'Transfer',
  'Other',
] as const;

export type Category = typeof CATEGORIES[number];
