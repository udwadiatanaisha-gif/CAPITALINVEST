import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  TrendingUp, 
  Target, 
  PieChart, 
  Clock, 
  Users, 
  ShieldAlert, 
  Calendar, 
  FileText, 
  AlertCircle,
  ArrowRight
} from 'lucide-react';

export const SolutionsPage: React.FC = () => {
  const { navigate } = useApp();

  const solutions = [
    {
      icon: TrendingUp,
      title: 'Portfolio Monitoring',
      description: 'Unified multi-asset valuation across listed equities, corporate & sovereign debt, physical/digital gold, liquid reserves, and real estate REITs.',
      actionView: 'portfolio-overview',
      actionLabel: 'View Portfolio Engine'
    },
    {
      icon: Target,
      title: 'Financial Goal Planning',
      description: 'Directly link liquid and capital assets to bespoke life milestones. Calculate compound future value growth, required monthly contributions, and progress tracking.',
      actionView: 'goals',
      actionLabel: 'Explore Goal Planning'
    },
    {
      icon: PieChart,
      title: 'Investment Allocation Analysis',
      description: 'Analyze asset class distribution against risk tolerance benchmarks. Identify portfolio drift, cash drag, and excessive single-holding concentrations.',
      actionView: 'asset-allocation',
      actionLabel: 'Analyze Allocations'
    },
    {
      icon: Clock,
      title: 'Retirement & Perpetual Income',
      description: 'Model post-career cash flow requirements, safe perpetual withdrawal rates, and longevity capital preservation adjusted for Indian urban cost-of-living inflation.',
      actionView: 'goals',
      actionLabel: 'Model Retirement Goals'
    },
    {
      icon: Users,
      title: 'Family & Generational Planning',
      description: 'Structure multi-generational wealth accounts, earmarked higher-education trusts, and matrimonial provisions with complete audit histories.',
      actionView: 'clients',
      actionLabel: 'Family Account Directory'
    },
    {
      icon: ShieldAlert,
      title: 'Insurance & Protection Overview',
      description: 'Identify family risk protection gaps across term life, critical illness, and asset casualty coverage before sudden market drawdowns or unexpected life events.',
      actionView: 'risk',
      actionLabel: 'Review Risk Centre'
    },
    {
      icon: Calendar,
      title: 'Client Review Management',
      description: 'Systematic scheduling of quarterly, bi-annual, and annual portfolio governance meetings with automated agenda generation and follow-up task logging.',
      actionView: 'meetings',
      actionLabel: 'Open Meeting Scheduler'
    },
    {
      icon: FileText,
      title: 'Professional Financial Reporting',
      description: 'Generate publication-grade PDF wealth reports complete with CapitalVest branding, client holding tables, asset charts, and regulatory disclosures in one click.',
      actionView: 'reports',
      actionLabel: 'Generate Client Reports'
    }
  ];

  return (
    <div className="bg-[#F7F5F0] min-h-screen text-[#101C2C]">
      {/* Header Banner */}
      <div className="bg-[#101C2C] text-white py-20 border-b border-[#172B46]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#C6A76A]">Advisory Capabilities</span>
          <h1 className="font-serif-display text-4xl sm:text-5xl font-bold mt-2">
            Comprehensive Wealth Solutions
          </h1>
          <p className="mt-4 text-base text-slate-300 leading-relaxed">
            Institutional-grade infrastructure designed to support every phase of the client wealth management lifecycle.
          </p>
        </div>
      </div>

      {/* Solutions Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {solutions.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="bg-white p-7 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-lg bg-[#101C2C] text-[#C6A76A] flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#101C2C] mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-6">
                    {item.description}
                  </p>
                </div>
                <div>
                  <button
                    onClick={() => navigate(item.actionView)}
                    className="text-xs font-bold text-[#147D64] hover:text-[#116954] inline-flex items-center cursor-pointer"
                  >
                    {item.actionLabel}
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Regulatory Disclosure Banner (Section 4 Page 3 requirement) */}
        <div className="mt-16 p-6 rounded-xl bg-amber-50 border border-amber-200 flex items-start space-x-4">
          <AlertCircle className="w-6 h-6 text-amber-700 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed">
            <span className="font-bold">Important Analytical Scope Disclosure:</span> CapitalVest provides financial consolidation, holding valuation, mathematical projections, and organizational workflows. The software platform does not provide automated trading, discretionary portfolio execution, or guaranteed returns. All investment decisions must be executed in accordance with client instructions and licensed regulatory guidance.
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <button
            onClick={() => navigate('dashboard')}
            className="inline-flex items-center px-8 py-3.5 bg-[#C6A76A] hover:bg-[#b89759] text-[#101C2C] font-semibold text-sm rounded-md shadow-md transition-all cursor-pointer"
          >
            Open Advisor Command Centre
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};
