import React, { useState } from 'react';
import { SchemaField } from '../types';

interface SchemaBuilderScreenProps {
  initialFields: SchemaField[];
}

export const SchemaBuilderScreen: React.FC<SchemaBuilderScreenProps> = ({
  initialFields
}) => {
  const [fields, setFields] = useState<SchemaField[]>(initialFields);
  const [selectedFieldId, setSelectedFieldId] = useState<string>('fld-9'); // Grand Total
  const [activeTemplate, setActiveTemplate] = useState<string>('Standard Commercial Tax Invoice');
  const [templateMenuOpen, setTemplateMenuOpen] = useState<boolean>(false);
  const [groupFilter, setGroupFilter] = useState<'all' | 'mandatory' | 'financial' | 'tax'>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [confidenceCutoff, setConfidenceCutoff] = useState<number>(95);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Normalization settings for inspector
  const [stripCurrency, setStripCurrency] = useState<boolean>(true);
  const [roundDecimals, setRoundDecimals] = useState<boolean>(true);
  const [negativeParen, setNegativeParen] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const selectedField = fields.find((f) => f.id === selectedFieldId) || fields[0];

  const handleToggleRequired = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, required: !f.required } : f))
    );
    showToast(`Updated requirement constraint for field.`);
  };

  const handleDeleteField = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (fields.length <= 1) return;
    setFields((prev) => prev.filter((f) => f.id !== id));
    showToast('Field removed from active extraction schema.');
  };

  const handleAddField = () => {
    const newField: SchemaField = {
      id: `fld-${Date.now()}`,
      fieldName: 'New Custom Field',
      aliases: ['Custom Label', 'Alias 1'],
      dataType: 'TEXT',
      required: false,
      validationRule: 'Length >= 1',
      minConfidence: 85,
      status: 'Active',
      targetKey: 'custom_field',
      dataCast: 'String(128)'
    };
    setFields((prev) => [...prev, newField]);
    setSelectedFieldId(newField.id);
    showToast('Added new extraction target to schema.');
  };

  const handlePublish = () => {
    showToast('Schema INVOICE_STD_V4.2 published to all 8 worker nodes successfully.');
  };

  const filteredFields = fields.filter((f) => {
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      const match =
        f.fieldName.toLowerCase().includes(q) ||
        f.targetKey.toLowerCase().includes(q) ||
        f.aliases.some((a) => a.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (groupFilter === 'mandatory' && !f.required) return false;
    if (groupFilter === 'financial' && !f.fieldName.toLowerCase().includes('amount') && !f.fieldName.toLowerCase().includes('total')) return false;
    if (groupFilter === 'tax' && !f.fieldName.toLowerCase().includes('gst') && !f.fieldName.toLowerCase().includes('tax')) return false;
    return true;
  });

  return (
    <div className="flex flex-col w-full space-y-6">
      {/* Breadcrumb & Status Tracker */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-1 border-b border-[#3f4850]/20">
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#89929b]">
          <span className="hover:text-[#dae2fd] cursor-pointer">SCHEMAS</span>
          <span className="material-symbols-outlined text-[12px]">chevron_right</span>
          <span className="text-[#7bd0ff]">INVOICE_STD_V4.2</span>
          <span className="material-symbols-outlined text-[12px]">chevron_right</span>
          <span className="text-[#dae2fd]">FIELD_MAPPING_ENGINE</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#222a3d] text-[#7bd0ff] font-mono text-[11px] border border-[#3f4850]/40">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7bd0ff] animate-ping"></span>
            <span>LLM Pipeline Synced • Llama-Vision-OCR-70B</span>
          </div>
          <span className="font-mono text-[11px] text-[#89929b] hidden sm:inline">
            Last published: 18m ago by @s.jenkins
          </span>
        </div>
      </div>

      {/* Header & Control Bar */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-2">
        <div className="flex flex-col space-y-1 max-w-3xl">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#dae2fd] tracking-tight">
              Field Configuration & Schema Builder
            </h1>
            <span className="px-2 py-0.5 rounded bg-[#222a3d] text-[#93ccff] font-mono text-[10px] font-bold uppercase tracking-wider border border-[#3f4850]/40">
              PRODUCTION ACTIVE
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#bfc7d2] leading-relaxed">
            Define extraction targets, OCR label aliases, data types, validation formulas, and AI prompt instructions for automated document parsing.
          </p>
        </div>

        {/* Right Actions */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Active Template Switcher */}
          <div className="relative">
            <button
              onClick={() => setTemplateMenuOpen(!templateMenuOpen)}
              className="h-9 px-3 bg-[#222a3d] hover:bg-[#31394d] text-[#dae2fd] text-xs font-mono rounded flex items-center gap-2 transition-colors border border-[#3f4850]/40 shadow-sm"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px] text-[#93ccff]">description</span>
              <span className="font-semibold">{activeTemplate}</span>
              <span className="material-symbols-outlined text-[16px] text-[#89929b]">expand_more</span>
            </button>

            {templateMenuOpen && (
              <div className="absolute right-0 mt-1 w-72 bg-[#171f33] border border-[#3f4850] rounded-xl p-1.5 shadow-2xl z-40">
                <div className="px-2.5 py-1 text-[10px] font-mono text-[#89929b] uppercase tracking-wider">
                  Available Extraction Schemas
                </div>
                {[
                  { name: 'Standard Commercial Tax Invoice', fields: 11 },
                  { name: 'Purchase Orders (PO-850)', fields: 9 },
                  { name: 'Logistics Bill of Lading (BoL)', fields: 18 },
                  { name: 'Medical Expense Receipts & Claims', fields: 14 }
                ].map((tmpl) => (
                  <button
                    key={tmpl.name}
                    onClick={() => {
                      setActiveTemplate(tmpl.name);
                      setTemplateMenuOpen(false);
                      showToast(`Switched schema template to ${tmpl.name}.`);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded text-xs flex items-center justify-between transition-colors ${
                      activeTemplate === tmpl.name
                        ? 'bg-[#222a3d] text-[#93ccff] font-semibold'
                        : 'hover:bg-[#131b2e] text-[#dae2fd]'
                    }`}
                  >
                    <span>{tmpl.name}</span>
                    <span className="font-mono text-[10px] text-[#89929b]">{tmpl.fields} Fields</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => showToast('Schema JSON copied to clipboard in RFC-8259 format.')}
            className="h-9 px-3 bg-[#222a3d] hover:bg-[#31394d] text-[#dae2fd] text-xs font-mono rounded flex items-center gap-1.5 transition-colors border border-[#3f4850]/40"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">data_object</span>
            <span className="hidden sm:inline">Export Schema</span>
          </button>

          <button
            onClick={() => showToast('Running dry-run extraction against sample document #INV-2024-8902...')}
            className="h-9 px-3 bg-[#222a3d] hover:bg-[#31394d] text-[#7bd0ff] text-xs font-mono rounded flex items-center gap-1.5 transition-colors border border-[#3f4850]/40"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">biotech</span>
            <span className="hidden sm:inline">Test Sample PDF</span>
          </button>

          <button
            onClick={handleAddField}
            className="h-9 px-3.5 bg-[#93ccff] hover:bg-[#3198dc] text-[#003351] font-semibold text-xs rounded flex items-center gap-1.5 transition-all shadow-sm"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Add Field</span>
          </button>

          <button
            onClick={handlePublish}
            className="h-9 px-3.5 bg-[#0053db] hover:bg-[#003ea8] text-[#cdd7ff] font-semibold text-xs rounded flex items-center gap-1.5 transition-colors shadow-sm"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">publish</span>
            <span>Publish</span>
          </button>
        </div>
      </div>

      {/* Schema Overview Metrics (6 Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <div className="bg-[#131b2e] rounded-lg p-3 flex flex-col justify-between shadow-sm border border-[#3f4850]/30">
          <span className="font-mono text-[10px] uppercase text-[#89929b]">Total Targets</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold text-[#dae2fd] font-mono">{fields.length}</span>
            <span className="font-mono text-[10px] text-[#93ccff]">
              {fields.filter((f) => f.required).length} Mandatory
            </span>
          </div>
          <div className="w-full bg-[#222a3d] h-1 rounded-full mt-2 overflow-hidden">
            <div className="bg-[#93ccff] h-full" style={{ width: '63%' }}></div>
          </div>
        </div>

        <div className="bg-[#131b2e] rounded-lg p-3 flex flex-col justify-between shadow-sm border border-[#3f4850]/30">
          <span className="font-mono text-[10px] uppercase text-[#89929b]">Aliases Indexed</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold text-[#7bd0ff] font-mono">42</span>
            <span className="font-mono text-[10px] text-[#89929b]">3.8 / target</span>
          </div>
          <div className="w-full bg-[#222a3d] h-1 rounded-full mt-2 overflow-hidden">
            <div className="bg-[#7bd0ff] h-full" style={{ width: '82%' }}></div>
          </div>
        </div>

        <div className="bg-[#131b2e] rounded-lg p-3 flex flex-col justify-between shadow-sm border border-[#3f4850]/30">
          <span className="font-mono text-[10px] uppercase text-[#89929b]">Avg Auto-Confidence</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold text-[#dae2fd] font-mono">94.8%</span>
            <span className="font-mono text-[10px] text-[#7bd0ff]">+2.1% (v4.1)</span>
          </div>
          <div className="w-full bg-[#222a3d] h-1 rounded-full mt-2 overflow-hidden">
            <div className="bg-[#7bd0ff] h-full" style={{ width: '94%' }}></div>
          </div>
        </div>

        <div className="bg-[#131b2e] rounded-lg p-3 flex flex-col justify-between shadow-sm border border-[#3f4850]/30">
          <span className="font-mono text-[10px] uppercase text-[#89929b]">Cross-Field Checks</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold text-[#b4c5ff] font-mono">3</span>
            <span className="font-mono text-[10px] text-[#89929b]">Active</span>
          </div>
          <div className="w-full bg-[#222a3d] h-1 rounded-full mt-2 overflow-hidden">
            <div className="bg-[#b4c5ff] h-full" style={{ width: '100%' }}></div>
          </div>
        </div>

        <div className="bg-[#131b2e] rounded-lg p-3 flex flex-col justify-between shadow-sm border border-[#3f4850]/30">
          <span className="font-mono text-[10px] uppercase text-[#89929b]">Normalization Rules</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold text-[#dae2fd] font-mono">8</span>
            <span className="font-mono text-[10px] text-[#7bd0ff]">ISO-8601 & Dec</span>
          </div>
          <div className="w-full bg-[#222a3d] h-1 rounded-full mt-2 overflow-hidden">
            <div className="bg-[#93ccff] h-full" style={{ width: '72%' }}></div>
          </div>
        </div>

        <div className="bg-[#131b2e] rounded-lg p-3 flex flex-col justify-between shadow-sm border border-[#3f4850]/30">
          <span className="font-mono text-[10px] uppercase text-[#89929b]">Schema SLA Target</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold text-[#dae2fd] font-mono">99.8%</span>
            <span className="font-mono text-[10px] text-[#b4c5ff]">Zero-touch</span>
          </div>
          <div className="w-full bg-[#222a3d] h-1 rounded-full mt-2 overflow-hidden">
            <div className="bg-[#b4c5ff] h-full" style={{ width: '99%' }}></div>
          </div>
        </div>
      </div>

      {/* Main Workbench: Table (Left/Center) + Inspector & AI Prompt (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* LEFT PANE: Schema Definition Table (8 Cols) */}
        <div className="xl:col-span-8 flex flex-col space-y-4">
          {/* Table Controls & Filter Toolbar */}
          <div className="bg-[#131b2e] rounded-lg p-2.5 flex flex-wrap items-center justify-between gap-3 border border-[#3f4850]/30 shadow-sm">
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <span className="material-symbols-outlined text-[16px] text-[#89929b] pl-1">filter_list</span>
              <input
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter schema targets by name, regex, alias..."
                className="w-full h-8 px-2 bg-transparent text-[#dae2fd] placeholder:text-[#89929b] text-xs focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[10px]">
              <span className="text-[#89929b] uppercase mr-1">Group:</span>
              <button
                onClick={() => setGroupFilter('all')}
                className={`px-2 py-1 rounded transition-colors ${
                  groupFilter === 'all'
                    ? 'bg-[#222a3d] text-[#93ccff] font-semibold'
                    : 'text-[#89929b] hover:text-[#dae2fd]'
                }`}
              >
                ALL ({fields.length})
              </button>
              <button
                onClick={() => setGroupFilter('mandatory')}
                className={`px-2 py-1 rounded transition-colors ${
                  groupFilter === 'mandatory'
                    ? 'bg-[#222a3d] text-[#93ccff] font-semibold'
                    : 'text-[#89929b] hover:text-[#dae2fd]'
                }`}
              >
                MANDATORY ({fields.filter((f) => f.required).length})
              </button>
              <button
                onClick={() => setGroupFilter('financial')}
                className={`px-2 py-1 rounded transition-colors ${
                  groupFilter === 'financial'
                    ? 'bg-[#222a3d] text-[#93ccff] font-semibold'
                    : 'text-[#89929b] hover:text-[#dae2fd]'
                }`}
              >
                FINANCIAL (3)
              </button>
              <button
                onClick={() => setGroupFilter('tax')}
                className={`px-2 py-1 rounded transition-colors ${
                  groupFilter === 'tax'
                    ? 'bg-[#222a3d] text-[#93ccff] font-semibold'
                    : 'text-[#89929b] hover:text-[#dae2fd]'
                }`}
              >
                TAX (1)
              </button>
            </div>
          </div>

          {/* High-Density Editable Grid Container */}
          <div className="bg-[#131b2e] rounded-xl overflow-hidden border border-[#3f4850]/30 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[750px]">
                <thead>
                  <tr className="bg-[#171f33] text-[#89929b] font-mono text-[10px] uppercase tracking-wider border-b border-[#3f4850]/20">
                    <th className="py-2.5 px-3">Field Name</th>
                    <th className="py-2.5 px-3">PDF Label / Aliases & Keywords</th>
                    <th className="py-2.5 px-3">Data Type</th>
                    <th className="py-2.5 px-3 text-center">Required</th>
                    <th className="py-2.5 px-3">Validation Rule & Formula</th>
                    <th className="py-2.5 px-3 text-right">Min Conf</th>
                    <th className="py-2.5 px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3f4850]/15 text-xs text-[#dae2fd]">
                  {filteredFields.map((fld) => {
                    const isSelected = fld.id === selectedFieldId;
                    return (
                      <tr
                        key={fld.id}
                        onClick={() => setSelectedFieldId(fld.id)}
                        className={`transition-colors cursor-pointer group ${
                          isSelected
                            ? 'bg-[#222a3d] text-[#dae2fd]'
                            : 'hover:bg-[#171f33]'
                        }`}
                      >
                        <td className="py-2 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[14px] text-[#89929b] cursor-grab">
                              drag_indicator
                            </span>
                            <span className={`font-semibold ${isSelected ? 'text-[#93ccff]' : 'text-[#dae2fd]'}`}>
                              {fld.fieldName}
                            </span>
                            {isSelected && (
                              <span className="px-1 py-0.2 bg-[#93ccff]/20 text-[#93ccff] font-mono text-[9px] rounded uppercase font-bold">
                                Selected
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-2 px-3">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {fld.aliases.map((alias, idx) => (
                              <span
                                key={idx}
                                className="px-1.5 py-0.2 rounded bg-[#171f33] text-[#bfc7d2] font-mono text-[10px] border border-[#3f4850]/30"
                              >
                                {alias}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="py-2 px-3 whitespace-nowrap">
                          <span className="px-1.5 py-0.5 rounded bg-[#222a3d] text-[#7bd0ff] font-mono text-[10px] font-semibold border border-[#3f4850]/30">
                            {fld.dataType}
                          </span>
                        </td>

                        <td className="py-2 px-3 text-center">
                          <button
                            type="button"
                            onClick={(e) => handleToggleRequired(fld.id, e)}
                            className={`inline-flex items-center justify-center w-7 h-4 rounded-full relative transition-colors ${
                              fld.required ? 'bg-[#93ccff]' : 'bg-[#222a3d]'
                            }`}
                          >
                            <span
                              className={`w-3 h-3 rounded-full absolute transition-transform ${
                                fld.required
                                  ? 'bg-[#003351] right-0.5'
                                  : 'bg-[#89929b] left-0.5'
                              }`}
                            ></span>
                          </button>
                        </td>

                        <td className="py-2 px-3 font-mono text-xs text-[#bfc7d2] max-w-xs truncate">
                          {fld.validationRule}
                        </td>

                        <td className="py-2 px-3 text-right font-mono text-xs font-semibold text-[#7bd0ff]">
                          {fld.minConfidence}%
                        </td>

                        <td className="py-2 px-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1 text-[#89929b]">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedFieldId(fld.id);
                              }}
                              className="p-1 hover:text-[#93ccff] transition-colors"
                              title="Edit Field"
                            >
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                            </button>
                            <button
                              onClick={(e) => handleDeleteField(fld.id, e)}
                              className="p-1 hover:text-[#ffb4ab] transition-colors"
                              title="Delete Field"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="bg-[#171f33]/60 px-4 py-2 flex flex-wrap items-center justify-between text-[11px] font-mono text-[#89929b] border-t border-[#3f4850]/20">
              <div className="flex items-center gap-2">
                <span>Showing {filteredFields.length} extraction targets</span>
                <span>•</span>
                <span>All constraints validated against JSON Schema Draft-07</span>
              </div>
              <span className="text-[#7bd0ff]">Drag handles to re-order priority parsing hierarchy</span>
            </div>
          </div>

          {/* Live OCR Bounding Anchors Card (Sample Invoice #INV-2024-8902) */}
          <div className="bg-[#131b2e] rounded-xl p-4 shadow-sm border border-[#3f4850]/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#7bd0ff]">preview</span>
                <span className="text-xs sm:text-sm font-semibold text-[#dae2fd]">
                  Live OCR Bounding Anchors (Sample Invoice #INV-2024-8902)
                </span>
              </div>
              <span className="font-mono text-xs text-[#89929b]">Extracted in 218ms</span>
            </div>

            <div className="relative w-full h-36 bg-[#060e20] rounded-lg overflow-hidden p-3 flex items-center justify-center border border-[#3f4850]/30">
              {/* Simulated Texture */}
              <div className="w-full h-full bg-[#171f33]/30 rounded p-3 flex flex-col justify-between select-none">
                <div className="flex justify-between items-start opacity-40">
                  <div className="space-y-1">
                    <div className="w-32 h-2 bg-[#dae2fd] rounded"></div>
                    <div className="w-20 h-1.5 bg-[#89929b] rounded"></div>
                  </div>
                  <div className="space-y-1 text-right">
                    <div className="w-24 h-2 bg-[#dae2fd] rounded ml-auto"></div>
                    <div className="w-16 h-1.5 bg-[#89929b] rounded ml-auto"></div>
                  </div>
                </div>

                {/* Bounding Boxes Simulation */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="px-2 py-0.5 rounded bg-[#171f33] text-[#7bd0ff] font-mono text-[10px] flex items-center gap-1 border border-[#7bd0ff]/30 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7bd0ff]"></span>
                    <span>Date: 2024-10-24 (96%)</span>
                  </div>

                  <div className="px-2 py-0.5 rounded bg-[#171f33] text-[#bfc7d2] font-mono text-[10px] flex items-center gap-1 border border-[#3f4850]/40 shadow-sm">
                    <span>CUST# 8849-AC (89%)</span>
                  </div>

                  <div className="px-2.5 py-1 rounded bg-[#3198dc] text-[#002c47] font-mono text-[11px] font-bold flex items-center gap-1.5 shadow-md animate-pulse">
                    <span className="material-symbols-outlined text-[14px]">verified</span>
                    <span>Grand Total: ₹14,890.50 [Validated: Subtotal+Tax]</span>
                  </div>
                </div>

                <div className="flex justify-between items-center opacity-30 text-[#89929b] font-mono text-[9px]">
                  <span>GSTIN: 27AABCT3518Q1Z8</span>
                  <span>Payment Terms: Net 30</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANE: Inspector & AI Prompt Terminal (4 Cols) */}
        <div className="xl:col-span-4 flex flex-col space-y-4">
          {/* Panel 1: Field Configuration Inspector */}
          <div className="bg-[#131b2e] rounded-xl p-4 shadow-sm border border-[#3f4850]/30 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#3f4850]/20">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-[#93ccff]">tune</span>
                <span className="text-xs sm:text-sm font-semibold text-[#dae2fd]">
                  Field Configuration Inspector
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#93ccff] text-[#003351] font-mono text-xs font-bold">
                {selectedField.fieldName}
              </span>
            </div>

            {/* Target Metadata */}
            <div className="grid grid-cols-2 gap-2 p-2 rounded bg-[#171f33] border border-[#3f4850]/20">
              <div>
                <span className="font-mono text-[9px] uppercase text-[#89929b]">Target Key</span>
                <p className="font-mono text-xs text-[#dae2fd] font-semibold">{selectedField.targetKey}</p>
              </div>
              <div>
                <span className="font-mono text-[9px] uppercase text-[#89929b]">Data Cast</span>
                <p className="font-mono text-xs text-[#7bd0ff]">{selectedField.dataCast}</p>
              </div>
            </div>

            {/* Data Normalization Settings */}
            <div className="space-y-1.5">
              <label className="font-mono text-[10px] uppercase text-[#89929b] font-semibold">
                Data Normalization Settings
              </label>
              <div className="p-3 bg-[#171f33] rounded-lg space-y-2 border border-[#3f4850]/20 text-xs">
                <div
                  onClick={() => setStripCurrency(!stripCurrency)}
                  className="flex items-center justify-between cursor-pointer select-none"
                >
                  <span className="text-[#dae2fd]">Auto-strip currency symbols (₹, $, €, commas)</span>
                  <span className={`material-symbols-outlined text-[18px] ${stripCurrency ? 'text-[#93ccff]' : 'text-[#89929b]'}`}>
                    {stripCurrency ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                </div>
                <div
                  onClick={() => setRoundDecimals(!roundDecimals)}
                  className="flex items-center justify-between cursor-pointer select-none"
                >
                  <span className="text-[#dae2fd]">Round decimal to two digits (0.00)</span>
                  <span className={`material-symbols-outlined text-[18px] ${roundDecimals ? 'text-[#93ccff]' : 'text-[#89929b]'}`}>
                    {roundDecimals ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                </div>
                <div
                  onClick={() => setNegativeParen(!negativeParen)}
                  className="flex items-center justify-between cursor-pointer select-none"
                >
                  <span className="text-[#bfc7d2]">Negative balance parenthesization [ (x) &rarr; -x ]</span>
                  <span className={`material-symbols-outlined text-[18px] ${negativeParen ? 'text-[#93ccff]' : 'text-[#89929b]'}`}>
                    {negativeParen ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                </div>
              </div>
            </div>

            {/* Mathematical Cross-Field Validation Rule */}
            <div className="space-y-1.5">
              <label className="font-mono text-[10px] uppercase text-[#89929b] font-semibold">
                Mathematical Cross-Field Validation
              </label>
              <div className="p-3 bg-[#171f33] rounded-lg space-y-2 border border-[#3f4850]/20">
                <div>
                  <span className="font-mono text-[10px] text-[#89929b]">Active Formula Preset:</span>
                  <div className="mt-1 px-2.5 py-1.5 bg-[#222a3d] rounded text-[#dae2fd] text-xs font-semibold flex items-center justify-between border border-[#3f4850]/30">
                    <span>Calculated Sum Validation</span>
                    <span className="material-symbols-outlined text-[16px] text-[#7bd0ff]">functions</span>
                  </div>
                </div>
                {/* Formula Preview Pill */}
                <div className="p-2 bg-[#060e20] rounded font-mono text-[11px] text-[#93ccff] border border-[#3f4850]/40">
                  <code>[Subtotal Amount] + [Tax / GST Amount] === [Grand Total]</code>
                </div>
                {/* Fallback Tolerance Config */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-[#bfc7d2]">Fallback Rounding Tolerance:</span>
                  <span className="px-2 py-0.5 rounded bg-[#222a3d] text-[#dae2fd] font-mono text-[10px] font-semibold">
                    ±₹0.05 rounding diff
                  </span>
                </div>
              </div>
            </div>

            {/* Primary Date Priority Weighting */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-mono text-[10px] uppercase text-[#89929b] font-semibold">
                  Primary Date Priority Weighting
                </label>
                <span className="font-mono text-[10px] text-[#7bd0ff]">Fallback Waterfall</span>
              </div>
              <p className="text-[11px] text-[#bfc7d2]">
                When documents contain conflicting timestamps, determine the golden ledger date:
              </p>
              <div className="space-y-1">
                {[
                  { rank: 1, name: 'Document Date', role: 'Primary', bg: 'bg-[#93ccff] text-[#003351]' },
                  { rank: 2, name: 'Invoice Date', role: 'Fallback 1', bg: 'bg-[#222a3d] text-[#7bd0ff]' },
                  { rank: 3, name: 'Transaction Date', role: 'Fallback 2', bg: 'bg-[#222a3d] text-[#7bd0ff]' },
                  { rank: 4, name: 'Created Date', role: 'Fallback 3', bg: 'bg-[#171f33] text-[#89929b]' },
                  { rank: 5, name: 'Upload Date (System Clock)', role: 'Last Resort', bg: 'bg-[#171f33] text-[#89929b]' }
                ].map((item) => (
                  <div
                    key={item.rank}
                    className="flex items-center gap-2 p-1.5 bg-[#171f33] rounded font-mono text-[11px] text-[#dae2fd] border border-[#3f4850]/20"
                  >
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center font-bold text-[9px] ${item.bg}`}
                    >
                      {item.rank}
                    </span>
                    <span>{item.name}</span>
                    <span className="ml-auto text-[#89929b] text-[10px]">{item.role}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Confidence Cutoff Slider */}
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-[10px] uppercase text-[#89929b] font-semibold">
                  Field Confidence Cutoff
                </span>
                <span className="font-mono text-xs text-[#93ccff] font-bold">{confidenceCutoff}% Required</span>
              </div>
              <input
                type="range"
                min={75}
                max={99}
                value={confidenceCutoff}
                onChange={(e) => setConfidenceCutoff(Number(e.target.value))}
                className="w-full accent-[#93ccff] cursor-pointer"
              />
              <span className="text-[10px] text-[#89929b] block">
                Scores below {confidenceCutoff}% route this invoice to the Human-In-The-Loop review queue.
              </span>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => showToast(`Applied configuration updates to target '${selectedField.fieldName}'.`)}
                className="flex-1 h-8 bg-[#93ccff] hover:bg-[#3198dc] text-[#003351] font-semibold text-xs rounded flex items-center justify-center gap-1.5 transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">save</span>
                <span>Apply to Field</span>
              </button>
              <button
                onClick={() => {
                  setConfidenceCutoff(95);
                  setStripCurrency(true);
                  setRoundDecimals(true);
                }}
                className="h-8 px-3 bg-[#222a3d] hover:bg-[#31394d] text-[#89929b] hover:text-[#dae2fd] text-xs font-mono rounded transition-colors border border-[#3f4850]/30"
                type="button"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Panel 2: AI System Extraction Prompt Inspector */}
          <div className="bg-[#131b2e] rounded-xl p-4 shadow-sm border border-[#3f4850]/30 space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-[#3f4850]/20">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-[#7bd0ff]">terminal</span>
                <span className="text-xs sm:text-sm font-semibold text-[#dae2fd]">
                  AI System Extraction Prompt Inspector
                </span>
              </div>
              <span className="px-1.5 py-0.2 rounded bg-[#222a3d] text-[#7bd0ff] font-mono text-[10px] border border-[#7bd0ff]/30">
                Runtime Live
              </span>
            </div>

            <p className="text-xs text-[#bfc7d2]">
              Compiled system prompt generated from this field schema and sent to the LLM/VLM ingestion worker:
            </p>

            {/* Prompt Code Terminal */}
            <div className="bg-[#060e20] rounded-lg p-3 font-mono text-[11px] text-[#bfc7d2] overflow-x-auto relative border border-[#3f4850]/30">
              <button
                onClick={() => showToast('System Prompt copied to clipboard.')}
                className="absolute top-2 right-2 p-1 bg-[#222a3d] hover:bg-[#31394d] text-[#89929b] hover:text-white rounded"
                title="Copy Prompt"
              >
                <span className="material-symbols-outlined text-[14px]">content_copy</span>
              </button>
              <pre className="leading-relaxed whitespace-pre-wrap">
                <span className="text-[#7bd0ff] font-semibold">// SYSTEM INSTRUCTION (DO NOT OVERRIDE)</span>
                {'\n'}You are an enterprise document data extraction engine. Analyze the supplied PDF and extract only information that is explicitly present in the document. Do not invent, infer, or hallucinate values.
                {'\n\n'}
                <span className="text-[#93ccff] font-semibold">SCHEMA TARGET RULES:</span>
                {'\n'}- Normalize all extracted currency values into standard Decimals without symbols.
                {'\n'}- Respect the following mathematically verified dependency:
                {'\n'}  Subtotal + Tax == Grand Total (allowable delta: ±0.05).
                {'\n'}- If date disambiguation is required, adhere strictly to priority order:
                {'\n'}  [Document Date &gt; Invoice Date &gt; Transaction Date &gt; Created Date].
                {'\n'}- Return strict RFC 8259 JSON format according to the output schema.
              </pre>
            </div>

            {/* JSON Schema Preview */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono text-[#89929b] uppercase">
                <span>Target JSON Output Schema Contract</span>
                <span>application/json</span>
              </div>
              <div className="bg-[#060e20] rounded-lg p-3 font-mono text-[11px] text-[#89929b] overflow-x-auto max-h-40 overflow-y-auto border border-[#3f4850]/30">
                <pre className="leading-relaxed">
                  <span className="text-[#dae2fd]">&#123;</span>
                  {'\n  '}<span className="text-[#7bd0ff]">"$schema"</span>: <span className="text-[#93ccff]">"http://json-schema.org/draft-07/schema#"</span>,
                  {'\n  '}<span className="text-[#7bd0ff]">"type"</span>: <span className="text-[#93ccff]">"object"</span>,
                  {'\n  '}<span className="text-[#7bd0ff]">"required"</span>: [
                  {'\n    '}<span className="text-[#93ccff]">"customer_name"</span>,
                  {'\n    '}<span className="text-[#93ccff]">"invoice_number"</span>,
                  {'\n    '}<span className="text-[#93ccff]">"invoice_date"</span>,
                  {'\n    '}<span className="text-[#93ccff]">"gstin_number"</span>,
                  {'\n    '}<span className="text-[#93ccff]">"subtotal_amount"</span>,
                  {'\n    '}<span className="text-[#93ccff]">"tax_amount"</span>,
                  {'\n    '}<span className="text-[#93ccff]">"grand_total"</span>
                  {'\n  '}],
                  {'\n  '}<span className="text-[#7bd0ff]">"properties"</span>: &#123;
                  {'\n    '}<span className="text-[#7bd0ff]">"grand_total"</span>: &#123;
                  {'\n      '}<span className="text-[#89929b]">"type"</span>: <span className="text-[#93ccff]">"number"</span>,
                  {'\n      '}<span className="text-[#89929b]">"minimum"</span>: 0.01,
                  {'\n      '}<span className="text-[#89929b]">"confidence_threshold"</span>: {confidenceCutoff / 100}
                  {'\n    '}&#125;
                  {'\n  '}&#125;
                  {'\n'}<span className="text-[#dae2fd]">&#125;</span>
                </pre>
              </div>
            </div>

            <div className="flex items-center justify-between text-[#89929b] font-mono text-[10px] pt-1">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7bd0ff]"></span>
                <span>JSON-Schema compilation: Valid</span>
              </span>
              <button
                onClick={() => showToast('Raw JSON editor opened in modal.')}
                className="text-[#93ccff] hover:underline"
              >
                View in Raw JSON Editor
              </button>
            </div>
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
