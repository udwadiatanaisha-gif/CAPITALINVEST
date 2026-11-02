import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SyncJob } from '../../types';
import { formatDateTime } from '../../utils/formatters';
import {
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Download,
  Filter,
  Check
} from 'lucide-react';

export const SyncHistoryView: React.FC = () => {
  const { syncJobs, triggerSync, navigate, dataSources } = useApp();

  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  const handleRetry = async (job: SyncJob) => {
    setRetryingId(job.id);
    const primarySource = dataSources[0];
    if (primarySource) {
      const res = await triggerSync(primarySource.id);
      setSuccessMsg(`Retry completed: ${res.message}`);
    } else {
      setSuccessMsg('Retry synchronization executed successfully.');
    }
    setRetryingId(null);
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-[#C6A76A]">
            Audit & Synchronization Log
          </span>
          <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#101C2C] mt-0.5">
            Spreadsheet Synchronization History
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Auditable log of automated Google Sheets updates, batch contract note imports, and Excel commits
          </p>
        </div>

        <button
          onClick={() => navigate('data-hub')}
          className="px-4 py-2 bg-[#101C2C] text-white rounded-lg text-xs font-semibold hover:bg-[#172B46] cursor-pointer"
        >
          Return to Data Hub
        </button>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-[#147D64] flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Sync Jobs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#101C2C] text-white uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4 font-semibold">Sync ID</th>
                <th className="py-3 px-4 font-semibold">Data Source & Type</th>
                <th className="py-3 px-4 font-semibold">Execution Time</th>
                <th className="py-3 px-4 font-semibold">Duration</th>
                <th className="py-3 px-4 font-semibold">Created / Updated</th>
                <th className="py-3 px-4 font-semibold">Failed Rows</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Initiated By</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {syncJobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-medium text-slate-500">
                    {job.id}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900 block">{job.dataSourceName}</span>
                    <span className="text-[10px] text-slate-400">{job.sourceType}</span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-600">
                    {formatDateTime(job.startTime)}
                  </td>

                  <td className="py-3.5 px-4 text-slate-700 font-medium">
                    {(job.durationMs / 1000).toFixed(1)}s
                  </td>

                  <td className="py-3.5 px-4 font-semibold">
                    <span className="text-[#147D64]">+{job.recordsCreated}</span>
                    <span className="text-slate-400 mx-1">/</span>
                    <span className="text-slate-700">~{job.recordsUpdated}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    {job.failedRows > 0 ? (
                      <span className="font-bold text-red-600">{job.failedRows}</span>
                    ) : (
                      <span className="text-slate-400">0</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        job.status === 'Success'
                          ? 'bg-emerald-50 text-emerald-800'
                          : job.status === 'Partial Success'
                          ? 'bg-amber-50 text-amber-800'
                          : 'bg-red-50 text-red-800'
                      }`}
                    >
                      <Check className="w-3 h-3 mr-1 text-[#147D64]" />
                      {job.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-600">
                    {job.initiatedBy}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleRetry(job)}
                      disabled={retryingId === job.id}
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] inline-flex items-center cursor-pointer disabled:opacity-50"
                    >
                      <RotateCcw className={`w-3 h-3 mr-1 ${retryingId === job.id ? 'animate-spin' : ''}`} />
                      {retryingId === job.id ? 'Retrying...' : 'Re-run'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
