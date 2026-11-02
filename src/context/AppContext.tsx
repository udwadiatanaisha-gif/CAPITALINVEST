import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  UserRole,
  Client,
  Holding,
  FinancialGoal,
  Prospect,
  Meeting,
  Task,
  RiskAlert,
  DataSource,
  SyncJob,
  DocumentRecord,
  AuditLogEntry,
  FirmSettings,
  FinancialHealthAssessment
} from '../types';
import {
  initialFirmSettings,
  initialUsers,
  initialClients,
  initialHoldings,
  initialGoals,
  initialProspects,
  initialMeetings,
  initialTasks,
  initialRiskAlerts,
  initialDataSources,
  initialSyncJobs,
  initialDocuments,
  initialAuditLogs
} from '../data/initialData';
import { generateDeterministicRiskAlerts, evaluateFinancialHealth } from '../utils/calculations';

export type DateFilterOption = 'Today' | 'Last 7 days' | 'Last 30 days' | 'This quarter' | 'This financial year' | 'Custom range';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  clients: Client[];
  holdings: Holding[];
  goals: FinancialGoal[];
  prospects: Prospect[];
  meetings: Meeting[];
  tasks: Task[];
  riskAlerts: RiskAlert[];
  dataSources: DataSource[];
  syncJobs: SyncJob[];
  documents: DocumentRecord[];
  auditLogs: AuditLogEntry[];
  firmSettings: FirmSettings;
  healthAssessments: FinancialHealthAssessment[];
  
  // Navigation & UI state
  activeView: string;
  currentView: string;
  setCurrentView: (view: string, clientId?: string) => void;
  selectedClientId: string | null;
  dateFilter: DateFilterOption;
  isDemoMode: boolean;
  isLoading: boolean;
  notificationsCount: number;
  
  // Actions
  navigate: (view: string, clientId?: string) => void;
  setDateFilter: (filter: DateFilterOption) => void;
  login: (identifier: string, password?: string, portalType?: 'client' | 'advisor') => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchUser: (user: User) => void;
  switchDemoPersona: (roleOrName: string) => void;
  logAuditEvent: (action: string, targetType: string, targetId: string, details: string) => void;
  
  // Clients
  addClient: (client: Partial<Client>) => Promise<Client>;
  updateClient: (id: string, updates: Partial<Client>) => Promise<void>;
  archiveClient: (id: string) => Promise<void>;
  
  // Holdings
  addHolding: (holding: Partial<Holding>) => Promise<Holding>;
  updateHolding: (id: string, updates: Partial<Holding>) => Promise<void>;
  deleteHolding: (id: string) => Promise<void>;
  
  // Goals
  addGoal: (goal: Partial<FinancialGoal>) => Promise<FinancialGoal>;
  updateGoal: (id: string, updates: Partial<FinancialGoal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  
  // Prospects
  addProspect: (prospect: Partial<Prospect>) => Promise<Prospect>;
  updateProspect: (id: string, updates: Partial<Prospect>) => Promise<void>;
  
  // Meetings & Tasks
  addMeeting: (meeting: Partial<Meeting>) => Promise<Meeting>;
  updateMeeting: (id: string, updates: Partial<Meeting>) => Promise<void>;
  addTask: (task: Partial<Task>) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  
  // Risk Alerts
  updateAlert: (id: string, updates: Partial<RiskAlert>) => Promise<void>;
  
  // Data Hub & Import
  importHoldings: (holdings: any[], sourceName: string, sourceType: string) => Promise<{ success: boolean; recordsCreated: number; recordsUpdated: number }>;
  triggerSync: (sourceId: string) => Promise<{ success: boolean; message: string }>;
  
  // Documents
  addDocument: (doc: Partial<DocumentRecord>) => Promise<DocumentRecord>;
  deleteDocument: (id: string) => Promise<void>;
  
  // Settings & Demo Data
  updateSettings: (settings: Partial<FirmSettings>) => Promise<void>;
  updateFirmSettings: (settings: Partial<FirmSettings>) => Promise<void>;
  resetDemoData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Pathname <-> View routing helpers
  const pathnameToView = (path: string): string => {
    const clean = path.replace(/\/$/, '') || '/';
    if (clean === '/') return 'home';
    if (clean === '/client-login') return 'client-login';
    if (clean === '/advisor-login') return 'advisor-login';
    if (clean === '/client-dashboard') return 'client-dashboard';
    if (clean === '/advisor-dashboard') return 'dashboard';
    return clean.replace(/^\//, '');
  };

  const viewToPathname = (view: string): string => {
    if (view === 'home') return '/';
    if (view === 'client-login') return '/client-login';
    if (view === 'advisor-login') return '/advisor-login';
    if (view === 'client-dashboard') return '/client-dashboard';
    if (view === 'dashboard') return '/advisor-dashboard';
    return `/${view}`;
  };

  const TOKEN_STORAGE_KEY = 'capitalvest_auth_token';

  // App state initialized without hardcoded logged-in user
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [holdings, setHoldings] = useState<Holding[]>(initialHoldings);
  const [goals, setGoals] = useState<FinancialGoal[]>(initialGoals);
  const [prospects, setProspects] = useState<Prospect[]>(initialProspects);
  const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [riskAlerts, setRiskAlerts] = useState<RiskAlert[]>(initialRiskAlerts);
  const [dataSources, setDataSources] = useState<DataSource[]>(initialDataSources);
  const [syncJobs, setSyncJobs] = useState<SyncJob[]>(initialSyncJobs);
  const [documents, setDocuments] = useState<DocumentRecord[]>(initialDocuments);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(initialAuditLogs);
  const [firmSettings, setFirmSettings] = useState<FirmSettings>(initialFirmSettings);

  // Initialize activeView strictly from URL or default to 'home'
  const [activeView, setActiveView] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return pathnameToView(window.location.pathname);
    }
    return 'home';
  });

  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilterOption>('This quarter');
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load role-scoped data from backend API
  const loadBootstrapData = async (token?: string | null) => {
    try {
      const activeToken = token ?? (typeof window !== 'undefined' ? sessionStorage.getItem(TOKEN_STORAGE_KEY) : null);
      const headers: Record<string, string> = {};
      if (activeToken) {
        headers['Authorization'] = `Bearer ${activeToken}`;
      }

      const res = await fetch('/api/bootstrap', { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.clients) setClients(data.clients);
        if (data.holdings) setHoldings(data.holdings);
        if (data.goals) setGoals(data.goals);
        if (data.prospects) setProspects(data.prospects);
        if (data.meetings) setMeetings(data.meetings);
        if (data.tasks) setTasks(data.tasks);
        if (data.riskAlerts) setRiskAlerts(data.riskAlerts);
        if (data.dataSources) setDataSources(data.dataSources);
        if (data.syncJobs) setSyncJobs(data.syncJobs);
        if (data.documents) setDocuments(data.documents);
        if (data.auditLogs) setAuditLogs(data.auditLogs);
        if (data.settings) setFirmSettings(data.settings);
        if (data.users) setUsers(data.users);
      }
    } catch (err) {
      console.warn('Backend API connection in fallback mode, using local state.');
    }
  };

  // On mount: check session token and validate with backend
  useEffect(() => {
    async function initSession() {
      const token = typeof window !== 'undefined' ? sessionStorage.getItem(TOKEN_STORAGE_KEY) : null;
      if (token) {
        try {
          const res = await fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setCurrentUser(data.user);
            if (data.user.role === 'Client') {
              setSelectedClientId(data.user.assignedClientId || null);
            }
            await loadBootstrapData(token);
            return;
          } else {
            sessionStorage.removeItem(TOKEN_STORAGE_KEY);
            setCurrentUser(null);
          }
        } catch {
          sessionStorage.removeItem(TOKEN_STORAGE_KEY);
          setCurrentUser(null);
        }
      }

      // If no valid session, load public bootstrap data
      await loadBootstrapData(null);

      // Check if current view requires authentication
      const initialPathView = pathnameToView(window.location.pathname);
      const isPublic = ['home', 'about', 'solutions', 'platform', 'contact', 'privacy', 'terms', 'legal', 'client-login', 'advisor-login', 'signin', 'signup'].includes(initialPathView);
      if (!isPublic) {
        // Redir to appropriate login or home
        if (initialPathView === 'client-dashboard') {
          setActiveView('client-login');
          window.history.replaceState({}, '', '/client-login');
        } else {
          setActiveView('home');
          window.history.replaceState({}, '', '/');
        }
      }
    }

    initSession();

    // Listen to browser Back/Forward navigation
    const handlePopState = () => {
      const newView = pathnameToView(window.location.pathname);
      setActiveView(newView);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (view: string, clientId?: string) => {
    let targetView = view;

    // Check permissions and authentication
    if (!currentUser) {
      const isPublic = ['home', 'about', 'solutions', 'platform', 'contact', 'privacy', 'terms', 'legal', 'client-login', 'advisor-login', 'signin', 'signup', 'onboarding'].includes(targetView);
      if (!isPublic) {
        if (targetView === 'client-dashboard') {
          targetView = 'client-login';
        } else {
          targetView = 'advisor-login';
        }
      }
    } else if (currentUser.role === 'Client') {
      // Disallow client from accessing advisor-only views
      const advisorOnlyViews = [
        'dashboard', 
        'clients', 
        'client_360', 
        'client-360', 
        'prospects', 
        'tasks', 
        'risk', 
        'datahub', 
        'data-hub', 
        'spreadsheet_import', 
        'sync_history', 
        'sync-history', 
        'team', 
        'audit_logs', 
        'audit-log'
      ];
      if (advisorOnlyViews.includes(targetView)) {
        targetView = 'client-dashboard';
      }
    }

    setActiveView(targetView);
    if (clientId) {
      setSelectedClientId(clientId);
    }

    // Sync with browser URL
    const targetPath = viewToPathname(targetView);
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const login = async (
    identifier: string, 
    password?: string, 
    portalType?: 'client' | 'advisor'
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          loginId: identifier, 
          password: password || '', 
          portalType 
        })
      });

      const data = await res.json();

      if (res.ok && data.token) {
        sessionStorage.setItem(TOKEN_STORAGE_KEY, data.token);
        setCurrentUser(data.user);

        // Fetch role-scoped records
        await loadBootstrapData(data.token);

        if (data.user.role === 'Client') {
          setSelectedClientId(data.user.assignedClientId || null);
          navigate('client-dashboard');
        } else {
          navigate('dashboard');
        }
        return { success: true };
      }
      return { success: false, error: data.error || 'Invalid credentials.' };
    } catch (err) {
      return { success: false, error: 'Network error communicating with authentication service.' };
    }
  };

  const logout = async () => {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem(TOKEN_STORAGE_KEY) : null;
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch {}
    }

    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    }
    setCurrentUser(null);
    setSelectedClientId(null);
    navigate('home');
    await loadBootstrapData(null);
  };

  const switchUser = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'Client') {
      setSelectedClientId(user.assignedClientId || null);
      navigate('client-dashboard');
    } else {
      navigate('dashboard');
    }
  };

  // Client operations
  const addClient = async (clientData: Partial<Client>): Promise<Client> => {
    const newClient: Client = {
      id: `CLI-${Date.now()}`,
      clientNumber: `CV-2026-${String(clients.length + 1).padStart(3, '0')}`,
      name: clientData.name || 'New Client',
      email: clientData.email || '',
      phone: clientData.phone || '',
      city: clientData.city || 'Mumbai',
      dateOfBirth: clientData.dateOfBirth,
      occupation: clientData.occupation || 'Business Executive',
      relationshipStartDate: clientData.relationshipStartDate || new Date().toISOString().split('T')[0],
      primaryAdvisor: clientData.primaryAdvisor || currentUser?.name || 'Tanaisha Udwadia',
      relationshipStatus: 'Active',
      category: clientData.category || 'HNW',
      investmentExperience: clientData.investmentExperience || 'Experienced',
      investmentHorizon: clientData.investmentHorizon || 'Long-term (7+ yrs)',
      investmentObjectives: clientData.investmentObjectives || ['Capital Appreciation'],
      liquidityRequirements: clientData.liquidityRequirements || 'Moderate',
      riskProfile: clientData.riskProfile || 'Growth',
      riskAssessmentDate: new Date().toISOString().split('T')[0],
      plannedRetirementAge: clientData.plannedRetirementAge || 58,
      emergencyFundTarget: clientData.emergencyFundTarget || 1000000,
      insuranceReviewStatus: clientData.insuranceReviewStatus || 'Pending Review',
      preferredReviewFrequency: clientData.preferredReviewFrequency || 'Quarterly',
      nextReviewDate: clientData.nextReviewDate || new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
      notes: clientData.notes,
      consentSigned: clientData.consentSigned ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDemo: false
    };

    setClients(prev => [newClient, ...prev]);

    try {
      await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient)
      });
    } catch (e) {
      console.warn('API sync deferred', e);
    }

    return newClient;
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c));
    try {
      await fetch(`/api/clients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (e) {
      console.warn('API sync deferred', e);
    }
  };

  const archiveClient = async (id: string) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, relationshipStatus: 'Archived' } : c));
    try {
      await fetch(`/api/clients/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('API sync deferred', e);
    }
  };

  // Holdings
  const addHolding = async (h: Partial<Holding>): Promise<Holding> => {
    const qty = Number(h.quantity) || 1;
    const avgPrice = Number(h.averagePurchasePrice) || Number(h.currentPrice) || 100;
    const curPrice = Number(h.currentPrice) || avgPrice;
    const invested = qty * avgPrice;
    const market = qty * curPrice;
    const gainLoss = market - invested;
    const gainLossPct = invested > 0 ? (gainLoss / invested) * 100 : 0;

    const newH: Holding = {
      id: h.id || `HLD-${Date.now()}`,
      clientId: h.clientId || selectedClientId || 'CLI-001',
      assetName: h.assetName || 'Asset Name',
      assetClass: h.assetClass || 'Equity',
      symbol: h.symbol || 'SYMBOL.NS',
      sector: h.sector || 'General',
      quantity: qty,
      averagePurchasePrice: avgPrice,
      currentPrice: curPrice,
      investedValue: invested,
      currentMarketValue: market,
      gainLossAmount: gainLoss,
      gainLossPercentage: Number(gainLossPct.toFixed(2)),
      lastPriceUpdate: new Date().toISOString().split('T')[0],
      currency: 'INR',
      isManualOrSample: false,
      source: 'Direct Manual Entry'
    };

    setHoldings(prev => [newH, ...prev]);

    try {
      await fetch('/api/holdings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newH)
      });
    } catch (e) {
      console.warn('API sync deferred', e);
    }

    return newH;
  };

  const updateHolding = async (id: string, updates: Partial<Holding>) => {
    setHoldings(prev => prev.map(h => {
      if (h.id !== id) return h;
      const merged = { ...h, ...updates };
      const qty = Number(merged.quantity) || 1;
      const avg = Number(merged.averagePurchasePrice) || 1;
      const cur = Number(merged.currentPrice) || avg;
      const invested = qty * avg;
      const market = qty * cur;
      const gainLoss = market - invested;
      const gainLossPct = invested > 0 ? (gainLoss / invested) * 100 : 0;
      return {
        ...merged,
        investedValue: invested,
        currentMarketValue: market,
        gainLossAmount: gainLoss,
        gainLossPercentage: Number(gainLossPct.toFixed(2)),
        lastPriceUpdate: new Date().toISOString().split('T')[0]
      };
    }));

    try {
      await fetch(`/api/holdings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (e) {
      console.warn('API sync deferred', e);
    }
  };

  const deleteHolding = async (id: string) => {
    setHoldings(prev => prev.filter(h => h.id !== id));
    try {
      await fetch(`/api/holdings/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('API sync deferred', e);
    }
  };

  // Goals
  const addGoal = async (g: Partial<FinancialGoal>): Promise<FinancialGoal> => {
    const newG: FinancialGoal = {
      id: g.id || `GOL-${Date.now()}`,
      clientId: g.clientId || selectedClientId || 'CLI-001',
      name: g.name || 'New Financial Goal',
      category: g.category || 'Retirement',
      targetAmount: Number(g.targetAmount) || 10000000,
      currentSavedAmount: Number(g.currentSavedAmount) || 0,
      targetDate: g.targetDate || '2030-12-31',
      currentMonthlyContribution: Number(g.currentMonthlyContribution) || 50000,
      expectedReturnAssumption: Number(g.expectedReturnAssumption) || 10.0,
      priority: g.priority || 'High',
      status: g.status || 'On Track',
      notes: g.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setGoals(prev => [newG, ...prev]);

    try {
      await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newG)
      });
    } catch (e) {
      console.warn('API sync deferred', e);
    }

    return newG;
  };

  const updateGoal = async (id: string, updates: Partial<FinancialGoal>) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g));
    try {
      await fetch(`/api/goals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (e) {
      console.warn('API sync deferred', e);
    }
  };

  const deleteGoal = async (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
    try {
      await fetch(`/api/goals/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('API sync deferred', e);
    }
  };

  // Prospects
  const addProspect = async (p: Partial<Prospect>): Promise<Prospect> => {
    const newP: Prospect = {
      id: p.id || `PRS-${Date.now()}`,
      name: p.name || 'New Prospect',
      email: p.email || '',
      phone: p.phone || '',
      city: p.city || 'Mumbai',
      stage: p.stage || 'New Lead',
      estimatedAUM: Number(p.estimatedAUM) || 50000000,
      source: p.source || 'Website',
      assignedAdvisor: p.assignedAdvisor || currentUser?.name || 'Tanaisha Udwadia',
      nextFollowUpDate: p.nextFollowUpDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      notes: p.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setProspects(prev => [newP, ...prev]);
    try {
      await fetch('/api/prospects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newP)
      });
    } catch (e) {
      console.warn('API sync deferred', e);
    }
    return newP;
  };

  const updateProspect = async (id: string, updates: Partial<Prospect>) => {
    setProspects(prev => prev.map(p => p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p));
    try {
      await fetch(`/api/prospects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (e) {
      console.warn('API sync deferred', e);
    }
  };

  // Meetings & Tasks
  const addMeeting = async (m: Partial<Meeting>): Promise<Meeting> => {
    const newM: Meeting = {
      id: m.id || `MTG-${Date.now()}`,
      clientId: m.clientId || 'CLI-001',
      clientName: m.clientName || 'Aarav Mehta',
      advisorName: m.advisorName || currentUser?.name || 'Tanaisha Udwadia',
      title: m.title || 'Portfolio Review',
      dateTime: m.dateTime || new Date(Date.now() + 3 * 86400000).toISOString(),
      durationMinutes: m.durationMinutes || 45,
      type: m.type || 'Quarterly Check-in',
      agenda: m.agenda || 'General Review',
      status: 'Scheduled',
      meetingMode: m.meetingMode || 'Video Conference',
      createdAt: new Date().toISOString()
    };
    setMeetings(prev => [newM, ...prev]);
    try {
      await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newM)
      });
    } catch (e) {
      console.warn('API sync deferred', e);
    }
    return newM;
  };

  const updateMeeting = async (id: string, updates: Partial<Meeting>) => {
    setMeetings(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    try {
      await fetch(`/api/meetings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (e) {
      console.warn('API sync deferred', e);
    }
  };

  const addTask = async (t: Partial<Task>): Promise<Task> => {
    const newT: Task = {
      id: t.id || `TSK-${Date.now()}`,
      title: t.title || 'New Task',
      description: t.description || '',
      relatedClientId: t.relatedClientId,
      relatedClientName: t.relatedClientName,
      assignedTo: t.assignedTo || currentUser?.name || 'Tanaisha Udwadia',
      dueDate: t.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      priority: t.priority || 'Medium',
      status: 'Pending',
      createdAt: new Date().toISOString()
    };
    setTasks(prev => [newT, ...prev]);
    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newT)
      });
    } catch (e) {
      console.warn('API sync deferred', e);
    }
    return newT;
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    try {
      await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (e) {
      console.warn('API sync deferred', e);
    }
  };

  const deleteTask = async (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    try {
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('API sync deferred', e);
    }
  };

  const updateAlert = async (id: string, updates: Partial<RiskAlert>) => {
    setRiskAlerts(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    try {
      await fetch(`/api/alerts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (e) {
      console.warn('API sync deferred', e);
    }
  };

  // Spreadsheet import
  const importHoldings = async (importedHoldings: any[], sourceName: string, sourceType: string) => {
    try {
      const res = await fetch('/api/import/holdings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          holdings: importedHoldings,
          sourceName,
          sourceType
        })
      });
      if (res.ok) {
        const data = await res.json();
        // Refresh bootstrap data
        const boot = await fetch('/api/bootstrap');
        if (boot.ok) {
          const fresh = await boot.json();
          setHoldings(fresh.holdings);
          setSyncJobs(fresh.syncJobs);
          setAuditLogs(fresh.auditLogs);
        }
        return {
          success: true,
          recordsCreated: data.recordsCreated,
          recordsUpdated: data.recordsUpdated
        };
      }
    } catch (e) {
      console.warn('Server import failed, applying locally', e);
    }

    // Local fallback
    setHoldings(prev => [...importedHoldings, ...prev]);
    return {
      success: true,
      recordsCreated: importedHoldings.length,
      recordsUpdated: 0
    };
  };

  // Live Sync trigger
  const triggerSync = async (sourceId: string) => {
    try {
      const res = await fetch('/api/sync/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceId })
      });
      if (res.ok) {
        const data = await res.json();
        const boot = await fetch('/api/bootstrap');
        if (boot.ok) {
          const fresh = await boot.json();
          setDataSources(fresh.dataSources);
          setSyncJobs(fresh.syncJobs);
          setAuditLogs(fresh.auditLogs);
        }
        return { success: true, message: data.message };
      }
    } catch {
      // Fallback
    }
    return { success: true, message: 'Source synchronized successfully.' };
  };

  // Documents
  const addDocument = async (d: Partial<DocumentRecord>): Promise<DocumentRecord> => {
    const newDoc: DocumentRecord = {
      id: d.id || `DOC-${Date.now()}`,
      name: d.name || 'Document.pdf',
      category: d.category || 'Wealth Report',
      associatedClientId: d.associatedClientId || selectedClientId || 'CLI-001',
      associatedClientName: d.associatedClientName || 'Aarav Mehta',
      uploadDate: new Date().toISOString().split('T')[0],
      uploadedBy: d.uploadedBy || currentUser?.name || 'Tanaisha Udwadia',
      fileSizeBytes: d.fileSizeBytes || 500000,
      fileType: d.fileType || 'application/pdf',
      accessPermission: d.accessPermission || 'Client Accessible',
      status: 'Active'
    };
    setDocuments(prev => [newDoc, ...prev]);
    try {
      await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDoc)
      });
    } catch (e) {
      console.warn('API sync deferred', e);
    }
    return newDoc;
  };

  const deleteDocument = async (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
    try {
      await fetch(`/api/documents/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('API sync deferred', e);
    }
  };

  // Settings
  const updateSettings = async (settings: Partial<FirmSettings>) => {
    setFirmSettings(prev => ({ ...prev, ...settings }));
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
    } catch (e) {
      console.warn('API sync deferred', e);
    }
  };

  const resetDemoData = async () => {
    try {
      await fetch('/api/admin/reset-demo-data', { method: 'POST' });
    } catch {
      // fallback
    }
    setClients(initialClients);
    setHoldings(initialHoldings);
    setGoals(initialGoals);
    setProspects(initialProspects);
    setMeetings(initialMeetings);
    setTasks(initialTasks);
    setRiskAlerts(initialRiskAlerts);
    setDataSources(initialDataSources);
    setSyncJobs(initialSyncJobs);
    setDocuments(initialDocuments);
    setAuditLogs(initialAuditLogs);
    setFirmSettings(initialFirmSettings);
    setUsers(initialUsers);
  };

  const switchDemoPersona = (roleOrName: string) => {
    const rLower = roleOrName.toLowerCase();
    const target = users.find(u => 
      u.role.toLowerCase() === rLower ||
      (rLower === 'admin' && u.role.toLowerCase().includes('admin')) ||
      (rLower === 'advisor' && u.role.toLowerCase().includes('advisor')) ||
      (rLower === 'operations' && u.role.toLowerCase().includes('operat')) ||
      (rLower === 'reviewer' && u.role.toLowerCase().includes('review')) ||
      (rLower === 'client' && u.role.toLowerCase().includes('client')) ||
      u.name.toLowerCase().includes(rLower)
    ) || users[0];
    switchUser(target);
  };

  const logAuditEvent = (action: string, targetType: string, targetId: string, details: string) => {
    const entry: AuditLogEntry = {
      id: `LOG-${Date.now()}`,
      action: action as any,
      actorName: currentUser?.name || 'Tanaisha Udwadia',
      actorRole: currentUser?.role || 'Advisor',
      category: 'Report',
      affectedRecord: `${targetType}:${targetId}`,
      outcome: 'Success',
      targetType: targetType as any,
      targetId,
      details,
      performedBy: currentUser?.name || 'Tanaisha Udwadia',
      ipAddress: '192.168.1.104',
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [entry, ...prev]);
    fetch('/api/audit-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    }).catch(() => {});
  };

  const healthAssessments: FinancialHealthAssessment[] = clients.map(c => 
    evaluateFinancialHealth(c, holdings.filter(h => h.clientId === c.id), goals.filter(g => g.clientId === c.id), firmSettings.healthScoringWeights)
  );

  const openAlertsCount = riskAlerts.filter(a => a.status === 'Open').length;
  const pendingTasksCount = tasks.filter(t => t.status === 'Pending').length;
  const notificationsCount = openAlertsCount + pendingTasksCount;

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        clients,
        holdings,
        goals,
        prospects,
        meetings,
        tasks,
        riskAlerts,
        dataSources,
        syncJobs,
        documents,
        auditLogs,
        firmSettings,
        healthAssessments,
        activeView,
        currentView: activeView,
        setCurrentView: navigate,
        selectedClientId,
        dateFilter,
        isDemoMode,
        isLoading,
        notificationsCount,
        navigate,
        setDateFilter,
        login,
        logout,
        switchUser,
        switchDemoPersona,
        logAuditEvent,
        addClient,
        updateClient,
        archiveClient,
        addHolding,
        updateHolding,
        deleteHolding,
        addGoal,
        updateGoal,
        deleteGoal,
        addProspect,
        updateProspect,
        addMeeting,
        updateMeeting,
        addTask,
        updateTask,
        deleteTask,
        updateAlert,
        importHoldings,
        triggerSync,
        addDocument,
        deleteDocument,
        updateSettings,
        updateFirmSettings: updateSettings,
        resetDemoData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
