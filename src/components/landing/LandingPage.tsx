import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Sparkles, TrendingUp, Shield, Zap, Target,
  ChevronDown, Layers, Play, CheckCircle2, Sliders, ArrowUpRight
} from 'lucide-react';

// ============================================================================
// CINEMATIC LUXURY LANDING PAGE
// Scroll-driven storytelling: Chaos → Clarity → Understanding → Simulator → Action
// ============================================================================

export default function LandingPage({ onEnterApp }: { onEnterApp: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      });
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  return (
    <div ref={containerRef} className="relative bg-[#0a0a0a] overflow-x-hidden">
      {/* Ambient Background */}
      <AmbientBackground mousePos={mousePos} />
      
      {/* HERO SECTION */}
      <HeroSection onEnterApp={onEnterApp} scrollProgress={scrollYProgress} mousePos={mousePos} />
      
      {/* LIVE STATS STRIP */}
      <StatsBanner />

      {/* SCROLL STORYTELLING SECTIONS */}
      <ChaosSection scrollProgress={scrollYProgress} />
      <OrganizationSection scrollProgress={scrollYProgress} />
      <InsightSection scrollProgress={scrollYProgress} />
      
      {/* INTERACTIVE PLAYGROUND SIMULATOR */}
      <InteractiveSimulator onEnterApp={onEnterApp} />

      <ForecastSection scrollProgress={scrollYProgress} />
      
      {/* FINAL CTA */}
      <FinalCTA onEnterApp={onEnterApp} />
    </div>
  );
}

// ============================================================================
// AMBIENT BACKGROUND
// ============================================================================
function AmbientBackground({ mousePos }: { mousePos: { x: number; y: number } }) {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Gradient orbs that follow mouse */}
      <div
        className="absolute w-[800px] h-[800px] rounded-full opacity-[0.08] blur-[140px] transition-transform duration-[2000ms]"
        style={{
          background: 'radial-gradient(circle, #00d084 0%, transparent 70%)',
          top: '10%',
          left: '20%',
          transform: `translate(${mousePos.x * 35}px, ${mousePos.y * 35}px)`,
        }}
      />
      <div
        className="absolute w-[700px] h-[700px] rounded-full opacity-[0.07] blur-[130px] transition-transform duration-[2500ms]"
        style={{
          background: 'radial-gradient(circle, #00d4ff 0%, transparent 70%)',
          top: '35%',
          right: '10%',
          transform: `translate(${mousePos.x * -30}px, ${mousePos.y * -30}px)`,
        }}
      />
      <div
        className="absolute w-[600px] h-[600px] rounded-full opacity-[0.05] blur-[110px] transition-transform duration-[3000ms]"
        style={{
          background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)',
          bottom: '10%',
          left: '35%',
          transform: `translate(${mousePos.x * 20}px, ${mousePos.y * 20}px)`,
        }}
      />
      
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)
          `,
          backgroundSize: '70px 70px',
        }}
      />
    </div>
  );
}

// ============================================================================
// STATS BANNER
// ============================================================================
function StatsBanner() {
  const stats = [
    { label: 'Synthetic Speed', value: '100%', sub: 'Privacy First' },
    { label: 'Integrity Check', value: 'Zero', sub: 'Silent Errors' },
    { label: 'Multiverse Timelines', value: '3+', sub: 'Parallel Scenarios' },
    { label: 'Target Accuracy', value: '99.4%', sub: 'Explainable Logic' },
  ];

  return (
    <div className="relative z-10 max-w-6xl mx-auto px-6 py-6 my-4">
      <div className="glass-card rounded-3xl p-6 grid grid-cols-2 md:grid-cols-4 gap-6 border border-white/10">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.6 }}
            className="text-center"
          >
            <p className="font-mono text-2xl md:text-3xl font-bold text-white tracking-tight">{stat.value}</p>
            <p className="text-xs font-medium text-white/70 mt-1">{stat.label}</p>
            <p className="text-[10px] text-white/30 uppercase tracking-wider">{stat.sub}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// HERO SECTION
// ============================================================================
function HeroSection({ onEnterApp, scrollProgress, mousePos }: any) {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleOpacity = useTransform(scrollProgress, [0, 0.15], [1, 0]);
  const titleY = useTransform(scrollProgress, [0, 0.15], [0, -90]);
  const titleScale = useTransform(scrollProgress, [0, 0.15], [1, 0.92]);
  
  return (
    <motion.section
      ref={heroRef}
      style={{ opacity: titleOpacity, y: titleY, scale: titleScale }}
      className="relative min-h-[92vh] flex flex-col items-center justify-center px-6 z-10 pt-16 pb-12"
    >
      {/* Top nav hint */}
      <div className="absolute top-6 left-0 right-0 flex items-center justify-between px-6 md:px-12 z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg, #00d084 0%, #00d4ff 100%)' }}>
            <TrendingUp className="w-5 h-5 text-black font-bold" />
          </div>
          <div>
            <span className="font-display text-base text-white font-bold tracking-tight block">CashLink</span>
            <span className="text-[9px] text-white/40 uppercase tracking-widest font-mono">Spatial Intelligence</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs text-white/50">
            <Shield className="w-3.5 h-3.5 text-[#00d084]" />
            <span>Zero Real Bank Access Required</span>
          </div>
          <button
            onClick={onEnterApp}
            className="text-xs px-4 py-2 rounded-full glass hover:bg-white/10 text-white font-medium transition-all"
          >
            Launch App →
          </button>
        </div>
      </div>

      {/* Main Hero Typography */}
      <div className="text-center max-w-6xl mx-auto mt-8">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mb-8 flex items-center justify-center gap-3"
        >
          <div className="h-px w-10 bg-gradient-to-r from-transparent to-[#00d4ff]" />
          <span className="text-xs uppercase tracking-[0.3em] text-[#00d4ff] font-semibold">
            Spatial Financial Intelligence
          </span>
          <div className="h-px w-10 bg-gradient-to-l from-transparent to-[#00d4ff]" />
        </motion.div>

        {/* Main headline */}
        <div className="overflow-hidden">
          <motion.h1
            initial={{ y: 90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-[clamp(3.2rem,11vw,9.5rem)] leading-[0.88] tracking-tight text-white font-extrabold"
            style={{
              transform: `translate(${mousePos.x * 6}px, ${mousePos.y * 6}px)`,
              transition: 'transform 0.4s ease-out',
            }}
          >
            YOUR MONEY
          </motion.h1>
        </div>
        <div className="overflow-hidden mt-2">
          <motion.h1
            initial={{ y: 90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-[clamp(3.2rem,11vw,9.5rem)] leading-[0.88] tracking-tight font-extrabold"
          >
            <span className="text-gradient-cyan">HAS A STORY.</span>
          </motion.h1>
        </div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="mt-8 text-base md:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed font-normal"
        >
          Trace every rupee from source to savings. Test future financial multiverses in real-time, simulate your goals, and master cash flow velocity.
        </motion.p>

        {/* CTA Button Group */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={onEnterApp}
            className="group relative inline-flex items-center gap-3 px-9 py-4 rounded-full overflow-hidden transition-all duration-500 cursor-pointer shadow-xl hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #00d4ff 0%, #00d084 100%)',
              boxShadow: '0 0 50px rgba(0, 212, 255, 0.35)',
            }}
          >
            <span className="relative z-10 font-bold text-black text-sm tracking-wide">Enter Command Center</span>
            <ArrowRight className="relative z-10 w-4 h-4 text-black transition-transform duration-300 group-hover:translate-x-1.5" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#00d084] to-[#00d4ff] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </button>

          <a
            href="#simulator"
            className="inline-flex items-center gap-2 px-7 py-4 rounded-full glass hover:bg-white/10 text-white/80 hover:text-white text-sm font-medium transition-all"
          >
            <Play className="w-3.5 h-3.5 text-[#00d4ff]" />
            <span>Interactive Simulator</span>
          </a>
        </motion.div>
      </div>

      {/* Floating transaction previews */}
      <FloatingTransactions />
    </motion.section>
  );
}

// ============================================================================
// FLOATING TRANSACTIONS (Hero decoration)
// ============================================================================
function FloatingTransactions() {
  const transactions = [
    { name: 'Swiggy Food', amount: '-₹320', category: 'Dining', color: '#ff6b6b' },
    { name: 'Campus Internship', amount: '+₹15,000', category: 'Income', color: '#00d084' },
    { name: 'Netflix Premium', amount: '-₹649', category: 'Entertainment', color: '#a855f7' },
    { name: 'Uber Campus Ride', amount: '-₹240', category: 'Transit', color: '#00d4ff' },
    { name: 'Bookstore', amount: '-₹899', category: 'Study', color: '#ff8e53' },
    { name: 'Freelance Design', amount: '+₹7,500', category: 'Income', color: '#00d084' },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {transactions.map((txn, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: [0, 0.45, 0.45, 0],
            scale: [0.8, 1, 1, 0.9],
            y: [0, -25, -25, -50],
          }}
          transition={{
            duration: 9,
            delay: i * 1.4 + 1.8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute glass-card rounded-2xl px-4 py-2.5 border border-white/10 shadow-lg"
          style={{
            left: `${12 + (i * 14) % 75}%`,
            top: `${18 + (i * 16) % 65}%`,
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: txn.color, boxShadow: `0 0 10px ${txn.color}` }} />
            <span className="text-xs text-white/70 font-medium">{txn.name}</span>
            <span className="text-xs font-mono font-bold" style={{ color: txn.color }}>{txn.amount}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ============================================================================
// CHAOS SECTION — Scattered transactions
// ============================================================================
function ChaosSection({ scrollProgress }: any) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  
  const opacity = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], [80, 0, 0, -80]);

  const scatteredTransactions = [
    { name: 'Swiggy', amount: '₹320', x: 8, y: 15, rotation: -12 },
    { name: 'Zomato', amount: '₹450', x: 75, y: 12, rotation: 8 },
    { name: 'Netflix', amount: '₹649', x: 18, y: 55, rotation: -6 },
    { name: 'Spotify', amount: '₹119', x: 68, y: 65, rotation: 14 },
    { name: 'Amazon', amount: '₹899', x: 38, y: 25, rotation: -7 },
    { name: 'Uber Ride', amount: '₹240', x: 82, y: 45, rotation: 10 },
    { name: 'Hostel Cafe', amount: '₹180', x: 28, y: 78, rotation: -14 },
    { name: 'Textbooks', amount: '₹2,000', x: 52, y: 18, rotation: 6 },
  ];

  return (
    <section ref={sectionRef} className="relative min-h-[85vh] flex items-center justify-center px-6 z-10 py-16">
      <motion.div style={{ opacity, y }} className="max-w-6xl mx-auto w-full">
        <div className="text-center mb-12">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-xs uppercase tracking-[0.3em] text-[#00d4ff]/80 font-mono mb-3 block"
          >
            Step 01 • The Challenge
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-display text-4xl md:text-6xl text-white leading-tight font-bold"
          >
            Every transaction,<br />
            <span className="text-white/30">scattered across student life.</span>
          </motion.h2>
        </div>

        {/* Scattered transactions grid */}
        <div className="relative h-[360px] md:h-[420px] rounded-3xl glass p-6 border border-white/5 overflow-hidden">
          <div className="absolute inset-0 bg-radial from-white/[0.02] to-transparent pointer-events-none" />
          {scatteredTransactions.map((txn, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: false }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              whileHover={{ scale: 1.1, rotate: 0, zIndex: 30 }}
              className="absolute glass-elevated rounded-2xl px-5 py-3 border border-white/10 cursor-pointer shadow-xl transition-shadow"
              style={{
                left: `${txn.x}%`,
                top: `${txn.y}%`,
                transform: `rotate(${txn.rotation}deg)`,
              }}
            >
              <div className="text-sm text-white/90 font-medium">{txn.name}</div>
              <div className="text-xs font-mono text-white/50 mt-0.5">{txn.amount}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

// ============================================================================
// ORGANIZATION SECTION — Transactions categorize
// ============================================================================
function OrganizationSection({ scrollProgress }: any) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  
  const opacity = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], [0, 1, 1, 0]);

  const categories = [
    { name: 'Dining & Cafe', color: '#ff6b6b', count: '14 txns', items: ['Swiggy ₹320', 'Zomato ₹450', 'Cafe ₹180'] },
    { name: 'Entertainment', color: '#a855f7', count: '6 txns', items: ['Netflix ₹649', 'Spotify ₹119', 'Cinema ₹350'] },
    { name: 'Shopping & Gear', color: '#ff8e53', count: '8 txns', items: ['Amazon ₹899', 'Books ₹2,000', 'Gym ₹1,200'] },
    { name: 'Transit & Commute', color: '#00d4ff', count: '12 txns', items: ['Uber ₹240', 'Metro ₹150', 'Fuel ₹500'] },
  ];

  return (
    <section ref={sectionRef} className="relative min-h-[85vh] flex items-center justify-center px-6 z-10 py-16">
      <motion.div style={{ opacity }} className="max-w-6xl mx-auto w-full">
        <div className="text-center mb-14">
          <span className="text-xs uppercase tracking-[0.3em] text-[#00d084]/80 font-mono mb-3 block">Step 02 • Automated Patterning</span>
          <h2 className="font-display text-4xl md:text-6xl text-white leading-tight font-bold">
            See the <span className="text-gradient-cyan">clarity emerge.</span>
          </h2>
          <p className="mt-4 text-base text-white/50 max-w-xl mx-auto">
            Transactions automatically categorize with transparent, editable rules. No black box magic.
          </p>
        </div>

        {/* Category clusters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: false }}
              transition={{ duration: 0.7, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="glass-card rounded-3xl p-6 relative overflow-hidden group border border-white/10"
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `radial-gradient(circle at 50% 0%, ${cat.color}25 0%, transparent 70%)` }}
              />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color, boxShadow: `0 0 12px ${cat.color}` }} />
                    <span className="text-xs uppercase tracking-wider text-white/80 font-semibold">{cat.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-white/40">{cat.count}</span>
                </div>
                <div className="space-y-2.5 pt-2 border-t border-white/5">
                  {cat.items.map((item, j) => (
                    <div
                      key={j}
                      className="text-xs text-white/70 font-mono flex items-center justify-between py-1"
                    >
                      <span>{item.split(' ')[0]}</span>
                      <span className="text-white/40">{item.split(' ')[1]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

// ============================================================================
// INSIGHT SECTION — Central Flow
// ============================================================================
function InsightSection({ scrollProgress }: any) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  
  const opacity = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], [0, 1, 1, 0]);

  return (
    <section ref={sectionRef} className="relative min-h-[85vh] flex items-center justify-center px-6 z-10 py-16">
      <motion.div style={{ opacity }} className="max-w-6xl mx-auto w-full">
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-[0.3em] text-[#a855f7]/80 font-mono mb-3 block">Step 03 • The Flow</span>
          <h2 className="font-display text-4xl md:text-6xl text-white leading-tight font-bold">
            Understand your <span className="text-gradient-green">velocity.</span>
          </h2>
        </div>

        {/* Central financial number with orbiting categories */}
        <div className="relative flex items-center justify-center py-20 min-h-[380px]">
          {/* Central number */}
          <div className="relative z-10 text-center">
            <div className="number-display text-gradient-cyan">₹24,680</div>
            <div className="text-xs text-white/40 mt-2 uppercase tracking-widest font-mono">Monthly Outflow Tracked</div>
          </div>

          {/* Orbiting categories */}
          {[
            { name: 'Dining', pct: '32%', angle: 0, color: '#ff6b6b' },
            { name: 'Shopping', pct: '21%', angle: 72, color: '#ff8e53' },
            { name: 'Transit', pct: '14%', angle: 144, color: '#00d4ff' },
            { name: 'Media', pct: '12%', angle: 216, color: '#a855f7' },
            { name: 'Savings', pct: '21%', angle: 288, color: '#00d084' },
          ].map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: false }}
              transition={{ delay: 0.3 + i * 0.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="absolute"
              style={{
                left: `${50 + Math.cos((cat.angle * Math.PI) / 180) * 38}%`,
                top: `${50 + Math.sin((cat.angle * Math.PI) / 180) * 38}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div className="glass-card rounded-2xl px-4 py-2.5 text-center border border-white/10 shadow-lg">
                <div className="text-[11px] text-white/50">{cat.name}</div>
                <div className="text-base font-mono font-bold" style={{ color: cat.color }}>{cat.pct}</div>
              </div>
            </motion.div>
          ))}

          {/* Orbit rings */}
          <div className="absolute w-[75%] h-[75%] rounded-full border border-white/5" />
          <div className="absolute w-[50%] h-[50%] rounded-full border border-white/[0.03]" />
        </div>
      </motion.div>
    </section>
  );
}

// ============================================================================
// INTERACTIVE PLAYGROUND SIMULATOR
// ============================================================================
function InteractiveSimulator({ onEnterApp }: { onEnterApp: () => void }) {
  const [income, setIncome] = useState(25000);
  const [expenses, setExpenses] = useState(16500);
  const [targetMonths, setTargetMonths] = useState(6);

  const monthlySavings = Math.max(0, income - expenses);
  const savingsRate = income > 0 ? (monthlySavings / income) * 100 : 0;
  const projectedCorpus = monthlySavings * targetMonths;

  return (
    <section id="simulator" className="relative min-h-[90vh] flex items-center justify-center px-6 z-10 py-20">
      <div className="max-w-5xl mx-auto w-full">
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-[0.3em] text-[#00d4ff] font-mono mb-3 block">
            Step 04 • Live Interactive Simulator
          </span>
          <h2 className="font-display text-4xl md:text-6xl text-white font-bold leading-tight">
            Simulate your <span className="text-gradient-cyan">financial future.</span>
          </h2>
          <p className="mt-3 text-base text-white/40 max-w-xl mx-auto">
            Adjust the live sliders to watch how minor habit adjustments compound into major wealth.
          </p>
        </div>

        <div className="glass-elevated rounded-3xl p-8 md:p-10 border border-white/15 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Controls */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs text-white/60 font-medium">Monthly Inflow (Allowance / Stipend)</label>
                  <span className="text-sm font-mono font-bold text-[#00d084]">₹{income.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min={5000}
                  max={60000}
                  step={1000}
                  value={income}
                  onChange={e => setIncome(Number(e.target.value))}
                  className="w-full accent-[#00d084] cursor-pointer h-2 bg-white/10 rounded-lg"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs text-white/60 font-medium">Estimated Expenses (Food, Rent, Fun)</label>
                  <span className="text-sm font-mono font-bold text-[#ff6b6b]">₹{expenses.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min={2000}
                  max={50000}
                  step={500}
                  value={expenses}
                  onChange={e => setExpenses(Number(e.target.value))}
                  className="w-full accent-[#ff6b6b] cursor-pointer h-2 bg-white/10 rounded-lg"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs text-white/60 font-medium">Target Horizon</label>
                  <span className="text-sm font-mono font-bold text-[#00d4ff]">{targetMonths} Months</span>
                </div>
                <input
                  type="range"
                  min={3}
                  max={24}
                  step={1}
                  value={targetMonths}
                  onChange={e => setTargetMonths(Number(e.target.value))}
                  className="w-full accent-[#00d4ff] cursor-pointer h-2 bg-white/10 rounded-lg"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={onEnterApp}
                  className="w-full py-3.5 rounded-2xl font-bold text-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #00d4ff 0%, #00d084 100%)' }}
                >
                  <span>Apply This Scenario in App</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Live Projected Metrics */}
            <div className="lg:col-span-6 bg-black/40 rounded-3xl p-6 border border-white/5 space-y-6">
              <div>
                <p className="text-[11px] text-white/40 uppercase tracking-wider mb-1 font-mono">Monthly Surplus</p>
                <div className="text-3xl font-mono font-bold text-white flex items-baseline gap-2">
                  <span>₹{monthlySavings.toLocaleString('en-IN')}</span>
                  <span className="text-xs font-normal text-[#00d084]">({savingsRate.toFixed(0)}% savings rate)</span>
                </div>
              </div>

              <div>
                <p className="text-[11px] text-white/40 uppercase tracking-wider mb-1 font-mono">
                  {targetMonths}-Month Projected Savings Core
                </p>
                <div className="text-4xl md:text-5xl font-mono font-extrabold text-gradient-cyan">
                  ₹{projectedCorpus.toLocaleString('en-IN')}
                </div>
              </div>

              {/* Progress Bar Visualization */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-white/40">
                  <span>Velocity Metric</span>
                  <span className={savingsRate >= 30 ? 'text-[#00d084]' : 'text-amber-400'}>
                    {savingsRate >= 40 ? '🚀 Hyper Velocity' : savingsRate >= 20 ? '⚡ Healthy Stride' : '⚠️ Tight Buffer'}
                  </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(100, savingsRate)}%`,
                      background: 'linear-gradient(90deg, #00d084, #00d4ff)',
                    }}
                    layout
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// FORECAST SECTION — Future timeline
// ============================================================================
function ForecastSection({ scrollProgress }: any) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  
  const opacity = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], [0, 1, 1, 0]);

  return (
    <section ref={sectionRef} className="relative min-h-[85vh] flex items-center justify-center px-6 z-10 py-16">
      <motion.div style={{ opacity }} className="max-w-6xl mx-auto w-full">
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-[0.3em] text-[#a855f7]/80 font-mono mb-3 block">Step 05 • Multiverse</span>
          <h2 className="font-display text-4xl md:text-6xl text-white leading-tight font-bold">
            Change the <span className="text-gradient-violet">future.</span>
          </h2>
          <p className="mt-3 text-base text-white/40 max-w-xl mx-auto">
            Explore parallel timelines. See how conscious choices alter your ending balance.
          </p>
        </div>

        {/* Forecast visualization */}
        <div className="relative h-[380px] glass-elevated rounded-3xl p-8 overflow-hidden border border-white/10 shadow-2xl">
          {/* Timeline markers */}
          <div className="absolute top-8 left-8 right-8 flex justify-between z-10">
            {['NOW', 'SEP', 'OCT', 'NOV', 'DEC', 'TARGET'].map(label => (
              <div key={label} className="text-center">
                <div className="text-[10px] text-white/30 uppercase tracking-widest font-mono">{label}</div>
                <div className="w-px h-3 bg-white/10 mx-auto mt-2" />
              </div>
            ))}
          </div>

          {/* SVG Forecast Lines */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 400" preserveAspectRatio="none">
            <defs>
              <linearGradient id="steadyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#555" />
                <stop offset="100%" stopColor="#777" />
              </linearGradient>
              <linearGradient id="focusedGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00d084" />
                <stop offset="100%" stopColor="#00d4ff" />
              </linearGradient>
            </defs>
            
            {/* Steady path */}
            <motion.path
              d="M 50 300 Q 250 280, 400 260 T 750 220 T 950 180"
              fill="none"
              stroke="url(#steadyGrad)"
              strokeWidth="2"
              strokeDasharray="5 5"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: false }}
              transition={{ duration: 1.8, delay: 0.3 }}
            />
            
            {/* Focused path */}
            <motion.path
              d="M 50 300 Q 250 260, 400 200 T 750 120 T 950 50"
              fill="none"
              stroke="url(#focusedGrad)"
              strokeWidth="3.5"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: false }}
              transition={{ duration: 2, delay: 0.6 }}
              style={{ filter: 'drop-shadow(0 0 12px rgba(0, 212, 255, 0.6))' }}
            />
          </svg>

          {/* Scenario labels */}
          <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end z-10">
            <div className="glass rounded-2xl px-5 py-3 border border-white/5">
              <div className="text-xs text-white/40 mb-0.5">Conservative Path</div>
              <div className="text-sm font-mono text-white/70 font-semibold">₹42,000</div>
            </div>
            <div className="glass-elevated rounded-2xl px-5 py-3 glow-green border border-[#00d084]/40">
              <div className="text-xs text-[#00d084] mb-0.5 font-medium">Focused Scenario</div>
              <div className="text-lg font-mono text-[#00d084] font-bold">₹68,500</div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

// ============================================================================
// FINAL CTA
// ============================================================================
function FinalCTA({ onEnterApp }: { onEnterApp: () => void }) {
  return (
    <section className="relative min-h-[75vh] flex items-center justify-center px-6 z-10 py-16">
      <div className="text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="font-display text-5xl md:text-8xl text-white leading-[0.92] mb-6 font-extrabold">
            Ready to take<br />
            <span className="text-gradient-cyan">full command?</span>
          </h2>
          <p className="text-base md:text-lg text-white/40 mb-10 max-w-xl mx-auto">
            Experience spatial financial intelligence with instant simulations, zero real bank risk, and crystal clarity.
          </p>
          <button
            onClick={onEnterApp}
            className="group relative inline-flex items-center gap-4 px-10 py-5 rounded-full overflow-hidden transition-all duration-500 cursor-pointer shadow-2xl hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #00d4ff 0%, #00d084 100%)',
              boxShadow: '0 0 70px rgba(0, 212, 255, 0.45)',
            }}
          >
            <span className="relative z-10 text-base md:text-lg font-bold text-black">Enter CashLink</span>
            <ArrowRight className="relative z-10 w-5 h-5 text-black transition-transform duration-300 group-hover:translate-x-2" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#00d084] to-[#00d4ff] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </button>
        </motion.div>

        {/* Footer info */}
        <div className="mt-20 flex flex-wrap items-center justify-center gap-6 text-xs text-white/30 font-medium">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-[#00d084]" />
            <span>Educational Tool Only</span>
          </div>
          <div className="w-px h-3 bg-white/10 hidden sm:block" />
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#00d4ff]" />
            <span>Synthetic Sample Engine</span>
          </div>
          <div className="w-px h-3 bg-white/10 hidden sm:block" />
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-[#a855f7]" />
            <span>Privacy Guaranteed</span>
          </div>
        </div>
      </div>
    </section>
  );
}
