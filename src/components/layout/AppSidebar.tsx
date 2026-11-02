import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BrandLogo } from '../common/BrandLogo';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Calendar,
  CheckSquare,
  TrendingUp,
  PieChart,
  Target,
  Activity,
  ShieldAlert,
  FileSpreadsheet,
  RefreshCw,
  FileText,
  FolderLock,
  ShieldCheck,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ExternalLink
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const AppSidebar: React.FC<SidebarProps> = ({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen
}) => {
  const { activeView, navigate, logout, currentUser, notificationsCount } = useApp();

  const isClientRole = currentUser?.role === 'Client';

  interface SidebarNavItem {
    id: string;
    label: string;
    icon: any;
    badge?: number | string | undefined;
  }
  interface SidebarSection {
    title: string;
    items: SidebarNavItem[];
  }

  // Navigation schema from Section 6
  const advisorSections: SidebarSection[] = [
    {
      title: 'Overview',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }
      ]
    },
    {
      title: 'Client Management',
      items: [
        { id: 'clients', label: 'Clients', icon: Users },
        { id: 'prospects', label: 'Prospects', icon: UserPlus },
        { id: 'meetings', label: 'Meetings & Reviews', icon: Calendar },
        { id: 'tasks', label: 'Tasks & Follow-ups', icon: CheckSquare }
      ]
    },
    {
      title: 'Wealth Management',
      items: [
        { id: 'portfolio-overview', label: 'Portfolios', icon: TrendingUp },
        { id: 'asset-allocation', label: 'Asset Allocation', icon: PieChart },
        { id: 'goals', label: 'Financial Goals', icon: Target },
        { id: 'health', label: 'Financial Health', icon: Activity },
        { id: 'risk', label: 'Risk Monitoring', icon: ShieldAlert, badge: notificationsCount > 0 ? notificationsCount : undefined }
      ]
    },
    {
      title: 'Operations',
      items: [
        { id: 'data-hub', label: 'Data Hub', icon: FileSpreadsheet },
        { id: 'sync-history', label: 'Spreadsheet Sync', icon: RefreshCw },
        { id: 'reports', label: 'Reports', icon: FileText },
        { id: 'documents', label: 'Documents', icon: FolderLock }
      ]
    },
    {
      title: 'Administration',
      items: [
        { id: 'team', label: 'Team & Access', icon: ShieldCheck },
        { id: 'audit-log', label: 'Audit Log', icon: History },
        { id: 'settings', label: 'Settings', icon: Settings }
      ]
    }
  ];

  // Restricted client sections from Section 19
  const clientSections: SidebarSection[] = [
    {
      title: 'My Portfolio',
      items: [
        { id: 'client-dashboard', label: 'Overview', icon: LayoutDashboard },
        { id: 'portfolio-overview', label: 'My Holdings', icon: TrendingUp },
        { id: 'asset-allocation', label: 'Asset Allocation', icon: PieChart },
        { id: 'goals', label: 'My Goals', icon: Target },
        { id: 'health', label: 'Financial Health', icon: Activity }
      ]
    },
    {
      title: 'Collaboration',
      items: [
        { id: 'meetings', label: 'My Meetings', icon: Calendar },
        { id: 'documents', label: 'Shared Documents', icon: FolderLock },
        { id: 'reports', label: 'Wealth Statements', icon: FileText },
        { id: 'settings', label: 'Account Settings', icon: Settings }
      ]
    }
  ];

  const sections = isClientRole ? clientSections : advisorSections;

  const handleNavClick = (viewId: string) => {
    navigate(viewId);
    if (mobileOpen) setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-[#101C2C] text-slate-300 flex flex-col border-r border-[#172B46] transition-all duration-300 ease-in-out ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#172B46]">
          <div
            className="cursor-pointer overflow-hidden"
            onClick={() => handleNavClick(isClientRole ? 'client-dashboard' : 'dashboard')}
          >
            <BrandLogo variant="dark" size="sm" showTagline={!collapsed} />
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 rounded-md hover:bg-white/5 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Scrollable Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
          {sections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {!collapsed && (
                <div className="px-3 text-[10px] uppercase font-bold tracking-widest text-[#C6A76A]/80 mb-2">
                  {section.title}
                </div>
              )}

              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    title={collapsed ? item.label : undefined}
                    className={`w-full flex items-center rounded-lg transition-all text-xs font-medium cursor-pointer ${
                      collapsed ? 'justify-center py-2.5 px-0' : 'px-3 py-2 space-x-3'
                    } ${
                      isActive
                        ? 'bg-[#147D64] text-white shadow-sm font-semibold'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                    {!collapsed && item.badge && (
                      <span className="ml-auto px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#C94C4C] text-white">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* User Mini Bar & Logout */}
        <div className="p-3 border-t border-[#172B46] bg-[#0c1624]">
          <div className="flex items-center justify-between">
            {!collapsed && (
              <div className="flex items-center space-x-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-[#172B46] border border-[#C6A76A]/40 flex items-center justify-center font-bold text-xs text-[#C6A76A] flex-shrink-0">
                  {currentUser?.name?.substring(0, 2).toUpperCase() || 'TU'}
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-white truncate">{currentUser?.name || 'User'}</div>
                  <div className="text-[10px] text-[#C6A76A] truncate">{currentUser?.role || 'Advisor'}</div>
                </div>
              </div>
            )}

            <button
              onClick={logout}
              title="Sign Out"
              className={`p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-white/5 transition-colors cursor-pointer ${
                collapsed ? 'mx-auto' : ''
              }`}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
