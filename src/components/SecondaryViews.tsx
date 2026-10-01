import React from 'react';
import { DocumentRecord, ActiveScreen } from '../types';

interface ViewProps {
  onNavigate: (screen: ActiveScreen) => void;
  documents?: DocumentRecord[];
}

export const AllDocumentsView: React.FC<ViewProps> = ({ onNavigate, documents = [] }) => {
  return (
    <div className="flex flex-col w-full space-y-5">
      <div className="flex items-center justify-between pb-1 border-b border-[#3f4850]/20">
        <div>
          <h1 className="text-2xl font-semibold text-[#dae2fd]">All Documents Repository</h1>
          <p className="text-xs text-[#bfc7d2] mt-1">
            Global immutable storage catalog containing 14,892 verified financial and legal documents.
          </p>
        </div>
        <button
          onClick={() => onNavigate('upload-queue')}
          className="h-8 px-3 bg-[#93ccff] text-[#003351] font-semibold text-xs rounded hover:bg-[#3198dc]"
        >
          + Upload New
        </button>
      </div>

      <div className="bg-[#131b2e] rounded-xl p-4 border border-[#3f4850]/30 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#171f33] text-[#89929b] font-mono text-[10px] uppercase">
                <th className="py-2.5 px-3">Doc ID</th>
                <th className="py-2.5 px-3">File Name</th>
                <th className="py-2.5 px-3">Counterparty</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3f4850]/20 text-[#dae2fd]">
              {documents.map((d) => (
                <tr key={d.id} className="hover:bg-[#171f33]/60 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-[11px] text-[#7bd0ff]">{d.id}</td>
                  <td className="py-2.5 px-3 font-mono font-medium">{d.fileName}</td>
                  <td className="py-2.5 px-3">{d.customerName}</td>
                  <td className="py-2.5 px-3 font-mono text-[#bfc7d2]">{d.invoiceDate}</td>
                  <td className="py-2.5 px-3 font-mono text-right font-semibold">
                    ₹{d.totalAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-[#222a3d] text-[#7bd0ff] font-mono text-[10px]">
                      {d.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => onNavigate('review-hitl')}
                      className="text-[#93ccff] hover:underline font-mono text-xs"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const HistoryAuditView: React.FC<ViewProps> = () => {
  const auditLogs = [
    { id: 'LOG-9921', time: '11:42:01 UTC', actor: 'Sarah Jenkins (CDO)', action: 'Committed schema update to production pipeline', target: 'INVOICE_STD_V4.2', status: 'SUCCESS' },
    { id: 'LOG-9920', time: '11:34:02 UTC', actor: 'Sarah Jenkins (CDO)', action: 'Overwrote invoice date field 2026-10-09 -> 2026-09-30', target: 'DOC-2026-90412', status: 'RESOLVED' },
    { id: 'LOG-9919', time: '11:30:14 UTC', actor: 'Worker Node #04', action: 'Optical raster binarization and LLM Vision extraction', target: 'XYZ_Vendor_Inv.pdf', status: 'WARNING' },
    { id: 'LOG-9918', time: '10:55:00 UTC', actor: 'Okta SCIM Sync', action: 'Pushed profile updates for 3 platform operators', target: 'SCIM_TOKEN_8849', status: 'SYNCED' },
    { id: 'LOG-9917', time: '10:04:12 UTC', actor: 'Worker Node #01', action: 'Extracted freight bill without bounding discrepancies', target: 'Apex_Logistics_99.pdf', status: 'AUTONOMOUS' },
    { id: 'LOG-9916', time: '09:15:20 UTC', actor: 'Worker Node #02', action: 'Extracted tax invoice with zero-touch confidence 98%', target: 'Invoice_ABC_Sep.pdf', status: 'AUTONOMOUS' }
  ];

  return (
    <div className="flex flex-col w-full space-y-5">
      <div className="pb-1 border-b border-[#3f4850]/20">
        <h1 className="text-2xl font-semibold text-[#dae2fd]">Processing History & Audit Log</h1>
        <p className="text-xs text-[#bfc7d2] mt-1">
          Cryptographically signed, append-only operational audit trail for compliance verification and model governance.
        </p>
      </div>

      <div className="bg-[#131b2e] rounded-xl p-4 border border-[#3f4850]/30 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#171f33] text-[#89929b] font-mono text-[10px] uppercase">
                <th className="py-2.5 px-3">Event ID</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Principal / Actor</th>
                <th className="py-2.5 px-3">Action Description</th>
                <th className="py-2.5 px-3">Target Entity</th>
                <th className="py-2.5 px-3 text-right">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3f4850]/20 font-mono text-[#dae2fd]">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#171f33]/60 transition-colors">
                  <td className="py-2.5 px-3 text-[#7bd0ff]">{log.id}</td>
                  <td className="py-2.5 px-3 text-[#bfc7d2]">{log.time}</td>
                  <td className="py-2.5 px-3 font-sans font-medium">{log.actor}</td>
                  <td className="py-2.5 px-3 font-sans text-[#bfc7d2]">{log.action}</td>
                  <td className="py-2.5 px-3 text-[#93ccff]">{log.target}</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="px-2 py-0.5 rounded bg-[#222a3d] text-[#7bd0ff] text-[10px]">
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const AnalyticsSlaView: React.FC<ViewProps> = () => {
  return (
    <div className="flex flex-col w-full space-y-5">
      <div className="pb-1 border-b border-[#3f4850]/20">
        <h1 className="text-2xl font-semibold text-[#dae2fd]">Analytics & SLA Intelligence</h1>
        <p className="text-xs text-[#bfc7d2] mt-1">
          Cluster throughput performance, token efficiency ratios, and zero-touch extraction accuracy analytics.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#131b2e] p-4 rounded-xl border border-[#3f4850]/30 space-y-1">
          <span className="font-mono text-[10px] uppercase text-[#89929b]">Overall Cluster SLA</span>
          <div className="text-3xl font-bold font-mono text-[#7bd0ff]">99.4%</div>
          <span className="text-xs text-[#bfc7d2]">Trailing 30-day enterprise guarantee</span>
        </div>
        <div className="bg-[#131b2e] p-4 rounded-xl border border-[#3f4850]/30 space-y-1">
          <span className="font-mono text-[10px] uppercase text-[#89929b]">Zero-Touch Straight-Through Rate</span>
          <div className="text-3xl font-bold font-mono text-[#93ccff]">94.2%</div>
          <span className="text-xs text-[#bfc7d2]">Processed without human intervention</span>
        </div>
        <div className="bg-[#131b2e] p-4 rounded-xl border border-[#3f4850]/30 space-y-1">
          <span className="font-mono text-[10px] uppercase text-[#89929b]">Mean Resolution Latency</span>
          <div className="text-3xl font-bold font-mono text-[#b4c5ff]">1.82s</div>
          <span className="text-xs text-[#bfc7d2]">Per PDF page across OCR & LLM</span>
        </div>
      </div>
    </div>
  );
};

export const EngineApisView: React.FC<ViewProps> = () => {
  return (
    <div className="flex flex-col w-full space-y-5">
      <div className="pb-1 border-b border-[#3f4850]/20">
        <h1 className="text-2xl font-semibold text-[#dae2fd]">Extraction Engine & OCR APIs</h1>
        <p className="text-xs text-[#bfc7d2] mt-1">
          Configure model weights, GPU binarization concurrency, raster DPI thresholds, and downstream ERP webhook endpoints.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#131b2e] p-4 rounded-xl border border-[#3f4850]/30 space-y-3">
          <h3 className="font-semibold text-sm text-[#dae2fd]">Active Vision OCR Model Weight</h3>
          <div className="p-3 bg-[#171f33] rounded font-mono text-xs text-[#7bd0ff] space-y-1 border border-[#3f4850]/30">
            <div className="flex justify-between">
              <span>Model:</span>
              <span className="text-[#dae2fd]">Llama-Vision-OCR-70B-FP8</span>
            </div>
            <div className="flex justify-between">
              <span>Fallback:</span>
              <span className="text-[#dae2fd]">GPT-4o Vision + Textract Hybrid</span>
            </div>
            <div className="flex justify-between">
              <span>Quantization:</span>
              <span className="text-[#93ccff]">FP8 Hardware Acceleration</span>
            </div>
          </div>
        </div>

        <div className="bg-[#131b2e] p-4 rounded-xl border border-[#3f4850]/30 space-y-3">
          <h3 className="font-semibold text-sm text-[#dae2fd]">Downstream ERP Dispatch Endpoints</h3>
          <div className="p-3 bg-[#171f33] rounded font-mono text-xs text-[#7bd0ff] space-y-1 border border-[#3f4850]/30">
            <div className="flex justify-between">
              <span>SAP NetWeaver API:</span>
              <span className="text-emerald-400 font-semibold">200 Connected</span>
            </div>
            <div className="flex justify-between">
              <span>Oracle NetSuite SuiteTalk:</span>
              <span className="text-emerald-400 font-semibold">200 Connected</span>
            </div>
            <div className="flex justify-between">
              <span>PostgreSQL Production DB:</span>
              <span className="text-emerald-400 font-semibold">Active Ingress</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
