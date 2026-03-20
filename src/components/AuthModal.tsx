import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, ShieldCheck, ArrowRight, Chrome } from 'lucide-react';
import { signInWithGoogle, registerWithEmail, loginWithEmail } from '../firebase';
import { apiUrl } from '../lib/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [role, setRole] = useState<'devotee' | 'vendor'>('devotee');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isForgotPassword) {
        if (!otpSent) {
          const res = await fetch(apiUrl('/api/auth/forgot-password'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);
          setOtpSent(true);
          setSuccess('OTP sent to your email. Please check your inbox.');
        } else {
          const res = await fetch(apiUrl('/api/auth/verify-otp'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp, newPassword: password }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);
          setSuccess('Password reset successfully. You can now sign in.');
          setIsForgotPassword(false);
          setOtpSent(false);
          setIsLogin(true);
        }
      } else if (isLogin) {
        await loginWithEmail(email, password);
        onClose();
      } else {
        await registerWithEmail(email, password, displayName, role);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle(role);
      onClose();
    } catch (err) {
      setError('Google sign-in failed');
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
            className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden"
          >
            <div className="p-8 border-b border-stone-100 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-serif font-bold text-stone-900">
                  {isForgotPassword ? 'Reset Password' : isLogin ? 'Welcome Back' : 'Join DivineConnect'}
                </h2>
                <p className="text-stone-500 text-sm">
                  {isForgotPassword ? 'Verify your identity to reset' : isLogin ? 'Sign in to your sacred space' : 'Start your spiritual journey'}
                </p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
                <X className="w-6 h-6 text-stone-400" />
              </button>
            </div>

            <div className="p-8">
              {/* Role Selector */}
              {!isLogin && !isForgotPassword && (
                <div className="flex bg-stone-100 p-1 rounded-2xl mb-6">
                  <button
                    onClick={() => setRole('devotee')}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${role === 'devotee' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'}`}
                  >
                    Devotee
                  </button>
                  <button
                    onClick={() => setRole('vendor')}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${role === 'vendor' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'}`}
                  >
                    Vendor
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && !isForgotPassword && (
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                    <input
                      required
                      type="text"
                      placeholder="Full Name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                )}
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <input
                    required
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={otpSent}
                    className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all disabled:opacity-50"
                  />
                </div>

                {isForgotPassword && otpSent && (
                  <div className="relative">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                    <input
                      required
                      type="text"
                      placeholder="6-Digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                      className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                )}

                {(isLogin || !isForgotPassword || (isForgotPassword && otpSent)) && (
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                    <input
                      required
                      type="password"
                      placeholder={isForgotPassword ? "New Password" : "Password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                )}

                {error && <p className="text-red-500 text-xs font-bold">{error}</p>}
                {success && <p className="text-emerald-600 text-xs font-bold">{success}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-stone-900 text-white py-4 rounded-2xl font-bold hover:bg-orange-500 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-stone-900/10"
                >
                  <span>
                    {loading ? 'Processing...' : isForgotPassword ? (otpSent ? 'Reset Password' : 'Send OTP') : isLogin ? 'Sign In' : 'Create Account'}
                  </span>
                  {!loading && <ArrowRight className="w-5 h-5" />}
                </button>
              </form>

              {isLogin && !isForgotPassword && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setIsForgotPassword(true)}
                    className="text-xs text-stone-500 hover:text-orange-600 font-medium"
                  >
                    Forgot your password?
                  </button>
                </div>
              )}

              {isForgotPassword && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => {
                      setIsForgotPassword(false);
                      setOtpSent(false);
                      setSuccess('');
                      setError('');
                    }}
                    className="text-xs text-stone-500 hover:text-orange-600 font-medium"
                  >
                    Back to Login
                  </button>
                </div>
              )}

              {!isForgotPassword && (
                <>
                  <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-stone-100"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-4 text-stone-400 font-bold">Or continue with</span>
                    </div>
                  </div>

                  <button
                    onClick={handleGoogleSignIn}
                    className="w-full flex items-center justify-center space-x-3 px-4 py-3 border border-stone-200 rounded-2xl hover:bg-stone-50 transition-all font-bold text-stone-700"
                  >
                    <Chrome className="w-5 h-5 text-blue-500" />
                    <span>Google Account</span>
                  </button>
                </>
              )}

              <p className="mt-8 text-center text-sm text-stone-500">
                {isForgotPassword ? "" : isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                {!isForgotPassword && (
                  <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-orange-600 font-bold hover:underline"
                  >
                    {isLogin ? 'Sign Up' : 'Sign In'}
                  </button>
                )}
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
