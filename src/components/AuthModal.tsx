import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, ArrowRight, CheckCircle2, KeyRound } from 'lucide-react';
import { loginWithEmail, registerWithEmail, signInWithGoogle, signInWithFacebook } from '../firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Mode = 'login' | 'register' | 'forgot' | 'otp';

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'devotee' | 'vendor'>('devotee');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);
  // OTP reset state
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState('');   // shown in dev when email not configured
  const [newPassword, setNewPassword] = useState('');
  const [resetDone, setResetDone] = useState(false);

  const isLogin = mode === 'login';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'forgot') {
        const res = await fetch('/api/auth/request-password-reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
        if (import.meta.env.DEV && data.otp) setDevOtp(data.otp);
        setMode('otp');
      } else if (mode === 'otp') {
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp, newPassword }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Reset failed');
        setResetDone(true);
      } else if (isLogin) {
        await loginWithEmail(email, password);
        onClose();
      } else {
        await registerWithEmail(email, password, name, role);
        onClose();
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setError('');
    setResetSent(false);
    setResetDone(false);
    setOtp('');
    setDevOtp('');
    setNewPassword('');
    if (next === 'login' || next === 'register') setPassword('');
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithGoogle(role);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithFacebook(role);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Facebook sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-stone-400 hover:text-stone-900 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="p-8 sm:p-10">
              <div className="text-center mb-8">
                <div className="flex justify-center mb-6">
                  <img
                    src="/logo/icon-only.svg"
                    alt="PunyaSeva"
                    className="h-16 w-auto"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h2 className="text-3xl font-serif font-bold text-stone-900 mb-2">
                  {mode === 'login' ? 'Welcome Back'
                    : mode === 'register' ? 'Join PunyaSeva'
                    : mode === 'forgot' ? 'Forgot Password'
                    : 'Set New Password'}
                </h2>
                <p className="text-stone-500 text-sm">
                  {mode === 'login' ? 'Sign in to access your spiritual journey'
                    : mode === 'register' ? 'Create an account to start your spiritual journey'
                    : mode === 'forgot' ? 'Enter your email to receive a reset code'
                    : `Enter the OTP sent to ${email}`}
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-2xl">
                  {error}
                </div>
              )}

              {/* ── Password reset success ── */}
              {resetDone ? (
                <div className="text-center py-4">
                  <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-stone-900 mb-2">Password Updated!</h3>
                  <p className="text-stone-500 text-sm mb-6">
                    Your password has been reset. You can now sign in with your new password.
                  </p>
                  <button
                    onClick={() => switchMode('login')}
                    className="w-full bg-orange-500 text-white py-3 rounded-2xl font-bold hover:bg-orange-600 transition-all"
                  >
                    Sign In Now
                  </button>
                </div>
              ) : (
                <>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === 'register' && (
                      <>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                          <input
                            type="text"
                            placeholder="Full Name"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-100 rounded-2xl text-stone-900 placeholder-stone-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-2">
                          <button
                            type="button"
                            onClick={() => setRole('devotee')}
                            className={`py-3 rounded-2xl text-sm font-bold border transition-all ${
                              role === 'devotee'
                                ? 'bg-stone-900 text-white border-stone-900'
                                : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
                            }`}
                          >
                            Devotee
                          </button>
                          <button
                            type="button"
                            onClick={() => setRole('vendor')}
                            className={`py-3 rounded-2xl text-sm font-bold border transition-all ${
                              role === 'vendor'
                                ? 'bg-stone-900 text-white border-stone-900'
                                : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
                            }`}
                          >
                            Vendor
                          </button>
                        </div>
                      </>
                    )}

                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                      <input
                        type="email"
                        placeholder="Email Address"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-100 rounded-2xl text-stone-900 placeholder-stone-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                      />
                    </div>

                    {mode === 'otp' && (
                      <>
                        {devOtp && (
                          <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-2xl">
                            <KeyRound className="w-4 h-4 text-amber-600 shrink-0" />
                            <p className="text-sm text-amber-800">
                              Your OTP: <span className="font-black tracking-widest">{devOtp}</span>
                              <span className="text-xs text-amber-600 block">Email service not configured — shown here for now</span>
                            </p>
                          </div>
                        )}
                        <div className="relative">
                          <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                          <input
                            type="text"
                            placeholder="6-digit OTP"
                            required
                            maxLength={6}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                            className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-100 rounded-2xl text-stone-900 placeholder-stone-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all tracking-[0.3em] font-bold text-center"
                          />
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                          <input
                            type="password"
                            placeholder="New Password (min 6 chars)"
                            required
                            minLength={6}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-100 rounded-2xl text-stone-900 placeholder-stone-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                          />
                        </div>
                      </>
                    )}

                    {mode !== 'forgot' && mode !== 'otp' && (
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                        <input
                          type="password"
                          placeholder="Password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-100 rounded-2xl text-stone-900 placeholder-stone-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                        />
                      </div>
                    )}

                    {/* Forgot password link — only on login mode */}
                    {mode === 'login' && (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => switchMode('forgot')}
                          className="text-xs text-stone-400 hover:text-orange-500 transition-colors"
                        >
                          Forgot password?
                        </button>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold hover:bg-orange-600 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-orange-500/20 disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>
                            {mode === 'login' ? 'Sign In'
                              : mode === 'register' ? 'Create Account'
                              : mode === 'forgot' ? 'Send OTP'
                              : 'Reset Password'}
                          </span>
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </form>

                  {mode !== 'forgot' && mode !== 'otp' && (
                    <>
                      <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-stone-100" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-4 bg-white text-stone-400">Or continue with</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-8">
                        <button
                          onClick={handleGoogleSignIn}
                          disabled={loading}
                          className="bg-white border border-stone-200 text-stone-700 py-3 rounded-2xl font-bold hover:bg-stone-50 transition-all flex items-center justify-center space-x-2"
                        >
                          <img src="https://www.google.com/favicon.ico" alt="" className="w-4 h-4" />
                          <span>Google</span>
                        </button>
                        <button
                          onClick={handleFacebookSignIn}
                          disabled={loading}
                          className="bg-[#1877F2] text-white py-3 rounded-2xl font-bold hover:bg-[#166fe5] transition-all flex items-center justify-center space-x-2"
                        >
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                          <span>Facebook</span>
                        </button>
                      </div>
                    </>
                  )}

                  <div className="text-center space-y-2">
                    {(mode === 'forgot' || mode === 'otp') ? (
                      <button
                        onClick={() => switchMode('login')}
                        className="text-sm font-medium text-stone-500 hover:text-orange-500 transition-colors"
                      >
                        Back to Sign In
                      </button>
                    ) : (
                      <button
                        onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                        className="text-sm font-medium text-stone-500 hover:text-orange-500 transition-colors"
                      >
                        {mode === 'login'
                          ? "Don't have an account? Sign up"
                          : 'Already have an account? Sign in'}
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
