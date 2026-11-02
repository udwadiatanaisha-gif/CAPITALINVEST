import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Client, ClientCategory, RiskProfile, RelationshipStatus } from '../../types';
import { formatINR, formatDate } from '../../utils/formatters';
import { exportToExcel } from '../../utils/excelParser';
import {
  Users,
  Search,
  Filter,
  Plus,
  Download,
  Eye,
  Edit,
  Archive,
  Calendar,
  ChevronDown,
  ArrowUpDown,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface ClientDirectoryProps {
  onOpenAddClient: () => void;
  onEditClient: (client: Client) => void;
  onScheduleReview: (client: Client) => void;
}

export const ClientDirectory: React.FC<ClientDirectoryProps> = ({
  onOpenAddClient,
  onEditClient,
  onScheduleReview
}) => {
  const { clients, holdings, archiveClient, navigate } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [riskFilter, setRiskFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [sortField, setSortField] = useState<'name' | 'value' | 'nextReview'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [archiveConfirmId, setArchiveConfirmId] = useState<string | null>(null);

  // Calculate portfolio value per client
  const clientValues = useMemo(() => {
    const map: Record<string, number> = {};
    clients.forEach(c => {
      const cHoldings = holdings.filter(h => h.clientId === c.id);
      map[c.id] = cHoldings.reduce((sum, h) => sum + h.currentMarketValue, 0);
    });
    return map;
  }, [clients, holdings]);

  // Filter & Sort
  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      // Exclude archived unless explicitly selected
      if (statusFilter === 'All' && c.relationshipStatus === 'Archived') return false;
      if (statusFilter !== 'All' && c.relationshipStatus !== statusFilter) return false;
      if (riskFilter !== 'All' && c.riskProfile !== riskFilter) return false;
      if (categoryFilter !== 'All' && c.category !== categoryFilter) return false;

      if (search.trim()) {
        const query = search.toLowerCase();
        const matchName = c.name.toLowerCase().includes(query);
        const matchCity = c.city.toLowerCase().includes(query);
        const matchId = (c.clientNumber || c.id).toLowerCase().includes(query);
        const matchAdvisor = (c.primaryAdvisor || '').toLowerCase().includes(query);
        return matchName || matchCity || matchId || matchAdvisor;
      }
      return true;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === 'value') {
        comparison = (clientValues[a.id] || 0) - (clientValues[b.id] || 0);
      } else if (sortField === 'nextReview') {
        comparison = (a.nextReviewDate || '').localeCompare(b.nextReviewDate || '');
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [clients, clientValues, search, statusFilter, riskFilter, categoryFilter, sortField, sortOrder]);

  const handleExport = () => {
    const exportData = filteredClients.map(c => ({
      'Client ID': c.clientNumber || c.id,
      'Client Name': c.name,
      'Primary Advisor': c.primaryAdvisor,
      'Category': c.category,
      'City': c.city,
      'Risk Profile': c.riskProfile,
      'Portfolio Value (INR)': clientValues[c.id] || 0,
      'Status': c.relationshipStatus,
      'Next Review Date': formatDate(c.nextReviewDate)
    }));
    exportToExcel(exportData, `CapitalVest_Clients_${new Date().toISOString().split('T')[0]}`);
  };

  const confirmArchive = (id: string) => {
    archiveClient(id);
    setArchiveConfirmId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-[#C6A76A]">
            Relationship Management
          </span>
          <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#101C2C] mt-0.5">
            Client Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Displaying {filteredClients.length} of {clients.length} registered family relationships
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExport}
            className="inline-flex items-center px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            Export Directory
          </button>

          <button
            onClick={onOpenAddClient}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-[#101C2C] hover:bg-[#172B46] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5 text-[#C6A76A]" />
            Add New Client
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Filter by client name, city, ID, or advisor..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C6A76A]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-slate-500 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none font-medium cursor-pointer"
          >
            <option value="All">All Active & Prospective</option>
            <option value="Active">Active</option>
            <option value="Prospective">Prospective</option>
            <option value="Inactive">Inactive</option>
            <option value="Archived">Archived</option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-slate-500 font-medium">Category:</span>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none font-medium cursor-pointer"
          >
            <option value="All">All Categories</option>
            <option value="Ultra HNW">Ultra HNW (₹5 Cr+)</option>
            <option value="HNW">HNW (₹1-5 Cr)</option>
            <option value="Affluent">Affluent (₹25L-1 Cr)</option>
            <option value="Retail">Retail</option>
          </select>
        </div>

        {/* Risk Profile Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-slate-500 font-medium">Risk:</span>
          <select
            value={riskFilter}
            onChange={e => setRiskFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none font-medium cursor-pointer"
          >
            <option value="All">All Risk Profiles</option>
            <option value="Conservative">Conservative</option>
            <option value="Moderate">Moderate</option>
            <option value="Balanced">Balanced</option>
            <option value="Growth">Growth</option>
            <option value="Aggressive">Aggressive</option>
          </select>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#101C2C] text-white uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-4 font-semibold">Client Identifier</th>
                <th
                  onClick={() => {
                    if (sortField === 'name') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    else { setSortField('name'); setSortOrder('asc'); }
                  }}
                  className="py-3.5 px-4 font-semibold cursor-pointer hover:text-[#C6A76A]"
                >
                  <div className="flex items-center space-x-1">
                    <span>Client Name</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4 font-semibold">Category & City</th>
                <th
                  onClick={() => {
                    if (sortField === 'value') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    else { setSortField('value'); setSortOrder('desc'); }
                  }}
                  className="py-3.5 px-4 font-semibold cursor-pointer hover:text-[#C6A76A]"
                >
                  <div className="flex items-center space-x-1">
                    <span>Portfolio Value</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4 font-semibold">Risk Classification</th>
                <th
                  onClick={() => {
                    if (sortField === 'nextReview') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    else { setSortField('nextReview'); setSortOrder('asc'); }
                  }}
                  className="py-3.5 px-4 font-semibold cursor-pointer hover:text-[#C6A76A]"
                >
                  <div className="flex items-center space-x-1">
                    <span>Next Review</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClients.map((client) => {
                const pVal = clientValues[client.id] || 0;
                const isOverdue = client.nextReviewDate && new Date(client.nextReviewDate) < new Date();

                return (
                  <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-500">
                      {client.clientNumber || client.id}
                    </td>

                    <td className="py-3.5 px-4">
                      <div
                        onClick={() => navigate('client-360', client.id)}
                        className="font-bold text-[#101C2C] hover:text-[#147D64] cursor-pointer"
                      >
                        {client.name}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-xs">{client.email}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-800">{client.category}</span>
                      <span className="text-[11px] text-slate-500 block">{client.city}</span>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {formatINR(pVal, true)}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-[#147D64]/10 text-[#147D64]">
                        {client.riskProfile}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`font-medium ${isOverdue ? 'text-red-600 font-bold' : 'text-slate-700'}`}>
                        {formatDate(client.nextReviewDate)}
                      </span>
                      {isOverdue && (
                        <span className="text-[9px] text-red-500 block uppercase font-bold">Overdue</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          client.relationshipStatus === 'Active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : client.relationshipStatus === 'Archived'
                            ? 'bg-slate-100 text-slate-500'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {client.relationshipStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => navigate('client-360', client.id)}
                          className="p-1.5 text-slate-500 hover:text-[#101C2C] hover:bg-slate-100 rounded cursor-pointer"
                          title="Open Client 360 Dossier"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onEditClient(client)}
                          className="p-1.5 text-slate-500 hover:text-[#C6A76A] hover:bg-slate-100 rounded cursor-pointer"
                          title="Edit Client Information"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onScheduleReview(client)}
                          className="p-1.5 text-slate-500 hover:text-[#147D64] hover:bg-slate-100 rounded cursor-pointer"
                          title="Schedule Review Meeting"
                        >
                          <Calendar className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setArchiveConfirmId(client.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                          title="Archive Client Record"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredClients.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-xs">
            No clients found matching the selected filters.
          </div>
        )}
      </div>

      {/* Confirmation Dialog for Archival */}
      {archiveConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-serif-display text-xl font-bold text-[#101C2C]">Archive Client Relationship?</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Archiving hides the client from the active directory but preserves all historical transactions, holdings, and audit logs.
            </p>
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setArchiveConfirmId(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmArchive(archiveConfirmId)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-700 text-white cursor-pointer"
              >
                Confirm Archival
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
