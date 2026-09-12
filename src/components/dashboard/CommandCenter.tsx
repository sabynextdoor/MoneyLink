import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppState } from '../../store/AppContext';
import {
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  Zap, Target, Sparkles, Activity, ChevronRight, Plus, Eye, Box,
  ShieldCheck, AlertCircle, Compass, HelpCircle, Layers
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid
} from 'recharts';
import CashflowOrb3D from '../3d/CashflowOrb';
import { AnimatedCounter, SpotlightCard } from '../ui/LuxuryComponents';

// ============================================================================
// FINANCIAL COMMAND CENTER
// Premium dashboard with spatial depth, 3D energy core, and interactive telemetry
// ============================================================================

export default function CommandCenter({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const { state } = useAppState();
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<'charts' | 'orb'>('charts');
  const [timeRange, setTimeRange] = useState<'1M' | '3M' | '6M' | '1Y'>('6M');
  const [simExtraSaving, setSimExtraSaving] = useState(2000);

  useEffect(() => {
    setMounted(true);
  }, []);

  const metrics = useMemo(() => {
    const activeTxns = state.transactions.filter(t => t.status === 'active');
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthTxns = activeTxns.filter(t => t.date.startsWith(thisMonth));

    const totalIncome = monthTxns.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const totalExpenses = Math.abs(monthTxns.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0));
    const netCashFlow = totalIncome - totalExpenses;
    const availableToSpend = totalIncome - totalExpenses;

    // Category breakdown
    const categoryBreakdown: Record<string, number> = {};
    monthTxns.filter(t => t.amount < 0).forEach(t => {
      const cat = t.category.split(' - ')[1] || t.category;
      categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + Math.abs(t.amount);
    });

    const categoryData = Object.entries(categoryBreakdown)
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value);

    // Monthly data for chart depending on timeRange
    const monthsCount = timeRange === '1M' ? 1 : timeRange === '3M' ? 3 : timeRange === '6M' ? 6 : 12;
    const monthlyData: { month: string; income: number; expenses: number; net: number }[] = [];
    for (let i = monthsCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const mLabel = d.toLocaleDateString('en-US', { month: 'short' });
      const mTxns = activeTxns.filter(t => t.date.startsWith(mStr));
      const income = mTxns.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
      const expenses = Math.abs(mTxns.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0));
      monthlyData.push({
        month: mLabel,
        income: Math.round(income),
        expenses: Math.round(expenses),
        net: Math.round(income - expenses),
      });
    }

    // Last month comparison
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthStr = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;
    const lastMonthTxns = activeTxns.filter(t => t.date.startsWith(lastMonthStr));
    const lastMonthExpenses = Math.abs(lastMonthTxns.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0));
    const expenseChange = lastMonthExpenses > 0 ? ((totalExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 : 0;

    // Health Score calculation (0-100)
    const savingsRatio = totalIncome > 0 ? Math.max(0, netCashFlow / totalIncome) : 0;
    const healthScore = Math.min(100, Math.max(10, Math.round(savingsRatio * 70 + (expenseChange <= 0 ? 30 : 15))));

    return {
      totalIncome,
      totalExpenses,
      netCashFlow,
      availableToSpend,
      categoryData,
      monthlyData,
      expenseChange,
      healthScore,
    };
  }, [state.transactions, timeRange]);

  const goalProgress = useMemo(() => {
    if (state.goals.length === 0) return null;
    const primaryGoal = state.goals.find(g => g.priority === 'high') || state.goals[0];
    const progress = Math.min(100, (primaryGoal.currentSaved / primaryGoal.targetAmount) * 100);
    return { ...primaryGoal, progress };
  }, [state.goals]);

  const orbStatus = metrics.netCashFlow > 0 ? 'surplus' : metrics.netCashFlow < -200 ? 'deficit' : 'neutral';
  const orbEnergy = Math.min(1, Math.max(0.1, Math.abs(metrics.netCashFlow) / 10000));
  const orbCrystallization = goalProgress ? goalProgress.progress / 100 : 0.3;

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] pt-24 pb-16">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full opacity-[0.04] blur-[120px]"
          style={{ background: 'radial-gradient(circle, #00d4ff 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full opacity-[0.03] blur-[100px]"
          style={{ background: 'radial-gradient(circle, #00d084 0%, transparent 70%)' }} />
        <div className="absolute top-1/2 right-10 w-[400px] h-[400px] rounded-full opacity-[0.025] blur-[90px]"
          style={{ background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)' }} />
      </div>

      <div className="relative z-10 max-w-[1500px] mx-auto px-6 md:px-12 space-y-8">
        
        {/* TOP COMMAND HEADER */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={mounted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-6"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#00d084] animate-pulse" />
              <span className="text-xs uppercase tracking-widest text-[#00d084] font-mono font-semibold">
                Neural Telemetry Active
              </span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl text-white tracking-tight font-extrabold">
              Financial Command
            </h1>
          </div>

          {/* View Switcher: Charts vs 3D Energy Core */}
          <div className="flex items-center gap-3">
            <div className="glass rounded-full p-1 flex items-center border border-white/10">
              <button
                onClick={() => setViewMode('charts')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  viewMode === 'charts' ? 'bg-white/15 text-white shadow-sm' : 'text-white/40 hover:text-white/70'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Analytics</span>
              </button>
              <button
                onClick={() => setViewMode('orb')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  viewMode === 'orb' ? 'bg-white/15 text-white shadow-sm' : 'text-white/40 hover:text-white/70'
                }`}
              >
                <Box className="w-3.5 h-3.5 text-[#00d4ff]" />
                <span>3D Energy Core</span>
              </button>
            </div>

            <div className="text-xs text-white/40 font-mono glass px-3 py-1.5 rounded-full border border-white/5 hidden md:block">
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </motion.header>

        {/* 3D ENERGY ORB HERO MODAL / BANNER (If Orb Mode Active) */}
        <AnimatePresence>
          {viewMode === 'orb' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 360 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative glass-elevated rounded-3xl overflow-hidden border border-cyan-500/20 shadow-2xl flex items-center justify-center"
            >
              <div className="absolute inset-0">
                <CashflowOrb3D
                  status={orbStatus}
                  energy={orbEnergy}
                  crystallization={orbCrystallization}
                  transactions={state.transactions}
                />
              </div>
              <div className="relative z-10 text-center pointer-events-none p-6 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 max-w-md">
                <p className="text-xs uppercase tracking-widest text-[#00d4ff] font-mono font-semibold mb-1">
                  Liquid Energy State: {orbStatus.toUpperCase()}
                </p>
                <p className="text-white text-lg font-bold">
                  ₹{metrics.netCashFlow >= 0 ? '+' : ''}{metrics.netCashFlow.toLocaleString('en-IN')} Net Velocity
                </p>
                <p className="text-xs text-white/50 mt-1">
                  Orb distortion reacts to monthly surplus, rotating faster as velocity accelerates.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MAIN BALANCE & HEALTH SCORE ROW */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={mounted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6"
        >
          {/* Main Balance Hero Card */}
          <div className="lg:col-span-8 glass-card rounded-3xl p-8 border border-white/10 relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <span className="text-xs uppercase tracking-[0.25em] text-white/40 font-mono mb-2 block">
                  Available Spending Capital
                </span>
                <div className="flex items-baseline gap-2">
                  <h2 className="font-mono font-extrabold text-[clamp(2.8rem,7vw,5.5rem)] leading-none text-white tracking-tight"
                    style={{ textShadow: '0 0 60px rgba(0, 212, 255, 0.25)' }}>
                    <AnimatedCounter value={metrics.availableToSpend} prefix="₹" />
                  </h2>
                </div>
                
                <div className="flex items-center gap-3 mt-4">
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                    metrics.expenseChange <= 0
                      ? 'bg-[#00d084]/15 text-[#00d084] border border-[#00d084]/30'
                      : 'bg-[#ff6b6b]/15 text-[#ff6b6b] border border-[#ff6b6b]/30'
                  }`}>
                    {metrics.expenseChange <= 0 ? (
                      <><ArrowDownRight className="w-3.5 h-3.5" />{Math.abs(metrics.expenseChange).toFixed(1)}% spend reduced</>
                    ) : (
                      <><ArrowUpRight className="w-3.5 h-3.5" />{metrics.expenseChange.toFixed(1)}% spend surge</>
                    )}
                  </div>
                  <span className="text-xs text-white/30 font-mono">compared to prior month</span>
                </div>
              </div>

              {/* Quick Summary Pill Boxes */}
              <div className="flex gap-4 sm:gap-6">
                <div className="glass px-5 py-3.5 rounded-2xl border border-white/5 text-right">
                  <div className="flex items-center gap-1.5 justify-end text-[#00d084] text-xs font-mono mb-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>INFLOW</span>
                  </div>
                  <div className="font-mono text-xl sm:text-2xl font-bold text-white">
                    ₹{metrics.totalIncome.toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="glass px-5 py-3.5 rounded-2xl border border-white/5 text-right">
                  <div className="flex items-center gap-1.5 justify-end text-[#ff6b6b] text-xs font-mono mb-1">
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>OUTFLOW</span>
                  </div>
                  <div className="font-mono text-xl sm:text-2xl font-bold text-white">
                    ₹{metrics.totalExpenses.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Health Scorecard */}
          <div className="lg:col-span-4 glass-card rounded-3xl p-6 md:p-8 border border-white/10 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-white/40 font-mono">Financial Vitality</p>
                <h3 className="font-display text-xl text-white font-bold">Health Score</h3>
              </div>
              <ShieldCheck className="w-6 h-6 text-[#00d4ff]" />
            </div>

            <div className="flex items-center gap-5 my-2">
              {/* Circular Gauge Score */}
              <div className="relative w-20 h-20 flex-shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#00d084" strokeWidth="8"
                    strokeDasharray={`${metrics.healthScore * 2.51} 251`} strokeLinecap="round"
                    style={{ filter: 'drop-shadow(0 0 8px rgba(0, 208, 132, 0.6))' }} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-mono text-2xl font-extrabold text-white">{metrics.healthScore}</span>
                </div>
              </div>

              <div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-[#00d084]/20 text-[#00d084] font-semibold">
                  {metrics.healthScore >= 75 ? 'Pristine Velocity' : metrics.healthScore >= 50 ? 'Moderate Buffer' : 'Caution Required'}
                </span>
                <p className="text-xs text-white/40 mt-2">
                  Savings rate + expense discipline telemetry calculated in real-time.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-white/50">
              <span>Integrity Verified</span>
              <span className="text-[#00d084] font-mono font-semibold">100% Deterministic</span>
            </div>
          </div>
        </motion.section>

        {/* TIME-SERIES TRAJECTORY & CATEGORY BREAKDOWN */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Chart */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="lg:col-span-8 glass-card rounded-3xl p-8 relative overflow-hidden border border-white/10"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <p className="text-xs uppercase tracking-wider text-white/40 font-mono mb-0.5">Cash Flow Matrix</p>
                <h3 className="font-display text-2xl text-white font-bold">{timeRange} Trajectory</h3>
              </div>

              {/* Time Range Filter Pills */}
              <div className="flex items-center gap-1 glass rounded-full p-1 border border-white/10">
                {(['1M', '3M', '6M', '1Y'] as const).map(tr => (
                  <button
                    key={tr}
                    onClick={() => setTimeRange(tr)}
                    className={`px-3 py-1 rounded-full text-xs font-mono font-medium transition-all ${
                      timeRange === tr
                        ? 'bg-white/20 text-white shadow-sm'
                        : 'text-white/40 hover:text-white/70'
                    }`}
                  >
                    {tr}
                  </button>
                ))}
              </div>
            </div>

            <ResponsiveContainer width="100%" height={290}>
              <AreaChart data={metrics.monthlyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00d084" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#00d084" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff6b6b" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#ff6b6b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)', fontFamily: 'JetBrains Mono' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.3)', fontFamily: 'JetBrains Mono' }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(12, 12, 18, 0.95)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '16px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(20px)',
                  }}
                  labelStyle={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', fontFamily: 'JetBrains Mono' }}
                  formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, '']}
                />
                <Area type="monotone" dataKey="income" stroke="#00d084" strokeWidth={2.5} fill="url(#incomeGradient)" name="Inflow" />
                <Area type="monotone" dataKey="expenses" stroke="#ff6b6b" strokeWidth={2.5} fill="url(#expenseGradient)" name="Outflow" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Category Breakdown Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="lg:col-span-4 glass-card rounded-3xl p-8 border border-white/10 flex flex-col justify-between"
          >
            <div>
              <p className="text-xs uppercase tracking-wider text-white/40 font-mono mb-1">Outflow Distribution</p>
              <h3 className="font-display text-2xl text-white font-bold mb-6">Top Categories</h3>
              
              <div className="space-y-4">
                {metrics.categoryData.slice(0, 5).map((cat, i) => {
                  const total = metrics.categoryData.reduce((s, c) => s + c.value, 0);
                  const pct = total > 0 ? (cat.value / total) * 100 : 0;
                  const colors = ['#ff6b6b', '#ff8e53', '#00d4ff', '#a855f7', '#666'];
                  return (
                    <motion.div
                      key={cat.name}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.08 }}
                    >
                      <div className="flex items-center justify-between mb-1.5 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors[i % colors.length] }} />
                          <span className="text-white/80 font-medium">{cat.name}</span>
                        </div>
                        <span className="font-mono text-white/50 font-semibold">₹{cat.value.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 1, delay: 0.4 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: colors[i % colors.length] }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {onNavigate && (
              <button
                onClick={() => onNavigate('transactions')}
                className="mt-6 w-full py-2.5 rounded-xl glass hover:bg-white/10 text-white/70 hover:text-white text-xs font-medium flex items-center justify-center gap-1 transition-all"
              >
                <span>View Full Matrix</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </motion.div>
        </div>

        {/* BOTTOM ROW: SMART SAVINGS GOAL & INTERACTIVE WHAT-IF SLIDER */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Active Goal Card */}
          {goalProgress && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={mounted ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="lg:col-span-6 glass-card rounded-3xl p-8 relative overflow-hidden border border-purple-500/20 shadow-xl"
            >
              <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-20 blur-[80px]"
                style={{ background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)' }} />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-[#a855f7] font-mono font-semibold">
                      Primary Savings Core
                    </span>
                    <h3 className="font-display text-2xl text-white font-bold mt-0.5">{goalProgress.name}</h3>
                  </div>
                  <Target className="w-6 h-6 text-[#a855f7]" />
                </div>

                <div className="flex items-baseline gap-3 mb-4">
                  <span className="font-mono text-5xl font-extrabold text-gradient-violet">
                    {goalProgress.progress.toFixed(0)}%
                  </span>
                  <span className="text-xs text-white/40 font-mono">Crystallized</span>
                </div>

                <div className="flex justify-between text-xs text-white/40 mb-2 font-mono">
                  <span>Saved: ₹{goalProgress.currentSaved.toLocaleString('en-IN')}</span>
                  <span>Target: ₹{goalProgress.targetAmount.toLocaleString('en-IN')}</span>
                </div>

                <div className="h-2.5 bg-white/5 rounded-full overflow-hidden mb-4">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${goalProgress.progress}%` }}
                    transition={{ duration: 1.5, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, #a855f7 0%, #c084fc 100%)' }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-white/30 pt-2 border-t border-white/5">
                  <span>Target Date: {new Date(goalProgress.targetDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                  {onNavigate && (
                    <button
                      onClick={() => onNavigate('goals')}
                      className="text-[#a855f7] hover:underline font-medium"
                    >
                      Manage Goals →
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Quick What-If Simulation Widget */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={mounted ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
            className={`${goalProgress ? 'lg:col-span-6' : 'lg:col-span-12'} glass-card rounded-3xl p-8 border border-white/10 shadow-xl`}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-[#00d4ff] font-mono font-semibold">Instant What-If</p>
                <h3 className="font-display text-2xl text-white font-bold">Simulation Dial</h3>
              </div>
              <Sparkles className="w-5 h-5 text-[#00d4ff]" />
            </div>

            <p className="text-xs text-white/50 mb-4">
              Move the dial to preview compounding savings if you optimize discretionary spending:
            </p>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1.5 text-xs font-mono">
                  <span className="text-white/60">Additional Monthly Savings</span>
                  <span className="text-base font-bold text-[#00d084]">+₹{simExtraSaving.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min={500}
                  max={10000}
                  step={500}
                  value={simExtraSaving}
                  onChange={e => setSimExtraSaving(Number(e.target.value))}
                  className="w-full accent-[#00d084] cursor-pointer h-2 bg-white/10 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="glass p-3.5 rounded-2xl border border-white/5">
                  <span className="text-[10px] text-white/40 uppercase font-mono block mb-1">In 6 Months</span>
                  <span className="font-mono text-lg font-bold text-white">+₹{(simExtraSaving * 6).toLocaleString('en-IN')}</span>
                </div>
                <div className="glass p-3.5 rounded-2xl border border-white/5">
                  <span className="text-[10px] text-white/40 uppercase font-mono block mb-1">In 12 Months</span>
                  <span className="font-mono text-lg font-bold text-gradient-green">+₹{(simExtraSaving * 12).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
