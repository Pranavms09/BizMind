'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  Database,
  Search,
  Trash2,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Table,
} from 'lucide-react';
import { datasetsApi } from '@/lib/api-client';
import { Dataset } from '@/types';
import { GOAT_COMPANY } from '@/config/company';

export const DatasetsView: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Ready'>('All');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Pagination for dataset row preview
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fetchDatasets = async () => {
    setLoading(true);
    try {
      const items = await datasetsApi.getDatasets();
      const safeItems = Array.isArray(items) ? items : [];
      setDatasets(safeItems);
      if (safeItems.length > 0) {
        const active = safeItems.find((d) => d.isActive) || safeItems[0];
        loadDatasetDetails(active.id, 1);
      } else {
        setSelectedDataset(null);
      }
    } catch (err: any) {
      console.error('Failed to fetch datasets', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  const loadDatasetDetails = async (id: string, targetPage = 1) => {
    try {
      const details = await datasetsApi.getDataset(id, targetPage, pageSize);
      setSelectedDataset(details);
      setPage(targetPage);
    } catch (err: any) {
      console.error('Failed to load dataset details', err);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      alert('Please upload a valid .csv file format');
      return;
    }

    setUploading(true);
    try {
      const res = await datasetsApi.uploadCSV(file);
      await fetchDatasets();
      await loadDatasetDetails(res.dataset.id, 1);
    } catch (err: any) {
      alert(err.message || 'Failed to parse CSV file');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await datasetsApi.activateDataset(id);
      await fetchDatasets();
      await loadDatasetDetails(id, 1);
    } catch (err: any) {
      console.error('Failed to activate dataset', err);
    }
  };

  const handleLoadDemo = async (preset: 'december' | 'january' | 'february' | 'march') => {
    try {
      setUploading(true);
      const demo = await datasetsApi.loadDemoDataset(preset);
      await fetchDatasets();
      await loadDatasetDetails(demo.id, 1);
    } catch (err: any) {
      console.error('Failed to load sample dataset', err);
    } finally {
      setUploading(false);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Clear all uploaded datasets?')) {
      await datasetsApi.clearAllDatasets();
      setSelectedDataset(null);
      await fetchDatasets();
    }
  };

  const filteredDatasets = datasets.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.filename.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'All' ? true : statusFilter === 'Active' ? d.isActive : !d.isActive;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 pb-16 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="glyph-dot-white" />
            <h1 className="text-2xl font-bold tracking-tight text-white uppercase">
              Dataset Management
            </h1>
          </div>
          <p className="text-sm text-neutral-400 mt-1 font-sans">
            Upload, inspect, and manage {GOAT_COMPANY.name} business datasets for deterministic AI analysis.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Preset Buttons for Hackathon */}
          <div className="flex rounded-full border border-white/10 bg-neutral-900 p-0.5">
            {(['december', 'january', 'february', 'march'] as const).map((p) => (
              <button
                key={p}
                onClick={() => handleLoadDemo(p)}
                disabled={uploading}
                className="px-2.5 py-1 rounded-full text-[11px] uppercase text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
                title={`Load ${p.toUpperCase()} preset data`}
              >
                {p.slice(0, 3)}
              </button>
            ))}
          </div>

          {datasets.length > 0 && (
            <button
              onClick={handleClearAll}
              disabled={uploading}
              className="px-3 py-1.5 rounded-full border border-white/10 bg-neutral-900 text-neutral-400 hover:text-red-400 transition-all flex items-center space-x-1.5 text-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="btn-nothing-primary text-xs py-2 px-4 uppercase tracking-wider shadow-sm flex items-center space-x-1.5"
          >
            <Upload className={`w-4 h-4 ${uploading ? 'animate-bounce' : ''}`} />
            <span>{uploading ? 'Parsing CSV...' : 'Upload CSV'}</span>
          </button>
        </div>
      </div>

      {/* CSV Drag & Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`rounded-3xl border-2 border-dashed p-8 text-center transition-all cursor-pointer ${
          isDragOver
            ? 'border-white bg-white/10 scale-[1.01]'
            : 'border-white/15 bg-neutral-900/30 hover:border-white/30 hover:bg-neutral-900/50'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileUpload(e.target.files[0]);
            }
          }}
          accept=".csv"
          className="hidden"
        />
        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-white flex items-center justify-center mx-auto mb-3">
          <Upload className="w-5 h-5 text-neutral-300" />
        </div>
        <p className="text-sm font-semibold text-white">
          Drop your sales CSV file here, or <span className="underline">browse files</span>
        </p>
        <p className="text-xs text-neutral-500 mt-1 font-sans">
          Supports comma-delimited sales, orders, and customer cohort files. Evaluated deterministically.
        </p>
      </div>

      {/* Main Grid: Dataset List (Left) and Details & Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: List, Search, and Filters */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search datasets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-white/10 bg-neutral-900 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-white/30"
              />
            </div>
            <div className="flex rounded-xl border border-white/10 bg-neutral-900 p-0.5">
              {(['All', 'Active', 'Ready'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                    statusFilter === filter
                      ? 'bg-white text-black font-semibold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Dataset Cards List */}
          <div className="space-y-3">
            {filteredDatasets.length === 0 ? (
              <div className="p-8 rounded-3xl border border-white/5 bg-[#121214] text-center space-y-3">
                <Database className="w-8 h-8 text-neutral-600 mx-auto" />
                <p className="text-xs text-neutral-400">
                  No datasets found. Load presets above or upload a CSV file.
                </p>
              </div>
            ) : (
              filteredDatasets.map((ds) => {
                const isSelected = selectedDataset?.id === ds.id;
                return (
                  <div
                    key={ds.id}
                    onClick={() => loadDatasetDetails(ds.id, 1)}
                    className={`p-4 rounded-3xl border transition-all cursor-pointer space-y-3 ${
                      isSelected
                        ? 'border-white bg-[#18181b] shadow-lg'
                        : 'border-white/10 bg-[#121214] hover:border-white/25 hover:bg-[#151518]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-semibold text-white truncate">{ds.name}</h3>
                          {ds.isActive && (
                            <span className="text-[9px] uppercase px-2 py-0.5 rounded-full bg-white text-black font-bold shrink-0">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-500 truncate">{ds.filename}</p>
                      </div>

                      <div className="flex items-center space-x-1 shrink-0">
                        {!ds.isActive && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleActivate(ds.id);
                            }}
                            className="btn-nothing-outline text-[10px] py-1 px-2.5"
                          >
                            Set Active
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-[11px] text-neutral-400">
                      <div>
                        <span className="text-neutral-500 block text-[9px] uppercase">Units</span>
                        <span className="text-white font-medium">{ds.rowCount.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block text-[9px] uppercase">Columns</span>
                        <span className="text-white font-medium">{ds.columnCount}</span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block text-[9px] uppercase">Status</span>
                        <span className="text-emerald-400 font-medium">Ready</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Dataset Details & Table Preview */}
        <div className="lg:col-span-7 space-y-6">
          {selectedDataset ? (
            <div className="rounded-3xl border border-white/10 bg-[#121214] p-6 space-y-6 shadow-xl animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="nothing-tag">TELEMETRY DETAILS</span>
                  </div>
                  <h2 className="text-lg font-bold text-white mt-1">{selectedDataset.name}</h2>
                  <p className="text-xs text-neutral-400 font-sans">{selectedDataset.description}</p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  {selectedDataset.isActive ? (
                    <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-medium">
                      <CheckCircle className="w-3.5 h-3.5 text-white" />
                      <span>Active Telemetry Source</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleActivate(selectedDataset.id)}
                      className="btn-nothing-primary text-xs py-1.5 px-3.5 uppercase"
                    >
                      Make Active Source
                    </button>
                  )}
                </div>
              </div>

              {/* 4 Detail Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl border border-white/5 bg-neutral-900/50">
                  <span className="text-[10px] text-neutral-500 uppercase block">Units Logged</span>
                  <span className="text-lg font-bold text-white">{selectedDataset.rowCount.toLocaleString()}</span>
                </div>
                <div className="p-3.5 rounded-2xl border border-white/5 bg-neutral-900/50">
                  <span className="text-[10px] text-neutral-500 uppercase block">Columns</span>
                  <span className="text-lg font-bold text-white">{selectedDataset.columnCount}</span>
                </div>
                <div className="p-3.5 rounded-2xl border border-white/5 bg-neutral-900/50">
                  <span className="text-[10px] text-neutral-500 uppercase block">Audit Mode</span>
                  <span className="text-sm font-bold text-emerald-400 mt-1 block">Deterministic</span>
                </div>
                <div className="p-3.5 rounded-2xl border border-white/5 bg-neutral-900/50">
                  <span className="text-[10px] text-neutral-500 uppercase block">MoM Comparison</span>
                  <span className="text-sm font-bold text-white mt-1 block">Computed</span>
                </div>
              </div>

              {/* Schema Columns Badges */}
              <div className="space-y-2">
                <span className="text-xs uppercase text-neutral-400 font-semibold block">
                  Detected Schema Columns ({selectedDataset.columns.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedDataset.columns.map((col) => (
                    <div
                      key={col.name}
                      className="px-2.5 py-1 rounded-full border border-white/10 bg-neutral-900 text-xs flex items-center space-x-1.5 text-neutral-300"
                    >
                      <span>{col.name}</span>
                      <span className="text-[10px] text-neutral-500">[{col.type}]</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Table Preview */}
              <div className="space-y-3 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Table className="w-4 h-4 text-neutral-400" />
                    <span className="text-xs uppercase text-white font-semibold">
                      Telemetry Data Preview
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-400">
                    Showing rows {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, selectedDataset.rowCount)}
                  </span>
                </div>

                <div className="rounded-2xl border border-white/10 overflow-x-auto bg-neutral-950/60 max-h-80">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-white/10 bg-neutral-900/80 sticky top-0">
                      <tr>
                        {selectedDataset.columns.map((c) => (
                          <th key={c.name} className="px-3.5 py-2.5 text-neutral-300 font-semibold uppercase tracking-wider">
                            {c.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-neutral-300">
                      {selectedDataset.rows && selectedDataset.rows.length > 0 ? (
                        selectedDataset.rows.map((row, rIdx) => (
                          <tr key={row.id || rIdx} className="hover:bg-white/5 transition-colors">
                            {selectedDataset.columns.map((col) => (
                              <td key={col.name} className="px-3.5 py-2 whitespace-nowrap">
                                {typeof row[col.name] === 'number'
                                  ? Number(row[col.name]).toLocaleString()
                                  : String(row[col.name] ?? '')}
                              </td>
                            ))}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={selectedDataset.columns.length} className="px-4 py-8 text-center text-neutral-500">
                            No preview rows available.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table Pagination */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => page > 1 && loadDatasetDetails(selectedDataset.id, page - 1)}
                    disabled={page <= 1}
                    className="btn-nothing-outline text-xs py-1 px-3 disabled:opacity-30 flex items-center space-x-1"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                  </button>
                  <span className="text-xs text-neutral-400">
                    Page {page} of {Math.max(1, Math.ceil(selectedDataset.rowCount / pageSize))}
                  </span>
                  <button
                    onClick={() => loadDatasetDetails(selectedDataset.id, page + 1)}
                    disabled={page * pageSize >= selectedDataset.rowCount}
                    className="btn-nothing-outline text-xs py-1 px-3 disabled:opacity-30 flex items-center space-x-1"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-white/15 bg-neutral-950/40 p-12 text-center text-xs text-neutral-500">
              Select a dataset from the left or upload a new CSV file to view schema and preview rows.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DatasetsView;
