import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Shield, Lock, FileText, AlertTriangle, Eye, Server, Check } from 'lucide-react';

export const LegalPages: React.FC = () => {
  const { selectedClientId, navigate } = useApp();
  // Support tab switching between the 6 trust pages
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'data' | 'security' | 'disclaimers' | 'cookies'>(
    (selectedClientId as any) || 'privacy'
  );

  return (
    <div className="bg-[#F7F5F0] min-h-screen text-[#101C2C]">
      {/* Header */}
      <div className="bg-[#101C2C] text-white py-16 border-b border-[#172B46]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#C6A76A]">Governance & Compliance</span>
          <h1 className="font-serif-display text-3xl sm:text-4xl font-bold mt-2">
            Trust, Security & Legal Policies
          </h1>
          <p className="mt-2 text-xs text-slate-300">
            DRAFT POLICIES — SUBJECT TO FORMAL REGULATORY & LEGAL REVIEW BEFORE PRODUCTION DEPLOYMENT
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Notice Badge */}
        <div className="mb-8 p-4 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">Important Notice:</span> The policies published here are provided as draft demonstration documentation for CapitalVest. They do not constitute legal advice or formal regulatory filings. In a production deployment, all documents must be reviewed and certified by registered legal counsel under the Indian Information Technology Act and SEBI regulations.
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-slate-300 pb-3">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'privacy' ? 'bg-[#101C2C] text-white' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Privacy Policy
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'terms' ? 'bg-[#101C2C] text-white' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Terms of Use
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'data' ? 'bg-[#101C2C] text-white' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Data Handling Policy
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'security' ? 'bg-[#101C2C] text-white' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Security Overview
          </button>
          <button
            onClick={() => setActiveTab('disclaimers')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'disclaimers' ? 'bg-[#101C2C] text-white' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Regulatory Disclaimers
          </button>
          <button
            onClick={() => setActiveTab('cookies')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'cookies' ? 'bg-[#101C2C] text-white' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Cookie Preferences
          </button>
        </div>

        {/* Content Box */}
        <div className="bg-white rounded-xl border border-slate-200 p-8 sm:p-10 shadow-sm text-sm text-slate-700 space-y-6 leading-relaxed">
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <h2 className="font-serif-display text-2xl font-bold text-[#101C2C]">CapitalVest Privacy Policy</h2>
              <p className="text-xs text-slate-500">Last Revised: 02 November 2026 | Draft Document</p>
              <h3 className="font-bold text-slate-900 pt-2">1. Scope and Collection</h3>
              <p>
                CapitalVest collects client personal identifiers, financial objectives, and asset holding records solely for providing portfolio monitoring, goal planning, and advisor collaboration. We strictly adhere to the Digital Personal Data Protection Act (DPDP Act) framework.
              </p>
              <h3 className="font-bold text-slate-900 pt-2">2. Usage of Client Information</h3>
              <p>
                Data entered into CapitalVest is accessible only by authorized financial advisors assigned to your account and technical operations personnel managing database integrity. We do not sell, rent, or trade client information to advertisers or external brokerages.
              </p>
              <h3 className="font-bold text-slate-900 pt-2">3. Client Rights</h3>
              <p>
                You retain the right to inspect, correct, export, or request the archival of your personal records at any time by contacting your assigned wealth advisor or submitting an inquiry via our settings portal.
              </p>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-4">
              <h2 className="font-serif-display text-2xl font-bold text-[#101C2C]">Terms of Use</h2>
              <p className="text-xs text-slate-500">Last Revised: 02 November 2026 | Draft Document</p>
              <h3 className="font-bold text-slate-900 pt-2">1. Service Nature</h3>
              <p>
                CapitalVest is a software command centre designed for wealth tracking, financial planning modeling, and document management. Use of this application does not create a fiduciary broker-dealer relationship or guarantee financial outcomes.
              </p>
              <h3 className="font-bold text-slate-900 pt-2">2. User Account Security</h3>
              <p>
                Users are responsible for safeguarding login credentials and session tokens. Sharing passwords or attempting unauthorized privilege escalation between client and administrator roles is strictly prohibited and logged.
              </p>
              <h3 className="font-bold text-slate-900 pt-2">3. Market Data & Projections</h3>
              <p>
                Asset pricing and valuations are provided for illustrative and organizational purposes. Calculations assume standard mathematical compound interest and do not reflect sudden systemic market disruptions or illiquidity.
              </p>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-4">
              <h2 className="font-serif-display text-2xl font-bold text-[#101C2C]">Data Handling Policy</h2>
              <p className="text-xs text-slate-500">Last Revised: 02 November 2026 | Draft Document</p>
              <h3 className="font-bold text-slate-900 pt-2">1. Spreadsheet & File Synchronization</h3>
              <p>
                Files uploaded to the Data Hub (Excel .xlsx and CSV files) are parsed into temporary memory, validated for schema consistency, and committed to the database only after user verification. Local spreadsheet edits do not automatically alter the database without re-upload.
              </p>
              <h3 className="font-bold text-slate-900 pt-2">2. Data Retention & Backups</h3>
              <p>
                All client holding records, financial goal updates, and generated reports maintain an immutable audit trail. Deleted or archived records are marked inactive rather than permanently destroyed to preserve audit history.
              </p>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4">
              <h2 className="font-serif-display text-2xl font-bold text-[#101C2C]">Security Architecture Overview</h2>
              <p className="text-xs text-slate-500">Last Revised: 02 November 2026 | Technical Brief</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <Lock className="w-5 h-5 text-[#147D64] mb-2" />
                  <h4 className="font-bold text-slate-900 text-xs">Role-Based Access Control</h4>
                  <p className="text-[11px] text-slate-600 mt-1">Five distinct permission tiers prevent cross-client enumeration and unauthorized privilege escalation.</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <Server className="w-5 h-5 text-[#C6A76A] mb-2" />
                  <h4 className="font-bold text-slate-900 text-xs">Server-Side Authorization</h4>
                  <p className="text-[11px] text-slate-600 mt-1">Record access is enforced server-side. Client-side URL manipulation cannot expose private records.</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <Shield className="w-5 h-5 text-[#172B46] mb-2" />
                  <h4 className="font-bold text-slate-900 text-xs">Auditable Event Stream</h4>
                  <p className="text-[11px] text-slate-600 mt-1">All mutations, logins, file imports, and report downloads generate immutable audit entries.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'disclaimers' && (
            <div className="space-y-4">
              <h2 className="font-serif-display text-2xl font-bold text-[#101C2C]">Regulatory Disclaimers</h2>
              <p className="text-xs text-slate-500">Applicable Jurisdiction: Republic of India</p>
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-xs text-red-900 leading-relaxed space-y-2">
                <p>
                  <strong>Mutual Funds and Securities Disclaimer:</strong> Investments in securities and mutual funds are subject to market risks. Read all scheme-related documents carefully before investing. Past performance is not indicative of future returns.
                </p>
                <p>
                  <strong>Illustrative Demo Data:</strong> All client names, asset balances, and portfolio metrics displayed in this demo application (including Aarav Mehta, Ananya Shah, Dr. Rohan Desai) are entirely fictional and illustrative. No actual investor funds are held, managed, or transacted within this preview environment.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'cookies' && (
            <div className="space-y-4">
              <h2 className="font-serif-display text-2xl font-bold text-[#101C2C]">Cookie and Session Preferences</h2>
              <p className="text-xs text-slate-500">Session Management</p>
              <p>
                CapitalVest utilizes strictly necessary session cookies and local storage tokens to preserve user login state, security tokens, and user display preferences (such as light/dark mode and table column filters). We do not deploy third-party advertising cookies.
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center text-xs font-semibold text-[#147D64]">
                  <Check className="w-4 h-4 mr-1 text-[#147D64]" /> Essential Session Storage Active
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
