import React, { useState, useEffect } from 'react';
import { Client, RiskProfile, ClientCategory, RelationshipStatus } from '../../types';
import { X, CheckCircle2, AlertCircle, Save, ExternalLink } from 'lucide-react';

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (clientData: Partial<Client>, openProfile?: boolean) => Promise<void>;
  clientToEdit?: Client | null;
}

export const ClientFormModal: React.FC<ClientFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  clientToEdit
}) => {
  const [activeTab, setActiveTab] = useState<'personal' | 'financial' | 'planning' | 'admin'>('personal');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<Partial<Client>>({
    name: '',
    email: '',
    phone: '',
    city: 'Mumbai',
    dateOfBirth: '',
    occupation: '',
    relationshipStartDate: new Date().toISOString().split('T')[0],
    primaryAdvisor: 'Tanaisha Udwadia',
    relationshipStatus: 'Active',
    category: 'HNW',
    annualIncomeBand: '₹75 Lakhs - ₹1.5 Cr',
    investmentExperience: 'Experienced',
    investmentHorizon: 'Long-term (7+ yrs)',
    investmentObjectives: ['Capital Appreciation', 'Tax Efficiency'],
    liquidityRequirements: 'Moderate',
    riskProfile: 'Growth',
    riskAssessmentDate: new Date().toISOString().split('T')[0],
    plannedRetirementAge: 58,
    emergencyFundTarget: 1200000,
    insuranceReviewStatus: 'Up to Date',
    preferredReviewFrequency: 'Quarterly',
    nextReviewDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
    notes: '',
    consentSigned: true
  });

  useEffect(() => {
    if (clientToEdit) {
      setFormData(clientToEdit);
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        city: 'Mumbai',
        dateOfBirth: '1985-05-15',
        occupation: 'Enterprise Director',
        relationshipStartDate: new Date().toISOString().split('T')[0],
        primaryAdvisor: 'Tanaisha Udwadia',
        relationshipStatus: 'Active',
        category: 'HNW',
        annualIncomeBand: '₹75 Lakhs - ₹1.5 Cr',
        investmentExperience: 'Experienced',
        investmentHorizon: 'Long-term (7+ yrs)',
        investmentObjectives: ['Capital Appreciation', 'Wealth Preservation'],
        liquidityRequirements: 'Moderate',
        riskProfile: 'Growth',
        riskAssessmentDate: new Date().toISOString().split('T')[0],
        plannedRetirementAge: 58,
        emergencyFundTarget: 1500000,
        insuranceReviewStatus: 'Up to Date',
        preferredReviewFrequency: 'Quarterly',
        nextReviewDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
        notes: '',
        consentSigned: true
      });
    }
  }, [clientToEdit, isOpen]);

  if (!isOpen) return null;

  const handleFormSubmit = async (openProfile: boolean = false) => {
    setErrorMsg('');
    if (!formData.name?.trim()) {
      setErrorMsg('Full client legal name is required.');
      setActiveTab('personal');
      return;
    }
    if (!formData.email?.trim() || !formData.email.includes('@')) {
      setErrorMsg('A valid email address is required.');
      setActiveTab('personal');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(formData, openProfile);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save client record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#C6A76A]">
              {clientToEdit ? 'Edit Relationship' : 'New Client Registration'}
            </span>
            <h3 className="font-serif-display text-2xl font-bold text-[#101C2C]">
              {clientToEdit ? clientToEdit.name : 'Register Client Profile'}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Tabs */}
        <div className="flex border-b border-slate-200 px-6 gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('personal')}
            className={`py-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'personal' ? 'border-[#147D64] text-[#147D64]' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            1. Personal Profile
          </button>
          <button
            onClick={() => setActiveTab('financial')}
            className={`py-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'financial' ? 'border-[#147D64] text-[#147D64]' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            2. Financial Profile
          </button>
          <button
            onClick={() => setActiveTab('planning')}
            className={`py-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'planning' ? 'border-[#147D64] text-[#147D64]' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            3. Planning & Risk
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`py-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'admin' ? 'border-[#147D64] text-[#147D64]' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            4. Administration
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === 'personal' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Meera Patel"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#C6A76A]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@domain.in"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#C6A76A]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98200 12345"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#C6A76A]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">City / Region</label>
                <input
                  type="text"
                  value={formData.city || ''}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g. Mumbai"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#C6A76A]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dateOfBirth || ''}
                  onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#C6A76A]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Occupation / Business</label>
                <input
                  type="text"
                  value={formData.occupation || ''}
                  onChange={e => setFormData({ ...formData, occupation: e.target.value })}
                  placeholder="e.g. Managing Partner"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#C6A76A]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Client Category</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value as ClientCategory })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="Ultra HNW">Ultra HNW (₹5 Cr+)</option>
                  <option value="HNW">HNW (₹1-5 Cr)</option>
                  <option value="Affluent">Affluent (₹25L-1 Cr)</option>
                  <option value="Retail">Retail</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Primary Advisor</label>
                <input
                  type="text"
                  value={formData.primaryAdvisor || 'Tanaisha Udwadia'}
                  onChange={e => setFormData({ ...formData, primaryAdvisor: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>
            </div>
          )}

          {activeTab === 'financial' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Annual Income Band</label>
                <select
                  value={formData.annualIncomeBand}
                  onChange={e => setFormData({ ...formData, annualIncomeBand: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="₹25 Lakhs - ₹50 Lakhs">₹25 Lakhs - ₹50 Lakhs</option>
                  <option value="₹50 Lakhs - ₹1 Cr">₹50 Lakhs - ₹1 Cr</option>
                  <option value="₹1 Cr - ₹2 Cr">₹1 Cr - ₹2 Cr</option>
                  <option value="₹2 Cr - ₹5 Cr">₹2 Cr - ₹5 Cr</option>
                  <option value="₹5 Cr+">₹5 Cr+</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Investment Horizon</label>
                <select
                  value={formData.investmentHorizon}
                  onChange={e => setFormData({ ...formData, investmentHorizon: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="Short-term (< 3 yrs)">Short-term (&lt; 3 yrs)</option>
                  <option value="Medium-term (3-7 yrs)">Medium-term (3-7 yrs)</option>
                  <option value="Long-term (7+ yrs)">Long-term (7+ yrs)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Investment Experience</label>
                <select
                  value={formData.investmentExperience}
                  onChange={e => setFormData({ ...formData, investmentExperience: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="Novice">Novice</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Experienced">Experienced</option>
                  <option value="Sophisticated">Sophisticated</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Liquidity Requirements</label>
                <select
                  value={formData.liquidityRequirements}
                  onChange={e => setFormData({ ...formData, liquidityRequirements: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="Low">Low (&lt; 5% annual liquidity needs)</option>
                  <option value="Moderate">Moderate (5-15% annual liquidity)</option>
                  <option value="High">High (&gt; 15% immediate access)</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'planning' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Risk Profile Classification</label>
                <select
                  value={formData.riskProfile}
                  onChange={e => setFormData({ ...formData, riskProfile: e.target.value as RiskProfile })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="Conservative">Conservative (Capital preservation priority)</option>
                  <option value="Moderate">Moderate (Fixed income + defensive equity)</option>
                  <option value="Balanced">Balanced (50/50 Equity & Debt)</option>
                  <option value="Growth">Growth (High equity bias 70%+)</option>
                  <option value="Aggressive">Aggressive (Unlisted & Momentum equity)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Emergency Fund Target (INR ₹)</label>
                <input
                  type="number"
                  value={formData.emergencyFundTarget || ''}
                  onChange={e => setFormData({ ...formData, emergencyFundTarget: Number(e.target.value) })}
                  placeholder="1500000"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Planned Retirement Age</label>
                <input
                  type="number"
                  value={formData.plannedRetirementAge || ''}
                  onChange={e => setFormData({ ...formData, plannedRetirementAge: Number(e.target.value) })}
                  placeholder="58"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Insurance Review Status</label>
                <select
                  value={formData.insuranceReviewStatus}
                  onChange={e => setFormData({ ...formData, insuranceReviewStatus: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="Up to Date">Up to Date</option>
                  <option value="Pending Review">Pending Review</option>
                  <option value="Inadequate Coverage">Inadequate Coverage</option>
                  <option value="Not Started">Not Started</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Next Review Scheduled</label>
                <input
                  type="date"
                  value={formData.nextReviewDate || ''}
                  onChange={e => setFormData({ ...formData, nextReviewDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Preferred Review Cycle</label>
                <select
                  value={formData.preferredReviewFrequency}
                  onChange={e => setFormData({ ...formData, preferredReviewFrequency: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Bi-Annual">Bi-Annual</option>
                  <option value="Annual">Annual</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'admin' && (
            <div className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Confidential Internal Notes</label>
                <textarea
                  rows={3}
                  value={formData.notes || ''}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Internal notes regarding trust entities, family dynamics, or liquidity schedules..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#C6A76A]"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="consentSign"
                  checked={formData.consentSigned}
                  onChange={e => setFormData({ ...formData, consentSigned: e.target.checked })}
                  className="rounded border-slate-300 text-[#147D64]"
                />
                <label htmlFor="consentSign" className="text-slate-700 font-medium">
                  Client consent agreement on file and verified under C-KYC
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-slate-200 flex items-center justify-between bg-slate-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleFormSubmit(false)}
              disabled={isSubmitting}
              className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center cursor-pointer"
            >
              <Save className="w-3.5 h-3.5 mr-1.5" />
              Save Client
            </button>

            <button
              onClick={() => handleFormSubmit(true)}
              disabled={isSubmitting}
              className="px-5 py-2 bg-[#101C2C] hover:bg-[#172B46] text-white text-xs font-semibold rounded-lg transition-colors flex items-center cursor-pointer"
            >
              <span>Save & Open 360</span>
              <ExternalLink className="w-3.5 h-3.5 ml-1.5 text-[#C6A76A]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
