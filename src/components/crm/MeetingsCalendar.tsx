import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Meeting, MeetingType, Client } from '../../types';
import { formatDate, formatDateTime } from '../../utils/formatters';
import {
  Calendar as CalendarIcon,
  List,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MapPin,
  Video,
  PhoneCall,
  X,
  Edit,
  User
} from 'lucide-react';

interface MeetingsCalendarProps {
  onScheduleForClient?: Client | null;
}

export const MeetingsCalendar: React.FC<MeetingsCalendarProps> = ({ onScheduleForClient }) => {
  const { meetings, clients, addMeeting, updateMeeting, currentUser } = useApp();

  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [meetingToEdit, setMeetingToEdit] = useState<Meeting | null>(null);

  const [formData, setFormData] = useState({
    clientId: onScheduleForClient?.id || clients[0]?.id || 'CLI-001',
    clientName: onScheduleForClient?.name || clients[0]?.name || 'Aarav Mehta',
    advisorName: currentUser?.name || 'Tanaisha Udwadia',
    title: 'Quarterly Strategic Wealth Review',
    dateTime: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 16),
    durationMinutes: 60,
    type: 'Quarterly Check-in' as MeetingType,
    agenda: 'Review equity gains, rebalance debt allocations, verify goal progress.',
    meetingMode: 'In-Person (Office)' as const,
    notes: '',
    outcome: ''
  });

  const filteredMeetings = meetings.filter(m => {
    if (filterStatus === 'All') return true;
    return m.status === filterStatus;
  }).sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

  const upcomingCount = meetings.filter(m => m.status === 'Scheduled').length;
  const completedCount = meetings.filter(m => m.status === 'Completed').length;

  const handleSaveMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    const matchedClient = clients.find(c => c.id === formData.clientId);
    const finalClientName = matchedClient ? matchedClient.name : formData.clientName;

    if (meetingToEdit) {
      await updateMeeting(meetingToEdit.id, {
        ...formData,
        clientName: finalClientName
      });
    } else {
      await addMeeting({
        ...formData,
        clientName: finalClientName
      });
    }
    setIsModalOpen(false);
    setMeetingToEdit(null);
  };

  const handleStatusChange = async (id: string, status: 'Completed' | 'Cancelled' | 'Rescheduled') => {
    await updateMeeting(id, { status });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-[#C6A76A]">
            Governance & Reviews
          </span>
          <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#101C2C] mt-0.5">
            Meetings & Review Scheduler
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Systematic quarterly reviews, portfolio rebalancing check-ins, and client consultations
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded text-xs font-semibold flex items-center transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <List className="w-4 h-4 mr-1" />
              List
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-1.5 rounded text-xs font-semibold flex items-center transition-colors cursor-pointer ${
                viewMode === 'calendar' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <CalendarIcon className="w-4 h-4 mr-1" />
              Calendar
            </button>
          </div>

          <button
            onClick={() => {
              setMeetingToEdit(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center px-4 py-2 bg-[#101C2C] hover:bg-[#172B46] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5 text-[#C6A76A]" />
            Schedule Meeting
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-500 font-medium">Upcoming Scheduled Meetings</span>
          <div className="text-2xl font-bold text-[#101C2C] mt-1">{upcomingCount}</div>
          <span className="text-[11px] text-[#147D64]">Next 30 days active</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-500 font-medium">Completed Portfolio Audits</span>
          <div className="text-2xl font-bold text-[#147D64] mt-1">{completedCount}</div>
          <span className="text-[11px] text-slate-500">Documented governance outcomes</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-slate-500 font-medium">Primary Meeting Mode</span>
          <div className="text-lg font-bold text-[#101C2C] mt-1">Hybrid Office & Video</div>
          <span className="text-[11px] text-[#C6A76A]">Nariman Point & Zoom</span>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex border-b border-slate-200 space-x-4 text-xs font-semibold">
        {['All', 'Scheduled', 'Completed', 'Rescheduled', 'Cancelled'].map(st => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`pb-2.5 transition-colors cursor-pointer ${
              filterStatus === st ? 'border-b-2 border-[#147D64] text-[#147D64]' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {st} ({st === 'All' ? meetings.length : meetings.filter(m => m.status === st).length})
          </button>
        ))}
      </div>

      {/* Meeting Cards List View */}
      {viewMode === 'list' ? (
        <div className="space-y-4">
          {filteredMeetings.map((m) => {
            const isCompleted = m.status === 'Completed';

            return (
              <div
                key={m.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded">
                      {m.clientName}
                    </span>
                    <span className="text-[10px] font-semibold text-[#147D64] bg-[#147D64]/10 px-2 py-0.5 rounded">
                      {m.type}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        m.status === 'Scheduled'
                          ? 'bg-blue-50 text-blue-700'
                          : m.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>

                  <h3 className="font-serif-display text-lg font-bold text-[#101C2C]">{m.title}</h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1 text-[#C6A76A]" />
                      {formatDateTime(m.dateTime)} ({m.durationMinutes} mins)
                    </span>
                    <span className="flex items-center">
                      {m.meetingMode.includes('Video') ? (
                        <Video className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      ) : m.meetingMode.includes('Phone') ? (
                        <PhoneCall className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      ) : (
                        <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      )}
                      {m.meetingMode}
                    </span>
                    <span className="flex items-center">
                      <User className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      Advisor: {m.advisorName}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 pt-1 leading-relaxed">
                    <strong className="text-slate-800">Agenda:</strong> {m.agenda}
                  </p>

                  {m.outcome && (
                    <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 mt-2">
                      <span className="font-bold">Agreed Outcome:</span> {m.outcome}
                    </div>
                  )}
                </div>

                {/* Status action buttons */}
                <div className="flex items-center space-x-2 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-4">
                  {m.status === 'Scheduled' && (
                    <button
                      onClick={() => handleStatusChange(m.id, 'Completed')}
                      className="px-3 py-1.5 bg-[#147D64] hover:bg-[#116954] text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
                    >
                      Mark Completed
                    </button>
                  )}
                  {m.status === 'Scheduled' && (
                    <button
                      onClick={() => handleStatusChange(m.id, 'Cancelled')}
                      className="px-3 py-1.5 border border-slate-300 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {filteredMeetings.length === 0 && (
            <div className="py-12 bg-white rounded-xl text-center text-slate-400 text-xs border border-slate-200">
              No meetings found for the selected status.
            </div>
          )}
        </div>
      ) : (
        /* Calendar Grid View */
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredMeetings.map(m => (
              <div key={m.id} className="p-4 rounded-xl border border-slate-200 bg-[#F7F5F0]/60 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#101C2C]">{m.clientName}</span>
                  <span className="text-[10px] font-semibold text-[#147D64] bg-white px-2 py-0.5 rounded border border-slate-200">
                    {m.status}
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-900">{m.title}</div>
                <div className="text-slate-500 flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1 text-[#C6A76A]" />
                  {formatDateTime(m.dateTime)}
                </div>
                <div className="text-slate-600 line-clamp-2 italic">{m.agenda}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Schedule / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="font-serif-display text-xl font-bold text-[#101C2C]">
                {meetingToEdit ? 'Edit Meeting Details' : 'Schedule Review Consultation'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMeeting} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Client *</label>
                <select
                  value={formData.clientId}
                  onChange={e => {
                    const c = clients.find(cl => cl.id === e.target.value);
                    setFormData({
                      ...formData,
                      clientId: e.target.value,
                      clientName: c ? c.name : formData.clientName
                    });
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.city} • {c.category})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Meeting Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date & Time *</label>
                  <input
                    type="datetime-local"
                    value={formData.dateTime}
                    onChange={e => setFormData({ ...formData, dateTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Duration</label>
                  <select
                    value={formData.durationMinutes}
                    onChange={e => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes</option>
                    <option value={60}>60 Minutes (1 Hour)</option>
                    <option value={90}>90 Minutes</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Meeting Review Type</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value as MeetingType })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="Quarterly Check-in">Quarterly Check-in</option>
                    <option value="Annual Review">Annual Review</option>
                    <option value="Portfolio Rebalancing">Portfolio Rebalancing</option>
                    <option value="Goal Planning">Goal Planning</option>
                    <option value="Onboarding Session">Onboarding Session</option>
                    <option value="Ad-hoc Consultation">Ad-hoc Consultation</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Meeting Mode</label>
                  <select
                    value={formData.meetingMode}
                    onChange={e => setFormData({ ...formData, meetingMode: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="In-Person (Office)">In-Person (Office)</option>
                    <option value="Video Conference">Video Conference</option>
                    <option value="Phone Call">Phone Call</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Discussion Agenda</label>
                <textarea
                  rows={3}
                  value={formData.agenda}
                  onChange={e => setFormData({ ...formData, agenda: e.target.value })}
                  placeholder="Outline key portfolio, tax harvest, and asset allocation points..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#101C2C] text-white rounded-lg font-semibold hover:bg-[#172B46] cursor-pointer"
                >
                  Confirm Meeting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
