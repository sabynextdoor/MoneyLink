import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import {
  Transaction, TransactionCorrection, CategoryRule, SavingsGoal,
  ForecastScenario, DuplicateGroup, MissingTransactionSuggestion,
  AuditEvent, ForecastAssumptions, AppState
} from '../types';
import {
  generateSyntheticTransactions, getDefaultCategoryRules,
  getDefaultGoals, getDefaultScenarios, getDefaultAssumptions
} from '../engine/syntheticData';
import { v4 as uuidv4 } from 'uuid';
import type { ThemeId } from '../theme/theme';

type Action =
  | { type: 'SET_TRANSACTIONS'; payload: Transaction[] }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: { id: string; updates: Partial<Transaction> } }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'ADD_CORRECTION'; payload: TransactionCorrection }
  | { type: 'SET_RULES'; payload: CategoryRule[] }
  | { type: 'ADD_RULE'; payload: CategoryRule }
  | { type: 'UPDATE_RULE'; payload: { id: string; updates: Partial<CategoryRule> } }
  | { type: 'DELETE_RULE'; payload: string }
  | { type: 'ADD_GOAL'; payload: SavingsGoal }
  | { type: 'UPDATE_GOAL'; payload: { id: string; updates: Partial<SavingsGoal> } }
  | { type: 'DELETE_GOAL'; payload: string }
  | { type: 'SET_SCENARIOS'; payload: ForecastScenario[] }
  | { type: 'UPDATE_SCENARIO'; payload: { id: string; updates: Partial<ForecastScenario> } }
  | { type: 'SET_DUPLICATES'; payload: DuplicateGroup[] }
  | { type: 'UPDATE_DUPLICATE'; payload: { id: string; status: 'confirmed' | 'rejected' } }
  | { type: 'SET_MISSING'; payload: MissingTransactionSuggestion[] }
  | { type: 'UPDATE_MISSING'; payload: { id: string; status: 'confirmed' | 'dismissed' } }
  | { type: 'SET_ASSUMPTIONS'; payload: ForecastAssumptions }
  | { type: 'ADD_AUDIT'; payload: AuditEvent }
  | { type: 'LOAD_STATE'; payload: AppState }
  | { type: 'RESET_DATA' }
  | { type: 'SET_THEME'; payload: ThemeId };

const initialState: AppState = {
  transactions: [],
  corrections: [],
  categoryRules: getDefaultCategoryRules(),
  goals: getDefaultGoals(),
  scenarios: getDefaultScenarios(),
  duplicates: [],
  missingSuggestions: [],
  auditLog: [],
  assumptions: getDefaultAssumptions(),
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.payload };
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [action.payload, ...state.transactions] };
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map(t =>
          t.id === action.payload.id ? { ...t, ...action.payload.updates, updatedAt: new Date().toISOString() } : t
        ),
      };
    case 'DELETE_TRANSACTION':
      return { ...state, transactions: state.transactions.filter(t => t.id !== action.payload) };
    case 'ADD_CORRECTION':
      return { ...state, corrections: [...state.corrections, action.payload] };
    case 'SET_RULES':
      return { ...state, categoryRules: action.payload };
    case 'ADD_RULE':
      return { ...state, categoryRules: [...state.categoryRules, action.payload] };
    case 'UPDATE_RULE':
      return {
        ...state,
        categoryRules: state.categoryRules.map(r =>
          r.id === action.payload.id ? { ...r, ...action.payload.updates } : r
        ),
      };
    case 'DELETE_RULE':
      return { ...state, categoryRules: state.categoryRules.filter(r => r.id !== action.payload) };
    case 'ADD_GOAL':
      return { ...state, goals: [...state.goals, action.payload] };
    case 'UPDATE_GOAL':
      return {
        ...state,
        goals: state.goals.map(g =>
          g.id === action.payload.id ? { ...g, ...action.payload.updates } : g
        ),
      };
    case 'DELETE_GOAL':
      return { ...state, goals: state.goals.filter(g => g.id !== action.payload) };
    case 'SET_SCENARIOS':
      return { ...state, scenarios: action.payload };
    case 'UPDATE_SCENARIO':
      return {
        ...state,
        scenarios: state.scenarios.map(s =>
          s.id === action.payload.id ? { ...s, ...action.payload.updates } : s
        ),
      };
    case 'SET_DUPLICATES':
      return { ...state, duplicates: action.payload };
    case 'UPDATE_DUPLICATE':
      return {
        ...state,
        duplicates: state.duplicates.map(d =>
          d.id === action.payload.id ? { ...d, status: action.payload.status } : d
        ),
      };
    case 'SET_MISSING':
      return { ...state, missingSuggestions: action.payload };
    case 'UPDATE_MISSING':
      return {
        ...state,
        missingSuggestions: state.missingSuggestions.map(m =>
          m.id === action.payload.id ? { ...m, status: action.payload.status } : m
        ),
      };
    case 'SET_ASSUMPTIONS':
      return { ...state, assumptions: action.payload };
    case 'ADD_AUDIT':
      return { ...state, auditLog: [action.payload, ...state.auditLog].slice(0, 500) };
    case 'LOAD_STATE':
      return action.payload;
    case 'RESET_DATA':
      return {
        ...initialState,
        transactions: generateSyntheticTransactions(),
        categoryRules: getDefaultCategoryRules(),
        goals: getDefaultGoals(),
        scenarios: getDefaultScenarios(),
        assumptions: getDefaultAssumptions(),
      };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  addAuditEvent: (action: string, entityType: string, entityId: string, details: string, oldValue?: any, newValue?: any) => void;
  currentTheme: ThemeId;
  setTheme: (themeId: ThemeId) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useReducer(
    (state: ThemeId, action: { type: 'SET'; payload: ThemeId }) => action.payload,
    'midnight',
    () => {
      try {
        const saved = localStorage.getItem('cashlink-theme');
        if (saved && ['midnight', 'cyberpunk', 'light', 'forest', 'ocean', 'sunset', 'monochrome'].includes(saved)) {
          return saved as ThemeId;
        }
      } catch (e) {
        console.warn('Failed to load theme:', e);
      }
      return 'midnight';
    }
  );

  const [state, dispatch] = useReducer(reducer, initialState, () => {
    // Try to load from localStorage
    try {
      const saved = localStorage.getItem('cashlink-state') || localStorage.getItem('fluxa-state') || localStorage.getItem('cashflow-coach-state');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...initialState, ...parsed };
      }
    } catch (e) {
      console.warn('Failed to load saved state:', e);
    }
    // Initialize with synthetic data
    return {
      ...initialState,
      transactions: generateSyntheticTransactions(),
    };
  });

  // Save to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem('cashlink-state', JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to save state:', e);
    }
  }, [state]);

  // Save theme to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('cashlink-theme', currentTheme);
      document.documentElement.setAttribute('data-theme', currentTheme);
    } catch (e) {
      console.warn('Failed to save theme:', e);
    }
  }, [currentTheme]);

  const setTheme = (themeId: ThemeId) => {
    setCurrentTheme({ type: 'SET', payload: themeId });
  };

  const addAuditEvent = (action: string, entityType: string, entityId: string, details: string, oldValue?: any, newValue?: any) => {
    dispatch({
      type: 'ADD_AUDIT',
      payload: {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        action,
        entityType,
        entityId,
        details,
        oldValue,
        newValue,
      },
    });
  };

  return (
    <AppContext.Provider value={{ state, dispatch, addAuditEvent, currentTheme, setTheme }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppState must be used within AppProvider');
  return context;
}
