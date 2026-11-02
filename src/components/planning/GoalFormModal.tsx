import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { FinancialGoal, GoalCategory, GoalPriority, GoalStatus } from '../../types';
import { calculateGoalProjection } from '../../utils/calculations';
import { formatINR } from '../../utils/formatters';
import { X, Save, AlertCircle, Target, Sparkles } from 'lucide-react';

interface GoalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalToEdit?: FinancialGoal | null;
  defaultClientId?: string;
}

export const GoalFormModal: React.FC<GoalFormModalProps> = ({
  isOpen,
  onClose,
  goalToEdit,
  defaultClientId
}) => {
  const { clients, addGoal, updateGoal } = useApp();

  const [formData, setFormData] = useState({
    clientId: defaultClientId || clients[0]?.id || 'CLI-001',
    name: '',
    category: 'Home Purchase' as GoalCategory,
    targetAmount: 20000000,
    currentSavedAmount: 5000000,
    targetDate: '2029-12-31',
    currentMonthlyContribution: 100000,
    expectedReturnAssumption: 10.5,
    priority: 'High' as GoalPriority,
    status: 'On Track' as GoalStatus,
    notes: ''
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (goalToEdit) {
      setFormData({
        clientId: goalToEdit.clientId,
        name: goalToEdit.name,
        category: goalToEdit.category,
        targetAmount: goalToEdit.targetAmount,
        currentSavedAmount: goalToEdit.currentSavedAmount,
        targetDate: goalToEdit.targetDate,
        currentMonthlyContribution: goalToEdit.currentMonthlyContribution,
        expectedReturnAssumption: goalToEdit.expectedReturnAssumption || 10.0,
        priority: goalToEdit.priority,
        status: goalToEdit.status,
        notes: goalToEdit.notes || ''
      });
    } else {
      setFormData({
        clientId: defaultClientId || clients[0]?.id || 'CLI-001',
        name: '',
        category: 'Home Purchase',
        targetAmount: 20000000,
        currentSavedAmount: 5000000,
        targetDate: '2029-12-31',
        currentMonthlyContribution: 100000,
        expectedReturnAssumption: 10.5,
        priority: 'High',
        status: 'On Track',
        notes: ''
      });
    }
  }, [goalToEdit, defaultClientId, isOpen, clients]);

  if (!isOpen) return null;

  // Live projection preview
  const projection = calculateGoalProjection(formData as any);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name.trim()) {
      setErrorMsg('Goal name / milestone title is required.');
      return;
    }
    if (formData.targetAmount <= 0) {
      setErrorMsg('Target amount must be a positive number.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (goalToEdit) {
        await updateGoal(goalToEdit.id, formData);
      } else {
        await addGoal(formData);
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save goal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b pb-3 mb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#C6A76A]">
              Goal-Based Planning
            </span>
            <h3 className="font-serif-display text-2xl font-bold text-[#101C2C]">
              {goalToEdit ? `Edit ${goalToEdit.name}` : 'Create Milestone Goal'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Target Client *</label>
            <select
              value={formData.clientId}
              onChange={e => setFormData({ ...formData, clientId: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
            >
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.city})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Goal Milestone Title *</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Daughter Harvard University Corpus"
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value as GoalCategory })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
              >
                <option value="Retirement">Retirement</option>
                <option value="Home Purchase">Home Purchase</option>
                <option value="Child's Education">Child's Education</option>
                <option value="Emergency Fund">Emergency Fund</option>
                <option value="Family Protection">Family Protection</option>
                <option value="Travel & Lifestyle">Travel & Lifestyle</option>
                <option value="Custom">Custom Milestone</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Corpus (INR ₹) *</label>
              <input
                type="number"
                value={formData.targetAmount}
                onChange={e => setFormData({ ...formData, targetAmount: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Current Saved Capital (INR ₹)</label>
              <input
                type="number"
                value={formData.currentSavedAmount}
                onChange={e => setFormData({ ...formData, currentSavedAmount: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Date</label>
              <input
                type="date"
                value={formData.targetDate}
                onChange={e => setFormData({ ...formData, targetDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Monthly Contribution (₹)</label>
              <input
                type="number"
                value={formData.currentMonthlyContribution}
                onChange={e => setFormData({ ...formData, currentMonthlyContribution: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Expected Return (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.expectedReturnAssumption}
                onChange={e => setFormData({ ...formData, expectedReturnAssumption: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value as GoalPriority })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as GoalStatus })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
              >
                <option value="On Track">On Track</option>
                <option value="Attention Needed">Attention Needed</option>
                <option value="Behind Schedule">Behind Schedule</option>
                <option value="Achieved">Achieved</option>
              </select>
            </div>
          </div>

          {/* Transparent Live Compound Projection Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center">
                <Sparkles className="w-3.5 h-3.5 text-[#C6A76A] mr-1" />
                Transparent Future Value Projection
              </span>
              <span className="text-[10px] text-slate-500">{projection.yearsRemaining} years remaining</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div>
                <span className="text-slate-500 block">Projected Corpus:</span>
                <strong className="text-slate-900">{formatINR(projection.projectedFutureValue, true)}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Completion Probability:</span>
                <strong className={projection.onTrackProbability >= 80 ? 'text-[#147D64]' : 'text-amber-600'}>
                  {projection.onTrackProbability}%
                </strong>
              </div>
              <div className="col-span-2 pt-1 border-t border-slate-200 text-slate-600 text-[10px]">
                Recommended monthly savings to reach ₹{(formData.targetAmount / 100000).toFixed(1)} Lakhs: <strong>₹{projection.requiredMonthlyContribution.toLocaleString('en-IN')}/mo</strong>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-[#101C2C] hover:bg-[#172B46] text-white rounded-lg font-semibold cursor-pointer"
            >
              {isSubmitting ? 'Saving...' : 'Save Financial Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
