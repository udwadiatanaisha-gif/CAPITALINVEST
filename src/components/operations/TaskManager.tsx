import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Task } from '../../types';
import { formatDate } from '../../utils/formatters';
import {
  CheckSquare,
  Square,
  Plus,
  Clock,
  AlertCircle,
  User,
  Filter,
  CheckCircle2,
  Trash2,
  Kanban,
  List,
  Calendar,
  AlertTriangle
} from 'lucide-react';

export const TaskManager: React.FC = () => {
  const { tasks, clients, currentUser, addTask, updateTask, deleteTask } = useApp();
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('Medium');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [assignedTo, setAssignedTo] = useState('Tanaisha Udwadia');
  const [clientId, setClientId] = useState<string>('');

  const isClient = currentUser?.role?.toLowerCase() === 'client';
  const userClientId = currentUser?.assignedClientId || currentUser?.clientId;

  const filteredTasks = tasks.filter(t => {
    const taskClientId = t.relatedClientId || t.clientId;
    if (isClient && userClientId && taskClientId !== userClientId) {
      return false;
    }
    if (filterPriority !== 'all' && t.priority.toLowerCase() !== filterPriority.toLowerCase()) return false;
    if (filterStatus !== 'all' && t.status.toLowerCase() !== filterStatus.toLowerCase()) return false;
    return true;
  });

  const handleToggleComplete = (task: Task) => {
    const isDone = task.status.toLowerCase() === 'completed';
    const newStatus = isDone ? 'In Progress' : 'Completed';
    updateTask(task.id, {
      status: newStatus,
      completedAt: !isDone ? new Date().toISOString() : undefined
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTask({
      title: title.trim(),
      description: description.trim(),
      priority,
      status: 'Pending',
      dueDate,
      assignedTo,
      relatedClientId: clientId || undefined,
      clientId: clientId || undefined,
      createdBy: currentUser?.name || 'Tanaisha Udwadia'
    });

    setIsModalOpen(false);
    setTitle('');
    setDescription('');
    setClientId('');
  };

  const getPriorityBadge = (p: Task['priority']) => {
    const pLower = (p || '').toLowerCase();
    switch (pLower) {
      case 'critical':
      case 'urgent':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800">Critical</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800">High</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800">Medium</span>;
      case 'low':
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">Low</span>;
    }
  };

  const columns: { id: string; label: string; match: string[] }[] = [
    { id: 'todo', label: 'To Do', match: ['pending', 'todo'] },
    { id: 'in_progress', label: 'In Progress', match: ['in progress', 'in_progress'] },
    { id: 'completed', label: 'Completed', match: ['completed'] }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
              <CheckSquare className="w-3.5 h-3.5" /> Practice Operations
            </span>
            <span className="text-xs text-slate-400">Fiduciary Task Board</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
            Advisory Tasks & Compliance Action Items
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Track client onboarding milestones, annual review follow-ups, rebalancing trades, and tax deadlines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              <List className="w-3.5 h-3.5" /> List
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" /> Kanban
            </button>
          </div>

          {!isClient && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-all shadow-md hover:shadow-lg"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              New Action Item
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase">
          <Filter className="w-4 h-4 text-slate-400" /> Filter View:
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-white"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* View Mode Rendering */}
      {viewMode === 'list' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">No tasks matching selected filter.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredTasks.map((t) => {
                const targetClientId = t.relatedClientId || t.clientId;
                const client = clients.find(c => c.id === targetClientId);
                const isCompleted = t.status.toLowerCase() === 'completed';

                return (
                  <div key={t.id} className="p-4 sm:p-5 flex items-start gap-4 hover:bg-slate-50/70 transition-colors">
                    <button
                      onClick={() => handleToggleComplete(t)}
                      className="mt-1 text-slate-400 hover:text-amber-600 transition-colors"
                    >
                      {isCompleted ? (
                        <CheckSquare className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-300" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`font-semibold text-sm ${isCompleted ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                          {t.title}
                        </span>
                        {getPriorityBadge(t.priority)}
                        {client && (
                          <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                            Client: {client.name}
                          </span>
                        )}
                      </div>

                      {t.description && (
                        <p className={`text-xs mt-1 leading-relaxed ${isCompleted ? 'text-slate-400' : 'text-slate-600'}`}>
                          {t.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          Due: <strong className="text-slate-700">{formatDate(t.dueDate)}</strong>
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          Assigned: <span className="text-slate-700 font-medium">{t.assignedTo}</span>
                        </span>
                      </div>
                    </div>

                    {!isClient && (
                      <button
                        onClick={() => deleteTask(t.id)}
                        className="text-slate-300 hover:text-rose-600 p-1 rounded transition-colors"
                        title="Delete task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Kanban View */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((col) => {
            const colTasks = filteredTasks.filter(t => col.match.includes(t.status.toLowerCase()));
            return (
              <div key={col.id} className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
                  <h3 className="font-bold text-sm text-slate-900">{col.label}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white font-semibold text-slate-600 border border-slate-200">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {colTasks.map((t) => {
                    const targetClientId = t.relatedClientId || t.clientId;
                    const client = clients.find(c => c.id === targetClientId);
                    return (
                      <div
                        key={t.id}
                        className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          {getPriorityBadge(t.priority)}
                          <button
                            onClick={() => handleToggleComplete(t)}
                            className="text-xs text-slate-400 hover:text-slate-600"
                          >
                            {t.status.toLowerCase() === 'completed' ? 'Reopen' : 'Complete'}
                          </button>
                        </div>
                        <h4 className="font-semibold text-sm text-slate-900 mb-1">{t.title}</h4>
                        {t.description && (
                          <p className="text-xs text-slate-600 line-clamp-2 mb-2">{t.description}</p>
                        )}
                        {client && (
                          <div className="text-[11px] text-slate-500 font-medium mb-2">
                            Client: {client.name}
                          </div>
                        )}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                          <span>{formatDate(t.dueDate)}</span>
                          <span className="text-slate-600 font-medium">{t.assignedTo.split(' ')[0]}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-slate-900 text-lg">Create Fiduciary Action Item</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Execute quarterly rebalancing trade"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Detail action steps, mandate approvals required, and tax considerations..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Task['priority'])}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 bg-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Team Member</label>
                  <select
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 bg-white"
                  >
                    <option value="Tanaisha Udwadia">Tanaisha Udwadia (Advisor)</option>
                    <option value="Devansh Singhania">Devansh Singhania (Ops)</option>
                    <option value="Prateek Sharma">Prateek Sharma (Admin)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Associate Client (Optional)</label>
                  <select
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 bg-white"
                  >
                    <option value="">-- General Practice Task --</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-all shadow-md"
                >
                  Save Action Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
