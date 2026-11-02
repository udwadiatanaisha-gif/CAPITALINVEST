import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BrandLogo } from '../common/BrandLogo';
import { Lock, Mail, User, ShieldAlert, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export const SignUpPage: React.FC = () => {
  const { navigate, login } = useApp();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Password strength check
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*]/.test(password);
  const passwordStrengthScore = (hasMinLength ? 1 : 0) + (hasNumber ? 1 : 0) + (hasSpecial ? 1 : 0);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim() || !email.trim()) {
      setErrorMsg('Full name and email are required.');
      return;
    }
    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (!termsAccepted) {
      setErrorMsg('You must agree to the Terms of Use and Privacy Policy.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          email,
          password,
          requestedRole: 'Client' // Enforces non-privilege registration rule
        })
      });

      if (res.ok) {
        // Automatically sign in and start onboarding
        await login(email, password);
        navigate('onboarding');
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Registration failed.');
      }
    } catch {
      // Offline fallback
      await login(email, password);
      navigate('onboarding');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F7F5F0]">
      {/* Left Info Panel */}
      <div className="lg:w-1/2 bg-[#101C2C] text-white p-8 lg:p-16 flex flex-col justify-between">
        <div className="cursor-pointer" onClick={() => navigate('home')}>
          <BrandLogo variant="dark" size="lg" />
        </div>

        <div className="my-10 max-w-md">
          <span className="text-xs uppercase font-semibold tracking-widest text-[#C6A76A]">Account Creation</span>
          <h2 className="font-serif-display text-3xl sm:text-4xl font-bold mt-2 leading-tight">
            Join the CapitalVest Wealth Management Network
          </h2>
          <p className="mt-4 text-sm text-slate-300 leading-relaxed">
            Create your account to view your family wealth portfolio, track milestone goals, and collaborate securely with your dedicated wealth advisor.
          </p>

          <div className="mt-8 p-4 rounded-xl bg-[#172B46] border border-slate-700 text-xs text-slate-300 space-y-2">
            <div className="flex items-start space-x-2">
              <ShieldAlert className="w-4 h-4 text-[#C6A76A] flex-shrink-0 mt-0.5" />
              <span>
                <strong>Privilege Protection Notice:</strong> Self-registration creates a secured Client portal account. Advisor and Administrator privileges require an administrative invitation and verification.
              </span>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500">
          Already have an authorized login?{' '}
          <button onClick={() => navigate('signin')} className="text-[#C6A76A] font-semibold hover:underline">
            Sign In here
          </button>
        </div>
      </div>

      {/* Right Registration Card */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h3 className="font-serif-display text-2xl font-bold text-[#101C2C]">Create Your Account</h3>
            <p className="text-xs text-slate-500 mt-1">Get started with your CapitalVest wealth portfolio</p>
          </div>

          {errorMsg && (
            <div className="mt-5 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Legal Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Vikramaditya Singhania"
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#C6A76A]"
                  required
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@familyoffice.in"
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#C6A76A]"
                  required
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#C6A76A]"
                  required
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
              {/* Strength Indicators */}
              <div className="flex gap-1 mt-1.5">
                <div className={`h-1 flex-1 rounded ${passwordStrengthScore >= 1 ? 'bg-amber-500' : 'bg-slate-200'}`} />
                <div className={`h-1 flex-1 rounded ${passwordStrengthScore >= 2 ? 'bg-amber-500' : 'bg-slate-200'}`} />
                <div className={`h-1 flex-1 rounded ${passwordStrengthScore >= 3 ? 'bg-[#147D64]' : 'bg-slate-200'}`} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#C6A76A]"
                  required
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
              <span className="font-semibold block text-slate-800">Account Type</span>
              <span>Client Portal (Self-Service)</span>
            </div>

            <div className="flex items-start space-x-2.5 pt-1">
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={e => setTermsAccepted(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-[#147D64] focus:ring-[#C6A76A]"
                required
              />
              <label htmlFor="terms" className="text-xs text-slate-600 leading-relaxed">
                I agree to the{' '}
                <button type="button" onClick={() => navigate('legal', 'terms')} className="text-[#147D64] underline">
                  Terms of Use
                </button>{' '}
                and confirm reading the{' '}
                <button type="button" onClick={() => navigate('legal', 'privacy')} className="text-[#147D64] underline">
                  Privacy Policy
                </button>
                .
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-[#101C2C] hover:bg-[#172B46] text-white text-sm font-semibold rounded-lg shadow-sm transition-colors flex items-center justify-center cursor-pointer"
            >
              {isLoading ? 'Creating Account...' : 'Complete Registration'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Already registered?{' '}
            <button
              onClick={() => navigate('signin')}
              className="font-bold text-[#147D64] hover:underline cursor-pointer"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
