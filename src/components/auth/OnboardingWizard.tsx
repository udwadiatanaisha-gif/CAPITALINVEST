import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BrandLogo } from '../common/BrandLogo';
import { 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Building, 
  Globe, 
  FileSpreadsheet, 
  ShieldCheck, 
  User, 
  Target, 
  TrendingUp,
  Sparkles
} from 'lucide-react';

export const OnboardingWizard: React.FC = () => {
  const { currentUser, firmSettings, updateSettings, navigate, clients, goals, holdings } = useApp();

  const isClientRole = currentUser?.role === 'Client';
  const [currentStep, setCurrentStep] = useState(1);

  // Advisor form state
  const [advisorProfile, setAdvisorProfile] = useState({
    title: 'Senior Wealth Advisor',
    city: 'Mumbai',
    phone: '+91 98200 12345'
  });

  const [firmConfig, setFirmConfig] = useState({
    firmName: firmSettings.firmName,
    currency: 'INR' as const,
    timeZone: 'Asia/Kolkata' as const,
    dateFormat: 'DD/MM/YYYY' as const
  });

  const [dataPreference, setDataPreference] = useState<'sample' | 'sheets' | 'manual'>('sample');

  const totalSteps = isClientRole ? 5 : 6;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Completed!
      if (isClientRole) {
        navigate('client-dashboard');
      } else {
        updateSettings({
          firmName: firmConfig.firmName,
          defaultCurrency: firmConfig.currency,
          defaultTimeZone: firmConfig.timeZone,
          dateFormat: firmConfig.dateFormat
        });
        navigate('dashboard');
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-3xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block mb-3">
            <BrandLogo size="md" />
          </div>
          <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#101C2C]">
            {isClientRole ? 'Welcome to Your Private Wealth Portal' : 'CapitalVest Advisor Workspace Setup'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Step {currentStep} of {totalSteps}: {isClientRole ? 'Client Onboarding' : 'Firm & Data Hub Initialization'}
          </p>

          {/* Stepper Dots */}
          <div className="flex items-center justify-center space-x-2 mt-4">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i + 1 === currentStep 
                    ? 'w-8 bg-[#C6A76A]' 
                    : i + 1 < currentStep 
                    ? 'w-4 bg-[#147D64]' 
                    : 'w-4 bg-slate-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Wizard Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 sm:p-10">
          {!isClientRole ? (
            /* Advisor Flow */
            <div>
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <span className="text-xs uppercase font-bold tracking-wider text-[#C6A76A]">Step 1</span>
                    <h3 className="text-xl font-bold text-[#101C2C]">Complete Your Professional Profile</h3>
                    <p className="text-xs text-slate-500 mt-1">Configure your advisor identity displayed to clients and on PDF reports.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name</label>
                      <input
                        type="text"
                        value={currentUser?.name || 'Tanaisha Udwadia'}
                        disabled
                        className="w-full px-3 py-2 text-sm bg-slate-50 rounded-lg border border-slate-300 text-slate-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Professional Title</label>
                      <input
                        type="text"
                        value={advisorProfile.title}
                        onChange={e => setAdvisorProfile({ ...advisorProfile, title: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#C6A76A]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Office Location</label>
                      <input
                        type="text"
                        value={advisorProfile.city}
                        onChange={e => setAdvisorProfile({ ...advisorProfile, city: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#C6A76A]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Advisor Direct Phone</label>
                      <input
                        type="text"
                        value={advisorProfile.phone}
                        onChange={e => setAdvisorProfile({ ...advisorProfile, phone: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#C6A76A]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <span className="text-xs uppercase font-bold tracking-wider text-[#C6A76A]">Step 2</span>
                    <h3 className="text-xl font-bold text-[#101C2C]">Set Firm Details & Brand Identity</h3>
                    <p className="text-xs text-slate-500 mt-1">Customize your firm name and client-facing branding.</p>
                  </div>
                  <div className="pt-2 space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Firm Name</label>
                      <input
                        type="text"
                        value={firmConfig.firmName}
                        onChange={e => setFirmConfig({ ...firmConfig, firmName: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#C6A76A]"
                      />
                    </div>
                    <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
                      <span className="font-semibold block text-slate-900 mb-1">Tagline & Motto:</span>
                      "Building Wealth. Securing Generations."
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <span className="text-xs uppercase font-bold tracking-wider text-[#C6A76A]">Step 3</span>
                    <h3 className="text-xl font-bold text-[#101C2C]">Configure Reporting Currency & Standards</h3>
                    <p className="text-xs text-slate-500 mt-1">Compliant with Indian financial conventions by default.</p>
                  </div>
                  <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-[#F7F5F0] border border-slate-200">
                      <span className="text-xs font-medium text-slate-500">Base Currency</span>
                      <div className="text-base font-bold text-[#101C2C] mt-1">Indian Rupee (INR ₹)</div>
                      <span className="text-[11px] text-[#147D64]">Lakhs & Crores formatting enabled</span>
                    </div>
                    <div className="p-4 rounded-lg bg-[#F7F5F0] border border-slate-200">
                      <span className="text-xs font-medium text-slate-500">Operating Timezone</span>
                      <div className="text-base font-bold text-[#101C2C] mt-1">Asia/Kolkata (IST)</div>
                      <span className="text-[11px] text-slate-600">UTC +05:30</span>
                    </div>
                    <div className="p-4 rounded-lg bg-[#F7F5F0] border border-slate-200">
                      <span className="text-xs font-medium text-slate-500">Date Format</span>
                      <div className="text-base font-bold text-[#101C2C] mt-1">DD/MM/YYYY</div>
                      <span className="text-[11px] text-slate-600">Indian standard convention</span>
                    </div>
                    <div className="p-4 rounded-lg bg-[#F7F5F0] border border-slate-200">
                      <span className="text-xs font-medium text-slate-500">Fiscal Year Cycle</span>
                      <div className="text-base font-bold text-[#101C2C] mt-1">01 April — 31 March</div>
                      <span className="text-[11px] text-slate-600">Indian tax year aligned</span>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <span className="text-xs uppercase font-bold tracking-wider text-[#C6A76A]">Step 4</span>
                    <h3 className="text-xl font-bold text-[#101C2C]">Connect a Spreadsheet or Load Demo Data</h3>
                    <p className="text-xs text-slate-500 mt-1">Choose how you want to initialize your wealth management workspace.</p>
                  </div>
                  <div className="pt-2 space-y-3">
                    <label className={`block p-4 rounded-xl border cursor-pointer transition-all ${dataPreference === 'sample' ? 'border-[#C6A76A] bg-amber-50/40' : 'border-slate-200 hover:bg-slate-50'}`}>
                      <div className="flex items-start space-x-3">
                        <input
                          type="radio"
                          name="dataPref"
                          checked={dataPreference === 'sample'}
                          onChange={() => setDataPreference('sample')}
                          className="mt-1 text-[#147D64]"
                        />
                        <div>
                          <span className="font-bold text-sm text-[#101C2C]">Load Coherent Indian Demo Dataset (Recommended)</span>
                          <p className="text-xs text-slate-600 mt-0.5">
                            Seeds 8 fictional clients (Aarav Mehta, Ananya Shah, Dr. Rohan Desai), ₹24.5 Cr in sample holdings, multi-asset allocations, and goals.
                          </p>
                        </div>
                      </div>
                    </label>

                    <label className={`block p-4 rounded-xl border cursor-pointer transition-all ${dataPreference === 'sheets' ? 'border-[#C6A76A] bg-amber-50/40' : 'border-slate-200 hover:bg-slate-50'}`}>
                      <div className="flex items-start space-x-3">
                        <input
                          type="radio"
                          name="dataPref"
                          checked={dataPreference === 'sheets'}
                          onChange={() => setDataPreference('sheets')}
                          className="mt-1 text-[#147D64]"
                        />
                        <div>
                          <span className="font-bold text-sm text-[#101C2C]">Connect Google Sheets Live Data Hub</span>
                          <p className="text-xs text-slate-600 mt-0.5">
                            Connect your firm's Google Workspace sheet or demat broker export in the Data Hub wizard.
                          </p>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {currentStep === 5 && (
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <span className="text-xs uppercase font-bold tracking-wider text-[#C6A76A]">Step 5</span>
                    <h3 className="text-xl font-bold text-[#101C2C]">Review Data Mapping & Security Invariants</h3>
                    <p className="text-xs text-slate-500 mt-1">Verify data validation constraints before launching.</p>
                  </div>
                  <div className="pt-2 space-y-3 text-xs">
                    <div className="flex items-center space-x-2 text-emerald-800 bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4 text-[#147D64]" />
                      <span>Standard Indian stock symbols mapped (e.g. TCS.NS, RELIANCE.NS, GOLDBEES.NS)</span>
                    </div>
                    <div className="flex items-center space-x-2 text-emerald-800 bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4 text-[#147D64]" />
                      <span>7-Pillar Health diagnostic engine calibrated to Indian HNW savings benchmarks</span>
                    </div>
                    <div className="flex items-center space-x-2 text-emerald-800 bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4 text-[#147D64]" />
                      <span>Automatic concentration risk guards set at 25% single-asset threshold</span>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 6 && (
                <div className="space-y-4 text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#147D64] mx-auto flex items-center justify-center">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <h3 className="font-serif-display text-2xl font-bold text-[#101C2C]">Setup Complete!</h3>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto">
                    Your CapitalVest Wealth Management Command Centre is ready. You can now monitor clients, import spreadsheets, and generate reports.
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Client Flow */
            <div>
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <span className="text-xs uppercase font-bold tracking-wider text-[#C6A76A]">Step 1</span>
                    <h3 className="text-xl font-bold text-[#101C2C]">Confirm Profile Details</h3>
                    <p className="text-xs text-slate-500 mt-1">Verify your basic legal and communication information.</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <div><span className="text-slate-500">Name:</span> <strong className="text-slate-800">{currentUser?.name}</strong></div>
                    <div><span className="text-slate-500">Email:</span> <strong className="text-slate-800">{currentUser?.email}</strong></div>
                    <div><span className="text-slate-500">Account Type:</span> <strong className="text-slate-800">Private Client Portal</strong></div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <span className="text-xs uppercase font-bold tracking-wider text-[#C6A76A]">Step 2</span>
                    <h3 className="text-xl font-bold text-[#101C2C]">Your Dedicated Wealth Advisor</h3>
                    <p className="text-xs text-slate-500 mt-1">Direct contact information for your portfolio manager.</p>
                  </div>
                  <div className="p-5 bg-[#101C2C] text-white rounded-xl space-y-2 text-xs">
                    <div className="text-base font-bold text-[#C6A76A]">Tanaisha Udwadia</div>
                    <div className="text-slate-300">Lead Wealth Advisor | CapitalVest Mumbai</div>
                    <div className="text-slate-400 pt-2">Direct: +91 22 4988 7700 | advisor@capitalvest.in</div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <span className="text-xs uppercase font-bold tracking-wider text-[#C6A76A]">Step 3</span>
                    <h3 className="text-xl font-bold text-[#101C2C]">Your Financial Goals</h3>
                    <p className="text-xs text-slate-500 mt-1">Review active life planning milestones tracked in your portal.</p>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-3 bg-white rounded border border-slate-200 flex justify-between items-center">
                      <span className="font-bold text-slate-800">Higher Education & University Fund</span>
                      <span className="text-emerald-700 font-semibold">On Track</span>
                    </div>
                    <div className="p-3 bg-white rounded border border-slate-200 flex justify-between items-center">
                      <span className="font-bold text-slate-800">Retirement & Sabbatical Estate</span>
                      <span className="text-emerald-700 font-semibold">On Track</span>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <span className="text-xs uppercase font-bold tracking-wider text-[#C6A76A]">Step 4</span>
                    <h3 className="text-xl font-bold text-[#101C2C]">Portfolio Visibility & Data Freshness</h3>
                    <p className="text-xs text-slate-500 mt-1">Your holdings and asset values reflect recorded cost basis and verified benchmark prices.</p>
                  </div>
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900">
                    <ShieldCheck className="w-5 h-5 text-[#147D64] mb-2" />
                    <span>Your private records are encrypted and segregated from other clients. You can download official wealth PDF statements anytime.</span>
                  </div>
                </div>
              )}

              {currentStep === 5 && (
                <div className="space-y-4 text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#147D64] mx-auto flex items-center justify-center">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <h3 className="font-serif-display text-2xl font-bold text-[#101C2C]">Welcome to Your Portal!</h3>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto">
                    Your personal wealth dashboard is ready for viewing.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Wizard Controls */}
          <div className="flex items-center justify-between pt-8 border-t border-slate-100 mt-8">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center transition-colors cursor-pointer ${
                currentStep === 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back
            </button>

            <button
              onClick={handleNext}
              className="px-6 py-2.5 bg-[#101C2C] hover:bg-[#172B46] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center cursor-pointer"
            >
              {currentStep === totalSteps ? (isClientRole ? 'Open Client Portal' : 'Open Command Centre') : 'Continue'}
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
