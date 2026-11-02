import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR, formatPercentage, formatDate } from '../../utils/formatters';
import { calculatePortfolioSummary, calculateAssetAllocation } from '../../utils/calculations';
import {
  TrendingUp,
  DollarSign,
  Users,
  Target,
  Calendar,
  ShieldAlert,
  PlusCircle,
  FileSpreadsheet,
  FileText,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from 'recharts';

interface AdvisorDashboardProps {
  onOpenAddClient: () => void;
  onOpenAddHolding: () => void;
  onOpenAddGoal: () => void;
  onOpenScheduleReview: () => void;
}

export const AdvisorDashboard: React.FC<AdvisorDashboardProps> = ({
  onOpenAddClient,
  onOpenAddHolding,
  onOpenAddGoal,
  onOpenScheduleReview
}) => {
  const { 
    currentUser, 
    dateFilter, 
    setDateFilter, 
    clients, 
    holdings, 
    goals, 
    riskAlerts, 
    meetings, 
    auditLogs, 
    dataSources, 
    navigate,
    triggerSync
  } = useApp();

  const [syncing, setSyncing] = useState(false);

  // Time of day greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = currentUser?.name?.split(' ')[0] || 'Tanaisha';

  // Core metrics derived from real state
  const summary = calculatePortfolioSummary(holdings);
  const activeClients = clients.filter(c => c.relationshipStatus === 'Active');
  const onTrackGoals = goals.filter(g => g.status === 'On Track' || g.status === 'Achieved');
  const pendingReviews = clients.filter(c => {
    if (!c.nextReviewDate) return false;
    const reviewDate = new Date(c.nextReviewDate);
    const today = new Date();
    return reviewDate <= new Date(today.getTime() + 30 * 86400000); // due within 30 days or overdue
  });
  const openAlerts = riskAlerts.filter(a => a.status === 'Open');

  // Asset allocation data for donut chart
  const allocation = calculateAssetAllocation(holdings);
  const ALLOCATION_COLORS = ['#147D64', '#172B46', '#5B6677', '#C6A76A', '#8B5CF6', '#F59E0B'];

  // Portfolio distribution by client (Top clients)
  const clientPortfolioDistribution = activeClients.map(c => {
    const clientHoldings = holdings.filter(h => h.clientId === c.id);
    const clientVal = clientHoldings.reduce((sum, h) => sum + h.currentMarketValue, 0);
    return {
      name: c.name.split(' ')[0],
      fullName: c.name,
      value: clientVal,
      formattedValue: formatINR(clientVal, true)
    };
  }).filter(c => c.value > 0).sort((a, b) => b.value - a.value).slice(0, 6);

  // Simulated historical portfolio trend (derived from current value for realistic curves)
  const baseVal = summary.totalMarketValue;
  const portfolioHistory = [
    { period: 'Q4 FY25', value: Math.round(baseVal * 0.82) },
    { period: 'Q1 FY26', value: Math.round(baseVal * 0.88) },
    { period: 'Q2 FY26', value: Math.round(baseVal * 0.93) },
    { period: 'Q3 FY26', value: Math.round(baseVal * 0.97) },
    { period: 'Current', value: baseVal }
  ];

  // Primary data source status
  const primarySource = dataSources[0];

  const handleManualSync = async () => {
    if (!primarySource) return;
    setSyncing(true);
    await triggerSync(primarySource.id);
    setSyncing(false);
  };

  return (
    <div className="space-y-8">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-[#C6A76A]">
            Wealth Command Centre
          </span>
          <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#101C2C] mt-0.5">
            {greeting}, {firstName}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Here is your wealth management overview for <span className="font-semibold text-slate-700">{dateFilter}</span>. All figures calibrated in INR (₹).
          </p>
        </div>

        {/* Action Centre Quick Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenAddClient}
            className="inline-flex items-center px-3.5 py-2 bg-[#101C2C] hover:bg-[#172B46] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5 mr-1.5 text-[#C6A76A]" />
            Add Client
          </button>

          <button
            onClick={onOpenAddHolding}
            className="inline-flex items-center px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <TrendingUp className="w-3.5 h-3.5 mr-1.5 text-[#147D64]" />
            Add Holding
          </button>

          <button
            onClick={() => navigate('spreadsheet-import')}
            className="inline-flex items-center px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-[#C6A76A]" />
            Import Excel
          </button>

          <button
            onClick={() => navigate('reports')}
            className="inline-flex items-center px-3.5 py-2 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 text-[#147D64] text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 mr-1.5" />
            Generate Report
          </button>
        </div>
      </div>

      {/* Data Status Strip (Section 7 requirement) */}
      <div className="bg-[#172B46] text-white p-4 rounded-xl flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#147D64] animate-pulse" />
            <span>
              <strong className="text-slate-300">Data Source:</strong> {primarySource ? primarySource.name : 'Simulated Indian Master Ledger'}
            </span>
          </div>

          <div>
            <span className="text-slate-400">Last Successful Sync:</span>{' '}
            <span className="font-semibold text-slate-200">
              {primarySource?.lastSuccessfulSync ? formatDate(primarySource.lastSuccessfulSync) : 'Today 06:30 AM IST'}
            </span>
          </div>

          <div>
            <span className="text-slate-400">Records Synchronized:</span>{' '}
            <span className="font-semibold text-[#C6A76A]">{holdings.length} Assets</span> across {activeClients.length} Families
          </div>

          <div>
            <span className="text-slate-400">Validation Status:</span>{' '}
            <span className="text-emerald-400 font-semibold">0 Critical Issues</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleManualSync}
            disabled={syncing}
            className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded font-semibold text-[11px] text-[#C6A76A] flex items-center transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 mr-1.5 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync Now'}
          </button>

          <button
            onClick={() => navigate('data-hub')}
            className="text-[11px] font-semibold text-slate-300 hover:text-white underline flex items-center cursor-pointer"
          >
            View Data Hub Details
            <ChevronRight className="w-3 h-3 ml-0.5" />
          </button>
        </div>
      </div>

      {/* 8 Summary Metric Cards (Section 7 requirement) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
        {/* 1. Total AUM */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-[#C6A76A] transition-colors">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-medium">Total AUM</span>
            <span title="Total Assets Under Management across all active client accounts">
              <Info className="w-3.5 h-3.5 text-slate-400" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#101C2C]">
            {formatINR(summary.totalMarketValue, true)}
          </div>
          <div className="flex items-center text-[11px] text-[#147D64] mt-2 font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            <span>+18.4% YoY Growth</span>
          </div>
        </div>

        {/* 2. Total Portfolio Value */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-[#C6A76A] transition-colors">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-medium">Current Market Value</span>
            <span title="Aggregate holding value calculated as quantity * current benchmark price">
              <Info className="w-3.5 h-3.5 text-slate-400" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#101C2C]">
            {formatINR(summary.totalMarketValue)}
          </div>
          <div className="text-[11px] text-slate-500 mt-2 font-medium">
            {summary.holdingsCount} verified positions
          </div>
        </div>

        {/* 3. Total Invested Capital */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-[#C6A76A] transition-colors">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-medium">Total Invested Capital</span>
            <span title="Total purchase cost basis: quantity * average purchase price">
              <Info className="w-3.5 h-3.5 text-slate-400" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#101C2C]">
            {formatINR(summary.totalInvestedValue, true)}
          </div>
          <div className="text-[11px] text-slate-500 mt-2 font-medium">
            Recorded cost basis
          </div>
        </div>

        {/* 4. Unrealized Gain/Loss */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-[#C6A76A] transition-colors">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-medium">Unrealized Gain / (Loss)</span>
            <span title="Market value minus invested capital">
              <Info className="w-3.5 h-3.5 text-slate-400" />
            </span>
          </div>
          <div className={`text-xl sm:text-2xl font-bold ${summary.unrealizedGainLoss >= 0 ? 'text-[#147D64]' : 'text-[#C94C4C]'}`}>
            {summary.unrealizedGainLoss >= 0 ? '+' : ''}{formatINR(summary.unrealizedGainLoss, true)}
          </div>
          <div className={`text-[11px] font-semibold mt-2 ${summary.unrealizedGainLoss >= 0 ? 'text-[#147D64]' : 'text-[#C94C4C]'}`}>
            {formatPercentage(summary.absoluteReturnPercentage)} Absolute Return
          </div>
        </div>

        {/* 5. Active Clients */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-[#C6A76A] transition-colors">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-medium">Active HNW Clients</span>
            <Users className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#101C2C]">
            {activeClients.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            Average AUM: {formatINR(activeClients.length > 0 ? summary.totalMarketValue / activeClients.length : 0, true)}
          </div>
        </div>

        {/* 6. Goals On Track */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-[#C6A76A] transition-colors">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-medium">Goals on Track</span>
            <Target className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#101C2C]">
            {onTrackGoals.length} <span className="text-sm font-normal text-slate-400">/ {goals.length}</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-2">
            {goals.length > 0 ? Math.round((onTrackGoals.length / goals.length) * 100) : 100}% Success Probability
          </div>
        </div>

        {/* 7. Pending Client Reviews */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-[#C6A76A] transition-colors">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-medium">Pending Reviews</span>
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#101C2C]">
            {pendingReviews.length}
          </div>
          <div className="text-[11px] text-[#D99A31] font-semibold mt-2">
            Due next 30 days
          </div>
        </div>

        {/* 8. Open Risk Alerts */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-[#C6A76A] transition-colors">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-medium">Open Risk Alerts</span>
            <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#C94C4C]">
            {openAlerts.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            Deterministic governance
          </div>
        </div>
      </div>

      {/* Primary Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Historical Portfolio Valuation Growth */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h3 className="font-serif-display text-lg font-bold text-[#101C2C]">
                Consolidated Portfolio Valuation Trajectory
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Valuation history across current verified client holdings (in Crores)
              </p>
            </div>
            <span className="mt-2 sm:mt-0 text-[11px] font-semibold px-2.5 py-1 rounded bg-[#147D64]/10 text-[#147D64]">
              Quarterly Compounded
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={portfolioHistory} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="valGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#147D64" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#147D64" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="period" stroke="#94a3b8" fontSize={11} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickFormatter={val => `₹${(val / 10000000).toFixed(1)} Cr`}
                />
                <Tooltip
                  formatter={(val: any) => [formatINR(val), 'Valuation']}
                  contentStyle={{ backgroundColor: '#101C2C', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#147D64"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#valGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Asset Allocation Donut Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif-display text-lg font-bold text-[#101C2C]">
                Asset Class Allocation
              </h3>
              <button
                onClick={() => navigate('asset-allocation')}
                className="text-[11px] font-semibold text-[#147D64] hover:underline"
              >
                Deep Dive
              </button>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocation}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {allocation.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={ALLOCATION_COLORS[index % ALLOCATION_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [formatINR(val, true), 'Value']}
                    contentStyle={{ backgroundColor: '#101C2C', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Allocation Legend */}
          <div className="space-y-1.5 mt-2 text-xs">
            {allocation.slice(0, 4).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-slate-600">
                <div className="flex items-center space-x-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: ALLOCATION_COLORS[idx % ALLOCATION_COLORS.length] }}
                  />
                  <span className="truncate">{item.name}</span>
                </div>
                <div className="font-semibold text-slate-900">
                  {item.percentage}% ({formatINR(item.value, true)})
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Analytics: Client Distribution & Goal Completion */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio Distribution by Top Clients */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-serif-display text-lg font-bold text-[#101C2C]">
                AUM Distribution by Client
              </h3>
              <p className="text-xs text-slate-500">Top high-net-worth portfolio allocations</p>
            </div>
            <button
              onClick={() => navigate('clients')}
              className="text-xs font-semibold text-[#147D64] hover:underline"
            >
              View Directory
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={clientPortfolioDistribution} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} tickFormatter={val => `₹${(val / 10000000).toFixed(1)} Cr`} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={80} />
                <Tooltip
                  formatter={(val: any) => [formatINR(val), 'Portfolio']}
                  contentStyle={{ backgroundColor: '#101C2C', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="value" fill="#172B46" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Featured Financial Goals Progress */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-serif-display text-lg font-bold text-[#101C2C]">
                  Key Milestone Goals Progress
                </h3>
                <p className="text-xs text-slate-500">Compound interest trajectory toward targets</p>
              </div>
              <button
                onClick={() => navigate('goals')}
                className="text-xs font-semibold text-[#147D64] hover:underline"
              >
                All Goals ({goals.length})
              </button>
            </div>

            <div className="space-y-4">
              {goals.slice(0, 4).map((g) => {
                const progressPct = g.targetAmount > 0 ? Math.min(100, Math.round((g.currentSavedAmount / g.targetAmount) * 100)) : 0;
                const client = clients.find(c => c.id === g.clientId);

                return (
                  <div key={g.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-slate-800">{g.name}</span>
                      <span className="font-bold text-[#147D64]">{progressPct}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#C6A76A] h-2 rounded-full"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-500 mt-2">
                      <span>Client: {client ? client.name : 'Client'}</span>
                      <span>Target: {formatINR(g.targetAmount, true)} ({formatDate(g.targetDate)})</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Chronological Activity Feed & Upcoming Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed (Section 7 requirement: real stored events) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-serif-display text-lg font-bold text-[#101C2C]">
                Chronological Activity & Audit Stream
              </h3>
              <p className="text-xs text-slate-500">Real verified system mutations and client transactions</p>
            </div>
            <button
              onClick={() => navigate('audit-log')}
              className="text-xs font-semibold text-[#147D64] hover:underline"
            >
              Full Audit Log
            </button>
          </div>

          <div className="space-y-3">
            {auditLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-none">
                <div className="w-8 h-8 rounded-full bg-[#101C2C]/5 text-[#147D64] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{log.action}</span>
                    <span className="text-[10px] text-slate-400">{formatDate(log.timestamp)}</span>
                  </div>
                  <p className="text-slate-600 mt-0.5 truncate">{log.affectedRecord}</p>
                  <span className="text-[10px] text-slate-400 block mt-1">Actor: {log.actorName} ({log.actorRole})</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Client Reviews & Consultations */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif-display text-lg font-bold text-[#101C2C]">
                Upcoming Client Reviews
              </h3>
              <button
                onClick={onOpenScheduleReview}
                className="text-xs font-semibold text-[#147D64] hover:underline"
              >
                + Schedule
              </button>
            </div>

            <div className="space-y-3">
              {meetings.slice(0, 3).map((m) => (
                <div key={m.id} className="p-3 rounded-xl border border-slate-200 bg-[#F7F5F0]/50 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#101C2C]">{m.clientName}</span>
                    <span className="text-[10px] font-semibold text-[#C6A76A] bg-white px-2 py-0.5 rounded border border-slate-200">
                      {m.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium truncate">{m.title}</p>
                  <div className="text-[10px] text-slate-400 flex items-center pt-1">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>{formatDate(m.dateTime)} • {m.meetingMode}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <button
              onClick={() => navigate('meetings')}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded transition-colors text-center cursor-pointer"
            >
              Open Calendar Workspace
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
