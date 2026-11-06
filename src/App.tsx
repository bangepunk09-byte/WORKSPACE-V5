/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { WorkspaceProvider, useWorkspace } from './context/WorkspaceContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { RightNotificationPanel } from './components/layout/RightNotificationPanel';
import { LoginPage } from './components/auth/LoginPage';
import { HomeDashboard } from './components/dashboard/HomeDashboard';
import { SocialFeed } from './components/feed/SocialFeed';
import { ChatMessaging } from './components/chat/ChatMessaging';
import { TaskManagement } from './components/tasks/TaskManagement';
import { DivisionTaskRequests } from './components/tasks/DivisionTaskRequests';
import { DivisionHub } from './components/division/DivisionHub';
import { MeetingSchedule } from './components/meetings/MeetingSchedule';
import { DocumentCenter } from './components/documents/DocumentCenter';
import { BrandDriveDirectory } from './components/drive/BrandDriveDirectory';
import { EmployeeDirectory } from './components/directory/EmployeeDirectory';
import { AdminCustomization } from './components/admin/AdminCustomization';
import { HuddleRoom } from './components/common/HuddleRoom';
import { CreateTaskModal } from './components/modals/CreateTaskModal';
import { CreateMeetingModal } from './components/modals/CreateMeetingModal';
import { UploadDocModal } from './components/modals/UploadDocModal';
import { LeaveRequestModal } from './components/modals/LeaveRequestModal';
import { QuickSearchModal } from './components/modals/QuickSearchModal';
import { BrandManagementModal } from './components/modals/BrandManagementModal';
import { ModernDatabaseHub } from './components/database/ModernDatabaseHub';
import {
  LayoutDashboard,
  MessageSquareText,
  MessagesSquare,
  Kanban,
  CalendarDays,
  FileText,
  Users,
  Bell,
  ShieldCheck,
  MoreHorizontal
} from 'lucide-react';

const MainLayout: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    quickActionModal,
    setQuickActionModal,
    unreadNotificationsCount,
    isAuthenticated,
    isDbHubOpen,
    setIsDbHubOpen,
    leaveApprovalToast,
    setLeaveApprovalToast,
    themeSettings
  } = useWorkspace();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Global ESC key listener to close any open quick action modal or popup
  React.useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (quickActionModal) setQuickActionModal(null);
        if (isDbHubOpen) setIsDbHubOpen(false);
        if (leaveApprovalToast) setLeaveApprovalToast(null);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [quickActionModal, isDbHubOpen, leaveApprovalToast, setQuickActionModal, setIsDbHubOpen, setLeaveApprovalToast]);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const isCustomBg = themeSettings.bgPattern === 'solid' || themeSettings.bgPattern === 'gradient';
  const patternClass = themeSettings.bgPattern && themeSettings.bgPattern !== 'clean' ? `bg-pattern-${themeSettings.bgPattern}` : '';
  const bgClass = isCustomBg
    ? ''
    : patternClass
    ? 'bg-slate-50/75 dark:bg-slate-950/75'
    : 'bg-slate-50 dark:bg-slate-950';

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <HomeDashboard />;
      case 'feed':
        return <SocialFeed />;
      case 'chat':
        return <ChatMessaging />;
      case 'division':
        return <DivisionHub />;
      case 'tasks':
        return <TaskManagement />;
      case 'requests':
        return <DivisionTaskRequests />;
      case 'meetings':
        return <MeetingSchedule />;
      case 'documents':
        return <DocumentCenter />;
      case 'drive':
        return <BrandDriveDirectory />;
      case 'directory':
        return <EmployeeDirectory />;
      case 'admin':
        return <AdminCustomization />;
      default:
        return <HomeDashboard />;
    }
  };

  return (
    <div
      className={`flex h-screen w-full overflow-hidden text-slate-900 transition-colors dark:text-slate-100 font-sans ${patternClass} ${bgClass}`}
      style={
        themeSettings.bgPattern === 'solid' && themeSettings.customBgSolidColor
          ? { backgroundColor: themeSettings.customBgSolidColor }
          : themeSettings.bgPattern === 'gradient' && themeSettings.customBgGradient
          ? { backgroundImage: themeSettings.customBgGradient, backgroundSize: 'cover', backgroundAttachment: 'fixed' }
          : undefined
      }
    >
      {/* Sidebar */}
      <Sidebar isMobileOpen={isMobileMenuOpen} onCloseMobile={() => setIsMobileMenuOpen(false)} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navbar */}
        <Navbar
          isMobileMenuOpen={isMobileMenuOpen}
          onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        {/* Main Viewport Content & Real-time Right Notifications */}
        <div className="flex flex-1 overflow-hidden relative">
          <main
            className={`flex-1 overflow-hidden ${patternClass} ${
              activeTab === 'chat'
                ? 'h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)] p-0 pb-16 md:pb-0'
                : 'overflow-y-auto px-3.5 py-4 sm:px-6 sm:py-6 pb-24 md:pb-6'
            }`}
          >
            {activeTab === 'chat' ? (
              renderActiveView()
            ) : (
              <div className="mx-auto max-w-7xl">
                {renderActiveView()}
              </div>
            )}
          </main>

          {/* Persistent Real-time Right Notification Panel */}
          <RightNotificationPanel />
        </div>

        {/* Mobile Bottom Navigation Bar (for convenient field / mobile phone access) */}
        <nav className="fixed bottom-0 inset-x-0 z-30 flex h-16 items-center justify-around border-t border-slate-200 bg-white/95 px-2 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 md:hidden">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center p-1 text-[10px] font-semibold transition ${
              activeTab === 'dashboard' ? 'text-slate-950 dark:text-white font-bold' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span>Home</span>
            {activeTab === 'dashboard' && <span className="h-1 w-1 rounded-full bg-red-600 mt-0.5" />}
          </button>

          <button
            onClick={() => setActiveTab('feed')}
            className={`flex flex-col items-center justify-center p-1 text-[10px] font-semibold transition ${
              activeTab === 'feed' ? 'text-slate-950 dark:text-white font-bold' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <MessageSquareText className="h-5 w-5" />
            <span>Feed</span>
            {activeTab === 'feed' && <span className="h-1 w-1 rounded-full bg-red-600 mt-0.5" />}
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`flex flex-col items-center justify-center p-1 text-[10px] font-semibold transition relative ${
              activeTab === 'chat' ? 'text-slate-950 dark:text-white font-bold' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <MessagesSquare className="h-5 w-5" />
            <span>Chat</span>
            {activeTab === 'chat' && <span className="h-1 w-1 rounded-full bg-red-600 mt-0.5" />}
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex flex-col items-center justify-center p-1 text-[10px] font-semibold transition ${
              activeTab === 'tasks' ? 'text-slate-950 dark:text-white font-bold' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Kanban className="h-5 w-5" />
            <span>Tasks</span>
            {activeTab === 'tasks' && <span className="h-1 w-1 rounded-full bg-red-600 mt-0.5" />}
          </button>

          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex flex-col items-center justify-center p-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400"
          >
            <MoreHorizontal className="h-5 w-5" />
            <span>Menu</span>
          </button>
        </nav>
      </div>

      {/* Global Modals */}
      {quickActionModal === 'task' && (
        <CreateTaskModal onClose={() => setQuickActionModal(null)} />
      )}
      {quickActionModal === 'meeting' && (
        <CreateMeetingModal onClose={() => setQuickActionModal(null)} />
      )}
      {quickActionModal === 'post' && (
        // Switch to feed and close modal
        (() => {
          setActiveTab('feed');
          setQuickActionModal(null);
          return null;
        })()
      )}
      {quickActionModal === 'document' && (
        <UploadDocModal onClose={() => setQuickActionModal(null)} />
      )}
      {quickActionModal === 'leave' && (
        <LeaveRequestModal onClose={() => setQuickActionModal(null)} />
      )}

      {/* Floating Global Leave Request Celebration & Status Alert */}
      {leaveApprovalToast && (
        <div className="fixed top-5 inset-x-0 z-50 flex justify-center px-4 pointer-events-none animate-in slide-in-from-top duration-300">
          <div className="pointer-events-auto max-w-xl rounded-2xl bg-slate-950/95 dark:bg-white/95 text-white dark:text-slate-950 px-5 py-3.5 shadow-2xl backdrop-blur-md border border-white/20 dark:border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xl shrink-0">🏖️</span>
              <p className="text-xs sm:text-sm font-bold leading-snug">
                {leaveApprovalToast}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setLeaveApprovalToast(null)}
              className="text-xs font-bold text-white/70 hover:text-white dark:text-slate-600 dark:hover:text-slate-900 cursor-pointer shrink-0"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Global ⌘K Search Spotlight Modal */}
      <QuickSearchModal />

      {/* Brand & Company Label Management Modal */}
      <BrandManagementModal />

      {/* Modern Database Hub Modal */}
      <ModernDatabaseHub isOpen={isDbHubOpen} onClose={() => setIsDbHubOpen(false)} />

      {/* Global Live Huddle Room & Minimized Call Bar */}
      <HuddleRoom />
    </div>
  );
};

export default function App() {
  return (
    <WorkspaceProvider>
      <MainLayout />
    </WorkspaceProvider>
  );
}
