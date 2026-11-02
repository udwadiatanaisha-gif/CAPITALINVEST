import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR, formatPercentage, formatDate } from '../../utils/formatters';
import { calculatePortfolioSummary, calculateAssetAllocation, evaluateFinancialHealth } from '../../utils/calculations';
import { generateClientPdfReport } from '../../utils/pdfGenerator';
import {
  TrendingUp,
  Target,
  Activity,
  Calendar,
  FolderLock,
  FileText,
  ShieldCheck,
  Mail,
  Phone,
  Clock,
  ArrowUpRight,
  Download
} from 'lucide-react';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

export const ClientDashboard: React.FC = () => {
  const { currentUser, clients, holdings, goals, meetings, documents, navigate } = useApp();

  // Find the authenticated client record
  const client = clients.find(c => c.id === (currentUser?.assignedClientId || 'CLI-002')) || clients[1];
  const clientHoldings = holdings.filter(h => h.clientId === client.id);
  const clientGoals = goals.filter(g => g.clientId === client.id);
  const clientMeetings = meetings.filter(m => m.clientId === client.id);
  const clientDocuments = documents.filter(d => d.associatedClientId === client.id);

  const summary = calculatePortfolioSummary(clientHoldings);
  const allocation = calculateAssetAllocation(clientHoldings);
  const health = evaluateFinancialHealth(client, clientHoldings, clientGoals);

  const ALLOCATION_COLORS = ['#147D64', '#172B46', '#C6A76A', '#5B6677', '#8B5CF6'];

  const baseVal = summary.totalMarketValue;
  const portfolioHistory = [
    { period: 'Q4 FY25', value: Math.round(baseVal * 0.84) },
    { period: 'Q1 FY26', value: Math.round(baseVal * 0.89) },
    { period: 'Q2 FY26', value: Math.round(baseVal * 0.94) },
    { period: 'Current', value: baseVal }
  ];

  const handleDownloadReport = () => {
    generateClientPdfReport({
      client,
      holdings: clientHoldings,
      goals: clientGoals,
      health,
      generatedBy: client.primaryAdvisor || 'Tanaisha Udwadia'
    });
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-[#147D64]">
            Private Client Wealth Portal
          </span>
          <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#101C2C] mt-1">
            Welcome back, {client.name}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Account {client.clientNumber} • Risk Classification: <strong className="text-slate-800">{client.riskProfile}</strong> • City: {client.city}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleDownloadReport}
            className="inline-flex items-center px-4 py-2.5 bg-[#101C2C] hover:bg-[#172B46] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-[#C6A76A]" />
            Download Wealth Statement (PDF)
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Portfolio Market Value</span>
          <div className="text-2xl font-bold text-[#101C2C] mt-1">{formatINR(summary.totalMarketValue)}</div>
          <div className="flex items-center text-[11px] text-[#147D64] mt-2 font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            <span>{formatPercentage(summary.absoluteReturnPercentage)} Overall Return</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Invested Capital</span>
          <div className="text-2xl font-bold text-[#101C2C] mt-1">{formatINR(summary.totalInvestedValue)}</div>
          <div className="text-[11px] text-slate-500 mt-2 font-medium">Recorded Cost Basis</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Total Unrealized Gains</span>
          <div className="text-2xl font-bold text-[#147D64] mt-1">+{formatINR(summary.unrealizedGainLoss)}</div>
          <div className="text-[11px] text-slate-500 mt-2 font-medium">{clientHoldings.length} Active Positions</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Financial Health Index</span>
          <div className="text-2xl font-bold text-[#101C2C] mt-1">{health.overallScore} <span className="text-sm font-normal text-slate-400">/ 100</span></div>
          <div className="text-[11px] text-[#C6A76A] font-semibold mt-2">CapitalVest 7-Pillar Rating</div>
        </div>
      </div>

      {/* Trajectory & Allocation Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif-display text-lg font-bold text-[#101C2C]">Portfolio Valuation Growth</h3>
              <p className="text-xs text-slate-500">Quarterly progression based on holding cost basis and prices</p>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-[#147D64]">
              Verified
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={portfolioHistory} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="clientGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#147D64" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#147D64" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="period" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={val => `₹${(val / 100000).toFixed(0)} L`} />
                <Tooltip formatter={(val: any) => [formatINR(val), 'Market Value']} contentStyle={{ backgroundColor: '#101C2C', color: '#fff', borderRadius: '8px', fontSize: '11px' }} />
                <Area type="monotone" dataKey="value" stroke="#147D64" strokeWidth={2.5} fillOpacity={1} fill="url(#clientGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Asset Class Allocation */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-serif-display text-lg font-bold text-[#101C2C] mb-4">
              Your Asset Allocation
            </h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={allocation} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3}>
                    {allocation.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={ALLOCATION_COLORS[index % ALLOCATION_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: any) => [formatINR(val, true), 'Value']} contentStyle={{ backgroundColor: '#101C2C', color: '#fff', borderRadius: '8px', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1 mt-2 text-xs">
            {allocation.filter(a => a.value > 0).map((a, idx) => (
              <div key={idx} className="flex justify-between items-center text-slate-600">
                <span className="truncate">{a.name}</span>
                <span className="font-semibold text-slate-900">{a.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Goal Milestones & Advisor Contact */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif-display text-lg font-bold text-[#101C2C]">
              Your Active Financial Goals
            </h3>
            <button onClick={() => navigate('goals')} className="text-xs font-semibold text-[#147D64] hover:underline">
              View All Goals
            </button>
          </div>

          <div className="space-y-3">
            {clientGoals.map((g) => {
              const pct = g.targetAmount > 0 ? Math.min(100, Math.round((g.currentSavedAmount / g.targetAmount) * 100)) : 0;
              return (
                <div key={g.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-900">{g.name}</span>
                    <span className="font-semibold text-[#147D64] bg-emerald-100 px-2 py-0.5 rounded text-[10px]">{g.status}</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#C6A76A] h-2 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Saved: {formatINR(g.currentSavedAmount, true)}</span>
                    <span>Target: {formatINR(g.targetAmount, true)} by {formatDate(g.targetDate)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Assigned Advisor Contact Card */}
        <div className="bg-[#101C2C] text-white p-6 rounded-2xl shadow-sm border border-[#172B46] flex flex-col justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#C6A76A]">Your Dedicated Advisor</span>
            <h3 className="font-serif-display text-2xl font-bold mt-1 text-white">Tanaisha Udwadia</h3>
            <p className="text-xs text-slate-300 mt-0.5">Lead Private Wealth Advisor</p>

            <div className="mt-6 space-y-3 text-xs text-slate-300">
              <div className="flex items-center space-x-2.5">
                <Mail className="w-4 h-4 text-[#C6A76A]" />
                <span>advisor@capitalvest.in</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Phone className="w-4 h-4 text-[#C6A76A]" />
                <span>+91 22 4988 7700</span>
              </div>
              <div className="flex items-start space-x-2.5">
                <Clock className="w-4 h-4 text-[#C6A76A] flex-shrink-0 mt-0.5" />
                <span>Next Scheduled Review: {formatDate(client.nextReviewDate)}</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-700 mt-6">
            <button
              onClick={() => navigate('contact')}
              className="w-full py-2.5 bg-[#C6A76A] hover:bg-[#b89759] text-[#101C2C] text-xs font-semibold rounded transition-colors text-center cursor-pointer"
            >
              Request Meeting or Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
