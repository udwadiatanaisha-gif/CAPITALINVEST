import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR, formatDate } from '../../utils/formatters';
import { evaluateFinancialHealth } from '../../utils/calculations';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ShieldCheck,
  Save,
  Info,
  Calendar,
  User,
  Sliders
} from 'lucide-react';

export const FinancialHealthView: React.FC = () => {
  const { clients, holdings, goals, firmSettings } = useApp();

  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || 'CLI-001');
  const [advisorNotes, setAdvisorNotes] = useState('');
  const [methodologyOpen, setMethodologyOpen] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);

  const selectedClient = clients.find(c => c.id === selectedClientId) || clients[0];
  const clientHoldings = holdings.filter(h => h.clientId === selectedClient.id);
  const clientGoals = goals.filter(g => g.clientId === selectedClient.id);

  const health = evaluateFinancialHealth(
    selectedClient,
    clientHoldings,
    clientGoals,
    firmSettings.healthScoringWeights
  );

  const handleSaveNotes = () => {
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2500);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-[#147D64] bg-emerald-50 border-emerald-200';
    if (score >= 65) return 'text-[#C6A76A] bg-amber-50 border-amber-200';
    return 'text-[#C94C4C] bg-red-50 border-red-200';
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-[#C6A76A]">
            Diagnostic Architecture
          </span>
          <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#101C2C] mt-0.5">
            Financial Health Diagnostic Centre
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Standardized 7-pillar wealth evaluation engine (0 to 100 planning estimate)
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMethodologyOpen(!methodologyOpen)}
            className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors flex items-center cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 mr-1.5 text-[#C6A76A]" />
            Methodology Panel
          </button>

          <select
            value={selectedClientId}
            onChange={e => setSelectedClientId(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold cursor-pointer"
          >
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.category})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Accessible Methodology Panel (Section 12 requirement) */}
      {methodologyOpen && (
        <div className="bg-[#101C2C] text-white p-6 sm:p-8 rounded-2xl border border-[#172B46] space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-700 pb-3">
            <h3 className="font-serif-display text-xl font-bold text-[#C6A76A]">
              CapitalVest 7-Pillar Scoring Methodology
            </h3>
            <button onClick={() => setMethodologyOpen(false)} className="text-slate-400 hover:text-white">
              Close
            </button>
          </div>
          <p className="text-slate-300 leading-relaxed">
            The CapitalVest Financial Health Index is an objective planning indicator normalized from 0 to 100 based on verified portfolio holdings, recorded goals, and client profile data:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div className="p-3 rounded-lg bg-[#172B46]">
              <strong className="text-[#C6A76A] block">1. Emergency Liquidity (15%)</strong>
              <span>Cash reserves vs target emergency fund (min 6-12 months lifestyle expenses).</span>
            </div>
            <div className="p-3 rounded-lg bg-[#172B46]">
              <strong className="text-[#C6A76A] block">2. Savings Rate (20%)</strong>
              <span>Committed monthly SIP deployments across long-term compounding milestones.</span>
            </div>
            <div className="p-3 rounded-lg bg-[#172B46]">
              <strong className="text-[#C6A76A] block">3. Debt Burden (15%)</strong>
              <span>Assesses leverage and liability ratios against liquid asset collateral.</span>
            </div>
            <div className="p-3 rounded-lg bg-[#172B46]">
              <strong className="text-[#C6A76A] block">4. Goal Funding (20%)</strong>
              <span>Progress percentage across active life milestones toward target horizons.</span>
            </div>
            <div className="p-3 rounded-lg bg-[#172B46]">
              <strong className="text-[#C6A76A] block">5. Diversification (15%)</strong>
              <span>Penalizes single-holding concentration exceeding safe thresholds (&gt;25%).</span>
            </div>
            <div className="p-3 rounded-lg bg-[#172B46]">
              <strong className="text-[#C6A76A] block">6. Protection Cover (10%)</strong>
              <span>Completeness of periodic term life and health insurance audits.</span>
            </div>
            <div className="p-3 rounded-lg bg-[#172B46]">
              <strong className="text-[#C6A76A] block">7. Liquidity Ratio (5%)</strong>
              <span>Proportion of liquid funds matching client stated annual withdrawal needs.</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Diagnostic Dashboard for Selected Client */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall Score Badge Card */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center justify-center text-center space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Composite Wealth Score
          </span>
          <div className="relative flex items-center justify-center">
            <div className="w-36 h-36 rounded-full border-8 border-slate-100 flex flex-col items-center justify-center shadow-inner">
              <span className="text-4xl sm:text-5xl font-extrabold text-[#147D64]">
                {health.overallScore}
              </span>
              <span className="text-[10px] font-bold text-slate-400">/ 100</span>
            </div>
          </div>
          <h3 className="font-serif-display text-xl font-bold text-[#101C2C] mt-2">
            {selectedClient.name}
          </h3>
          <p className="text-xs text-slate-500">
            Category: {selectedClient.category} • Risk Profile: {selectedClient.riskProfile}
          </p>
          <div className="pt-3 border-t border-slate-100 w-full text-[11px] text-slate-500">
            Assessment Date: <strong>{formatDate(health.assessmentDate)}</strong> by {health.evaluatedBy}
          </div>
        </div>

        {/* 7 Component Breakdown Bars */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-serif-display text-lg font-bold text-[#101C2C]">
              Component Diagnostic Breakdown
            </h3>
            <span className="text-[11px] text-slate-500">Weighted Performance</span>
          </div>

          <div className="space-y-3.5 text-xs">
            {[
              { label: 'Emergency Fund Adequacy (15% Weight)', score: health.breakdown.emergencyFundScore },
              { label: 'Savings Rate & Monthly SIP Discipline (20% Weight)', score: health.breakdown.savingsRateScore },
              { label: 'Debt Burden & Leverage Management (15% Weight)', score: health.breakdown.debtBurdenScore },
              { label: 'Goal Funding Progression (20% Weight)', score: health.breakdown.goalFundingScore },
              { label: 'Portfolio Diversification Index (15% Weight)', score: health.breakdown.diversificationScore },
              { label: 'Insurance Review & Cover Completeness (10% Weight)', score: health.breakdown.insuranceReviewScore },
              { label: 'Liquidity Coverage (5% Weight)', score: health.breakdown.liquidityScore }
            ].map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-700 font-medium">{item.label}</span>
                  <span className="font-bold text-slate-900">{item.score} / 100</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full ${
                      item.score >= 80 ? 'bg-[#147D64]' : item.score >= 60 ? 'bg-[#C6A76A]' : 'bg-[#C94C4C]'
                    }`}
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Strengths & Focus Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-emerald-800">
            <CheckCircle2 className="w-5 h-5 text-[#147D64]" />
            <h3 className="font-serif-display text-lg font-bold">Identified Wealth Strengths</h3>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-600">
            {health.strengths.map((str, i) => (
              <li key={i} className="flex items-start bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
                <span className="text-[#147D64] font-bold mr-2">•</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-amber-800">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h3 className="font-serif-display text-lg font-bold">Areas Requiring Attention</h3>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-600">
            {health.areasRequiringAttention.map((area, i) => (
              <li key={i} className="flex items-start bg-amber-50/50 p-3 rounded-lg border border-amber-100">
                <span className="text-amber-600 font-bold mr-2">•</span>
                <span>{area}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Advisor Assessment Notes & Documentation */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif-display text-lg font-bold text-[#101C2C]">
            Advisor Clinical Documentation & Follow-ups
          </h3>
          <span className="text-[11px] text-slate-400">Stored to client audit dossier</span>
        </div>

        <textarea
          rows={3}
          value={advisorNotes || health.advisorNotes}
          onChange={e => setAdvisorNotes(e.target.value)}
          placeholder="Record notes on client risk capacity, family trust discussions, or recommended portfolio rebalances..."
          className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#C6A76A]"
        />

        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[10px]">
            Formal Disclaimer: Planning indicator only. Not a credit score or guaranteed outcome predictor.
          </span>

          <button
            onClick={handleSaveNotes}
            className="px-4 py-2 bg-[#101C2C] hover:bg-[#172B46] text-white rounded-lg font-semibold flex items-center transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 mr-1.5" />
            {notesSaved ? 'Notes Documented!' : 'Save Assessment Notes'}
          </button>
        </div>
      </div>
    </div>
  );
};
