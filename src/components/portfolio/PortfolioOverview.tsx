import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatINR, formatPercentage, formatDate } from '../../utils/formatters';
import { calculatePortfolioSummary, calculateAssetAllocation } from '../../utils/calculations';
import {
  TrendingUp,
  PieChart as PieIcon,
  Filter,
  Download,
  Plus,
  ArrowUpRight,
  Shield,
  Layers,
  ChevronRight
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

interface PortfolioOverviewProps {
  onOpenAddHolding: () => void;
}

export const PortfolioOverview: React.FC<PortfolioOverviewProps> = ({ onOpenAddHolding }) => {
  const { holdings, clients, navigate } = useApp();

  const [selectedClientId, setSelectedClientId] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Filter holdings based on client and category
  const filteredHoldings = useMemo(() => {
    return holdings.filter(h => {
      if (selectedClientId !== 'All' && h.clientId !== selectedClientId) return false;
      if (selectedCategory !== 'All' && h.assetClass !== selectedCategory) return false;
      return true;
    });
  }, [holdings, selectedClientId, selectedCategory]);

  const summary = calculatePortfolioSummary(filteredHoldings);
  const allocation = calculateAssetAllocation(filteredHoldings);

  // Sector Breakdown
  const sectorBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    filteredHoldings.forEach(h => {
      const s = h.sector || 'Other / Multi-Asset';
      map[s] = (map[s] || 0) + h.currentMarketValue;
    });
    return Object.entries(map).map(([name, value]) => ({
      name,
      value,
      percentage: summary.totalMarketValue > 0 ? Number(((value / summary.totalMarketValue) * 100).toFixed(1)) : 0
    })).sort((a, b) => b.value - a.value).slice(0, 6);
  }, [filteredHoldings, summary]);

  // Annualized return (CAGR estimate assuming ~2.2 yr average holding horizon for portfolio)
  const holdingYears = 2.2;
  const cagrReturn = summary.totalInvestedValue > 0 && summary.totalMarketValue > 0
    ? (Math.pow(summary.totalMarketValue / summary.totalInvestedValue, 1 / holdingYears) - 1) * 100
    : 0;

  const ALLOCATION_COLORS = ['#147D64', '#172B46', '#C6A76A', '#5B6677', '#8B5CF6', '#F59E0B'];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-[#C6A76A]">
            Wealth Analytics
          </span>
          <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#101C2C] mt-0.5">
            Consolidated Portfolio Overview
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Multi-asset positions, cost basis, unrealized capital gains, and sector concentration
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('holdings')}
            className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            Holdings Register
          </button>
          <button
            onClick={onOpenAddHolding}
            className="px-4 py-2 rounded-lg bg-[#101C2C] hover:bg-[#172B46] text-white text-xs font-semibold shadow-xs transition-colors flex items-center cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5 text-[#C6A76A]" />
            Add Position
          </button>
        </div>
      </div>

      {/* Filter Ribbon */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-slate-500 font-medium">Filter Client:</span>
            <select
              value={selectedClientId}
              onChange={e => setSelectedClientId(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-medium cursor-pointer"
            >
              <option value="All">All Client Portfolios ({clients.length})</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.city})</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-500 font-medium">Asset Class:</span>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-medium cursor-pointer"
            >
              <option value="All">All Asset Classes</option>
              <option value="Equity">Equity</option>
              <option value="Debt">Debt</option>
              <option value="Cash & Equivalents">Cash & Equivalents</option>
              <option value="Gold & Precious Metals">Gold & Precious Metals</option>
              <option value="Real Estate & REITs">Real Estate & REITs</option>
            </select>
          </div>
        </div>

        <div className="text-slate-500 font-medium">
          Showing <strong className="text-slate-900">{filteredHoldings.length}</strong> positions
        </div>
      </div>

      {/* 4 Core Financial Return Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500">Current Market Value</span>
          <div className="text-xl sm:text-2xl font-bold text-[#101C2C] mt-1">{formatINR(summary.totalMarketValue)}</div>
          <div className="text-[11px] text-slate-400 mt-2">Latest prices</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500">Total Invested Capital</span>
          <div className="text-xl sm:text-2xl font-bold text-[#101C2C] mt-1">{formatINR(summary.totalInvestedValue)}</div>
          <div className="text-[11px] text-slate-400 mt-2">Cost basis</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500">Unrealized Gain / (Loss)</span>
          <div className={`text-xl sm:text-2xl font-bold mt-1 ${summary.unrealizedGainLoss >= 0 ? 'text-[#147D64]' : 'text-red-600'}`}>
            {summary.unrealizedGainLoss >= 0 ? '+' : ''}{formatINR(summary.unrealizedGainLoss)}
          </div>
          <div className="text-[11px] font-semibold text-[#147D64] mt-2">
            {formatPercentage(summary.absoluteReturnPercentage)} Absolute
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500">Annualized CAGR Return</span>
          <div className="text-xl sm:text-2xl font-bold text-[#101C2C] mt-1">
            {cagrReturn > 0 ? `+${cagrReturn.toFixed(2)}%` : 'N/A'}
          </div>
          <div className="text-[11px] text-[#C6A76A] font-semibold mt-2">
            Multi-year compounded
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid: Asset Allocation & Sector Concentration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset Class Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif-display text-lg font-bold text-[#101C2C]">
                Asset Class Breakdown
              </h3>
              <button
                onClick={() => navigate('asset-allocation')}
                className="text-xs text-[#147D64] font-semibold hover:underline"
              >
                Target Drift Analysis
              </button>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={allocation} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3}>
                    {allocation.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={ALLOCATION_COLORS[index % ALLOCATION_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: any) => [formatINR(val, true), 'Value']} contentStyle={{ backgroundColor: '#101C2C', color: '#fff', borderRadius: '8px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 mt-3 text-xs">
            {allocation.filter(a => a.value > 0).map((a, i) => (
              <div key={i} className="flex justify-between items-center text-slate-600">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ALLOCATION_COLORS[i % ALLOCATION_COLORS.length] }} />
                  <span>{a.name}</span>
                </div>
                <span className="font-semibold text-slate-900">{a.percentage}% ({formatINR(a.value, true)})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sector Allocation Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-serif-display text-lg font-bold text-[#101C2C] mb-4">
              Sector Exposure & Diversification
            </h3>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sectorBreakdown} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} tickFormatter={val => `₹${(val / 100000).toFixed(0)}L`} />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={110} />
                  <Tooltip formatter={(val: any) => [formatINR(val), 'Exposure']} contentStyle={{ backgroundColor: '#101C2C', color: '#fff', borderRadius: '8px', fontSize: '11px' }} />
                  <Bar dataKey="value" fill="#147D64" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-2 text-xs text-slate-500 border-t border-slate-100 flex justify-between">
            <span>Top Sector: <strong className="text-slate-800">{sectorBreakdown[0]?.name || 'Diversified'}</strong></span>
            <span>Concentration: <strong className="text-slate-800">{sectorBreakdown[0]?.percentage || 0}%</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
