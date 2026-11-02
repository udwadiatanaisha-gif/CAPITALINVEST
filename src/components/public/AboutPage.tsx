import React from 'react';
import { useApp } from '../../context/AppContext';
import { Shield, Award, Users, Compass, CheckCircle2, ArrowRight } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { navigate, firmSettings } = useApp();

  return (
    <div className="bg-[#F7F5F0] min-h-screen text-[#101C2C]">
      {/* Page Header */}
      <div className="bg-[#101C2C] text-white py-20 border-b border-[#172B46]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#C6A76A]">About CapitalVest</span>
          <h1 className="font-serif-display text-4xl sm:text-5xl font-bold mt-2">
            Stewardship, Clarity & Generational Protection
          </h1>
          <p className="mt-4 text-base text-slate-300 leading-relaxed">
            Founded on the belief that significant wealth requires both institutional analytical rigor and deeply personal advisor stewardship.
          </p>
        </div>
      </div>

      {/* Brand Mission & Philosophy */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <span className="text-xs uppercase font-semibold tracking-wider text-[#147D64]">Our Mission</span>
            <h2 className="font-serif-display text-3xl font-bold text-[#101C2C] mt-2 mb-4">
              Building Wealth. Securing Generations.
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              CapitalVest was created to solve a persistent challenge faced by accomplished Indian families and high-net-worth individuals: the fragmentation of financial data across disconnected institutions, brokers, and informal spreadsheets.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              By uniting multi-asset portfolio monitoring, goal-based capital allocation, risk monitoring, and spreadsheet synchronization into an intuitive command centre, we empower wealth advisors to deliver unparalleled clarity and accountability.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-lg border border-slate-200">
                <span className="text-2xl font-bold text-[#147D64]">100%</span>
                <p className="text-xs text-slate-500 mt-1">Mathematical calculation transparency without synthetic estimates.</p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-slate-200">
                <span className="text-2xl font-bold text-[#C6A76A]">7-Pillar</span>
                <p className="text-xs text-slate-500 mt-1">Comprehensive financial health diagnostic framework.</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-[#101C2C] border-b pb-3">Our Core Principles</h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-[#147D64] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-900">Client-First Alignment</h4>
                  <p className="text-xs text-slate-600 mt-0.5">Recommendations serve the client's documented investment policy, never product sales targets.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-[#147D64] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-900">Financial Transparency</h4>
                  <p className="text-xs text-slate-600 mt-0.5">Every rupee of cost basis, realized gains, and portfolio weight is verifiable from raw records.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-[#147D64] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-900">Data Security by Design</h4>
                  <p className="text-xs text-slate-600 mt-0.5">Strict role-based access control (RBAC) ensures client records and advisor notes are strictly partitioned.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-[#147D64] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-900">Long-Term Horizon Focus</h4>
                  <p className="text-xs text-slate-600 mt-0.5">Goal planning accounts for inflation, compound returns, and multi-decade family milestones.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lead Advisor Profile */}
        <div className="bg-white rounded-2xl p-8 sm:p-12 border border-slate-200 shadow-sm mb-20">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-[#101C2C] border-4 border-[#C6A76A]/40 flex items-center justify-center flex-shrink-0 text-white font-serif-display text-4xl shadow-md">
                TU
              </div>
              <div className="space-y-3 text-center md:text-left">
                <div className="inline-block px-3 py-1 bg-[#147D64]/10 text-[#147D64] text-xs font-semibold rounded-full">
                  Lead Wealth Advisor & Command Centre Architect
                </div>
                <h3 className="font-serif-display text-3xl font-bold text-[#101C2C]">Tanaisha Udwadia</h3>
                <p className="text-xs text-slate-500 font-medium">Head of Private Wealth Advisory | Mumbai, Maharashtra</p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Tanaisha Udwadia leads client advisory architectures and portfolio strategy at CapitalVest. Specializing in family wealth preservation, cross-asset allocation, and generational succession planning, Tanaisha designed the CapitalVest 7-Pillar Health Framework to provide clients with absolute clarity regarding their financial readiness.
                </p>
                <div className="flex flex-wrap gap-2 pt-2 justify-center md:justify-start text-xs">
                  <span className="px-3 py-1 bg-slate-100 rounded text-slate-700">Family Office Architecture</span>
                  <span className="px-3 py-1 bg-slate-100 rounded text-slate-700">Multi-Asset Allocation</span>
                  <span className="px-3 py-1 bg-slate-100 rounded text-slate-700">Goal-Based Wealth Structuring</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={() => navigate('contact')}
            className="inline-flex items-center px-6 py-3 bg-[#101C2C] hover:bg-[#172B46] text-white rounded-md text-sm font-semibold transition-colors cursor-pointer"
          >
            Connect with an Advisor
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};
