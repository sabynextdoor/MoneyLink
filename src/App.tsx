import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppProvider, useAppState } from './store/AppContext';
import LandingPage from './components/landing/LandingPage';
import CommandCenter from './components/dashboard/CommandCenter';
import LuxuryTransactions from './components/LuxuryTransactions';
import LuxuryForecast from './components/LuxuryForecast';
import LuxuryGoals from './components/LuxuryGoals';
import LuxurySettings from './components/LuxurySettings';
import { themes } from './theme/theme';
import {
  LayoutDashboard, ArrowLeftRight, TrendingUp, Target,
  Settings, Home, ArrowLeft, Search, Command, Plus,
  Sparkles, CheckCircle2, ChevronRight, X, ArrowUpRight, Palette
} from 'lucide-react';

function AppContent() {
  const { state, dispatch, currentTheme, setTheme } = useAppState();
  const [currentView, setCurrentView] = useState<'landing' | 'app'>('landing');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'forecast' | 'goals' | 'settings'>('dashboard');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [paletteSearch, setPaletteSearch] = useState('');
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  const themeButtonRef = useRef<HTMLButtonElement>(null);

  // Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
        setIsThemeDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (themeButtonRef.current && !themeButtonRef.current.contains(e.target as Node)) {
        setIsThemeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEnterApp = () => {
    setCurrentView('app');
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
  };

  const navItems = [
    { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
    { id: 'forecast', label: 'Forecast', icon: TrendingUp },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'settings', label: 'Protocols', icon: Settings },
  ] as const;

  // Filtered command palette actions
  const paletteResults = [
    {
      group: 'Navigation',
      items: navItems.map(item => ({
        id: `nav-${item.id}`,
        title: `Go to ${item.label}`,
        subtitle: `Switch view to ${item.label}`,
        icon: item.icon,
        action: () => {
          setActiveTab(item.id);
          setIsCommandPaletteOpen(false);
        },
      })),
    },
    {
      group: 'Quick Actions',
      items: [
        {
          id: 'action-tx',
          title: 'View All Transactions',
          subtitle: 'Search & filter history or drop CSV',
          icon: ArrowLeftRight,
          action: () => {
            setActiveTab('transactions');
            setIsCommandPaletteOpen(false);
          },
        },
        {
          id: 'action-goals',
          title: 'Deposit into Savings Goals',
          subtitle: 'Fund laptop, emergency fund, or travel',
          icon: Target,
          action: () => {
            setActiveTab('goals');
            setIsCommandPaletteOpen(false);
          },
        },
        {
          id: 'action-forecast',
          title: 'Run Multiverse Forecast Simulation',
          subtitle: 'Test stipend adjustments and savings rates',
          icon: TrendingUp,
          action: () => {
            setActiveTab('forecast');
            setIsCommandPaletteOpen(false);
          },
        },
      ],
    },
  ];

  const searchFilteredGroups = paletteResults.map(group => ({
    ...group,
    items: group.items.filter(item =>
      item.title.toLowerCase().includes(paletteSearch.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(paletteSearch.toLowerCase())
    ),
  })).filter(g => g.items.length > 0);

  const renderContent = () => {
    if (currentView === 'landing') {
      return <LandingPage onEnterApp={handleEnterApp} />;
    }

    switch (activeTab) {
      case 'dashboard':
        return <CommandCenter onNavigate={(tab: any) => setActiveTab(tab)} />;
      case 'transactions':
        return <LuxuryTransactions />;
      case 'forecast':
        return <LuxuryForecast />;
      case 'goals':
        return <LuxuryGoals />;
      case 'settings':
        return <LuxurySettings />;
      default:
        return <CommandCenter onNavigate={(tab: any) => setActiveTab(tab)} />;
    }
  };

  // Get theme colors from the theme system
  const theme = themes[currentTheme];
  
  return (
    <div 
      className="min-h-screen selection:bg-cyan-500/30 selection:text-cyan-200 transition-colors duration-500"
      style={{
        background: theme.colors.background.primary,
        color: theme.colors.text.primary,
      }}
    >
      {/* Navigation Header */}
      <AnimatePresence mode="wait">
        {currentView === 'app' && (
          <motion.header
            key="app-nav"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 pt-4"
          >
            <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 p-2 rounded-2xl bg-black/60 backdrop-blur-2xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
              {/* Left Logo / Back to Landing */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBackToLanding}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-white/[0.06] text-white/50 hover:text-white transition-all text-xs font-medium"
                  title="Back to Landing Experience"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Home</span>
                </button>

                <div className="h-4 w-px bg-white/10 mx-1 hidden sm:block" />

                <div className="flex items-center gap-2 px-2 py-1">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#7000FF] to-[#00E5FF] flex items-center justify-center shadow-[0_0_12px_rgba(0,229,255,0.4)]">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="font-bold text-sm tracking-tight text-white hidden md:inline" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    CashLink
                  </span>
                </div>
              </div>

              {/* Center Navigation Tabs */}
              <nav className="flex items-center gap-1 overflow-x-auto custom-scrollbar py-0.5">
                {navItems.map(item => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`relative flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 shrink-0 ${
                        isActive ? 'text-white' : 'text-white/40 hover:text-white/80'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="nav-active-pill"
                          className="absolute inset-0 rounded-xl bg-white/[0.08] border border-white/[0.12] shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                        />
                      )}
                      <item.icon className={`w-3.5 h-3.5 relative z-10 ${isActive ? 'text-cyan-400' : ''}`} />
                      <span className="relative z-10 hidden sm:inline">{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Right Command Palette Shortcut & Theme Selector */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsCommandPaletteOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white/60 hover:text-white transition-all text-xs"
                >
                  <Search className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden lg:inline text-[11px] font-mono">Quick Search</span>
                  <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-mono bg-white/[0.08] px-1.5 py-0.5 rounded text-white/50 border border-white/[0.08]">
                    ⌘K
                  </kbd>
                </button>

                {/* Theme Selector Button */}
                <div className="relative">
                  <button
                    ref={themeButtonRef}
                    onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white/60 hover:text-white transition-all text-xs"
                    title={`Current theme: ${currentTheme}`}
                  >
                    <Palette className="w-3.5 h-3.5 text-purple-400" />
                    <span className="hidden lg:inline text-[11px] font-mono capitalize">{currentTheme}</span>
                  </button>

                  {/* Theme Dropdown */}
                  {isThemeDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.96 }}
                      className="absolute right-0 top-full mt-2 w-64 rounded-2xl border shadow-2xl overflow-hidden z-50"
                      style={{
                        background: theme.colors.background.elevated,
                        borderColor: theme.colors.border.medium,
                      }}
                    >
                      <div 
                        className="p-3 border-b flex items-center gap-2"
                        style={{
                          borderColor: theme.colors.border.subtle,
                          background: theme.colors.glass.bg,
                        }}
                      >
                        <Palette className="w-3.5 h-3.5" style={{ color: theme.colors.accent.primary }} />
                        <h4 className="text-xs font-semibold" style={{ color: theme.colors.text.primary }}>
                          Select Theme
                        </h4>
                      </div>

                      <div className="p-2 space-y-1">
                        {(Object.keys(themes) as Array<keyof typeof themes>).map((themeId) => {
                          const isActive = currentTheme === themeId;
                          const t = themes[themeId];
                          const themeNames: Record<string, string> = {
                            midnight: 'Midnight Void',
                            cyberpunk: 'Cyberpunk Neon',
                            light: 'Clean Light',
                            forest: 'Forest Mist',
                            ocean: 'Ocean Depths',
                            sunset: 'Sunset Glow',
                            monochrome: 'Monochrome',
                          };
                          const themeDescs: Record<string, string> = {
                            midnight: 'Deep space darkness with cyan accents',
                            cyberpunk: 'High contrast neon with purple and pink',
                            light: 'Minimalist light theme with blue accents',
                            forest: 'Natural green tones with earth accents',
                            ocean: 'Deep blue gradients with teal highlights',
                            sunset: 'Warm orange and pink gradients',
                            monochrome: 'Pure grayscale elegance',
                          };

                          return (
                            <button
                              key={themeId}
                              onClick={() => {
                                setTheme(themeId);
                                setIsThemeDropdownOpen(false);
                              }}
                              className="w-full flex items-center justify-between p-3 rounded-xl transition-all group"
                              style={{
                                background: isActive ? `${t.colors.accent.primary}1a` : 'transparent',
                                border: isActive ? `1px solid ${t.colors.accent.primary}4d` : '1px solid transparent',
                              }}
                              onMouseEnter={(e) => {
                                if (!isActive) {
                                  e.currentTarget.style.background = theme.colors.glass.bgHover;
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isActive) {
                                  e.currentTarget.style.background = 'transparent';
                                }
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-8 h-8 rounded-lg border"
                                  style={{
                                    background: `linear-gradient(135deg, ${t.colors.accent.primary} 0%, ${t.colors.accent.secondary} 100%)`,
                                    borderColor: theme.colors.border.subtle,
                                  }}
                                />
                                <div className="text-left">
                                  <div 
                                    className="text-xs font-semibold"
                                    style={{ color: isActive ? t.colors.accent.primary : theme.colors.text.primary }}
                                  >
                                    {themeNames[themeId]}
                                  </div>
                                  <div className="text-[10px]" style={{ color: theme.colors.text.muted }}>
                                    {themeDescs[themeId]}
                                  </div>
                                </div>
                              </div>
                              {isActive && (
                                <CheckCircle2 className="w-4 h-4" style={{ color: t.colors.accent.primary }} />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      <div 
                        className="p-3 border-t"
                        style={{
                          background: theme.colors.glass.bg,
                          borderColor: theme.colors.border.subtle,
                        }}
                      >
                        <p className="text-[10px] text-center" style={{ color: theme.colors.text.muted }}>
                          Theme auto-saves to localStorage
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Main View Container with Fluid Spring Transitions */}
      <AnimatePresence mode="wait">
        <motion.main
          key={currentView === 'landing' ? 'landing' : activeTab}
          initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          {renderContent()}
        </motion.main>
      </AnimatePresence>

      {/* Command Palette Modal (Cmd+K) */}
      <AnimatePresence>
        {isCommandPaletteOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCommandPaletteOpen(false)}
            className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/80 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: -10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: -10 }}
              transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-xl rounded-2xl bg-[#0e0e12] border border-white/[0.12] shadow-[0_25px_70px_rgba(0,0,0,0.8)] overflow-hidden"
            >
              {/* Search input header */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.08] bg-white/[0.02]">
                <Search className="w-4 h-4 text-cyan-400 shrink-0" />
                <input
                  type="text"
                  autoFocus
                  value={paletteSearch}
                  onChange={e => setPaletteSearch(e.target.value)}
                  placeholder="Type a command or jump to view..."
                  className="w-full bg-transparent text-sm text-white placeholder-white/30 focus:outline-none font-medium"
                />
                <button
                  onClick={() => setIsCommandPaletteOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/[0.06] text-white/40 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Command suggestions list */}
              <div className="max-h-80 overflow-y-auto p-2 space-y-3 custom-scrollbar">
                {searchFilteredGroups.length === 0 ? (
                  <div className="text-center py-8 text-white/30 text-xs font-mono">
                    No commands matching "{paletteSearch}"
                  </div>
                ) : (
                  searchFilteredGroups.map((group, gIdx) => (
                    <div key={gIdx} className="space-y-1">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-white/30 px-3 py-1">
                        {group.group}
                      </div>
                      {group.items.map(item => (
                        <button
                          key={item.id}
                          onClick={item.action}
                          className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.05] border border-transparent hover:border-white/[0.06] text-left transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center group-hover:border-cyan-400/30 group-hover:bg-cyan-500/10 transition-colors">
                              <item.icon className="w-3.5 h-3.5 text-white/60 group-hover:text-cyan-400" />
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors">
                                {item.title}
                              </div>
                              <div className="text-[11px] text-white/40">{item.subtitle}</div>
                            </div>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-white/20 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                        </button>
                      ))}
                    </div>
                  ))
                )}
              </div>

              {/* Footer shortcuts */}
              <div className="flex items-center justify-between px-4 py-2 bg-black/40 border-t border-white/[0.06] text-[10px] font-mono text-white/30">
                <div className="flex items-center gap-2">
                  <span>Navigation: <kbd className="px-1 py-0.5 bg-white/[0.05] rounded text-white/50">↑↓</kbd></span>
                  <span>Select: <kbd className="px-1 py-0.5 bg-white/[0.05] rounded text-white/50">↵</kbd></span>
                </div>
                <div>
                  <kbd className="px-1 py-0.5 bg-white/[0.05] rounded text-white/50">ESC</kbd> to close
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

