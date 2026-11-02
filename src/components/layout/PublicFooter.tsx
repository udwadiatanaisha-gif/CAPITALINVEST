import React from 'react';
import { BrandLogo } from '../common/BrandLogo';
import { useApp } from '../../context/AppContext';
import { Shield, Lock, FileText, Phone, Mail, MapPin } from 'lucide-react';

export const PublicFooter: React.FC = () => {
  const { navigate, firmSettings } = useApp();

  return (
    <footer className="bg-[#101C2C] text-slate-400 border-t border-[#172B46] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#172B46]">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <BrandLogo variant="dark" size="lg" />
            <p className="text-sm text-slate-300 leading-relaxed max-w-sm mt-3">
              CapitalVest is a modern wealth management command centre helping financial advisors manage client relationships, monitor multi-asset portfolios, track financial goals, and synchronize financial spreadsheets with enterprise security.
            </p>
            <div className="flex items-center space-x-3 text-xs text-slate-400 pt-2">
              <span className="inline-flex items-center text-[#147D64]">
                <Shield className="w-4 h-4 mr-1 text-[#147D64]" /> Enterprise Encryption
              </span>
              <span>•</span>
              <span className="inline-flex items-center text-[#C6A76A]">
                <Lock className="w-4 h-4 mr-1 text-[#C6A76A]" /> Role-Based Access
              </span>
            </div>
          </div>

          {/* Platform Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => navigate('dashboard')} className="hover:text-white transition-colors">
                  Advisor Command Centre
                </button>
              </li>
              <li>
                <button onClick={() => navigate('portfolio-overview')} className="hover:text-white transition-colors">
                  Portfolio Analytics
                </button>
              </li>
              <li>
                <button onClick={() => navigate('data-hub')} className="hover:text-white transition-colors">
                  Spreadsheet Data Hub
                </button>
              </li>
              <li>
                <button onClick={() => navigate('goals')} className="hover:text-white transition-colors">
                  Goal-Based Planning
                </button>
              </li>
              <li>
                <button onClick={() => navigate('reports')} className="hover:text-white transition-colors">
                  Report Generation
                </button>
              </li>
            </ul>
          </div>

          {/* Solutions & Company */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => navigate('about')} className="hover:text-white transition-colors">
                  About CapitalVest
                </button>
              </li>
              <li>
                <button onClick={() => navigate('solutions')} className="hover:text-white transition-colors">
                  Wealth Solutions
                </button>
              </li>
              <li>
                <button onClick={() => navigate('platform')} className="hover:text-white transition-colors">
                  Architecture Overview
                </button>
              </li>
              <li>
                <button onClick={() => navigate('contact')} className="hover:text-white transition-colors">
                  Advisory Inquiries
                </button>
              </li>
              <li>
                <button onClick={() => navigate('signin')} className="hover:text-[#C6A76A] transition-colors">
                  Client & Team Portal
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Governance */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Trust & Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => navigate('legal', 'privacy')} className="hover:text-white transition-colors">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => navigate('legal', 'terms')} className="hover:text-white transition-colors">
                  Terms of Use
                </button>
              </li>
              <li>
                <button onClick={() => navigate('legal', 'data')} className="hover:text-white transition-colors">
                  Data Handling Policy
                </button>
              </li>
              <li>
                <button onClick={() => navigate('legal', 'security')} className="hover:text-white transition-colors">
                  Security Overview
                </button>
              </li>
              <li>
                <button onClick={() => navigate('legal', 'disclaimers')} className="hover:text-white transition-colors">
                  Regulatory Disclaimers
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact info strip */}
        <div className="py-6 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-4 border-b border-[#172B46]">
          <div className="flex flex-wrap items-center gap-6">
            <span className="flex items-center">
              <MapPin className="w-3.5 h-3.5 mr-1 text-[#C6A76A]" />
              {firmSettings.officeCity}
            </span>
            <span className="flex items-center">
              <Phone className="w-3.5 h-3.5 mr-1 text-[#C6A76A]" />
              {firmSettings.contactPhone}
            </span>
            <span className="flex items-center">
              <Mail className="w-3.5 h-3.5 mr-1 text-[#C6A76A]" />
              {firmSettings.contactEmail}
            </span>
          </div>
          <div>
            <span className="text-slate-400">Default Currency: </span>
            <span className="text-slate-200 font-medium">INR (₹)</span> | Timezone: <span className="text-slate-200 font-medium">Asia/Kolkata</span>
          </div>
        </div>

        {/* Bottom Disclaimer & Copyright */}
        <div className="pt-6 text-xs text-slate-500 leading-relaxed flex flex-col md:flex-row items-center justify-between gap-4">
          <p>
            © {new Date().getFullYear()} CapitalVest Wealth Management. All rights reserved. Demo dataset is strictly fictional and illustrative. Valuations and returns are calculated from simulated holding cost basis and prices. Not registered investment advice.
          </p>
          <div className="flex items-center space-x-4">
            <span className="px-2 py-0.5 rounded bg-[#172B46] text-[#C6A76A] border border-[#C6A76A]/30 text-[10px] font-medium">
              Demo Environment Active
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
