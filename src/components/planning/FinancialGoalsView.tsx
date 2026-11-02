import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { FinancialGoal, GoalCategory, GoalPriority, GoalStatus } from '../../types';
import { formatINR, formatDate } from '../../utils/formatters';
import { calculateGoalProjection } from '../../utils/calculations';
import {
  Target,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  Edit,
  Trash2,
  Info,
  Calendar
} from 'lucide-react';

interface FinancialGoalsViewProps {
  onOpenAddGoal: () => void;
  onEditGoal: (g: FinancialGoal) => void;
}

export const FinancialGoalsView: React.FC<FinancialGoalsViewProps> = ({
  onOpenAddGoal,
  onEditGoal
}) => {
  const { goals, clients, deleteGoal, updateGoal } = useApp();

  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filteredGoals = useMemo(() => {
    return goals.filter(g => {
      if (selectedClient !== 'All' && g.clientId !== selectedClient) return false;
      if (selectedCategory !== 'All' && g.category !== selectedCategory) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const client = clients.find(c => c.id === g.clientId);
        const matchName = g.name.toLowerCase().includes(q);
        const matchClient = client ? client.name.toLowerCase().includes(q) : false;
        return matchName || matchClient;
      }
      return true;
    });
  }, [goals, clients, search, selectedClient, selectedCategory]);

  const totalTargetCorpus = filteredGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalSavedCorpus = filteredGoals.reduce((sum, g) => sum + g.currentSavedAmount, 0);
  const totalMonthlyDeployment = filteredGoals.reduce((sum, g) => sum + (g.currentMonthlyContribution || 0), 0);
  const averageCompletion = totalTargetCorpus > 0 ? (totalSavedCorpus / totalTargetCorpus) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-[#C6A76A]">
            Life Milestone Architecture
          </span>
          <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#101C2C] mt-0.5">
            Financial Goals & Planning
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Compound interest projections, monthly SIP requirements, and milestone progress tracking
          </p>
        </div>

        <button
          onClick={onOpenAddGoal}
          className="inline-flex items-center px-4 py-2 bg-[#101C2C] hover:bg-[#172B46] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5 text-[#C6A76A]" />
          Create New Goal
        </button>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500">Aggregate Target Corpus</span>
          <div className="text-xl font-bold text-[#101C2C] mt-1">{formatINR(totalTargetCorpus, true)}</div>
          <span className="text-[11px] text-slate-400">{filteredGoals.length} active milestones</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500">Accumulated Savings</span>
          <div className="text-xl font-bold text-[#147D64] mt-1">{formatINR(totalSavedCorpus, true)}</div>
          <span className="text-[11px] text-emerald-700 font-semibold">{averageCompletion.toFixed(1)}% funded</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500">Monthly SIP Deployment</span>
          <div className="text-xl font-bold text-[#101C2C] mt-1">{formatINR(totalMonthlyDeployment, true)}/mo</div>
          <span className="text-[11px] text-slate-400">Automated contributions</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500">Goals on Track</span>
          <div className="text-xl font-bold text-[#C6A76A] mt-1">
            {filteredGoals.filter(g => g.status === 'On Track').length} / {filteredGoals.length}
          </div>
          <span className="text-[11px] text-slate-400">High probability</span>
        </div>
      </div>

      {/* Filter Ribbon */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="relative flex-1 min-w-[220px]">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search goals by title or client name..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C6A76A]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-slate-500 font-medium">Client:</span>
          <select
            value={selectedClient}
            onChange={e => setSelectedClient(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-medium cursor-pointer"
          >
            <option value="All">All Clients</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-slate-500 font-medium">Category:</span>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-medium cursor-pointer"
          >
            <option value="All">All Categories</option>
            <option value="Retirement">Retirement</option>
            <option value="Home Purchase">Home Purchase</option>
            <option value="Child's Education">Child's Education</option>
            <option value="Emergency Fund">Emergency Fund</option>
            <option value="Family Protection">Family Protection</option>
            <option value="Travel & Lifestyle">Travel & Lifestyle</option>
            <option value="Custom">Custom</option>
          </select>
        </div>
      </div>

      {/* Goals Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredGoals.map((g) => {
          const client = clients.find(c => c.id === g.clientId);
          const projection = calculateGoalProjection(g);
          const remainingAmount = Math.max(0, g.targetAmount - g.currentSavedAmount);

          return (
            <div
              key={g.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between space-y-4 hover:border-[#C6A76A] transition-colors"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                      {g.category}
                    </span>
                    <h3 className="font-serif-display text-xl font-bold text-[#101C2C] mt-2">
                      {g.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Client: <strong className="text-slate-800">{client ? client.name : 'Client'}</strong> • Priority: <span className="font-semibold text-slate-700">{g.priority}</span>
                    </p>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      g.status === 'On Track'
                        ? 'bg-emerald-50 text-emerald-800'
                        : g.status === 'Attention Needed'
                        ? 'bg-amber-50 text-amber-800'
                        : 'bg-red-50 text-red-800'
                    }`}
                  >
                    {g.status}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600 font-medium">Corpus Funded</span>
                    <span className="font-bold text-[#147D64]">{projection.percentageSaved}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#C6A76A] h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${projection.percentageSaved}%` }}
                    />
                  </div>
                </div>

                {/* Metrics Breakdown */}
                <div className="grid grid-cols-2 gap-3 mt-4 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Target Corpus</span>
                    <strong className="text-slate-900">{formatINR(g.targetAmount)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Current Saved Amount</span>
                    <strong className="text-[#147D64]">{formatINR(g.currentSavedAmount)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Remaining Capital</span>
                    <strong className="text-slate-800">{formatINR(remainingAmount)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Target Horizon</span>
                    <strong className="text-slate-800">{formatDate(g.targetDate)} ({projection.yearsRemaining} yrs)</strong>
                  </div>
                </div>

                {/* Mathematical Projection Box (Section 11 requirement) */}
                <div className="p-3 bg-[#F7F5F0] rounded-xl border border-slate-200 text-xs text-slate-700 mt-3 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Transparent Future Value (FV)</span>
                    <span className="font-bold text-[#147D64]">{projection.onTrackProbability}% On Track</span>
                  </div>
                  <div className="text-[11px] leading-relaxed">
                    At <strong>{formatINR(g.currentMonthlyContribution)}/mo</strong> with <strong>{g.expectedReturnAssumption || 10}% p.a.</strong> compounding, projected corpus reaches <strong>{formatINR(projection.projectedFutureValue, true)}</strong>.
                  </div>
                  {projection.shortfallOrSurplus < 0 && (
                    <div className="text-[10px] text-amber-800 font-medium pt-1">
                      Recommended SIP boost: +{formatINR(Math.abs(projection.requiredMonthlyContribution - g.currentMonthlyContribution))}/mo to bridge deficit.
                    </div>
                  )}
                </div>

                {g.notes && (
                  <p className="text-[11px] text-slate-500 italic mt-2">
                    "{g.notes}"
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => onEditGoal(g)}
                  className="font-semibold text-[#101C2C] hover:text-[#147D64] flex items-center cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5 mr-1" />
                  Edit Parameters
                </button>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => updateGoal(g.id, { status: g.status === 'Achieved' ? 'On Track' : 'Achieved' })}
                    className="font-semibold text-[#147D64] hover:underline cursor-pointer"
                  >
                    {g.status === 'Achieved' ? 'Reopen Goal' : 'Mark Achieved'}
                  </button>
                  <button
                    onClick={() => deleteGoal(g.id)}
                    className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                    title="Archive Goal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredGoals.length === 0 && (
        <div className="py-16 bg-white rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
          No financial goals found matching the selected filters.
        </div>
      )}
    </div>
  );
};
