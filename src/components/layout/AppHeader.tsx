import React, { useState, useRef, useEffect } from 'react';
import { useApp, DateFilterOption } from '../../context/AppContext';
import { 
  Menu, 
  Search, 
  Bell, 
  HelpCircle, 
  RefreshCw, 
  ChevronDown, 
  UserCheck, 
  Settings, 
  LogOut, 
  Database,
  ExternalLink,
  Shield,
  X,
  Clock,
  AlertTriangle
} from 'lucide-react';

interface HeaderProps {
  onMobileMenuToggle: () => void;
}

export const AppHeader: React.FC<HeaderProps> = ({ onMobileMenuToggle }) => {
  const { 
    currentUser, 
    dateFilter, 
    setDateFilter, 
    riskAlerts, 
    tasks, 
    clients, 
    holdings, 
    goals,
    navigate, 
    logout, 
    switchUser, 
    users,
    dataSources,
    isDemoMode,
    resetDemoData
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const demoRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
      if (demoRef.current && !demoRef.current.contains(event.target as Node)) {
        setDemoMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openAlerts = riskAlerts.filter(a => a.status === 'Open');
  const pendingTasks = tasks.filter(t => t.status === 'Pending');
  const unreadCount = openAlerts.length + pendingTasks.length;

  const dateFilterOptions: DateFilterOption[] = [
    'Today',
    'Last 7 days',
    'Last 30 days',
    'This quarter',
    'This financial year',
    'Custom range'
  ];

  // Global search filtering
  const searchResults = searchQuery.trim().length > 1 ? {
    clients: clients.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.city.toLowerCase().includes(searchQuery.toLowerCase())),
    holdings: holdings.filter(h => h.assetName.toLowerCase().includes(searchQuery.toLowerCase()) || h.symbol.toLowerCase().includes(searchQuery.toLowerCase())),
    goals: goals.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()))
  } : null;

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6">
      {/* Left items: Mobile toggle + Global Search */}
      <div className="flex items-center space-x-3 flex-1 max-w-lg">
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          title="Toggle Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar with Interactive Popover */}
        <div ref={searchRef} className="relative flex-1">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setSearchFocused(true); }}
              onFocus={() => setSearchFocused(true)}
              placeholder="Search clients, stocks, funds, or goals..."
              className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C6A76A] transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Dropdown */}
          {searchFocused && searchResults && (
            <div className="absolute top-11 left-0 right-0 bg-white rounded-xl shadow-xl border border-slate-200 p-3 max-h-96 overflow-y-auto z-50 text-xs">
              {/* Clients */}
              {searchResults.clients.length > 0 && (
                <div className="mb-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 px-2">Clients</div>
                  {searchResults.clients.map(c => (
                    <div
                      key={c.id}
                      onClick={() => { navigate('client-360', c.id); setSearchFocused(false); setSearchQuery(''); }}
                      className="p-2 hover:bg-[#F7F5F0] rounded cursor-pointer flex justify-between items-center"
                    >
                      <div>
                        <span className="font-semibold text-slate-900">{c.name}</span>
                        <span className="text-slate-400 text-[10px] ml-2">{c.city} • {c.category}</span>
                      </div>
                      <span className="text-[10px] text-[#147D64] font-medium">{c.riskProfile}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Holdings */}
              {searchResults.holdings.length > 0 && (
                <div className="mb-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 px-2">Holdings</div>
                  {searchResults.holdings.map(h => (
                    <div
                      key={h.id}
                      onClick={() => { navigate('holdings'); setSearchFocused(false); setSearchQuery(''); }}
                      className="p-2 hover:bg-[#F7F5F0] rounded cursor-pointer flex justify-between items-center"
                    >
                      <div>
                        <span className="font-semibold text-slate-900">{h.assetName}</span>
                        <span className="text-slate-400 text-[10px] ml-2">({h.symbol})</span>
                      </div>
                      <span className="text-[10px] font-medium text-slate-700">{h.assetClass}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Goals */}
              {searchResults.goals.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 px-2">Goals</div>
                  {searchResults.goals.map(g => (
                    <div
                      key={g.id}
                      onClick={() => { navigate('goals'); setSearchFocused(false); setSearchQuery(''); }}
                      className="p-2 hover:bg-[#F7F5F0] rounded cursor-pointer flex justify-between items-center"
                    >
                      <span className="font-semibold text-slate-900">{g.name}</span>
                      <span className="text-[10px] text-[#C6A76A] font-semibold">{g.status}</span>
                    </div>
                  ))}
                </div>
              )}

              {searchResults.clients.length === 0 && searchResults.holdings.length === 0 && searchResults.goals.length === 0 && (
                <div className="p-4 text-center text-slate-400 text-xs">
                  No matching records found for "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3">
        {/* Date Range Selector */}
        <div className="hidden sm:flex items-center space-x-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value as DateFilterOption)}
            className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer"
          >
            {dateFilterOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* Data Sync Status Strip Indicator (Advisor) */}
        {currentUser?.role !== 'Client' && (
          <div 
            onClick={() => navigate('data-hub')}
            className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-medium cursor-pointer hover:bg-emerald-100 transition-colors"
            title="Google Sheets & Excel Data Hub Status"
          >
            <span className="w-2 h-2 rounded-full bg-[#147D64] animate-pulse" />
            <span>Live Data Hub</span>
          </div>
        )}

        {/* Notifications Bell */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 relative cursor-pointer"
            title="Notifications & Alerts"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#C94C4C]" />
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 top-10 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-50 text-xs">
              <div className="flex items-center justify-between border-b pb-2 mb-3">
                <span className="font-bold text-slate-900">Notifications & Risk Alerts</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">
                  {unreadCount} Active
                </span>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {openAlerts.slice(0, 3).map(a => (
                  <div
                    key={a.id}
                    onClick={() => { navigate('risk'); setNotificationsOpen(false); }}
                    className="p-2.5 rounded-lg bg-red-50/60 border border-red-100 hover:bg-red-100/60 cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold text-red-800">
                      <span>{a.category}</span>
                      <span className="uppercase text-[9px]">{a.severity}</span>
                    </div>
                    <p className="text-[11px] text-slate-700 mt-1 line-clamp-2">{a.reason}</p>
                    <span className="text-[9px] text-slate-400 mt-1 block">Client: {a.clientName}</span>
                  </div>
                ))}

                {pendingTasks.slice(0, 2).map(t => (
                  <div
                    key={t.id}
                    onClick={() => { navigate('tasks'); setNotificationsOpen(false); }}
                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 cursor-pointer"
                  >
                    <div className="font-semibold text-slate-900">{t.title}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Due: {t.dueDate} • {t.priority} Priority</div>
                  </div>
                ))}

                {unreadCount === 0 && (
                  <div className="py-6 text-center text-slate-400">
                    All alerts resolved and tasks up to date!
                  </div>
                )}
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between">
                <button
                  onClick={() => { navigate('risk'); setNotificationsOpen(false); }}
                  className="text-[11px] font-bold text-[#147D64] hover:underline"
                >
                  View All Alerts
                </button>
                <button
                  onClick={() => { navigate('tasks'); setNotificationsOpen(false); }}
                  className="text-[11px] font-bold text-slate-600 hover:underline"
                >
                  View All Tasks
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-[#101C2C] text-[#C6A76A] flex items-center justify-center font-bold text-xs">
              {currentUser?.name?.substring(0, 2).toUpperCase() || 'TU'}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />
          </button>

          {profileMenuOpen && (
            <div className="absolute right-0 top-11 w-56 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 text-xs">
              <div className="p-2 border-b border-slate-100">
                <div className="font-bold text-slate-900 truncate">{currentUser?.name}</div>
                <div className="text-[10px] text-slate-500 truncate">{currentUser?.email}</div>
                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-bold bg-[#147D64]/10 text-[#147D64]">
                  {currentUser?.role}
                </span>
              </div>

              <div className="py-1">
                <button
                  onClick={() => { navigate('settings'); setProfileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded hover:bg-slate-100 text-slate-700 flex items-center space-x-2"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  <span>Personal Settings</span>
                </button>
                <button
                  onClick={() => { navigate('home'); setProfileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded hover:bg-slate-100 text-slate-700 flex items-center space-x-2"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  <span>Public Welcome Site</span>
                </button>
              </div>

              <div className="pt-1 border-t border-slate-100">
                <button
                  onClick={() => { logout(); setProfileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded hover:bg-red-50 text-red-600 font-semibold flex items-center space-x-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
