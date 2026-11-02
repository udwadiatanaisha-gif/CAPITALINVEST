import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MapPin, Phone, Mail, Clock, CheckCircle2, AlertCircle, Send } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { firmSettings } = useApp();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    interest: 'HNW Wealth Advisory',
    message: '',
    consent: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!formData.message.trim()) {
      setErrorMsg('Please enter your inquiry message.');
      return;
    }
    if (!formData.consent) {
      setErrorMsg('Please confirm your consent for an advisor to contact you.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Post to backend audit / inquiry log
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `New Public Inquiry from ${formData.fullName}`,
          description: `Interest: ${formData.interest} | Phone: ${formData.phone || 'N/A'} | Email: ${formData.email} | Message: ${formData.message}`,
          priority: 'High',
          status: 'Pending',
          assignedTo: 'Tanaisha Udwadia'
        })
      });
      setSubmitted(true);
    } catch {
      // Local fallback
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#F7F5F0] min-h-screen text-[#101C2C]">
      {/* Header */}
      <div className="bg-[#101C2C] text-white py-20 border-b border-[#172B46]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#C6A76A]">Get in Touch</span>
          <h1 className="font-serif-display text-4xl sm:text-5xl font-bold mt-2">
            Advisory Inquiries & Consultation
          </h1>
          <p className="mt-4 text-base text-slate-300 leading-relaxed">
            Schedule a private consultation with our wealth management leadership team in Mumbai or arrange a confidential video conference.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Details Card */}
          <div className="bg-[#101C2C] text-white p-8 sm:p-10 rounded-2xl shadow-lg border border-[#172B46] space-y-8">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-[#C6A76A]">Head Office</span>
              <h3 className="font-serif-display text-2xl font-bold text-white mt-1">CapitalVest Mumbai</h3>
              <p className="text-xs text-slate-300 mt-1">Private Wealth Management Command Centre</p>
            </div>

            <div className="space-y-5 text-sm">
              <div className="flex items-start space-x-3.5">
                <MapPin className="w-5 h-5 text-[#C6A76A] flex-shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <span className="font-semibold block text-slate-200">Executive Suites, Level 14</span>
                  Maker Chambers VI, Nariman Point, Mumbai 400021, India
                </div>
              </div>

              <div className="flex items-center space-x-3.5">
                <Phone className="w-5 h-5 text-[#C6A76A] flex-shrink-0" />
                <span className="text-xs text-slate-200">{firmSettings.contactPhone}</span>
              </div>

              <div className="flex items-center space-x-3.5">
                <Mail className="w-5 h-5 text-[#C6A76A] flex-shrink-0" />
                <span className="text-xs text-slate-200">{firmSettings.contactEmail}</span>
              </div>

              <div className="flex items-start space-x-3.5">
                <Clock className="w-5 h-5 text-[#C6A76A] flex-shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300">
                  <span className="font-semibold block text-slate-200">Office Hours</span>
                  Monday - Friday: 9:00 AM - 6:30 PM IST <br />
                  Saturday by prior appointment
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-700 text-xs text-slate-400">
              <span className="text-[#C6A76A] font-semibold">Strict Confidentiality Guarantee:</span> All inquiries are treated under non-disclosure governance. Information is never distributed to third parties.
            </div>
          </div>

          {/* Inquiry Form */}
          <div className="lg:col-span-2 bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-sm">
            {submitted ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#147D64] mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="font-serif-display text-2xl font-bold text-[#101C2C]">Inquiry Received</h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  Thank you, <span className="font-semibold text-slate-900">{formData.fullName}</span>. Your inquiry has been registered in our advisor operations queue. An advisor will review your request and respond via email or phone.
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        fullName: '',
                        email: '',
                        phone: '',
                        interest: 'HNW Wealth Advisory',
                        message: '',
                        consent: false
                      });
                    }}
                    className="px-6 py-2.5 bg-[#101C2C] text-white text-xs font-semibold rounded hover:bg-[#172B46] transition-colors cursor-pointer"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h3 className="font-serif-display text-2xl font-bold text-[#101C2C]">Send Us a Direct Message</h3>
                  <p className="text-xs text-slate-500 mt-1">Complete the confidential form below to connect with a senior wealth manager.</p>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g. Vikramaditya Singhania"
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#C6A76A]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. vikram@familytrust.in"
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#C6A76A]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. +91 98200 12345"
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#C6A76A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Primary Area of Interest
                    </label>
                    <select
                      value={formData.interest}
                      onChange={e => setFormData({ ...formData, interest: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#C6A76A]"
                    >
                      <option value="HNW Wealth Advisory">HNW Wealth Advisory (₹5 Cr+)</option>
                      <option value="Family Office & Trust Structuring">Family Office & Trust Structuring</option>
                      <option value="Multi-Asset Portfolio Review">Multi-Asset Portfolio Review</option>
                      <option value="Goal-Based Retirement Planning">Goal-Based Retirement Planning</option>
                      <option value="Spreadsheet Integration Setup">Spreadsheet Integration Setup</option>
                      <option value="Institutional Partnership">Institutional Partnership</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Your Message / Portfolio Objectives <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Briefly describe your current portfolio setup or areas you would like assistance with..."
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#C6A76A]"
                    required
                  />
                </div>

                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="consentCheckbox"
                    checked={formData.consent}
                    onChange={e => setFormData({ ...formData, consent: e.target.checked })}
                    className="mt-1 h-4 w-4 text-[#147D64] rounded border-slate-300 focus:ring-[#C6A76A]"
                  />
                  <label htmlFor="consentCheckbox" className="text-xs text-slate-600 leading-relaxed">
                    I consent to having CapitalVest Wealth Management collect and process my contact details solely for responding to this inquiry in accordance with the Data Handling Policy.
                  </label>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center px-8 py-3 bg-[#101C2C] hover:bg-[#172B46] text-white text-xs font-semibold uppercase tracking-wider rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    {isSubmitting ? 'Transmitting...' : 'Send Inquiry'}
                    <Send className="w-3.5 h-3.5 ml-2" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
