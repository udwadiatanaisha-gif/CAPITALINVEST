import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Holding, AssetClass } from '../../types';
import { formatINR, formatPercentage, formatDate } from '../../utils/formatters';
import { exportToExcel } from '../../utils/excelParser';
import {
  Search,
  Filter,
  Plus,
  Download,
  Trash2,
  Edit,
  ArrowUpDown,
  FileSpreadsheet,
  AlertCircle,
  Tag
} from 'lucide-react';

interface HoldingsRegisterProps {
  onOpenAddHolding: () => void;
  onEditHolding: (h: Holding) => void;
}

export const HoldingsRegister: React.FC<HoldingsRegisterProps> = ({
  onOpenAddHolding,
  onEditHolding
}) => {
  const { holdings, clients, deleteHolding, navigate } = useApp();

  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<string>('All');
  const [selectedAssetClass, setSelectedAssetClass] = useState<string>('All');
  const [sortField, setSortField] = useState<'assetName' | 'currentMarketValue' | 'gainLossPercentage'>('currentMarketValue');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Compute total portfolio value for weights
  const totalMarketVal = useMemo(() => {
    return holdings.reduce((sum, h) => sum + h.currentMarketValue, 0);
  }, [holdings]);

  const filteredHoldings = useMemo(() => {
    return holdings.filter(h => {
      if (selectedClient !== 'All' && h.clientId !== selectedClient) return false;
      if (selectedAssetClass !== 'All' && h.assetClass !== selectedAssetClass) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const client = clients.find(c => c.id === h.clientId);
        const matchName = h.assetName.toLowerCase().includes(q);
        const matchSymbol = h.symbol.toLowerCase().includes(q);
        const matchClient = client ? client.name.toLowerCase().includes(q) : false;
        return matchName || matchSymbol || matchClient;
      }
      return true;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortField === 'assetName') {
        comparison = a.assetName.localeCompare(b.assetName);
      } else if (sortField === 'currentMarketValue') {
        comparison = a.currentMarketValue - b.currentMarketValue;
      } else if (sortField === 'gainLossPercentage') {
        comparison = a.gainLossPercentage - b.gainLossPercentage;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [holdings, clients, search, selectedClient, selectedAssetClass, sortField, sortOrder]);

  const handleExport = () => {
    const data = filteredHoldings.map(h => {
      const client = clients.find(c => c.id === h.clientId);
      return {
        'Holding ID': h.id,
        'Client Name': client ? client.name : 'Client',
        'Asset Description': h.assetName,
        'Asset Class': h.assetClass,
        'Symbol / ISIN': h.symbol,
        'Sector': h.sector || 'General',
        'Quantity': h.quantity,
        'Avg Purchase Price (INR)': h.averagePurchasePrice,
        'Current Benchmark Price (INR)': h.currentPrice,
        'Total Invested Value (INR)': h.investedValue,
        'Current Market Value (INR)': h.currentMarketValue,
        'Unrealized Gain/Loss (INR)': h.gainLossAmount,
        'Absolute Return (%)': h.gainLossPercentage,
        'Last Price Update': h.lastPriceUpdate
      };
    });
    exportToExcel(data, `CapitalVest_Holdings_Register_${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-[#C6A76A]">
            Asset Inventory
          </span>
          <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#101C2C] mt-0.5">
            Holdings Register
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Displaying {filteredHoldings.length} of {holdings.length} verified multi-asset holding positions
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('spreadsheet-import')}
            className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors flex items-center cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-[#C6A76A]" />
            Import Spreadsheet
          </button>

          <button
            onClick={handleExport}
            className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors flex items-center cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            Export Register
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

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="relative flex-1 min-w-[220px]">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by asset name, ticker, or client..."
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
          <span className="text-slate-500 font-medium">Asset Class:</span>
          <select
            value={selectedAssetClass}
            onChange={e => setSelectedAssetClass(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-medium cursor-pointer"
          >
            <option value="All">All Classes</option>
            <option value="Equity">Equity</option>
            <option value="Debt">Debt</option>
            <option value="Cash & Equivalents">Cash & Equivalents</option>
            <option value="Gold & Precious Metals">Gold & Precious Metals</option>
            <option value="Real Estate & REITs">Real Estate & REITs</option>
          </select>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#101C2C] text-white uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-4 font-semibold">Holding ID</th>
                <th
                  onClick={() => {
                    if (sortField === 'assetName') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    else { setSortField('assetName'); setSortOrder('asc'); }
                  }}
                  className="py-3.5 px-4 font-semibold cursor-pointer hover:text-[#C6A76A]"
                >
                  <div className="flex items-center space-x-1">
                    <span>Asset Description</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4 font-semibold">Client Dossier</th>
                <th className="py-3.5 px-4 font-semibold">Asset Class</th>
                <th className="py-3.5 px-4 font-semibold">Qty</th>
                <th className="py-3.5 px-4 font-semibold">Avg Cost</th>
                <th className="py-3.5 px-4 font-semibold">Current Benchmark</th>
                <th className="py-3.5 px-4 font-semibold">Total Invested</th>
                <th
                  onClick={() => {
                    if (sortField === 'currentMarketValue') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    else { setSortField('currentMarketValue'); setSortOrder('desc'); }
                  }}
                  className="py-3.5 px-4 font-semibold cursor-pointer hover:text-[#C6A76A]"
                >
                  <div className="flex items-center space-x-1">
                    <span>Market Value</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => {
                    if (sortField === 'gainLossPercentage') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    else { setSortField('gainLossPercentage'); setSortOrder('desc'); }
                  }}
                  className="py-3.5 px-4 font-semibold cursor-pointer hover:text-[#C6A76A]"
                >
                  <div className="flex items-center space-x-1">
                    <span>Unrealized Return</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4 font-semibold">Weight</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHoldings.map((h) => {
                const client = clients.find(c => c.id === h.clientId);
                const weight = totalMarketVal > 0 ? (h.currentMarketValue / totalMarketVal) * 100 : 0;

                return (
                  <tr key={h.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400 font-medium">
                      {h.id}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-[#101C2C]">{h.assetName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{h.symbol} • {h.sector || 'General'}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        onClick={() => client && navigate('client-360', client.id)}
                        className="font-semibold text-slate-800 hover:text-[#147D64] cursor-pointer"
                      >
                        {client ? client.name : 'Unknown Client'}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {h.assetClass}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-medium">{h.quantity.toLocaleString('en-IN')}</td>

                    <td className="py-3 px-4 text-slate-600">{formatINR(h.averagePurchasePrice)}</td>

                    <td className="py-3 px-4 font-bold text-slate-900">
                      {formatINR(h.currentPrice)}
                      <span className="text-[9px] text-slate-400 block font-normal">{h.lastPriceUpdate}</span>
                    </td>

                    <td className="py-3 px-4 text-slate-600 font-medium">{formatINR(h.investedValue)}</td>

                    <td className="py-3 px-4 font-bold text-slate-900">{formatINR(h.currentMarketValue)}</td>

                    <td className="py-3 px-4">
                      <div className={`font-bold ${h.gainLossAmount >= 0 ? 'text-[#147D64]' : 'text-red-600'}`}>
                        {formatPercentage(h.gainLossPercentage)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {h.gainLossAmount >= 0 ? '+' : ''}{formatINR(h.gainLossAmount, true)}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-700">
                      {weight.toFixed(1)}%
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => onEditHolding(h)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                          title="Edit Position"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteHolding(h.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Delete Position"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredHoldings.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-xs">
            No holdings match the active search or filters.
          </div>
        )}
      </div>
    </div>
  );
};
