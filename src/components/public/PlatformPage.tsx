import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, 
  Users, 
  FileSpreadsheet, 
  Target, 
  ShieldAlert, 
  FileText, 
  Activity, 
  CheckCircle, 
  ArrowRight,
  Database
} from 'lucide-react';

export const PlatformPage: React.FC = () => {
  const { navigate } = useApp();

  const modules = [
    {
      id: 'dashboard',
      name: 'Advisor Command Centre',
      category: 'Overview & Analytics',
      description: 'Central dashboard with live AUM, invested capital, unrealized gain/loss, active alerts, and time-range filtering.',
      features: ['Consolidated AUM tracker', 'Visual asset allocation donut', 'Action centre & quick actions', 'Data status strip'],
      targetView: 'dashboard'
    },
    {
      id: 'clients',
      name: 'Client Directory & 360 Profiles',
      category: 'Relationship Management',
      description: 'Comprehensive client dossiers with investment objectives, risk categories, document repositories, and meeting logs.',
      features: ['Filter by HNW/Affluent category', 'Full KYC & contact record', 'Client 360 multi-tab profile', 'One-click archival'],
      targetView: 'clients'
    },
    {
      id: 'datahub',
      name: 'Spreadsheet Data Hub',
      category: 'Data Operations',
      description: 'Bidirectional Google Sheets sync connector and 8-step Excel (.xlsx) / CSV guided import wizard with row validation.',
      features: ['Live Google Workspace sync', 'Column mapping templates', 'Row-level error auditing', 'Idempotent deduplication'],
      targetView: 'data-hub'
    },
    {
      id: 'goals',
      name: 'Goal-Based Planning Engine',
      category: 'Wealth Planning',
      description: 'Mathematical compound interest projection engine mapping current savings and monthly SIPs to target milestones.',
      features: ['Future Value calculation', 'Shortfall / surplus alerts', 'Retirement & college funding', 'Progress visual tracking'],
      targetView: 'goals'
    },
    {
      id: 'health',
      name: '7-Pillar Financial Health Centre',
      category: 'Diagnostic Analytics',
      description: 'Transparent 0-100 financial health scoring engine evaluating liquidity, emergency reserves, debt, and insurance coverage.',
      features: ['Explainable methodology panel', 'Configurable scoring weights', 'Strengths & focus highlights', 'Advisor audit notes'],
      targetView: 'health'
    },
    {
      id: 'risk',
      name: 'Risk Monitoring & Alert Centre',
      category: 'Governance & Compliance',
      description: 'Deterministic alert engine flagging single-holding concentration risks, overdue reviews, and stale asset prices.',
      features: ['Threshold configuration', 'Open/In-progress/Resolved states', 'Assignee escalation', 'Full resolution audit log'],
      targetView: 'risk'
    },
    {
      id: 'reports',
      name: 'PDF Wealth Statement Generator',
      category: 'Client Reporting',
      description: 'Generates polished, downloadable client PDF reports with executive summary, holdings table, asset charts, and disclaimers.',
      features: ['jsPDF & autoTable engine', 'Firm logo & cover page', 'Print-friendly layouts', 'CSV & Excel data exports'],
      targetView: 'reports'
    },
    {
      id: 'security',
      name: 'Enterprise RBAC & Audit Trail',
      category: 'Security & Access',
      description: 'Five distinct access tiers: Administrator, Advisor, Operations, Read-only Reviewer, and isolated Client portals.',
      features: ['Row-level data authorization', 'Cryptographic audit log', 'Client portal isolation', 'No credential leakage'],
      targetView: 'audit-log'
    }
  ];

  return (
    <div className="bg-[#F7F5F0] min-h-screen text-[#101C2C]">
      {/* Banner */}
      <div className="bg-[#101C2C] text-white py-20 border-b border-[#172B46]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#C6A76A]">System Architecture</span>
          <h1 className="font-serif-display text-4xl sm:text-5xl font-bold mt-2">
            The CapitalVest Platform Architecture
          </h1>
          <p className="mt-4 text-base text-slate-300 leading-relaxed">
            A modular wealth management operating system combining intuitive advisor workflows with robust enterprise data processing.
          </p>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {modules.map((m) => (
            <div key={m.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#147D64] bg-[#147D64]/10 px-2.5 py-0.5 rounded-full">
                  {m.category}
                </span>
                <h3 className="text-lg font-bold text-[#101C2C] mt-3 mb-2">{m.name}</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {m.description}
                </p>
                <div className="space-y-1.5 mb-6">
                  {m.features.map((feat, i) => (
                    <div key={i} className="flex items-center text-[11px] text-slate-700">
                      <CheckCircle className="w-3.5 h-3.5 text-[#C6A76A] mr-1.5 flex-shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={() => navigate(m.targetView)}
                  className="w-full py-2 px-3 bg-[#101C2C] hover:bg-[#172B46] text-white text-xs font-semibold rounded flex items-center justify-center transition-colors cursor-pointer"
                >
                  Launch Module
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Integration Callout */}
        <div className="mt-16 bg-white p-8 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <h4 className="text-base font-bold text-[#101C2C]">Ready to experience the unified command centre?</h4>
            <p className="text-xs text-slate-600">Access preloaded Indian portfolios or import your own Excel/CSV files.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('dashboard')}
              className="px-6 py-2.5 bg-[#C6A76A] hover:bg-[#b89759] text-[#101C2C] font-semibold text-xs rounded transition-colors cursor-pointer"
            >
              Open Dashboard
            </button>
            <button
              onClick={() => navigate('signin')}
              className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#101C2C] font-semibold text-xs rounded transition-colors cursor-pointer"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
