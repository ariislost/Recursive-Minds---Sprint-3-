import React, { useState } from 'react';
import { signIn, signUp } from '../services/supabase';
import { AppUser } from '../types';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  User, 
  Sparkles, 
  Loader2, 
  AlertCircle, 
  ArrowRight
} from 'lucide-react';

interface AuthScreenProps {
  onAuthSuccess: (user: AppUser) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isSignUp) {
        const { user, error } = await signUp(email, password, name);
        if (error) {
          setErrorMsg(error);
        } else if (user) {
          onAuthSuccess(user);
        }
      } else {
        const { user, error } = await signIn(email, password);
        if (error) {
          setErrorMsg(error);
        } else if (user) {
          onAuthSuccess(user);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const demoEmail = 'demo@claimsync.app';
      const demoPass = 'claimsync123';
      const { user, error } = await signIn(demoEmail, demoPass);
      if (user) {
        onAuthSuccess(user);
      } else if (error) {
        // If demo user doesn't exist, sign up
        const su = await signUp(demoEmail, demoPass, 'Demo User');
        if (su.user) {
          onAuthSuccess(su.user);
        } else {
          setErrorMsg(su.error || 'Demo login failed');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Demo login error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/10 text-[var(--color-accent)] mb-1 border border-white/15 shadow-xl backdrop-blur-md">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">
            ClaimSync
          </h1>
          <p className="text-xs sm:text-sm text-white/60 max-w-xs mx-auto font-light">
            Autonomous OCR warranty protection & subscription vault.
          </p>
        </div>

        {/* Auth Card (Frosted Glass) */}
        <div className="glass-panel text-white rounded-[28px] border border-white/15 p-6 sm:p-8 space-y-6 shadow-2xl">
          
          {/* Toggle between Login and Create Account */}
          <div className="flex bg-white/10 p-1 rounded-full border border-white/10">
            <button
              type="button"
              id="auth-tab-login"
              onClick={() => { setIsSignUp(false); setErrorMsg(''); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                !isSignUp 
                  ? 'bg-white text-[#081018] shadow-md' 
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              id="auth-tab-signup"
              onClick={() => { setIsSignUp(true); setErrorMsg(''); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                isSignUp 
                  ? 'bg-white text-[#081018] shadow-md' 
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-[14px] text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-xs uppercase font-semibold tracking-wider text-white/60 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-white/40 absolute left-3.5 top-3.5" />
                  <input
                    id="auth-name-input"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full glass-input rounded-[12px] pl-10 pr-3 py-2.5 text-sm"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs uppercase font-semibold tracking-wider text-white/60 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-3.5" />
                <input
                  id="auth-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full glass-input rounded-[12px] pl-10 pr-3 py-2.5 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase font-semibold tracking-wider text-white/60 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-3.5" />
                <input
                  id="auth-password-input"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full glass-input rounded-[12px] pl-10 pr-3 py-2.5 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              id="auth-submit-btn"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-full bg-white hover:bg-white/90 text-[#081018] font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 mt-2 active:scale-99 shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#081018]" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{isSignUp ? 'Create Account' : 'Login'}</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          {/* Demo Quick Access */}
          <div className="pt-3 border-t border-white/10">
            <button
              type="button"
              id="demo-login-btn"
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full py-3 px-4 rounded-full bg-white/10 hover:bg-white/15 text-white border border-white/10 font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent)]" />
              <span>Explore Demo Account (Instant Access)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

