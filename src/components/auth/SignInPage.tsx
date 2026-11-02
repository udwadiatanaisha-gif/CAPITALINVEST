import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BrandLogo } from '../common/BrandLogo';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight, UserCheck, AlertCircle } from 'lucide-react';

interface SignInPageProps {
  onForgotPassword: () => void;
}

export const SignInPage: React.FC<SignInPageProps> = ({ onForgotPassword }) => {
  const { login, navigate, switchUser, users } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please provide both email address and password.');
      return;
    }

    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Invalid credentials.');
    }
  };

  const handleQuickDemoLogin = (targetUser: any) => {
    switchUser(targetUser);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F7F5F0]">
      {/* Left Branding Panel */}
      <div className="lg:w-1/2 bg-[#101C2C] text-white p-8 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#C6A76A]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-700/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 cursor-pointer" onClick={() => navigate('home')}>
          <BrandLogo variant="dark" size="lg" />
        </div>

        <div className="relative z-10 my-12 max-w-md">
          <span className="text-xs uppercase font-semibold tracking-widest text-[#C6A76A]">Enterprise Wealth Access</span>
          <h2 className="font-serif-display text-3xl sm:text-4xl font-bold mt-2 leading-tight">
            Institutional Command for Modern Advisors & Families
          </h2>
          <p className="mt-4 text-sm text-slate-300 leading-relaxed">
            Consolidated portfolio intelligence, mathematical goal tracking, and live spreadsheet synchronization protected by enterprise role-based security.
          </p>

          <div className="mt-8 space-y-3 text-xs text-slate-400">
            <div className="flex items-center space-x-2.5">
              <ShieldCheck className="w-4 h-4 text-[#147D64]" />
              <span>Full compliance with Indian Financial Conventions (INR ₹)</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <ShieldCheck className="w-4 h-4 text-[#147D64]" />
              <span>Client-level data partition & cryptographic audit trails</span>
            </div>
          </div>
        </div>

        {/* Fiduciary Notice */}
        <div className="relative z-10 pt-6 border-t border-slate-700/70 text-xs text-slate-400">
          <span>CapitalVest Fiduciary Portal • Multi-Factor Session Protection</span>
        </div>
      </div>

      {/* Right Sign-in Form Panel */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h3 className="font-serif-display text-2xl font-bold text-[#101C2C]">Welcome Back</h3>
            <p className="text-xs text-slate-500 mt-1">Sign in to your CapitalVest wealth management account</p>
          </div>

          {errorMessage && (
            <div className="mt-5 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSignIn} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="advisor@capitalvest.in"
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#C6A76A]"
                  required
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="text-[11px] font-medium text-[#147D64] hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#C6A76A]"
                  required
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-[#147D64] focus:ring-[#C6A76A]"
                />
                <span className="text-slate-600">Remember this workstation</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-[#101C2C] hover:bg-[#172B46] text-white text-sm font-semibold rounded-lg shadow-sm transition-colors flex items-center justify-center cursor-pointer"
            >
              {isLoading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('signup')}
              className="font-bold text-[#147D64] hover:underline cursor-pointer"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
