import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BrandLogo } from '../common/BrandLogo';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight, ArrowLeft, AlertCircle, Briefcase, Award } from 'lucide-react';

interface AdvisorLoginPageProps {
  onForgotPassword: () => void;
}

export const AdvisorLoginPage: React.FC<AdvisorLoginPageProps> = ({ onForgotPassword }) => {
  const { login, navigate } = useApp();

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
      setErrorMessage('Please provide your corporate advisor email address and password.');
      return;
    }

    setIsLoading(true);
    const result = await login(email.trim(), password, 'advisor');
    setIsLoading(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Invalid credentials. Please verify your advisor credentials or contact firm operations.');
    }
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
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#C6A76A]/15 border border-[#C6A76A]/40 text-[#C6A76A] text-xs font-semibold mb-4">
            <Award className="w-3.5 h-3.5" />
            <span>Institutional Advisor Command Centre</span>
          </div>

          <h2 className="font-serif-display text-3xl sm:text-4xl font-bold mt-2 leading-tight">
            Comprehensive Fiduciary Command for Wealth Advisors
          </h2>
          <p className="mt-4 text-sm text-slate-300 leading-relaxed">
            Manage multi-tier client relationships, execute automated portfolio rebalancing reviews, oversee Excel & Google Sheets sync pipelines, and generate verified wealth dossiers.
          </p>

          <div className="mt-8 space-y-3.5 text-xs text-slate-300">
            <div className="flex items-center space-x-2.5">
              <ShieldCheck className="w-4 h-4 text-[#C6A76A]" />
              <span>Multi-role access for Principal Advisors, Operations, & Compliance</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <ShieldCheck className="w-4 h-4 text-[#C6A76A]" />
              <span>Deterministic SEBI concentration & asset allocation drift monitoring</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <ShieldCheck className="w-4 h-4 text-[#C6A76A]" />
              <span>Live bidirectional Data Hub and spreadsheet synchronization</span>
            </div>
          </div>
        </div>

        {/* Security & Access Information */}
        <div className="relative z-10 pt-6 border-t border-slate-800 text-xs text-slate-400">
          <div className="flex items-center justify-between">
            <span>CapitalVest Wealth Management</span>
            <span className="text-[#C6A76A] font-medium">Fiduciary Workstation</span>
          </div>
        </div>
      </div>

      {/* Right Sign-in Form Panel */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-sm">
          {/* Top navigation link back to homepage */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate('home')}
              className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-[#101C2C] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Return to Homepage
            </button>
            <span className="text-[11px] font-semibold text-[#C6A76A] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Advisor Portal
            </span>
          </div>

          <div>
            <h3 className="font-serif-display text-2xl font-bold text-[#101C2C]">Advisor Sign In</h3>
            <p className="text-xs text-slate-500 mt-1">
              Sign in with your corporate CapitalVest credentials
            </p>
          </div>

          {errorMessage && (
            <div className="mt-5 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSignIn} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Corporate Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="advisor@capitalvest.in"
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#C6A76A]"
                  required
                  autoFocus
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
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
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
                <span className="text-slate-600">Remember on this workstation</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-[#101C2C] hover:bg-[#172B46] text-white text-sm font-semibold rounded-lg shadow-sm transition-colors flex items-center justify-center cursor-pointer disabled:opacity-60"
            >
              {isLoading ? 'Verifying Fiduciary Credentials...' : 'Sign In to Command Centre'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </form>

          {/* Switch to Client Login */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Private Wealth Client?</span>
            <button
              onClick={() => navigate('client-login')}
              className="font-bold text-[#147D64] hover:underline cursor-pointer flex items-center"
            >
              Client Portal Sign In
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
