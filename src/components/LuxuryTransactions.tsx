import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppState } from '../store/AppContext';
import { categorizeTransaction, detectDuplicates, detectMissingTransactions } from '../engine/categorization';
import { CATEGORIES, Transaction } from '../types';
import { v4 as uuidv4 } from 'uuid';
import Papa from 'papaparse';
import confetti from 'canvas-confetti';
import {
  Search, Upload, Plus, AlertTriangle, Edit3, Trash2,
  ChevronDown, ChevronUp, Info, X, Zap, ArrowUpRight, ArrowDownRight,
  Filter, CheckCircle, FileSpreadsheet, Sparkles
} from 'lucide-react';
import { SpotlightCard, AnimatedCounter, LuxurySelect } from './ui/LuxuryComponents';

export default function LuxuryTransactions() {
  const { state, dispatch, addAuditEvent } = useAppState();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortField, setSortField] = useState<'date' | 'amount' | 'category'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const duplicates = useMemo(() => detectDuplicates(state.transactions), [state.transactions]);
  const missingSuggestions = useMemo(() => detectMissingTransactions(state.transactions), [state.transactions]);

  React.useEffect(() => {
    if (duplicates.length !== state.duplicates.length) dispatch({ type: 'SET_DUPLICATES', payload: duplicates });
  }, [duplicates]);

  React.useEffect(() => {
    if (missingSuggestions.length !== state.missingSuggestions.length) dispatch({ type: 'SET_MISSING', payload: missingSuggestions });
  }, [missingSuggestions]);

  const stats = useMemo(() => {
    const active = state.transactions.filter(t => t.status === 'active');
    const income = active.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const expenses = Math.abs(active.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0));
    return { income, expenses, net: income - expenses, count: active.length };
  }, [state.transactions]);

  const filteredTransactions = useMemo(() => {
    let txns = [...state.transactions];
    if (search) {
      const s = search.toLowerCase();
      txns = txns.filter(t => t.description.toLowerCase().includes(s) || (t.merchant && t.merchant.toLowerCase().includes(s)) || t.category.toLowerCase().includes(s));
    }
    if (categoryFilter) txns = txns.filter(t => t.category === categoryFilter);
    if (typeFilter === 'income') txns = txns.filter(t => t.amount > 0);
    if (typeFilter === 'expense') txns = txns.filter(t => t.amount < 0);
    if (statusFilter) txns = txns.filter(t => t.status === statusFilter);
    txns.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'date') cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
      else if (sortField === 'amount') cmp = a.amount - b.amount;
      else cmp = a.category.localeCompare(b.category);
      return sortDir === 'desc' ? -cmp : cmp;
    });
    return txns;
  }, [state.transactions, search, categoryFilter, typeFilter, statusFilter, sortField, sortDir]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.name.endsWith('.csv')) {
      Papa.parse(file, {
        header: true, skipEmptyLines: true,
        complete: (results) => {
          const newTxns: Transaction[] = [];
          results.data.forEach((row: any) => {
            if (!row.date || !row.description || row.amount === undefined) return;
            const amount = parseFloat(row.amount);
            if (isNaN(amount)) return;
            const txn: Transaction = {
              id: row.transaction_id || uuidv4(), date: row.date, description: row.description,
              merchant: row.merchant, amount, currency: row.currency || 'INR',
              type: row.type || (amount > 0 ? 'income' : 'expense'),
              category: row.category || '', notes: row.notes, source: 'upload', status: 'active',
              createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
            };
            if (!txn.category) {
              const result = categorizeTransaction(txn, state.categoryRules, new Map());
              txn.category = result.category;
            }
            newTxns.push(txn);
          });
          if (newTxns.length > 0) {
            dispatch({ type: 'SET_TRANSACTIONS', payload: [...newTxns, ...state.transactions] });
            addAuditEvent('UPLOAD', 'BATCH', uuidv4(), `Imported ${newTxns.length} transactions`);
            try {
              confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
            } catch (err) {}
          }
          setShowUpload(false);
        },
      });
    }
  };

  const handleCategoryChange = (txnId: string, newCategory: string) => {
    const txn = state.transactions.find(t => t.id === txnId);
    if (!txn) return;
    dispatch({ type: 'UPDATE_TRANSACTION', payload: { id: txnId, updates: { category: newCategory } } });
    dispatch({ type: 'ADD_CORRECTION', payload: { id: uuidv4(), transactionId: txnId, field: 'category', oldValue: txn.category, newValue: newCategory, reason: 'Manual correction', timestamp: new Date().toISOString() } });
    addAuditEvent('CORRECT', 'TRANSACTION', txnId, `Category: ${txn.category} → ${newCategory}`);
    setEditingId(null);
  };

  const pendingDuplicates = duplicates.filter(d => d.status === 'pending');
  const pendingMissing = missingSuggestions.filter(m => m.status === 'pending');

  return (
    <div className="relative min-h-screen pt-24 pb-16">
      <div className="fixed inset-0 grid-pattern opacity-20 pointer-events-none" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#00d4ff] animate-pulse" />
              <p className="text-xs uppercase tracking-widest text-[#00d4ff] font-mono font-semibold">Ledger Telemetry</p>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white font-display tracking-tight">
              Transaction <span className="text-gradient-cyan">Matrix</span>
            </h1>
            <p className="text-white/40 mt-1 text-xs sm:text-sm">
              Deterministic double-entry audit • Transparent categorization • Real-time filtering
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setShowUpload(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold text-white transition-all glass hover:bg-white/10 border border-white/15">
              <Upload className="w-3.5 h-3.5 text-[#00d4ff]" /> Import CSV
            </button>
            <button onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-black transition-all shadow-lg hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #00d4ff 0%, #00d084 100%)' }}>
              <Plus className="w-4 h-4" /> New Entry
            </button>
          </div>
        </div>

        {/* Quick Ledger Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card rounded-2xl p-4 border border-white/10">
            <span className="text-[10px] text-white/40 uppercase font-mono block mb-1">Total Inflow</span>
            <div className="text-xl font-mono font-bold text-[#00d084]">
              ₹<AnimatedCounter value={stats.income} />
            </div>
          </div>
          <div className="glass-card rounded-2xl p-4 border border-white/10">
            <span className="text-[10px] text-white/40 uppercase font-mono block mb-1">Total Outflow</span>
            <div className="text-xl font-mono font-bold text-[#ff6b6b]">
              ₹<AnimatedCounter value={stats.expenses} />
            </div>
          </div>
          <div className="glass-card rounded-2xl p-4 border border-white/10">
            <span className="text-[10px] text-white/40 uppercase font-mono block mb-1">Net Momentum</span>
            <div className="text-xl font-mono font-bold text-white">
              ₹<AnimatedCounter value={stats.net} />
            </div>
          </div>
          <div className="glass-card rounded-2xl p-4 border border-white/10">
            <span className="text-[10px] text-white/40 uppercase font-mono block mb-1">Active Ledger Records</span>
            <div className="text-xl font-mono font-bold text-[#00d4ff]">
              {stats.count}
            </div>
          </div>
        </div>

        {/* Alerts */}
        {(pendingDuplicates.length > 0 || pendingMissing.length > 0) && (
          <div className="glass rounded-2xl p-4 border border-amber-500/30"
            style={{ background: 'linear-gradient(135deg, rgba(255, 138, 0, 0.08) 0%, rgba(255, 42, 109, 0.04) 100%)' }}>
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-semibold text-amber-200">Data Integrity Insights</p>
                <p className="text-xs text-white/50 mt-0.5">
                  {pendingDuplicates.length > 0 && `${pendingDuplicates.length} duplicate flag(s) `}
                  {pendingMissing.length > 0 && `${pendingMissing.length} potential missing transaction(s) `}
                  — Totals remain strictly verified until confirmed.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text" placeholder="Search merchant, description, or category..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 glass rounded-2xl text-xs sm:text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors border border-white/10"
            />
          </div>

          {/* Type Filter Pills */}
          <div className="flex items-center gap-1 glass rounded-2xl p-1 border border-white/10">
            {(['all', 'income', 'expense'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium capitalize transition-all ${
                  typeFilter === t ? 'bg-white/15 text-white shadow-sm' : 'text-white/40 hover:text-white/70'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="w-48 sm:w-56">
            <LuxurySelect
              value={categoryFilter}
              onChange={setCategoryFilter}
              options={[{ value: '', label: 'All Categories' }, ...CATEGORIES]}
              placeholder="All Categories"
            />
          </div>
        </div>

        {/* Transaction Table */}
        <div className="glass-card rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-white/40 uppercase font-mono tracking-wider cursor-pointer hover:text-white"
                    onClick={() => { setSortField('date'); setSortDir(d => d === 'asc' ? 'desc' : 'asc'); }}>
                    Date {sortField === 'date' && (sortDir === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-white/40 uppercase font-mono tracking-wider">Description</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-white/40 uppercase font-mono tracking-wider">Category</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-white/40 uppercase font-mono tracking-wider cursor-pointer hover:text-white"
                    onClick={() => { setSortField('amount'); setSortDir(d => d === 'asc' ? 'desc' : 'asc'); }}>
                    Amount {sortField === 'amount' && (sortDir === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="text-center px-6 py-4 text-xs font-semibold text-white/40 uppercase font-mono tracking-wider">Status</th>
                  <th className="text-center px-6 py-4 text-xs font-semibold text-white/40 uppercase font-mono tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.slice(0, 50).map((txn, idx) => (
                  <motion.tr
                    key={txn.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: Math.min(idx * 0.02, 0.3) }}
                    className={`transition-colors hover:bg-white/[0.03] ${txn.status === 'duplicate' ? 'opacity-40' : ''}`}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                  >
                    <td className="px-6 py-4 text-white/50 whitespace-nowrap text-xs font-mono">
                      {txn.date}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white/90 text-sm">{txn.description}</div>
                      {txn.merchant && <div className="text-xs text-white/35 mt-0.5">{txn.merchant}</div>}
                    </td>
                    <td className="px-6 py-4 min-w-[140px]">
                      {editingId === txn.id ? (
                        <div className="w-36">
                          <LuxurySelect
                            compact
                            value={txn.category}
                            onChange={val => {
                              handleCategoryChange(txn.id, val);
                              setEditingId(null);
                            }}
                            options={CATEGORIES}
                          />
                        </div>
                      ) : (
                        <button onClick={() => setEditingId(txn.id)}
                          className="text-xs px-3 py-1 rounded-full text-white/70 hover:text-white glass hover:bg-white/10 transition-colors border border-white/10">
                          {txn.category}
                        </button>
                      )}
                    </td>
                    <td className={`px-6 py-4 text-right font-mono font-bold whitespace-nowrap text-sm ${txn.amount > 0 ? 'text-[#00d084]' : 'text-[#ff6b6b]'}`}>
                      {txn.amount > 0 ? '+' : '-'}₹{Math.abs(txn.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full ${
                        txn.status === 'active' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' :
                        txn.status === 'duplicate' ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' :
                        'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                      }`}>
                        {txn.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button onClick={() => setEditingId(txn.id)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-cyan-400 transition-colors">
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => { dispatch({ type: 'DELETE_TRANSACTION', payload: txn.id }); addAuditEvent('DELETE', 'TXN', txn.id, `Deleted: ${txn.description}`); }}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-red-400 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredTransactions.length > 50 && (
            <div className="px-6 py-3 text-xs text-white/30 text-center font-mono" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              Showing 50 of {filteredTransactions.length} records
            </div>
          )}
        </div>

        {/* Upload Modal */}
        {showUpload && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setShowUpload(false)} />
            <div className="relative glass-elevated rounded-3xl max-w-lg w-full p-8 border border-white/15 shadow-2xl">
              <button onClick={() => setShowUpload(false)} className="absolute top-5 right-5 text-white/40 hover:text-white">
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-2xl font-bold text-white mb-2 font-display">Import Stream</h3>
              <p className="text-xs text-white/50 mb-6">Upload CSV or JSON transactions for automated ledger parsing</p>
              <div className="border-2 border-dashed border-white/15 rounded-2xl p-8 text-center hover:border-cyan-500/40 transition-colors cursor-pointer relative">
                <Upload className="w-10 h-10 text-cyan-400 mx-auto mb-3" />
                <p className="text-sm font-semibold text-white/80 mb-1">Click to select or drag CSV file</p>
                <p className="text-xs text-white/35">Supports dates, descriptions, amounts, and category columns</p>
                <input ref={fileInputRef} type="file" accept=".csv,.json" onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
            </div>
          </div>
        )}

        {/* Add Manual Modal */}
        {showAdd && <AddTransactionModal onClose={() => setShowAdd(false)} />}
      </div>
    </div>
  );
}

function AddTransactionModal({ onClose }: { onClose: () => void }) {
  const { dispatch, addAuditEvent } = useAppState();
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], description: '', merchant: '', amount: '', type: 'expense' as 'income' | 'expense', category: 'Dining' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(form.amount);
    if (isNaN(amount)) return;
    const txn: Transaction = {
      id: uuidv4(), date: form.date, description: form.description, merchant: form.merchant || undefined,
      amount: form.type === 'expense' ? -Math.abs(amount) : Math.abs(amount), currency: 'INR',
      type: form.type, category: form.category, source: 'manual', status: 'active',
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_TRANSACTION', payload: txn });
    addAuditEvent('CREATE', 'TXN', txn.id, `Manual: ${txn.description}`);
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } catch (err) {}
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose} />
      <div className="relative glass-elevated rounded-3xl max-w-lg w-full p-8 border border-white/15 shadow-2xl">
        <button onClick={onClose} className="absolute top-5 right-5 text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
        <h3 className="text-2xl font-bold text-white mb-6 font-display">New Transaction</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-white/40 mb-1.5 uppercase font-mono">Date</label>
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-white focus:outline-none glass border border-white/10" />
            </div>
            <div>
              <LuxurySelect
                label="Type"
                value={form.type}
                onChange={val => setForm({ ...form, type: val as any })}
                options={[
                  { value: 'expense', label: 'Expense (-)' },
                  { value: 'income', label: 'Income (+)' },
                ]}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1.5 uppercase font-mono">Description</label>
            <input type="text" required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-white placeholder-white/30 focus:outline-none glass border border-white/10"
              placeholder="e.g., Campus Cafe Mocha" />
          </div>
          <div className="grid grid-cols-2 gap-3 items-end">
            <div>
              <label className="block text-xs text-white/40 mb-1.5 uppercase font-mono">Amount (₹)</label>
              <input type="number" required step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-white placeholder-white/30 focus:outline-none glass border border-white/10 font-mono"
                placeholder="0.00" />
            </div>
            <div>
              <LuxurySelect
                label="Category"
                value={form.category}
                onChange={val => setForm({ ...form, category: val })}
                options={CATEGORIES}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-xs text-white/50 hover:text-white rounded-xl transition-colors">Cancel</button>
            <button type="submit" className="px-6 py-2.5 text-xs font-bold text-black rounded-xl shadow-lg"
              style={{ background: 'linear-gradient(135deg, #00d4ff 0%, #00d084 100%)' }}>
              Record Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
