import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RiskAlert, AlertStatus, AlertSeverity } from '../../types';
import { formatDate } from '../../utils/formatters';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  User,
  Sliders,
  Check,
  X,
  Filter,
  ArrowRight
} from 'lucide-react';

export const RiskMonitoringView: React.FC = () => {
  const { riskAlerts, updateAlert, firmSettings, updateSettings, navigate } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [resolvingAlertId, setResolvingAlertId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [thresholdsModalOpen, setThresholdsModalOpen] = useState(false);

  // Configurable thresholds local state
  const [thresholds, setThresholds] = useState({
    maxConcentration: firmSettings.riskThresholds.maxSingleAssetConcentration || 25,
    maxDrift: firmSettings.riskThresholds.maxAllocationDrift || 10,
    reviewDays: firmSettings.riskThresholds.reviewOverdueDays || 90
  });

  const filteredAlerts = riskAlerts.filter(a => {
    if (statusFilter !== 'All' && a.status !== statusFilter) return false;
    if (severityFilter !== 'All' && a.severity !== severityFilter) return false;
    return true;
  });

  const openCount = riskAlerts.filter(a => a.status === 'Open').length;
  const criticalCount = riskAlerts.filter(a => a.severity === 'Critical' && a.status === 'Open').length;

  const handleResolve = async (id: string) => {
    await updateAlert(id, {
      status: 'Resolved',
      resolvedAt: new Date().toISOString(),
      resolutionNotes: resolutionNotes || 'Resolved during routine portfolio governance audit.'
    });
    setResolvingAlertId(null);
    setResolutionNotes('');
  };

  const handleSaveThresholds = async () => {
    await updateSettings({
      riskThresholds: {
        ...firmSettings.riskThresholds,
        maxSingleAssetConcentration: thresholds.maxConcentration,
        maxAllocationDrift: thresholds.maxDrift,
        reviewOverdueDays: thresholds.reviewDays
      }
    });
    setThresholdsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-[#C94C4C]">
            Governance & Compliance
          </span>
          <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#101C2C] mt-0.5">
            Risk Monitoring & Alert Centre
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Deterministic risk detection across holding concentrations, allocation drift, and review deadlines
          </p>
        </div>

        <button
          onClick={() => setThresholdsModalOpen(true)}
          className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors flex items-center cursor-pointer"
        >
          <Sliders className="w-3.5 h-3.5 mr-1.5 text-[#C6A76A]" />
          Configure Risk Thresholds
        </button>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500">Total Open Risk Alerts</span>
          <div className="text-2xl font-bold text-[#C94C4C] mt-1">{openCount}</div>
          <span className="text-[11px] text-slate-400">Deterministic triggers</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500">Critical Priority Alerts</span>
          <div className="text-2xl font-bold text-red-700 mt-1">{criticalCount}</div>
          <span className="text-[11px] text-red-500 font-semibold">Immediate attention</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500">Max Asset Concentration Guard</span>
          <div className="text-2xl font-bold text-[#101C2C] mt-1">
            {firmSettings.riskThresholds.maxSingleAssetConcentration}%
          </div>
          <span className="text-[11px] text-[#C6A76A]">Current system threshold</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500">Max Allocation Drift Limit</span>
          <div className="text-2xl font-bold text-[#101C2C] mt-1">
            ±{firmSettings.riskThresholds.maxAllocationDrift}%
          </div>
          <span className="text-[11px] text-slate-400">Rebalance trigger</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3 text-xs font-semibold">
        <div className="flex space-x-3">
          {['All', 'Open', 'In Progress', 'Resolved', 'Dismissed'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`pb-1 transition-colors cursor-pointer ${
                statusFilter === st ? 'border-b-2 border-[#101C2C] text-[#101C2C]' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {st} ({st === 'All' ? riskAlerts.length : riskAlerts.filter(a => a.status === st).length})
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-slate-500 font-medium">Severity:</span>
          <select
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
            className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white"
          >
            <option value="All">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Alerts Stream */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-5 rounded-2xl border transition-all ${
              alert.status === 'Resolved'
                ? 'bg-slate-50 border-slate-200 opacity-75'
                : alert.severity === 'Critical'
                ? 'bg-red-50/50 border-red-200 shadow-xs'
                : alert.severity === 'High'
                ? 'bg-amber-50/40 border-amber-200 shadow-xs'
                : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-slate-400 text-[10px]">{alert.id}</span>
                  <span className="font-bold text-xs text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {alert.category}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      alert.severity === 'Critical'
                        ? 'bg-red-600 text-white'
                        : alert.severity === 'High'
                        ? 'bg-amber-600 text-white'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    {alert.severity}
                  </span>
                  <span className="text-xs text-slate-500">
                    Client: <strong className="text-slate-800">{alert.clientName || 'General Portfolio'}</strong>
                  </span>
                </div>

                <p className="text-sm font-semibold text-[#101C2C] leading-snug">
                  {alert.reason}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white/70 p-3 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Detected Metric Value</span>
                    <strong className="text-slate-900">{alert.currentValueDescription}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Configured Governance Limit</span>
                    <strong className="text-slate-800">{alert.thresholdDescription}</strong>
                  </div>
                </div>

                <div className="text-xs text-slate-700 bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100 flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#147D64] flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#147D64]">Suggested Administrative Action:</strong> {alert.suggestedAction}
                  </div>
                </div>

                {alert.resolutionNotes && (
                  <div className="text-xs text-slate-600 p-2 rounded bg-slate-100 border border-slate-200">
                    <span className="font-bold">Resolution Documented:</span> {alert.resolutionNotes} ({formatDate(alert.resolvedAt)})
                  </div>
                )}
              </div>

              {/* Status Action Buttons */}
              <div className="flex flex-col sm:flex-row md:flex-col gap-2 min-w-[140px]">
                {alert.status !== 'Resolved' && (
                  <>
                    <button
                      onClick={() => setResolvingAlertId(alert.id)}
                      className="px-3 py-1.5 bg-[#147D64] hover:bg-[#116954] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer text-center"
                    >
                      Resolve Alert
                    </button>

                    <button
                      onClick={() => updateAlert(alert.id, { status: alert.status === 'In Progress' ? 'Open' : 'In Progress' })}
                      className="px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold cursor-pointer text-center"
                    >
                      {alert.status === 'In Progress' ? 'Mark Open' : 'Mark In Progress'}
                    </button>

                    <button
                      onClick={() => updateAlert(alert.id, { status: 'Dismissed' })}
                      className="px-3 py-1.5 text-slate-400 hover:text-slate-600 text-xs font-semibold cursor-pointer text-center"
                    >
                      Dismiss
                    </button>
                  </>
                )}

                {alert.status === 'Resolved' && (
                  <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold text-center">
                    Resolved
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredAlerts.length === 0 && (
          <div className="py-12 bg-white rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
            No risk alerts matching the active filters.
          </div>
        )}
      </div>

      {/* Resolve Modal */}
      {resolvingAlertId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-serif-display text-xl font-bold text-[#101C2C]">Document Alert Resolution</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Record administrative actions taken to mitigate this risk.
            </p>
            <textarea
              rows={3}
              value={resolutionNotes}
              onChange={e => setResolutionNotes(e.target.value)}
              placeholder="e.g. Conducted portfolio rebalancing meeting with Aarav Mehta; trimmed 500 shares of Reliance to reallocate into debt fund."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#C6A76A]"
            />
            <div className="flex justify-end space-x-2 mt-4 text-xs font-semibold">
              <button
                onClick={() => setResolvingAlertId(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleResolve(resolvingAlertId)}
                className="px-5 py-2 bg-[#147D64] hover:bg-[#116954] text-white rounded-lg cursor-pointer"
              >
                Confirm Resolution
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Thresholds Configuration Modal */}
      {thresholdsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-serif-display text-xl font-bold text-[#101C2C]">Configure Risk Thresholds</h3>
              <button onClick={() => setThresholdsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Single Asset Concentration Limit (%)
                </label>
                <input
                  type="number"
                  value={thresholds.maxConcentration}
                  onChange={e => setThresholds({ ...thresholds, maxConcentration: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
                <span className="text-[10px] text-slate-400">Triggers alert when holding exceeds this percentage of portfolio.</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Maximum Asset Allocation Drift (%)
                </label>
                <input
                  type="number"
                  value={thresholds.maxDrift}
                  onChange={e => setThresholds({ ...thresholds, maxDrift: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
                <span className="text-[10px] text-slate-400">Triggers rebalance alert when actual allocation deviates from target.</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Review Overdue Threshold (Days)
                </label>
                <input
                  type="number"
                  value={thresholds.reviewDays}
                  onChange={e => setThresholds({ ...thresholds, reviewDays: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2 text-xs font-semibold">
              <button
                onClick={() => setThresholdsModalOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveThresholds}
                className="px-5 py-2 bg-[#101C2C] hover:bg-[#172B46] text-white rounded-lg"
              >
                Save Thresholds
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
