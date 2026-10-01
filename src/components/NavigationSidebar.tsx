import React from 'react';
import { ActiveScreen } from '../types';

interface NavigationSidebarProps {
  currentScreen: ActiveScreen;
  onNavigate: (screen: ActiveScreen) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  unreviewedCount?: number;
}

export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  currentScreen,
  onNavigate,
  isOpenMobile,
  onCloseMobile,
  unreviewedCount = 42
}) => {
  const handleNav = (screen: ActiveScreen) => {
    onNavigate(screen);
    onCloseMobile();
  };

  const navClass = (screen: ActiveScreen) => {
    const isActive = currentScreen === screen;
    return `flex items-center justify-between px-3 py-2 rounded text-sm transition-colors cursor-pointer select-none ${
      isActive
        ? 'bg-[#222a3d] text-[#93ccff] border-l-2 border-[#93ccff] font-medium'
        : 'text-[#bfc7d2] hover:bg-[#171f33] hover:text-[#dae2fd]'
    }`;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Aside Container */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-[#131b2e] z-50 flex flex-col justify-between overflow-y-auto border-r border-[#3f4850]/30 transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col">
          {/* Brand Header */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-[#3f4850]/30">
            <div
              className="flex items-center gap-2.5 cursor-pointer"
              onClick={() => handleNav('dashboard')}
            >
              <div className="w-8 h-8 rounded bg-[#3198dc] flex items-center justify-center text-[#002c47] shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-sm tracking-tight text-[#dae2fd]">Azad AI</span>
                  <span className="px-1.5 py-0.5 bg-[#222a3d] rounded text-[#93ccff] text-[10px] font-mono border border-[#3f4850]/40">
                    v2.4
                  </span>
                </div>
                <span className="text-[10px] text-[#bfc7d2] truncate">
                  Enterprise Document Intelligence
                </span>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden w-8 h-8 rounded flex items-center justify-center text-[#bfc7d2] hover:text-white hover:bg-[#222a3d]"
              aria-label="Close menu"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col px-3 py-4 space-y-4">
            {/* Core Workflows */}
            <div className="flex flex-col space-y-1">
              <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-[#89929b]">
                Core Workflows
              </div>

              <button
                onClick={() => handleNav('dashboard')}
                className={navClass('dashboard')}
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[18px]">calendar_view_day</span>
                  <span>Day-wise Dashboard</span>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-[#3198dc]/20 text-[#93ccff] text-[11px] font-mono">
                  1,428
                </span>
              </button>

              <button
                onClick={() => handleNav('upload-queue')}
                className={navClass('upload-queue')}
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
                  <span>Upload & Queue</span>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-[#2d3449] text-[#7bd0ff] text-[11px] font-mono">
                  Live
                </span>
              </button>

              <button
                onClick={() => handleNav('review-hitl')}
                className={navClass('review-hitl')}
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[18px]">fact_check</span>
                  <span>Review & HITL</span>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-[#93000a] text-[#ffdad6] text-[11px] font-mono font-semibold">
                  {unreviewedCount}
                </span>
              </button>
            </div>

            {/* Data & Repositories */}
            <div className="flex flex-col space-y-1">
              <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-[#89929b]">
                Data & Repositories
              </div>

              <button
                onClick={() => handleNav('all-documents')}
                className={navClass('all-documents')}
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[18px]">inventory_2</span>
                  <span>All Documents</span>
                </div>
                <span className="text-[11px] font-mono text-[#89929b]">14.8k</span>
              </button>

              <button
                onClick={() => handleNav('history-audit')}
                className={navClass('history-audit')}
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                  <span>History & Audit Log</span>
                </div>
              </button>
            </div>

            {/* Platform & Schemas */}
            <div className="flex flex-col space-y-1">
              <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-[#89929b]">
                Platform & Schemas
              </div>

              <button
                onClick={() => handleNav('schema-builder')}
                className={navClass('schema-builder')}
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[18px]">schema</span>
                  <span>Field Schema Builder</span>
                </div>
              </button>

              <button
                onClick={() => handleNav('analytics-sla')}
                className={navClass('analytics-sla')}
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[18px]">query_stats</span>
                  <span>Analytics & SLA</span>
                </div>
                <span className="text-[11px] font-mono text-[#7bd0ff]">99.4%</span>
              </button>
            </div>

            {/* Administration */}
            <div className="flex flex-col space-y-1">
              <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-[#89929b]">
                Administration
              </div>

              <button
                onClick={() => handleNav('user-management')}
                className={navClass('user-management')}
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[18px]">group</span>
                  <span>User Management</span>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-[#2d3449] text-[#93ccff] text-[10px] font-mono">
                  RBAC
                </span>
              </button>

              <button
                onClick={() => handleNav('engine-apis')}
                className={navClass('engine-apis')}
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[18px]">tune</span>
                  <span>Engine & OCR APIs</span>
                </div>
              </button>

              <button
                onClick={() => handleNav('gateway')}
                className="flex items-center justify-between px-3 py-2 rounded text-sm text-[#bfc7d2] hover:bg-[#171f33] hover:text-[#93ccff] transition-colors mt-2"
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[18px] text-[#7bd0ff]">login</span>
                  <span>Auth Gateway Screen</span>
                </div>
                <span className="text-[10px] font-mono px-1 rounded bg-[#222a3d] text-[#7bd0ff]">v2.4.9</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Worker Node Health Footer */}
        <div className="p-3 border-t border-[#3f4850]/30 bg-[#060e20]/60">
          <div className="flex items-center justify-between p-2 rounded bg-[#222a3d]/60">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#7bd0ff] animate-pulse"></span>
              <span className="text-[11px] font-mono text-[#bfc7d2]">Azad Engine Nodes</span>
            </div>
            <span className="text-[11px] font-mono text-[#7bd0ff] font-medium">8/8 Active</span>
          </div>
        </div>
      </aside>
    </>
  );
};
