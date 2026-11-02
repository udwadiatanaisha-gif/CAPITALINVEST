import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DataSource, DataSourceType } from '../../types';
import { formatDate } from '../../utils/formatters';
import {
  FileSpreadsheet,
  RefreshCw,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  ShieldCheck,
  Pause,
  Play,
  RotateCw,
  FolderUp,
  FileText,
  Upload
} from 'lucide-react';

export const DataHubView: React.FC<{ onLaunchImportWizard?: () => void }> = ({ onLaunchImportWizard }) => {
  const { dataSources, syncJobs, triggerSync, navigate } = useApp();

  const [syncingSourceId, setSyncingSourceId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [googleConnectModalOpen, setGoogleConnectModalOpen] = useState(false);

  const handleSync = async (sourceId: string) => {
    setSyncingSourceId(sourceId);
    setStatusMessage('');
    const res = await triggerSync(sourceId);
    setSyncingSourceId(null);
    setStatusMessage(res.message);
    setTimeout(() => setStatusMessage(''), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-[#C6A76A]">
            Financial Integrations
          </span>
          <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#101C2C] mt-0.5">
            Data Hub & Spreadsheet Connectors
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage live Google Sheets synchronization, Excel workbooks, and broker contract notes
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('sync-history')}
            className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 mr-1.5 text-slate-500 inline" />
            Sync History & Audit
          </button>

          <button
            onClick={() => navigate('spreadsheet-import')}
            className="px-4 py-2 bg-[#101C2C] hover:bg-[#172B46] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5 text-[#C6A76A]" />
            New Spreadsheet Import
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-[#147D64] flex-shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* 4 Core Data Connector Cards (Section 14 requirement) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Google Sheets Connector */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-[#147D64] flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#101C2C]">Google Sheets Live Sync</h3>
                  <span className="text-[10px] text-slate-400">Authenticated Google Workspace Integration</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-[#147D64] border border-emerald-200">
                Connected
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Live scheduled connector to Google Sheets master ledgers. Automatically reconciles holding positions, price updates, and dividend accruals.
            </p>

            <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Target Sheet:</span>
                <strong className="text-slate-800">CapitalVest HNW Portfolio Master Sheet</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Synchronized Records:</span>
                <strong className="text-slate-800">42 Assets</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Sync Frequency:</span>
                <strong className="text-[#147D64]">Every 60 Minutes (Automatic)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Last Synced:</span>
                <strong className="text-slate-800">Today 06:30 AM IST</strong>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              onClick={() => handleSync(dataSources[0]?.id || 'SRC-001')}
              disabled={syncingSourceId === (dataSources[0]?.id || 'SRC-001')}
              className="px-4 py-2 bg-[#147D64] hover:bg-[#116954] text-white font-semibold rounded-lg shadow-xs flex items-center cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${syncingSourceId ? 'animate-spin' : ''}`} />
              {syncingSourceId ? 'Syncing...' : 'Sync Now'}
            </button>

            <button
              onClick={() => navigate('sync-history')}
              className="text-[#101C2C] font-semibold hover:underline"
            >
              Review Conflicts & History
            </button>
          </div>
        </div>

        {/* Card 2: Excel (.xlsx) Snapshot Import */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-[#172B46] flex items-center justify-center">
                  <FolderUp className="w-5 h-5 text-[#172B46]" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#101C2C]">Excel Workbook (.xlsx)</h3>
                  <span className="text-[10px] text-slate-400">Offline Snapshot Import</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                Snapshot Configured
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Imports offline holding workbooks. Note: Subsequent changes to your offline file require re-upload via the guided mapping wizard.
            </p>

            <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Last Upload:</span>
                <strong className="text-slate-800">Mehta_Family_Trust_Holdings_Q3.xlsx</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Imported Positions:</span>
                <strong className="text-slate-800">16 Holdings Committed</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Validation Status:</span>
                <strong className="text-emerald-700">All 16 Valid</strong>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              onClick={() => navigate('spreadsheet-import')}
              className="px-4 py-2 bg-[#101C2C] hover:bg-[#172B46] text-white font-semibold rounded-lg shadow-xs flex items-center cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 mr-1.5 text-[#C6A76A]" />
              Upload New Snapshot
            </button>

            <button
              onClick={() => navigate('holdings')}
              className="text-[#101C2C] font-semibold hover:underline"
            >
              Inspect Holdings
            </button>
          </div>
        </div>

        {/* Card 3: CSV Trade Reconcile Connector */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-[#C6A76A]" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#101C2C]">CSV Broker Contract Notes</h3>
                  <span className="text-[10px] text-slate-400">Trade Reconcile Batch Import</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                Batch Configured
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Reconciles automated broker exports, contract notes, and CDSL/NSDL demat statement files.
            </p>

            <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Last Batch:</span>
                <strong className="text-slate-800">NSE_BSE_Contract_Notes_Oct2026.csv</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Processed Trades:</span>
                <strong className="text-slate-800">28 Trades Reconciled</strong>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              onClick={() => navigate('spreadsheet-import')}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg flex items-center cursor-pointer"
            >
              Reconcile CSV Batch
            </button>

            <button
              onClick={() => navigate('sync-history')}
              className="text-[#101C2C] font-semibold hover:underline"
            >
              View Batch Log
            </button>
          </div>
        </div>

        {/* Card 4: Manual Position Entry */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-[#147D64]" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#101C2C]">Direct Position Registration</h3>
                  <span className="text-[10px] text-slate-400">Manual Entry Form</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                Always Active
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Manually register off-market physical assets, private equity capital calls, sovereign gold bonds, or real estate deeds.
            </p>

            <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Total Manual Entries:</span>
                <strong className="text-slate-800">8 Physical / Unlisted Assets</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Valuation Method:</span>
                <strong className="text-[#C6A76A]">Appraisal Cost Basis</strong>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              onClick={() => navigate('holdings')}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg flex items-center cursor-pointer"
            >
              Add Single Position
            </button>

            <button
              onClick={() => navigate('holdings')}
              className="text-[#101C2C] font-semibold hover:underline"
            >
              Browse All Assets
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
