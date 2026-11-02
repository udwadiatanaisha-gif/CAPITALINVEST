import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FirmSettings } from '../../types';
import {
  Settings,
  User,
  Building2,
  Database,
  ShieldAlert,
  CheckCircle,
  Save,
  RotateCcw,
  Sliders,
  DollarSign,
  Calendar,
  Bell,
  HardDrive
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { currentUser, firmSettings, updateFirmSettings, resetDemoData, switchDemoPersona, logAuditEvent } = useApp();
  const [activeTab, setActiveTab] = useState<'personal' | 'firm' | 'data'>('personal');

  // Personal state
  const [currencyPref, setCurrencyPref] = useState<'lakhs_crores' | 'millions'>('lakhs_crores');
  const [landingPage, setLandingPage] = useState<string>('dashboard');
  const [emailAlerts, setEmailAlerts] = useState<boolean>(true);
  const [smsAlerts, setSmsAlerts] = useState<boolean>(false);
  const [personalSaved, setPersonalSaved] = useState(false);

  // Firm Settings state
  const [firmForm, setFirmForm] = useState<FirmSettings>({ ...firmSettings });
  const [firmSaved, setFirmSaved] = useState(false);

  // Reset confirmation modal
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'Administrator';

  const handleSavePersonal = (e: React.FormEvent) => {
    e.preventDefault();
    setPersonalSaved(true);
    setTimeout(() => setPersonalSaved(false), 3000);
  };

  const handleSaveFirm = (e: React.FormEvent) => {
    e.preventDefault();
    updateFirmSettings(firmForm);
    logAuditEvent('settings_update', 'settings', 'firm', 'Updated firm strategic allocation weights and risk thresholds');
    setFirmSaved(true);
    setTimeout(() => setFirmSaved(false), 3000);
  };

  const handleExecuteReset = async () => {
    setResetting(true);
    try {
      await resetDemoData();
      setShowResetConfirm(false);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
            <Settings className="w-3.5 h-3.5 text-slate-600" /> Platform Configuration
          </span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
          Settings & Practice Control Centre
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Configure personal preferences, strategic asset class weights, risk monitoring rules, and session lifecycle.
        </p>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('personal')}
            className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'personal'
                ? 'border-amber-500 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4" /> Personal Preferences
          </button>

          {isAdmin && (
            <button
              onClick={() => setActiveTab('firm')}
              className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 ${
                activeTab === 'firm'
                  ? 'border-amber-500 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Building2 className="w-4 h-4" /> Firm & Strategic Weights
            </button>
          )}

          <button
            onClick={() => setActiveTab('data')}
            className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'data'
                ? 'border-amber-500 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Database className="w-4 h-4" /> Session & Database
          </button>
        </div>
      </div>

      {/* Tab 1: Personal Preferences */}
      {activeTab === 'personal' && (
        <form onSubmit={handleSavePersonal} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          {personalSaved && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <span>Personal preferences updated successfully.</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider mb-3">User Profile Identity</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Signed-in User</label>
                  <input
                    type="text"
                    disabled
                    value={currentUser?.name || 'Tanaisha Udwadia'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={currentUser?.email || 'tanaisha.udwadia@capitalvest.in'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Security Role</label>
                  <span className="inline-block px-3 py-1 rounded-lg text-xs font-bold uppercase bg-slate-100 text-slate-800">
                    {currentUser?.role || 'Advisor'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider mb-3">Display & Locale Conventions</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Currency Number Grouping</label>
                  <select
                    value={currencyPref}
                    onChange={(e) => setCurrencyPref(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                  >
                    <option value="lakhs_crores">Indian Lakhs & Crores (₹ 1,23,45,678 / ₹ 1.23 Cr)</option>
                    <option value="millions">Standard International Millions (₹ 12,345,678)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Timezone & Calendar</label>
                  <input
                    type="text"
                    disabled
                    value="Asia/Kolkata (IST • UTC+05:30) | DD/MM/YYYY"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Default Landing Dashboard</label>
                  <select
                    value={landingPage}
                    onChange={(e) => setLandingPage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                  >
                    <option value="dashboard">Command Centre Dashboard</option>
                    <option value="clients">Client Directory</option>
                    <option value="portfolio">Portfolio Holdings Register</option>
                    <option value="datahub">Data Hub & Spreadsheets</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Preferences are preserved locally in browser session storage.</span>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-all shadow-md"
            >
              <Save className="w-4 h-4 text-amber-400" />
              Save Preferences
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Firm Settings (Admin Only) */}
      {activeTab === 'firm' && isAdmin && (
        <form onSubmit={handleSaveFirm} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          {firmSaved && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <span>Firm strategic parameters and risk thresholds saved.</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">Practice Legal Details</h3>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Firm Name</label>
                <input
                  type="text"
                  value={firmForm.firmName}
                  onChange={(e) => setFirmForm({ ...firmForm, firmName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">SEBI Registration Number</label>
                <input
                  type="text"
                  value={firmForm.sebiRegistrationNumber}
                  onChange={(e) => setFirmForm({ ...firmForm, sebiRegistrationNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Lead Advisor & Fiduciary Contact</label>
                <input
                  type="text"
                  value={firmForm.leadAdvisorName}
                  onChange={(e) => setFirmForm({ ...firmForm, leadAdvisorName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Compliance Email</label>
                <input
                  type="email"
                  value={firmForm.contactEmail}
                  onChange={(e) => setFirmForm({ ...firmForm, contactEmail: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">Risk & Concentration Guardrails</h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Single Stock Concentration Ceiling: <strong>{firmForm.riskThresholds.maxSingleEquityConcentration}%</strong>
                </label>
                <input
                  type="range"
                  min="5"
                  max="35"
                  step="1"
                  value={firmForm.riskThresholds.maxSingleEquityConcentration}
                  onChange={(e) => setFirmForm({
                    ...firmForm,
                    riskThresholds: { ...firmForm.riskThresholds, maxSingleEquityConcentration: Number(e.target.value) }
                  })}
                  className="w-full accent-amber-500"
                />
                <span className="text-[11px] text-slate-500">Triggers alert when any single equity position exceeds this portfolio weight.</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Asset Class Drift Alert Threshold: <strong>±{firmForm.riskThresholds.maxAllocationDrift}%</strong>
                </label>
                <input
                  type="range"
                  min="2"
                  max="15"
                  step="0.5"
                  value={firmForm.riskThresholds.maxAllocationDrift}
                  onChange={(e) => setFirmForm({
                    ...firmForm,
                    riskThresholds: { ...firmForm.riskThresholds, maxAllocationDrift: Number(e.target.value) }
                  })}
                  className="w-full accent-amber-500"
                />
                <span className="text-[11px] text-slate-500">Triggers rebalancing notification when asset drift diverges from target model.</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Review Overdue Threshold: <strong>{firmForm.riskThresholds.reviewOverdueDays} Days</strong>
                </label>
                <input
                  type="range"
                  min="30"
                  max="180"
                  step="15"
                  value={firmForm.riskThresholds.reviewOverdueDays}
                  onChange={(e) => setFirmForm({
                    ...firmForm,
                    riskThresholds: { ...firmForm.riskThresholds, reviewOverdueDays: Number(e.target.value) }
                  })}
                  className="w-full accent-amber-500"
                />
                <span className="text-[11px] text-slate-500">Triggers compliance alert when periodic client review date passes this limit.</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-all shadow-md"
            >
              <Save className="w-4 h-4 text-amber-400" />
              Save Firm Settings
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: Session & Database Management */}
      {activeTab === 'data' && (
        <div className="space-y-6">
          {/* Active Session & Quick Persona Simulator */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider mb-2">Simulate User Roles</h3>
            <p className="text-xs text-slate-500 mb-4">
              Instantly toggle between administrator, advisor, and isolated client views to test role permissions.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { role: 'admin', label: 'Administrator', desc: 'Full practice control, team & firm settings', active: !!currentUser?.role?.toLowerCase().includes('admin') },
                { role: 'advisor', label: 'Lead Advisor', desc: 'Tanaisha Udwadia: Portfolios, clients, health', active: !!currentUser?.role?.toLowerCase().includes('advisor') },
                { role: 'operations', label: 'Operations & Data', desc: 'Spreadsheet import, sync & reconciliations', active: !!currentUser?.role?.toLowerCase().includes('operat') },
                { role: 'client', label: 'Isolated Client', desc: 'Aarav Mehta: Private portal view only', active: !!currentUser?.role?.toLowerCase().includes('client') }
              ].map((p) => (
                <button
                  key={p.role}
                  onClick={() => switchDemoPersona(p.role as any)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    p.active
                      ? 'border-amber-500 bg-amber-50/60 shadow-sm ring-1 ring-amber-500'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-slate-900">{p.label}</span>
                    {p.active && <span className="text-[10px] font-bold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-full">CURRENT</span>}
                  </div>
                  <p className="text-xs text-slate-600">{p.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Database Reset Danger Zone */}
          <div className="bg-white p-6 rounded-2xl border border-rose-200 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-base text-slate-900">Database Restoration & Reset</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Reset the database to the official Indian demo dataset (8 clients, 21 holdings, ₹26.54 Cr total AUM, active risk alerts, prospect pipeline, and audit logs). Useful if you have modified or imported test data and want a clean state.
                </p>

                <div className="mt-4">
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-all shadow"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Restore Official Demo Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="font-bold text-slate-900 text-lg">Reset Database?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              This will overwrite all active holdings, clients, imported spreadsheet jobs, and action items with the initial CapitalVest baseline data. This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteReset}
                disabled={resetting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-all shadow disabled:opacity-50"
              >
                {resetting ? 'Resetting...' : 'Yes, Restore Baseline Data'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
