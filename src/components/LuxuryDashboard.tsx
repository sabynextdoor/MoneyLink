import React, { useMemo, useState, useEffect } from 'react';
import { useAppState } from '../store/AppContext';
import {
  DollarSign, TrendingUp, TrendingDown, PiggyBank,
  AlertTriangle, Info, Sparkles, Zap, Shield, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import CashflowOrb3D from './3d/CashflowOrb';
import { SpotlightCard, AnimatedCounter, DecryptedText, KineticText, AuroraBackground } from './ui/LuxuryComponents';

const COLORS = ['#00FFA3', '#00E5FF', '#7000FF', '#B100FF', '#FF2A6D', '#FF8A00', '#FFD700', '#E5E4E2'];

export default function LuxuryDashboard() {
  const { state } = useAppState();
  const [showWelcome, setShowWelcome] = useState(() => !localStorage.getItem('luxury-welcome-dismissed'));

  const metrics = useMemo(() => {
    const activeTransactions = state.transactions.filter(t => t.status === 'active');
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthTransactions = activeTransactions.filter(t => t.date.startsWith(thisMonth));

    const totalIncome = monthTransactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const totalExpenses = Math.abs(monthTransactions.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0));
    const netCashFlow = totalIncome - totalExpenses;

    const categoryBreakdown: Record<string, number> = {};
    monthTransactions.filter(t => t.amount < 0).forEach(t => {
      const cat = t.category.split(' - ')[1] || t.category;
      categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + Math.abs(t.amount);
    });

    const categoryData = Object.entries(categoryBreakdown)
      .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
      .sort((a, b) => b.value - a.value);

    const monthlyData: { month: string; income: number; expenses: number; net: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const mLabel = d.toLocaleDateString('en-US', { month: 'short' });
      const mTxns = activeTransactions.filter(t => t.date.startsWith(mStr));
      const income = mTxns.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
      const expenses = Math.abs(mTxns.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0));
      monthlyData.push({ month: mLabel, income: Math.round(income), expenses: Math.round(expenses), net: Math.round(income - expenses) });
    }

    const duplicateCount = state.transactions.filter(t => t.status === 'duplicate').length;
    const pendingDuplicates = state.duplicates.filter(d => d.status === 'pending').length;
    const pendingMissing = state.missingSuggestions.filter(m => m.status === 'pending').length;

    return { totalIncome, totalExpenses, netCashFlow, categoryData, monthlyData, duplicateCount, pendingDuplicates, pendingMissing, transactionCount: activeTransactions.length };
  }, [state.transactions, state.duplicates, state.missingSuggestions]);

  const goalProgress = useMemo(() => {
    if (state.goals.length === 0) return null;
    const primaryGoal = state.goals.find(g => g.priority === 'high') || state.goals[0];
    const progress = Math.min(100, (primaryGoal.currentSaved / primaryGoal.targetAmount) * 100);
    return { ...primaryGoal, progress };
  }, [state.goals]);

  // Determine orb status based on cash flow
  const orbStatus = metrics.netCashFlow > 0 ? 'surplus' : metrics.netCashFlow < -200 ? 'deficit' : 'neutral';
  const orbEnergy = Math.min(1, Math.abs(metrics.netCashFlow) / 1000);
  const orbCrystallization = goalProgress ? goalProgress.progress / 100 : 0;

  return (
    <div className="relative min-h-screen">
      {/* Aurora Background */}
      <AuroraBackground variant={orbStatus === 'surplus' ? 'cool' : orbStatus === 'deficit' ? 'warm' : 'neutral'} />
      
      {/* Grid Pattern Overlay */}
      <div className="fixed inset-0 grid-pattern opacity-30 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Welcome Banner */}
        {showWelcome && (
          <div className="relative overflow-hidden rounded-3xl border border-white/10 p-8 noise-overlay"
            style={{ background: 'linear-gradient(135deg, rgba(112, 0, 255, 0.15) 0%, rgba(0, 229, 255, 0.1) 50%, rgba(0, 255, 163, 0.05) 100%)' }}>
            <button
              onClick={() => { setShowWelcome(false); localStorage.setItem('luxury-welcome-dismissed', 'true'); }}
              className="absolute top-4 right-4 text-white/40 hover:text-white/80 transition-colors text-sm"
            >
              Dismiss
            </button>
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="w-6 h-6 text-yellow-400" />
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                <KineticText text="Welcome to CashLink" delay={0} stagger={0.03} />
              </h2>
            </div>
            <p className="text-white/60 text-sm max-w-2xl">
              Your spatial financial command center. The orb at the center represents your financial energy — watch it breathe, crystallize, and respond to your decisions in real-time.
            </p>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-white/40 mb-2" style={{ letterSpacing: '0.2em' }}>
              Financial Command Center
            </p>
            <h1 className="text-5xl md:text-7xl font-black text-white"
              style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '-0.03em' }}>
              <span className="text-gradient-income">Master</span>{' '}
              <span className="text-white">Your</span>{' '}
              <span className="text-gradient-savings">Cashflow</span>
            </h1>
            <p className="text-white/40 mt-3 text-sm">
              Real-time spatial visualization of your financial universe
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="glass rounded-2xl px-4 py-3 flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${orbStatus === 'surplus' ? 'bg-emerald-400 glow-mint' : orbStatus === 'deficit' ? 'bg-red-400 glow-crimson' : 'bg-cyan-400 glow-cyan'}`} />
              <span className="text-xs text-white/60 uppercase tracking-wider">
                {orbStatus === 'surplus' ? 'Surplus Mode' : orbStatus === 'deficit' ? 'Deficit Alert' : 'Equilibrium'}
              </span>
            </div>
          </div>
        </div>

        {/* MAIN BENTO GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 auto-rows-min">
          
          {/* === 3D ORB — Centerpiece (Large) === */}
          <div className="lg:col-span-7 lg:row-span-2 relative min-h-[400px] lg:min-h-[500px] rounded-3xl overflow-hidden border border-white/5 noise-overlay"
            style={{ background: 'radial-gradient(ellipse at center, rgba(112, 0, 255, 0.05) 0%, rgba(5, 5, 5, 0.9) 70%)' }}>
            <CashflowOrb3D
              status={orbStatus}
              energy={orbEnergy}
              crystallization={orbCrystallization}
              transactions={state.transactions.filter(t => t.status === 'active').slice(0, 50)}
            />
            
            {/* Orb Overlay Info */}
            <div className="absolute bottom-6 left-6 right-6">
              <div className="glass rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Net Cash Flow</p>
                  <p className={`text-3xl font-bold ${metrics.netCashFlow >= 0 ? 'text-gradient-income' : 'text-gradient-expense'}`}
                    style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    <AnimatedCounter value={metrics.netCashFlow} prefix="$" decimals={0} />
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Status</p>
                  <p className="text-sm text-white/80 capitalize">{orbStatus}</p>
                </div>
              </div>
            </div>
          </div>

          {/* === Income Card === */}
          <div className="lg:col-span-5">
            <SpotlightCard className="glass glass-hover rounded-3xl p-6 h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, rgba(0, 255, 163, 0.2) 0%, rgba(0, 229, 255, 0.2) 100%)' }}>
                    <TrendingUp className="w-5 h-5" style={{ color: '#00FFA3' }} />
                  </div>
                  <div>
                    <p className="text-xs text-white/40 uppercase tracking-wider">Monthly Income</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-4xl font-bold text-white mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                <AnimatedCounter value={metrics.totalIncome} prefix="$" decimals={0} />
              </p>
              <p className="text-xs text-white/40">This month's total earnings</p>
              
              {/* Mini sparkline */}
              <div className="mt-4 h-12">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics.monthlyData}>
                    <defs>
                      <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00FFA3" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#00FFA3" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="income" stroke="#00FFA3" strokeWidth={2} fill="url(#incomeGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </SpotlightCard>
          </div>

          {/* === Expense Card === */}
          <div className="lg:col-span-5">
            <SpotlightCard className="glass glass-hover rounded-3xl p-6 h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, rgba(255, 42, 109, 0.2) 0%, rgba(255, 138, 0, 0.2) 100%)' }}>
                    <TrendingDown className="w-5 h-5" style={{ color: '#FF2A6D' }} />
                  </div>
                  <div>
                    <p className="text-xs text-white/40 uppercase tracking-wider">Monthly Expenses</p>
                  </div>
                </div>
                <ArrowDownRight className="w-4 h-4 text-red-400" />
              </div>
              <p className="text-4xl font-bold text-white mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                <AnimatedCounter value={metrics.totalExpenses} prefix="$" decimals={0} />
              </p>
              <p className="text-xs text-white/40">Total spending this period</p>
              
              <div className="mt-4 h-12">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics.monthlyData}>
                    <defs>
                      <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FF2A6D" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#FF2A6D" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="expenses" stroke="#FF2A6D" strokeWidth={2} fill="url(#expenseGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </SpotlightCard>
          </div>

          {/* === Savings Goal Progress === */}
          <div className="lg:col-span-5">
            <SpotlightCard className="glass glass-hover rounded-3xl p-6 h-full relative overflow-hidden">
              {/* Animated background gradient */}
              <div className="absolute inset-0 opacity-20"
                style={{ background: 'radial-gradient(ellipse at bottom right, rgba(112, 0, 255, 0.3) 0%, transparent 60%)' }} />
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, rgba(112, 0, 255, 0.3) 0%, rgba(177, 0, 255, 0.3) 100%)' }}>
                      <PiggyBank className="w-5 h-5" style={{ color: '#B100FF' }} />
                    </div>
                    <div>
                      <p className="text-xs text-white/40 uppercase tracking-wider">Savings Core</p>
                      <p className="text-sm text-white/80">{goalProgress?.name || 'No Goal'}</p>
                    </div>
                  </div>
                </div>
                
                {goalProgress ? (
                  <>
                    <div className="flex items-baseline gap-2 mb-4">
                      <p className="text-5xl font-black text-gradient-savings" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                        <AnimatedCounter value={goalProgress.progress} decimals={0} suffix="%" />
                      </p>
                    </div>
                    
                    {/* Progress Ring */}
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                          <circle cx="50" cy="50" r="40" fill="none" stroke="url(#savingsGrad)" strokeWidth="8"
                            strokeDasharray={`${goalProgress.progress * 2.51} 251`}
                            strokeLinecap="round" />
                          <defs>
                            <linearGradient id="savingsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#7000FF" />
                              <stop offset="100%" stopColor="#B100FF" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-white/60">
                          <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>${goalProgress.currentSaved}</span>
                          <span className="text-white/30"> / </span>
                          <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>${goalProgress.targetAmount}</span>
                        </p>
                        <p className="text-xs text-white/30 mt-1">
                          Target: {new Date(goalProgress.targetDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-white/40 text-sm">Create a goal to track progress</p>
                )}
              </div>
            </SpotlightCard>
          </div>

          {/* === Cash Flow Chart (Wide) === */}
          <div className="lg:col-span-8">
            <SpotlightCard className="glass glass-hover rounded-3xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Cash Flow Trajectory</p>
                  <h3 className="text-lg font-semibold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    6-Month Overview
                  </h3>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={metrics.monthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    contentStyle={{ background: 'rgba(10, 10, 15, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(20px)' }}
                    labelStyle={{ color: 'rgba(255,255,255,0.6)' }}
                    itemStyle={{ color: '#F8FAFC' }}
                    formatter={(value: number) => `$${value.toFixed(0)}`}
                  />
                  <Bar dataKey="income" fill="#00FFA3" radius={[4, 4, 0, 0]} name="Income" />
                  <Bar dataKey="expenses" fill="#FF2A6D" radius={[4, 4, 0, 0]} name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            </SpotlightCard>
          </div>

          {/* === Category Breakdown === */}
          <div className="lg:col-span-4">
            <SpotlightCard className="glass glass-hover rounded-3xl p-6 h-full">
              <p className="text-xs text-white/40 uppercase tracking-wider mb-4">Spending Nebula</p>
              {metrics.categoryData.length > 0 ? (
                <div className="flex flex-col items-center">
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={metrics.categoryData.slice(0, 6)}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {metrics.categoryData.slice(0, 6).map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} opacity={0.8} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: 'rgba(10, 10, 15, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                        formatter={(value: number) => `$${value.toFixed(0)}`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="w-full space-y-1.5 mt-2">
                    {metrics.categoryData.slice(0, 4).map((cat, i) => (
                      <div key={cat.name} className="flex items-center gap-2 text-xs">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i], boxShadow: `0 0 8px ${COLORS[i]}` }} />
                        <span className="text-white/60 truncate flex-1">{cat.name}</span>
                        <span className="text-white/80 font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                          ${cat.value.toFixed(0)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-white/30 text-sm text-center py-8">No data yet</p>
              )}
            </SpotlightCard>
          </div>

          {/* === Alerts === */}
          {(metrics.pendingDuplicates > 0 || metrics.pendingMissing > 0) && (
            <div className="lg:col-span-12">
              <div className="glass rounded-3xl p-5 border-amber-500/20"
                style={{ background: 'linear-gradient(135deg, rgba(255, 138, 0, 0.05) 0%, rgba(255, 42, 109, 0.03) 100%)' }}>
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  <div>
                    <p className="text-sm font-medium text-amber-200">Anomalies Detected</p>
                    <p className="text-xs text-white/40 mt-0.5">
                      {metrics.pendingDuplicates > 0 && `${metrics.pendingDuplicates} duplicate(s) `}
                      {metrics.pendingMissing > 0 && `${metrics.pendingMissing} missing transaction(s) `}
                      — Review in Transactions tab
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* === Bottom Marquee === */}
        <div className="overflow-hidden py-4 border-t border-white/5">
          <div className="marquee whitespace-nowrap flex gap-12 text-xs text-white/20 uppercase tracking-widest"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            {Array.from({ length: 2 }).map((_, i) => (
              <React.Fragment key={i}>
                <span>◆ Educational Tool Only</span>
                <span>◆ No Financial Advice</span>
                <span>◆ Synthetic Data</span>
                <span>◆ Explainable Forecasts</span>
                <span>◆ Transparent Assumptions</span>
                <span>◆ No Bank Connections</span>
                <span>◆ Full Audit Trail</span>
                <span>◆ Student Budget Coach</span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
