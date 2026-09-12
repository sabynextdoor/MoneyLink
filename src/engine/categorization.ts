import { Transaction, CategoryRule } from '../types';

export interface CategorizationResult {
  category: string;
  confidence: 'high' | 'medium' | 'low';
  matchedRule?: string;
  method: 'user_override' | 'imported' | 'rule_match' | 'default';
  explanation: string;
}

export function categorizeTransaction(
  transaction: Transaction,
  rules: CategoryRule[],
  userOverrides: Map<string, string>
): CategorizationResult {
  // 1. Check for user override (highest priority)
  if (userOverrides.has(transaction.id)) {
    return {
      category: userOverrides.get(transaction.id)!,
      confidence: 'high',
      method: 'user_override',
      explanation: 'Manually assigned by user. User corrections always take priority.',
    };
  }

  // 2. If transaction already has a category from import
  if (transaction.category && transaction.source === 'upload') {
    return {
      category: transaction.category,
      confidence: 'high',
      method: 'imported',
      explanation: 'Category was provided in the uploaded file.',
    };
  }

  // 3. Apply rules in priority order
  const enabledRules = rules
    .filter(r => r.enabled)
    .sort((a, b) => a.priority - b.priority);

  for (const rule of enabledRules) {
    if (matchesRule(transaction, rule)) {
      return {
        category: rule.category,
        confidence: rule.matchType === 'merchant' ? 'high' : 'medium',
        matchedRule: rule.name,
        method: 'rule_match',
        explanation: `Matched rule: "${rule.name}" (${rule.description}). ${getMatchDetail(transaction, rule)}`,
      };
    }
  }

  // 4. Default fallback
  return {
    category: transaction.amount > 0 ? 'Income - Other' : 'Other',
    confidence: 'low',
    method: 'default',
    explanation: 'No matching rule found. Default category assigned based on transaction type. Consider adding a custom rule.',
  };
}

function matchesRule(transaction: Transaction, rule: CategoryRule): boolean {
  const desc = (transaction.description || '').toLowerCase();
  const merchant = (transaction.merchant || '').toLowerCase();
  const combined = `${desc} ${merchant}`;

  switch (rule.matchType) {
    case 'merchant': {
      const patterns = rule.matchValue.split('|').map(p => p.trim().toLowerCase());
      return patterns.some(p => merchant.includes(p));
    }
    case 'description_keyword': {
      try {
        const regex = new RegExp(rule.matchValue, 'i');
        return regex.test(combined);
      } catch {
        const keywords = rule.matchValue.split('|').map(k => k.trim().toLowerCase());
        return keywords.some(k => combined.includes(k));
      }
    }
    case 'amount_range': {
      try {
        const [min, max] = rule.matchValue.split('-').map(Number);
        const absAmount = Math.abs(transaction.amount);
        return absAmount >= min && absAmount <= max;
      } catch {
        return false;
      }
    }
    case 'type': {
      return transaction.type === rule.matchValue.toLowerCase();
    }
    case 'regex': {
      try {
        const regex = new RegExp(rule.matchValue, 'i');
        return regex.test(combined);
      } catch {
        return false;
      }
    }
    case 'date_pattern': {
      // Match date patterns like "1st of month" for rent
      const date = new Date(transaction.date);
      const day = date.getDate();
      if (rule.matchValue === 'first_of_month') return day <= 3;
      if (rule.matchValue === 'mid_month') return day >= 13 && day <= 17;
      if (rule.matchValue === 'end_of_month') return day >= 25;
      return false;
    }
    default:
      return false;
  }
}

function getMatchDetail(transaction: Transaction, rule: CategoryRule): string {
  switch (rule.matchType) {
    case 'merchant':
      return `Merchant "${transaction.merchant}" matched pattern "${rule.matchValue}".`;
    case 'description_keyword':
      return `Description "${transaction.description}" matched keyword pattern.`;
    case 'amount_range':
      return `Amount $${Math.abs(transaction.amount).toFixed(2)} is within range ${rule.matchValue}.`;
    case 'type':
      return `Transaction type "${transaction.type}" matched.`;
    default:
      return `Matched via ${rule.matchType} pattern.`;
  }
}

export function detectDuplicates(transactions: Transaction[]): { id: string; transactions: string[]; reason: string; confidence: number; status: 'pending' | 'confirmed' | 'rejected' }[] {
  const groups: { id: string; transactions: string[]; reason: string; confidence: number; status: 'pending' | 'confirmed' | 'rejected' }[] = [];
  const activeTransactions = transactions.filter(t => t.status !== 'duplicate');

  for (let i = 0; i < activeTransactions.length; i++) {
    for (let j = i + 1; j < activeTransactions.length; j++) {
      const a = activeTransactions[i];
      const b = activeTransactions[j];

      // Same amount
      if (Math.abs(a.amount - b.amount) > 0.01) continue;

      // Same date or within 1 day
      const dateDiff = Math.abs(new Date(a.date).getTime() - new Date(b.date).getTime());
      if (dateDiff > 2 * 24 * 60 * 60 * 1000) continue;

      // Similar description or merchant
      const descSimilar = a.description.toLowerCase() === b.description.toLowerCase() ||
        (a.merchant && b.merchant && a.merchant.toLowerCase() === b.merchant.toLowerCase());

      if (descSimilar) {
        const confidence = dateDiff === 0 ? 0.95 : 0.8;
        const reason = dateDiff === 0
          ? `Identical amount ($${Math.abs(a.amount).toFixed(2)}), same date, same description/merchant`
          : `Identical amount ($${Math.abs(a.amount).toFixed(2)}), within 1 day, similar description`;

        groups.push({
          id: `dup-${a.id}-${b.id}`,
          transactions: [a.id, b.id],
          reason,
          confidence,
          status: 'pending',
        });
      }
    }
  }

  return groups;
}

export function detectMissingTransactions(transactions: Transaction[]): { id: string; description: string; expectedDate: string; expectedAmount: number; category: string; reason: string; status: 'pending' | 'confirmed' | 'dismissed' }[] {
  const suggestions: { id: string; description: string; expectedDate: string; expectedAmount: number; category: string; reason: string; status: 'pending' | 'confirmed' | 'dismissed' }[] = [];
  const now = new Date();

  // Check for recurring monthly expenses
  const monthlyExpenses = [
    { merchant: 'Campus Housing', description: 'Monthly rent payment', category: 'Housing - Rent', amount: 750 },
    { merchant: 'City Electric Co', description: 'Electric bill', category: 'Housing - Utilities', amount: 80 },
    { merchant: 'City Transit', description: 'Monthly bus pass', category: 'Transportation', amount: 65 },
  ];

  for (const recurring of monthlyExpenses) {
    // Check last 3 months
    for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
      const checkMonth = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
      const monthStr = `${checkMonth.getFullYear()}-${String(checkMonth.getMonth() + 1).padStart(2, '0')}`;

      const found = transactions.find(t =>
        t.merchant === recurring.merchant &&
        t.date.startsWith(monthStr) &&
        t.status === 'active'
      );

      if (!found && monthOffset > 0) {
        suggestions.push({
          id: `missing-${recurring.merchant}-${monthStr}`,
          description: recurring.description,
          expectedDate: `${monthStr}-01`,
          expectedAmount: -recurring.amount,
          category: recurring.category,
          reason: `Expected recurring "${recurring.description}" for ${monthStr} but no matching transaction found. This merchant typically charges around $${recurring.amount}/month.`,
          status: 'pending',
        });
      }
    }
  }

  return suggestions;
}
