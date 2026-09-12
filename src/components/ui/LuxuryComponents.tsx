import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// DECRYPTED TEXT — Characters scramble before resolving (hacker terminal style)
// ============================================================================

interface DecryptedTextProps {
  text: string;
  className?: string;
  speed?: number;
  maxIterations?: number;
  characters?: string;
  trigger?: boolean;
}

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';

export function DecryptedText({
  text,
  className = '',
  speed = 50,
  maxIterations = 20,
  characters = CHARS,
  trigger = true,
}: DecryptedTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const [isAnimating, setIsAnimating] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const iterationRef = useRef(0);
  
  useEffect(() => {
    if (!trigger) return;
    
    setIsAnimating(true);
    iterationRef.current = 0;
    
    const animate = () => {
      iterationRef.current++;
      const progress = iterationRef.current / maxIterations;
      
      const newText = text
        .split('')
        .map((char, index) => {
          if (char === ' ') return ' ';
          if (index < text.length * progress) return char;
          return characters[Math.floor(Math.random() * characters.length)];
        })
        .join('');
      
      setDisplayText(newText);
      
      if (iterationRef.current >= maxIterations) {
        setDisplayText(text);
        setIsAnimating(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    };
    
    intervalRef.current = setInterval(animate, speed);
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text, trigger, speed, maxIterations, characters]);
  
  return (
    <span className={className} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
      {displayText}
    </span>
  );
}

// ============================================================================
// ANIMATED COUNTER — Numbers count up with spring physics
// ============================================================================

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
}

export function AnimatedCounter({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 800,
  className = '',
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const startValueRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
  
  useEffect(() => {
    startValueRef.current = displayValue;
    startTimeRef.current = null;
    
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      
      // Cubic bezier easing (0.22, 1, 0.36, 1)
      const eased = 1 - Math.pow(1 - progress, 3);
      
      const currentValue = startValueRef.current + (value - startValueRef.current) * eased;
      setDisplayValue(currentValue);
      
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };
    
    frameRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [value, duration]);
  
  const isNegative = displayValue < 0;
  const absValue = Math.abs(displayValue);
  const formattedNumber = absValue.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return (
    <span className={className} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
      {isNegative ? '-' : ''}
      {prefix}
      {formattedNumber}
      {suffix}
    </span>
  );
}

// ============================================================================
// SPOTLIGHT CARD — Cursor-following radial gradient
// ============================================================================

interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
}

export function SpotlightCard({ children, className = '' }: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
  };
  
  return (
    <div
      ref={cardRef}
      className={`spotlight-card ${className}`}
      onMouseMove={handleMouseMove}
    >
      {children}
    </div>
  );
}

// ============================================================================
// MAGNETIC BUTTON — Button physically moves toward cursor
// ============================================================================

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  strength?: number;
}

export function MagneticButton({
  children,
  className = '',
  onClick,
  strength = 0.3,
}: MagneticButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (e.clientX - centerX) * strength;
    const deltaY = (e.clientY - centerY) * strength;
    
    buttonRef.current.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
  };
  
  const handleMouseLeave = () => {
    if (!buttonRef.current) return;
    buttonRef.current.style.transform = 'translate(0, 0)';
  };
  
  return (
    <button
      ref={buttonRef}
      className={`magnetic-button ${className}`}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </button>
  );
}

// ============================================================================
// KINETIC TEXT — Staggered character animation
// ============================================================================

interface KineticTextProps {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
}

export function KineticText({
  text,
  className = '',
  delay = 0,
  stagger = 0.05,
}: KineticTextProps) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay * 1000);
    return () => clearTimeout(timer);
  }, [delay]);
  
  return (
    <span className={className}>
      {text.split('').map((char, index) => (
        <span
          key={index}
          style={{
            display: 'inline-block',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(100%)',
            transition: `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${index * stagger + delay}s`,
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  );
}

// ============================================================================
// AURORA BACKGROUND — Animated mesh gradient
// ============================================================================

interface AuroraBackgroundProps {
  variant?: 'cool' | 'warm' | 'neutral';
  className?: string;
}

export function AuroraBackground({ variant = 'neutral', className = '' }: AuroraBackgroundProps) {
  const gradients = {
    cool: 'from-blue-600/20 via-cyan-500/10 to-transparent',
    warm: 'from-purple-600/20 via-pink-500/10 to-transparent',
    neutral: 'from-emerald-500/10 via-cyan-500/10 to-purple-600/10',
  };
  
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradients[variant]} animate-pulse`}
        style={{
          animationDuration: '8s',
        }}
      />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `
            radial-gradient(ellipse at 20% 50%, rgba(0, 255, 163, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 20%, rgba(0, 229, 255, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse at 40% 80%, rgba(112, 0, 255, 0.1) 0%, transparent 50%)
          `,
          animation: 'aurora 20s ease infinite',
        }}
      />
    </div>
  );
}

// ============================================================================
// TOAST NOTIFICATION SYSTEM
// ============================================================================

export interface Toast {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'info' | 'warning';
}

export function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-start gap-3 p-4 rounded-2xl glass-elevated border border-white/10 shadow-2xl animate-slide-in-right"
          style={{
            background: 'rgba(12, 12, 16, 0.95)',
          }}
        >
          <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
            style={{
              background: toast.type === 'warning' ? '#ff8e53' : toast.type === 'info' ? '#00d4ff' : '#00d084',
              boxShadow: `0 0 10px ${toast.type === 'warning' ? '#ff8e53' : toast.type === 'info' ? '#00d4ff' : '#00d084'}`,
            }}
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-semibold text-white">{toast.title}</h4>
            {toast.description && <p className="text-[11px] text-white/50 mt-0.5">{toast.description}</p>}
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="text-white/30 hover:text-white/70 text-xs transition-colors p-1"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// LUXURY SELECT / DROPDOWN — Obsidian glass dropdown matching dark neon theme
// ============================================================================

export interface LuxurySelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string;
}

export interface LuxurySelectProps {
  value: string;
  onChange: (value: string) => void;
  options: readonly (LuxurySelectOption | string)[] | (LuxurySelectOption | string)[];
  placeholder?: string;
  label?: string;
  className?: string;
  compact?: boolean;
  disabled?: boolean;
}

export function LuxurySelect({
  value,
  onChange,
  options,
  placeholder = 'Select option...',
  label,
  className = '',
  compact = false,
  disabled = false,
}: LuxurySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const normalizedOptions: LuxurySelectOption[] = Array.from(options).map(opt =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const selectedOption = normalizedOptions.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label className="block text-xs font-mono uppercase tracking-wider text-white/40 mb-1.5">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(prev => !prev)}
        className={`w-full flex items-center justify-between gap-2 text-left rounded-xl transition-all duration-200 ${
          compact
            ? 'px-2.5 py-1.5 text-xs bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/20'
            : 'px-4 py-2.5 text-sm bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.1] hover:border-cyan-400/40 focus:border-cyan-400/60 shadow-[0_2px_10px_rgba(0,0,0,0.2)]'
        } ${isOpen ? 'border-cyan-400/60 ring-2 ring-cyan-500/20 bg-white/[0.06]' : ''} ${
          disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          {selectedOption?.icon && (
            <span className="text-cyan-400 shrink-0">{selectedOption.icon}</span>
          )}
          <span className={`truncate font-medium ${selectedOption ? 'text-white' : 'text-white/30'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
              {selectedOption.badge}
            </span>
          )}
        </div>

        <ChevronDown
          className={`w-4 h-4 text-white/40 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-cyan-400' : ''
          }`}
        />
      </button>

      {/* Popup Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute z-50 left-0 right-0 mt-1.5 p-1 rounded-2xl bg-[#0e0e14] border border-white/[0.14] shadow-[0_15px_40px_rgba(0,0,0,0.8)] backdrop-blur-2xl max-h-60 overflow-y-auto custom-scrollbar"
          >
            {normalizedOptions.map(option => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-left transition-all ${
                    compact ? 'text-xs' : 'text-sm'
                  } ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 font-semibold border border-cyan-500/30 shadow-[0_0_10px_rgba(0,229,255,0.1)]'
                      : 'text-white/70 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {option.icon && (
                      <span className={isSelected ? 'text-cyan-400' : 'text-white/40'}>
                        {option.icon}
                      </span>
                    )}
                    <span className="truncate">{option.label}</span>
                    {option.badge && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-white/50">
                        {option.badge}
                      </span>
                    )}
                  </div>

                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


