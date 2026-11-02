import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { PublicNavbar } from './components/layout/PublicNavbar';
import { PublicFooter } from './components/layout/PublicFooter';
import { AppLayout } from './components/layout/AppLayout';
import { Client, Holding, FinancialGoal } from './types';

// Public pages
import { HomePage } from './components/public/HomePage';
import { AboutPage } from './components/public/AboutPage';
import { SolutionsPage } from './components/public/SolutionsPage';
import { PlatformPage } from './components/public/PlatformPage';
import { ContactPage } from './components/public/ContactPage';
import { LegalPages } from './components/public/LegalPages';

// Auth pages
import { ClientLoginPage } from './components/auth/ClientLoginPage';
import { AdvisorLoginPage } from './components/auth/AdvisorLoginPage';
import { SignInPage } from './components/auth/SignInPage';
import { SignUpPage } from './components/auth/SignUpPage';
import { ForgotPasswordModal } from './components/auth/ForgotPasswordModal';
import { OnboardingWizard } from './components/auth/OnboardingWizard';
import { AIChatbot } from './components/chatbot/AIChatbot';

// App / Workspace views
import { AdvisorDashboard } from './components/dashboard/AdvisorDashboard';
import { ClientDashboard } from './components/dashboard/ClientDashboard';
import { ClientDirectory } from './components/clients/ClientDirectory';
import { Client360Profile } from './components/clients/Client360Profile';
import { ClientFormModal } from './components/clients/ClientFormModal';
import { ProspectPipeline } from './components/crm/ProspectPipeline';
import { MeetingsCalendar } from './components/crm/MeetingsCalendar';
import { PortfolioOverview } from './components/portfolio/PortfolioOverview';
import { HoldingsRegister } from './components/portfolio/HoldingsRegister';
import { AssetAllocationView } from './components/portfolio/AssetAllocationView';
import { HoldingFormModal } from './components/portfolio/HoldingFormModal';
import { FinancialGoalsView } from './components/planning/FinancialGoalsView';
import { GoalFormModal } from './components/planning/GoalFormModal';
import { FinancialHealthView } from './components/planning/FinancialHealthView';
import { RiskMonitoringView } from './components/risk/RiskMonitoringView';
import { DataHubView } from './components/datahub/DataHubView';
import { SpreadsheetImportWizard } from './components/datahub/SpreadsheetImportWizard';
import { SyncHistoryView } from './components/datahub/SyncHistoryView';
import { ReportsLibrary } from './components/reports/ReportsLibrary';
import { DocumentsView } from './components/reports/DocumentsView';
import { TaskManager } from './components/operations/TaskManager';
import { TeamManagement } from './components/operations/TeamManagement';
import { AuditLogView } from './components/operations/AuditLogView';
import { SettingsView } from './components/operations/SettingsView';

const MainAppContent: React.FC = () => {
  const { currentView, setCurrentView, currentUser, addClient, updateClient, navigate } = useApp();

  // Modal states & entities
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);

  const [isHoldingModalOpen, setIsHoldingModalOpen] = useState(false);
  const [holdingToEdit, setHoldingToEdit] = useState<Holding | null>(null);
  const [defaultHoldingClientId, setDefaultHoldingClientId] = useState<string | undefined>(undefined);

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<FinancialGoal | null>(null);
  const [defaultGoalClientId, setDefaultGoalClientId] = useState<string | undefined>(undefined);

  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  // Modal handlers
  const handleOpenAddClient = () => {
    setClientToEdit(null);
    setIsClientModalOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setClientToEdit(client);
    setIsClientModalOpen(true);
  };

  const handleSaveClient = async (clientData: Partial<Client>, openProfile?: boolean) => {
    if (clientToEdit) {
      await updateClient(clientToEdit.id, clientData);
    } else {
      const created = await addClient(clientData);
      if (openProfile) {
        navigate('client_360', created.id);
      }
    }
    setIsClientModalOpen(false);
  };

  const handleOpenAddHolding = (clientId?: string) => {
    setHoldingToEdit(null);
    setDefaultHoldingClientId(clientId);
    setIsHoldingModalOpen(true);
  };

  const handleEditHolding = (holding: Holding) => {
    setHoldingToEdit(holding);
    setIsHoldingModalOpen(true);
  };

  const handleOpenAddGoal = (clientId?: string) => {
    setGoalToEdit(null);
    setDefaultGoalClientId(clientId);
    setIsGoalModalOpen(true);
  };

  const handleEditGoal = (goal: FinancialGoal) => {
    setGoalToEdit(goal);
    setIsGoalModalOpen(true);
  };

  const handleScheduleReview = (client?: Client) => {
    navigate('meetings', client?.id);
  };

  // Determine view groups
  const isPublicView = [
    'home',
    'about',
    'solutions',
    'platform',
    'contact',
    'privacy',
    'terms',
    'legal'
  ].includes(currentView);

  const isAuthView = ['client-login', 'advisor-login', 'signin', 'signup', 'onboarding'].includes(currentView);

  // Render Public Section
  if (isPublicView) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800">
        <PublicNavbar />
        <main className="flex-1">
          {currentView === 'home' && <HomePage />}
          {currentView === 'about' && <AboutPage />}
          {currentView === 'solutions' && <SolutionsPage />}
          {currentView === 'platform' && <PlatformPage />}
          {currentView === 'contact' && <ContactPage />}
          {['privacy', 'terms', 'legal'].includes(currentView) && <LegalPages />}
        </main>
        <PublicFooter />
        <AIChatbot />
      </div>
    );
  }

  // Render Auth Section
  if (isAuthView) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans">
        {(currentView === 'client-login' || currentView === 'signin') && (
          <ClientLoginPage onForgotPassword={() => setIsForgotPasswordOpen(true)} />
        )}
        {currentView === 'advisor-login' && (
          <AdvisorLoginPage onForgotPassword={() => setIsForgotPasswordOpen(true)} />
        )}
        {currentView === 'signup' && <SignUpPage />}
        {currentView === 'onboarding' && <OnboardingWizard />}

        <ForgotPasswordModal
          isOpen={isForgotPasswordOpen}
          onClose={() => setIsForgotPasswordOpen(false)}
        />
        <AIChatbot />
      </div>
    );
  }

  // Guard: If not authenticated, always show public homepage directly
  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800">
        <PublicNavbar />
        <main className="flex-1">
          <HomePage />
        </main>
        <PublicFooter />
        <AIChatbot />
      </div>
    );
  }

  // Render Authenticated Command Centre Workspace
  const isClientRole = currentUser?.role?.toLowerCase() === 'client';

  const renderWorkspaceView = () => {
    switch (currentView) {
      case 'dashboard':
        return isClientRole ? (
          <ClientDashboard />
        ) : (
          <AdvisorDashboard
            onOpenAddClient={handleOpenAddClient}
            onOpenAddHolding={() => handleOpenAddHolding()}
            onOpenAddGoal={() => handleOpenAddGoal()}
            onOpenScheduleReview={() => handleScheduleReview()}
          />
        );

      case 'client-dashboard':
        return <ClientDashboard />;

      case 'clients':
        return (
          <ClientDirectory
            onOpenAddClient={handleOpenAddClient}
            onEditClient={handleEditClient}
            onScheduleReview={handleScheduleReview}
          />
        );

      case 'client_360':
      case 'client-360':
        return (
          <Client360Profile
            onOpenAddHolding={(cId: string) => handleOpenAddHolding(cId)}
            onOpenAddGoal={(cId: string) => handleOpenAddGoal(cId)}
            onOpenScheduleReview={(c: Client) => handleScheduleReview(c)}
            onEditClient={handleEditClient}
          />
        );

      case 'prospects':
        return <ProspectPipeline onAddProspect={handleOpenAddClient} />;

      case 'meetings':
        return <MeetingsCalendar />;

      case 'portfolio':
      case 'portfolio-overview':
        return <PortfolioOverview onOpenAddHolding={() => handleOpenAddHolding()} />;

      case 'holdings':
        return (
          <HoldingsRegister
            onOpenAddHolding={() => handleOpenAddHolding()}
            onEditHolding={handleEditHolding}
          />
        );

      case 'allocation':
      case 'asset-allocation':
        return <AssetAllocationView />;

      case 'goals':
        return (
          <FinancialGoalsView
            onOpenAddGoal={() => handleOpenAddGoal()}
            onEditGoal={handleEditGoal}
          />
        );

      case 'health':
        return <FinancialHealthView />;

      case 'risk':
        return <RiskMonitoringView />;

      case 'datahub':
      case 'data-hub':
        return <DataHubView onLaunchImportWizard={() => setCurrentView('spreadsheet_import')} />;

      case 'spreadsheet_import':
        return <SpreadsheetImportWizard onComplete={() => setCurrentView('holdings')} />;

      case 'sync_history':
      case 'sync-history':
        return <SyncHistoryView />;

      case 'reports':
        return <ReportsLibrary />;

      case 'documents':
        return <DocumentsView />;

      case 'tasks':
        return <TaskManager />;

      case 'team':
        return <TeamManagement />;

      case 'audit_logs':
      case 'audit-log':
        return <AuditLogView />;

      case 'settings':
        return <SettingsView />;

      default:
        return isClientRole ? (
          <ClientDashboard />
        ) : (
          <AdvisorDashboard
            onOpenAddClient={handleOpenAddClient}
            onOpenAddHolding={() => handleOpenAddHolding()}
            onOpenAddGoal={() => handleOpenAddGoal()}
            onOpenScheduleReview={() => handleScheduleReview()}
          />
        );
    }
  };

  return (
    <AppLayout>
      {renderWorkspaceView()}

      {/* Global Modals */}
      <ClientFormModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSave={handleSaveClient}
        clientToEdit={clientToEdit}
      />

      <HoldingFormModal
        isOpen={isHoldingModalOpen}
        onClose={() => setIsHoldingModalOpen(false)}
        holdingToEdit={holdingToEdit}
        defaultClientId={defaultHoldingClientId}
      />

      <GoalFormModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        goalToEdit={goalToEdit}
        defaultClientId={defaultGoalClientId}
      />

      {/* Floating AI Wealth Assistant */}
      <AIChatbot />
    </AppLayout>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
