import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  sendEmailOTP, 
  verifyEmailOTP, 
  registerUser, 
  loginUser,
  logoutUser,
  onAuthChange,
  getCurrentUser
} from '../../firebase/auth';
import { User } from 'firebase/auth';

interface LoginProps {
  onSuccess?: () => void;
}

type AuthStep = 'email' | 'otp' | 'password' | 'success';
type AuthMode = 'login' | 'register';

const Login: React.FC<LoginProps> = ({ onSuccess }) => {
  const [step, setStep] = useState<AuthStep>('email');
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [countdown, setCountdown] = useState(0);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthChange((currentUser) => {
      setUser(currentUser);
      if (currentUser && onSuccess) {
        onSuccess();
      }
    });
    return () => unsubscribe();
  }, [onSuccess]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Handle email submission - send OTP
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    const result = await sendEmailOTP(email);
    
    if (result.success) {
      setStep('otp');
      setCountdown(30); // 30 seconds before resend
    } else {
      setError(result.message || 'Failed to send OTP');
    }
    
    setLoading(false);
  };

  // Handle OTP verification
  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (otp.length !== 6) {
      setError('OTP must be 6 digits');
      setLoading(false);
      return;
    }

    const result = await verifyEmailOTP(email, otp);
    
    if (result.success) {
      setStep('password');
    } else {
      setError(result.message || 'Invalid OTP');
    }
    
    setLoading(false);
  };

  // Handle password submission (login/register)
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (mode === 'register' && password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    let result;
    if (mode === 'register') {
      result = await registerUser(email, password);
    } else {
      result = await loginUser(email, password);
    }
    
    if (result.success) {
      setStep('success');
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1500);
    } else {
      setError(result.message || 'Authentication failed');
    }
    
    setLoading(false);
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    setError('');
    const result = await sendEmailOTP(email);
    
    if (result.success) {
      setCountdown(30);
    } else {
      setError(result.message || 'Failed to resend OTP');
    }
  };

  // Go back to previous step
  const goBack = () => {
    if (step === 'password') setStep('otp');
    if (step === 'otp') setStep('email');
    setError('');
  };

  // If user is already logged in
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 max-w-md w-full mx-4 border border-white/20"
        >
          <div className="text-center">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Welcome Back!</h2>
            <p className="text-gray-300 mb-6">{user.email}</p>
            <button
              onClick={() => logoutUser()}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 max-w-md w-full mx-4 border border-white/20"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4"
          >
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-gray-300">
            {step === 'email' && 'Enter your email to continue'}
            {step === 'otp' && 'Check your email for the OTP'}
            {step === 'password' && 'Set up your password'}
            {step === 'success' && 'You\'re all set!'}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-2">
            {['email', 'otp', 'password'].map((s, index) => (
              <React.Fragment key={s}>
                <div
                  className={`w-3 h-3 rounded-full transition-colors ${
                    step === s || (step === 'success')
                      ? 'bg-purple-500'
                      : 'bg-gray-600'
                  }`}
                />
                {index < 2 && (
                  <div
                    className={`w-8 h-0.5 transition-colors ${
                      index < ['email', 'otp', 'password'].indexOf(step)
                        ? 'bg-purple-500'
                        : 'bg-gray-600'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step Forms */}
        <AnimatePresence mode="wait">
          {/* Email Step */}
          {step === 'email' && (
            <motion.form
              key="email-step"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              onSubmit={handleEmailSubmit}
              className="space-y-4"
            >
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="you@example.com"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                  className="text-purple-400 hover:text-purple-300 text-sm"
                >
                  {mode === 'login' ? "Don't have an account? Register" : 'Already have an account? Login'}
                </button>
              </div>
            </motion.form>
          )}

          {/* OTP Step */}
          {step === 'otp' && (
            <motion.form
              key="otp-step"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              onSubmit={handleOTPSubmit}
              className="space-y-4"
            >
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Enter 6-Digit OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-2xl tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                  disabled={loading}
                />
              </div>

              <div className="text-center text-sm text-gray-400">
                {countdown > 0 ? (
                  <p>Resend OTP in {countdown}s</p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    className="text-purple-400 hover:text-purple-300"
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>

              <button
                type="button"
                onClick={goBack}
                className="w-full text-gray-400 hover:text-white text-sm py-2"
              >
                ← Back to Email
              </button>
            </motion.form>
          )}

          {/* Password Step */}
          {step === 'password' && (
            <motion.form
              key="password-step"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              onSubmit={handlePasswordSubmit}
              className="space-y-4"
            >
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>

              {mode === 'register' && (
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="••••••••"
                    disabled={loading}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (mode === 'register' ? 'Creating Account...' : 'Logging In...') : (mode === 'register' ? 'Create Account' : 'Login')}
              </button>

              <button
                type="button"
                onClick={goBack}
                className="w-full text-gray-400 hover:text-white text-sm py-2"
              >
                ← Back to OTP
              </button>
            </motion.form>
          )}

          {/* Success Step */}
          {step === 'success' && (
            <motion.div
              key="success-step"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="text-center py-8"
            >
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Success!</h3>
              <p className="text-gray-300">Redirecting you...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Login;
