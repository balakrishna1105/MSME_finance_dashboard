import React, { useState } from 'react';
import { UserAccount, SecurityPolicies } from '../types';
import { RBAC_MATRIX } from '../data/mockData';

interface UserManagementScreenProps {
  users: UserAccount[];
  policies: SecurityPolicies;
  onUpdatePolicies: (updated: SecurityPolicies) => void;
  onInviteUser: (user: Partial<UserAccount>) => void;
}

export const UserManagementScreen: React.FC<UserManagementScreenProps> = ({
  users,
  policies,
  onUpdatePolicies,
  onInviteUser
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());

  // Policy toggles
  const [sessionExpiry, setSessionExpiry] = useState<boolean>(policies.sessionExpiry14d);
  const [fidoSchema, setFidoSchema] = useState<boolean>(policies.fido2ForSchema);
  const [ipWhite, setIpWhite] = useState<boolean>(policies.ipWhitelisting);
  const [cidrs, setCidrs] = useState<string[]>(policies.activeCidrs);

  // Invite modal
  const [inviteModalOpen, setInviteModalOpen] = useState<boolean>(false);
  const [inviteName, setInviteName] = useState<string>('');
  const [inviteEmail, setInviteEmail] = useState<string>('');
  const [inviteRole, setInviteRole] = useState<string>('HITL Verification Lead');
  const [inviteDept, setInviteDept] = useState<string>('Risk & Review');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleRemoveCidr = (cidrToRemove: string) => {
    const updated = cidrs.filter((c) => c !== cidrToRemove);
    setCidrs(updated);
    showToast(`Removed CIDR rule: ${cidrToRemove}`);
  };

  const handleApplySecurity = () => {
    onUpdatePolicies({
      sessionExpiry14d: sessionExpiry,
      fido2ForSchema: fidoSchema,
      ipWhitelisting: ipWhite,
      activeCidrs: cidrs
    });
    showToast('Applied updated cryptographic security policies and CIDR ingress whitelist.');
  };

  const toggleSelectUser = (id: string) => {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) return;

    onInviteUser({
      name: inviteName.trim(),
      email: inviteEmail.trim(),
      role: inviteRole,
      roleTag: inviteRole.includes('Lead') ? 'Reviewer' : 'Auditor',
      department: inviteDept,
      status: 'Pending Invite'
    });

    setInviteModalOpen(false);
    setInviteName('');
    setInviteEmail('');
    showToast(`Invitation dispatched to ${inviteEmail}. SCIM token provisioned.`);
  };

  const filteredUsers = users.filter((u) => {
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const match =
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.department.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (roleFilter !== 'all' && !u.role.toLowerCase().includes(roleFilter.toLowerCase())) return false;
    if (deptFilter !== 'all' && u.department !== deptFilter) return false;
    if (statusFilter !== 'all' && u.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="flex flex-col w-full space-y-6">
      {/* Top Alert Banner / SCIM Ribbon */}
      <div className="w-full bg-[#222a3d] px-4 py-2.5 rounded-lg shadow-sm flex flex-wrap items-center justify-between gap-3 border border-[#3f4850]/30">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-[#7bd0ff] animate-ping shrink-0"></span>
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-[#7bd0ff] font-semibold uppercase tracking-wider">SCIM Okta Sync:</span>
            <span className="text-[#dae2fd]">Auto-provisioning active. 3 new profile updates pushed 4 minutes ago.</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-[#bfc7d2] uppercase tracking-wider hidden sm:inline">
            Sync Token ID:
          </span>
          <span className="font-mono text-[11px] px-2 py-0.5 bg-[#060e20] rounded text-[#93ccff] border border-[#3f4850]/30">
            azad-okta-8849-scim-prod
          </span>
        </div>
      </div>

      {/* Primary Page Action & Metadata Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2">
        <div className="flex flex-col space-y-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#dae2fd] tracking-tight">
              User & Access Management
            </h1>
            <div className="px-2.5 py-0.5 bg-[#222a3d] rounded text-[#93ccff] font-mono text-xs border border-[#3f4850]/40">
              38 Active Members • 3 Pending Invites
            </div>
          </div>
          <p className="text-xs sm:text-sm text-[#bfc7d2] max-w-3xl leading-relaxed">
            Provision enterprise roles, audit team permissions, configure SSO directory sync, and enforce high-assurance security policies across Azad high-throughput document pipelines.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => showToast('Opening SCIM 2.0 / Okta SSO integration panel...')}
            className="h-9 px-3 bg-[#171f33] hover:bg-[#222a3d] text-[#dae2fd] text-xs font-semibold rounded flex items-center gap-1.5 transition-colors border border-[#3f4850]/40 shadow-sm"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px] text-[#7bd0ff]">cloud_sync</span>
            <span>Configure SCIM / SSO</span>
          </button>
          <button
            onClick={() => showToast('Generated compliance audit CSV report.')}
            className="h-9 px-3 bg-[#171f33] hover:bg-[#222a3d] text-[#dae2fd] text-xs font-semibold rounded flex items-center gap-1.5 transition-colors border border-[#3f4850]/40 shadow-sm"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px] text-[#bfc7d2]">file_download</span>
            <span>Export Audit CSV</span>
          </button>
          <button
            onClick={() => setInviteModalOpen(true)}
            className="h-9 px-4 bg-[#93ccff] text-[#003351] hover:bg-[#3198dc] hover:text-[#002c47] font-semibold text-xs rounded flex items-center gap-1.5 transition-colors shadow-sm"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span>+ Invite New User</span>
          </button>
        </div>
      </div>

      {/* Top Metric Bento Analytical Cards (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: Total Users */}
        <div className="bg-[#131b2e] p-4 rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden border border-[#3f4850]/30">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#89929b]">Total Directory Users</span>
            <span className="px-2 py-0.5 bg-[#222a3d] rounded text-[#7bd0ff] font-mono text-[10px] border border-[#3f4850]/30">
              +4 this mo
            </span>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl sm:text-4xl font-bold text-[#dae2fd] font-mono">41</span>
            <span className="text-sm font-semibold text-[#89929b]">Total Accounts</span>
          </div>
          <div className="flex items-center justify-between font-mono text-[10px] text-[#bfc7d2] pt-2 border-t border-[#3f4850]/20">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7bd0ff]"></span> 38 Active
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#b4c5ff]"></span> 3 Invited
            </span>
            <span className="text-[#7bd0ff] font-semibold">Okta Sync OK</span>
          </div>
        </div>

        {/* Card 2: Role Breakdown */}
        <div className="bg-[#131b2e] p-4 rounded-xl shadow-sm flex flex-col justify-between border border-[#3f4850]/30">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#89929b]">Role Breakdown</span>
            <span className="material-symbols-outlined text-[18px] text-[#89929b]">admin_panel_settings</span>
          </div>
          <div className="flex items-center gap-1 mb-2 h-2 rounded-full overflow-hidden bg-[#2d3449]">
            <div className="bg-[#93ccff] h-full" style={{ width: '15%' }} title="6 Admins"></div>
            <div className="bg-[#7bd0ff] h-full" style={{ width: '44%' }} title="18 HITL Reviewers"></div>
            <div className="bg-[#0053db] h-full" style={{ width: '29%' }} title="12 Schema Engineers"></div>
            <div className="bg-[#89929b] h-full" style={{ width: '12%' }} title="5 Read-Only Auditors"></div>
          </div>
          <div className="grid grid-cols-2 gap-1.5 font-mono text-xs">
            <div className="flex items-center justify-between px-2 py-1 bg-[#171f33] rounded border border-[#3f4850]/20">
              <span className="text-[#bfc7d2]">Admins</span>
              <span className="text-[#93ccff] font-bold">6</span>
            </div>
            <div className="flex items-center justify-between px-2 py-1 bg-[#171f33] rounded border border-[#3f4850]/20">
              <span className="text-[#bfc7d2]">Reviewers</span>
              <span className="text-[#7bd0ff] font-bold">18</span>
            </div>
            <div className="flex items-center justify-between px-2 py-1 bg-[#171f33] rounded border border-[#3f4850]/20">
              <span className="text-[#bfc7d2]">Engineers</span>
              <span className="text-[#b4c5ff] font-bold">12</span>
            </div>
            <div className="flex items-center justify-between px-2 py-1 bg-[#171f33] rounded border border-[#3f4850]/20">
              <span className="text-[#bfc7d2]">Auditors</span>
              <span className="text-[#89929b] font-bold">5</span>
            </div>
          </div>
        </div>

        {/* Card 3: Active Live Workstations */}
        <div className="bg-[#131b2e] p-4 rounded-xl shadow-sm flex flex-col justify-between border border-[#3f4850]/30">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#89929b]">Active Pipeline Sessions</span>
            <span className="px-2 py-0.5 bg-[#3198dc]/20 text-[#93ccff] font-mono text-[10px] rounded border border-[#3198dc]/30">
              Cluster AP-South-1
            </span>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl sm:text-4xl font-bold text-[#7bd0ff] font-mono">14</span>
            <span className="text-sm font-semibold text-[#dae2fd]">Live Operators</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#bfc7d2] pt-2 border-t border-[#3f4850]/20">
            <span className="w-2 h-2 rounded-full bg-[#7bd0ff] animate-pulse"></span>
            <span>
              Throughput: <strong className="text-[#dae2fd] font-mono">480 doc/hr</strong>
            </span>
          </div>
        </div>

        {/* Card 4: Security Posture */}
        <div className="bg-[#131b2e] p-4 rounded-xl shadow-sm flex flex-col justify-between border border-[#3f4850]/30">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#89929b]">Security Compliance</span>
            <span className="material-symbols-outlined text-[18px] text-[#7bd0ff]">verified_user</span>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl sm:text-4xl font-bold text-[#93ccff] font-mono">100%</span>
            <span className="text-sm font-semibold text-[#dae2fd]">MFA Enforced</span>
          </div>
          <div className="flex items-center justify-between font-mono text-[10px] pt-2 text-[#bfc7d2] border-t border-[#3f4850]/20">
            <span className="text-[#7bd0ff] font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">check_circle</span> 0 Failed Auth
            </span>
            <span className="text-[#89929b]">FIPS 140-2 Valid</span>
          </div>
        </div>
      </div>

      {/* Filter & Command Bar */}
      <div className="bg-[#131b2e] p-3 rounded-lg flex flex-wrap items-center justify-between gap-3 border border-[#3f4850]/30 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[300px]">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[#89929b] text-[18px]">
              search
            </span>
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users by name, email, department, or key ID..."
              className="w-full h-8 pl-8 pr-3 bg-[#222a3d] rounded text-xs text-[#dae2fd] placeholder:text-[#89929b] focus:outline-none border border-[#3f4850]/40"
              type="text"
            />
          </div>

          {/* Role Filter */}
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-8 px-3 pr-7 bg-[#222a3d] text-[#dae2fd] text-xs rounded appearance-none focus:outline-none cursor-pointer border border-[#3f4850]/40"
            >
              <option value="all">All Roles</option>
              <option value="Administrator">Administrator (Super)</option>
              <option value="HITL">HITL Verification Lead</option>
              <option value="Schema">Schema & Prompt Engineer</option>
              <option value="Compliance">Compliance Auditor</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[#89929b] text-[16px] pointer-events-none">
              expand_more
            </span>
          </div>

          {/* Department Filter */}
          <div className="relative">
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="h-8 px-3 pr-7 bg-[#222a3d] text-[#dae2fd] text-xs rounded appearance-none focus:outline-none cursor-pointer border border-[#3f4850]/40"
            >
              <option value="all">All Departments</option>
              <option value="Finance OCR">Finance OCR</option>
              <option value="Risk & Review">Risk & Review</option>
              <option value="Platform Ops">Platform Ops</option>
              <option value="Security & Audit">Security & Audit</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[#89929b] text-[16px] pointer-events-none">
              expand_more
            </span>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 px-3 pr-7 bg-[#222a3d] text-[#dae2fd] text-xs rounded appearance-none focus:outline-none cursor-pointer border border-[#3f4850]/40"
            >
              <option value="all">Status: All</option>
              <option value="Active">Status: Active (38)</option>
              <option value="Pending Invite">Status: Pending Invite (3)</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[#89929b] text-[16px] pointer-events-none">
              expand_more
            </span>
          </div>
        </div>

        {/* Bulk Selected Actions */}
        <div className="flex items-center gap-1.5 shrink-0 font-mono text-[11px]">
          <span className="text-[#89929b] hidden md:inline">Bulk ({selectedUserIds.size}):</span>
          <button
            onClick={() => showToast('Role update modal invoked for selected accounts.')}
            className="h-7 px-2.5 bg-[#222a3d] hover:bg-[#31394d] text-[#bfc7d2] hover:text-[#dae2fd] rounded transition-colors border border-[#3f4850]/30"
            type="button"
          >
            Change Role
          </button>
          <button
            onClick={() => showToast('Resent invitation tokens.')}
            className="h-7 px-2.5 bg-[#222a3d] hover:bg-[#31394d] text-[#bfc7d2] hover:text-[#dae2fd] rounded transition-colors border border-[#3f4850]/30"
            type="button"
          >
            Resend
          </button>
          <button
            onClick={() => showToast('Suspended selected accounts.')}
            className="h-7 px-2.5 bg-[#93000a] text-[#ffdad6] hover:bg-red-700 rounded transition-colors"
            type="button"
          >
            Suspend
          </button>
        </div>
      </div>

      {/* Main High-Density Users Table */}
      <div className="w-full bg-[#131b2e] rounded-xl shadow-sm overflow-hidden border border-[#3f4850]/30">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-[#171f33] text-[#89929b] font-mono text-[10px] uppercase tracking-wider border-b border-[#3f4850]/20">
                <th className="py-2.5 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedUserIds.size > 0 && selectedUserIds.size === filteredUsers.length}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedUserIds(new Set(filteredUsers.map((u) => u.id)));
                      else setSelectedUserIds(new Set());
                    }}
                    className="rounded bg-[#060e20] border-[#3f4850]/40 text-[#93ccff] cursor-pointer"
                  />
                </th>
                <th className="py-2.5 px-3">Operator / Identity</th>
                <th className="py-2.5 px-3">Enterprise Role</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Pipeline Scope & Permissions</th>
                <th className="py-2.5 px-3">MFA / Identity Provider</th>
                <th className="py-2.5 px-3">Last Workstation Activity</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3f4850]/15 text-xs text-[#dae2fd]">
              {filteredUsers.map((usr) => {
                const isSelected = selectedUserIds.has(usr.id);
                const isPending = usr.status === 'Pending Invite';

                return (
                  <tr
                    key={usr.id}
                    className={`transition-colors ${
                      isPending ? 'bg-[#060e20]/30 hover:bg-[#171f33]/40' : 'hover:bg-[#171f33]'
                    }`}
                  >
                    <td className="py-2.5 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectUser(usr.id)}
                        className="rounded bg-[#060e20] border-[#3f4850]/40 text-[#93ccff] cursor-pointer"
                      />
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded bg-[#3198dc]/20 text-[#93ccff] flex items-center justify-center font-mono font-bold text-xs shrink-0 border border-[#3198dc]/30">
                          {usr.initials}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-xs text-[#dae2fd] truncate">{usr.name}</span>
                          <span className="font-mono text-[10px] text-[#89929b] truncate">{usr.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-[#222a3d] text-[#93ccff] font-mono text-[10px] font-semibold border border-[#3f4850]/40">
                        {usr.role}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 font-medium text-[#bfc7d2]">{usr.department}</td>

                    <td className="py-2.5 px-3">
                      <div className="flex flex-col">
                        <span className="font-mono text-xs text-[#7bd0ff]">{usr.scope}</span>
                        <span className="font-mono text-[10px] text-[#89929b]">{usr.scopeDetails}</span>
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <span className="material-symbols-outlined text-[15px] text-[#7bd0ff]">
                          {usr.mfaType === 'fido' ? 'key' : usr.mfaType === 'totp' ? 'smartphone' : 'security'}
                        </span>
                        <span className={isPending ? 'italic text-[#89929b]' : 'text-[#dae2fd]'}>
                          {usr.mfaProvider}
                        </span>
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="flex flex-col font-mono">
                        <span className="text-xs text-[#dae2fd]">{usr.lastActivity}</span>
                        <span className="text-[10px] text-[#89929b]">{usr.location}</span>
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      {isPending ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#222a3d] text-[#b4c5ff] font-mono text-[10px] border border-[#3f4850]/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#b4c5ff]"></span>
                          <span>Pending Invite</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#222a3d] text-[#7bd0ff] font-mono text-[10px] border border-[#3f4850]/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#7bd0ff] animate-pulse"></span>
                          <span>Active</span>
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      {isPending ? (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => showToast(`Resent invitation to ${usr.email}.`)}
                            className="h-6 px-2 bg-[#222a3d] hover:bg-[#31394d] text-[#93ccff] font-mono text-[10px] rounded border border-[#3f4850]/40"
                          >
                            Resend
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1 text-[#89929b]">
                          <button
                            onClick={() => showToast(`Opened permissions editor for ${usr.name}.`)}
                            className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#222a3d] hover:text-[#dae2fd]"
                            title="Edit Permissions"
                          >
                            <span className="material-symbols-outlined text-[16px]">tune</span>
                          </button>
                          <button
                            onClick={() => showToast(`Access audit trail for ${usr.name} retrieved.`)}
                            className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#222a3d] hover:text-[#dae2fd]"
                            title="Audit Log"
                          >
                            <span className="material-symbols-outlined text-[16px]">history</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Footer */}
        <div className="bg-[#171f33] px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#3f4850]/20">
          <span className="font-mono text-[11px] text-[#bfc7d2]">
            Showing 1 to {filteredUsers.length} of 41 total platform users (38 Active, 3 Pending)
          </span>
          <div className="flex items-center gap-1 font-mono text-xs">
            <button className="h-7 px-2.5 bg-[#222a3d] text-[#89929b] rounded border border-[#3f4850]/30" disabled>
              Previous
            </button>
            <button className="h-7 w-7 bg-[#93ccff] text-[#003351] font-bold rounded">1</button>
            <button className="h-7 w-7 bg-[#222a3d] hover:bg-[#31394d] text-[#dae2fd] rounded border border-[#3f4850]/30">
              2
            </button>
            <button className="h-7 w-7 bg-[#222a3d] hover:bg-[#31394d] text-[#dae2fd] rounded border border-[#3f4850]/30">
              3
            </button>
            <button className="h-7 px-2.5 bg-[#222a3d] hover:bg-[#31394d] text-[#dae2fd] rounded border border-[#3f4850]/30">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Lower Split Workbench: RBAC Matrix & Enterprise Policy Controls */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Left Column: Role-Based Access Control Matrix (7 Cols) */}
        <div className="xl:col-span-7 bg-[#131b2e] p-5 rounded-xl shadow-sm border border-[#3f4850]/30 space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-[#3f4850]/20">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#93ccff] rounded-full"></span>
              <h2 className="text-base font-semibold text-[#dae2fd] tracking-tight">
                Azad Role-Based Access Control (RBAC) Matrix
              </h2>
            </div>
            <span className="font-mono text-[10px] text-[#89929b] uppercase tracking-wider">
              Policy Engine: v4.2
            </span>
          </div>
          <p className="text-xs text-[#bfc7d2]">
            Configured granular capabilities across Azad document pipelines, engine micro-services, and audit log streams.
          </p>

          <div className="overflow-x-auto pt-1">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-[#171f33] text-[#89929b] font-mono text-[10px] uppercase tracking-wider border-b border-[#3f4850]/20">
                  <th className="py-2 px-3">Pipeline Capability</th>
                  <th className="py-2 px-2 text-center">Super Admin</th>
                  <th className="py-2 px-2 text-center">HITL Lead</th>
                  <th className="py-2 px-2 text-center">Schema Eng</th>
                  <th className="py-2 px-2 text-center">Auditor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3f4850]/20 text-xs">
                {RBAC_MATRIX.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#171f33]/50">
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-[#dae2fd]">{item.capability}</div>
                      <div className="font-mono text-[10px] text-[#89929b]">{item.description}</div>
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <span className="material-symbols-outlined text-[18px] text-[#7bd0ff]">check_circle</span>
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      {item.hitlLead ? (
                        <span className="material-symbols-outlined text-[18px] text-[#7bd0ff]">check_circle</span>
                      ) : (
                        <span className="material-symbols-outlined text-[18px] text-[#89929b]">remove_circle_outline</span>
                      )}
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      {item.schemaEng ? (
                        <span className="material-symbols-outlined text-[18px] text-[#7bd0ff]">check_circle</span>
                      ) : (
                        <span className="material-symbols-outlined text-[18px] text-[#89929b]">remove_circle_outline</span>
                      )}
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      {item.auditor ? (
                        <span className="material-symbols-outlined text-[18px] text-[#7bd0ff]">check_circle</span>
                      ) : (
                        <span className="material-symbols-outlined text-[18px] text-[#89929b]">remove_circle_outline</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Security Policies & Guardrails (5 Cols) */}
        <div className="xl:col-span-5 bg-[#131b2e] p-5 rounded-xl shadow-sm border border-[#3f4850]/30 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-[#3f4850]/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#93ccff] text-[20px]">gavel</span>
                <h2 className="text-base font-semibold text-[#dae2fd] tracking-tight">
                  Security Policies & Guardrails
                </h2>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#222a3d] text-[#7bd0ff] font-mono text-[10px] border border-[#7bd0ff]/30">
                SOC 2 Type II
              </span>
            </div>

            <p className="text-xs text-[#bfc7d2]">
              Enforce cryptographic and session security requirements for all operators accessing Azad production nodes.
            </p>

            {/* Toggle 1 */}
            <div className="p-3 bg-[#171f33] rounded-lg flex items-center justify-between gap-3 border border-[#3f4850]/20">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[#dae2fd]">Enforce 14-day Session Expiry</span>
                <span className="text-[10px] text-[#89929b]">
                  Requires re-authentication and MFA token invalidation after 14 continuous days.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSessionExpiry(!sessionExpiry)}
                className={`w-10 h-5 rounded-full relative transition-colors shrink-0 ${
                  sessionExpiry ? 'bg-[#93ccff]' : 'bg-[#222a3d]'
                }`}
              >
                <span
                  className={`w-3.5 h-3.5 rounded-full absolute top-0.5 transition-transform ${
                    sessionExpiry ? 'bg-[#003351] right-0.5' : 'bg-[#89929b] left-0.5'
                  }`}
                ></span>
              </button>
            </div>

            {/* Toggle 2 */}
            <div className="p-3 bg-[#171f33] rounded-lg flex items-center justify-between gap-3 border border-[#3f4850]/20">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[#dae2fd]">
                  Hardware Key (FIDO2) for Schema Publishing
                </span>
                <span className="text-[10px] text-[#89929b]">
                  Mandate physical security dongle touch before committing JSON field changes to production pipelines.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setFidoSchema(!fidoSchema)}
                className={`w-10 h-5 rounded-full relative transition-colors shrink-0 ${
                  fidoSchema ? 'bg-[#93ccff]' : 'bg-[#222a3d]'
                }`}
              >
                <span
                  className={`w-3.5 h-3.5 rounded-full absolute top-0.5 transition-transform ${
                    fidoSchema ? 'bg-[#003351] right-0.5' : 'bg-[#89929b] left-0.5'
                  }`}
                ></span>
              </button>
            </div>

            {/* Toggle 3 */}
            <div className="p-3 bg-[#171f33] rounded-lg flex items-center justify-between gap-3 border border-[#3f4850]/20">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[#dae2fd]">IP Whitelisting Enabled</span>
                <span className="text-[10px] text-[#89929b]">
                  Strict geo-fencing limited to enterprise VPN CIDR blocks ({cidrs.length} active ranges configured).
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIpWhite(!ipWhite)}
                className={`w-10 h-5 rounded-full relative transition-colors shrink-0 ${
                  ipWhite ? 'bg-[#93ccff]' : 'bg-[#222a3d]'
                }`}
              >
                <span
                  className={`w-3.5 h-3.5 rounded-full absolute top-0.5 transition-transform ${
                    ipWhite ? 'bg-[#003351] right-0.5' : 'bg-[#89929b] left-0.5'
                  }`}
                ></span>
              </button>
            </div>

            {/* Whitelist CIDR Chips */}
            <div className="bg-[#222a3d] p-3 rounded border border-[#3f4850]/30 space-y-2">
              <span className="font-mono text-[9px] text-[#89929b] uppercase block tracking-wider">
                Active CIDR Ingress Rules:
              </span>
              <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
                {cidrs.map((cidr) => (
                  <span
                    key={cidr}
                    className="px-2 py-0.5 bg-[#060e20] text-[#7bd0ff] rounded flex items-center gap-1.5 border border-[#3f4850]/30"
                  >
                    <span>{cidr}</span>
                    <button
                      onClick={() => handleRemoveCidr(cidr)}
                      className="text-[#89929b] hover:text-[#ffb4ab]"
                      title="Remove CIDR Rule"
                    >
                      <span className="material-symbols-outlined text-[13px]">close</span>
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#3f4850]/20">
            <span className="font-mono text-[10px] text-[#89929b]">
              Last commit: 2h ago by Sarah Jenkins
            </span>
            <button
              onClick={handleApplySecurity}
              className="h-8 px-3 bg-[#93ccff] text-[#003351] font-semibold text-xs rounded hover:bg-[#3198dc] transition-colors shadow-sm"
              type="button"
            >
              Apply Security Changes
            </button>
          </div>
        </div>
      </div>

      {/* Invite User Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#171f33] border border-[#3f4850] rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#7bd0ff] text-[22px]">person_add</span>
                <h3 className="text-base font-semibold text-[#dae2fd]">Invite Enterprise User</h3>
              </div>
              <button
                onClick={() => setInviteModalOpen(false)}
                className="w-7 h-7 flex items-center justify-center text-[#89929b] hover:text-white"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-3">
              <div>
                <label className="font-mono text-[10px] uppercase text-[#89929b]">Full Name</label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Liam Anderson"
                  className="w-full h-9 px-3 bg-[#131b2e] rounded border border-[#3f4850] text-[#dae2fd] text-xs focus:outline-none focus:border-[#93ccff]"
                  required
                />
              </div>

              <div>
                <label className="font-mono text-[10px] uppercase text-[#89929b]">Work Email</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="l.anderson@azad-enterprise.ai"
                  className="w-full h-9 px-3 bg-[#131b2e] rounded border border-[#3f4850] text-[#dae2fd] text-xs font-mono focus:outline-none focus:border-[#93ccff]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-[10px] uppercase text-[#89929b]">Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full h-9 px-2 bg-[#131b2e] rounded border border-[#3f4850] text-[#dae2fd] text-xs focus:outline-none"
                  >
                    <option value="HITL Verification Lead">HITL Lead</option>
                    <option value="Schema & Prompt Engineer">Schema Eng</option>
                    <option value="Compliance Auditor">Auditor</option>
                    <option value="Data Ops Specialist">Data Ops</option>
                  </select>
                </div>

                <div>
                  <label className="font-mono text-[10px] uppercase text-[#89929b]">Department</label>
                  <select
                    value={inviteDept}
                    onChange={(e) => setInviteDept(e.target.value)}
                    className="w-full h-9 px-2 bg-[#131b2e] rounded border border-[#3f4850] text-[#dae2fd] text-xs focus:outline-none"
                  >
                    <option value="Risk & Review">Risk & Review</option>
                    <option value="Finance OCR">Finance OCR</option>
                    <option value="Platform Ops">Platform Ops</option>
                    <option value="Security & Audit">Security & Audit</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-[#131b2e] rounded text-[11px] font-mono text-[#89929b]">
                <span>A WebAuthn enrollment link will be dispatched with 48h expiry.</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setInviteModalOpen(false)}
                  className="px-3 py-1.5 rounded bg-[#222a3d] text-[#bfc7d2] text-xs hover:bg-[#2d3449]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-[#93ccff] text-[#003351] font-semibold text-xs hover:bg-[#3198dc]"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Feedback Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm p-3.5 rounded-lg bg-[#222a3d] border border-[#3f4850] text-[#dae2fd] shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2">
          <span className="material-symbols-outlined text-[#7bd0ff] text-[20px]">check_circle</span>
          <span className="text-xs leading-snug">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
