import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Prospect, ProspectStage } from '../../types';
import { formatINR, formatDate } from '../../utils/formatters';
import {
  UserPlus,
  Kanban,
  Table as TableIcon,
  Plus,
  Search,
  ArrowRight,
  TrendingUp,
  X,
  Phone,
  Mail,
  Edit,
  CheckCircle2
} from 'lucide-react';

export const ProspectPipeline: React.FC<{ onAddProspect?: () => void }> = ({ onAddProspect }) => {
  const { prospects, addProspect, updateProspect, users } = useApp();

  const [viewMode, setViewMode] = useState<'board' | 'table'>('board');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [prospectToEdit, setProspectToEdit] = useState<Prospect | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: 'Mumbai',
    stage: 'New Lead' as ProspectStage,
    estimatedAUM: 50000000,
    source: 'Referral' as Prospect['source'],
    assignedAdvisor: 'Tanaisha Udwadia',
    nextFollowUpDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    notes: ''
  });

  const stages: ProspectStage[] = [
    'New Lead',
    'Contacted',
    'Meeting Scheduled',
    'Proposal or Review',
    'Onboarding',
    'Converted',
    'Closed or Lost'
  ];

  const filteredProspects = useMemo(() => {
    return prospects.filter(p => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.city.toLowerCase().includes(q) || p.notes.toLowerCase().includes(q);
    });
  }, [prospects, search]);

  // Real conversion counts and metrics
  const totalPipelineAUM = prospects.reduce((sum, p) => sum + (p.stage !== 'Closed or Lost' ? p.estimatedAUM : 0), 0);
  const convertedCount = prospects.filter(p => p.stage === 'Converted').length;
  const activeCount = prospects.filter(p => p.stage !== 'Closed or Lost' && p.stage !== 'Converted').length;
  const conversionRate = prospects.length > 0 ? ((convertedCount / prospects.length) * 100).toFixed(1) : '0';

  const handleStageChange = async (prospectId: string, newStage: ProspectStage) => {
    await updateProspect(prospectId, { stage: newStage });
  };

  const handleSaveProspect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (prospectToEdit) {
      await updateProspect(prospectToEdit.id, formData);
    } else {
      await addProspect(formData);
    }
    setIsModalOpen(false);
    setProspectToEdit(null);
  };

  const openEdit = (p: Prospect) => {
    setProspectToEdit(p);
    setFormData({
      name: p.name,
      email: p.email,
      phone: p.phone,
      city: p.city,
      stage: p.stage,
      estimatedAUM: p.estimatedAUM,
      source: p.source,
      assignedAdvisor: p.assignedAdvisor,
      nextFollowUpDate: p.nextFollowUpDate,
      notes: p.notes
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-[#C6A76A]">
            Client Engagement CRM
          </span>
          <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#101C2C] mt-0.5">
            Prospect Pipeline
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tracking prospective high-net-worth accounts from initial outreach through onboarding
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('board')}
              className={`p-1.5 rounded text-xs font-semibold flex items-center transition-colors cursor-pointer ${
                viewMode === 'board' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Kanban Board View"
            >
              <Kanban className="w-4 h-4 mr-1" />
              Board
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded text-xs font-semibold flex items-center transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4 mr-1" />
              Table
            </button>
          </div>

          <button
            onClick={() => {
              setProspectToEdit(null);
              setFormData({
                name: '',
                email: '',
                phone: '',
                city: 'Mumbai',
                stage: 'New Lead',
                estimatedAUM: 50000000,
                source: 'Referral',
                assignedAdvisor: 'Tanaisha Udwadia',
                nextFollowUpDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
                notes: ''
              });
              setIsModalOpen(true);
            }}
            className="inline-flex items-center px-4 py-2 bg-[#101C2C] hover:bg-[#172B46] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5 text-[#C6A76A]" />
            New Prospect
          </button>
        </div>
      </div>

      {/* Pipeline Analytics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500">Pipeline Estimated AUM</span>
          <div className="text-xl font-bold text-[#101C2C] mt-1">{formatINR(totalPipelineAUM, true)}</div>
          <span className="text-[11px] text-slate-400">Weighted potential</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500">Active Opportunities</span>
          <div className="text-xl font-bold text-[#101C2C] mt-1">{activeCount}</div>
          <span className="text-[11px] text-slate-400">In negotiation/proposal</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500">Converted Clients</span>
          <div className="text-xl font-bold text-[#147D64] mt-1">{convertedCount}</div>
          <span className="text-[11px] text-emerald-700 font-semibold">Fully onboarded</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500">Conversion Rate</span>
          <div className="text-xl font-bold text-[#C6A76A] mt-1">{conversionRate}%</div>
          <span className="text-[11px] text-slate-400">Actual historical ratio</span>
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === 'board' ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map((stage) => {
            const stageProspects = filteredProspects.filter(p => p.stage === stage);
            const stageVal = stageProspects.reduce((sum, p) => sum + p.estimatedAUM, 0);

            return (
              <div
                key={stage}
                className="w-72 flex-shrink-0 bg-slate-100/70 rounded-xl p-3 border border-slate-200 flex flex-col max-h-[75vh]"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-3">
                  <div>
                    <h4 className="font-bold text-xs text-slate-800">{stage}</h4>
                    <span className="text-[10px] text-slate-500">{formatINR(stageVal, true)}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-slate-700 border border-slate-200">
                    {stageProspects.length}
                  </span>
                </div>

                <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                  {stageProspects.map((p) => (
                    <div
                      key={p.id}
                      className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs hover:border-[#C6A76A] transition-all space-y-2 text-xs"
                    >
                      <div className="flex items-start justify-between">
                        <span className="font-bold text-slate-900 leading-snug">{p.name}</span>
                        <button
                          onClick={() => openEdit(p)}
                          className="text-slate-400 hover:text-slate-700 p-1 rounded"
                          title="Edit Prospect"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-[#147D64] font-bold">
                        {formatINR(p.estimatedAUM, true)} Est. AUM
                      </div>

                      <div className="text-slate-500 text-[11px] flex items-center justify-between">
                        <span>{p.city}</span>
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[9px] font-medium">{p.source}</span>
                      </div>

                      {p.notes && (
                        <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded line-clamp-2 italic">
                          "{p.notes}"
                        </p>
                      )}

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                        <span>Follow-up: {formatDate(p.nextFollowUpDate)}</span>
                        {/* Quick stage advance */}
                        {stage !== 'Converted' && stage !== 'Closed or Lost' && (
                          <button
                            onClick={() => {
                              const nextIdx = stages.indexOf(stage) + 1;
                              if (nextIdx < stages.length) {
                                handleStageChange(p.id, stages[nextIdx]);
                              }
                            }}
                            className="font-bold text-[#147D64] hover:underline flex items-center"
                          >
                            Advance <ArrowRight className="w-3 h-3 ml-0.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {stageProspects.length === 0 && (
                    <div className="py-8 text-center text-slate-400 text-[11px]">
                      No prospects in this stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#101C2C] text-white uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4 font-semibold">Prospect Name</th>
                <th className="py-3 px-4 font-semibold">Stage</th>
                <th className="py-3 px-4 font-semibold">Estimated AUM</th>
                <th className="py-3 px-4 font-semibold">Lead Source</th>
                <th className="py-3 px-4 font-semibold">Assigned Advisor</th>
                <th className="py-3 px-4 font-semibold">Next Follow-up</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProspects.map(p => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900 block">{p.name}</span>
                    <span className="text-[11px] text-slate-400">{p.email} • {p.city}</span>
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={p.stage}
                      onChange={e => handleStageChange(p.id, e.target.value as ProspectStage)}
                      className="px-2 py-1 rounded bg-slate-50 border border-slate-200 text-xs font-semibold cursor-pointer"
                    >
                      {stages.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-4 font-bold text-[#147D64]">{formatINR(p.estimatedAUM, true)}</td>
                  <td className="py-3 px-4 text-slate-600">{p.source}</td>
                  <td className="py-3 px-4 text-slate-700">{p.assignedAdvisor}</td>
                  <td className="py-3 px-4 text-slate-600">{formatDate(p.nextFollowUpDate)}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => openEdit(p)}
                      className="p-1.5 text-slate-500 hover:text-[#101C2C] hover:bg-slate-100 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="font-serif-display text-xl font-bold text-[#101C2C]">
                {prospectToEdit ? 'Edit Prospect' : 'Add New Prospect'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProspect} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Prospect Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Vikramaditya Singhania"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="vikram@singhania.in"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estimated AUM (INR ₹)</label>
                  <input
                    type="number"
                    value={formData.estimatedAUM}
                    onChange={e => setFormData({ ...formData, estimatedAUM: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pipeline Stage</label>
                  <select
                    value={formData.stage}
                    onChange={e => setFormData({ ...formData, stage: e.target.value as ProspectStage })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    {stages.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Advisory Notes</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Family trust context, referral background..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#101C2C] text-white rounded-lg font-semibold hover:bg-[#172B46]"
                >
                  Save Prospect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
