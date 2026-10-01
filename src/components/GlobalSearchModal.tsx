import React, { useState } from 'react';
import { DocumentRecord, UserAccount, ActiveScreen } from '../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: DocumentRecord[];
  users: UserAccount[];
  onNavigateToDoc: (docId: string) => void;
  onNavigate: (screen: ActiveScreen) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  documents,
  users,
  onNavigateToDoc,
  onNavigate
}) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const matchedDocs = documents.filter(
    (d) =>
      !query.trim() ||
      d.fileName.toLowerCase().includes(query.toLowerCase()) ||
      d.customerName.toLowerCase().includes(query.toLowerCase()) ||
      d.invoiceNumber.toLowerCase().includes(query.toLowerCase()) ||
      d.gstin.toLowerCase().includes(query.toLowerCase())
  );

  const matchedUsers = users.filter(
    (u) =>
      !query.trim() ||
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase()) ||
      u.role.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start justify-center p-4 pt-16 sm:pt-24">
      <div className="bg-[#171f33] border border-[#3f4850] rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Search Input Bar */}
        <div className="p-3 border-b border-[#3f4850]/40 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#93ccff] text-[20px]">search</span>
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Global search documents, invoices, counterparties, operators, schemas..."
            className="w-full bg-transparent text-sm text-[#dae2fd] placeholder:text-[#89929b] focus:outline-none"
          />
          <kbd
            onClick={onClose}
            className="px-2 py-0.5 rounded bg-[#222a3d] text-[10px] font-mono text-[#89929b] cursor-pointer hover:text-white"
          >
            ESC
          </kbd>
        </div>

        {/* Quick Nav Shortcut Pills */}
        <div className="px-4 py-2 bg-[#131b2e] border-b border-[#3f4850]/20 flex flex-wrap items-center gap-2 font-mono text-[10px] text-[#89929b]">
          <span>Jump to:</span>
          <button
            onClick={() => {
              onNavigate('dashboard');
              onClose();
            }}
            className="px-2 py-0.5 rounded bg-[#222a3d] text-[#7bd0ff] hover:bg-[#2d3449]"
          >
            Day-wise Dashboard
          </button>
          <button
            onClick={() => {
              onNavigate('upload-queue');
              onClose();
            }}
            className="px-2 py-0.5 rounded bg-[#222a3d] text-[#7bd0ff] hover:bg-[#2d3449]"
          >
            Upload & Queue
          </button>
          <button
            onClick={() => {
              onNavigate('review-hitl');
              onClose();
            }}
            className="px-2 py-0.5 rounded bg-[#222a3d] text-[#7bd0ff] hover:bg-[#2d3449]"
          >
            Review & HITL (XYZ_Vendor_Inv.pdf)
          </button>
          <button
            onClick={() => {
              onNavigate('schema-builder');
              onClose();
            }}
            className="px-2 py-0.5 rounded bg-[#222a3d] text-[#7bd0ff] hover:bg-[#2d3449]"
          >
            Schema Builder
          </button>
          <button
            onClick={() => {
              onNavigate('user-management');
              onClose();
            }}
            className="px-2 py-0.5 rounded bg-[#222a3d] text-[#7bd0ff] hover:bg-[#2d3449]"
          >
            User Management
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-3">
          {/* Documents Section */}
          <div>
            <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-[#89929b]">
              Ledger Documents ({matchedDocs.length})
            </div>
            <div className="space-y-1">
              {matchedDocs.slice(0, 5).map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => {
                    onNavigateToDoc(doc.id);
                    onClose();
                  }}
                  className="p-2 rounded hover:bg-[#222a3d] cursor-pointer flex items-center justify-between text-xs transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="material-symbols-outlined text-[16px] text-[#93ccff]">description</span>
                    <span className="font-mono text-[#dae2fd] truncate">{doc.fileName}</span>
                    <span className="text-[#89929b] truncate">({doc.customerName})</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
                    <span className="text-[#7bd0ff]">{doc.invoiceNumber}</span>
                    <span className="text-[#89929b]">₹{doc.totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Users Section */}
          <div>
            <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-[#89929b]">
              Enterprise Operators ({matchedUsers.length})
            </div>
            <div className="space-y-1">
              {matchedUsers.slice(0, 3).map((usr) => (
                <div
                  key={usr.id}
                  onClick={() => {
                    onNavigate('user-management');
                    onClose();
                  }}
                  className="p-2 rounded hover:bg-[#222a3d] cursor-pointer flex items-center justify-between text-xs transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-[#3198dc]/20 text-[#7bd0ff] flex items-center justify-center text-[10px] font-mono font-bold">
                      {usr.initials}
                    </span>
                    <span className="text-[#dae2fd] font-medium">{usr.name}</span>
                    <span className="text-[#89929b] font-mono text-[10px]">{usr.email}</span>
                  </div>
                  <span className="px-1.5 py-0.2 rounded bg-[#222a3d] text-[#93ccff] font-mono text-[10px]">
                    {usr.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
