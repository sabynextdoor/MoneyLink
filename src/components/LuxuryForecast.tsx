import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppState } from '../store/AppContext';
import { calculateForecast, compareScenarios } from '../engine/forecast';
import { ForecastAssumptions } from '../types';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, AreaChart, Area
} from 'recharts';
import { Info, Sliders, TrendingUp, Zap, Sparkles, Compass, CheckCircle2 } from 'lucide-react';
import { SpotlightCard, AnimatedCounter, AuroraBackground } from './ui/LuxuryComponents';

export default function LuxuryForecast() {
  const { state, dispatch, addAuditEvent } = useAppState();
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
  const [editingScenario, setEditingScenario] = useState<string | null>(null);

  const currentBalance = useMemo(() => {
    const activeTxns = state.transactions.filter(t => t.status === 'active');
    const totalIncome = activeTxns.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const totalExpenses = Math.abs(activeTxns.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0));
    return totalIncome - totalExpenses;
  }, [state.transactions]);

  const forecastResults = useMemo(() => {
    return state.scenarios.filter(s => s.isActive).map(scenario =>
      calculateForecast(scenario, state.transactions, state.goals, currentBalance)
    );
  }, [state.scenarios, state.transactions, state.goals, currentBalance]);

  const comparisons = useMemo(() => compareScenarios(forecastResults), [forecastResults]);
  const selectedResult = activeScenarioId ? forecastResults.find(r => r.scenarioId === activeScenarioId) : forecastResults[0];

  const chartData = useMemo(() => {
    if (forecastResults.length === 0) return [];
    const maxPeriods = Math.max(...forecastResults.map(r => r.periods.length));
    return Array.from({ length: maxPeriods }, (_, i) => {
      const point: any = { period: forecastResults[0].periods[i]?.label || `P${i + 1}` };
      forecastResults.forEach(r => {
        if (r.periods[i]) {
          point[`${r.scenarioName}_balance`] = r.periods[i].cumulativeBalance;
          point[`${r.scenarioName}_savings`] = r.periods[i].savingsProgress;
        }
      });
      return point;
    });
  }, [forecastResults]);

  const handleAssumptionChange = (scenarioId: string, field: keyof ForecastAssumptions, value: any) => {
    const scenario = state.scenarios.find(s => s.id === scenarioId);
    if (!scenario) return;
    dispatch({ type: 'UPDATE_SCENARIO', payload: { id: scenarioId, updates: { assumptions: { ...scenario.assumptions, [field]: value } } } });
    addAuditEvent('UPDATE', 'SCENARIO', scenarioId, `${field}: ${value}`);
  };

  return (
    <div className="relative min-h-screen pt-24 pb-16">
      <AuroraBackground variant={selectedResult?.scenarioName === 'Conservative' ? 'cool' : 'warm'} />
      <div className="fixed inset-0 grid-pattern opacity-20 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#a855f7] animate-pulse" />
            <p className="text-xs uppercase tracking-widest text-[#a855f7] font-mono font-semibold">Temporal Prediction Engine</p>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white font-display tracking-tight">
            Forecast Your <span className="text-gradient-violet">Multiverse</span>
          </h1>
          <p className="text-white/40 mt-1 text-xs sm:text-sm max-w-xl">
            Explore parallel financial timelines. Adjust inflation, volatility, and contributions with real-time feedback.
          </p>
        </div>

        {/* Scenario Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {state.scenarios.map(scenario => {
            const result = forecastResults.find(r => r.scenarioId === scenario.id);
            const isSelected = selectedResult?.scenarioId === scenario.id;
            return (
              <motion.button
                key={scenario.id}
                onClick={() => setActiveScenarioId(scenario.id)}
                whileHover={{ y: -3 }}
                className={`relative text-left rounded-3xl p-6 transition-all duration-300 glass-card cursor-pointer border ${
                  isSelected ? 'border-white/30 shadow-2xl scale-[1.02]' : 'border-white/10 hover:border-white/20'
                }`}
                style={{
                  background: isSelected
                    ? `linear-gradient(135deg, ${scenario.color}25 0%, rgba(12,12,18,0.9) 100%)`
                    : 'rgba(255,255,255,0.02)',
                  boxShadow: isSelected ? `0 0 40px ${scenario.color}25` : 'none',
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: scenario.color, boxShadow: `0 0 12px ${scenario.color}` }} />
                    <h3 className="font-bold text-white text-base font-display">{scenario.name}</h3>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditingScenario(editingScenario === scenario.id ? null : scenario.id); }}
                    className="p-1.5 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                  >
                    <Sliders className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-white/50 mb-5 line-clamp-2">{scenario.description}</p>
                {result && (
                  <div className="space-y-2 pt-3 border-t border-white/5">
                    <div className="flex justify-between items-baseline">
                      <span className="text-[11px] text-white/40 font-mono">Ending Balance</span>
                      <span className="text-2xl font-bold font-mono" style={{ color: scenario.color }}>
                        <AnimatedCounter value={result.endingBalance} prefix="₹" decimals={0} />
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline text-xs">
                      <span className="text-white/40 font-mono">Goal Milestone</span>
                      <span className="text-white/80 font-mono">{result.goalReachedDate || 'Outside Horizon'}</span>
                    </div>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Scenario Parameter Editor */}
        <AnimatePresence>
          {editingScenario && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-elevated rounded-3xl p-6 border border-white/15 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-white flex items-center gap-2 text-base font-display">
                  <Zap className="w-4 h-4 text-[#00d4ff]" />
                  Adjust {state.scenarios.find(s => s.id === editingScenario)?.name} Temporal Variables
                </h3>
                <button onClick={() => setEditingScenario(null)} className="text-xs text-white/40 hover:text-white px-3 py-1 glass rounded-full">
                  Close Editor
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Monthly Income', field: 'avgMonthlyIncome' as const, prefix: '₹' },
                  { label: 'Income Volatility', field: 'incomeVolatility' as const, suffix: '%' },
                  { label: 'Expense Inflation', field: 'expenseInflation' as const, suffix: '%' },
                  { label: 'Monthly Savings', field: 'savingsContribution' as const, prefix: '₹' },
                  { label: 'Emergency Buffer', field: 'bufferPercentage' as const, suffix: '%' },
                  { label: 'Forecast Span', field: 'forecastMonths' as const, suffix: 'mo' },
                ].map(({ label, field, prefix, suffix }) => {
                  const scenario = state.scenarios.find(s => s.id === editingScenario);
                  if (!scenario) return null;
                  const value = scenario.assumptions[field] as number;
                  return (
                    <div key={field} className="glass p-3 rounded-2xl border border-white/5">
                      <label className="block text-[11px] text-white/40 mb-1.5 uppercase font-mono">{label}</label>
                      <div className="relative">
                        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-white/40 font-mono">{prefix}</span>}
                        <input
                          type="number"
                          value={value}
                          onChange={e => handleAssumptionChange(editingScenario, field, Number(e.target.value))}
                          className={`w-full py-2 rounded-xl text-xs font-mono font-bold text-white focus:outline-none bg-white/5 border border-white/10 ${prefix ? 'pl-7' : 'pl-3'} pr-8`}
                        />
                        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/40 font-mono">{suffix}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Forecast Chart */}
        {selectedResult && (
          <div className="glass-card rounded-3xl p-8 border border-white/10 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <p className="text-xs text-white/40 uppercase font-mono tracking-wider mb-1">Projected Timeline</p>
                <h3 className="text-2xl font-bold text-white font-display">
                  {selectedResult.scenarioName} Scenario Trajectory
                </h3>
              </div>
              <div className="glass px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-3">
                <div>
                  <p className="text-[10px] text-white/40 uppercase font-mono">Terminal Capital</p>
                  <p className="text-xl font-bold font-mono" style={{ color: state.scenarios.find(s => s.id === selectedResult.scenarioId)?.color }}>
                    <AnimatedCounter value={selectedResult.endingBalance} prefix="₹" decimals={0} />
                  </p>
                </div>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={selectedResult.periods} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                <defs>
                  <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={state.scenarios.find(s => s.id === selectedResult.scenarioId)?.color || '#7000FF'} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={state.scenarios.find(s => s.id === selectedResult.scenarioId)?.color || '#7000FF'} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(12, 12, 18, 0.95)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '16px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(20px)',
                  }}
                  labelStyle={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'JetBrains Mono', fontSize: '11px' }}
                  formatter={(value: number) => [`₹${value.toFixed(0)}`, '']}
                />
                <Area type="monotone" dataKey="cumulativeBalance" stroke={state.scenarios.find(s => s.id === selectedResult.scenarioId)?.color || '#7000FF'} strokeWidth={3} fill="url(#forecastGrad)" name="Total Balance" />
                <Line type="monotone" dataKey="savingsProgress" stroke="#00FFA3" strokeWidth={1.5} dot={false} name="Goal Allocation" strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Comparison & Key Drivers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card rounded-3xl p-6 border border-white/10">
            <p className="text-xs text-white/40 uppercase font-mono tracking-wider mb-4">Multiverse Comparison</p>
            <div className="space-y-3">
              {comparisons.map(comp => (
                <div key={comp.metric} className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-xs text-white/60 font-medium">{comp.metric}</span>
                  <div className="flex gap-4">
                    {comp.values.map(v => (
                      <span key={v.scenario} className="text-xs font-mono font-bold" style={{ color: state.scenarios.find(s => s.name === v.scenario)?.color }}>
                        {v.value}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6 border border-white/10">
            <p className="text-xs text-white/40 uppercase font-mono tracking-wider mb-4">Core Model Determinants</p>
            {selectedResult && (
              <div className="space-y-3">
                {selectedResult.keyDrivers.map((driver, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <TrendingUp className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: state.scenarios.find(s => s.id === selectedResult.scenarioId)?.color }} />
                    <span className="text-xs sm:text-sm text-white/80">{driver}</span>
                  </div>
                ))}
                <div className="pt-3 mt-3 border-t border-white/5">
                  <p className="text-xs text-white/40 flex items-start gap-2">
                    <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-cyan-400" />
                    {selectedResult.confidence}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Multi-scenario overlay */}
        {forecastResults.length > 1 && (
          <div className="glass-card rounded-3xl p-6 border border-white/10">
            <p className="text-xs text-white/40 uppercase font-mono tracking-wider mb-4">All Multiverse Timelines Overlay</p>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="period" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: 'rgba(12, 12, 18, 0.95)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px' }}
                  labelStyle={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'JetBrains Mono' }}
                  formatter={(value: number) => [`₹${value.toFixed(0)}`, '']}
                />
                <Legend />
                {forecastResults.map(r => {
                  const scenario = state.scenarios.find(s => s.id === r.scenarioId);
                  return (
                    <Line key={r.scenarioId} type="monotone" dataKey={`${r.scenarioName}_balance`}
                      stroke={scenario?.color || '#666'} strokeWidth={2.5} dot={false} name={r.scenarioName} />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
