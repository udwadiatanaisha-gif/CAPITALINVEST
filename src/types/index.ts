export type UserRole = 
  | 'Administrator' 
  | 'Advisor' 
  | 'Operations' 
  | 'Read-only reviewer' 
  | 'Client'
  | 'admin'
  | 'advisor'
  | 'operations'
  | 'reviewer'
  | 'client';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
  assignedClientId?: string; // If role is Client
  clientId?: string; // alias for assignedClientId
  clientNumber?: string; // e.g., "CV-2025-001"
  createdAt: string;
  lastLogin?: string;
  passwordHash?: string;
  salt?: string;
  isProvisioned?: boolean;
}

export type RiskProfile = 'Conservative' | 'Moderate' | 'Balanced' | 'Growth' | 'Aggressive';
export type ClientCategory = 'Ultra HNW' | 'HNW' | 'Affluent' | 'Retail';
export type RelationshipStatus = 'Active' | 'Inactive' | 'Prospective' | 'Archived';

export interface Client {
  id: string;
  clientNumber: string; // e.g., "CV-2026-081"
  name: string;
  email: string;
  phone: string;
  city: string;
  dateOfBirth?: string;
  occupation: string;
  relationshipStartDate: string;
  primaryAdvisor: string;
  relationshipStatus: RelationshipStatus;
  category: ClientCategory;
  
  // Financial Profile
  annualIncomeBand?: string;
  investmentExperience: 'Novice' | 'Intermediate' | 'Experienced' | 'Sophisticated';
  investmentHorizon: 'Short-term (< 3 yrs)' | 'Medium-term (3-7 yrs)' | 'Long-term (7+ yrs)';
  investmentObjectives: string[];
  liquidityRequirements: 'Low' | 'Moderate' | 'High';
  riskProfile: RiskProfile;
  riskAssessmentDate: string;
  
  // Planning Info
  plannedRetirementAge?: number;
  emergencyFundTarget?: number;
  insuranceReviewStatus: 'Up to Date' | 'Pending Review' | 'Inadequate Coverage' | 'Not Started';
  preferredReviewFrequency: 'Monthly' | 'Quarterly' | 'Bi-Annual' | 'Annual';
  nextReviewDate: string;
  
  // Administrative & Calculated Convenience
  notes?: string;
  consentSigned: boolean;
  createdAt: string;
  updatedAt: string;
  isDemo?: boolean;
  totalAum?: number;
  tier?: string;
  panNumber?: string;
  lastReviewDate?: string;
}

export type ProspectStage = 
  | 'New Lead'
  | 'Contacted'
  | 'Meeting Scheduled'
  | 'Proposal or Review'
  | 'Onboarding'
  | 'Converted'
  | 'Closed or Lost';

export interface Prospect {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  stage: ProspectStage;
  estimatedAUM: number; // in INR
  source: 'Referral' | 'Website' | 'Private Banking' | 'Event' | 'Professional Network';
  assignedAdvisor: string;
  nextFollowUpDate: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type AssetClass = 'Equity' | 'Debt' | 'Cash & Equivalents' | 'Gold & Precious Metals' | 'Real Estate & REITs' | 'Alternative Investments';

export interface Holding {
  id: string;
  clientId: string;
  assetName: string;
  assetClass: AssetClass;
  symbol: string; // NSE / BSE / ISIN code or ticker
  sector?: string;
  quantity: number;
  averagePurchasePrice: number; // INR
  currentPrice: number; // INR
  investedValue: number; // INR (quantity * averagePurchasePrice)
  currentMarketValue: number; // INR (quantity * currentPrice)
  gainLossAmount: number; // currentMarketValue - investedValue
  gainLossPercentage: number; // ((currentMarketValue - investedValue) / investedValue) * 100
  weightPercentage?: number; // relative to client portfolio
  lastPriceUpdate: string;
  currency: 'INR';
  isManualOrSample?: boolean;
  source?: string;
}

export type GoalCategory = 
  | 'Retirement' 
  | 'Home Purchase' 
  | 'Child\'s Education' 
  | 'Emergency Fund' 
  | 'Family Protection' 
  | 'Travel & Lifestyle' 
  | 'Custom';

export type GoalPriority = 'Critical' | 'High' | 'Medium' | 'Low';
export type GoalStatus = 'On Track' | 'Attention Needed' | 'Behind Schedule' | 'Achieved' | 'Archived';

export interface FinancialGoal {
  id: string;
  clientId: string;
  name: string;
  category: GoalCategory;
  targetAmount: number; // INR
  currentSavedAmount: number; // INR
  targetDate: string; // YYYY-MM-DD or DD/MM/YYYY
  currentMonthlyContribution: number; // INR
  expectedReturnAssumption: number; // Percentage (e.g. 10.5%)
  priority: GoalPriority;
  status: GoalStatus;
  linkedHoldingsIds?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialHealthBreakdown {
  emergencyFundScore: number; // 0 - 100
  savingsRateScore: number;
  debtBurdenScore: number;
  goalFundingScore: number;
  diversificationScore: number;
  insuranceReviewScore: number;
  liquidityScore: number;
}

export interface FinancialHealthAssessment {
  id: string;
  clientId: string;
  overallScore: number; // 0 - 100
  breakdown: FinancialHealthBreakdown;
  strengths: string[];
  areasRequiringAttention: string[];
  assessmentDate: string;
  advisorNotes: string;
  evaluatedBy: string;
  isDraft?: boolean;
}

export type AlertSeverity = 'Critical' | 'High' | 'Medium' | 'Low';
export type AlertCategory = 
  | 'Allocation Drift'
  | 'Concentration Risk'
  | 'Goal Behind Schedule'
  | 'Stale Portfolio Price'
  | 'Overdue Client Review'
  | 'Missing Profile Information'
  | 'Spreadsheet Sync Issue'
  | 'Data Inconsistency';

export type AlertStatus = 'Open' | 'In Progress' | 'Resolved' | 'Dismissed';

export interface RiskAlert {
  id: string;
  clientId?: string;
  clientName?: string;
  category: AlertCategory;
  severity: AlertSeverity;
  detectionDate: string;
  reason: string;
  currentValueDescription: string;
  thresholdDescription: string;
  suggestedAction: string;
  assignedPerson: string;
  status: AlertStatus;
  resolvedAt?: string;
  resolutionNotes?: string;
}

export type MeetingType = 'Annual Review' | 'Quarterly Check-in' | 'Portfolio Rebalancing' | 'Goal Planning' | 'Onboarding Session' | 'Ad-hoc Consultation';

export interface Meeting {
  id: string;
  clientId: string;
  clientName: string;
  advisorName: string;
  title: string;
  dateTime: string;
  durationMinutes: number;
  type: MeetingType;
  agenda: string;
  status: 'Scheduled' | 'Completed' | 'Rescheduled' | 'Cancelled';
  meetingMode: 'In-Person (Office)' | 'Video Conference' | 'Phone Call';
  outcome?: string;
  followUpTasks?: string[];
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  relatedClientId?: string;
  clientId?: string;
  relatedClientName?: string;
  assignedTo: string;
  dueDate: string;
  priority: 'Urgent' | 'High' | 'Medium' | 'Low' | 'critical' | 'high' | 'medium' | 'low';
  status: 'Pending' | 'In Progress' | 'Completed' | 'Deferred' | 'todo' | 'in_progress' | 'completed';
  completionNotes?: string;
  completedAt?: string;
  createdAt: string;
  createdBy?: string;
}

export type DocumentCategory = 
  | 'KYC & Identification'
  | 'Investment Policy Statement (IPS)'
  | 'Wealth Report'
  | 'Tax Statement'
  | 'Client Agreement'
  | 'Spreadsheet Snapshot'
  | 'Other';

export interface DocumentRecord {
  id: string;
  name: string;
  title?: string;
  category: DocumentCategory | string;
  associatedClientId?: string;
  associatedClientName?: string;
  clientId?: string;
  uploadDate: string;
  uploadedAt?: string;
  uploadedBy: string;
  fileSizeBytes: number;
  fileSize?: string;
  fileName?: string;
  fileType: string;
  accessPermission?: 'Advisor Only' | 'Client Accessible' | 'Team Wide';
  status?: 'Active' | 'Archived';
  fileData?: string; // base64 or stored url
  isConfidential?: boolean;
}

export type ReportType = 
  | 'Client Portfolio Comprehensive'
  | 'Financial Health & Planning'
  | 'Goal Progression Analysis'
  | 'Asset Allocation & Rebalancing'
  | 'Client Review Briefing'
  | 'Risk & Alert Audit';

export interface GeneratedReport {
  id: string;
  clientId: string;
  clientName: string;
  reportType: ReportType;
  generatedAt: string;
  generatedBy: string;
  reportingPeriod: string;
  summaryMetrics: {
    totalValue: number;
    investedValue: number;
    gainLoss: number;
    returnPercentage: number;
    healthScore?: number;
    goalsCount?: number;
  };
  fileSizeEstimate: string;
  downloadUrl?: string;
}

export type DataSourceType = 'Google Sheets' | 'Excel Workbook (.xlsx)' | 'CSV Upload' | 'Manual Entry';

export interface DataSource {
  id: string;
  type: DataSourceType;
  name: string;
  spreadsheetId?: string;
  sheetName?: string;
  status: 'Connected' | 'Disconnected' | 'Syncing' | 'Error' | 'Configured';
  lastSuccessfulSync?: string;
  lastAttemptedSync?: string;
  recordCount: number;
  issuesCount: number;
  syncIntervalMinutes?: number;
  syncMode: 'Manual' | 'Scheduled';
  details?: string;
}

export interface SyncJob {
  id: string;
  dataSourceName: string;
  sourceType: DataSourceType;
  startTime: string;
  endTime: string;
  durationMs: number;
  recordsCreated: number;
  recordsUpdated: number;
  recordsSkipped: number;
  failedRows: number;
  status: 'Success' | 'Failed' | 'Partial Success';
  initiatedBy: string;
  errorLog?: string[];
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  category: 'Auth' | 'Client Record' | 'Portfolio' | 'Goal' | 'Spreadsheet Sync' | 'Report' | 'Security' | string;
  affectedRecord: string;
  outcome: 'Success' | 'Warning' | 'Denied' | 'Failed';
  details?: string;
  targetType?: string;
  targetId?: string;
  performedBy?: string;
  ipAddress?: string;
}

export interface FirmSettings {
  firmName: string;
  tagline: string;
  leadAdvisor: string;
  leadAdvisorName?: string;
  sebiRegistrationNumber?: string;
  contactEmail: string;
  contactPhone: string;
  officeCity: string;
  defaultCurrency: 'INR';
  defaultTimeZone: 'Asia/Kolkata';
  dateFormat: 'DD/MM/YYYY';
  numberFormat: 'Indian (Lakhs / Crores)' | 'Standard International';
  theme: 'light' | 'dark';
  
  // Scoring weights
  healthScoringWeights: {
    emergencyFund: number; // e.g. 15%
    savingsRate: number; // 20%
    debtBurden: number; // 15%
    goalFunding: number; // 20%
    diversification: number; // 15%
    insurance: number; // 10%
    liquidity: number; // 5%
  };
  
  // Risk thresholds
  riskThresholds: {
    maxSingleAssetConcentration: number; // % e.g. 20%
    maxSingleEquityConcentration: number; // % e.g. 15%
    maxAllocationDrift: number; // % e.g. 10%
    reviewOverdueDays: number; // e.g. 90 days
    goalFallingBehindThreshold: number; // % e.g. 15%
    singleStockConcentration?: number;
    assetClassDrift?: number;
    minEmergencyFundMonths?: number;
  };
}
