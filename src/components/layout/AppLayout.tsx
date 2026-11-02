import React, { useState } from 'react';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';
import { useApp } from '../../context/AppContext';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isDemoMode } = useApp();

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#101C2C] flex">
      {/* Persistent Left Sidebar */}
      <AppSidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
      />

      {/* Main Workspace Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <AppHeader onMobileMenuToggle={() => setMobileMenuOpen(true)} />

        {/* Demo Alert Ribbon at top of workspace */}
        {isDemoMode && (
          <div className="bg-[#172B46] text-[#C6A76A] px-4 py-1.5 text-[11px] font-medium flex items-center justify-between border-b border-[#243c60]">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#147D64]" />
              <span>
                <strong>Illustrative Indian Financial Demo Active:</strong> All valuations, clients (Aarav Mehta, Ananya Shah, etc.), and reports are simulated.
              </span>
            </div>
            <span className="text-[10px] text-slate-300 hidden sm:inline">
              Currency: INR (₹) • Lakhs / Crores
            </span>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
