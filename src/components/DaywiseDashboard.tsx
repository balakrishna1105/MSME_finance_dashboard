import React, { useState, useMemo } from 'react';
import { DocumentRecord, ActiveScreen } from '../types';

interface DaywiseDashboardProps {
  documents: DocumentRecord[];
  onNavigateToReview: (docId: string) => void;
  onNavigate: (screen: ActiveScreen) => void;
}

export const DaywiseDashboard: React.FC<DaywiseDashboardProps> = ({
  documents,
  onNavigateToReview,
  onNavigate
}) => {
  const [pipelineMode, setPipelineMode] = useState<'stream' | 'batches' | 'reconciliation'>('stream');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [docTypeFilter, setDocTypeFilter] = useState<string>('all');
  const [searchEntity, setSearchEntity] = useState<string>('');
  const [confidenceFloor, setConfidenceFloor] = useState<string>('all');
  const [onlyMissingData, setOnlyMissingData] = useState<boolean>(false);
  const [dateRangePreset, setDateRangePreset] = useState<'today' | '7d' | 'mtd'>('mtd');
  const [density, setDensity] = useState<'compact' | 'standard' | 'extended'>('standard');
  const [selectedDocIds, setSelectedDocIds] = useState<Set<string>>(new Set());

  // Accordion open/close states
  const [open30Sep, setOpen30Sep] = useState<boolean>(true);
  const [open29Sep, setOpen29Sep] = useState<boolean>(true);
  const [open28Sep, setOpen28Sep] = useState<boolean>(false);

  // Export dropdown
  const [exportMenuOpen, setExportMenuOpen] = useState<boolean>(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  // Filtered documents for 30 Sep and 29 Sep
  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      if (onlyMissingData && !doc.hasIssue && doc.gstin !== 'MISSING') return false;
      if (statusFilter === 'valid' && doc.status !== 'valid') return false;
      if (statusFilter === 'review' && doc.status !== 'review') return false;
      if (statusFilter === 'failed' && doc.status !== 'failed') return false;
      if (docTypeFilter !== 'all' && doc.docType !== docTypeFilter) return false;
      if (searchEntity.trim()) {
        const query = searchEntity.toLowerCase();
        const match =
          doc.customerName.toLowerCase().includes(query) ||
          doc.fileName.toLowerCase().includes(query) ||
          doc.invoiceNumber.toLowerCase().includes(query) ||
          doc.gstin.toLowerCase().includes(query);
        if (!match) return false;
      }
      if (confidenceFloor === 'high' && doc.confidence < 95) return false;
      if (confidenceFloor === 'marginal' && (doc.confidence < 90 || doc.confidence >= 95)) return false;
      if (confidenceFloor === 'low' && doc.confidence >= 90) return false;
      return true;
    });
  }, [documents, onlyMissingData, statusFilter, docTypeFilter, searchEntity, confidenceFloor]);

  const docs30Sep = filteredDocs.filter((d) => d.datePartition === '30 September 2026');
  const docs29Sep = filteredDocs.filter((d) => d.datePartition === '29 September 2026');

  const toggleSelectDoc = (id: string) => {
    setSelectedDocIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(filteredDocs.map((d) => d.id));
      setSelectedDocIds(allIds);
    } else {
      setSelectedDocIds(new Set());
    }
  };

  const handleExport = (format: string) => {
    setExportMenuOpen(false);
    showNotification(`Generated ${format} export for ${filteredDocs.length} ledger records.`);
  };

  const handleBatchVerify = () => {
    if (selectedDocIds.size === 0) {
      showNotification('Please select one or more document records first.');
      return;
    }
    showNotification(`Successfully verified ${selectedDocIds.size} records in batch.`);
    setSelectedDocIds(new Set());
  };

  const handleSendToErp = () => {
    if (selectedDocIds.size === 0) {
      showNotification('Please select records to dispatch to SAP / NetSuite.');
      return;
    }
    showNotification(`Dispatched ${selectedDocIds.size} records via ERP Webhook (200 OK).`);
  };

  return (
    <div className="flex flex-col w-full space-y-6">
      {/* Sub-Header Metadata Bar & Title Segment */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4 pb-2">
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2 text-[#bfc7d2] font-mono text-xs uppercase tracking-wider">
            <span>Production Cluster AP-South-1</span>
            <span className="text-[#89929b]">/</span>
            <span className="text-[#93ccff] font-semibold">Ledger Pipeline v2.4</span>
            <span className="text-[#89929b]">/</span>
            <span className="flex items-center gap-1.5 text-[#7bd0ff]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7bd0ff] animate-pulse"></span>
              <span>Stream Synced</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#dae2fd] tracking-tight">
            Day-wise Extraction Ledger
          </h1>
          <p className="text-xs sm:text-sm text-[#bfc7d2] max-w-3xl leading-relaxed">
            Partitioned audit views for parsed financial artifacts, heuristic matching validations, and real-time human-in-the-loop (HITL) resolution metrics.
          </p>
        </div>

        {/* Quick Pipeline Controls */}
        <div className="flex flex-wrap items-center gap-2 self-start xl:self-auto shrink-0">
          <div className="flex items-center bg-[#222a3d] rounded p-0.5 border border-[#3f4850]/40">
            <button
              onClick={() => setPipelineMode('stream')}
              className={`px-3 py-1 rounded text-xs font-mono transition-all ${
                pipelineMode === 'stream'
                  ? 'bg-[#93ccff] text-[#003351] font-semibold shadow-sm'
                  : 'text-[#bfc7d2] hover:text-[#dae2fd]'
              }`}
            >
              Live Stream
            </button>
            <button
              onClick={() => setPipelineMode('batches')}
              className={`px-3 py-1 rounded text-xs font-mono transition-all ${
                pipelineMode === 'batches'
                  ? 'bg-[#93ccff] text-[#003351] font-semibold shadow-sm'
                  : 'text-[#bfc7d2] hover:text-[#dae2fd]'
              }`}
            >
              Daily Batches
            </button>
            <button
              onClick={() => setPipelineMode('reconciliation')}
              className={`px-3 py-1 rounded text-xs font-mono transition-all ${
                pipelineMode === 'reconciliation'
                  ? 'bg-[#93ccff] text-[#003351] font-semibold shadow-sm'
                  : 'text-[#bfc7d2] hover:text-[#dae2fd]'
              }`}
            >
              Reconciliation
            </button>
          </div>

          <button
            onClick={() => showNotification('Pipeline resynced with Worker Cluster AP-South-1.')}
            className="h-8 px-3 bg-[#222a3d] hover:bg-[#31394d] text-[#dae2fd] rounded text-xs font-mono flex items-center gap-1.5 transition-colors border border-[#3f4850]/40"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            <span>Resync</span>
          </button>

          <button
            onClick={() => showNotification('Full database dump archive queued for background download.')}
            className="h-8 px-3 bg-[#93ccff] text-[#003351] font-semibold rounded text-xs font-mono flex items-center gap-1.5 hover:bg-[#3198dc] hover:text-[#002c47] transition-colors shadow-sm"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Run Full Dump</span>
          </button>
        </div>
      </div>

      {/* Operational Summary KPI Dashboard Bento (7 Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
        {/* Card 1: Total Ingested */}
        <div className="bg-[#131b2e] rounded-xl p-3.5 shadow-sm relative overflow-hidden flex flex-col justify-between border border-[#3f4850]/30">
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono text-[10px] text-[#89929b] uppercase tracking-wider">Total Ingested</span>
            <span className="material-symbols-outlined text-[#89929b] text-[18px]">picture_as_pdf</span>
          </div>
          <div className="flex flex-col">
            <div className="text-xl sm:text-2xl font-semibold text-[#dae2fd] font-mono">14,892</div>
            <div className="flex items-center gap-1 mt-0.5 font-mono text-[11px] text-[#7bd0ff]">
              <span className="material-symbols-outlined text-[13px]">trending_up</span>
              <span>+12.4%</span>
              <span className="text-[#89929b] text-[10px] ml-0.5">vs last wk</span>
            </div>
          </div>
          <div className="w-full bg-[#2d3449] h-1 rounded-full mt-2.5 overflow-hidden">
            <div className="bg-[#93ccff] h-full rounded-full" style={{ width: '78%' }}></div>
          </div>
        </div>

        {/* Card 2: Total Records */}
        <div className="bg-[#131b2e] rounded-xl p-3.5 shadow-sm relative overflow-hidden flex flex-col justify-between border border-[#3f4850]/30">
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono text-[10px] text-[#89929b] uppercase tracking-wider">Total Records</span>
            <span className="material-symbols-outlined text-[#89929b] text-[18px]">data_object</span>
          </div>
          <div className="flex flex-col">
            <div className="text-xl sm:text-2xl font-semibold text-[#dae2fd] font-mono">14,350</div>
            <span className="font-mono text-[11px] text-[#bfc7d2] mt-0.5">Structured entities</span>
          </div>
          <div className="text-[10px] font-mono text-[#89929b] mt-2.5 flex items-center justify-between">
            <span>Capture Depth</span>
            <span className="text-[#dae2fd] font-semibold">96.3%</span>
          </div>
        </div>

        {/* Card 3: Today's Intake */}
        <div className="bg-[#131b2e] rounded-xl p-3.5 shadow-sm relative overflow-hidden flex flex-col justify-between border border-[#3f4850]/30">
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono text-[10px] text-[#89929b] uppercase tracking-wider">Today's Intake</span>
            <span className="px-1.5 py-0.5 bg-[#171f33] text-[#7bd0ff] rounded font-mono text-[10px] border border-[#3f4850]/40">
              30 SEP
            </span>
          </div>
          <div className="flex flex-col">
            <div className="text-xl sm:text-2xl font-semibold text-[#7bd0ff] font-mono">142</div>
            <span className="font-mono text-[11px] text-[#bfc7d2] mt-0.5">Current batch run</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7bd0ff]"></span>
            <span className="text-[10px] font-mono text-[#89929b]">Ingest active (14m ago)</span>
          </div>
        </div>

        {/* Card 4: Weekly Pace */}
        <div className="bg-[#131b2e] rounded-xl p-3.5 shadow-sm relative overflow-hidden flex flex-col justify-between border border-[#3f4850]/30">
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono text-[10px] text-[#89929b] uppercase tracking-wider">Weekly Pace</span>
            <span className="material-symbols-outlined text-[#89929b] text-[18px]">date_range</span>
          </div>
          <div className="flex flex-col">
            <div className="text-xl sm:text-2xl font-semibold text-[#dae2fd] font-mono">986</div>
            <span className="font-mono text-[11px] text-[#bfc7d2] mt-0.5">Mon - Current</span>
          </div>
          <div className="h-4 w-full mt-2.5">
            <svg className="w-full h-full text-[#93ccff]" preserveAspectRatio="none" viewBox="0 0 100 20">
              <path
                d="M0,15 L20,13 L40,16 L60,8 L80,11 L100,4"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>

        {/* Card 5: Month-to-Date */}
        <div className="bg-[#131b2e] rounded-xl p-3.5 shadow-sm relative overflow-hidden flex flex-col justify-between border border-[#3f4850]/30">
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono text-[10px] text-[#89929b] uppercase tracking-wider">Month to Date</span>
            <span className="material-symbols-outlined text-[#89929b] text-[18px]">event_repeat</span>
          </div>
          <div className="flex flex-col">
            <div className="text-xl sm:text-2xl font-semibold text-[#dae2fd] font-mono">4,120</div>
            <span className="font-mono text-[11px] text-[#bfc7d2] mt-0.5">Sept aggregate</span>
          </div>
          <div className="text-[10px] font-mono text-[#89929b] mt-2.5 flex items-center justify-between">
            <span>Target 4,500</span>
            <span className="text-[#7bd0ff] font-semibold">91.5%</span>
          </div>
        </div>

        {/* Card 6: Records Requiring Review (High Alert) */}
        <div className="bg-gradient-to-br from-[#131b2e] to-[#93000a]/20 rounded-xl p-3.5 shadow-sm relative overflow-hidden flex flex-col justify-between border border-[#93000a]/40">
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono text-[10px] text-[#ffb4ab] uppercase tracking-wider font-semibold">
              Needs Review
            </span>
            <span className="w-2 h-2 rounded-full bg-[#ffb4ab] animate-ping"></span>
          </div>
          <div className="flex flex-col">
            <div className="text-xl sm:text-2xl font-semibold text-[#ffb4ab] font-mono">18</div>
            <span className="font-mono text-[10px] text-[#ffdad6]/80 mt-0.5 leading-tight">
              &lt;90% conf or missing schema
            </span>
          </div>
          <div className="flex items-center justify-between mt-2.5 text-[10px] font-mono">
            <span className="text-[#ffdad6]/70">HITL queue load</span>
            <button
              onClick={() => onNavigate('review-hitl')}
              className="text-[#ffb4ab] hover:underline flex items-center gap-0.5 font-semibold"
            >
              Audit <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Card 7: Success Rate */}
        <div className="bg-[#131b2e] rounded-xl p-3.5 shadow-sm relative overflow-hidden flex flex-col justify-between border border-[#3f4850]/30 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono text-[10px] text-[#89929b] uppercase tracking-wider">Success Rate</span>
            <span className="material-symbols-outlined text-[#7bd0ff] text-[18px]">verified</span>
          </div>
          <div className="flex flex-col">
            <div className="text-xl sm:text-2xl font-semibold text-[#7bd0ff] font-mono">98.6%</div>
            <span className="font-mono text-[10px] text-[#bfc7d2] mt-0.5">Zero-Touch: 94.2%</span>
          </div>
          <div className="w-full bg-[#2d3449] h-1 rounded-full mt-2.5 overflow-hidden">
            <div className="bg-[#7bd0ff] h-full rounded-full" style={{ width: '98.6%' }}></div>
          </div>
        </div>
      </div>

      {/* Advanced Filter Toolbar */}
      <div className="bg-[#131b2e] rounded-xl p-4 shadow-sm flex flex-col gap-4 border border-[#3f4850]/30">
        {/* Row 1: Primary Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-12 gap-3 items-center">
          {/* Date Range with Presets */}
          <div className="xl:col-span-4 flex flex-col gap-1">
            <label className="font-mono text-[10px] uppercase tracking-wider text-[#89929b]">
              Date Range & Partition
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[#89929b] text-[16px]">
                  calendar_today
                </span>
                <input
                  readOnly
                  className="w-full h-8 pl-8 pr-2 bg-[#222a3d] text-[#dae2fd] rounded font-mono text-xs focus:outline-none border border-[#3f4850]/40 shadow-inner"
                  type="text"
                  value="01-09-2026 to 30-09-2026"
                />
              </div>
              <div className="flex items-center bg-[#171f33] rounded p-0.5 shrink-0 border border-[#3f4850]/40">
                <button
                  onClick={() => setDateRangePreset('today')}
                  className={`px-2 py-0.5 text-[10px] font-mono rounded transition-colors ${
                    dateRangePreset === 'today' ? 'bg-[#93ccff] text-[#003351] font-semibold' : 'text-[#bfc7d2]'
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={() => setDateRangePreset('7d')}
                  className={`px-2 py-0.5 text-[10px] font-mono rounded transition-colors ${
                    dateRangePreset === '7d' ? 'bg-[#93ccff] text-[#003351] font-semibold' : 'text-[#bfc7d2]'
                  }`}
                >
                  7D
                </button>
                <button
                  onClick={() => setDateRangePreset('mtd')}
                  className={`px-2 py-0.5 text-[10px] font-mono rounded transition-colors ${
                    dateRangePreset === 'mtd' ? 'bg-[#93ccff] text-[#003351] font-semibold' : 'text-[#bfc7d2]'
                  }`}
                >
                  MTD
                </button>
              </div>
            </div>
          </div>

          {/* Processing Status */}
          <div className="xl:col-span-2 flex flex-col gap-1">
            <label className="font-mono text-[10px] uppercase tracking-wider text-[#89929b]">Processing Status</label>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-8 px-2 pr-6 bg-[#222a3d] text-[#dae2fd] rounded text-xs focus:outline-none border border-[#3f4850]/40 appearance-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="valid">✓ Validated (95%+)</option>
                <option value="review">⚠️ Review Required (&lt;90%)</option>
                <option value="failed">✕ Extraction Failed</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[#89929b] text-[16px] pointer-events-none">
                expand_more
              </span>
            </div>
          </div>

          {/* Document Type */}
          <div className="xl:col-span-2 flex flex-col gap-1">
            <label className="font-mono text-[10px] uppercase tracking-wider text-[#89929b]">Document Type</label>
            <div className="relative">
              <select
                value={docTypeFilter}
                onChange={(e) => setDocTypeFilter(e.target.value)}
                className="w-full h-8 px-2 pr-6 bg-[#222a3d] text-[#dae2fd] rounded text-xs focus:outline-none border border-[#3f4850]/40 appearance-none cursor-pointer"
              >
                <option value="all">All Document Types</option>
                <option value="Tax Invoice">Tax Invoice</option>
                <option value="Freight Bill">Freight / Transport Bill</option>
                <option value="Service Invoice">Service Invoice</option>
                <option value="Utility Invoice">Utility Invoice</option>
                <option value="Goods Receipt">Goods Receipt</option>
                <option value="Courier Invoice">Courier Invoice</option>
                <option value="Scanned Receipt">Scanned Receipt</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[#89929b] text-[16px] pointer-events-none">
                expand_more
              </span>
            </div>
          </div>

          {/* Customer / Entity Tag */}
          <div className="xl:col-span-2 flex flex-col gap-1">
            <label className="font-mono text-[10px] uppercase tracking-wider text-[#89929b]">Customer / Entity</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[#89929b] text-[16px]">
                corporate_fare
              </span>
              <input
                value={searchEntity}
                onChange={(e) => setSearchEntity(e.target.value)}
                placeholder="Filter entity name..."
                className="w-full h-8 pl-8 pr-2 bg-[#222a3d] text-[#dae2fd] rounded text-xs focus:outline-none border border-[#3f4850]/40 placeholder:text-[#89929b]"
                type="text"
              />
            </div>
          </div>

          {/* Confidence Floor */}
          <div className="xl:col-span-2 flex flex-col gap-1">
            <label className="font-mono text-[10px] uppercase tracking-wider text-[#89929b]">Confidence Floor</label>
            <div className="relative">
              <select
                value={confidenceFloor}
                onChange={(e) => setConfidenceFloor(e.target.value)}
                className="w-full h-8 px-2 pr-6 bg-[#222a3d] text-[#dae2fd] rounded text-xs focus:outline-none border border-[#3f4850]/40 appearance-none cursor-pointer"
              >
                <option value="all">All Confidences</option>
                <option value="high">≥95% High Confidence</option>
                <option value="marginal">90% - 95% Marginal</option>
                <option value="low">&lt;90% Ambiguous / Low</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[#89929b] text-[16px] pointer-events-none">
                expand_more
              </span>
            </div>
          </div>
        </div>

        {/* Row 2: Secondary Filters & Actions Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#3f4850]/20">
          <div className="flex flex-wrap items-center gap-3">
            {/* Missing Data Toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyMissingData}
                onChange={(e) => setOnlyMissingData(e.target.checked)}
                className="accent-[#93ccff] w-4 h-4 rounded bg-[#131b2e]"
              />
              <span className="font-mono text-xs text-[#bfc7d2] hover:text-[#dae2fd]">
                Only Missing Required Data
              </span>
            </label>

            {/* Results Counter Tag */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#171f33] rounded-full text-[#bfc7d2] font-mono text-[11px] border border-[#3f4850]/30">
              <span className="w-1.5 h-1.5 rounded-full bg-[#93ccff]"></span>
              <span>
                Showing <strong className="text-[#dae2fd]">{filteredDocs.length} records</strong> matching filters
              </span>
            </div>

            {(statusFilter !== 'all' || docTypeFilter !== 'all' || searchEntity || onlyMissingData || confidenceFloor !== 'all') && (
              <button
                onClick={() => {
                  setStatusFilter('all');
                  setDocTypeFilter('all');
                  setSearchEntity('');
                  setConfidenceFloor('all');
                  setOnlyMissingData(false);
                }}
                className="font-mono text-[10px] text-[#89929b] hover:text-[#dae2fd] flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">filter_alt_off</span>
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          {/* Density & Export */}
          <div className="flex items-center gap-2">
            {/* Density switcher */}
            <div className="flex items-center bg-[#171f33] rounded p-0.5 border border-[#3f4850]/40">
              <button
                onClick={() => setDensity('compact')}
                className={`w-7 h-7 flex items-center justify-center rounded ${
                  density === 'compact' ? 'bg-[#222a3d] text-[#93ccff]' : 'text-[#89929b] hover:text-[#dae2fd]'
                }`}
                title="Compact Density"
              >
                <span className="material-symbols-outlined text-[16px]">density_small</span>
              </button>
              <button
                onClick={() => setDensity('standard')}
                className={`w-7 h-7 flex items-center justify-center rounded ${
                  density === 'standard' ? 'bg-[#222a3d] text-[#93ccff]' : 'text-[#89929b] hover:text-[#dae2fd]'
                }`}
                title="Standard Density"
              >
                <span className="material-symbols-outlined text-[16px]">density_medium</span>
              </button>
              <button
                onClick={() => setDensity('extended')}
                className={`w-7 h-7 flex items-center justify-center rounded ${
                  density === 'extended' ? 'bg-[#222a3d] text-[#93ccff]' : 'text-[#89929b] hover:text-[#dae2fd]'
                }`}
                title="Extended Density"
              >
                <span className="material-symbols-outlined text-[16px]">density_large</span>
              </button>
            </div>

            {/* Export Dropdown */}
            <div className="relative">
              <button
                onClick={() => setExportMenuOpen(!exportMenuOpen)}
                className="h-8 px-3 bg-[#222a3d] hover:bg-[#31394d] text-[#dae2fd] rounded text-xs font-mono flex items-center gap-1.5 transition-colors border border-[#3f4850]/40 shadow-sm"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">ios_share</span>
                <span>Export Data</span>
                <span className="material-symbols-outlined text-[14px]">arrow_drop_down</span>
              </button>

              {exportMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-44 bg-[#171f33] rounded-lg shadow-xl py-1 z-30 border border-[#3f4850]/60">
                  <button
                    onClick={() => handleExport('Excel (.xlsx)')}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-[#dae2fd] hover:bg-[#222a3d] transition-colors"
                  >
                    <span>Excel (.xlsx)</span>
                    <span className="font-mono text-[10px] text-[#89929b]">XLSX</span>
                  </button>
                  <button
                    onClick={() => handleExport('CSV Spreadsheet')}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-[#dae2fd] hover:bg-[#222a3d] transition-colors"
                  >
                    <span>CSV Spreadsheet</span>
                    <span className="font-mono text-[10px] text-[#89929b]">CSV</span>
                  </button>
                  <button
                    onClick={() => handleExport('Full Audit Report (PDF)')}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-[#dae2fd] hover:bg-[#222a3d] transition-colors"
                  >
                    <span>Full Audit Report</span>
                    <span className="font-mono text-[10px] text-[#89929b]">PDF</span>
                  </button>
                  <div className="h-px bg-[#3f4850]/40 my-1"></div>
                  <button
                    onClick={() => handleExport('Raw Schemas (JSON)')}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-[#dae2fd] hover:bg-[#222a3d] transition-colors"
                  >
                    <span>Raw Schemas (JSON)</span>
                    <span className="font-mono text-[10px] text-[#7bd0ff]">API</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Accordion 1: 30 September 2026 */}
      <div className="bg-[#131b2e] rounded-xl shadow-md overflow-hidden border border-[#3f4850]/30 transition-all">
        {/* Accordion Header */}
        <div
          onClick={() => setOpen30Sep(!open30Sep)}
          className="px-4 py-3 bg-[#171f33] hover:bg-[#1a233a] flex flex-wrap items-center justify-between gap-3 cursor-pointer select-none transition-colors border-b border-[#3f4850]/20"
        >
          <div className="flex items-center gap-3">
            <button
              className={`w-6 h-6 rounded flex items-center justify-center bg-[#222a3d] text-[#dae2fd] transition-transform duration-200 ${
                open30Sep ? 'rotate-0' : '-rotate-90'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">expand_more</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-semibold text-[#dae2fd]">30 September 2026</span>
              <span className="px-2 py-0.5 rounded-full bg-[#3198dc]/20 text-[#93ccff] font-mono text-xs font-medium">
                25 Records
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-[#222a3d] text-[#7bd0ff] font-mono text-[11px] border border-[#3f4850]/40">
                Latest Partition
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-4 font-mono text-xs">
              <div className="flex flex-col text-right">
                <span className="text-[#89929b] text-[10px] uppercase">Extracted Total</span>
                <span className="text-[#dae2fd] font-semibold">₹4,82,500</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[#89929b] text-[10px] uppercase">Avg Confidence</span>
                <span className="text-[#7bd0ff] font-semibold">96.4%</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#93000a]/40 text-[#ffdad6] text-xs font-semibold border border-[#93000a]/60">
                <span className="w-2 h-2 rounded-full bg-[#ffb4ab] animate-pulse"></span>
                <span>2 Require Review</span>
              </div>
            </div>
          </div>
        </div>

        {/* Collapsible Table Content */}
        {open30Sep && (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-[#171f33]/80 text-[#89929b] font-mono text-[10px] uppercase tracking-wider border-b border-[#3f4850]/20">
                  <th className="w-10 px-3 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={docs30Sep.length > 0 && docs30Sep.every((d) => selectedDocIds.has(d.id))}
                      onChange={(e) => {
                        docs30Sep.forEach((d) => {
                          if (e.target.checked) selectedDocIds.add(d.id);
                          else selectedDocIds.delete(d.id);
                        });
                        setSelectedDocIds(new Set(selectedDocIds));
                      }}
                      className="rounded bg-[#060e20] border-[#3f4850]/40 text-[#93ccff] cursor-pointer"
                    />
                  </th>
                  <th className="px-3 py-2">Time</th>
                  <th className="px-3 py-2">Document / File Name</th>
                  <th className="px-3 py-2">Document Type</th>
                  <th className="px-3 py-2">Customer Name</th>
                  <th className="px-3 py-2 font-mono">Invoice #</th>
                  <th className="px-3 py-2">Invoice Date</th>
                  <th className="px-3 py-2 font-mono">GSTIN</th>
                  <th className="px-3 py-2 text-right font-mono">Total Amount</th>
                  <th className="px-3 py-2 text-center">Status & Confidence</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3f4850]/15 text-xs text-[#dae2fd]">
                {docs30Sep.map((doc) => {
                  const isChecked = selectedDocIds.has(doc.id);
                  const isReview = doc.status === 'review';
                  const isFailed = doc.status === 'failed';
                  const isSpecialXYZ = doc.fileName === 'XYZ_Vendor_Inv.pdf';

                  return (
                    <tr
                      key={doc.id}
                      className={`transition-colors group ${
                        isFailed
                          ? 'bg-[#93000a]/15 hover:bg-[#93000a]/25'
                          : isReview
                          ? 'bg-amber-500/5 hover:bg-amber-500/10'
                          : 'hover:bg-[#171f33]'
                      }`}
                    >
                      <td className="px-3 py-2.5 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectDoc(doc.id)}
                          className="rounded bg-[#060e20] border-[#3f4850]/40 text-[#93ccff] cursor-pointer"
                        />
                      </td>
                      <td className="px-3 py-2.5 font-mono text-[#89929b] text-[11px]">{doc.time}</td>
                      <td className="px-3 py-2.5">
                        <div
                          onClick={() => onNavigateToReview(doc.id)}
                          className="flex items-center gap-1.5 max-w-[220px] cursor-pointer"
                        >
                          <span
                            className={`material-symbols-outlined text-[16px] shrink-0 ${
                              isFailed ? 'text-[#ffb4ab]' : isReview ? 'text-amber-400' : 'text-[#93ccff]'
                            }`}
                          >
                            {isFailed ? 'broken_image' : isReview ? 'warning' : 'description'}
                          </span>
                          <span
                            className={`font-mono text-xs truncate transition-colors ${
                              isFailed
                                ? 'text-[#ffb4ab] underline'
                                : isReview
                                ? 'text-[#dae2fd] group-hover:text-amber-300'
                                : 'text-[#dae2fd] group-hover:text-[#93ccff]'
                            }`}
                            title={doc.fileName}
                          >
                            {doc.fileName}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="px-1.5 py-0.5 rounded bg-[#171f33] text-[#bfc7d2] text-[10px] font-mono border border-[#3f4850]/30">
                          {doc.docType}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 font-medium truncate max-w-[180px]">
                        <span className={isFailed ? 'italic text-[#89929b]' : 'text-[#dae2fd]'}>
                          {doc.customerName}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-[#7bd0ff] text-xs">
                        {doc.invoiceNumber}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-xs text-[#bfc7d2]">
                        <div className="flex items-center gap-1">
                          <span>{doc.invoiceDate}</span>
                          {isSpecialXYZ && (
                            <span
                              className="material-symbols-outlined text-[14px] text-amber-400"
                              title="Low confidence date parsing (DD/MM ambiguity)"
                            >
                              help_outline
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-xs">
                        {doc.gstin === 'MISSING' ? (
                          <span className="px-1.5 py-0.5 rounded bg-[#93000a] text-[#ffdad6] font-mono text-[10px] font-semibold">
                            MISSING
                          </span>
                        ) : (
                          <span className="text-[#89929b]">{doc.gstin}</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-right text-xs font-semibold">
                        {doc.totalAmount > 0 ? `₹${doc.totalAmount.toLocaleString('en-IN')}` : '₹0'}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        {isFailed ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#93000a] text-[#ffdad6] text-[10px] font-mono">
                            <span className="material-symbols-outlined text-[13px]">close</span>
                            <span>{doc.confidenceLabel}</span>
                          </span>
                        ) : isReview ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-[10px] font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                            <span>{doc.confidenceLabel}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            <span>{doc.confidenceLabel}</span>
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          {isSpecialXYZ ? (
                            <button
                              onClick={() => onNavigateToReview(doc.id)}
                              className="h-6 px-2 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 rounded text-[11px] font-mono flex items-center gap-1 transition-colors"
                              type="button"
                            >
                              <span className="material-symbols-outlined text-[13px]">rate_review</span>
                              <span>Review & Correct</span>
                            </button>
                          ) : doc.gstin === 'MISSING' ? (
                            <button
                              onClick={() => onNavigateToReview(doc.id)}
                              className="h-6 px-2 bg-[#93000a] text-[#ffdad6] hover:bg-red-700 rounded text-[11px] font-mono flex items-center gap-1 transition-colors"
                              type="button"
                            >
                              <span className="material-symbols-outlined text-[13px]">build</span>
                              <span>Resolve</span>
                            </button>
                          ) : isFailed ? (
                            <button
                              onClick={() => showNotification('Reprocessing Scan_Damaged_04.pdf with enhanced binarization...')}
                              className="h-6 px-2 bg-[#222a3d] hover:bg-[#31394d] text-[#dae2fd] rounded text-[11px] font-mono flex items-center gap-1 transition-colors"
                              type="button"
                            >
                              <span className="material-symbols-outlined text-[13px]">sync_problem</span>
                              <span>Reprocess</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => onNavigateToReview(doc.id)}
                              className="w-7 h-7 rounded hover:bg-[#222a3d] flex items-center justify-center text-[#89929b] hover:text-[#93ccff] transition-colors"
                              title="PDF Live Preview & Edit"
                              type="button"
                            >
                              <span className="material-symbols-outlined text-[15px]">visibility</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Accordion 2: 29 September 2026 */}
      <div className="bg-[#131b2e] rounded-xl shadow-md overflow-hidden border border-[#3f4850]/30 transition-all">
        <div
          onClick={() => setOpen29Sep(!open29Sep)}
          className="px-4 py-3 bg-[#171f33] hover:bg-[#1a233a] flex flex-wrap items-center justify-between gap-3 cursor-pointer select-none transition-colors border-b border-[#3f4850]/20"
        >
          <div className="flex items-center gap-3">
            <button
              className={`w-6 h-6 rounded flex items-center justify-center bg-[#222a3d] text-[#dae2fd] transition-transform duration-200 ${
                open29Sep ? 'rotate-0' : '-rotate-90'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">expand_more</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-semibold text-[#dae2fd]">29 September 2026</span>
              <span className="px-2 py-0.5 rounded-full bg-[#222a3d] text-[#bfc7d2] font-mono text-xs font-medium border border-[#3f4850]/40">
                18 Records
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 font-mono text-xs">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-[#89929b] text-[10px] uppercase">Extracted Total</span>
              <span className="text-[#dae2fd] font-semibold">₹3,45,200</span>
            </div>
            <div className="hidden md:flex flex-col text-right">
              <span className="text-[#89929b] text-[10px] uppercase">Confidence</span>
              <span className="text-[#7bd0ff] font-semibold">97.1%</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-amber-500/10 text-amber-300 font-mono text-xs border border-amber-500/30">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>1 Review Item</span>
            </div>
          </div>
        </div>

        {open29Sep && (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-[#171f33]/80 text-[#89929b] font-mono text-[10px] uppercase tracking-wider border-b border-[#3f4850]/20">
                  <th className="w-10 px-3 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={docs29Sep.length > 0 && docs29Sep.every((d) => selectedDocIds.has(d.id))}
                      onChange={(e) => {
                        docs29Sep.forEach((d) => {
                          if (e.target.checked) selectedDocIds.add(d.id);
                          else selectedDocIds.delete(d.id);
                        });
                        setSelectedDocIds(new Set(selectedDocIds));
                      }}
                      className="rounded bg-[#060e20] border-[#3f4850]/40 text-[#93ccff] cursor-pointer"
                    />
                  </th>
                  <th className="px-3 py-2">Time</th>
                  <th className="px-3 py-2">Document / File Name</th>
                  <th className="px-3 py-2">Document Type</th>
                  <th className="px-3 py-2">Customer Name</th>
                  <th className="px-3 py-2 font-mono">Invoice #</th>
                  <th className="px-3 py-2">Invoice Date</th>
                  <th className="px-3 py-2 font-mono">GSTIN</th>
                  <th className="px-3 py-2 text-right font-mono">Total Amount</th>
                  <th className="px-3 py-2 text-center">Status & Confidence</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3f4850]/15 text-xs text-[#dae2fd]">
                {docs29Sep.map((doc) => {
                  const isChecked = selectedDocIds.has(doc.id);
                  const isReview = doc.status === 'review';

                  return (
                    <tr
                      key={doc.id}
                      className={`transition-colors group ${
                        isReview ? 'bg-amber-500/5 hover:bg-amber-500/10' : 'hover:bg-[#171f33]'
                      }`}
                    >
                      <td className="px-3 py-2.5 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectDoc(doc.id)}
                          className="rounded bg-[#060e20] border-[#3f4850]/40 text-[#93ccff] cursor-pointer"
                        />
                      </td>
                      <td className="px-3 py-2.5 font-mono text-[#89929b] text-[11px]">{doc.time}</td>
                      <td className="px-3 py-2.5">
                        <div
                          onClick={() => onNavigateToReview(doc.id)}
                          className="flex items-center gap-1.5 max-w-[220px] cursor-pointer"
                        >
                          <span
                            className={`material-symbols-outlined text-[16px] shrink-0 ${
                              isReview ? 'text-amber-400' : 'text-[#93ccff]'
                            }`}
                          >
                            {isReview ? 'flight_takeoff' : 'description'}
                          </span>
                          <span className="font-mono text-xs truncate text-[#dae2fd] group-hover:text-[#93ccff]">
                            {doc.fileName}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="px-1.5 py-0.5 rounded bg-[#171f33] text-[#bfc7d2] text-[10px] font-mono border border-[#3f4850]/30">
                          {doc.docType}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 font-medium truncate max-w-[180px]">{doc.customerName}</td>
                      <td className="px-3 py-2.5 font-mono text-[#7bd0ff] text-xs">{doc.invoiceNumber}</td>
                      <td className="px-3 py-2.5 font-mono text-xs text-[#bfc7d2]">{doc.invoiceDate}</td>
                      <td className="px-3 py-2.5 font-mono text-xs text-[#89929b]">{doc.gstin}</td>
                      <td className="px-3 py-2.5 font-mono text-right text-xs font-semibold">
                        <div className="flex items-center justify-end gap-1">
                          <span className={isReview ? 'text-amber-300' : 'text-[#dae2fd]'}>
                            ₹{doc.totalAmount.toLocaleString('en-IN')}
                          </span>
                          {isReview && (
                            <span
                              className="material-symbols-outlined text-[14px] text-amber-400"
                              title="Calculated sum mismatch (+₹240)"
                            >
                              calculate
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        {isReview ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-[10px] font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                            <span>{doc.confidenceLabel}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            <span>{doc.confidenceLabel}</span>
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-right whitespace-nowrap">
                        {isReview ? (
                          <button
                            onClick={() => onNavigateToReview(doc.id)}
                            className="h-6 px-2 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 rounded text-[11px] font-mono flex items-center gap-1 transition-colors"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[13px]">tune</span>
                            <span>Re-balance</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => onNavigateToReview(doc.id)}
                            className="w-7 h-7 rounded hover:bg-[#222a3d] flex items-center justify-center text-[#89929b] hover:text-[#93ccff] transition-colors"
                            title="View"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[15px]">visibility</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Accordion 3: 28 September 2026 (Collapsible Archive Sealed) */}
      <div className="bg-[#131b2e] rounded-xl shadow-sm overflow-hidden border border-[#3f4850]/30 transition-all">
        <div
          onClick={() => setOpen28Sep(!open28Sep)}
          className="px-4 py-3 bg-[#171f33]/60 hover:bg-[#171f33] flex flex-wrap items-center justify-between gap-3 cursor-pointer select-none transition-colors"
        >
          <div className="flex items-center gap-3">
            <button
              className={`w-6 h-6 rounded flex items-center justify-center bg-[#222a3d] text-[#dae2fd] transition-transform duration-200 ${
                open28Sep ? 'rotate-0' : '-rotate-90'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">expand_more</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-semibold text-[#bfc7d2]">28 September 2026</span>
              <span className="px-2 py-0.5 rounded-full bg-[#171f33] text-[#89929b] font-mono text-xs font-medium border border-[#3f4850]/30">
                32 Records
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-[#bfc7d2]">
            <span className="text-[#dae2fd]">32 Records</span>
            <span className="text-[#89929b]">•</span>
            <span className="text-[#dae2fd]">₹6,94,100</span>
            <span className="text-[#89929b]">•</span>
            <span className="text-[#7bd0ff]">98.8% Accuracy</span>
            <span className="text-[#89929b]">•</span>
            <span className="inline-flex items-center gap-1 text-emerald-400 text-[10px]">
              <span className="material-symbols-outlined text-[14px]">check_circle</span>
              <span>0 Issues</span>
            </span>
          </div>
        </div>

        {open28Sep && (
          <div className="p-6 text-center bg-[#0b1326]/60 flex flex-col items-center justify-center gap-2 border-t border-[#3f4850]/20">
            <span className="material-symbols-outlined text-[#89929b] text-[32px]">lock_clock</span>
            <span className="text-sm font-semibold text-[#dae2fd]">Archive Partition Sealed</span>
            <p className="text-xs text-[#89929b] max-w-md leading-relaxed">
              All 32 financial records from 28 Sep 2026 were fully reconciled with zero discrepancies and exported to SAP ERP on 28-09-2026 23:59:12 UTC.
            </p>
            <button
              onClick={() => showNotification('Historical partition 28-09-2026 unsealed for audit read.')}
              className="mt-2 h-7 px-3 bg-[#222a3d] hover:bg-[#31394d] text-[#dae2fd] text-xs font-mono rounded flex items-center gap-1.5 transition-colors border border-[#3f4850]/40"
              type="button"
            >
              <span className="material-symbols-outlined text-[14px]">unfold_more</span>
              <span>Unfold 32 Historical Rows</span>
            </button>
          </div>
        )}
      </div>

      {/* Floating Action Notice Toast */}
      {actionNotice && (
        <div className="fixed bottom-20 right-6 z-50 max-w-md p-3.5 rounded-lg bg-[#222a3d] border border-[#3f4850] text-[#dae2fd] shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2">
          <span className="material-symbols-outlined text-[#7bd0ff] text-[20px]">check_circle</span>
          <span className="text-xs leading-snug">{actionNotice}</span>
        </div>
      )}

      {/* Persistent Floating Bottom Action Bar & Bulk Controls */}
      <div className="sticky bottom-3 z-30 w-full bg-[#222a3d]/95 backdrop-blur-xl rounded-xl p-2.5 shadow-2xl border border-[#3f4850]/50 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Selected Count & Batch Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1 bg-[#060e20]/80 rounded font-mono text-xs border border-[#3f4850]/30">
            <input
              type="checkbox"
              checked={selectedDocIds.size > 0 && selectedDocIds.size === filteredDocs.length}
              onChange={(e) => handleSelectAll(e.target.checked)}
              className="rounded bg-[#171f33] border-[#3f4850]/40 text-[#93ccff] cursor-pointer"
            />
            <span className="text-[#bfc7d2]">Selected:</span>
            <span className="text-[#93ccff] font-bold">{selectedDocIds.size}</span>
            <span className="text-[#89929b] text-[10px]">/ {filteredDocs.length} records</span>
          </div>

          <div className="h-5 w-px bg-[#3f4850]/40 hidden sm:block"></div>

          {/* Batch Triggers */}
          <button
            onClick={() => handleExport('Selected .XLSX')}
            className="h-8 px-2.5 bg-[#171f33] hover:bg-[#2d3449] text-[#dae2fd] rounded text-xs font-mono flex items-center gap-1.5 transition-colors border border-[#3f4850]/30 shadow-sm"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px] text-[#7bd0ff]">table_chart</span>
            <span>Export Selected (.XLSX)</span>
          </button>

          <button
            onClick={handleBatchVerify}
            className="h-8 px-2.5 bg-[#171f33] hover:bg-[#2d3449] text-emerald-400 rounded text-xs font-mono flex items-center gap-1.5 transition-colors border border-[#3f4850]/30 shadow-sm"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">verified_user</span>
            <span>Batch Mark as Verified</span>
          </button>

          <button
            onClick={handleSendToErp}
            className="h-8 px-3 bg-[#93ccff] text-[#003351] font-semibold hover:bg-[#3198dc] hover:text-[#002c47] rounded text-xs font-mono flex items-center gap-1.5 transition-colors shadow-sm"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">sync_alt</span>
            <span>Send to ERP / Webhook</span>
          </button>
        </div>

        {/* Right: Interactive Pagination */}
        <div className="flex items-center gap-3 ml-auto">
          <div className="hidden lg:flex items-center gap-1 text-[#bfc7d2] font-mono text-[10px]">
            <span>Rows per page:</span>
            <select className="bg-[#171f33] px-1 py-0.5 rounded font-mono text-xs text-[#dae2fd] focus:outline-none border border-[#3f4850]/40 cursor-pointer">
              <option>25</option>
              <option>50</option>
              <option>100</option>
            </select>
          </div>
          <div className="flex items-center gap-1 font-mono text-xs">
            <span className="text-[#bfc7d2]">1 - {filteredDocs.length}</span>
            <span className="text-[#89929b]">of</span>
            <span className="text-[#dae2fd] font-semibold">{filteredDocs.length}</span>
          </div>
          <div className="flex items-center bg-[#171f33] rounded p-0.5 border border-[#3f4850]/40">
            <button
              className="w-7 h-7 flex items-center justify-center rounded text-[#89929b] hover:text-[#dae2fd]"
              title="First Page"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">first_page</span>
            </button>
            <button
              className="w-7 h-7 flex items-center justify-center rounded text-[#89929b] hover:text-[#dae2fd]"
              title="Previous Page"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
            </button>
            <span className="px-2 font-mono text-xs text-[#93ccff] font-semibold">1</span>
            <button
              className="w-7 h-7 flex items-center justify-center rounded text-[#89929b] hover:text-[#dae2fd]"
              title="Next Page"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
            <button
              className="w-7 h-7 flex items-center justify-center rounded text-[#89929b] hover:text-[#dae2fd]"
              title="Last Page"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">last_page</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
