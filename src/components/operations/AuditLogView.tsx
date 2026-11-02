import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AuditLogEntry } from '../../types';
import { formatDateTime } from '../../utils/formatters';
import { exportToExcel } from '../../utils/excelParser';
import {
  FileText,
  ShieldCheck,
  Search,
  Filter,
  Download,
  Calendar,
  UserCheck,
  Activity,
  Lock,
  Clock,
  Terminal
} from 'lucide-react';

export const AuditLogView: React.FC = () => {
  const { auditLogs, currentUser } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');

  const filteredLogs = auditLogs.filter(log => {
    if (actionFilter !== 'all' && log.action !== actionFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const details = (log.details || '').toLowerCase();
      const actor = (log.performedBy || log.actorName || '').toLowerCase();
      const target = (log.targetType || log.affectedRecord || '').toLowerCase();
      const ip = (log.ipAddress || '').toLowerCase();
      return details.includes(q) || actor.includes(q) || target.includes(q) || ip.includes(q);
    }
    return true;
  });

  const handleExportLogs = () => {
    const exportData = filteredLogs.map(l => ({
      ID: l.id,
      Action: l.action,
      Target_Type: l.targetType,
      Target_ID: l.targetId || '-',
      Details: l.details,
      Performed_By: l.performedBy,
      IP_Address: l.ipAddress || 'Internal',
      Timestamp_IST: formatDateTime(l.timestamp)
    }));

    exportToExcel(exportData, `CapitalVest_AuditLog_${new Date().toISOString().split('T')[0]}`);
  };

  const getActionBadge = (act: AuditLogEntry['action']) => {
    switch (act) {
      case 'data_import':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">Data Import</span>;
      case 'holding_update':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800">Holding Modified</span>;
      case 'client_create':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-100 text-purple-800">Client Enrolled</span>;
      case 'risk_acknowledged':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-900">Risk Acknowledged</span>;
      case 'export_run':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-100 text-indigo-800">Report Export</span>;
      case 'user_role_change':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-100 text-rose-800">Privilege Change</span>;
      case 'settings_update':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-200 text-slate-800">Settings Configured</span>;
      case 'login':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-teal-100 text-teal-800">Auth Event</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-900 text-amber-400">
              <ShieldCheck className="w-3.5 h-3.5" /> Immutable Audit Trail
            </span>
            <span className="text-xs text-slate-400">Append-Only • SEBI Compliance Standard</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
            Fiduciary Audit Trail & Activity Log
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Forensic logging of spreadsheet imports, portfolio edits, client profile access, and privileged credential changes.
          </p>
        </div>

        <button
          onClick={handleExportLogs}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-all shadow-sm"
        >
          <Download className="w-4 h-4 text-emerald-600" />
          Export Audit Trail (.xlsx)
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-4 justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search action details, actor, or IP address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white"
          >
            <option value="all">All Action Categories</option>
            <option value="data_import">Data Imports</option>
            <option value="holding_update">Holding Modifications</option>
            <option value="client_create">Client Dossier Actions</option>
            <option value="risk_acknowledged">Risk Alert Approvals</option>
            <option value="export_run">Report Generation</option>
            <option value="login">Authentication Events</option>
            <option value="settings_update">Configuration Changes</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">No audit logs matching query.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs uppercase font-semibold">
                  <th className="py-3.5 px-6">Timestamp (IST)</th>
                  <th className="py-3.5 px-4">Event Category</th>
                  <th className="py-3.5 px-4">Target Entity</th>
                  <th className="py-3.5 px-6">Event Details</th>
                  <th className="py-3.5 px-4">Actor</th>
                  <th className="py-3.5 px-6 text-right">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 text-xs text-slate-600 font-mono">
                      {formatDateTime(log.timestamp)}
                    </td>
                    <td className="py-4 px-4">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="py-4 px-4 text-xs font-medium text-slate-700 capitalize">
                      {String(log.targetType || log.affectedRecord || 'Record').replace('_', ' ')}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-900 font-medium">
                      {log.details}
                    </td>
                    <td className="py-4 px-4 text-xs font-semibold text-slate-800">
                      {log.performedBy}
                    </td>
                    <td className="py-4 px-6 text-right text-xs font-mono text-slate-400">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
