import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Client, Holding, FinancialGoal } from '../../types';
import { formatINR, formatPercentage, formatDate } from '../../utils/formatters';
import { calculatePortfolioSummary, calculateAssetAllocation, evaluateFinancialHealth } from '../../utils/calculations';
import { generateClientPdfReport } from '../../utils/pdfGenerator';
import { exportToExcel } from '../../utils/excelParser';
import {
  TrendingUp,
  Target,
  Activity,
  Calendar,
  FolderLock,
  FileText,
  ShieldAlert,
  Edit,
  Plus,
  Trash2,
  Clock,
  ArrowUpRight,
  Download,
  CheckCircle2,
  AlertTriangle,
  User,
  ChevronLeft,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Key,
  Copy
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface Client360ProfileProps {
  onOpenAddHolding: (clientId: string) => void;
  onOpenAddGoal: (clientId: string) => void;
  onOpenScheduleReview: (client: Client) => void;
  onEditClient: (client: Client) => void;
}

export const Client360Profile: React.FC<Client360ProfileProps> = ({
  onOpenAddHolding,
  onOpenAddGoal,
  onOpenScheduleReview,
  onEditClient
}) => {
  const { 
    selectedClientId, 
    clients, 
    holdings, 
    goals, 
    meetings, 
    documents, 
    auditLogs, 
    currentUser,
    navigate, 
    deleteHolding, 
    deleteGoal,
    addDocument,
    deleteDocument
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'portfolio' | 'goals' | 'health' | 'risk' | 'activity' | 'reviews' | 'documents' | 'portal'
  >('overview');

  const [provisionedSecret, setProvisionedSecret] = useState<string | null>(null);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleProvisionOrReset = async () => {
    setIsProvisioning(true);
    try {
      const token = sessionStorage.getItem('capitalvest_auth_token');
      const res = await fetch('/api/admin/provision-client-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ clientId: client.id })
      });
      const data = await res.json();
      if (res.ok) {
        setProvisionedSecret(data.temporaryPassword);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProvisioning(false);
    }
  };

  // Client resolution & isolation check
  const client = clients.find(c => c.id === selectedClientId) || clients[0];

  // Client-level security check: If currentUser is Client, they cannot access any other client!
  if (currentUser?.role === 'Client' && currentUser.assignedClientId && client.id !== currentUser.assignedClientId) {
    return (
      <div className="p-8 bg-red-50 border border-red-200 rounded-xl text-center space-y-3">
        <ShieldAlert className="w-8 h-8 text-red-600 mx-auto" />
        <h3 className="font-bold text-red-900 text-base">Unauthorized Access Restriction</h3>
        <p className="text-xs text-red-700">
          Client accounts are cryptographically restricted to their personal wealth dossier. Cross-client enumeration is prohibited.
        </p>
        <button
          onClick={() => navigate('client-dashboard')}
          className="px-4 py-2 bg-[#101C2C] text-white text-xs font-semibold rounded"
        >
          Return to My Workspace
        </button>
      </div>
    );
  }

  const clientHoldings = holdings.filter(h => h.clientId === client.id);
  const clientGoals = goals.filter(g => g.clientId === client.id);
  const clientMeetings = meetings.filter(m => m.clientId === client.id);
  const clientDocs = documents.filter(d => d.associatedClientId === client.id);
  const clientAudit = auditLogs.filter(a => a.affectedRecord?.includes(client.name) || a.details?.includes(client.name));

  const summary = calculatePortfolioSummary(clientHoldings);
  const allocation = calculateAssetAllocation(clientHoldings);
  const health = evaluateFinancialHealth(client, clientHoldings, clientGoals);

  const ALLOCATION_COLORS = ['#147D64', '#172B46', '#C6A76A', '#5B6677', '#8B5CF6'];

  const handleDownloadPdf = () => {
    generateClientPdfReport({
      client,
      holdings: clientHoldings,
      goals: clientGoals,
      health,
      generatedBy: client.primaryAdvisor || 'Tanaisha Udwadia'
    });
  };

  const handleExportHoldings = () => {
    const data = clientHoldings.map(h => ({
      'Asset Name': h.assetName,
      'Symbol': h.symbol,
      'Asset Class': h.assetClass,
      'Quantity': h.quantity,
      'Avg Price (INR)': h.averagePurchasePrice,
      'Current Price (INR)': h.currentPrice,
      'Invested (INR)': h.investedValue,
      'Market Value (INR)': h.currentMarketValue,
      'Gain/Loss (INR)': h.gainLossAmount,
      'Return (%)': h.gainLossPercentage
    }));
    exportToExcel(data, `${client.name}_Holdings_${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('clients')}
            className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 cursor-pointer"
            title="Return to Client Directory"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono text-slate-400 font-semibold">{client.clientNumber || client.id}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#147D64]/10 text-[#147D64]">
                {client.category}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                {client.relationshipStatus}
              </span>
            </div>
            <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#101C2C] mt-0.5">
              {client.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1">
              <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" />{client.city}</span>
              <span className="flex items-center"><Mail className="w-3 h-3 mr-1" />{client.email}</span>
              <span className="flex items-center"><Phone className="w-3 h-3 mr-1" />{client.phone}</span>
            </div>
          </div>
        </div>

        {/* Action Header Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onEditClient(client)}
            className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-xs flex items-center cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5 mr-1.5" />
            Edit Profile
          </button>

          <button
            onClick={() => onOpenScheduleReview(client)}
            className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-xs flex items-center cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 mr-1.5 text-[#C6A76A]" />
            Schedule Review
          </button>

          <button
            onClick={handleDownloadPdf}
            className="px-4 py-2 bg-[#101C2C] hover:bg-[#172B46] text-white text-xs font-semibold rounded-lg shadow-xs flex items-center cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-[#C6A76A]" />
            Generate PDF Report
          </button>
        </div>
      </div>

      {/* 8 Tabs Navigation (Section 8 requirement) */}
      <div className="flex border-b border-slate-200 bg-white px-6 rounded-xl shadow-xs overflow-x-auto gap-4 sm:gap-8 text-xs font-semibold">
        {[
          { id: 'overview', label: '1. Overview' },
          { id: 'portfolio', label: `2. Portfolio (${clientHoldings.length})` },
          { id: 'goals', label: `3. Financial Goals (${clientGoals.length})` },
          { id: 'health', label: `4. Financial Health (${health.overallScore})` },
          { id: 'risk', label: '5. Risk Profile' },
          { id: 'activity', label: '6. Activity Audit' },
          { id: 'reviews', label: `7. Meetings (${clientMeetings.length})` },
          { id: 'documents', label: `8. Documents (${clientDocs.length})` },
          { id: 'portal', label: '9. Portal Access' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-3.5 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === tab.id ? 'border-[#147D64] text-[#147D64]' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-medium text-slate-500">Portfolio Market Value</span>
              <div className="text-xl font-bold text-[#101C2C] mt-1">{formatINR(summary.totalMarketValue)}</div>
              <div className="text-[11px] text-[#147D64] font-semibold mt-1">
                {formatPercentage(summary.absoluteReturnPercentage)} Absolute Gain
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-medium text-slate-500">Invested Capital</span>
              <div className="text-xl font-bold text-[#101C2C] mt-1">{formatINR(summary.totalInvestedValue)}</div>
              <div className="text-[11px] text-slate-500 mt-1">Recorded Cost Basis</div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-medium text-slate-500">Financial Health Index</span>
              <div className="text-xl font-bold text-[#101C2C] mt-1">{health.overallScore} / 100</div>
              <div className="text-[11px] text-[#C6A76A] font-semibold mt-1">7-Pillar Benchmark</div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-medium text-slate-500">Next Scheduled Review</span>
              <div className="text-xl font-bold text-[#101C2C] mt-1">{formatDate(client.nextReviewDate)}</div>
              <div className="text-[11px] text-slate-500 mt-1">{client.preferredReviewFrequency} frequency</div>
            </div>
          </div>

          {/* Allocation & Goals Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif-display text-lg font-bold text-[#101C2C]">Asset Allocation</h3>
                  <button onClick={() => setActiveTab('portfolio')} className="text-xs text-[#147D64] font-semibold hover:underline">
                    View Holdings
                  </button>
                </div>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={allocation} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3}>
                        {allocation.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={ALLOCATION_COLORS[index % ALLOCATION_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val: any) => [formatINR(val, true), 'Value']} contentStyle={{ backgroundColor: '#101C2C', color: '#fff', borderRadius: '8px', fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mt-2">
                {allocation.filter(a => a.value > 0).map((a, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="truncate">{a.name}:</span>
                    <span className="font-semibold text-slate-900">{a.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif-display text-lg font-bold text-[#101C2C]">Active Goals</h3>
                <button onClick={() => onOpenAddGoal(client.id)} className="text-xs text-[#147D64] font-semibold hover:underline">
                  + Add Goal
                </button>
              </div>
              <div className="space-y-3">
                {clientGoals.map(g => {
                  const pct = g.targetAmount > 0 ? Math.min(100, Math.round((g.currentSavedAmount / g.targetAmount) * 100)) : 0;
                  return (
                    <div key={g.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="flex justify-between items-center text-xs mb-1">
                        <span className="font-bold text-slate-800">{g.name}</span>
                        <span className="font-semibold text-[#147D64]">{pct}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#C6A76A] h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500 mt-1.5">
                        <span>Saved: {formatINR(g.currentSavedAmount, true)}</span>
                        <span>Target: {formatINR(g.targetAmount, true)} ({formatDate(g.targetDate)})</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Portfolio Holdings */}
      {activeTab === 'portfolio' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div>
              <span className="font-bold text-slate-900 text-sm">Holdings Register for {client.name}</span>
              <p className="text-xs text-slate-500">Valued using quantity × verified prices</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleExportHoldings}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 mr-1" />
                Export
              </button>
              <button
                onClick={() => onOpenAddHolding(client.id)}
                className="px-3 py-1.5 rounded-lg bg-[#101C2C] text-white text-xs font-semibold flex items-center hover:bg-[#172B46] cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 mr-1 text-[#C6A76A]" />
                Add Holding
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#101C2C] text-white uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4 font-semibold">Asset Description</th>
                  <th className="py-3 px-4 font-semibold">Asset Class</th>
                  <th className="py-3 px-4 font-semibold">Qty</th>
                  <th className="py-3 px-4 font-semibold">Avg Cost</th>
                  <th className="py-3 px-4 font-semibold">Current Price</th>
                  <th className="py-3 px-4 font-semibold">Market Value</th>
                  <th className="py-3 px-4 font-semibold">Gain / Loss</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clientHoldings.map(h => (
                  <tr key={h.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{h.assetName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{h.symbol}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-600">{h.assetClass}</td>
                    <td className="py-3 px-4 font-medium">{h.quantity.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4">{formatINR(h.averagePurchasePrice)}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{formatINR(h.currentPrice)}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{formatINR(h.currentMarketValue)}</td>
                    <td className="py-3 px-4">
                      <span className={`font-semibold ${h.gainLossAmount >= 0 ? 'text-[#147D64]' : 'text-red-600'}`}>
                        {formatPercentage(h.gainLossPercentage)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => deleteHolding(h.id)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded"
                        title="Delete Holding"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Financial Goals */}
      {activeTab === 'goals' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div>
              <span className="font-bold text-slate-900 text-sm">Goal-Based Wealth Milestones</span>
              <p className="text-xs text-slate-500">Compounding assumptions and monthly contributions</p>
            </div>
            <button
              onClick={() => onOpenAddGoal(client.id)}
              className="px-3 py-1.5 rounded-lg bg-[#101C2C] text-white text-xs font-semibold flex items-center hover:bg-[#172B46] cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 mr-1 text-[#C6A76A]" />
              Add Milestone Goal
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clientGoals.map(g => (
              <div key={g.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#101C2C]">{g.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800">
                    {g.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 block">Target Amount</span>
                    <strong className="text-slate-800">{formatINR(g.targetAmount)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Current Savings</span>
                    <strong className="text-[#147D64]">{formatINR(g.currentSavedAmount)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Monthly SIP</span>
                    <strong className="text-slate-800">{formatINR(g.currentMonthlyContribution)}/mo</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Target Horizon</span>
                    <strong className="text-slate-800">{formatDate(g.targetDate)}</strong>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => deleteGoal(g.id)}
                    className="text-slate-400 hover:text-red-600 text-xs flex items-center"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Archive Goal
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Financial Health */}
      {activeTab === 'health' && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#C6A76A]">Diagnostic Index</span>
              <h3 className="font-serif-display text-2xl font-bold text-[#101C2C]">
                CapitalVest 7-Pillar Financial Health Assessment
              </h3>
            </div>
            <div className="text-right mt-2 sm:mt-0">
              <span className="text-3xl font-bold text-[#147D64]">{health.overallScore}</span>
              <span className="text-xs text-slate-500 block">out of 100 benchmark</span>
            </div>
          </div>

          {/* Breakdown bars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800">Scoring Components</h4>
              {[
                { label: 'Emergency Fund Reserves (15%)', score: health.breakdown.emergencyFundScore },
                { label: 'Savings Rate & Discipline (20%)', score: health.breakdown.savingsRateScore },
                { label: 'Debt Burden & Leverage (15%)', score: health.breakdown.debtBurdenScore },
                { label: 'Goal Funding Progression (20%)', score: health.breakdown.goalFundingScore },
                { label: 'Portfolio Diversification (15%)', score: health.breakdown.diversificationScore },
                { label: 'Insurance Review & Cover (10%)', score: health.breakdown.insuranceReviewScore },
                { label: 'Liquidity Coverage (5%)', score: health.breakdown.liquidityScore }
              ].map((item, idx) => (
                <div key={idx} className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-600">{item.label}</span>
                    <span className="font-bold text-slate-900">{item.score}/100</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#147D64] h-2 rounded-full"
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-800 mb-2">Identified Strengths</h4>
                <ul className="space-y-2 text-xs text-slate-600">
                  {health.strengths.map((str, i) => (
                    <li key={i} className="flex items-start">
                      <CheckCircle2 className="w-4 h-4 text-[#147D64] mr-2 flex-shrink-0 mt-0.5" />
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-amber-800 mb-2">Focus Areas</h4>
                <ul className="space-y-2 text-xs text-slate-600">
                  {health.areasRequiringAttention.map((area, i) => (
                    <li key={i} className="flex items-start">
                      <AlertTriangle className="w-4 h-4 text-amber-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Risk Profile */}
      {activeTab === 'risk' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <h3 className="font-serif-display text-lg font-bold text-[#101C2C]">Client Risk Profile</h3>
          <p className="text-slate-600">Assessed on {formatDate(client.riskAssessmentDate)}: <strong>{client.riskProfile}</strong></p>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-800">Investment Horizon:</span> {client.investmentHorizon} <br />
            <span className="font-bold text-slate-800">Experience Tier:</span> {client.investmentExperience} <br />
            <span className="font-bold text-slate-800">Liquidity Requirements:</span> {client.liquidityRequirements}
          </div>
        </div>
      )}

      {/* Tab 6: Activity Audit */}
      {activeTab === 'activity' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3 text-xs">
          <h3 className="font-serif-display text-lg font-bold text-[#101C2C]">Client Activity Timeline</h3>
          {clientAudit.length > 0 ? (
            clientAudit.map(log => (
              <div key={log.id} className="p-3 border-b border-slate-100 flex justify-between">
                <div>
                  <span className="font-bold text-slate-900">{log.action}</span>
                  <div className="text-slate-500">{log.details || log.affectedRecord}</div>
                </div>
                <span className="text-slate-400">{formatDate(log.timestamp)}</span>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-slate-400">No client-specific mutations recorded yet.</div>
          )}
        </div>
      )}

      {/* Tab 7: Meetings & Reviews */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
            <span className="font-bold text-sm text-slate-900">Meetings & Periodic Reviews</span>
            <button
              onClick={() => onOpenScheduleReview(client)}
              className="px-3 py-1.5 bg-[#101C2C] text-white text-xs font-semibold rounded"
            >
              + Schedule Meeting
            </button>
          </div>
          <div className="space-y-3">
            {clientMeetings.map(m => (
              <div key={m.id} className="bg-white p-4 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>{m.title}</span>
                  <span className="text-[#147D64]">{m.status}</span>
                </div>
                <div className="text-slate-500">{formatDate(m.dateTime)} • {m.type} • {m.meetingMode}</div>
                <p className="text-slate-700 pt-1">{m.agenda}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 8: Documents */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
            <span className="font-bold text-sm text-slate-900">Client Documents & Agreements</span>
            <button
              onClick={() => addDocument({
                name: `${client.name}_Wealth_Statement_${formatDate(new Date()).replace(/\//g, '-')}.pdf`,
                category: 'Wealth Report',
                associatedClientId: client.id,
                associatedClientName: client.name,
                accessPermission: 'Client Accessible'
              })}
              className="px-3 py-1.5 bg-[#101C2C] text-white text-xs font-semibold rounded"
            >
              + Attach Document
            </button>
          </div>
          <div className="space-y-3">
            {clientDocs.map(d => (
              <div key={d.id} className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">{d.name}</span>
                  <span className="text-slate-400 text-[10px]">{d.category} • Uploaded {formatDate(d.uploadDate)} • {d.accessPermission}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleDownloadPdf}
                    className="p-1.5 text-slate-500 hover:text-[#101C2C]"
                    title="Download File"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteDocument(d.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600"
                    title="Remove Document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 9: Portal Access & Credentials Provisioning */}
      {activeTab === 'portal' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs uppercase font-bold tracking-widest text-[#147D64]">
                    Fiduciary Security & Identity
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Active Provisioned
                  </span>
                </div>
                <h3 className="font-serif-display text-xl font-bold text-[#101C2C] mt-1">
                  Client Portal Account Dossier
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Secure credentials linking this client dossier to authenticated client portal sessions
                </p>
              </div>

              <button
                onClick={handleProvisionOrReset}
                disabled={isProvisioning}
                className="inline-flex items-center px-4 py-2 bg-[#101C2C] hover:bg-[#172B46] text-[#C6A76A] text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                <Key className="w-3.5 h-3.5 mr-1.5" />
                {isProvisioning ? 'Generating...' : 'Issue / Reset Temporary Password'}
              </button>
            </div>

            {/* Account Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[11px] font-medium">Portal Login Identifier (Email)</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block truncate">{client.email}</span>
                <span className="text-[10px] text-slate-400 mt-1 block">Used for client portal sign in</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[11px] font-medium">Assigned Client ID</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block font-mono">{client.clientNumber || client.id}</span>
                <span className="text-[10px] text-slate-400 mt-1 block">Can also be entered as Login ID</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[11px] font-medium">Password Storage Standard</span>
                <span className="font-bold text-emerald-800 text-sm mt-0.5 flex items-center">
                  <ShieldCheck className="w-4 h-4 mr-1 text-[#147D64]" />
                  scrypt Salted Hash
                </span>
                <span className="text-[10px] text-slate-400 mt-1 block">Zero plaintext exposure</span>
              </div>
            </div>

            {/* Temporary password notification banner if just generated */}
            {provisionedSecret && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900 flex items-center">
                    <ShieldCheck className="w-4 h-4 mr-1.5 text-[#147D64]" />
                    Temporary Password Successfully Issued
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(provisionedSecret);
                      setCopySuccess(true);
                      setTimeout(() => setCopySuccess(false), 2000);
                    }}
                    className="inline-flex items-center px-2.5 py-1 bg-white border border-emerald-300 rounded text-[11px] font-semibold text-emerald-900 hover:bg-emerald-100 cursor-pointer"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    {copySuccess ? 'Copied!' : 'Copy Password'}
                  </button>
                </div>
                <p className="text-[11px] text-emerald-800">
                  Transmit this temporary password securely to <strong>{client.name}</strong>. They will use this password alongside their email (<code>{client.email}</code>) or Client ID (<code>{client.clientNumber}</code>) on the Client Portal Login page.
                </p>
                <div className="p-2.5 bg-white rounded-lg border border-emerald-200 font-mono text-base font-bold text-[#101C2C] tracking-wider text-center">
                  {provisionedSecret}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
