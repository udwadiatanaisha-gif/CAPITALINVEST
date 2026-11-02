import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, UserRole } from '../../types';
import { formatDate } from '../../utils/formatters';
import {
  Users,
  Shield,
  UserPlus,
  Mail,
  CheckCircle,
  XCircle,
  Key,
  Lock,
  ArrowRightCircle,
  ShieldAlert,
  UserCheck
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
  status: 'active' | 'invited' | 'inactive';
  lastActive: string;
}

const INITIAL_TEAM: TeamMember[] = [
  {
    id: 'u_1',
    name: 'Prateek Sharma',
    email: 'prateek.sharma@capitalvest.in',
    role: 'admin',
    title: 'Managing Partner & Chief Operating Officer',
    status: 'active',
    lastActive: '2026-11-02T20:15:00Z'
  },
  {
    id: 'u_2',
    name: 'Tanaisha Udwadia',
    email: 'tanaisha.udwadia@capitalvest.in',
    role: 'advisor',
    title: 'Principal Wealth Advisor & CFP®',
    status: 'active',
    lastActive: '2026-11-02T21:28:00Z'
  },
  {
    id: 'u_3',
    name: 'Devansh Singhania',
    email: 'devansh.singhania@capitalvest.in',
    role: 'operations',
    title: 'Senior Portfolio Operations & Data Lead',
    status: 'active',
    lastActive: '2026-11-02T19:40:00Z'
  },
  {
    id: 'u_4',
    name: 'Karan Mehra',
    email: 'karan.mehra@capitalvest.in',
    role: 'reviewer',
    title: 'Compliance Officer & Fiduciary Auditor',
    status: 'active',
    lastActive: '2026-11-01T14:10:00Z'
  }
];

const PERMISSIONS = [
  { id: 'view_portfolios', label: 'View All Client Portfolios & Holdings', roles: ['admin', 'advisor', 'operations', 'reviewer'] },
  { id: 'edit_holdings', label: 'Create / Modify Holdings & Cost Basis', roles: ['admin', 'advisor', 'operations'] },
  { id: 'spreadsheet_sync', label: 'Run Spreadsheet & Google Sheets Sync', roles: ['admin', 'advisor', 'operations'] },
  { id: 'manage_clients', label: 'Add / Archive Client Dossiers & Prospects', roles: ['admin', 'advisor'] },
  { id: 'schedule_meetings', label: 'Schedule Reviews & Issue Advisory Reports', roles: ['admin', 'advisor'] },
  { id: 'resolve_risks', label: 'Acknowledge & Resolve Risk Alerts', roles: ['admin', 'advisor'] },
  { id: 'firm_settings', label: 'Configure Firm Thresholds & Asset Weights', roles: ['admin'] },
  { id: 'manage_team', label: 'Invite / Deactivate Staff & Assign Roles', roles: ['admin'] }
];

export const TeamManagement: React.FC = () => {
  const { currentUser, switchDemoPersona, logAuditEvent } = useApp();
  const [team, setTeam] = useState<TeamMember[]>(INITIAL_TEAM);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  // Invite form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('advisor');
  const [title, setTitle] = useState('');
  const [inviteSuccessMsg, setInviteSuccessMsg] = useState<string | null>(null);

  const isAdmin = !!currentUser?.role?.toLowerCase().includes('admin');

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const newMember: TeamMember = {
      id: `u_${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      role,
      title: title.trim() || 'Wealth Management Associate',
      status: 'active',
      lastActive: new Date().toISOString()
    };

    setTeam([...team, newMember]);
    logAuditEvent('user_role_change', 'user', newMember.id, `Invited new team member ${newMember.name} as ${role}`);
    setInviteSuccessMsg(`Invitation dispatched to ${email}. Active credentials generated.`);
    setIsInviteOpen(false);
    setName('');
    setEmail('');
    setTitle('');
  };

  const getRoleBadge = (r: UserRole) => {
    switch (r) {
      case 'admin':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">Administrator</span>;
      case 'advisor':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">Lead Advisor</span>;
      case 'operations':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">Operations</span>;
      case 'reviewer':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">Read-Only Reviewer</span>;
      case 'client':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Client Portal</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200">
              <Shield className="w-3.5 h-3.5" /> Practice Governance
            </span>
            <span className="text-xs text-slate-400">Role-Based Access Control (RBAC)</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
            Advisory Team & Privilege Management
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Manage practice personnel, assign fiduciary permissions, and inspect access privilege matrices.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsInviteOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-all shadow-md hover:shadow-lg"
          >
            <UserPlus className="w-4 h-4 text-amber-400" />
            Invite Staff Member
          </button>
        )}
      </div>

      {inviteSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{inviteSuccessMsg}</span>
          </div>
          <button onClick={() => setInviteSuccessMsg(null)} className="text-xs font-bold text-emerald-700">Dismiss</button>
        </div>
      )}

      {/* Team Roster Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900">Active Advisory Staff ({team.length})</h3>
          <span className="text-xs text-slate-500">SEBI Registered RIA Personnel</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs uppercase font-semibold">
                <th className="py-3.5 px-6">Name & Title</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Assigned Role</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Last Active</th>
                <th className="py-3.5 px-6 text-right">Quick Switch</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {team.map((member) => {
                const isCurrent = currentUser?.email === member.email;
                return (
                  <tr key={member.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-900 text-amber-400 font-bold flex items-center justify-center text-sm">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-2">
                            {member.name}
                            {isCurrent && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900">
                                YOU
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500">{member.title}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-xs font-mono text-slate-600">
                      {member.email}
                    </td>
                    <td className="py-4 px-4">
                      {getRoleBadge(member.role)}
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-500">
                      {formatDate(member.lastActive)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {!isCurrent && (
                        <button
                          onClick={() => switchDemoPersona(member.role)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-medium transition-colors"
                        >
                          <ArrowRightCircle className="w-3.5 h-3.5 text-amber-500" />
                          Simulate
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permissions Matrix */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-base text-slate-900 mb-2">Role Permissions Matrix</h3>
        <p className="text-xs text-slate-500 mb-5">
          Explicit system capabilities mapped to authorized operational roles. Enforced strictly at the API and UI layers.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-y border-slate-200 text-slate-700 font-semibold uppercase">
                <th className="py-3 px-4">Operational Capability</th>
                <th className="py-3 px-3 text-center">Administrator</th>
                <th className="py-3 px-3 text-center">Lead Advisor</th>
                <th className="py-3 px-3 text-center">Operations</th>
                <th className="py-3 px-3 text-center">Reviewer</th>
                <th className="py-3 px-3 text-center">Client</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {PERMISSIONS.map((perm) => (
                <tr key={perm.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-medium text-slate-800">{perm.label}</td>
                  {(['admin', 'advisor', 'operations', 'reviewer', 'client'] as UserRole[]).map((r) => {
                    const hasAccess = perm.roles.includes(r);
                    return (
                      <td key={r} className="py-3 px-3 text-center">
                        {hasAccess ? (
                          <CheckCircle className="w-4 h-4 text-emerald-600 mx-auto" />
                        ) : (
                          <XCircle className="w-4 h-4 text-slate-300 mx-auto" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-slate-900 text-lg">Invite Fiduciary Staff</h3>
              </div>
              <button onClick={() => setIsInviteOpen(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
            </div>

            <form onSubmit={handleInviteSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Radhika Singhal"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. radhika.singhal@capitalvest.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Staff Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 bg-white"
                  >
                    <option value="advisor">Lead Advisor</option>
                    <option value="operations">Operations & Data Lead</option>
                    <option value="reviewer">Compliance Reviewer</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Job Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Wealth Specialist"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-all shadow-md"
                >
                  Send Access Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
