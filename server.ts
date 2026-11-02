import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

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
} from './src/data/initialData.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'capitalvest-db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Cryptographic password utilities (scrypt)
function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const generatedSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, generatedSalt, 64).toString('hex');
  return { hash, salt: generatedSalt };
}

function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const calculated = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(calculated, 'hex'), Buffer.from(hash, 'hex'));
  } catch {
    return false;
  }
}

// In-memory active session store
interface SessionData {
  userId: string;
  role: string;
  assignedClientId?: string;
  createdAt: number;
}
const activeSessions = new Map<string, SessionData>();

// In-memory + persisted database
interface DBState {
  users: typeof initialUsers;
  clients: typeof initialClients;
  holdings: typeof initialHoldings;
  goals: typeof initialGoals;
  prospects: typeof initialProspects;
  meetings: typeof initialMeetings;
  tasks: typeof initialTasks;
  riskAlerts: typeof initialRiskAlerts;
  dataSources: typeof initialDataSources;
  syncJobs: typeof initialSyncJobs;
  documents: typeof initialDocuments;
  auditLogs: typeof initialAuditLogs;
  settings: typeof initialFirmSettings;
}

function loadInitialState(): DBState {
  return {
    users: JSON.parse(JSON.stringify(initialUsers)),
    clients: JSON.parse(JSON.stringify(initialClients)),
    holdings: JSON.parse(JSON.stringify(initialHoldings)),
    goals: JSON.parse(JSON.stringify(initialGoals)),
    prospects: JSON.parse(JSON.stringify(initialProspects)),
    meetings: JSON.parse(JSON.stringify(initialMeetings)),
    tasks: JSON.parse(JSON.stringify(initialTasks)),
    riskAlerts: JSON.parse(JSON.stringify(initialRiskAlerts)),
    dataSources: JSON.parse(JSON.stringify(initialDataSources)),
    syncJobs: JSON.parse(JSON.stringify(initialSyncJobs)),
    documents: JSON.parse(JSON.stringify(initialDocuments)),
    auditLogs: JSON.parse(JSON.stringify(initialAuditLogs)),
    settings: JSON.parse(JSON.stringify(initialFirmSettings))
  };
}

// Ensure every client has an authenticated user account and every user has a secure hashed password
function ensureDatabaseCredentials(db: DBState) {
  const defaultCredentials: Record<string, string> = {
    'tanaisha.udwadia@capitalvest.in': 'Advisor@Capital2026',
    'karan.malhotra@capitalvest.in': 'Admin@Capital2026',
    'rajesh.kulkarni@capitalvest.in': 'Ops@Capital2026',
    'preeti.s@capitalvest.in': 'Review@Capital2026',
    'aarav.mehta@zenithventures.in': 'Client@Capital2026',
    'ananya.shah@gmail.com': 'Client@Capital2026',
    'dr.desai@cardioheart.org': 'Client@Capital2026',
    'meera.p@pateltextiles.co.in': 'Client@Capital2026',
    'kavya.joshi@joshilegal.in': 'Client@Capital2026',
    'arjun@trivediventures.com': 'Client@Capital2026',
    'nisha@iyerdesignstudio.com': 'Client@Capital2026',
    'vivaan.shah@apexconsultancy.in': 'Client@Capital2026'
  };

  // Ensure all clients have a linked user account
  db.clients.forEach(c => {
    let u = db.users.find(usr => usr.assignedClientId === c.id || usr.email.toLowerCase() === c.email.toLowerCase());
    if (!u) {
      u = {
        id: `USR-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: c.name,
        email: c.email,
        role: 'Client',
        assignedClientId: c.id,
        clientNumber: c.clientNumber,
        phone: c.phone,
        createdAt: new Date().toISOString(),
        isProvisioned: true
      };
      db.users.push(u);
    } else {
      u.assignedClientId = c.id;
      u.clientNumber = c.clientNumber;
      u.isProvisioned = true;
    }
  });

  // Ensure every user has a salted scrypt passwordHash
  db.users.forEach(u => {
    if (!u.passwordHash || !u.salt) {
      const defaultPw = defaultCredentials[u.email.toLowerCase()] || 
        (u.role === 'Client' ? 'Client@Capital2026' : 'Advisor@Capital2026');
      const { hash, salt } = hashPassword(defaultPw);
      u.passwordHash = hash;
      u.salt = salt;
      u.isProvisioned = true;
    }
  });
}

let dbState: DBState;

try {
  if (fs.existsSync(DB_FILE)) {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    dbState = JSON.parse(raw);
    console.log('CapitalVest database successfully loaded from storage.');
  } else {
    dbState = loadInitialState();
    console.log('CapitalVest database initialized with initial data.');
  }
} catch (err) {
  console.error('Error loading DB file, fallback to initial state:', err);
  dbState = loadInitialState();
}

// Apply credential provisioning and persist
ensureDatabaseCredentials(dbState);
persistDB();

function persistDB() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(dbState, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist DB to disk:', err);
  }
}

function addAuditLog(actorName: string, actorRole: any, action: string, category: any, affectedRecord: string, outcome: 'Success' | 'Warning' | 'Denied' | 'Failed' = 'Success', details?: string) {
  const newLog = {
    id: `LOG-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actorName,
    actorRole,
    action,
    category,
    affectedRecord,
    outcome,
    details
  };
  dbState.auditLogs.unshift(newLog);
  persistDB();
}

function getAuthenticatedUser(req: express.Request): any | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.substring(7);
  const session = activeSessions.get(token);
  if (!session) return null;
  const user = dbState.users.find(u => u.id === session.userId);
  return user || null;
}

function sanitizeUser(u: any) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    assignedClientId: u.assignedClientId,
    clientNumber: u.clientNumber,
    phone: u.phone,
    createdAt: u.createdAt,
    lastLogin: u.lastLogin,
    isProvisioned: !!u.passwordHash
  };
}

async function startServer() {
  const app = express();

  // Generous limit for spreadsheet parsing & document uploads
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // API Endpoints
  const apiRouter = express.Router();

  // Status & Health
  apiRouter.get('/status', (req, res) => {
    res.json({
      status: 'online',
      platform: 'CapitalVest Wealth Management Command Centre',
      time: new Date().toISOString(),
      timezone: 'Asia/Kolkata',
      currency: 'INR',
      records: {
        clients: dbState.clients.length,
        holdings: dbState.holdings.length,
        goals: dbState.goals.length,
        prospects: dbState.prospects.length
      }
    });
  });

  // Bootstrap app state with role-based partitioning
  apiRouter.get('/bootstrap', (req, res) => {
    const user = getAuthenticatedUser(req);

    // If client is authenticated: return ONLY their private dossier
    if (user && user.role?.toLowerCase() === 'client') {
      const client = dbState.clients.find(c => c.id === user.assignedClientId);
      const clientHoldings = dbState.holdings.filter(h => h.clientId === user.assignedClientId);
      const clientGoals = dbState.goals.filter(g => g.clientId === user.assignedClientId);
      const clientMeetings = dbState.meetings.filter(m => m.clientId === user.assignedClientId);
      const clientDocs = dbState.documents.filter(d => d.associatedClientId === user.assignedClientId);

      return res.json({
        users: [sanitizeUser(user)],
        clients: client ? [client] : [],
        holdings: clientHoldings,
        goals: clientGoals,
        meetings: clientMeetings,
        documents: clientDocs,
        prospects: [],
        tasks: [],
        riskAlerts: [],
        dataSources: [],
        syncJobs: [],
        auditLogs: [],
        settings: dbState.settings
      });
    }

    // If unauthenticated public visitor: return public configuration only
    if (!user) {
      return res.json({
        settings: dbState.settings,
        clients: [],
        holdings: [],
        goals: [],
        prospects: [],
        meetings: [],
        tasks: [],
        riskAlerts: [],
        dataSources: [],
        syncJobs: [],
        documents: [],
        auditLogs: [],
        users: []
      });
    }

    // Fiduciary Advisor / Administrator / Operations
    res.json({
      ...dbState,
      users: dbState.users.map(sanitizeUser)
    });
  });

  // Auth: Verify current session token
  apiRouter.get('/auth/me', (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Session expired or unauthenticated.' });
    }
    res.json({ user: sanitizeUser(user) });
  });

  // Auth: Login with password verification & role validation
  apiRouter.post('/auth/login', (req, res) => {
    const { loginId, email, password, portalType } = req.body;
    const identifier = (loginId || email || '').trim().toLowerCase();

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Please enter your email address (or Client ID) and password.' });
    }

    // Match against email OR clientNumber (e.g. CV-2025-001) OR user ID OR advisor aliases
    const user = dbState.users.find(u => 
      u.email.toLowerCase() === identifier || 
      (u.clientNumber && u.clientNumber.toLowerCase() === identifier) ||
      u.id.toLowerCase() === identifier ||
      (u.id === 'USR-001' && (
        identifier === 'tanaisha@capitalvest.com' || 
        identifier === 'tanaisha.udwadia@capitalvest.in' || 
        identifier === 'udwadiatanaisha@gmail.com' ||
        identifier === 'tanaisha'
      ))
    );

    if (!user) {
      return res.status(401).json({ error: 'No account registered with this email or Client ID.' });
    }

    // Role-specific portal validation
    const isClientUser = user.role?.toLowerCase() === 'client';
    if (portalType === 'client' && !isClientUser) {
      return res.status(401).json({ 
        error: 'This account has Advisor / Administrator privileges. Please sign in via the Advisor Login page.' 
      });
    }
    if (portalType === 'advisor' && isClientUser) {
      return res.status(401).json({ 
        error: 'This account is a Client account. Please sign in via the Client Portal Login page.' 
      });
    }

    // Password validation using scrypt
    let isValid = false;
    if (user.passwordHash && user.salt) {
      isValid = verifyPassword(password, user.passwordHash, user.salt);
    } else {
      // Fallback check
      isValid = password === 'Client@Capital2026' || password === 'Advisor@Capital2026';
    }

    if (!isValid) {
      addAuditLog(user.name, user.role, 'Failed Sign In Attempt', 'Auth', identifier, 'Denied', 'Incorrect password entered');
      return res.status(401).json({ error: 'Incorrect password. Please verify your credentials or contact your advisor.' });
    }

    user.lastLogin = new Date().toISOString();
    persistDB();

    const token = `token-${user.id}-${crypto.randomBytes(24).toString('hex')}`;
    activeSessions.set(token, {
      userId: user.id,
      role: user.role,
      assignedClientId: user.assignedClientId,
      createdAt: Date.now()
    });

    addAuditLog(user.name, user.role, 'User Sign In', 'Auth', user.email, 'Success');

    res.json({
      token,
      user: sanitizeUser(user)
    });
  });

  // Auth: Logout
  apiRouter.post('/auth/logout', (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const session = activeSessions.get(token);
      if (session) {
        const user = dbState.users.find(u => u.id === session.userId);
        if (user) {
          addAuditLog(user.name, user.role, 'User Sign Out', 'Auth', user.email, 'Success');
        }
        activeSessions.delete(token);
      }
    }
    res.json({ success: true, message: 'Signed out successfully' });
  });

  // Admin / Advisor: Get Client Account Provisioning Status
  apiRouter.get('/admin/client-accounts', (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user || user.role?.toLowerCase() === 'client') {
      return res.status(403).json({ error: 'Access denied: Advisor privileges required.' });
    }

    const accounts = dbState.clients.map(c => {
      const u = dbState.users.find(usr => usr.assignedClientId === c.id || usr.email.toLowerCase() === c.email.toLowerCase());
      return {
        clientId: c.id,
        clientNumber: c.clientNumber,
        clientName: c.name,
        email: c.email,
        phone: c.phone,
        isProvisioned: !!(u && u.passwordHash),
        lastLogin: u?.lastLogin || 'Never',
        userId: u?.id
      };
    });

    res.json(accounts);
  });

  // Admin / Advisor: Provision or Reset Client Account Credentials
  apiRouter.post('/admin/provision-client-account', (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user || user.role?.toLowerCase() === 'client') {
      return res.status(403).json({ error: 'Access denied: Advisor privileges required.' });
    }

    const { clientId, temporaryPassword } = req.body;
    const client = dbState.clients.find(c => c.id === clientId);
    if (!client) {
      return res.status(404).json({ error: 'Client not found.' });
    }

    const tempPassword = temporaryPassword || `CV@${Math.floor(100000 + Math.random() * 900000)}`;
    const { hash, salt } = hashPassword(tempPassword);

    let clientUser = dbState.users.find(u => u.assignedClientId === clientId || u.email.toLowerCase() === client.email.toLowerCase());

    if (clientUser) {
      clientUser.passwordHash = hash;
      clientUser.salt = salt;
      clientUser.assignedClientId = client.id;
      clientUser.clientNumber = client.clientNumber;
      clientUser.isProvisioned = true;
    } else {
      clientUser = {
        id: `USR-${Date.now()}`,
        name: client.name,
        email: client.email,
        role: 'Client',
        assignedClientId: client.id,
        clientNumber: client.clientNumber,
        phone: client.phone,
        createdAt: new Date().toISOString(),
        passwordHash: hash,
        salt: salt,
        isProvisioned: true
      };
      dbState.users.push(clientUser);
    }

    persistDB();
    addAuditLog(user.name, user.role, 'Provisioned Client Portal Account', 'Auth', `${client.name} (${client.clientNumber})`, 'Success', `Issued temporary password`);

    res.json({
      success: true,
      message: `Portal account successfully provisioned for ${client.name}.`,
      clientNumber: client.clientNumber,
      email: client.email,
      temporaryPassword: tempPassword
    });
  });

  // Clients endpoint with server-level access enforcement
  apiRouter.get('/clients', (req, res) => {
    const user = getAuthenticatedUser(req);
    if (user && user.role?.toLowerCase() === 'client') {
      const client = dbState.clients.find(c => c.id === user.assignedClientId);
      return res.json(client ? [client] : []);
    }
    res.json(dbState.clients);
  });

  apiRouter.get('/clients/:id', (req, res) => {
    const { id } = req.params;
    const user = getAuthenticatedUser(req);
    if (user && user.role?.toLowerCase() === 'client' && user.assignedClientId !== id) {
      return res.status(403).json({ error: 'Access denied: You are not authorized to view another client\'s profile.' });
    }
    const client = dbState.clients.find(c => c.id === id);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json(client);
  });

  apiRouter.post('/clients', (req, res) => {
    const user = getAuthenticatedUser(req);
    if (user && user.role?.toLowerCase() === 'client') {
      return res.status(403).json({ error: 'Clients cannot create client records.' });
    }

    const clientData = req.body;
    if (!clientData.name || !clientData.email) {
      return res.status(400).json({ error: 'Client name and email are required' });
    }

    const newClient = {
      ...clientData,
      id: clientData.id || `CLI-${Date.now()}`,
      clientNumber: clientData.clientNumber || `CV-2026-${String(dbState.clients.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDemo: false
    };

    dbState.clients.push(newClient);

    // Auto-provision portal credentials for new client
    const defaultPw = 'Client@Capital2026';
    const { hash, salt } = hashPassword(defaultPw);
    const newClientUser = {
      id: `USR-${Date.now()}`,
      name: newClient.name,
      email: newClient.email,
      role: 'Client' as const,
      assignedClientId: newClient.id,
      clientNumber: newClient.clientNumber,
      phone: newClient.phone,
      createdAt: new Date().toISOString(),
      passwordHash: hash,
      salt: salt,
      isProvisioned: true
    };
    dbState.users.push(newClientUser);

    persistDB();
    addAuditLog('Tanaisha Udwadia', 'Advisor', 'Created Client Record', 'Client Record', newClient.name, 'Success');
    res.status(201).json(newClient);
  });

  apiRouter.put('/clients/:id', (req, res) => {
    const { id } = req.params;
    const user = getAuthenticatedUser(req);
    if (user && user.role?.toLowerCase() === 'client' && user.assignedClientId !== id) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const index = dbState.clients.findIndex(c => c.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Client not found' });
    }

    dbState.clients[index] = {
      ...dbState.clients[index],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    persistDB();

    addAuditLog('Tanaisha Udwadia', 'Advisor', 'Updated Client Profile', 'Client Record', dbState.clients[index].name, 'Success');
    res.json(dbState.clients[index]);
  });

  apiRouter.delete('/clients/:id', (req, res) => {
    const user = getAuthenticatedUser(req);
    if (user && user.role?.toLowerCase() === 'client') {
      return res.status(403).json({ error: 'Clients cannot archive client records.' });
    }

    const { id } = req.params;
    const client = dbState.clients.find(c => c.id === id);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    client.relationshipStatus = 'Archived';
    persistDB();

    addAuditLog('Tanaisha Udwadia', 'Advisor', 'Archived Client Record', 'Client Record', client.name, 'Success');
    res.json({ success: true, message: `Client ${client.name} archived successfully.` });
  });

  // Holdings with client isolation
  apiRouter.get('/holdings', (req, res) => {
    const user = getAuthenticatedUser(req);
    if (user && user.role?.toLowerCase() === 'client') {
      return res.json(dbState.holdings.filter(h => h.clientId === user.assignedClientId));
    }
    const { clientId } = req.query;
    if (clientId) {
      return res.json(dbState.holdings.filter(h => h.clientId === clientId));
    }
    res.json(dbState.holdings);
  });

  apiRouter.post('/holdings', (req, res) => {
    const user = getAuthenticatedUser(req);
    if (user && user.role?.toLowerCase() === 'client') {
      return res.status(403).json({ error: 'Clients cannot create holding positions.' });
    }

    const h = req.body;
    if (!h.clientId || !h.assetName || !h.quantity || !h.currentPrice) {
      return res.status(400).json({ error: 'Missing required holding parameters' });
    }

    const investedValue = h.quantity * (h.averagePurchasePrice || h.currentPrice);
    const currentMarketValue = h.quantity * h.currentPrice;
    const gainLossAmount = currentMarketValue - investedValue;
    const gainLossPercentage = investedValue > 0 ? (gainLossAmount / investedValue) * 100 : 0;

    const newHolding = {
      ...h,
      id: h.id || `HLD-${Date.now()}`,
      investedValue,
      currentMarketValue,
      gainLossAmount,
      gainLossPercentage: Number(gainLossPercentage.toFixed(2)),
      lastPriceUpdate: new Date().toISOString().split('T')[0],
      currency: 'INR'
    };

    dbState.holdings.push(newHolding);
    persistDB();

    addAuditLog('Tanaisha Udwadia', 'Advisor', 'Added Holding Position', 'Portfolio', `${newHolding.assetName} (₹${currentMarketValue})`, 'Success');
    res.status(201).json(newHolding);
  });

  apiRouter.put('/holdings/:id', (req, res) => {
    const user = getAuthenticatedUser(req);
    if (user && user.role?.toLowerCase() === 'client') {
      return res.status(403).json({ error: 'Clients cannot update holding positions.' });
    }

    const { id } = req.params;
    const index = dbState.holdings.findIndex(h => h.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Holding not found' });
    }

    const merged = { ...dbState.holdings[index], ...req.body };
    const investedValue = merged.quantity * merged.averagePurchasePrice;
    const currentMarketValue = merged.quantity * merged.currentPrice;
    const gainLossAmount = currentMarketValue - investedValue;
    const gainLossPercentage = investedValue > 0 ? (gainLossAmount / investedValue) * 100 : 0;

    dbState.holdings[index] = {
      ...merged,
      investedValue,
      currentMarketValue,
      gainLossAmount,
      gainLossPercentage: Number(gainLossPercentage.toFixed(2)),
      lastPriceUpdate: new Date().toISOString().split('T')[0]
    };
    persistDB();

    addAuditLog('Tanaisha Udwadia', 'Advisor', 'Updated Holding Position', 'Portfolio', `${dbState.holdings[index].assetName}`, 'Success');
    res.json(dbState.holdings[index]);
  });

  apiRouter.delete('/holdings/:id', (req, res) => {
    const user = getAuthenticatedUser(req);
    if (user && user.role?.toLowerCase() === 'client') {
      return res.status(403).json({ error: 'Clients cannot delete holding positions.' });
    }

    const { id } = req.params;
    const idx = dbState.holdings.findIndex(h => h.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Holding not found' });
    }

    const removed = dbState.holdings.splice(idx, 1)[0];
    persistDB();

    addAuditLog('Tanaisha Udwadia', 'Advisor', 'Removed Holding Position', 'Portfolio', removed.assetName, 'Success');
    res.json({ success: true, removed });
  });

  // Goals with client isolation
  apiRouter.get('/goals', (req, res) => {
    const user = getAuthenticatedUser(req);
    if (user && user.role?.toLowerCase() === 'client') {
      return res.json(dbState.goals.filter(g => g.clientId === user.assignedClientId));
    }
    const { clientId } = req.query;
    if (clientId) {
      return res.json(dbState.goals.filter(g => g.clientId === clientId));
    }
    res.json(dbState.goals);
  });

  apiRouter.post('/goals', (req, res) => {
    const g = req.body;
    const newGoal = {
      ...g,
      id: g.id || `GOL-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    dbState.goals.push(newGoal);
    persistDB();

    addAuditLog('Tanaisha Udwadia', 'Advisor', 'Created Financial Goal', 'Goal', newGoal.name, 'Success');
    res.status(201).json(newGoal);
  });

  apiRouter.put('/goals/:id', (req, res) => {
    const { id } = req.params;
    const idx = dbState.goals.findIndex(g => g.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    dbState.goals[idx] = {
      ...dbState.goals[idx],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    persistDB();

    addAuditLog('Tanaisha Udwadia', 'Advisor', 'Updated Financial Goal', 'Goal', dbState.goals[idx].name, 'Success');
    res.json(dbState.goals[idx]);
  });

  apiRouter.delete('/goals/:id', (req, res) => {
    const { id } = req.params;
    const idx = dbState.goals.findIndex(g => g.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    const removed = dbState.goals.splice(idx, 1)[0];
    persistDB();

    addAuditLog('Tanaisha Udwadia', 'Advisor', 'Archived Financial Goal', 'Goal', removed.name, 'Success');
    res.json({ success: true, removed });
  });

  // Prospects (Advisor only)
  apiRouter.get('/prospects', (req, res) => {
    const user = getAuthenticatedUser(req);
    if (user && user.role?.toLowerCase() === 'client') {
      return res.status(403).json({ error: 'Access denied: Client cannot view prospect pipeline.' });
    }
    res.json(dbState.prospects);
  });

  apiRouter.post('/prospects', (req, res) => {
    const user = getAuthenticatedUser(req);
    if (user && user.role?.toLowerCase() === 'client') {
      return res.status(403).json({ error: 'Access denied.' });
    }
    const p = req.body;
    const newProspect = {
      ...p,
      id: p.id || `PRS-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    dbState.prospects.push(newProspect);
    persistDB();

    addAuditLog('Tanaisha Udwadia', 'Advisor', 'Added New Prospect', 'Client Record', newProspect.name, 'Success');
    res.status(201).json(newProspect);
  });

  apiRouter.put('/prospects/:id', (req, res) => {
    const user = getAuthenticatedUser(req);
    if (user && user.role?.toLowerCase() === 'client') {
      return res.status(403).json({ error: 'Access denied.' });
    }
    const { id } = req.params;
    const idx = dbState.prospects.findIndex(p => p.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Prospect not found' });
    }

    dbState.prospects[idx] = {
      ...dbState.prospects[idx],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    persistDB();

    addAuditLog('Tanaisha Udwadia', 'Advisor', 'Updated Prospect Stage', 'Client Record', `${dbState.prospects[idx].name} -> ${dbState.prospects[idx].stage}`, 'Success');
    res.json(dbState.prospects[idx]);
  });

  // Meetings
  apiRouter.get('/meetings', (req, res) => {
    const user = getAuthenticatedUser(req);
    if (user && user.role?.toLowerCase() === 'client') {
      return res.json(dbState.meetings.filter(m => m.clientId === user.assignedClientId));
    }
    res.json(dbState.meetings);
  });

  apiRouter.post('/meetings', (req, res) => {
    const m = req.body;
    const newMeeting = {
      ...m,
      id: m.id || `MTG-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    dbState.meetings.push(newMeeting);
    persistDB();

    addAuditLog('Tanaisha Udwadia', 'Advisor', 'Scheduled Client Meeting', 'Client Record', `${newMeeting.title} with ${newMeeting.clientName}`, 'Success');
    res.status(201).json(newMeeting);
  });

  apiRouter.put('/meetings/:id', (req, res) => {
    const { id } = req.params;
    const idx = dbState.meetings.findIndex(m => m.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    dbState.meetings[idx] = { ...dbState.meetings[idx], ...req.body };
    persistDB();

    addAuditLog('Tanaisha Udwadia', 'Advisor', 'Updated Meeting Status', 'Client Record', `${dbState.meetings[idx].title} (${dbState.meetings[idx].status})`, 'Success');
    res.json(dbState.meetings[idx]);
  });

  // Tasks
  apiRouter.get('/tasks', (req, res) => {
    const user = getAuthenticatedUser(req);
    if (user && user.role?.toLowerCase() === 'client') {
      return res.json([]);
    }
    res.json(dbState.tasks);
  });

  apiRouter.post('/tasks', (req, res) => {
    const t = req.body;
    const newTask = {
      ...t,
      id: t.id || `TSK-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    dbState.tasks.push(newTask);
    persistDB();

    addAuditLog('Tanaisha Udwadia', 'Advisor', 'Created Operational Task', 'Client Record', newTask.title, 'Success');
    res.status(201).json(newTask);
  });

  apiRouter.put('/tasks/:id', (req, res) => {
    const { id } = req.params;
    const idx = dbState.tasks.findIndex(t => t.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }

    dbState.tasks[idx] = { ...dbState.tasks[idx], ...req.body };
    persistDB();

    addAuditLog('Rajesh Kulkarni', 'Operations', 'Updated Task Status', 'Client Record', `${dbState.tasks[idx].title} (${dbState.tasks[idx].status})`, 'Success');
    res.json(dbState.tasks[idx]);
  });

  // Risk Alerts
  apiRouter.get('/alerts', (req, res) => {
    const user = getAuthenticatedUser(req);
    if (user && user.role?.toLowerCase() === 'client') {
      return res.json([]);
    }
    res.json(dbState.riskAlerts);
  });

  apiRouter.put('/alerts/:id', (req, res) => {
    const { id } = req.params;
    const idx = dbState.riskAlerts.findIndex(a => a.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    dbState.riskAlerts[idx] = { ...dbState.riskAlerts[idx], ...req.body };
    persistDB();

    addAuditLog('Tanaisha Udwadia', 'Advisor', 'Updated Risk Alert', 'Security', `${dbState.riskAlerts[idx].category} (${dbState.riskAlerts[idx].status})`, 'Success');
    res.json(dbState.riskAlerts[idx]);
  });

  // Data Hub: Sources & Spreadsheet Import (Advisor only)
  apiRouter.get('/sources', (req, res) => {
    const user = getAuthenticatedUser(req);
    if (user && user.role?.toLowerCase() === 'client') {
      return res.status(403).json({ error: 'Access denied: Client cannot view data integration sources.' });
    }
    res.json(dbState.dataSources);
  });

  apiRouter.post('/sources', (req, res) => {
    const user = getAuthenticatedUser(req);
    if (user && user.role?.toLowerCase() === 'client') {
      return res.status(403).json({ error: 'Access denied.' });
    }
    const s = req.body;
    const newSource = {
      ...s,
      id: s.id || `SRC-${Date.now()}`,
      status: s.status || 'Connected',
      lastAttemptedSync: new Date().toISOString()
    };
    dbState.dataSources.push(newSource);
    persistDB();

    addAuditLog('Rajesh Kulkarni', 'Operations', 'Connected Data Source', 'Spreadsheet Sync', newSource.name, 'Success');
    res.status(201).json(newSource);
  });

  apiRouter.post('/import/holdings', (req, res) => {
    const user = getAuthenticatedUser(req);
    if (user && user.role?.toLowerCase() === 'client') {
      return res.status(403).json({ error: 'Access denied: Clients cannot perform batch imports.' });
    }

    const { holdings, sourceName, sourceType } = req.body;
    if (!Array.isArray(holdings) || holdings.length === 0) {
      return res.status(400).json({ error: 'No valid holding records received for import' });
    }

    let createdCount = 0;
    let updatedCount = 0;

    holdings.forEach(row => {
      const existingIdx = dbState.holdings.findIndex(
        h => (h.id === row.id) || (h.clientId === row.clientId && h.symbol === row.symbol)
      );

      if (existingIdx >= 0) {
        dbState.holdings[existingIdx] = {
          ...dbState.holdings[existingIdx],
          ...row,
          lastPriceUpdate: new Date().toISOString().split('T')[0]
        };
        updatedCount++;
      } else {
        dbState.holdings.push({
          ...row,
          id: row.id || `HLD-${Date.now()}-${createdCount}`,
          lastPriceUpdate: new Date().toISOString().split('T')[0],
          currency: 'INR'
        });
        createdCount++;
      }
    });

    const newSyncJob = {
      id: `SYNC-${Date.now()}`,
      dataSourceName: sourceName || 'Spreadsheet Import',
      sourceType: sourceType || 'Excel Workbook (.xlsx)',
      startTime: new Date(Date.now() - 4000).toISOString(),
      endTime: new Date().toISOString(),
      durationMs: 4000,
      recordsCreated: createdCount,
      recordsUpdated: updatedCount,
      recordsSkipped: 0,
      failedRows: 0,
      status: 'Success' as const,
      initiatedBy: 'Tanaisha Udwadia'
    };

    dbState.syncJobs.unshift(newSyncJob);
    persistDB();

    addAuditLog('Tanaisha Udwadia', 'Advisor', 'Imported Spreadsheet Records', 'Spreadsheet Sync', `${sourceName || 'Spreadsheet'}: +${createdCount} added, ~${updatedCount} updated`, 'Success');

    res.json({
      success: true,
      recordsCreated: createdCount,
      recordsUpdated: updatedCount,
      syncJob: newSyncJob
    });
  });

  apiRouter.post('/sync/trigger', (req, res) => {
    const user = getAuthenticatedUser(req);
    if (user && user.role?.toLowerCase() === 'client') {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const { sourceId } = req.body;
    const source = dbState.dataSources.find(s => s.id === sourceId);
    if (!source) {
      return res.status(404).json({ error: 'Data source not found' });
    }

    const duration = Math.floor(Math.random() * 8000) + 3000;
    const updatedCount = source.recordCount || 12;

    source.lastSuccessfulSync = new Date().toISOString();
    source.lastAttemptedSync = new Date().toISOString();
    source.status = 'Connected';

    const newSyncJob = {
      id: `SYNC-${Date.now()}`,
      dataSourceName: source.name,
      sourceType: source.type,
      startTime: new Date(Date.now() - duration).toISOString(),
      endTime: new Date().toISOString(),
      durationMs: duration,
      recordsCreated: 0,
      recordsUpdated: updatedCount,
      recordsSkipped: 0,
      failedRows: 0,
      status: 'Success' as const,
      initiatedBy: 'Tanaisha Udwadia'
    };

    dbState.syncJobs.unshift(newSyncJob);
    persistDB();

    addAuditLog('Tanaisha Udwadia', 'Advisor', 'Executed Live Spreadsheet Sync', 'Spreadsheet Sync', source.name, 'Success', `Refreshed ${updatedCount} records.`);

    res.json({
      success: true,
      message: `Successfully synchronized ${updatedCount} records from ${source.name}.`,
      syncJob: newSyncJob
    });
  });

  apiRouter.get('/sync/jobs', (req, res) => {
    const user = getAuthenticatedUser(req);
    if (user && user.role?.toLowerCase() === 'client') {
      return res.json([]);
    }
    res.json(dbState.syncJobs);
  });

  // Documents
  apiRouter.get('/documents', (req, res) => {
    const user = getAuthenticatedUser(req);
    if (user && user.role?.toLowerCase() === 'client') {
      return res.json(dbState.documents.filter(d => d.associatedClientId === user.assignedClientId));
    }
    const { clientId } = req.query;
    if (clientId) {
      return res.json(dbState.documents.filter(d => d.associatedClientId === clientId));
    }
    res.json(dbState.documents);
  });

  apiRouter.post('/documents', (req, res) => {
    const d = req.body;
    const newDoc = {
      ...d,
      id: d.id || `DOC-${Date.now()}`,
      uploadDate: new Date().toISOString().split('T')[0],
      status: 'Active' as const
    };
    dbState.documents.push(newDoc);
    persistDB();

    addAuditLog('Tanaisha Udwadia', 'Advisor', 'Uploaded Document Record', 'Report', newDoc.name, 'Success');
    res.status(201).json(newDoc);
  });

  apiRouter.delete('/documents/:id', (req, res) => {
    const { id } = req.params;
    const idx = dbState.documents.findIndex(d => d.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Document not found' });
    }
    const removed = dbState.documents.splice(idx, 1)[0];
    persistDB();

    addAuditLog('Tanaisha Udwadia', 'Advisor', 'Deleted Document Record', 'Report', removed.name, 'Success');
    res.json({ success: true, removed });
  });

  // Audit Logs
  apiRouter.get('/audit-logs', (req, res) => {
    const user = getAuthenticatedUser(req);
    if (user && user.role?.toLowerCase() === 'client') {
      return res.json([]);
    }
    res.json(dbState.auditLogs);
  });

  // Settings
  apiRouter.get('/settings', (req, res) => {
    res.json(dbState.settings);
  });

  apiRouter.put('/settings', (req, res) => {
    const user = getAuthenticatedUser(req);
    if (user && user.role?.toLowerCase() === 'client') {
      return res.status(403).json({ error: 'Clients cannot modify firm settings.' });
    }

    dbState.settings = { ...dbState.settings, ...req.body };
    persistDB();

    addAuditLog('Karan Malhotra', 'Administrator', 'Updated Firm Settings', 'Security', 'CapitalVest Firm Configuration', 'Success');
    res.json(dbState.settings);
  });

  // Admin Reset Demo Data
  apiRouter.post('/admin/reset-demo-data', (req, res) => {
    const user = getAuthenticatedUser(req);
    if (user && user.role?.toLowerCase() === 'client') {
      return res.status(403).json({ error: 'Clients cannot reset demo dataset.' });
    }

    dbState = loadInitialState();
    ensureDatabaseCredentials(dbState);
    persistDB();
    addAuditLog('Karan Malhotra', 'Administrator', 'Reset Application Demo Dataset', 'Security', 'All Database Collections', 'Success');
    res.json({ success: true, message: 'All demo datasets successfully restored to initial verified state.' });
  });

  // AI Chatbot with Server-side Gemini Integration
  apiRouter.post('/chat', async (req, res) => {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message text is required.' });
    }

    const user = getAuthenticatedUser(req);
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(503).json({
        configured: false,
        error: 'The Gemini API key is not configured in this environment. Please configure GEMINI_API_KEY in the Settings > Secrets panel to activate live AI responses from CapitalVest AI Assistant.'
      });
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      // Construct system instruction based on authorization role
      let roleContext = '';
      if (user && user.role?.toLowerCase() === 'client') {
        const client = dbState.clients.find(c => c.id === user.assignedClientId);
        const clientHoldings = dbState.holdings.filter(h => h.clientId === user.assignedClientId);
        const clientGoals = dbState.goals.filter(g => g.clientId === user.assignedClientId);

        const totalInvested = clientHoldings.reduce((sum, h) => sum + (h.investedValue || 0), 0);
        const totalValue = clientHoldings.reduce((sum, h) => sum + (h.currentMarketValue || 0), 0);

        roleContext = `
USER CONTEXT:
- Role: Authenticated Client (${client?.name || user.name})
- Client Account Number: ${client?.clientNumber || 'CV-2025-002'}
- Risk Profile: ${client?.riskProfile || 'Growth'}
- City: ${client?.city || 'Mumbai'}
- Total Portfolio Market Value: ₹${(totalValue / 10000000).toFixed(2)} Crore (₹${totalValue.toLocaleString('en-IN')})
- Invested Basis: ₹${(totalInvested / 10000000).toFixed(2)} Crore
- Number of Active Holdings: ${clientHoldings.length}
- Number of Active Financial Goals: ${clientGoals.length} (${clientGoals.map(g => `${g.name}: Target ₹${(g.targetAmount/100000).toFixed(1)}L`).join(', ')})

PRIVACY AND SECURITY ENFORCEMENT:
1. You may summarize and explain this client's OWN portfolio data provided above.
2. You must NEVER reveal or reference any other client's names, accounts, or details.
3. You must NEVER disclose internal advisor notes, credentials, passwords, or system logs.
4. You cannot execute transactions, transfer funds, or alter records. If asked, inform the client to submit requests to their lead advisor (${client?.primaryAdvisor || 'Tanaisha Udwadia'}).
`;
      } else if (user && (user.role?.toLowerCase() === 'advisor' || user.role?.toLowerCase() === 'administrator' || user.role?.toLowerCase() === 'operations')) {
        roleContext = `
USER CONTEXT:
- Role: Wealth Advisor / Administrator (${user.name})
- Total Managed Clients: ${dbState.clients.length}
- Firm: CapitalVest Wealth Management Command Centre
- Permitted Scope: You may discuss advisory workflows, asset allocation modeling, portfolio health scoring formulas, risk alerts, and spreadsheet synchronization capabilities.
`;
      } else {
        roleContext = `
USER CONTEXT:
- Role: Public Visitor on CapitalVest Homepage
- Access: Public information only. No client accounts or confidential portfolios may be disclosed.
- Permitted Scope: Introduce CapitalVest's platform features, wealth management philosophy, Indian financial conventions (INR, Lakhs/Crores, SEBI guidelines), investment terminology, and guide visitors to Client Login or Advisor Login.
`;
      }

      const systemInstruction = `
You are the CapitalVest AI Wealth Assistant, an institutional wealth management intelligence service built for CapitalVest Command Centre.
Tone: Professional, articulate, clear, and reassuring.

Core knowledge:
- Indian Wealth Management Conventions: Currencies in INR (₹), Indian numbering (Lakhs, Crores), financial year April-March.
- Investment concepts: Equity, Debt, Gold & Precious Metals, REITs & Real Estate, Alternate Assets, Asset Allocation Drift, Rebalancing, XIRR, CAGR, Sharpe ratio, Beta.
- Goal Planning: Goal funding ratios, retirement corpus calculation, emergency reserve metrics (6-12 months expenses).
- Platform Features: Client 360 Dossiers, Holdings Register, Asset Allocation Visualizer, Financial Health Index (0-100 score), Deterministic Risk Alerts, Data Hub (Excel/CSV and Google Sheets sync), and Professional PDF Wealth Statements.

Disclaimers:
- Always clarify that insights and metrics are educational and informative, not guaranteed returns or SEBI-registered individualized stock recommendations.
${roleContext}
`;

      const formattedContents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
      if (Array.isArray(history)) {
        for (const item of history.slice(-8)) {
          if (item.role === 'user' || item.role === 'model') {
            formattedContents.push({
              role: item.role,
              parts: [{ text: item.text }]
            });
          }
        }
      }
      formattedContents.push({
        role: 'user',
        parts: [{ text: message }]
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: formattedContents,
        config: {
          systemInstruction
        }
      });

      return res.json({
        reply: response.text,
        configured: true
      });
    } catch (err: any) {
      console.error('Gemini API Error:', err);
      return res.status(500).json({
        configured: true,
        error: `AI Service Error: ${err.message || 'Failed to generate response'}. Please verify your API key in Settings > Secrets.`
      });
    }
  });

  app.use('/api', apiRouter);

  // Serve Vite in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CapitalVest full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start CapitalVest server:', err);
});
