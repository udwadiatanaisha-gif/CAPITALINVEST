import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR, formatPercentage } from '../../utils/formatters';
import { 
  TrendingUp, 
  Target, 
  Users, 
  FileSpreadsheet, 
  ShieldCheck, 
  ChevronRight, 
  ArrowRight, 
  PieChart, 
  FileText, 
  CheckCircle2, 
  BarChart3,
  Sparkles,
  Layers
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { navigate } = useApp();

  // Illustrative sample data for the interactive preview
  const sampleAUM = 48500000; // 4.85 Cr
  const sampleInvested = 39800000;
  const sampleGain = sampleAUM - sampleInvested;
  const sampleReturn = (sampleGain / sampleInvested) * 100;

  const sampleAllocation = [
    { name: 'Equity', pct: 58, color: '#147D64', value: '₹2.81 Cr' },
    { name: 'Debt', pct: 24, color: '#172B46', value: '₹1.16 Cr' },
    { name: 'Gold & Metals', pct: 10, color: '#C6A76A', value: '₹48.5 L' },
    { name: 'Cash & Liquid', pct: 8, color: '#5B6677', value: '₹38.8 L' }
  ];

  return (
    <div className="bg-[#F7F5F0] text-[#101C2C]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#101C2C] via-[#172B46] to-[#101C2C] text-white pt-20 pb-28">
        {/* Subtle geometric decorative lines */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full border border-[#C6A76A]" />
          <div className="absolute top-1/2 -right-40 w-[600px] h-[600px] rounded-full border border-emerald-500/30" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-[#C6A76A]/40 text-[#C6A76A] text-xs font-medium uppercase tracking-wider mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Wealth Management Command Centre
            </div>
            
            <h1 className="font-serif-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
              Build Wealth with Clarity. <br />
              <span className="text-[#C6A76A]">Protect What Matters.</span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Your financial journey deserves a clearer view. CapitalVest brings portfolio visibility, goal tracking, financial planning insights, and personalized wealth management workflows together in one secure platform.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => navigate('client-login')}
                className="inline-flex items-center px-6 py-3.5 rounded-md text-sm sm:text-base font-semibold text-white bg-[#147D64] hover:bg-[#116954] shadow-lg shadow-[#147D64]/20 transition-all cursor-pointer"
              >
                Client Login
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
              <button
                onClick={() => navigate('advisor-login')}
                className="inline-flex items-center px-6 py-3.5 rounded-md text-sm sm:text-base font-semibold text-[#101C2C] bg-[#C6A76A] hover:bg-[#b89759] shadow-lg shadow-[#C6A76A]/20 transition-all cursor-pointer"
              >
                Advisor Login
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
              <button
                onClick={() => navigate('platform')}
                className="inline-flex items-center px-6 py-3.5 rounded-md text-sm sm:text-base font-medium text-white bg-white/10 hover:bg-white/15 border border-white/20 transition-all cursor-pointer"
              >
                Explore Platform
              </button>
            </div>

            <p className="mt-4 text-xs text-slate-400">
              Configured for Indian Financial Conventions: INR (₹) • Lakhs / Crores • DD/MM/YYYY • Asia/Kolkata
            </p>
          </div>

          {/* Interactive Hero Preview Component */}
          <div className="mt-16 max-w-5xl mx-auto rounded-xl bg-white/95 text-[#101C2C] shadow-2xl border border-slate-200 overflow-hidden">
            {/* Top Workspace Header */}
            <div className="bg-[#101C2C] px-6 py-4 flex items-center justify-between text-white border-b border-[#172B46]">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-red-400/80" />
                <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
                <span className="text-xs font-mono text-slate-300 ml-2">CapitalVest Command Centre — Live Advisor Overview</span>
              </div>
              <span className="text-xs bg-[#147D64] text-white px-2.5 py-0.5 rounded-full font-medium">
                Live Interactive Snapshot
              </span>
            </div>

            {/* Preview Body */}
            <div className="p-6 sm:p-8 bg-white grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Summary Cards */}
              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-[#F7F5F0] border border-slate-200">
                    <span className="text-xs font-medium text-slate-500">Portfolio AUM</span>
                    <div className="text-lg sm:text-xl font-bold text-[#101C2C] mt-1">₹4.85 Cr</div>
                    <span className="text-[10px] text-emerald-700 font-semibold">+21.8% Overall</span>
                  </div>
                  <div className="p-4 rounded-lg bg-[#F7F5F0] border border-slate-200">
                    <span className="text-xs font-medium text-slate-500">Invested Capital</span>
                    <div className="text-lg sm:text-xl font-bold text-[#101C2C] mt-1">₹3.98 Cr</div>
                    <span className="text-[10px] text-slate-500">Cost Basis</span>
                  </div>
                  <div className="p-4 rounded-lg bg-[#F7F5F0] border border-slate-200">
                    <span className="text-xs font-medium text-slate-500">Unrealized Gain</span>
                    <div className="text-lg sm:text-xl font-bold text-[#147D64] mt-1">+₹87.0 L</div>
                    <span className="text-[10px] text-emerald-700 font-semibold">+21.86% Gain</span>
                  </div>
                  <div className="p-4 rounded-lg bg-[#F7F5F0] border border-slate-200">
                    <span className="text-xs font-medium text-slate-500">Health Index</span>
                    <div className="text-lg sm:text-xl font-bold text-[#101C2C] mt-1">88 / 100</div>
                    <span className="text-[10px] text-[#C6A76A] font-semibold">Tier 1 Rating</span>
                  </div>
                </div>

                {/* Sample Allocation Bar */}
                <div className="p-4 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#101C2C]">Asset Class Allocation</span>
                    <span className="text-xs text-slate-500">Balanced Growth Strategy</span>
                  </div>
                  {/* Visual Bar */}
                  <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-200">
                    <div style={{ width: '58%' }} className="bg-[#147D64]" title="Equity 58%" />
                    <div style={{ width: '24%' }} className="bg-[#172B46]" title="Debt 24%" />
                    <div style={{ width: '10%' }} className="bg-[#C6A76A]" title="Gold 10%" />
                    <div style={{ width: '8%' }} className="bg-slate-400" title="Cash 8%" />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-xs">
                    {sampleAllocation.map((item, idx) => (
                      <div key={idx} className="flex items-center space-x-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-slate-600">{item.name}:</span>
                        <span className="font-semibold text-slate-900">{item.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sample Goal Progression */}
                <div className="p-4 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold text-slate-900">Featured Goal: South Mumbai Penthouse</span>
                    <span className="text-[#147D64] font-bold">71% On Track</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#C6A76A] h-2 rounded-full" style={{ width: '71%' }} />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 mt-2">
                    <span>Saved: ₹8.50 Cr</span>
                    <span>Target: ₹12.00 Cr (Target: 2028)</span>
                  </div>
                </div>
              </div>

              {/* Action Column on Right */}
              <div className="p-5 rounded-lg bg-[#F7F5F0] border border-slate-200 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-bold text-[#101C2C] flex items-center mb-3">
                    <CheckCircle2 className="w-4 h-4 mr-1.5 text-[#147D64]" />
                    Advisor Operations Ready
                  </h4>
                  <ul className="space-y-2.5 text-xs text-slate-600">
                    <li className="flex items-start">
                      <span className="text-[#C6A76A] mr-1.5 font-bold">•</span>
                      <span>Real-time Google Sheets Live Synchronization</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#C6A76A] mr-1.5 font-bold">•</span>
                      <span>Excel (.xlsx) & CSV automated mapping wizard</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#C6A76A] mr-1.5 font-bold">•</span>
                      <span>1-click client wealth statements & printable PDFs</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#C6A76A] mr-1.5 font-bold">•</span>
                      <span>7-Pillar Financial Health assessment algorithm</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#C6A76A] mr-1.5 font-bold">•</span>
                      <span>Deterministic risk alerts & concentration guards</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-slate-300 mt-4">
                  <button
                    onClick={() => navigate('dashboard')}
                    className="w-full py-2.5 px-3 bg-[#101C2C] hover:bg-[#172B46] text-white rounded text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer"
                  >
                    Open Live Command Centre
                    <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section: Financial clarity, all in one place */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase font-semibold tracking-wider text-[#C6A76A]">Engineered for Modern Advisors</span>
          <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#101C2C] mt-2">
            Financial clarity, all in one place
          </h2>
          <p className="text-slate-600 mt-3 text-base">
            Consolidate fragmented brokerage statements, external portfolios, and client goals into a single authoritative workspace.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Card 1: Portfolio Intelligence */}
          <div className="bg-white p-7 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-[#101C2C] text-[#C6A76A] flex items-center justify-center mb-5">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#101C2C] mb-2">1. Portfolio Intelligence</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Understand real cost basis, unrealized gain/loss, asset class weights, and sector exposures across equities, fixed income, gold, and REITs.
            </p>
            <button
              onClick={() => navigate('portfolio-overview')}
              className="text-xs font-semibold text-[#147D64] hover:text-[#116954] inline-flex items-center cursor-pointer"
            >
              Explore Portfolio Analytics <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>

          {/* Card 2: Goal-Based Planning */}
          <div className="bg-white p-7 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-[#147D64] text-white flex items-center justify-center mb-5">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#101C2C] mb-2">2. Goal-Based Planning</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Connect investment assets directly to meaningful life milestones—from retirement and overseas education to luxury estate acquisitions.
            </p>
            <button
              onClick={() => navigate('goals')}
              className="text-xs font-semibold text-[#147D64] hover:text-[#116954] inline-flex items-center cursor-pointer"
            >
              Explore Goal Engine <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>

          {/* Card 3: Client Relationship Management */}
          <div className="bg-white p-7 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-[#172B46] text-[#C6A76A] flex items-center justify-center mb-5">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#101C2C] mb-2">3. Client Management 360</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Holistic client profiles combining KYC details, risk tolerance surveys, periodic meeting calendars, action tasks, and confidential files.
            </p>
            <button
              onClick={() => navigate('clients')}
              className="text-xs font-semibold text-[#147D64] hover:text-[#116954] inline-flex items-center cursor-pointer"
            >
              View Client Directory <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>

          {/* Card 4: Connected Financial Data */}
          <div className="bg-white p-7 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-[#C6A76A] text-[#101C2C] flex items-center justify-center mb-5">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#101C2C] mb-2">4. Connected Financial Data</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Synchronize live Google Sheets data and import Excel workbooks with automated column mapping, row-by-row validation, and rollback audits.
            </p>
            <button
              onClick={() => navigate('data-hub')}
              className="text-xs font-semibold text-[#147D64] hover:text-[#116954] inline-flex items-center cursor-pointer"
            >
              Open Data Hub <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>
        </div>
      </section>

      {/* Our Approach Section */}
      <section className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs uppercase font-semibold tracking-wider text-[#C6A76A]">Wealth Philosophy</span>
              <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#101C2C] mt-2 mb-6">
                Our disciplined approach to generational wealth
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 rounded-full bg-[#147D64]/10 text-[#147D64] flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-[#101C2C]">Radical Transparency</h4>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                      Every return figure, cost basis, and allocation weight is derived directly from verified holding records. No inflated claims or synthetic numbers.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 rounded-full bg-[#147D64]/10 text-[#147D64] flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-[#101C2C]">Disciplined Multi-Asset Diversification</h4>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                      Balancing high-growth Indian equities with capital preservation debt, sovereign gold hedges, and inflation-hedged commercial REITs.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 rounded-full bg-[#147D64]/10 text-[#147D64] flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-[#101C2C]">Advisor-Led, Technology-Enabled</h4>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                      Technology removes manual spreadsheet friction and automates compliance audits, allowing advisors to focus on empathetic client guidance.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 rounded-full bg-[#147D64]/10 text-[#147D64] flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5">
                    4
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-[#101C2C]">Responsible Data Management & Privacy</h4>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                      Client-level row isolation ensures confidential client holdings and family goals are accessible solely to authorized relationships.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Callout Box */}
            <div className="bg-[#101C2C] text-white p-8 sm:p-10 rounded-2xl shadow-xl relative overflow-hidden border border-[#172B46]">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#C6A76A]/10 rounded-full blur-3xl pointer-events-none" />
              <span className="text-xs font-semibold tracking-wider text-[#C6A76A] uppercase">Demo Lead Advisor</span>
              <h3 className="font-serif-display text-2xl font-bold mt-1 text-white">Tanaisha Udwadia</h3>
              <p className="text-xs text-slate-300 mt-0.5">Private Wealth Advisor & Command Centre Architect</p>

              <blockquote className="mt-6 text-sm text-slate-200 italic leading-relaxed border-l-2 border-[#C6A76A] pl-4">
                “True wealth management is never about chasing speculative momentum. It is about understanding what a family cherishes, mapping capital to life horizons, and stewarding assets through disciplined, transparent oversight.”
              </blockquote>

              <div className="mt-8 pt-6 border-t border-slate-700 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block">Lead Office</span>
                  <span className="font-semibold text-white">Nariman Point, Mumbai</span>
                </div>
                <div>
                  <span className="text-slate-400 block">System Currency</span>
                  <span className="font-semibold text-[#C6A76A]">Indian Rupee (₹)</span>
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={() => navigate('about')}
                  className="w-full py-3 bg-[#C6A76A] hover:bg-[#b89759] text-[#101C2C] font-semibold text-xs rounded transition-colors uppercase tracking-wider cursor-pointer"
                >
                  Read Advisor Profile & Philosophy
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-24 bg-gradient-to-r from-[#101C2C] via-[#172B46] to-[#101C2C] text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif-display text-3xl sm:text-5xl font-bold tracking-tight">
            Your next financial chapter starts with clarity.
          </h2>
          <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Experience the CapitalVest Command Centre today with preloaded illustrative Indian portfolios or connect your own spreadsheets.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => navigate('signup')}
              className="px-8 py-3.5 rounded-md text-base font-semibold text-[#101C2C] bg-[#C6A76A] hover:bg-[#b89759] shadow-lg transition-all cursor-pointer"
            >
              Get Started
            </button>
            <button
              onClick={() => navigate('signin')}
              className="px-8 py-3.5 rounded-md text-base font-medium text-white bg-white/10 hover:bg-white/15 border border-white/20 transition-all cursor-pointer"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
