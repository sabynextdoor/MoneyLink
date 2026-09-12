import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppState } from '../store/AppContext';
import { CATEGORIES, CategoryRule } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { generateSampleCSV } from '../engine/syntheticData';
import {
  Settings as SettingsIcon, Plus, Trash2, Download, RefreshCw, Shield,
  Clock, Eye, Zap, CheckCircle2, Sparkles, Filter, Search, Terminal,
  Cpu, Database, Cloud, FileCode, ChevronRight, X
} from 'lucide-react';
import { SpotlightCard, LuxurySelect } from './ui/LuxuryComponents';

export default function LuxurySettings() {
  const { state, dispatch, addAuditEvent } = useAppState();
  const [activeSection, setActiveSection] = useState<'rules' | 'audit' | 'architecture'>('rules');
  const [showAddRule, setShowAddRule] = useState(false);
  const [auditFilter, setAuditFilter] = useState<'ALL' | 'CREATE' | 'UPDATE' | 'DELETE' | 'RESET' | 'TOGGLE'>('ALL');
  const [testDescription, setTestDescription] = useState('Swiggy gourmet dinner delivery');
  const [testAmount, setTestAmount] = useState('450');

  const handleToggleRule = (ruleId: string, enabled: boolean) => {
    dispatch({ type: 'UPDATE_RULE', payload: { id: ruleId, updates: { enabled } } });
    addAuditEvent('TOGGLE', 'RULE', ruleId, `Rule ${enabled ? 'enabled' : 'disabled'}`);
  };

  const handleDeleteRule = (ruleId: string) => {
    dispatch({ type: 'DELETE_RULE', payload: ruleId });
    addAuditEvent('DELETE', 'RULE', ruleId, 'Rule deleted');
  };

  const handleDownloadSampleCSV = () => {
    const csv = generateSampleCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-transactions.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetData = () => {
    if (window.confirm('Reset all transactions and goals to fresh sample data?')) {
      dispatch({ type: 'RESET_DATA' });
      addAuditEvent('RESET', 'SYSTEM', 'all', 'Data reset to synthetic snapshot');
    }
  };

  // Live Rule Tester Engine
  const testMatchResult = useMemo(() => {
    const activeRules = [...state.categoryRules]
      .filter(r => r.enabled)
      .sort((a, b) => a.priority - b.priority);

    const descLower = testDescription.toLowerCase();
    const amt = parseFloat(testAmount) || 0;

    for (const rule of activeRules) {
      if (rule.matchType === 'description_keyword' && descLower.includes(rule.matchValue.toLowerCase())) {
        return { matched: true, rule, reason: `Matched keyword "${rule.matchValue}" in description` };
      }
      if (rule.matchType === 'merchant' && descLower.includes(rule.matchValue.toLowerCase())) {
        return { matched: true, rule, reason: `Matched merchant tag "${rule.matchValue}"` };
      }
      if (rule.matchType === 'regex') {
        try {
          const reg = new RegExp(rule.matchValue, 'i');
          if (reg.test(testDescription)) {
            return { matched: true, rule, reason: `Matched regex pattern /${rule.matchValue}/i` };
          }
        } catch {
          // ignore regex syntax errors
        }
      }
    }
    return { matched: false, rule: null, reason: 'Fallback to default category "Other"' };
  }, [testDescription, testAmount, state.categoryRules]);

  const filteredAuditLog = useMemo(() => {
    if (auditFilter === 'ALL') return state.auditLog;
    return state.auditLog.filter(item => item.action.toUpperCase() === auditFilter);
  }, [state.auditLog, auditFilter]);

  return (
    <div className="relative min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto space-y-10">
      {/* Background Ambience */}
      <div className="fixed inset-0 grid-pattern opacity-20 pointer-events-none" />
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-[#7000FF]/10 via-[#00E5FF]/5 to-transparent blur-[140px] pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-medium text-cyan-400 mb-3">
            <SettingsIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span>Autonomous Engine & Protocol Configuration</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            System <span className="text-gradient-cyan">Protocols</span>
          </h1>
          <p className="text-sm text-white/50 max-w-xl mt-2">
            Configure automated transaction categorization heuristics, inspect immutable audit telemetry, and review privacy isolation guarantees.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleDownloadSampleCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white/80 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/20 transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            Download Sample CSV
          </button>
          <button
            onClick={handleResetData}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset State
          </button>
        </div>
      </div>

      {/* Navigation Pills */}
      <div className="relative z-10 flex gap-2 p-1.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl w-fit">
        {[
          { id: 'rules', label: 'Categorization Rules', icon: FileCode, count: state.categoryRules.length },
          { id: 'audit', label: 'Audit Trail', icon: Clock, count: state.auditLog.length },
          { id: 'architecture', label: 'Cloud Architecture & Privacy', icon: Cloud },
        ].map(tab => {
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                isActive ? 'text-white' : 'text-white/40 hover:text-white/70'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="settings-tab-pill"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 shadow-[0_0_15px_rgba(0,229,255,0.15)]"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <tab.icon className={`w-3.5 h-3.5 relative z-10 ${isActive ? 'text-cyan-400' : ''}`} />
              <span className="relative z-10">{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`relative z-10 text-[10px] px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-cyan-400/20 text-cyan-300' : 'bg-white/[0.06] text-white/40'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* RULES SECTION */}
      {activeSection === 'rules' && (
        <div className="relative z-10 space-y-8">
          {/* Live Heuristic Tester */}
          <SpotlightCard className="p-6 sm:p-8 rounded-3xl border border-white/[0.08] bg-black/40 backdrop-blur-xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  <Terminal className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    Live Rule Simulator
                  </h3>
                  <p className="text-xs text-white/50">Test how incoming transaction payloads are matched against prioritized heuristics.</p>
                </div>
              </div>
              <span className="text-[11px] font-mono text-cyan-400/80 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full">
                Deterministic Resolution
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-6">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-white/40 mb-1.5">
                  Simulated Transaction Description
                </label>
                <input
                  type="text"
                  value={testDescription}
                  onChange={(e) => setTestDescription(e.target.value)}
                  placeholder="e.g. Swiggy order, Spotify family, Campus cafeteria"
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white placeholder-white/20 text-sm focus:outline-none focus:border-cyan-400/50 transition-colors"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-white/40 mb-1.5">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  value={testAmount}
                  onChange={(e) => setTestAmount(e.target.value)}
                  placeholder="450"
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white placeholder-white/20 text-sm focus:outline-none focus:border-cyan-400/50 transition-colors font-mono"
                />
              </div>

              <div className="md:col-span-4 flex flex-col justify-center">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-white/40 mb-1.5">
                  Matched Category Resolution
                </label>
                <div className={`px-4 py-3 rounded-xl border flex items-center justify-between transition-all ${
                  testMatchResult.matched
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-white/[0.03] border-white/[0.08] text-white/60'
                }`}>
                  <div className="flex items-center gap-2 truncate">
                    <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="font-bold text-sm tracking-tight text-white">
                      {testMatchResult.matched ? testMatchResult.rule?.category : 'Other'}
                    </span>
                  </div>
                  {testMatchResult.matched && (
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 shrink-0">
                      Rule #{testMatchResult.rule?.priority}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <p className="text-xs text-white/40 mt-3 flex items-center gap-1.5 font-mono">
              <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
              <span>{testMatchResult.reason}</span>
            </p>
          </SpotlightCard>

          {/* Rules List Card */}
          <SpotlightCard className="p-6 sm:p-8 rounded-3xl border border-white/[0.08] bg-black/40 backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  Active Category Heuristics
                </h3>
                <p className="text-xs text-white/50 mt-0.5">Rules are evaluated sequentially in ascending priority order.</p>
              </div>

              <button
                onClick={() => setShowAddRule(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#7000FF] to-[#00E5FF] hover:opacity-90 shadow-[0_0_20px_rgba(0,229,255,0.2)] transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Add New Rule
              </button>
            </div>

            <div className="space-y-2.5">
              {state.categoryRules.sort((a, b) => a.priority - b.priority).map(rule => {
                const isTesterMatch = testMatchResult.matched && testMatchResult.rule?.id === rule.id;
                return (
                  <motion.div
                    key={rule.id}
                    layout
                    className={`flex items-center gap-4 p-3.5 sm:p-4 rounded-2xl transition-all duration-200 ${
                      isTesterMatch
                        ? 'bg-cyan-500/10 border-cyan-500/40 shadow-[0_0_20px_rgba(0,229,255,0.15)]'
                        : rule.enabled
                          ? 'bg-white/[0.02] hover:bg-white/[0.04] border-white/[0.06]'
                          : 'bg-white/[0.01] opacity-40 border-white/[0.03]'
                    } border`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0">
                      <span className="text-xs font-mono font-bold text-white/60">#{rule.priority}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-sm text-white">{rule.name}</span>
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-white/[0.06] text-white/60">
                          {rule.matchType.replace('_', ' ')}
                        </span>
                        {isTesterMatch && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 font-bold animate-pulse">
                            ACTIVE MATCH
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-white/40 mt-1 flex items-center gap-2 font-mono">
                        <code className="text-cyan-300/80 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-500/20">{rule.matchValue}</code>
                        <span>→</span>
                        <span className="text-purple-300 font-medium">{rule.category}</span>
                      </div>
                    </div>

                    {/* Enable Toggle Switch */}
                    <div className="flex items-center gap-3">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rule.enabled}
                          onChange={e => handleToggleRule(rule.id, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-cyan-400" />
                      </label>

                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        className="p-2 rounded-xl text-white/30 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete Rule"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </SpotlightCard>

          {/* Add Rule Dialog Modal */}
          <AnimatePresence>
            {showAddRule && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
              >
                <motion.div
                  initial={{ scale: 0.95, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.95, y: 20 }}
                  className="w-full max-w-lg"
                >
                  <AddRuleForm onClose={() => setShowAddRule(false)} />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* AUDIT TRAIL SECTION */}
      {activeSection === 'audit' && (
        <SpotlightCard className="relative z-10 p-6 sm:p-8 rounded-3xl border border-white/[0.08] bg-black/40 backdrop-blur-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Immutable Audit Trail
              </h3>
              <p className="text-xs text-white/50 mt-0.5">Cryptographically logged events for all mutations affecting cashflow and goal telemetry.</p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              {(['ALL', 'CREATE', 'UPDATE', 'DELETE', 'TOGGLE', 'RESET'] as const).map(flt => (
                <button
                  key={flt}
                  onClick={() => setAuditFilter(flt)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-colors ${
                    auditFilter === flt ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-white/40 hover:text-white'
                  }`}
                >
                  {flt}
                </button>
              ))}
            </div>
          </div>

          {filteredAuditLog.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl">
              <Clock className="w-10 h-10 text-white/20 mx-auto mb-3" />
              <p className="text-sm text-white/50">No audit events match the active filter criteria.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredAuditLog.map(event => {
                const actionBadgeColor =
                  event.action === 'CREATE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                  event.action === 'DELETE' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                  event.action === 'RESET' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                  'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';

                return (
                  <div
                    key={event.id}
                    className="flex items-start gap-4 p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04] transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2 shrink-0 shadow-[0_0_8px_rgba(0,229,255,0.8)]" />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${actionBadgeColor}`}>
                          {event.action}
                        </span>
                        <span className="text-xs font-semibold text-white/80">{event.entityType}</span>
                        <span className="text-[10px] font-mono text-white/30 ml-auto">
                          {new Date(event.timestamp).toLocaleString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-white/60 mt-1 font-mono">{event.details}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SpotlightCard>
      )}

      {/* ARCHITECTURE & PRIVACY SECTION */}
      {activeSection === 'architecture' && (
        <div className="relative z-10 space-y-8">
          <SpotlightCard className="p-6 sm:p-8 rounded-3xl border border-white/[0.08] bg-black/40 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  Educational Privacy & Zero-Knowledge Architecture
                </h3>
                <p className="text-xs text-white/50">Designed exclusively for university students and young adults.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'Zero Bank Credentials Required', desc: 'No Plaid or OAuth bank linking. You operate purely on synthetic data or manual CSV statement drops.' },
                { title: 'Local Client State Persistence', desc: 'All state is stored securely in your browser session with instantaneous in-memory reactivity.' },
                { title: 'Deterministic Forecasting', desc: 'Linear regression with seasonal weighting. No unpredictable black-box hallucinations.' },
                { title: 'Real-time What-If Sandbox', desc: 'Simulate stipend hikes or expense cuts safely without altering actual historical ledger.' },
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-white">{item.title}</h4>
                    <p className="text-xs text-white/50 mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </SpotlightCard>

          <SpotlightCard className="p-6 sm:p-8 rounded-3xl border border-white/[0.08] bg-black/40 backdrop-blur-xl">
            <h3 className="text-lg font-bold text-white tracking-tight mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              AWS Serverless Reference Specification
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-orange-500/[0.05] border border-orange-500/20">
                <div className="flex items-center gap-2 text-orange-400 font-mono font-bold text-xs uppercase mb-2">
                  <Cpu className="w-4 h-4" />
                  AWS Lambda
                </div>
                <h4 className="font-bold text-sm text-white">Event Ingestion Engine</h4>
                <p className="text-xs text-white/40 mt-1">Parses multi-format CSV files and runs heuristic classification at sub-millisecond speeds.</p>
              </div>

              <div className="p-5 rounded-2xl bg-cyan-500/[0.05] border border-cyan-500/20">
                <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold text-xs uppercase mb-2">
                  <Database className="w-4 h-4" />
                  Amazon DynamoDB
                </div>
                <h4 className="font-bold text-sm text-white">Single-Digit Latency</h4>
                <p className="text-xs text-white/40 mt-1">Partitioned by student account ID with sub-second retrieval of temporal cashflow matrices.</p>
              </div>

              <div className="p-5 rounded-2xl bg-purple-500/[0.05] border border-purple-500/20">
                <div className="flex items-center gap-2 text-purple-400 font-mono font-bold text-xs uppercase mb-2">
                  <Cloud className="w-4 h-4" />
                  Amazon S3 & CloudFront
                </div>
                <h4 className="font-bold text-sm text-white">Edge Acceleration</h4>
                <p className="text-xs text-white/40 mt-1">Static client hosting with globally distributed edge nodes for instant responsiveness.</p>
              </div>
            </div>
          </SpotlightCard>
        </div>
      )}
    </div>
  );
}

function AddRuleForm({ onClose }: { onClose: () => void }) {
  const { state, dispatch, addAuditEvent } = useAppState();
  const [form, setForm] = useState({
    name: '',
    matchType: 'description_keyword' as CategoryRule['matchType'],
    matchValue: '',
    category: 'Other',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.matchValue) return;

    const rule: CategoryRule = {
      id: uuidv4(),
      name: form.name,
      priority: state.categoryRules.length + 1,
      matchType: form.matchType,
      matchValue: form.matchValue,
      category: form.category,
      enabled: true,
      description: form.description || `Rule match on ${form.matchValue}`,
    };
    dispatch({ type: 'ADD_RULE', payload: rule });
    addAuditEvent('CREATE', 'RULE', rule.id, `Created heuristic rule: ${rule.name}`);
    onClose();
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl border border-white/[0.12] bg-[#0d0d0f] shadow-2xl relative">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <Plus className="w-4 h-4 text-cyan-400" />
          </div>
          <h4 className="text-lg font-bold text-white tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            New Categorization Rule
          </h4>
        </div>
        <button onClick={onClose} className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/[0.05]">
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-white/40 mb-1.5">Rule Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Zomato / Swiggy"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white text-sm focus:outline-none focus:border-cyan-400/50"
            />
          </div>

          <div>
            <LuxurySelect
              label="Match Type"
              value={form.matchType}
              onChange={val => setForm({ ...form, matchType: val as any })}
              options={[
                { value: 'description_keyword', label: 'Keyword Match' },
                { value: 'merchant', label: 'Merchant Tag' },
                { value: 'regex', label: 'RegEx Pattern' },
              ]}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-white/40 mb-1.5">Match Expression</label>
            <input
              type="text"
              required
              placeholder="e.g. swiggy or zomato"
              value={form.matchValue}
              onChange={e => setForm({ ...form, matchValue: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-white text-sm focus:outline-none focus:border-cyan-400/50 font-mono"
            />
          </div>

          <div>
            <LuxurySelect
              label="Assign Category"
              value={form.category}
              onChange={val => setForm({ ...form, category: val })}
              options={CATEGORIES}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.06]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white/50 hover:text-white rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 text-xs font-bold text-white rounded-xl bg-gradient-to-r from-purple-500 to-cyan-400 hover:opacity-95 shadow-[0_0_15px_rgba(0,229,255,0.2)]"
          >
            Deploy Rule
          </button>
        </div>
      </form>
    </div>
  );
}

