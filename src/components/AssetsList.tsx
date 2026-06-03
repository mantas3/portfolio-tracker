/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Asset, AssetType, AssetPerformance } from '../types';
import {
  Plus,
  Trash2,
  Edit3,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  Layers,
  X,
  FileCheck,
  Sparkles
} from 'lucide-react';
import { formatCurrency, formatPercent } from '../utils/portfolioUtils';

interface AssetsListProps {
  assets: Asset[];
  performances: AssetPerformance[];
  currencySymbol: string;
  onAddAsset: (asset: Omit<Asset, 'id' | 'createdAt'>) => void;
  onEditAsset: (asset: Asset) => void;
  onDeleteAsset: (assetId: string) => void;
}

const CATEGORIES: { value: AssetType; label: string; color: string; bg: string }[] = [
  { value: 'etf', label: 'ETF (Exchange Traded Fund)', color: 'text-indigo-700 border-indigo-200', bg: 'bg-indigo-50/50' },
  { value: 'fund', label: 'Mutual Fund', color: 'text-cyan-700 border-cyan-200', bg: 'bg-cyan-50/50' },
  { value: 'p2p', label: 'P2P Lending Site', color: 'text-emerald-700 border-emerald-200', bg: 'bg-emerald-50/50' },
  { value: 'pension', label: 'Pension Fund', color: 'text-purple-700 border-purple-200', bg: 'bg-purple-50/50' },
  { value: 'other', label: 'Other Asset / Cash Account', color: 'text-amber-700 border-amber-200', bg: 'bg-amber-50/50' },
];

export const AssetsList: React.FC<AssetsListProps> = ({
  assets,
  performances,
  currencySymbol,
  onAddAsset,
  onEditAsset,
  onDeleteAsset,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);

  // Add Asset Form States
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<AssetType>('etf');
  const [newDescription, setNewDescription] = useState('');

  // Edit Asset Form States
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState<AssetType>('etf');
  const [editDescription, setEditDescription] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    onAddAsset({
      name: newName.trim(),
      type: newType,
      currency: currencySymbol,
      description: newDescription.trim() || undefined,
    });

    // Reset Form
    setNewName('');
    setNewType('etf');
    setNewDescription('');
    setIsAdding(false);
  };

  const startEdit = (asset: Asset) => {
    setEditingAssetId(asset.id);
    setEditName(asset.name);
    setEditType(asset.type);
    setEditDescription(asset.description || '');
  };

  const handleEditSubmit = (e: React.FormEvent, asset: Asset) => {
    e.preventDefault();
    if (!editName.trim()) return;

    onEditAsset({
      ...asset,
      name: editName.trim(),
      type: editType,
      description: editDescription.trim() || undefined,
    });

    setEditingAssetId(null);
  };

  const getCategoryTheme = (type: AssetType) => {
    switch (type) {
      case 'etf':
        return { bg: 'bg-indigo-50 text-indigo-700 border-indigo-100', label: 'ETF' };
      case 'fund':
        return { bg: 'bg-cyan-50 text-cyan-700 border-cyan-100', label: 'Mutual Fund' };
      case 'p2p':
        return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-100', label: 'P2P Platform' };
      case 'pension':
        return { bg: 'bg-purple-50 text-purple-700 border-purple-100', label: 'Pension Fund' };
      default:
        return { bg: 'bg-amber-50 text-amber-700 border-amber-100', label: 'Other / Cash' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Assets header bar */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-indigo-500" />
          <h2 className="font-bold text-slate-800 text-sm">Underlying Asset Catalog</h2>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className={`flex items-center gap-1.5 px-3 py-1.5 md:py-2 rounded-xl text-xs font-semibold shadow-sm transition-all ${
            isAdding
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          {isAdding ? (
            <>
              <X className="h-4 w-4" /> Cancel
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" /> Add Asset Instrument
            </>
          )}
        </button>
      </div>

      {/* Add Asset Form Panel */}
      {isAdding && (
        <form
          onSubmit={handleAddSubmit}
          className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-md space-y-4 transition-all"
        >
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sparkles className="h-4 w-4 text-indigo-500" />
            <h3 className="font-bold text-slate-800 text-sm">Define New Holding Instrument</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600">Instrument Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. VanEck Semiconductor ETF"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:outline-none transition-colors"
                id="add-asset-name"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600">Category Classification</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as AssetType)}
                className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:outline-none transition-colors"
                id="add-asset-category"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600">Short Summary / Thesis</label>
              <textarea
                placeholder="Detail investment goals, target leverage or dividend schedules."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={2}
                className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:outline-none transition-colors resize-none"
                id="add-asset-desc"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-xs font-semibold px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="text-xs font-semibold px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-colors"
            >
              Add Holding
            </button>
          </div>
        </form>
      )}

      {/* Assets Table/Container Grid layout */}
      {assets.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
          <Layers className="h-10 w-10 text-slate-350 mx-auto mb-4" />
          <h3 className="font-bold text-slate-800 text-base mb-1">Portfolio Catalog Empty</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
            Register your ETFs, funds, stock shares, P2P loan platforms, or simple cash reserves to begin building your visual performance ledger.
          </p>
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Set Up First Asset
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {[...assets].sort((a, b) => a.name.localeCompare(b.name)).map((asset) => {
            const performance = performances.find((p) => p.assetId === asset.id);
            const isEditing = editingAssetId === asset.id;
            const theme = getCategoryTheme(asset.type);

            const hasInvested = (performance?.totalInvested || 0) > 0;
            const yieldVal = performance?.percentageReturn || 0;
            const isProfit = yieldVal >= 0;

            if (isEditing) {
              return (
                <form
                  key={asset.id}
                  onSubmit={(e) => handleEditSubmit(e, asset)}
                  className="bg-slate-50 border-2 border-indigo-100 p-5 rounded-2xl space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Asset Name</label>
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Category</label>
                      <select
                        value={editType}
                        onChange={(e) => setEditType(e.target.value as AssetType)}
                        className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-white focus:border-indigo-500 focus:outline-none"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Description</label>
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={1}
                      className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:border-indigo-500 focus:outline-none resize-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingAssetId(null)}
                      className="text-xs px-3 py-1.5 bg-slate-205 hover:bg-slate-300 text-slate-600 rounded-lg"
                    >
                      Discard
                    </button>
                    <button
                      type="submit"
                      className="text-xs px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              );
            }

            return (
              <div
                key={asset.id}
                className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow relative overflow-hidden grid grid-cols-1 md:grid-cols-12 md:items-center gap-4 transition-all"
              >
                {/* ID indicator bar for aesthetics */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                  asset.type === 'etf' ? 'bg-indigo-500' :
                  asset.type === 'fund' ? 'bg-cyan-500' :
                  asset.type === 'p2p' ? 'bg-emerald-500' :
                  asset.type === 'pension' ? 'bg-purple-500' : 'bg-amber-500'
                }`} />

                {/* Left - Meta (Name, category tag & description) - Spans 5 cols */}
                <div className="col-span-1 md:col-span-5 min-w-0 pl-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className="font-extrabold text-slate-900 tracking-tight block truncate text-sm md:text-base">
                      {asset.name}
                    </span>
                    <span className={`text-[10px] font-bold border px-1.5 py-0.5 rounded-full ${theme.bg}`}>
                      {theme.label}
                    </span>
                  </div>
                  {asset.description ? (
                    <p className="text-xs text-slate-500 line-clamp-1 pr-4">{asset.description}</p>
                  ) : (
                    <span className="text-[10px] text-slate-350 italic">No historical rationale added</span>
                  )}
                </div>

                {/* Ledger Basis (Total Invested) - Spans 2 cols */}
                <div className="flex flex-col col-span-1 md:col-span-2 border-t pt-2 md:pt-0 md:border-t-0 border-slate-50">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Total Cost Basis</span>
                  <span className="text-sm font-semibold text-slate-800">
                    {performance ? formatCurrency(performance.totalInvested, currencySymbol) : formatCurrency(0, currencySymbol)}
                  </span>
                </div>

                {/* Present Net Valuation Asset Current Value - Spans 2 cols */}
                <div className="flex flex-col col-span-1 md:col-span-2 border-t pt-2 md:pt-0 md:border-t-0 border-slate-50">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Valuation Asset Size</span>
                  <span className="text-sm font-bold text-indigo-700">
                    {performance ? formatCurrency(performance.totalValue, currencySymbol) : formatCurrency(0, currencySymbol)}
                  </span>
                </div>

                {/* Overall return yield details - Spans 2 cols */}
                <div className="flex flex-col col-span-1 md:col-span-2 border-t pt-2 md:pt-0 md:border-t-0 border-slate-50">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Returns Allocation</span>
                  {hasInvested && performance ? (
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full flex items-center ${
                        isProfit ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {isProfit ? <TrendingUp className="h-3 w-3 mr-0.5" /> : <TrendingDown className="h-3 w-3 mr-0.5" />}
                        {formatPercent(yieldVal)}
                      </span>
                      <span className={`text-xs font-semibold ${isProfit ? 'text-emerald-600' : 'text-red-500'}`}>
                        ({isProfit ? '+' : ''}{formatCurrency(performance.totalProfit, currencySymbol)})
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">No active inputs</span>
                  )}
                </div>

                {/* Right - Control adjustments - Spans 1 col, right-aligned */}
                <div className="col-span-1 md:col-span-1 flex md:justify-end items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-150">
                  <button
                    onClick={() => startEdit(asset)}
                    className="p-2 border border-slate-200 hover:border-slate-350 text-slate-500 hover:text-slate-800 rounded-xl transition-all"
                    title="Edit Metadata"
                    type="button"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Are you absolutely sure you want to delete ${asset.name}? This will remove the asset itself, and may hide its values from historical records.`)) {
                        onDeleteAsset(asset.id);
                      }
                    }}
                    className="p-2 border border-red-200 hover:border-red-350 text-red-400 hover:text-red-700 rounded-xl transition-all"
                    title="Delete Asset"
                    type="button"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
