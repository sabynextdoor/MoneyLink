import React, { useState } from 'react';
import {
  LayoutDashboard, ArrowLeftRight, TrendingUp, Target,
  Settings, Menu, X, Sparkles, Shield
} from 'lucide-react';

interface LuxuryNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  alertCount: number;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
  { id: 'forecast', label: 'Forecast', icon: TrendingUp },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function LuxuryNav({ activeTab, onTabChange, alertCount }: LuxuryNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Disclaimer Banner */}
      <div className="fixed top-0 left-0 right-0 z-50 py-2 px-4 text-center"
        style={{ background: 'linear-gradient(90deg, rgba(255, 138, 0, 0.1) 0%, rgba(255, 42, 109, 0.05) 50%, rgba(255, 138, 0, 0.1) 100%)', borderBottom: '1px solid rgba(255, 138, 0, 0.2)' }}>
        <div className="flex items-center justify-center gap-2 text-xs text-amber-200/80">
          <Shield className="w-3 h-3" />
          <span>Educational Tool Only — Not Financial Advice — Synthetic Data Only</span>
        </div>
      </div>

      {/* Floating Glass Capsule Navigation */}
      <nav className="fixed top-12 left-1/2 -translate-x-1/2 z-40 hidden md:block">
        <div className="glass rounded-full px-2 py-2 flex items-center gap-1 shadow-2xl"
          style={{
            background: 'rgba(10, 10, 15, 0.8)',
            backdropFilter: 'blur(40px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
          }}>
          
          {/* Logo */}
          <div className="flex items-center gap-2 px-3 py-1.5 mr-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7000FF 0%, #00E5FF 100%)' }}>
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-white hidden lg:block" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              CashFlow
            </span>
          </div>

          {/* Separator */}
          <div className="w-px h-6 bg-white/10 mx-1" />

          {/* Nav Items */}
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 ${
                activeTab === item.id
                  ? 'text-white'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              {activeTab === item.id && (
                <div className="absolute inset-0 rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, rgba(112, 0, 255, 0.3) 0%, rgba(0, 229, 255, 0.2) 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                />
              )}
              <item.icon className="w-3.5 h-3.5 relative z-10" />
              <span className="relative z-10 hidden lg:inline">{item.label}</span>
              {item.id === 'transactions' && alertCount > 0 && (
                <span className="relative z-10 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold">
                  {alertCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="fixed top-12 left-4 right-4 z-40 md:hidden">
        <div className="glass rounded-2xl px-4 py-3 flex items-center justify-between"
          style={{ background: 'rgba(10, 10, 15, 0.9)', backdropFilter: 'blur(40px)' }}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7000FF 0%, #00E5FF 100%)' }}>
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              CashFlow
            </span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="mt-2 glass rounded-2xl p-2 space-y-1"
            style={{ background: 'rgba(10, 10, 15, 0.95)', backdropFilter: 'blur(40px)' }}>
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => { onTabChange(item.id); setMobileMenuOpen(false); }}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === item.id
                    ? 'text-white'
                    : 'text-white/50 hover:text-white/80'
                }`}
                style={activeTab === item.id ? { background: 'linear-gradient(135deg, rgba(112, 0, 255, 0.2) 0%, rgba(0, 229, 255, 0.1) 100%)' } : {}}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
