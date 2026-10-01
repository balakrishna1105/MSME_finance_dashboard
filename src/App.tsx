/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ActiveScreen, UserAccount, DocumentRecord, QueuePipelineItem, SchemaField, SecurityPolicies } from './types';
import {
  INITIAL_USERS,
  INITIAL_DOCUMENTS,
  INITIAL_QUEUE_ITEMS,
  INITIAL_SCHEMA_FIELDS,
  INITIAL_POLICIES
} from './data/mockData';

import { NavigationSidebar } from './components/NavigationSidebar';
import { TopHeader } from './components/TopHeader';
import { AuthScreen } from './components/AuthScreen';
import { DaywiseDashboard } from './components/DaywiseDashboard';
import { ReviewHITLScreen } from './components/ReviewHITLScreen';
import { SchemaBuilderScreen } from './components/SchemaBuilderScreen';
import { UploadQueueScreen } from './components/UploadQueueScreen';
import { UserManagementScreen } from './components/UserManagementScreen';
import { AllDocumentsView, HistoryAuditView, AnalyticsSlaView, EngineApisView } from './components/SecondaryViews';
import { GlobalSearchModal } from './components/GlobalSearchModal';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ActiveScreen>('dashboard');
  const [currentUser, setCurrentUser] = useState<UserAccount>(INITIAL_USERS[0]);
  const [users, setUsers] = useState<UserAccount[]>(INITIAL_USERS);
  const [documents, setDocuments] = useState<DocumentRecord[]>(INITIAL_DOCUMENTS);
  const [queueItems, setQueueItems] = useState<QueuePipelineItem[]>(INITIAL_QUEUE_ITEMS);
  const [schemaFields, setSchemaFields] = useState<SchemaField[]>(INITIAL_SCHEMA_FIELDS);
  const [policies, setPolicies] = useState<SecurityPolicies>(INITIAL_POLICIES);

  const [activeReviewDocId, setActiveReviewDocId] = useState<string>('doc-3');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // Keyboard shortcut for Command+K to open global lookup
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavigateToReview = (docId: string) => {
    setActiveReviewDocId(docId);
    setCurrentScreen('review-hitl');
  };

  const handleDocumentApproved = (docId: string) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, status: 'valid', confidence: 99, confidenceLabel: 'Valid 99%' } : d))
    );
  };

  const handleInviteUser = (partialUser: Partial<UserAccount>) => {
    const newUser: UserAccount = {
      id: `usr-${Date.now()}`,
      name: partialUser.name || 'New Member',
      email: partialUser.email || 'member@azad-ai.io',
      role: partialUser.role || 'HITL Verification Lead',
      roleTag: partialUser.roleTag || 'Reviewer',
      department: partialUser.department || 'Risk & Review',
      initials: (partialUser.name || 'NM')
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
      scope: 'Standard Review Partition',
      scopeDetails: 'Assigned queues only',
      mfaProvider: 'Pending Enrollment',
      mfaType: 'pending',
      lastActivity: 'Invite sent just now',
      location: 'Invited Remote',
      status: 'Pending Invite'
    };
    setUsers((prev) => [newUser, ...prev]);
  };

  // If on Auth Gateway screen
  if (currentScreen === 'gateway') {
    return (
      <AuthScreen
        availableUsers={users}
        onAuthenticate={(user, targetScreen) => {
          setCurrentUser(user);
          setCurrentScreen(targetScreen || 'dashboard');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1326] text-[#dae2fd] antialiased">
      {/* Sidebar Navigation */}
      <NavigationSidebar
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
        isOpenMobile={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
        unreviewedCount={documents.filter((d) => d.status === 'review').length}
      />

      {/* Main Workspace Frame */}
      <div className="lg:pl-72 flex flex-col min-h-screen">
        {/* Top Sticky Header */}
        <TopHeader
          currentUser={currentUser}
          onSelectUser={setCurrentUser}
          availableUsers={users}
          onOpenUpload={() => setCurrentScreen('upload-queue')}
          onOpenSearch={() => setIsSearchOpen(true)}
          onToggleMobileNav={() => setIsMobileNavOpen(!isMobileNavOpen)}
          onNavigate={setCurrentScreen}
        />

        {/* Global Screen Switcher Quick Bar */}
        <div className="pt-16 px-4 lg:px-6 pt-20">
          <div className="w-full bg-[#131b2e] border border-[#3f4850]/40 rounded-xl p-2 mb-4 flex items-center justify-between overflow-x-auto shadow-sm">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="font-mono text-[10px] text-[#89929b] uppercase px-2 hidden sm:inline">
                Active Screen:
              </span>
              {[
                { id: 'dashboard', label: 'Day-wise Dashboard', icon: 'calendar_view_day' },
                { id: 'upload-queue', label: 'Upload & Queue', icon: 'cloud_upload' },
                { id: 'review-hitl', label: 'Review & HITL', icon: 'fact_check' },
                { id: 'schema-builder', label: 'Schema Builder', icon: 'schema' },
                { id: 'user-management', label: 'User Management', icon: 'group' },
                { id: 'gateway', label: 'Auth Gateway', icon: 'login' }
              ].map((tab) => {
                const isActive = currentScreen === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setCurrentScreen(tab.id as ActiveScreen)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                      isActive
                        ? 'bg-[#3198dc] text-[#002c47] font-bold shadow-sm'
                        : 'text-[#bfc7d2] hover:text-[#dae2fd] hover:bg-[#171f33]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="hidden xl:flex items-center gap-2 font-mono text-[11px] text-[#7bd0ff] px-2">
              <span className="w-2 h-2 rounded-full bg-[#7bd0ff] animate-pulse"></span>
              <span>Cluster Synced: AP-South-1</span>
            </div>
          </div>
        </div>

        {/* Dynamic Screen Viewport */}
        <main className="flex-1 px-4 lg:px-6 pb-12 w-full max-w-7xl">
          {currentScreen === 'dashboard' && (
            <DaywiseDashboard
              documents={documents}
              onNavigateToReview={handleNavigateToReview}
              onNavigate={setCurrentScreen}
            />
          )}

          {currentScreen === 'upload-queue' && (
            <UploadQueueScreen
              initialQueue={queueItems}
              onNavigateToReview={handleNavigateToReview}
              onNavigate={setCurrentScreen}
            />
          )}

          {currentScreen === 'review-hitl' && (
            <ReviewHITLScreen
              documentId={activeReviewDocId}
              onNavigate={setCurrentScreen}
              onDocumentApproved={handleDocumentApproved}
            />
          )}

          {currentScreen === 'schema-builder' && (
            <SchemaBuilderScreen initialFields={schemaFields} />
          )}

          {currentScreen === 'user-management' && (
            <UserManagementScreen
              users={users}
              policies={policies}
              onUpdatePolicies={setPolicies}
              onInviteUser={handleInviteUser}
            />
          )}

          {currentScreen === 'all-documents' && (
            <AllDocumentsView onNavigate={setCurrentScreen} documents={documents} />
          )}

          {currentScreen === 'history-audit' && (
            <HistoryAuditView onNavigate={setCurrentScreen} />
          )}

          {currentScreen === 'analytics-sla' && (
            <AnalyticsSlaView onNavigate={setCurrentScreen} />
          )}

          {currentScreen === 'engine-apis' && (
            <EngineApisView onNavigate={setCurrentScreen} />
          )}
        </main>
      </div>

      {/* Global Lookup ⌘K Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        documents={documents}
        users={users}
        onNavigateToDoc={handleNavigateToReview}
        onNavigate={setCurrentScreen}
      />
    </div>
  );
}
