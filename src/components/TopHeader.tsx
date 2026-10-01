import React, { useState } from 'react';
import { UserAccount, ActiveScreen } from '../types';

interface TopHeaderProps {
  currentUser: UserAccount;
  onSelectUser: (user: UserAccount) => void;
  availableUsers: UserAccount[];
  onOpenUpload: () => void;
  onOpenSearch: () => void;
  onToggleMobileNav: () => void;
  onNavigate: (screen: ActiveScreen) => void;
  unreadAlertsCount?: number;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentUser,
  onSelectUser,
  availableUsers,
  onOpenUpload,
  onOpenSearch,
  onToggleMobileNav,
  onNavigate,
  unreadAlertsCount = 2
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  const handleAlertClick = () => {
    setNotificationToast(
      '2 alert items: Math variance on XYZ_Vendor_Inv.pdf (₹300) & Subtotal delta on Delta_Air_Courier.pdf (₹240).'
    );
    setTimeout(() => setNotificationToast(null), 4000);
  };

  return (
    <header className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-[#0b1326]/90 backdrop-blur-xl border-b border-[#3f4850]/30 z-40 flex items-center justify-between px-4 lg:px-6 gap-3">
      {/* Left: Mobile hamburger & Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-2xl">
        <button
          onClick={onToggleMobileNav}
          className="lg:hidden w-9 h-9 rounded flex items-center justify-center text-[#bfc7d2] hover:text-white hover:bg-[#222a3d]"
          aria-label="Open sidebar menu"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>

        <div className="relative w-full" onClick={onOpenSearch}>
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#89929b] text-[18px]">
            search
          </span>
          <input
            readOnly
            className="w-full h-9 pl-9 pr-3 bg-[#131b2e] rounded border border-[#3f4850]/40 text-xs sm:text-sm text-[#dae2fd] placeholder:text-[#89929b] focus:outline-none focus:border-[#93ccff] transition-colors cursor-pointer"
            placeholder="Global lookup by Customer, Invoice #, GSTIN, Doc ID... (Press ⌘K)"
            type="text"
          />
          <kbd className="hidden sm:inline-block absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-[#222a3d] text-[10px] font-mono text-[#89929b]">
            ⌘K
          </kbd>
        </div>

        {/* SLA & Today's Volume Metrics (Desktop) */}
        <div className="hidden xl:flex items-center gap-4 pl-4 border-l border-[#3f4850]/30 shrink-0">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono uppercase text-[#89929b]">Pipeline SLA</span>
            <span className="text-xs font-mono text-[#7bd0ff] font-semibold">99.4%</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-mono uppercase text-[#89929b]">Today's Volume</span>
            <span className="text-xs font-mono text-[#dae2fd] font-semibold">1,428 docs</span>
          </div>
        </div>
      </div>

      {/* Right: Actions, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Upload Button */}
        <button
          onClick={onOpenUpload}
          className="h-9 px-3 sm:px-4 bg-[#93ccff] text-[#003351] font-semibold text-xs sm:text-sm rounded flex items-center gap-1.5 hover:bg-[#3198dc] hover:text-[#002c47] transition-colors shadow-sm"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span className="hidden xs:inline">Upload PDFs</span>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={handleAlertClick}
            aria-label="Review Alerts"
            className="relative w-9 h-9 flex items-center justify-center rounded border border-[#3f4850]/40 text-[#bfc7d2] hover:text-[#dae2fd] hover:bg-[#222a3d] transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {unreadAlertsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#ffb4ab] ring-2 ring-[#0b1326]"></span>
            )}
          </button>

          {/* Quick Notification Toast */}
          {notificationToast && (
            <div className="absolute right-0 top-12 w-72 sm:w-80 p-3 bg-[#222a3d] border border-[#3f4850] rounded-lg shadow-xl text-xs text-[#dae2fd] z-50 animate-in fade-in slide-in-from-top-1">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[#7bd0ff] text-[18px] shrink-0">info</span>
                <p className="leading-snug">{notificationToast}</p>
              </div>
            </div>
          )}
        </div>

        {/* Profile Lockup & Switcher */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-[#3f4850]/30 hover:opacity-90 transition-opacity"
            type="button"
          >
            <div className="flex flex-col text-right hidden sm:flex">
              <span className="text-xs sm:text-sm font-semibold text-[#dae2fd] leading-tight truncate max-w-[130px]">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-[#bfc7d2] truncate max-w-[130px]">
                {currentUser.roleTag} • Enterprise Tier
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#93ccff] text-[#003351] font-semibold text-xs flex items-center justify-center shrink-0 shadow-sm">
              {currentUser.initials}
            </div>
          </button>

          {/* Dropdown Menu */}
          {userMenuOpen && (
            <div
              className="absolute right-0 top-12 w-64 bg-[#171f33] border border-[#3f4850]/60 rounded-xl shadow-2xl p-2 z-50 text-xs"
              onMouseLeave={() => setUserMenuOpen(false)}
            >
              <div className="px-2.5 py-2 border-b border-[#3f4850]/30 mb-1">
                <p className="font-semibold text-[#dae2fd]">{currentUser.name}</p>
                <p className="text-[11px] text-[#bfc7d2] font-mono truncate">{currentUser.email}</p>
                <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-[#222a3d] text-[#7bd0ff] text-[10px] font-mono">
                  {currentUser.role}
                </span>
              </div>

              <div className="px-2.5 py-1 text-[10px] font-mono uppercase text-[#89929b]">
                Switch Active Profile
              </div>

              {availableUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => {
                    onSelectUser(user);
                    setUserMenuOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between transition-colors ${
                    user.id === currentUser.id
                      ? 'bg-[#222a3d] text-[#93ccff]'
                      : 'hover:bg-[#131b2e] text-[#dae2fd]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded bg-[#3198dc]/20 text-[#7bd0ff] flex items-center justify-center text-[10px] font-mono font-bold shrink-0">
                      {user.initials}
                    </span>
                    <span className="truncate">{user.name}</span>
                  </div>
                  <span className="text-[10px] text-[#89929b] font-mono">{user.roleTag}</span>
                </button>
              ))}

              <div className="border-t border-[#3f4850]/30 mt-1.5 pt-1.5">
                <button
                  onClick={() => {
                    onNavigate('gateway');
                    setUserMenuOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded hover:bg-[#222a3d] text-[#ffb4ab] flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px]">lock</span>
                  <span>Lock Gateway / Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
