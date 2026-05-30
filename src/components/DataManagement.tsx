/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  Database,
  Download,
  Upload,
  CheckCircle,
  AlertTriangle,
  Globe
} from 'lucide-react';
import { Asset, Transaction, Valuation } from '../types';

interface DataManagementProps {
  onImportData: (data: { assets: Asset[]; transactions: Transaction[]; valuations: Valuation[] }) => boolean;
  onExportData: () => void;
  assetsCount: number;
  transactionsCount: number;
  valuationsCount: number;
}

export const DataManagement: React.FC<DataManagementProps> = ({
  onImportData,
  onExportData,
  assetsCount,
  transactionsCount,
  valuationsCount,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processImportFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);

        // Basic verification
        if (!parsed || typeof parsed !== 'object') {
          throw new Error("Invalid file content structure");
        }

        if (!Array.isArray(parsed.assets) || !Array.isArray(parsed.transactions) || !Array.isArray(parsed.valuations)) {
          throw new Error("Missing required data categories ('assets', 'transactions', 'valuations')");
        }

        const success = onImportData({
          assets: parsed.assets,
          transactions: parsed.transactions,
          valuations: parsed.valuations,
        });

        if (success) {
          setImportStatus({
            type: 'success',
            message: `Successfully restored ${parsed.assets.length} assets, ${parsed.transactions.length} transactions, and ${parsed.valuations.length} valuations!`
          });
        } else {
          throw new Error("Data parsing failed custom validation check.");
        }
      } catch (err: any) {
        setImportStatus({
          type: 'error',
          message: err.message || "Parsing failed. Ensure you chose a valid JSON ledger export."
        });
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImportFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImportFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-6">
        {/* Database state and resetting controls */}
        <div className="bg-white p-6 rounded-2xl border border-slate-101 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
            <Database className="h-5 w-5 text-indigo-500" />
            <span className="font-bold text-slate-800 text-sm">Ledger Database Diagnostics</span>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center py-2 bg-slate-50 border border-slate-100 rounded-xl">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assets</p>
              <p className="text-xl font-bold text-indigo-700">{assetsCount}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Transactions</p>
              <p className="text-xl font-bold text-indigo-700">{transactionsCount}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Valuations</p>
              <p className="text-xl font-bold text-indigo-700">{valuationsCount}</p>
            </div>
          </div>


        </div>
      </div>

      {/* Backup file serialization & Recovery */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-full space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
          <Globe className="h-5 w-5 text-indigo-500" />
          <h3 className="font-bold text-slate-800 text-sm">Backup, Export & Restore</h3>
        </div>

        <p className="text-xs text-slate-500">
          Save your database ledger physically to your local machine! You can import a JSON ledger file on any device to resume tracking your financial allocations instantly.
        </p>

        {/* Manual selection click or drag & drop area */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          className={`flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center p-6 cursor-pointer transition-all ${
            dragActive
              ? 'border-indigo-500 bg-indigo-50/50'
              : 'border-slate-200 hover:border-indigo-400 bg-slate-50/20 hover:bg-slate-50/45'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
            id="management-file-input"
          />
          <Upload className={`h-8 w-8 mb-3 ${dragActive ? 'text-indigo-600 animate-bounce' : 'text-slate-400'}`} />
          <p className="text-xs text-slate-700 font-bold mb-1">Drag and drop file here, or click to choose</p>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider">Supports valid .json ledger exports</p>
        </div>

        {/* Import feed feedback notification */}
        {importStatus && (
          <div className={`p-3.5 rounded-xl text-xs flex items-start gap-2 ${
            importStatus.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-l-4 border-emerald-500' : 'bg-red-50 text-red-800 border-l-4 border-red-500'
          }`}>
            {importStatus.type === 'success' ? (
              <CheckCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
            )}
            <p className="font-medium">{importStatus.message}</p>
          </div>
        )}

        <button
          onClick={onExportData}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all text-center"
        >
          <Download className="h-4 w-4" /> Export Ledger Backup
        </button>
      </div>
    </div>
  );
};
