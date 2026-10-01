import React, { useState, useRef } from 'react';
import { QueuePipelineItem, ActiveScreen } from '../types';

interface UploadQueueScreenProps {
  initialQueue: QueuePipelineItem[];
  onNavigateToReview: (docId: string) => void;
  onNavigate: (screen: ActiveScreen) => void;
}

export const UploadQueueScreen: React.FC<UploadQueueScreenProps> = ({
  initialQueue,
  onNavigateToReview,
  onNavigate
}) => {
  const [queueItems, setQueueItems] = useState<QueuePipelineItem[]>(initialQueue);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [autoStart, setAutoStart] = useState<boolean>(true);
  const [selectedSchema, setSelectedSchema] = useState<string>('Commercial Invoice v2.4 (21 fields)');
  const [selectedModel, setSelectedModel] = useState<string>('GPT-4o Vision + Textract Hybrid');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleFilesAdded = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newItems: QueuePipelineItem[] = Array.from(files).map((file, idx) => ({
      id: `q-upload-${Date.now()}-${idx}`,
      fileName: file.name,
      fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      pages: Math.max(1, Math.floor(file.size / (300 * 1024))),
      engine: 'Hybrid OCR + LLM v4',
      status: autoStart ? 'active' : 'queued',
      stageNumber: autoStart ? 2 : 1,
      stageName: autoStart ? 'Stage 2: OCR Rasterizing' : 'Stage 1: Uploaded',
      progressPercent: autoStart ? 15 : 0,
      eta: autoStart ? 'ETA ~12s' : 'Waiting',
      details: autoStart ? 'Rasterizing PDF canvas layers...' : 'In queue waiting for worker slot'
    }));

    setQueueItems((prev) => [...newItems, ...prev]);
    showToast(`Enqueued ${files.length} document(s) into ingestion pipeline.`);
  };

  const handleProcessAll = () => {
    setQueueItems((prev) =>
      prev.map((item) =>
        item.status === 'queued'
          ? {
              ...item,
              status: 'active',
              stageNumber: 3,
              stageName: 'Stage 3: Extracting Fields',
              progressPercent: 45,
              eta: 'ETA ~8s',
              details: 'Extracting key-value entities...'
            }
          : item
      )
    );
    showToast('Dispatched all queued documents to active OCR workers.');
  };

  const handleClearCompleted = () => {
    setQueueItems((prev) => prev.filter((i) => i.status !== 'completed'));
    showToast('Cleared completed items from current queue view.');
  };

  const handleRetryFailed = (id: string) => {
    setQueueItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'preprocessing',
              stageNumber: 2,
              stageName: 'Stage 2: High-DPI Binarization',
              progressPercent: 20,
              eta: 'ETA ~14s',
              details: 'Retrying with 600 DPI Ghostscript sanitization bridge...'
            }
          : item
      )
    );
    showToast('Retrying failed extraction with enhanced contrast filters.');
  };

  return (
    <div className="flex flex-col w-full space-y-6">
      {/* Pipeline Status Ribbon / Breadcrumb Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[#131b2e] border border-[#3f4850]/30 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#171f33] flex items-center justify-center text-[#93ccff] border border-[#3f4850]/40">
            <span className="material-symbols-outlined text-[24px]">stream</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-semibold text-[#dae2fd]">
                Ingestion Pipeline & Processing Stream
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#222a3d] text-[#7bd0ff] font-mono text-[10px] border border-[#7bd0ff]/30">
                Worker Node #04 (Low-Latency)
              </span>
            </div>
            <p className="text-xs text-[#bfc7d2]">
              Real-time PDF raster parsing, dynamic LLM token streaming, and math reconciliation
            </p>
          </div>
        </div>

        {/* Live Quick Metrics */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#171f33] border border-[#3f4850]/30">
            <span className="w-2 h-2 rounded-full bg-[#93ccff] animate-ping"></span>
            <span className="font-mono text-[10px] text-[#bfc7d2] uppercase">Stream Concurrency</span>
            <span className="font-mono text-xs text-[#93ccff] font-semibold">6 Workers</span>
          </div>
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded bg-[#171f33] border border-[#3f4850]/30">
            <span className="material-symbols-outlined text-[#b4c5ff] text-[16px]">speed</span>
            <span className="font-mono text-[10px] text-[#bfc7d2] uppercase">Avg Latency</span>
            <span className="font-mono text-xs text-[#b4c5ff] font-semibold">1.82s / page</span>
          </div>
        </div>
      </div>

      {/* Hero Drag-and-Drop Upload Zone */}
      <div className="relative w-full rounded-2xl p-6 sm:p-8 bg-gradient-to-br from-[#060e20] via-[#131b2e] to-[#171f33] shadow-md overflow-hidden border border-[#3f4850]/40">
        {/* Subtle Background Radial Gradients */}
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-[#3198dc]/10 blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/4 -bottom-20 w-96 h-96 rounded-full bg-[#7bd0ff]/5 blur-3xl pointer-events-none"></div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFilesAdded(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`relative group cursor-pointer transition-all duration-300 rounded-xl p-8 sm:p-12 flex flex-col items-center justify-center text-center border-2 border-dashed ${
            isDragging
              ? 'bg-[#222a3d]/80 border-[#93ccff]'
              : 'bg-[#131b2e]/60 hover:bg-[#171f33]/70 border-[#3f4850]/60'
          }`}
        >
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={(e) => handleFilesAdded(e.target.files)}
          />

          {/* Cloud Upload Icon Graphic */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 mb-4 rounded-2xl bg-[#171f33] flex items-center justify-center text-[#93ccff] group-hover:scale-105 group-hover:bg-[#3198dc] group-hover:text-[#002c47] transition-all duration-300 shadow-md border border-[#3f4850]/40">
            <span className="material-symbols-outlined text-[40px] sm:text-[48px]">cloud_upload</span>
          </div>

          <div className="max-w-2xl mx-auto space-y-1.5">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-[#dae2fd] tracking-tight">
              Drag & Drop PDF Documents Here
            </h2>
            <p className="text-xs sm:text-sm text-[#bfc7d2]">
              Supports single or multiple PDF files up to 50MB each. Scanned images, multi-page invoices, and high-density digital PDFs.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="h-10 px-5 bg-[#93ccff] text-[#003351] font-semibold text-xs sm:text-sm rounded flex items-center gap-2 hover:bg-[#3198dc] hover:text-[#002c47] transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">folder_open</span>
              <span>Browse Files</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                showToast('Cloud storage connector modal opened (S3 / GDrive / Dropbox).');
              }}
              className="h-10 px-4 bg-[#222a3d] text-[#dae2fd] font-semibold text-xs sm:text-sm rounded flex items-center gap-2 hover:bg-[#2d3449] hover:text-[#93ccff] transition-colors shadow-sm border border-[#3f4850]/40"
            >
              <span className="material-symbols-outlined text-[18px]">cloud_sync</span>
              <span className="hidden sm:inline">Connect Cloud Storage (S3 / Google Drive / Dropbox)</span>
              <span className="sm:hidden">Cloud Storage</span>
            </button>
          </div>

          {/* Format Guidance Tags */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-[#bfc7d2]">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#171f33] text-[#7bd0ff] font-mono text-[11px] border border-[#3f4850]/30">
              <span className="material-symbols-outlined text-[14px]">psychology</span>
              <span>OCR Powered</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#171f33] text-[#dae2fd] font-mono text-[11px] border border-[#3f4850]/30">
              <span className="material-symbols-outlined text-[14px]">translate</span>
              <span>Multi-Language Supported</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#171f33] text-[#b4c5ff] font-mono text-[11px] border border-[#3f4850]/30">
              <span className="material-symbols-outlined text-[14px]">picture_as_pdf</span>
              <span>PDF 1.4 – 2.0</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#171f33] text-[#93ccff] font-mono text-[11px] border border-[#3f4850]/30">
              <span className="material-symbols-outlined text-[14px]">category</span>
              <span>Auto Document Classification</span>
            </span>
          </div>
        </div>
      </div>

      {/* Queue Ingestion Engine Settings */}
      <div className="bg-[#131b2e] rounded-xl p-4 shadow-sm space-y-4 border border-[#3f4850]/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#93ccff] text-[20px]">tune</span>
            <span className="text-xs sm:text-sm font-semibold text-[#dae2fd]">
              Queue Ingestion Engine Settings
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#7bd0ff]"></span>
            <span className="font-mono text-[10px] text-[#89929b]">Cluster State: Healthy</span>
          </div>
        </div>

        {/* Parameter Config Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Auto Start Toggle */}
          <div className="flex items-center justify-between p-3 rounded bg-[#171f33] border border-[#3f4850]/20">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-[#dae2fd]">Auto-start Extraction</span>
              <span className="text-[10px] text-[#89929b]">Immediate run upon file drop</span>
            </div>
            <button
              type="button"
              onClick={() => setAutoStart(!autoStart)}
              className={`w-9 h-5 rounded-full relative transition-colors ${
                autoStart ? 'bg-[#93ccff]' : 'bg-[#222a3d]'
              }`}
            >
              <span
                className={`w-3.5 h-3.5 rounded-full absolute top-0.5 transition-transform ${
                  autoStart ? 'bg-[#003351] right-0.5' : 'bg-[#89929b] left-0.5'
                }`}
              ></span>
            </button>
          </div>

          {/* Target Schema Selector */}
          <div className="p-3 rounded bg-[#171f33] flex flex-col justify-between border border-[#3f4850]/20">
            <span className="font-mono text-[9px] uppercase text-[#89929b]">Target Field Schema</span>
            <select
              value={selectedSchema}
              onChange={(e) => setSelectedSchema(e.target.value)}
              className="mt-1 bg-transparent text-xs text-[#dae2fd] font-medium focus:outline-none cursor-pointer truncate"
            >
              <option value="Commercial Invoice v2.4 (21 fields)" className="bg-[#171f33]">
                Commercial Invoice v2.4 (21 fields)
              </option>
              <option value="Purchase Orders PO-850" className="bg-[#171f33]">
                Purchase Orders PO-850
              </option>
              <option value="Logistics Bill of Lading" className="bg-[#171f33]">
                Logistics Bill of Lading
              </option>
            </select>
          </div>

          {/* AI Model Routing */}
          <div className="p-3 rounded bg-[#171f33] flex flex-col justify-between border border-[#3f4850]/20">
            <span className="font-mono text-[9px] uppercase text-[#89929b]">AI Model Routing</span>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="mt-1 bg-transparent text-xs text-[#93ccff] font-medium focus:outline-none cursor-pointer truncate"
            >
              <option value="GPT-4o Vision + Textract Hybrid" className="bg-[#171f33]">
                GPT-4o Vision + Textract Hybrid
              </option>
              <option value="Llama-Vision-OCR-70B" className="bg-[#171f33]">
                Llama-Vision-OCR-70B
              </option>
              <option value="Gemini 2.5 Flash Document Engine" className="bg-[#171f33]">
                Gemini 2.5 Flash Document Engine
              </option>
            </select>
          </div>

          {/* Confidence Guardrail */}
          <div className="p-3 rounded bg-[#171f33] flex flex-col justify-between border border-[#3f4850]/20">
            <span className="font-mono text-[9px] uppercase text-[#89929b]">Review Guardrail</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-[#dae2fd]">Auto-flag if confidence &lt; 90%</span>
              <span className="px-1.5 py-0.2 rounded bg-[#222a3d] text-[#7bd0ff] font-mono text-[9px] border border-[#7bd0ff]/30">
                Strict
              </span>
            </div>
          </div>
        </div>

        {/* Date Extraction Fallback Strategy */}
        <div className="p-2.5 rounded bg-[#060e20] flex flex-wrap items-center justify-between gap-2 border border-[#3f4850]/20">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="material-symbols-outlined text-[16px] text-[#89929b]">route</span>
            <span className="font-mono text-[10px] uppercase text-[#89929b]">Date Hierarchy Strategy:</span>
          </div>
          <div className="flex flex-wrap items-center gap-1 font-mono text-[10px]">
            <span className="px-2 py-0.5 rounded bg-[#171f33] text-[#93ccff]">1. Document Date</span>
            <span className="text-[#89929b]">→</span>
            <span className="px-2 py-0.5 rounded bg-[#171f33] text-[#bfc7d2]">2. Invoice Date</span>
            <span className="text-[#89929b]">→</span>
            <span className="px-2 py-0.5 rounded bg-[#171f33] text-[#bfc7d2]">3. Transaction Date</span>
            <span className="text-[#89929b]">→</span>
            <span className="px-2 py-0.5 rounded bg-[#171f33] text-[#bfc7d2]">4. Created Date</span>
            <span className="text-[#89929b]">→</span>
            <span className="px-2 py-0.5 rounded bg-[#171f33] text-[#7bd0ff]">5. Upload Date</span>
          </div>
        </div>
      </div>

      {/* Active Pipeline Tracker & Stages */}
      <div className="bg-[#131b2e] rounded-xl p-4 shadow-sm border border-[#3f4850]/30 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-semibold text-[#dae2fd]">Active Pipeline Tracker</h3>
              <span className="px-2 py-0.5 rounded-full bg-[#93ccff]/20 text-[#93ccff] font-mono text-[10px]">
                {queueItems.length} files in queue
              </span>
            </div>
            <p className="text-xs text-[#bfc7d2]">
              Sub-second event stream tracking OCR, LLM inference, and automated validation rules
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleProcessAll}
              className="h-8 px-3 bg-[#93ccff] text-[#003351] font-semibold rounded text-xs flex items-center gap-1.5 hover:bg-[#3198dc] hover:text-[#002c47] transition-colors shadow-sm"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">play_arrow</span>
              <span>Process All In Queue</span>
            </button>
            <button
              onClick={handleClearCompleted}
              className="h-8 px-2.5 bg-[#222a3d] hover:bg-[#31394d] text-[#bfc7d2] hover:text-[#dae2fd] text-xs font-mono rounded flex items-center gap-1 transition-colors border border-[#3f4850]/30"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">done_all</span>
              <span>Clear Completed</span>
            </button>
            <button
              onClick={() => showToast('Exporting JSON execution log...')}
              className="h-8 px-2.5 bg-[#222a3d] hover:bg-[#31394d] text-[#bfc7d2] hover:text-[#dae2fd] text-xs font-mono rounded flex items-center gap-1 transition-colors border border-[#3f4850]/30"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span className="hidden sm:inline">Processing Log (JSON)</span>
            </button>
          </div>
        </div>

        {/* Stepper Graphic Pipeline Stages */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 p-2.5 bg-[#060e20] rounded-lg border border-[#3f4850]/20">
          {[
            { num: 1, name: 'Stage 1', title: 'Uploaded', bg: 'bg-[#93ccff] text-[#003351]' },
            { num: 2, name: 'Stage 2', title: 'OCR Rasterizing', bg: 'bg-[#3198dc] text-[#002c47]' },
            { num: 3, name: 'Stage 3', title: 'AI Field Extracting', bg: 'bg-[#7bd0ff] text-[#00354a]' },
            { num: 4, name: 'Stage 4', title: 'Validation & Math', bg: 'bg-[#b4c5ff] text-[#002a78]' },
            { num: 5, name: 'Stage 5', title: 'Ready for Export', bg: 'bg-[#222a3d] text-[#7bd0ff]' }
          ].map((stg) => (
            <div key={stg.num} className="flex items-center gap-2 p-2 rounded bg-[#131b2e] border border-[#3f4850]/30">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold shrink-0 ${stg.bg}`}
              >
                {stg.num}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-mono text-[9px] uppercase text-[#89929b]">{stg.name}</span>
                <span className="text-xs text-[#dae2fd] font-medium truncate">{stg.title}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Queue Workbench Split: Items List (8 Cols) + Live Optical Inspector (4 Cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Queue Items List (8 Columns) */}
        <div className="xl:col-span-8 flex flex-col space-y-3">
          {queueItems.map((item) => {
            const isActive = item.status === 'active';
            const isCompleted = item.status === 'completed';
            const isFailed = item.status === 'failed';
            const isPre = item.status === 'preprocessing';
            const isMath = item.status === 'math_check';

            return (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-[#131b2e] hover:bg-[#171f33] transition-all border border-[#3f4850]/30 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded flex items-center justify-center shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : isFailed
                          ? 'bg-[#93000a] text-[#ffdad6]'
                          : isActive
                          ? 'bg-[#3198dc]/20 text-[#93ccff]'
                          : 'bg-[#222a3d] text-[#bfc7d2]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {isCompleted
                          ? 'task_alt'
                          : isFailed
                          ? 'error_outline'
                          : isPre
                          ? 'sync'
                          : isMath
                          ? 'calculate'
                          : 'description'}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs sm:text-sm text-[#dae2fd] truncate">
                          {item.fileName}
                        </span>
                        <span
                          className={`px-1.5 py-0.2 rounded font-mono text-[9px] ${
                            isCompleted
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : isFailed
                              ? 'bg-[#93000a] text-[#ffdad6]'
                              : 'bg-[#222a3d] text-[#93ccff]'
                          }`}
                        >
                          {item.stageName}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-[#89929b]">
                        {item.fileSize} • {item.pages} page{item.pages > 1 ? 's' : ''} • Engine: {item.engine}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-[#7bd0ff]">{item.eta}</span>
                    {isCompleted && (
                      <button
                        onClick={() => onNavigateToReview(item.id)}
                        className="h-7 px-2.5 bg-[#93ccff] text-[#003351] font-semibold text-xs rounded hover:bg-[#3198dc] transition-colors"
                        type="button"
                      >
                        View Data
                      </button>
                    )}
                    {isFailed && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleRetryFailed(item.id)}
                          className="h-7 px-2 bg-[#222a3d] hover:bg-[#31394d] text-[#dae2fd] text-[11px] font-mono rounded flex items-center gap-1 border border-[#3f4850]/40"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[13px]">tune</span>
                          <span>Retry High-DPI</span>
                        </button>
                        <button
                          onClick={() => onNavigateToReview(item.id)}
                          className="h-7 px-2 bg-[#93000a] hover:bg-red-700 text-[#ffdad6] text-[11px] font-mono rounded flex items-center gap-1"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[13px]">support_agent</span>
                          <span>Manual Review</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Track */}
                <div className="w-full bg-[#060e20] h-2 rounded-full overflow-hidden my-2 border border-[#3f4850]/20">
                  <div
                    className={`h-full rounded-full transition-all duration-500 relative ${
                      isFailed
                        ? 'bg-[#93000a]'
                        : isCompleted
                        ? 'bg-emerald-400'
                        : isPre
                        ? 'bg-[#b4c5ff]'
                        : 'bg-[#93ccff]'
                    }`}
                    style={{ width: `${item.progressPercent}%` }}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between font-mono text-[10px] text-[#bfc7d2]">
                  <span className={isFailed ? 'text-[#ffb4ab]' : ''}>{item.details}</span>
                  <span className="text-[#dae2fd] font-semibold">{item.progressPercent}%</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live OCR Bounding View & Inspector Panel (4 Columns) */}
        <div className="xl:col-span-4 flex flex-col space-y-4">
          <div className="bg-[#131b2e] rounded-xl p-4 shadow-sm border border-[#3f4850]/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#93ccff] text-[18px]">document_scanner</span>
                <span className="text-xs sm:text-sm font-semibold text-[#dae2fd]">
                  Live OCR Bounding View
                </span>
              </div>
              <span className="font-mono text-[11px] text-[#7bd0ff]">Vendor_Invoice_Oct2026.pdf (P.1)</span>
            </div>

            {/* Simulated Document Canvas with Dynamic Interactive Bounding Boxes */}
            <div className="relative w-full aspect-[3/4] bg-[#060e20] rounded-lg overflow-hidden flex flex-col items-center justify-center p-2 shadow-inner group border border-[#3f4850]/40">
              {/* Document Background Image */}
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCro6pX3Tl3CxLehvj2NfVaSo1VUC14-ZuLMLNOyZBcZqRhH_xD8X3nS_QBMNzJ3VpVoK_E6hJZhSPc2bdA9uAA_xErwTn8APMJr1Wua4-ut9BFBqeZdiSxXFX-z0izLMLzojPyk7xcOzdNSOMnp8hiHzv-i9AtMRso9wW6MrZLbq_iMWqX7NeMTIEd1UwBplt35i7D9saszKg94_g4soQ47XFsQAqtNHGoVZdMhxkvebmIRSELZgijjQ"
                alt="Document preview with OCR bounding boxes"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded opacity-80"
              />

              {/* Bounding Box 1: Vendor Name */}
              <div className="absolute top-[18%] left-[10%] w-[44%] h-[6%] rounded bg-[#7bd0ff]/15 border-2 border-[#7bd0ff] flex items-center justify-between px-1.5 cursor-pointer hover:bg-[#7bd0ff]/30 transition-all">
                <span className="font-mono text-[9px] text-[#7bd0ff] bg-[#060e20]/80 px-1 rounded">
                  VendorName: 99.8%
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#7bd0ff]"></span>
              </div>

              {/* Bounding Box 2: Total Amount */}
              <div className="absolute top-[68%] right-[8%] w-[42%] h-[8%] rounded bg-[#93ccff]/20 border-2 border-[#93ccff] ring-2 ring-[#93ccff]/40 animate-pulse flex flex-col justify-center px-1.5 cursor-pointer">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-[#93ccff] font-bold">Total: $18,450.00</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#93ccff]"></span>
                </div>
                <span className="font-mono text-[8px] text-[#cce5ff]">Confidence: 94.6% (Passed)</span>
              </div>

              {/* Bounding Box 3: Invoice Date */}
              <div className="absolute top-[28%] right-[10%] w-[36%] h-[6%] rounded bg-[#b4c5ff]/15 border-2 border-[#b4c5ff] flex items-center justify-between px-1.5 cursor-pointer hover:bg-[#b4c5ff]/30 transition-all">
                <span className="font-mono text-[9px] text-[#b4c5ff] bg-[#060e20]/80 px-1 rounded">
                  InvDate: 2026-10-14
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#b4c5ff]"></span>
              </div>

              {/* Canvas Controls */}
              <div className="absolute bottom-2 left-2 right-2 bg-[#171f33]/90 backdrop-blur-md rounded p-1.5 flex items-center justify-between border border-[#3f4850]/40">
                <div className="flex items-center gap-1">
                  <button
                    className="w-6 h-6 rounded bg-[#222a3d] flex items-center justify-center text-[#dae2fd] hover:text-[#93ccff]"
                    type="button"
                    title="Zoom In"
                  >
                    <span className="material-symbols-outlined text-[14px]">zoom_in</span>
                  </button>
                  <button
                    className="w-6 h-6 rounded bg-[#222a3d] flex items-center justify-center text-[#dae2fd] hover:text-[#93ccff]"
                    type="button"
                    title="Zoom Out"
                  >
                    <span className="material-symbols-outlined text-[14px]">zoom_out</span>
                  </button>
                  <button
                    className="w-6 h-6 rounded bg-[#222a3d] flex items-center justify-center text-[#dae2fd] hover:text-[#93ccff]"
                    type="button"
                    title="Rotate View"
                  >
                    <span className="material-symbols-outlined text-[14px]">rotate_right</span>
                  </button>
                </div>
                <span className="font-mono text-[10px] text-[#bfc7d2]">Page 1 / 4 • 300 DPI</span>
              </div>
            </div>

            {/* Real-time Inferred Keys */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between font-mono text-[10px] text-[#89929b] uppercase">
                <span>Real-Time Inferred Keys</span>
                <span className="text-[#93ccff]">15/21 Extracted</span>
              </div>
              <div className="space-y-1 font-mono text-xs">
                <div className="flex items-center justify-between p-2 rounded bg-[#171f33] border border-[#3f4850]/20">
                  <span className="text-[#bfc7d2]">invoice_number</span>
                  <span className="text-[#dae2fd] font-semibold">INV-2026-8891</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-[#171f33] border border-[#3f4850]/20">
                  <span className="text-[#bfc7d2]">vendor_gstin</span>
                  <span className="text-[#dae2fd] font-semibold">27AABCV1234F1Z5</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-[#171f33] border border-[#3f4850]/20">
                  <span className="text-[#bfc7d2]">payment_terms</span>
                  <span className="text-[#93ccff] font-semibold">Net 30 Days</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-[#171f33] border border-[#3f4850]/20">
                  <span className="text-[#bfc7d2]">currency</span>
                  <span className="text-[#dae2fd] font-semibold">USD ($)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Operational Advice Card */}
          <div className="bg-[#131b2e] rounded-xl p-4 shadow-sm border border-[#3f4850]/30 space-y-1.5">
            <div className="flex items-center gap-2 text-[#7bd0ff]">
              <span className="material-symbols-outlined text-[18px]">info</span>
              <span className="text-xs font-semibold">High-Volume Tip</span>
            </div>
            <p className="text-xs text-[#bfc7d2] leading-relaxed">
              To accelerate extraction throughput by up to 3.4x, enable concurrent GPU binarization in{' '}
              <button
                onClick={() => onNavigate('engine-apis')}
                className="text-[#93ccff] hover:underline font-semibold"
              >
                Engine & OCR APIs
              </button>{' '}
              settings or configure auto-splitting for documents exceeding 20 pages.
            </p>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm p-3.5 rounded-lg bg-[#222a3d] border border-[#3f4850] text-[#dae2fd] shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2">
          <span className="material-symbols-outlined text-[#7bd0ff] text-[20px]">check_circle</span>
          <span className="text-xs leading-snug">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
