import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppState } from '../store/AppContext';
import { SavingsGoal } from '../types';
import { v4 as uuidv4 } from 'uuid';
import confetti from 'canvas-confetti';
import { Target, Plus, Edit3, Trash2, Calendar, X, Sparkles, CheckCircle2, ArrowUpRight, Coins } from 'lucide-react';
import { SpotlightCard, AnimatedCounter, LuxurySelect } from './ui/LuxuryComponents';

export default function LuxuryGoals() {
  const { state, dispatch, addAuditEvent } = useAppState();
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [depositGoalId, setDepositGoalId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState<string>('1000');

  const handleDelete = (id: string) => {
    dispatch({ type: 'DELETE_GOAL', payload: id });
    addAuditEvent('DELETE', 'GOAL', id, 'Goal deleted');
  };

  const handleQuickDeposit = (goal: SavingsGoal, amount: number) => {
    const newTotal = goal.currentSaved + amount;
    dispatch({
      type: 'UPDATE_GOAL',
      payload: { id: goal.id, updates: { currentSaved: newTotal } },
    });
    addAuditEvent('UPDATE', 'GOAL', goal.id, `Deposited ₹${amount} (Total: ₹${newTotal})`);
    
    try {
      confetti({
        particleCount: newTotal >= goal.targetAmount ? 120 : 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#a855f7', '#00d4ff', '#00d084', '#ff8e53'],
      });
    } catch (e) {}

    setDepositGoalId(null);
  };

  return (
    <div className="relative min-h-screen pt-24 pb-16">
      <div className="fixed inset-0 grid-pattern opacity-20 pointer-events-none" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#a855f7] animate-pulse" />
              <p className="text-xs uppercase tracking-widest text-[#a855f7] font-mono font-semibold">Crystallization Targets</p>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white font-display tracking-tight">
              Savings <span className="text-gradient-violet">Core</span>
            </h1>
            <p className="text-white/40 mt-1 text-xs sm:text-sm">
              Watch liquid capital crystallize into resilient financial security and assets.
            </p>
          </div>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold text-black shadow-lg hover:opacity-90 transition-all cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #a855f7 0%, #00d4ff 100%)' }}>
            <Plus className="w-4 h-4" /> Create Goal
          </button>
        </div>

        {/* Goals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {state.goals.map((goal, idx) => {
            const progress = Math.min(100, (goal.currentSaved / goal.targetAmount) * 100);
            const remaining = Math.max(0, goal.targetAmount - goal.currentSaved);
            const daysLeft = Math.max(0, Math.ceil((new Date(goal.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
            const monthsLeft = Math.max(1, Math.ceil(daysLeft / 30));
            const neededPerMonth = remaining / monthsLeft;
            const isCompleted = progress >= 100;

            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="glass-card rounded-3xl p-6 relative overflow-hidden border border-white/10 flex flex-col justify-between group shadow-xl"
              >
                <div className="absolute inset-0 opacity-15 group-hover:opacity-25 transition-opacity pointer-events-none"
                  style={{ background: 'radial-gradient(ellipse at bottom right, rgba(168, 85, 247, 0.5) 0%, transparent 60%)' }} />
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
                        style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.3) 0%, rgba(0, 212, 255, 0.3) 100%)' }}>
                        <Target className="w-5 h-5 text-purple-300" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base font-display">{goal.name}</h3>
                        <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full ${
                          goal.priority === 'high' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                          goal.priority === 'medium' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                          'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}>{goal.priority} priority</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => setEditingId(editingId === goal.id ? null : goal.id)}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(goal.id)}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-red-400 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Ring & Value */}
                  <div className="flex items-center gap-5 mb-5">
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
                        <circle cx="50" cy="50" r="40" fill="none" stroke={`url(#goalGrad-${goal.id})`} strokeWidth="7"
                          strokeDasharray={`${progress * 2.51} 251`} strokeLinecap="round"
                          style={{ filter: 'drop-shadow(0 0 8px rgba(168, 85, 247, 0.6))' }} />
                        <defs>
                          <linearGradient id={`goalGrad-${goal.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#a855f7" />
                            <stop offset="100%" stopColor="#00d4ff" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-base font-bold font-mono text-white">
                          {progress.toFixed(0)}%
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-2xl font-bold font-mono text-white">
                        ₹<AnimatedCounter value={goal.currentSaved} />
                      </p>
                      <p className="text-xs text-white/40 font-mono">of ₹{goal.targetAmount.toLocaleString('en-IN')}</p>
                    </div>
                  </div>

                  {/* Stat tiles */}
                  <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                    <div className="rounded-2xl p-3 glass border border-white/5">
                      <p className="text-[10px] text-white/40 uppercase font-mono">Remaining</p>
                      <p className="font-bold font-mono text-amber-300 mt-0.5">₹{remaining.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="rounded-2xl p-3 glass border border-white/5">
                      <p className="text-[10px] text-white/40 uppercase font-mono">Stride Rate</p>
                      <p className="font-bold font-mono text-cyan-300 mt-0.5">₹{Math.round(neededPerMonth).toLocaleString('en-IN')}/mo</p>
                    </div>
                  </div>

                  {/* Target Date */}
                  <div className="flex items-center justify-between text-xs text-white/40 mb-4 font-mono">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-white/30" />
                      <span>{daysLeft} days left</span>
                    </div>
                    <span>{new Date(goal.targetDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                  </div>

                  {/* Inline Edit form */}
                  {editingId === goal.id && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <label className="block text-xs text-white/50 mb-1.5 font-mono">Update Accumulated Amount (₹)</label>
                      <input type="number" defaultValue={goal.currentSaved}
                        onBlur={(e) => {
                          const val = Number(e.target.value);
                          dispatch({ type: 'UPDATE_GOAL', payload: { id: goal.id, updates: { currentSaved: val } } });
                          addAuditEvent('UPDATE', 'GOAL', goal.id, `Saved: ₹${val}`);
                          setEditingId(null);
                        }}
                        className="w-full px-3 py-2 rounded-xl text-xs font-mono text-white focus:outline-none glass border border-white/15" />
                    </div>
                  )}
                </div>

                {/* Quick Deposit Actions */}
                <div className="relative z-10 pt-3 border-t border-white/5">
                  {depositGoalId === goal.id ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Amount in ₹"
                          value={depositAmount}
                          onChange={e => setDepositAmount(e.target.value)}
                          className="flex-1 px-3 py-1.5 rounded-xl text-xs font-mono text-white glass border border-white/20 focus:outline-none"
                        />
                        <button
                          onClick={() => handleQuickDeposit(goal, Number(depositAmount) || 0)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold text-black bg-[#00d084] hover:opacity-90"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDepositGoalId(null)}
                          className="px-2 py-1.5 text-xs text-white/40 hover:text-white"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQuickDeposit(goal, 500)}
                        className="flex-1 py-1.5 rounded-xl glass hover:bg-white/10 text-[11px] font-mono text-white/80 hover:text-white transition-all border border-white/5"
                      >
                        +₹500
                      </button>
                      <button
                        onClick={() => handleQuickDeposit(goal, 1000)}
                        className="flex-1 py-1.5 rounded-xl glass hover:bg-white/10 text-[11px] font-mono text-white/80 hover:text-white transition-all border border-white/5"
                      >
                        +₹1,000
                      </button>
                      <button
                        onClick={() => setDepositGoalId(goal.id)}
                        className="px-3 py-1.5 rounded-xl glass hover:bg-white/10 text-[11px] text-[#a855f7] hover:text-white transition-all border border-purple-500/20"
                      >
                        Custom +
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {state.goals.length === 0 && (
          <div className="text-center py-16 glass-card rounded-3xl border border-white/10">
            <Sparkles className="w-12 h-12 text-purple-400/40 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-white/60">No goals currently defined</h3>
            <p className="text-xs text-white/30 mt-1">Create your first target to begin crystallizing reserves.</p>
          </div>
        )}

        {showAdd && <AddGoalModal onClose={() => setShowAdd(false)} />}
      </div>
    </div>
  );
}

function AddGoalModal({ onClose }: { onClose: () => void }) {
  const { dispatch, addAuditEvent } = useAppState();
  const [form, setForm] = useState({ name: '', targetAmount: '', targetDate: new Date(new Date().getFullYear() + 1, 0, 1).toISOString().split('T')[0], currentSaved: '0', priority: 'medium' as 'high' | 'medium' | 'low', notes: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const goal: SavingsGoal = {
      id: uuidv4(), name: form.name, targetAmount: parseFloat(form.targetAmount),
      targetDate: form.targetDate, currentSaved: parseFloat(form.currentSaved) || 0,
      contributionFrequency: 'monthly', priority: form.priority,
      notes: form.notes || undefined, createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_GOAL', payload: goal });
    addAuditEvent('CREATE', 'GOAL', goal.id, `Created: ${goal.name}`);
    try {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    } catch (e) {}
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose} />
      <div className="relative glass-elevated rounded-3xl max-w-md w-full p-8 border border-white/15 shadow-2xl">
        <button onClick={onClose} className="absolute top-5 right-5 text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
        <h3 className="text-2xl font-bold text-white mb-6 font-display">New Crystallization Core</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-white/40 mb-1.5 uppercase font-mono">Goal Name</label>
            <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-white placeholder-white/30 focus:outline-none glass border border-white/10"
              placeholder="e.g., MacBook Pro Fund or Emergency Reserve" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-white/40 mb-1.5 uppercase font-mono">Target (₹)</label>
              <input type="number" required value={form.targetAmount} onChange={e => setForm({ ...form, targetAmount: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-white focus:outline-none glass border border-white/10"
                placeholder="50000" />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5 uppercase font-mono">Initial Saved (₹)</label>
              <input type="number" value={form.currentSaved} onChange={e => setForm({ ...form, currentSaved: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-white focus:outline-none glass border border-white/10"
                placeholder="0" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 items-end">
            <div>
              <label className="block text-xs text-white/40 mb-1.5 uppercase font-mono">Target Horizon</label>
              <input type="date" required value={form.targetDate} onChange={e => setForm({ ...form, targetDate: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-white focus:outline-none glass border border-white/10" />
            </div>
            <div>
              <LuxurySelect
                label="Priority"
                value={form.priority}
                onChange={val => setForm({ ...form, priority: val as any })}
                options={[
                  { value: 'high', label: 'High Priority', badge: 'Critical' },
                  { value: 'medium', label: 'Medium Priority' },
                  { value: 'low', label: 'Low Priority' },
                ]}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-xs text-white/50 hover:text-white rounded-xl">Cancel</button>
            <button type="submit" className="px-6 py-2.5 text-xs font-bold text-black rounded-xl shadow-lg"
              style={{ background: 'linear-gradient(135deg, #a855f7 0%, #00d4ff 100%)' }}>
              Initialize Target
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
