import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR, formatPercentage } from '../../utils/formatters';
import { calculatePortfolioSummary, calculateAssetAllocation } from '../../utils/calculations';
import {
  PieChart as PieIcon,
  AlertTriangle,
  Sliders,
  CheckCircle2,
  TrendingUp,
  ShieldAlert,
  Info
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts';

export const AssetAllocationView: React.FC = () => {
  const { holdings, clients, firmSettings } = useApp();

  const [selectedClientId, setSelectedClientId] = useState<string>('All');

  // Target benchmark allocations (customizable)
  const [targetAllocations, setTargetAllocations] = useState<Record<string, number>>({
    'Equity': 55,
    'Debt': 25,
    'Gold & Precious Metals': 10,
    'Cash & Equivalents': 5,
    'Real Estate & REITs': 5,
    'Alternative Investments': 0
  });

  const filteredHoldings = useMemo(() => {
    if (selectedClientId === 'All') return holdings;
    return holdings.filter(h => h.clientId === selectedClientId);
  }, [holdings, selectedClientId]);

  const summary = calculatePortfolioSummary(filteredHoldings);
  const actualAllocation = calculateAssetAllocation(filteredHoldings);

  const ALLOCATION_COLORS: Record<string, string> = {
    'Equity': '#147D64',
    'Debt': '#172B46',
    'Cash & Equivalents': '#5B6677',
    'Gold & Precious Metals': '#C6A76A',
    'Real Estate & REITs': '#8B5CF6',
    'Alternative Investments': '#F59E0B'
  };

  // Compare Target vs Actual & Drift
  const comparisonData = actualAllocation.map(act => {
    const target = targetAllocations[act.name] || 0;
    const drift = act.percentage - target;
    return {
      name: act.name,
      actual: act.percentage,
      target,
      drift: Number(drift.toFixed(1)),
      value: act.value,
      isDrifted: Math.abs(drift) > (firmSettings.riskThresholds.maxAllocationDrift || 10)
    };
  });

  // Concentration indicator: Top 5 single holdings
  const topConcentrations = useMemo(() => {
    return [...filteredHoldings].sort((a, b) => b.currentMarketValue - a.currentMarketValue).slice(0, 5).map(h => {
      const weight = summary.totalMarketValue > 0 ? (h.currentMarketValue / summary.totalMarketValue) * 100 : 0;
      return {
        name: h.assetName,
        symbol: h.symbol,
        value: h.currentMarketValue,
        weight: Number(weight.toFixed(1)),
        isHighConcentration: weight > (firmSettings.riskThresholds.maxSingleAssetConcentration || 25)
      };
    });
  }, [filteredHoldings, summary, firmSettings]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-[#C6A76A]">
            Portfolio Engineering
          </span>
          <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#101C2C] mt-0.5">
            Asset Allocation & Drift Analysis
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Compare actual asset class distributions against target investment policy statements
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500 font-medium">Select Portfolio:</span>
          <select
            value={selectedClientId}
            onChange={e => setSelectedClientId(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold"
          >
            <option value="All">All Client Portfolios Consolidated</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.riskProfile})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Target vs Actual Visual Comparison Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif-display text-lg font-bold text-[#101C2C]">
                Target Benchmark vs Actual Allocation (%)
              </h3>
              <p className="text-xs text-slate-500">Drift flagged when deviation exceeds ±{firmSettings.riskThresholds.maxAllocationDrift}%</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} interval={0} angle={-15} textAnchor="end" height={50} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={val => `${val}%`} />
                <Tooltip formatter={(val: any) => [`${val}%`, 'Allocation']} contentStyle={{ backgroundColor: '#101C2C', color: '#fff', borderRadius: '8px', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="actual" name="Actual Allocation (%)" fill="#147D64" radius={[4, 4, 0, 0]} />
                <Bar dataKey="target" name="Target Benchmark (%)" fill="#C6A76A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Current Donut */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-serif-display text-lg font-bold text-[#101C2C] mb-2">
              Actual Holdings Donut
            </h3>
            <p className="text-xs text-slate-500 mb-4">Total Value: {formatINR(summary.totalMarketValue, true)}</p>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={actualAllocation} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3}>
                    {actualAllocation.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={ALLOCATION_COLORS[entry.name] || '#94a3b8'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: any) => [formatINR(val, true), 'Value']} contentStyle={{ backgroundColor: '#101C2C', color: '#fff', borderRadius: '8px', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1 mt-2 text-xs">
            {actualAllocation.filter(a => a.value > 0).map((a, i) => (
              <div key={i} className="flex justify-between items-center text-slate-600">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ALLOCATION_COLORS[a.name] || '#94a3b8' }} />
                  <span className="truncate">{a.name}</span>
                </div>
                <span className="font-semibold text-slate-900">{a.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Drift & Concentration Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Drift Table */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="font-serif-display text-lg font-bold text-[#101C2C] mb-3">
            Allocation Drift Audit
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] text-slate-400 uppercase">
                  <th className="py-2">Asset Class</th>
                  <th className="py-2">Target</th>
                  <th className="py-2">Actual</th>
                  <th className="py-2">Drift</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {comparisonData.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="py-2.5 font-bold text-slate-800">{row.name}</td>
                    <td className="py-2.5">{row.target}%</td>
                    <td className="py-2.5 font-semibold text-slate-900">{row.actual}%</td>
                    <td className={`py-2.5 font-bold ${row.drift > 0 ? 'text-[#147D64]' : row.drift < 0 ? 'text-amber-600' : 'text-slate-500'}`}>
                      {row.drift > 0 ? `+${row.drift}` : row.drift}%
                    </td>
                    <td className="py-2.5">
                      {row.isDrifted ? (
                        <span className="inline-flex items-center text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded">
                          <AlertTriangle className="w-3 h-3 mr-1" /> Rebalance Needed
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[10px] font-semibold text-[#147D64] bg-emerald-50 px-2 py-0.5 rounded">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Aligned
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Concentration Indicators */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="font-serif-display text-lg font-bold text-[#101C2C] mb-3">
            Single-Asset Concentration Risk Guards
          </h3>
          <div className="space-y-3">
            {topConcentrations.map((item, idx) => (
              <div key={idx} className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900">{item.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{item.symbol} • {formatINR(item.value, true)}</div>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-bold ${item.isHighConcentration ? 'text-red-600' : 'text-slate-800'}`}>
                    {item.weight}% Weight
                  </span>
                  {item.isHighConcentration && (
                    <span className="text-[9px] text-red-600 block uppercase font-bold">
                      Exceeds {firmSettings.riskThresholds.maxSingleAssetConcentration}% Max
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
