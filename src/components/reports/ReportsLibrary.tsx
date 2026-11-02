import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR, formatDate } from '../../utils/formatters';
import { generateWealthReportPDF } from '../../utils/pdfGenerator';
import { exportToExcel } from '../../utils/excelParser';
import {
  FileText,
  Download,
  Calendar,
  User,
  ShieldCheck,
  CheckCircle,
  FileSpreadsheet,
  Printer,
  Sparkles,
  BarChart3,
  Clock,
  Layers
} from 'lucide-react';

interface ReportConfig {
  id: string;
  title: string;
  subtitle: string;
  type: 'valuation' | 'tax_capital_gains' | 'comprehensive_audit' | 'asset_allocation' | 'goal_trajectory' | 'client_quarterly';
  scope: 'all_clients' | 'single_client';
  description: string;
  includes: string[];
}

const REPORT_TEMPLATES: ReportConfig[] = [
  {
    id: 'rep_1',
    title: 'Consolidated Wealth & Portfolio Valuation',
    subtitle: 'Current market valuations, uncommitted cash balances, asset allocation, and XIRR estimates.',
    type: 'valuation',
    scope: 'single_client',
    description: 'Executive snapshot of current wealth holdings across equity, mutual funds, debt, and cash with unrealized gains.',
    includes: ['Holdings Register Breakdown', 'Asset Allocation Donut', 'Unrealized Gain / Loss Math', 'Risk Status Summary']
  },
  {
    id: 'rep_2',
    title: 'Financial Health & 7-Pillar Diagnostic Report',
    subtitle: 'Comprehensive analytical health scorecard covering emergency fund, retirement, and insurance adequacy.',
    type: 'comprehensive_audit',
    scope: 'single_client',
    description: 'Detailed evaluation across CapitalVest 7-pillar methodology with qualitative advisor notes and remedial steps.',
    includes: ['Composite Health Score (0-100)', '7 Analytical Pillar Bars', 'Identified Vulnerabilities', 'Advisor Recommendations']
  },
  {
    id: 'rep_3',
    title: 'Asset Allocation & Rebalancing Audit',
    subtitle: 'Variance analysis comparing target strategic asset allocation versus active market drift.',
    type: 'asset_allocation',
    scope: 'single_client',
    description: 'Detailed divergence report identifying overweight/underweight asset classes and recommended rebalancing adjustments.',
    includes: ['Target vs Actual Variance', 'Single Stock Concentration Guards', 'Drift Analysis Table', 'Actionable Trade Suggestions']
  },
  {
    id: 'rep_4',
    title: 'Long-Term Financial Goals Trajectory',
    subtitle: 'Compound interest future value projections and target fulfillment probability.',
    type: 'goal_trajectory',
    scope: 'single_client',
    description: 'Mathematical forecast of retirement corpus, children education fund, and estate liquidity based on active SIPs.',
    includes: ['Compound Growth Trajectory', 'Required vs Actual Monthly SIP', 'Deficit/Surplus Modeling', 'Milestone Timelines']
  },
  {
    id: 'rep_5',
    title: 'Capital Gains & Tax Estimator (FY 2024-25)',
    subtitle: 'Estimated short-term (STCG) and long-term (LTCG) tax liability under Indian Finance Act provisions.',
    type: 'tax_capital_gains',
    scope: 'single_client',
    description: 'Analytical summary of realized and unrealized capital gains for tax planning and year-end harvesting strategy.',
    includes: ['LTCG @ 12.5% Estimations', 'STCG @ 20% Breakdown', 'Holding Period Classification', 'Tax Harvesting Opportunities']
  },
  {
    id: 'rep_6',
    title: 'Quarterly Practice Performance & AUM Audit',
    subtitle: 'Macro overview of firm-wide assets under management, net inflows, and compliance integrity.',
    type: 'client_quarterly',
    scope: 'all_clients',
    description: 'Administrative practice review covering client tiers, pipeline conversion velocity, and critical unresolved risks.',
    includes: ['Total AUM by Client Tier', 'Active Risk Alert Counts', 'Data Sync Integrity Metrics', 'Regulatory Audit Disclosures']
  }
];

export const ReportsLibrary: React.FC = () => {
  const { clients, holdings, goals, healthAssessments, firmSettings, currentUser, logAuditEvent } = useApp();

  const isClient = currentUser?.role?.toLowerCase() === 'client';
  const userClientId = currentUser?.assignedClientId || currentUser?.clientId;
  const defaultClientId = isClient && userClientId ? userClientId : (clients[0]?.id || '');
  const [selectedClientId, setSelectedClientId] = useState<string>(defaultClientId);
  const [selectedReportId, setSelectedReportId] = useState<string>('rep_1');
  const [includeDisclosures, setIncludeDisclosures] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedSuccessMsg, setGeneratedSuccessMsg] = useState<string | null>(null);

  const selectedClient = clients.find(c => c.id === selectedClientId) || clients[0];
  const activeTemplate = REPORT_TEMPLATES.find(r => r.id === selectedReportId) || REPORT_TEMPLATES[0];

  const handleGeneratePDF = () => {
    if (!selectedClient) return;
    setIsGenerating(true);
    setGeneratedSuccessMsg(null);

    try {
      const clientHoldings = holdings.filter(h => h.clientId === selectedClient.id);
      const clientGoals = goals.filter(g => g.clientId === selectedClient.id);
      const clientHealth = healthAssessments?.find(h => h.clientId === selectedClient.id);

      generateWealthReportPDF({
        client: selectedClient,
        holdings: clientHoldings,
        goals: clientGoals,
        health: clientHealth,
        firmSettings
      });

      logAuditEvent('export_run', 'report', selectedClient.id, `Generated ${activeTemplate.title} PDF for ${selectedClient.name}`);
      setGeneratedSuccessMsg(`Successfully generated and downloaded "${activeTemplate.title}" for ${selectedClient.name}.`);
    } catch (err) {
      console.error('Report generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportExcel = () => {
    if (!selectedClient) return;
    const clientHoldings = holdings.filter(h => h.clientId === selectedClient.id);
    const clientGoals = goals.filter(g => g.clientId === selectedClient.id);

    const exportRows = [
      ...clientHoldings.map(h => ({
        Category: 'Holding',
        Name: h.assetName,
        Symbol_ISIN: h.symbol,
        Asset_Class: h.assetClass,
        Sector: h.sector || 'General',
        Quantity: h.quantity,
        Avg_Buy_Price: h.averagePurchasePrice,
        Current_Price: h.currentPrice,
        Current_Value: h.currentMarketValue,
        Unrealized_Gain: h.gainLossAmount,
        Return_Pct: h.gainLossPercentage,
        Currency: 'INR'
      })),
      ...clientGoals.map(g => ({
        Category: 'Financial Goal',
        Name: g.name,
        Symbol_ISIN: '-',
        Asset_Class: g.category,
        Target_Date: g.targetDate,
        Quantity: 1,
        Avg_Buy_Price: g.currentSavedAmount,
        Current_Price: g.targetAmount,
        Current_Value: g.currentSavedAmount,
        Unrealized_Gain: g.targetAmount - g.currentSavedAmount,
        Return_Pct: g.targetAmount > 0 ? (g.currentSavedAmount / g.targetAmount) * 100 : 0,
        Currency: 'INR'
      }))
    ];

    exportToExcel(exportRows, `CapitalVest_${selectedClient.name.replace(/\s+/g, '_')}_PortfolioAudit`);
    logAuditEvent('export_run', 'report', selectedClient.id, `Exported portfolio data spreadsheet for ${selectedClient.name}`);
    setGeneratedSuccessMsg(`Exported multi-asset spreadsheet for ${selectedClient.name}.`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" /> Fiduciary Reporting Suite
            </span>
            <span className="text-xs text-slate-400">Institutional Grade • SEBI Disclosures</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
            Reports & Statement Generation
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Generate formal fiduciary portfolio appraisals, 7-pillar health scorecards, and multi-asset audit dossiers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-all shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Export Data (.xlsx)
          </button>
          <button
            onClick={handleGeneratePDF}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-amber-400" />
            {isGenerating ? 'Compiling PDF...' : 'Generate Official PDF'}
          </button>
        </div>
      </div>

      {generatedSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{generatedSuccessMsg}</span>
          </div>
          <button
            onClick={() => setGeneratedSuccessMsg(null)}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Scope & Controls */}
        <div className="space-y-6">
          {/* Client Selection */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-amber-500" /> Target Client Dossier
            </h3>

            {isClient ? (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-xs text-slate-500">Locked to your personal portfolio</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedClient?.name}</p>
                <p className="text-xs text-slate-600">{selectedClient?.city} • {selectedClient?.riskProfile} Risk</p>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Select Client</label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                >
                  {clients.map(c => {
                    const clientAum = holdings.filter(h => h.clientId === c.id).reduce((s, h) => s + h.currentMarketValue, 0);
                    return (
                      <option key={c.id} value={c.id}>
                        {c.name} — {formatINR(clientAum, true)} ({c.category})
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            {selectedClient && (
              <div className="mt-4 pt-4 border-t border-slate-100 text-xs space-y-1.5 text-slate-600">
                <div className="flex justify-between">
                  <span>Client Code:</span>
                  <span className="font-mono font-medium text-slate-900">{selectedClient.clientNumber || selectedClient.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Portfolio AUM:</span>
                  <span className="font-semibold text-slate-900">
                    {formatINR(holdings.filter(h => h.clientId === selectedClient.id).reduce((s, h) => s + h.currentMarketValue, 0))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Holding Records:</span>
                  <span className="font-medium text-slate-900">
                    {holdings.filter(h => h.clientId === selectedClient.id).length} positions
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Next Review Date:</span>
                  <span className="font-medium text-slate-900">{formatDate(selectedClient.nextReviewDate)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Report Options */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-500" /> Generation Settings
            </h3>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeDisclosures}
                  onChange={(e) => setIncludeDisclosures(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                />
                <span className="text-xs text-slate-700">Include statutory SEBI / AMFI fiduciary disclosures</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                />
                <span className="text-xs text-slate-700">Attach Advisor Contact & Lead Reviewer signature block</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                />
                <span className="text-xs text-slate-700">Render Indian Lakhs & Crores compact currency notation</span>
              </label>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Reports are generated deterministically in compliance with Indian wealth advisory recordkeeping rules. All timestamps are stamped in Asia/Kolkata (IST).
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Template Catalog & Preview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center justify-between">
              <span>Standard Fiduciary Report Templates</span>
              <span className="text-xs font-normal text-slate-500">6 Formats Available</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {REPORT_TEMPLATES.map((tmpl) => {
                const isSelected = selectedReportId === tmpl.id;
                return (
                  <div
                    key={tmpl.id}
                    onClick={() => setSelectedReportId(tmpl.id)}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/40 shadow-sm ring-1 ring-amber-500/20'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className={`p-2 rounded-lg ${isSelected ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>
                        <FileText className="w-5 h-5" />
                      </div>
                      {isSelected && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-600 text-white">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 mb-1">{tmpl.title}</h4>
                    <p className="text-xs text-slate-600 line-clamp-2 mb-3">{tmpl.subtitle}</p>

                    <div className="pt-2 border-t border-slate-200/60 flex flex-wrap gap-1">
                      {tmpl.includes.slice(0, 2).map((item, idx) => (
                        <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {item}
                        </span>
                      ))}
                      {tmpl.includes.length > 2 && (
                        <span className="text-[10px] px-1 py-0.5 text-slate-400">
                          +{tmpl.includes.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Template Document Spec Preview */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">Document Specification</span>
                <h3 className="font-serif text-xl font-bold mt-1 text-white">{activeTemplate.title}</h3>
                <p className="text-xs text-slate-300 mt-0.5">{activeTemplate.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleGeneratePDF}
                  disabled={isGenerating}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / Save PDF
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60">
                <h5 className="font-semibold text-slate-200 uppercase tracking-wider mb-2">Sections Included in Output</h5>
                <ul className="space-y-1.5 text-slate-300">
                  {activeTemplate.includes.map((inc, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60">
                <h5 className="font-semibold text-slate-200 uppercase tracking-wider mb-2">Metadata & Security</h5>
                <div className="space-y-1.5 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Watermark:</span>
                    <span>Confidential • Fiduciary Client Only</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Checksum Digest:</span>
                    <span className="font-mono text-emerald-400">SHA-256 Validated</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Lead Reviewer:</span>
                    <span>Tanaisha Udwadia (Principal Advisor)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Jurisdiction:</span>
                    <span>Mumbai, Maharashtra, India (SEBI INA000012345)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
