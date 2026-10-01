import React, { useState } from 'react';
import { ActiveScreen } from '../types';

interface ReviewHITLScreenProps {
  documentId?: string;
  onNavigate: (screen: ActiveScreen) => void;
  onDocumentApproved?: (docId: string) => void;
}

export const ReviewHITLScreen: React.FC<ReviewHITLScreenProps> = ({
  documentId = 'doc-3',
  onNavigate,
  onDocumentApproved
}) => {
  // Viewer state
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [showBoxes, setShowBoxes] = useState<boolean>(true);
  const [activePage, setActivePage] = useState<number>(1);

  // Field values with editing capability
  const [customerName, setCustomerName] = useState<string>('XYZ Global Solutions');
  const [customerId, setCustomerId] = useState<string>('CUST-88310');
  const [invoiceNumber, setInvoiceNumber] = useState<string>('INV-1002');
  const [invoiceDate, setInvoiceDate] = useState<string>('2026-09-30');
  const [isDateEdited, setIsDateEdited] = useState<boolean>(true);
  const [dueDate, setDueDate] = useState<string>('2026-10-15');
  const [gstinValue, setGstinValue] = useState<string | null>(null);
  const [gstinIgnored, setGstinIgnored] = useState<boolean>(false);
  const [subtotal, setSubtotal] = useState<string>('15,700.00');
  const [taxAmount, setTaxAmount] = useState<string>('2,500.00');
  const [grandTotal, setGrandTotal] = useState<string>('18,500.00');
  const [showOriginals, setShowOriginals] = useState<boolean>(false);

  // Modals & feedback
  const [gstinModalOpen, setGstinModalOpen] = useState<boolean>(false);
  const [gstinInput, setGstinInput] = useState<string>('07BBBCD5566G1Z9');
  const [isCommitting, setIsCommitting] = useState<boolean>(false);
  const [committedSuccess, setCommittedSuccess] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleZoomIn = () => {
    if (zoomLevel < 150) setZoomLevel((prev) => prev + 10);
  };

  const handleZoomOut = () => {
    if (zoomLevel > 70) setZoomLevel((prev) => prev - 10);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleApplyGstin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gstinInput.trim()) return;
    setGstinValue(gstinInput.trim().toUpperCase());
    setGstinModalOpen(false);
    showToast(`Updated GSTIN to ${gstinInput.trim().toUpperCase()} (Verified Manual Input).`);
  };

  const handleCommitToDatabase = () => {
    setIsCommitting(true);
    setTimeout(() => {
      setIsCommitting(false);
      setCommittedSuccess(true);
      showToast('Document Approved and Committed to PostgreSQL DB: financial_invoices (201 Created).');
      if (onDocumentApproved) {
        onDocumentApproved(documentId);
      }
      setTimeout(() => {
        setCommittedSuccess(false);
      }, 3000);
    }, 1200);
  };

  const handleRevert = () => {
    setInvoiceDate('2026-10-09');
    setIsDateEdited(false);
    setGstinValue(null);
    setGstinIgnored(false);
    showToast('Reverted modifications back to original OCR extraction payload.');
  };

  const toggleOriginals = () => {
    if (!showOriginals) {
      setInvoiceDate('2026-10-09');
      setShowOriginals(true);
    } else {
      setInvoiceDate('2026-09-30');
      setShowOriginals(false);
    }
  };

  return (
    <div className="flex flex-col w-full space-y-4">
      {/* Top Context Header Bar */}
      <div className="flex flex-col gap-3 bg-[#131b2e] p-4 rounded-xl shadow-sm border border-[#3f4850]/30">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Breadcrumb & Status */}
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-[#89929b]">
              <button
                onClick={() => onNavigate('dashboard')}
                className="hover:text-[#dae2fd] transition-colors cursor-pointer"
              >
                Review Queue
              </button>
              <span>/</span>
              <span className="font-mono text-xs text-[#bfc7d2]">DOC-2026-90412</span>
              <span>/</span>
              <span className="font-semibold text-[#dae2fd] truncate">XYZ_Vendor_Inv.pdf</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#222a3d] text-[#7bd0ff] font-mono text-[10px] border border-[#3f4850]/40">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7bd0ff] animate-pulse"></span>
              <span>Requires Review (82% Conf.)</span>
            </div>
          </div>

          {/* Action CTA Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => showToast('Exporting JSON artifact and PDF bounding box report...')}
              className="h-8 px-2.5 bg-[#222a3d] hover:bg-[#31394d] text-[#dae2fd] text-xs font-mono rounded flex items-center gap-1.5 transition-colors border border-[#3f4850]/40"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span className="hidden sm:inline">Export JSON/PDF</span>
            </button>
            <button
              onClick={() => showToast('Re-extracting document using Gemini 2.5 Vision with relaxed prompt...')}
              className="h-8 px-2.5 bg-[#222a3d] hover:bg-[#31394d] text-[#7bd0ff] text-xs font-mono rounded flex items-center gap-1.5 transition-colors border border-[#3f4850]/40"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">cycle</span>
              <span>Re-extract</span>
            </button>
            <button
              onClick={() => showToast('Flagged document as suspicious for forensic auditor review.')}
              className="h-8 px-2.5 bg-[#93000a]/30 hover:bg-[#93000a]/50 text-[#ffb4ab] text-xs font-mono rounded flex items-center gap-1.5 transition-colors border border-[#93000a]/50"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">gpp_maybe</span>
              <span className="hidden sm:inline">Flag Suspicious</span>
            </button>
            <button
              onClick={handleCommitToDatabase}
              className="h-8 px-3 bg-[#93ccff] text-[#003351] font-semibold text-xs rounded flex items-center gap-1.5 shadow-sm hover:bg-[#3198dc] hover:text-[#002c47] transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span>Approve & Commit</span>
            </button>
          </div>
        </div>

        {/* Engine & Temporal Metadata Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-[#bfc7d2] font-mono text-[11px] border-t border-[#3f4850]/20">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1">
              <span className="text-[#89929b]">Engine:</span>
              <span className="text-[#7bd0ff] font-semibold">Hybrid OCR v2.4 (LLM Vision)</span>
            </div>
            <span className="text-[#89929b]/40">•</span>
            <div className="flex items-center gap-1">
              <span className="text-[#89929b]">Primary Date:</span>
              <span className="text-[#dae2fd]">2026-09-30 (from Invoice Date)</span>
            </div>
            <span className="text-[#89929b]/40">•</span>
            <div className="flex items-center gap-1">
              <span className="text-[#89929b]">Cluster:</span>
              <span className="text-[#dae2fd]">worker-node-eu4 (#7A02)</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[#89929b]">Pipeline Latency:</span>
            <span className="text-[#7bd0ff] font-semibold">418ms</span>
          </div>
        </div>
      </div>

      {/* Main Split Canvas (Viewer + Inspector) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* LEFT PANE: Interactive High-Fidelity PDF Canvas (6-7 Cols) */}
        <div className="lg:col-span-6 xl:col-span-6 flex flex-col bg-[#131b2e] rounded-xl overflow-hidden shadow-md border border-[#3f4850]/30">
          {/* PDF Canvas Toolbar */}
          <div className="flex items-center justify-between px-3 py-2 bg-[#171f33] border-b border-[#3f4850]/30">
            {/* Page navigation */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActivePage((p) => Math.max(1, p - 1))}
                className="w-7 h-7 flex items-center justify-center rounded bg-[#222a3d] hover:bg-[#31394d] text-[#dae2fd] transition-colors"
                type="button"
                aria-label="Previous Page"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              </button>
              <span className="font-mono text-xs text-[#dae2fd] px-1">{activePage} / 3</span>
              <button
                onClick={() => setActivePage((p) => Math.min(3, p + 1))}
                className="w-7 h-7 flex items-center justify-center rounded bg-[#222a3d] hover:bg-[#31394d] text-[#dae2fd] transition-colors"
                type="button"
                aria-label="Next Page"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
              <div className="w-px h-4 bg-[#3f4850]/40 mx-1"></div>
              <span className="font-mono text-[10px] text-[#89929b]">Page {activePage} (Tax Invoice)</span>
            </div>

            {/* Zoom & Box Overlays Control */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleZoomOut}
                className="w-7 h-7 flex items-center justify-center rounded bg-[#222a3d] hover:bg-[#31394d] text-[#dae2fd] transition-colors"
                type="button"
                title="Zoom Out"
              >
                <span className="material-symbols-outlined text-[16px]">zoom_out</span>
              </button>
              <span className="font-mono text-[11px] text-[#bfc7d2] min-w-[38px] text-center">
                {zoomLevel}%
              </span>
              <button
                onClick={handleZoomIn}
                className="w-7 h-7 flex items-center justify-center rounded bg-[#222a3d] hover:bg-[#31394d] text-[#dae2fd] transition-colors"
                type="button"
                title="Zoom In"
              >
                <span className="material-symbols-outlined text-[16px]">zoom_in</span>
              </button>
              <button
                onClick={handleRotate}
                className="w-7 h-7 flex items-center justify-center rounded bg-[#222a3d] hover:bg-[#31394d] text-[#dae2fd] transition-colors"
                type="button"
                title="Rotate 90 degrees"
              >
                <span className="material-symbols-outlined text-[16px]">rotate_right</span>
              </button>

              <div className="w-px h-4 bg-[#3f4850]/40 mx-1"></div>

              {/* Bounding Boxes Toggle */}
              <button
                onClick={() => setShowBoxes(!showBoxes)}
                className={`px-2 py-1 rounded font-mono text-[10px] flex items-center gap-1 transition-colors border ${
                  showBoxes
                    ? 'bg-[#3198dc]/20 text-[#93ccff] border-[#3198dc]/40'
                    : 'bg-[#222a3d] text-[#89929b] border-[#3f4850]/30'
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-[14px]">view_in_ar</span>
                <span>Boxes: {showBoxes ? 'ON' : 'OFF'}</span>
              </button>
            </div>
          </div>

          {/* PDF Body Workspace (Thumbnails + Virtual Render) */}
          <div className="flex min-h-[580px] max-h-[720px] bg-[#060e20] relative overflow-hidden">
            {/* Left Thumbnail Strip */}
            <div className="w-16 bg-[#131b2e] flex flex-col items-center py-3 gap-3 shrink-0 overflow-y-auto border-r border-[#3f4850]/30">
              <button
                onClick={() => setActivePage(1)}
                className={`flex flex-col items-center gap-1 group cursor-pointer transition-opacity ${
                  activePage === 1 ? 'opacity-100' : 'opacity-50 hover:opacity-100'
                }`}
              >
                <div
                  className={`w-12 h-16 rounded p-1 shadow-sm flex flex-col justify-between border ${
                    activePage === 1 ? 'bg-[#222a3d] border-[#93ccff]' : 'bg-[#171f33] border-[#3f4850]/40'
                  }`}
                >
                  <div className="h-1.5 w-6 bg-[#93ccff] rounded-sm opacity-80"></div>
                  <div className="space-y-1">
                    <div className="h-0.5 w-full bg-[#3f4850] rounded"></div>
                    <div className="h-0.5 w-3/4 bg-[#3f4850] rounded"></div>
                  </div>
                  <div className="h-1 w-5 bg-[#7bd0ff] rounded-sm"></div>
                </div>
                <span className={`font-mono text-[10px] ${activePage === 1 ? 'text-[#93ccff] font-bold' : 'text-[#89929b]'}`}>
                  P.1
                </span>
              </button>

              <button
                onClick={() => setActivePage(2)}
                className={`flex flex-col items-center gap-1 group cursor-pointer transition-opacity ${
                  activePage === 2 ? 'opacity-100' : 'opacity-50 hover:opacity-100'
                }`}
              >
                <div
                  className={`w-12 h-16 rounded p-1 shadow-sm flex flex-col justify-between border ${
                    activePage === 2 ? 'bg-[#222a3d] border-[#93ccff]' : 'bg-[#171f33] border-[#3f4850]/40'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="h-0.5 w-full bg-[#3f4850] rounded"></div>
                    <div className="h-0.5 w-2/3 bg-[#3f4850] rounded"></div>
                    <div className="h-0.5 w-4/5 bg-[#3f4850] rounded"></div>
                  </div>
                  <div className="h-0.5 w-full bg-[#3f4850] rounded"></div>
                </div>
                <span className={`font-mono text-[10px] ${activePage === 2 ? 'text-[#93ccff] font-bold' : 'text-[#89929b]'}`}>
                  P.2
                </span>
              </button>

              <button
                onClick={() => setActivePage(3)}
                className={`flex flex-col items-center gap-1 group cursor-pointer transition-opacity ${
                  activePage === 3 ? 'opacity-100' : 'opacity-50 hover:opacity-100'
                }`}
              >
                <div
                  className={`w-12 h-16 rounded p-1 shadow-sm flex flex-col justify-between border ${
                    activePage === 3 ? 'bg-[#222a3d] border-[#93ccff]' : 'bg-[#171f33] border-[#3f4850]/40'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="h-0.5 w-1/2 bg-[#3f4850] rounded"></div>
                    <div className="h-0.5 w-full bg-[#3f4850] rounded"></div>
                  </div>
                  <div className="h-1.5 w-6 bg-[#3f4850] rounded self-end"></div>
                </div>
                <span className={`font-mono text-[10px] ${activePage === 3 ? 'text-[#93ccff] font-bold' : 'text-[#89929b]'}`}>
                  P.3
                </span>
              </button>
            </div>

            {/* Rendered High-Fidelity Mock Document Viewport */}
            <div className="flex-1 p-3 sm:p-4 overflow-auto flex justify-center bg-[#060e20]/90 select-none">
              <div
                style={{
                  transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                  transformOrigin: 'top center',
                  transition: 'transform 0.15s ease-out'
                }}
                className="relative w-[480px] min-h-[640px] bg-[#0b1326] p-5 rounded-lg text-[#dae2fd] shadow-2xl text-left flex flex-col justify-between border border-[#3f4850]/50"
              >
                {/* Document Header */}
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className="font-mono text-[9px] text-[#89929b] uppercase tracking-wider">
                        VENDOR BILL OF SUPPLY
                      </span>
                      <span className="text-xl font-bold tracking-tight text-[#dae2fd]">
                        XYZ TECH VENTURES
                      </span>
                      <span className="text-[11px] text-[#bfc7d2]">
                        Global B2B Solutions • Reg ID: IN-HYD-990
                      </span>
                    </div>
                    <div className="text-right flex flex-col">
                      <span className="font-mono text-[10px] text-[#89929b]">ORIGINAL FOR RECIPIENT</span>
                      <div className="mt-1 px-1.5 py-0.5 bg-[#222a3d] rounded text-right border border-[#3f4850]/30">
                        <span className="font-mono text-[10px] text-[#7bd0ff]">Page 01 of 03</span>
                      </div>
                    </div>
                  </div>

                  {/* Top Data Meta Grid with Bounding Boxes */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    {/* Customer Name Region */}
                    <div className="relative p-1 rounded bg-[#131b2e] border border-[#3f4850]/30">
                      {showBoxes && (
                        <div className="absolute -top-2.5 left-1 z-10 px-1 py-0.5 rounded bg-[#93ccff] text-[#003351] font-mono text-[9px] font-bold flex items-center gap-0.5 shadow-sm">
                          <span className="material-symbols-outlined text-[10px]">verified</span>
                          <span>Customer: 96%</span>
                        </div>
                      )}
                      <div className="w-full h-full p-2 rounded bg-[#93ccff]/10">
                        <span className="font-mono text-[9px] text-[#89929b] block uppercase">
                          Bill To Recipient
                        </span>
                        <span className="text-xs font-semibold text-[#93ccff] block">
                          {customerName}
                        </span>
                        <span className="text-[10px] text-[#bfc7d2] block mt-0.5">
                          Plot 42, Cyber Gateway, Hitech City
                        </span>
                        <span className="text-[10px] text-[#bfc7d2] block">
                          Hyderabad, Telangana 500081
                        </span>
                      </div>
                    </div>

                    {/* Invoice Meta & Dates Region */}
                    <div className="flex flex-col gap-1.5">
                      {/* Invoice # */}
                      <div className="relative p-1 rounded bg-[#131b2e] border border-[#3f4850]/30">
                        {showBoxes && (
                          <div className="absolute -top-2 right-1 z-10 px-1 py-0.5 rounded bg-[#93ccff] text-[#003351] font-mono text-[9px] font-bold">
                            <span>Invoice #: 98%</span>
                          </div>
                        )}
                        <div className="px-2 py-1 bg-[#93ccff]/10 rounded flex items-center justify-between">
                          <span className="font-mono text-[9px] text-[#89929b]">Invoice Number:</span>
                          <span className="font-mono text-xs text-[#dae2fd] font-bold">{invoiceNumber}</span>
                        </div>
                      </div>

                      {/* Date & Due */}
                      <div className="relative p-1 rounded bg-[#131b2e] border border-amber-500/40">
                        {showBoxes && (
                          <div className="absolute -top-2 right-1 z-10 px-1 py-0.5 rounded bg-amber-500 text-black font-mono text-[9px] font-bold flex items-center gap-0.5 shadow-sm">
                            <span className="material-symbols-outlined text-[10px]">warning</span>
                            <span>Invoice Date: 82% (Review)</span>
                          </div>
                        )}
                        <div className="px-2 py-1 bg-amber-500/15 rounded space-y-0.5">
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="font-mono text-[9px] text-[#89929b]">Date:</span>
                            <span className="font-mono text-xs font-semibold text-amber-300">{invoiceDate}</span>
                          </div>
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="font-mono text-[9px] text-[#89929b]">Due:</span>
                            <span className="font-mono text-[11px] text-[#bfc7d2]">{dueDate}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* GSTIN Alert Box */}
                  <div className="relative p-1 rounded mt-1 border border-dashed border-[#ffb4ab]">
                    {showBoxes && (
                      <div className="absolute -top-2.5 left-2 z-10 px-1 py-0.5 rounded bg-[#93000a] text-[#ffdad6] font-mono text-[9px] font-bold flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[10px]">error</span>
                        <span>Missing Field: GSTIN (Tax ID)</span>
                      </div>
                    )}
                    <div className="p-2 rounded bg-[#93000a]/15 flex items-center justify-between">
                      <span className="font-mono text-xs text-[#ffb4ab]">
                        Buyer GSTIN: {gstinValue ? gstinValue : gstinIgnored ? '[IGNORED BY USER]' : '[NOT FOUND ON PAGE 1-3]'}
                      </span>
                      <span className="font-mono text-[10px] text-[#89929b]">
                        {gstinValue ? '100% Manual' : 'Confidence: 0.0%'}
                      </span>
                    </div>
                  </div>

                  {/* Line Items Mock Table */}
                  <div className="flex flex-col bg-[#131b2e] rounded p-2 mt-1 border border-[#3f4850]/30">
                    <div className="flex justify-between font-mono text-[9px] uppercase text-[#89929b] pb-1 border-b border-[#3f4850]/20">
                      <span>Description</span>
                      <span className="w-10 text-right">Qty</span>
                      <span className="w-16 text-right">Rate</span>
                      <span className="w-20 text-right">Amount</span>
                    </div>
                    <div className="space-y-1 pt-1.5 text-xs">
                      <div className="flex justify-between text-[#dae2fd]">
                        <span className="truncate pr-1 text-[11px]">Managed Cloud Instance L4</span>
                        <span className="w-10 text-right font-mono text-[11px]">2</span>
                        <span className="w-16 text-right font-mono text-[11px]">₹5,000</span>
                        <span className="w-20 text-right font-mono text-[11px] font-semibold">₹10,000</span>
                      </div>
                      <div className="flex justify-between text-[#dae2fd]">
                        <span className="truncate pr-1 text-[11px]">Security Pipeline Audit</span>
                        <span className="w-10 text-right font-mono text-[11px]">1</span>
                        <span className="w-16 text-right font-mono text-[11px]">₹5,700</span>
                        <span className="w-20 text-right font-mono text-[11px] font-semibold">₹5,700</span>
                      </div>
                    </div>
                  </div>

                  {/* Total Calculations Box */}
                  <div className="relative p-1 rounded mt-1 border border-amber-500/40">
                    {showBoxes && (
                      <div className="absolute -top-2 right-2 z-10 px-1.5 py-0.5 rounded bg-amber-500 text-black font-mono text-[9px] font-bold flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[10px]">calculate</span>
                        <span>Math Calculation Mismatch Check</span>
                      </div>
                    )}
                    <div className="p-2.5 rounded bg-amber-500/15 flex flex-col gap-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[#bfc7d2]">Line Subtotal:</span>
                        <span className="font-mono text-[#dae2fd]">₹{subtotal}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[#bfc7d2]">Computed GST (18%):</span>
                        <span className="font-mono text-amber-300 font-semibold">
                          ₹{taxAmount} (Doc says ₹2,800)
                        </span>
                      </div>
                      <div className="w-full h-px bg-[#3f4850]/30 my-0.5"></div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-[#dae2fd]">Grand Total Claimed:</span>
                        <span className="font-mono text-sm font-bold text-[#93ccff]">₹{grandTotal}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer on Document */}
                <div className="pt-3 flex justify-between items-end font-mono text-[10px] text-[#89929b] border-t border-[#3f4850]/20 mt-2">
                  <div>
                    <span>Authorized Signatory:</span>
                    <div className="h-5 w-20 bg-[#222a3d] rounded mt-0.5 flex items-center justify-center text-[#7bd0ff] text-[8px] font-bold">
                      DIGI-VERIFIED
                    </div>
                  </div>
                  <div className="text-right">
                    <span>E-Way Bill: Not applicable</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANE: Extracted Fields, Validation Checks, and In-Place Correction Form (6 Cols) */}
        <div className="lg:col-span-6 xl:col-span-6 flex flex-col gap-3">
          {/* Validation Rule Summary Banners */}
          <div className="flex flex-col gap-2">
            {/* Calculation Mismatch Alert */}
            <div className="p-3 rounded-lg bg-[#222a3d] border border-amber-500/40 flex items-start gap-2.5 shadow-sm">
              <div className="w-6 h-6 rounded bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[16px]">error_outline</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-amber-300">Calculation Mismatch Detected</span>
                  <span className="px-1 py-0.2 bg-amber-500/20 text-amber-300 rounded font-mono text-[10px]">
                    RULE-FIN-409
                  </span>
                </div>
                <p className="text-xs text-[#bfc7d2] mt-0.5 leading-snug">
                  Subtotal (<span className="font-mono text-[#dae2fd]">₹{subtotal}</span>) + Tax (
                  <span className="font-mono text-[#dae2fd]">₹{taxAmount}</span>) ≠ Grand Total (
                  <span className="font-mono text-[#dae2fd]">₹{grandTotal}</span>). Variance of{' '}
                  <span className="font-mono text-amber-300 font-semibold">₹300.00</span> detected against line-item aggregate.
                </p>
              </div>
            </div>

            {/* Date Ambiguity Warning */}
            <div className="p-3 rounded-lg bg-[#222a3d] border border-[#3f4850]/40 flex items-start gap-2.5 shadow-sm">
              <div className="w-6 h-6 rounded bg-[#3198dc]/20 text-[#7bd0ff] flex items-center justify-center shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[16px]">calendar_clock</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-[#7bd0ff]">Invoice Date Confidence 82%</span>
                  <span className="px-1 py-0.2 bg-[#3198dc]/20 text-[#7bd0ff] rounded font-mono text-[10px]">
                    DATE-AMBIGUOUS
                  </span>
                </div>
                <p className="text-xs text-[#bfc7d2] mt-0.5 leading-snug">
                  Ambiguous date string snippet <span className="font-mono text-[#dae2fd] bg-[#171f33] px-1 rounded">'09/10/2026'</span> parsed as{' '}
                  <span className="font-mono text-[#7bd0ff]">DD/MM/YYYY</span> due to vendor regional origin (India). Verify month alignment before committing.
                </p>
              </div>
            </div>
          </div>

          {/* Extracted Entities & Schema Container */}
          <div className="bg-[#131b2e] rounded-xl p-4 shadow-md flex flex-col gap-3 border border-[#3f4850]/30">
            <div className="flex items-center justify-between pb-2 border-b border-[#3f4850]/20">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#dae2fd]">Extracted Entities & Schema</span>
                <span className="px-1.5 py-0.5 bg-[#222a3d] text-[#bfc7d2] font-mono text-[10px] rounded border border-[#3f4850]/30">
                  12 Fields
                </span>
              </div>
              <button
                onClick={toggleOriginals}
                className="text-[#7bd0ff] hover:underline font-mono text-[11px]"
                type="button"
              >
                {showOriginals ? 'Show Corrected Values' : 'Show Original AI Values'}
              </button>
            </div>

            {/* Fields List */}
            <div className="space-y-2">
              {/* Field 1: Customer Name */}
              <div className="p-2.5 rounded bg-[#171f33] hover:bg-[#1c263d] transition-colors flex flex-col gap-1 border border-[#3f4850]/20">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase text-[#89929b]">Customer Name</span>
                  <span className="px-1.5 py-0.2 rounded bg-[#93ccff]/15 text-[#93ccff] font-mono text-[10px] flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-[#93ccff]"></span> 96% ✓
                  </span>
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="bg-transparent text-xs font-semibold text-[#dae2fd] focus:outline-none focus:ring-1 focus:ring-[#93ccff] rounded px-1 py-0.5 w-full"
                  />
                  <span className="text-[10px] text-[#89929b] truncate shrink-0">
                    Snippet: "Bill To: XYZ Global Solutions..."
                  </span>
                </div>
              </div>

              {/* Field 2: Customer ID */}
              <div className="p-2.5 rounded bg-[#171f33] hover:bg-[#1c263d] transition-colors flex flex-col gap-1 border border-[#3f4850]/20">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase text-[#89929b]">Customer ID</span>
                  <span className="px-1.5 py-0.2 rounded bg-[#93ccff]/15 text-[#93ccff] font-mono text-[10px]">
                    94% ✓
                  </span>
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <input
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    className="bg-transparent font-mono text-xs text-[#dae2fd] focus:outline-none focus:ring-1 focus:ring-[#93ccff] rounded px-1 py-0.5"
                  />
                  <span className="text-[10px] text-[#89929b]">Page 1 (Header meta lookup)</span>
                </div>
              </div>

              {/* Field 3: Invoice Number */}
              <div className="p-2.5 rounded bg-[#171f33] hover:bg-[#1c263d] transition-colors flex flex-col gap-1 border border-[#3f4850]/20">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase text-[#89929b]">Invoice Number</span>
                  <span className="px-1.5 py-0.2 rounded bg-[#93ccff]/15 text-[#93ccff] font-mono text-[10px]">
                    98% ✓
                  </span>
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <input
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="bg-transparent font-mono text-xs font-semibold text-[#dae2fd] focus:outline-none focus:ring-1 focus:ring-[#93ccff] rounded px-1 py-0.5"
                  />
                  <span className="text-[10px] text-[#89929b]">Page 1, Header Anchor</span>
                </div>
              </div>

              {/* Field 4: Invoice Date (IN-PLACE CORRECTION ACTIVE) */}
              <div className="p-2.5 rounded bg-[#222a3d] border border-[#7bd0ff]/40 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] uppercase text-[#7bd0ff] font-semibold">
                      Invoice Date
                    </span>
                    {isDateEdited && (
                      <span className="px-1.5 py-0.2 bg-[#171f33] text-[#7bd0ff] font-mono text-[9px] rounded border border-[#7bd0ff]/30">
                        User Corrected
                      </span>
                    )}
                  </div>
                  <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px]">
                    82% ⚠️ Low
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                  <div className="relative flex-1 w-full">
                    <input
                      type="text"
                      value={invoiceDate}
                      onChange={(e) => {
                        setInvoiceDate(e.target.value);
                        setIsDateEdited(true);
                      }}
                      className="w-full h-8 px-2.5 bg-[#131b2e] text-[#dae2fd] font-mono text-xs rounded border border-[#3f4850]/40 focus:outline-none focus:ring-1 focus:ring-[#93ccff]"
                    />
                    <span className="absolute right-2 top-2 font-mono text-[9px] text-[#7bd0ff] font-semibold">
                      YYYY-MM-DD
                    </span>
                  </div>
                  <div className="text-right flex flex-col shrink-0">
                    <span className="font-mono text-[10px] text-[#89929b] line-through">
                      Original: 2026-10-09
                    </span>
                    <span className="text-[9px] text-[#bfc7d2]">Snippet: "Date: 30/09/2026"</span>
                  </div>
                </div>
              </div>

              {/* Field 5: Due Date */}
              <div className="p-2.5 rounded bg-[#171f33] hover:bg-[#1c263d] transition-colors flex flex-col gap-1 border border-[#3f4850]/20">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase text-[#89929b]">Due Date</span>
                  <span className="px-1.5 py-0.2 rounded bg-[#93ccff]/15 text-[#93ccff] font-mono text-[10px]">
                    91% ✓
                  </span>
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <input
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="bg-transparent font-mono text-xs text-[#dae2fd] focus:outline-none focus:ring-1 focus:ring-[#93ccff] rounded px-1 py-0.5"
                  />
                  <span className="text-[10px] text-[#89929b]">Page 1 (Term Net 15)</span>
                </div>
              </div>

              {/* Field 6: GSTIN / Tax ID (MISSING FIELD OR RESOLVED) */}
              <div
                className={`p-2.5 rounded flex flex-col gap-1.5 border ${
                  gstinValue
                    ? 'bg-[#171f33] border-emerald-500/40'
                    : gstinIgnored
                    ? 'bg-[#171f33] border-[#3f4850]/40'
                    : 'bg-[#93000a]/15 border-[#93000a]/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`font-mono text-[10px] uppercase font-semibold ${
                        gstinValue ? 'text-emerald-400' : gstinIgnored ? 'text-[#89929b]' : 'text-[#ffb4ab]'
                      }`}
                    >
                      GSTIN / Tax ID
                    </span>
                    <span
                      className={`px-1.5 py-0.2 rounded font-mono text-[9px] ${
                        gstinValue
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : gstinIgnored
                          ? 'bg-[#222a3d] text-[#89929b]'
                          : 'bg-[#93000a] text-[#ffdad6]'
                      }`}
                    >
                      {gstinValue ? 'Manual Input' : gstinIgnored ? 'Ignored by Auditor' : '⚠️ Missing Required'}
                    </span>
                  </div>
                  <span className="font-mono text-[10px]">
                    {gstinValue ? '100% ✓' : gstinIgnored ? 'N/A' : '0% ✕'}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
                  <span className="font-mono text-xs text-[#bfc7d2]">
                    {gstinValue ? gstinValue : gstinIgnored ? 'Ignored' : 'null / None detected in bounding zones'}
                  </span>

                  <button
                    onClick={() => setGstinModalOpen(true)}
                    className="h-7 px-3 bg-[#93000a] hover:bg-red-700 text-[#ffdad6] text-xs font-mono font-semibold rounded flex items-center gap-1 transition-colors shadow-sm"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[14px]">add</span>
                    <span>{gstinValue ? 'Edit GSTIN' : 'Enter GSTIN Manually'}</span>
                  </button>
                </div>
              </div>

              {/* Line Amount Grouping */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                {/* Field 7: Subtotal */}
                <div className="p-2.5 rounded bg-[#171f33] flex flex-col gap-1 border border-[#3f4850]/20">
                  <div className="flex justify-between items-center font-mono text-[9px] text-[#89929b] uppercase">
                    <span>Subtotal</span>
                    <span className="text-[#93ccff]">95% ✓</span>
                  </div>
                  <input
                    value={subtotal}
                    onChange={(e) => setSubtotal(e.target.value)}
                    className="bg-transparent font-mono text-xs font-semibold text-[#dae2fd] focus:outline-none"
                  />
                </div>

                {/* Field 8: Tax */}
                <div className="p-2.5 rounded bg-[#222a3d] flex flex-col gap-1 border border-amber-500/30">
                  <div className="flex justify-between items-center font-mono text-[9px] text-amber-300 uppercase">
                    <span>Tax / GST (18%)</span>
                    <span>89% ⚠️</span>
                  </div>
                  <input
                    value={taxAmount}
                    onChange={(e) => setTaxAmount(e.target.value)}
                    className="bg-transparent font-mono text-xs font-semibold text-amber-300 focus:outline-none"
                  />
                </div>

                {/* Field 9: Grand Total */}
                <div className="p-2.5 rounded bg-[#171f33] flex flex-col gap-1 border border-[#3f4850]/20">
                  <div className="flex justify-between items-center font-mono text-[9px] text-[#89929b] uppercase">
                    <span>Grand Total</span>
                    <span className="text-[#93ccff]">97% ✓</span>
                  </div>
                  <input
                    value={grandTotal}
                    onChange={(e) => setGrandTotal(e.target.value)}
                    className="bg-transparent font-mono text-xs font-bold text-[#93ccff] focus:outline-none"
                  />
                </div>
              </div>

              {/* Secondary Metas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="p-2.5 rounded bg-[#171f33] flex flex-col gap-1 border border-[#3f4850]/20">
                  <div className="flex justify-between items-center font-mono text-[9px] text-[#89929b] uppercase">
                    <span>Payment Status</span>
                    <span className="text-[#93ccff]">92% ✓</span>
                  </div>
                  <span className="text-xs text-[#dae2fd]">Unpaid / Due in 15 Days</span>
                </div>
                <div className="p-2.5 rounded bg-[#171f33] flex flex-col gap-1 border border-[#3f4850]/20">
                  <div className="flex justify-between items-center font-mono text-[9px] text-[#89929b] uppercase">
                    <span>Contact Email</span>
                    <span className="text-[#93ccff]">99% ✓</span>
                  </div>
                  <span className="font-mono text-xs text-[#dae2fd]">billing@xyzsolutions.io</span>
                </div>
              </div>

              {/* Field 11: Billing Address */}
              <div className="p-2.5 rounded bg-[#171f33] flex flex-col gap-1 border border-[#3f4850]/20">
                <div className="flex justify-between items-center font-mono text-[9px] text-[#89929b] uppercase">
                  <span>Billing Address</span>
                  <span className="text-[#93ccff]">95% ✓</span>
                </div>
                <span className="text-xs text-[#bfc7d2]">
                  Plot 42, Cyber Gateway, Hitech City, Hyderabad, 500081
                </span>
              </div>
            </div>
          </div>

          {/* Audit Trail & Version History */}
          <div className="bg-[#131b2e] rounded-xl p-4 shadow-sm flex flex-col gap-2 border border-[#3f4850]/30">
            <div className="flex items-center justify-between pb-1 border-b border-[#3f4850]/20">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#89929b]">history</span>
                <span className="text-xs font-semibold text-[#dae2fd]">Audit Trail & Edits</span>
              </div>
              <span className="font-mono text-[10px] text-[#89929b]">ID: AUD-90412-V2</span>
            </div>
            <div className="space-y-2 pl-1 text-xs text-[#bfc7d2]">
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#93ccff] mt-1.5 shrink-0"></span>
                <div>
                  <span className="font-mono text-[11px] text-[#dae2fd]">11:30:14 AM:</span>
                  <span className="ml-1">
                    AI Extracted from PDF via <span className="text-[#7bd0ff]">GPT-4o OCR Engine</span>. Raw confidence logged at 82.4%.
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7bd0ff] mt-1.5 shrink-0"></span>
                <div>
                  <span className="font-mono text-[11px] text-[#dae2fd]">11:34:02 AM:</span>
                  <span className="ml-1">
                    User <span className="text-[#dae2fd] font-medium">Sarah Jenkins</span> edited{' '}
                    <span className="font-mono text-[#89929b]">Invoice Date</span> from{' '}
                    <span className="font-mono line-through text-[#89929b]">"2026-10-09"</span> to{' '}
                    <span className="font-mono text-[#7bd0ff] font-semibold">"{invoiceDate}"</span>.
                  </span>
                </div>
              </div>
              {gstinValue && (
                <div className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></span>
                  <div>
                    <span className="font-mono text-[11px] text-[#dae2fd]">Just now:</span>
                    <span className="ml-1">
                      Manual GSTIN entered: <span className="font-mono text-emerald-400 font-semibold">{gstinValue}</span>.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Verification Review Footer */}
      <div className="sticky bottom-3 z-30 w-full bg-[#131b2e]/95 backdrop-blur-xl rounded-xl p-3 sm:p-4 shadow-2xl border border-[#3f4850]/50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleRevert}
            className="h-9 px-3 bg-[#171f33] hover:bg-[#222a3d] text-[#dae2fd] text-xs font-mono rounded transition-colors flex items-center gap-1.5 border border-[#3f4850]/30"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">undo</span>
            <span>Cancel & Revert Changes</span>
          </button>
          <button
            onClick={() => showToast('Draft configuration saved to Redis review session cache.')}
            className="h-9 px-3 bg-[#171f33] hover:bg-[#222a3d] text-[#dae2fd] text-xs font-mono rounded transition-colors flex items-center gap-1.5 border border-[#3f4850]/30"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">save</span>
            <span>Save Draft</span>
          </button>
          <button
            onClick={() => {
              setGstinIgnored(!gstinIgnored);
              showToast(gstinIgnored ? 'Restored GSTIN validation requirement.' : 'Marked GSTIN as Ignored.');
            }}
            className="h-9 px-3 text-[#89929b] hover:text-[#ffb4ab] text-xs font-mono transition-colors flex items-center gap-1.5"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">playlist_remove</span>
            <span>{gstinIgnored ? 'Un-ignore GSTIN' : 'Mark GSTIN as Ignored'}</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col text-right">
            <span className="font-mono text-[9px] uppercase text-[#89929b]">Target Destination</span>
            <span className="font-mono text-xs text-[#7bd0ff]">PostgreSQL :: financial_invoices</span>
          </div>

          <button
            onClick={handleCommitToDatabase}
            disabled={isCommitting}
            className={`h-10 px-4 sm:px-6 rounded font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all ${
              committedSuccess
                ? 'bg-emerald-500 text-black'
                : 'bg-[#93ccff] hover:bg-[#3198dc] text-[#003351]'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">
              {committedSuccess ? 'done_all' : isCommitting ? 'hourglass_top' : 'task_alt'}
            </span>
            <span>
              {committedSuccess
                ? 'Committed to PostgreSQL!'
                : isCommitting
                ? 'Writing to Postgres...'
                : 'Approve and Save to PostgreSQL Database'}
            </span>
          </button>
        </div>
      </div>

      {/* Manual GSTIN Entry Modal */}
      {gstinModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#171f33] border border-[#3f4850] rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#7bd0ff] text-[22px]">badge</span>
                <h3 className="text-base font-semibold text-[#dae2fd]">Enter GSTIN Manually</h3>
              </div>
              <button
                onClick={() => setGstinModalOpen(false)}
                className="w-7 h-7 flex items-center justify-center text-[#89929b] hover:text-white"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <p className="text-xs text-[#bfc7d2] leading-relaxed">
              Mandatory tax identifier was not recognized in bounding zone candidate pools. Enter the valid 15-character GSTIN according to government schema:
            </p>

            <form onSubmit={handleApplyGstin} className="space-y-3">
              <div>
                <label className="font-mono text-[10px] uppercase text-[#89929b]">15-Digit GSTIN</label>
                <input
                  type="text"
                  maxLength={15}
                  value={gstinInput}
                  onChange={(e) => setGstinInput(e.target.value)}
                  placeholder="e.g. 07BBBCD5566G1Z9"
                  className="w-full h-9 px-3 bg-[#131b2e] rounded border border-[#3f4850] text-[#dae2fd] font-mono text-sm uppercase focus:outline-none focus:border-[#93ccff]"
                  required
                />
              </div>

              <div className="p-2.5 rounded bg-[#131b2e] text-[11px] font-mono text-[#89929b] space-y-1">
                <div className="flex justify-between">
                  <span>State Code:</span>
                  <span className="text-[#dae2fd]">07 (Delhi NCR)</span>
                </div>
                <div className="flex justify-between">
                  <span>Entity PAN:</span>
                  <span className="text-[#dae2fd]">BBBCD5566G</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setGstinModalOpen(false)}
                  className="px-3 py-1.5 rounded bg-[#222a3d] text-[#bfc7d2] text-xs font-mono hover:bg-[#2d3449]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-[#93ccff] text-[#003351] text-xs font-mono font-semibold hover:bg-[#3198dc]"
                >
                  Apply & Validate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Feedback Toast */}
      {toastMessage && (
        <div className="fixed bottom-24 right-6 z-50 max-w-sm p-3.5 rounded-lg bg-[#222a3d] border border-[#3f4850] text-[#dae2fd] shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2">
          <span className="material-symbols-outlined text-[#7bd0ff] text-[20px]">check_circle</span>
          <span className="text-xs leading-snug">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
