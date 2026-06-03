/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Asset, Transaction, Valuation } from '../types';
import {
  FileText,
  DollarSign,
  PlusCircle,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  Trash2,
  ListFilter,
  CheckCircle,
  XCircle,
  ChevronRight,
  Info
} from 'lucide-react';
import { formatCurrency } from '../utils/portfolioUtils';

interface TransactionValuationLoggerProps {
  assets: Asset[];
  transactions: Transaction[];
  valuations: Valuation[];
  currencySymbol: string;
  onAddTransaction: (txn: Omit<Transaction, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
  onAddValuation: (val: Omit<Valuation, 'id'>) => void;
  onDeleteValuation: (id: string) => void;
}

export const TransactionValuationLogger: React.FC<TransactionValuationLoggerProps> = ({
  assets,
  transactions,
  valuations,
  currencySymbol,
  onAddTransaction,
  onDeleteTransaction,
  onAddValuation,
  onDeleteValuation,
}) => {
  const sortedAssets = React.useMemo(() => {
    return [...assets].sort((a, b) => a.name.localeCompare(b.name));
  }, [assets]);

  const [activeLogType, setActiveLogType] = useState<'transactions' | 'valuations'>('valuations');

  // Transaction form state
  const [txnAssetId, setTxnAssetId] = useState(sortedAssets[0]?.id || '');
  const [txnDate, setTxnDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [txnType, setTxnType] = useState<'contribution' | 'withdrawal'>('contribution');
  const [txnAmount, setTxnAmount] = useState('');
  const [txnNote, setTxnNote] = useState('');

  // Valuation form state
  const [valAssetId, setValAssetId] = useState(sortedAssets[0]?.id || '');
  const [valDate, setValDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [valValue, setValValue] = useState('');
  const [valNote, setValNote] = useState('');

  // Filter state
  const [filterAssetId, setFilterAssetId] = useState<string>('ALL');

  // Synced asset fallback
  React.useEffect(() => {
    if (sortedAssets.length > 0) {
      if (!txnAssetId) setTxnAssetId(sortedAssets[0].id);
      if (!valAssetId) setValAssetId(sortedAssets[0].id);
    }
  }, [sortedAssets]);

  const handleTxnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(txnAmount);
    if (!txnAssetId || isNaN(amountVal) || amountVal <= 0) return;

    onAddTransaction({
      assetId: txnAssetId,
      date: txnDate,
      amount: txnType === 'contribution' ? amountVal : -amountVal,
      note: txnNote.trim() || undefined,
    });

    // Reset some form values
    setTxnAmount('');
    setTxnNote('');
  };

  const handleValSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const portfolioSize = parseFloat(valValue);
    if (!valAssetId || isNaN(portfolioSize) || portfolioSize < 0) return;

    onAddValuation({
      assetId: valAssetId,
      date: valDate,
      value: portfolioSize,
      note: valNote.trim() || undefined,
    });

    // Reset some values
    setValValue('');
    setValNote('');
  };

  // Lists filtered by asset selector
  const filteredTransactions = transactions
    .filter((t) => filterAssetId === 'ALL' || t.assetId === filterAssetId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredValuations = valuations
    .filter((v) => filterAssetId === 'ALL' || v.assetId === filterAssetId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (assets.length === 0) {
    return (
      <div className="bg-slate-50 border border-dashed border-slate-200 text-center py-12 px-4 rounded-2xl">
        <Info className="h-8 w-8 text-indigo-500 mx-auto mb-3" />
        <h3 className="font-bold text-slate-800 text-sm mb-1">Set Up Assets First</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Before logging currency transactions or portfolio valuations, you must define at least one asset in the Asset Catalog tab.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left side: Log Record Form Panel */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex border border-slate-150 rounded-xl p-1 bg-slate-50 text-xs font-semibold mb-5">
            <button
              onClick={() => setActiveLogType('transactions')}
              className={`flex-1 py-2 rounded-lg text-center transition-all ${
                activeLogType === 'transactions'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Log Cash Flow
            </button>
            <button
              onClick={() => setActiveLogType('valuations')}
              className={`flex-1 py-2 rounded-lg text-center transition-all ${
                activeLogType === 'valuations'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Value Snapshots
            </button>
          </div>

          {activeLogType === 'transactions' ? (
            /* Log Cash flow form */
            <form onSubmit={handleTxnSubmit} className="space-y-4">
              <div className="flex items-center gap-1.5 mb-3">
                <PlusCircle className="h-4.5 w-4.5 text-indigo-500" />
                <h3 className="font-semibold text-slate-800 text-xs uppercase tracking-wider">Log Capital Addition / Withdrawal</h3>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 uppercase">Target Instrument</label>
                <select
                  value={txnAssetId}
                  onChange={(e) => setTxnAssetId(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-xl px-2.5 py-2 hover:border-slate-350 focus:border-indigo-500 bg-slate-50/55 focus:bg-white focus:outline-none"
                  id="log-txn-asset"
                >
                  {sortedAssets.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase">Flow Date</label>
                  <input
                    type="date"
                    required
                    value={txnDate}
                    onChange={(e) => setTxnDate(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-xl px-2.5 py-2 focus:border-indigo-500 bg-slate-50/55 focus:bg-white focus:outline-none"
                    id="log-txn-date"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase">Transfer Type</label>
                  <div className="grid grid-cols-2 border border-slate-150 rounded-xl p-0.5 mt-0.5 bg-slate-50 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setTxnType('contribution')}
                      className={`py-1.5 rounded-lg text-center ${
                        txnType === 'contribution' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'
                      }`}
                    >
                      Add/Invest
                    </button>
                    <button
                      type="button"
                      onClick={() => setTxnType('withdrawal')}
                      className={`py-1.5 rounded-lg text-center ${
                        txnType === 'withdrawal' ? 'bg-white text-red-650 shadow-sm' : 'text-slate-500'
                      }`}
                    >
                      Withdraw
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 uppercase">Transfer Amount ({currencySymbol})</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs text-slate-400 font-bold">{currencySymbol}</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="250.00"
                    value={txnAmount}
                    onChange={(e) => setTxnAmount(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-xl pl-7 pr-3 py-2.5 focus:border-indigo-500 bg-slate-50/55 focus:bg-white focus:outline-none font-semibold text-slate-800"
                    id="log-txn-amount"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 uppercase">Note / Memo</label>
                <input
                  type="text"
                  placeholder="e.g. Save from monthly payload"
                  value={txnNote}
                  onChange={(e) => setTxnNote(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-xl px-2.5 py-2 focus:border-indigo-500 bg-slate-50/55 focus:bg-white focus:outline-none"
                  id="log-txn-note"
                />
              </div>

              <button
                type="submit"
                className={`w-full text-xs font-semibold py-2.5 rounded-xl text-white transition-opacity shadow-sm ${
                  txnType === 'contribution' ? 'bg-emerald-600 hover:opacity-90' : 'bg-red-500 hover:opacity-90'
                }`}
              >
                Publish Flow Transfer
              </button>
            </form>
          ) : (
            /* Log valuation form */
            <form onSubmit={handleValSubmit} className="space-y-4">
              <div className="flex items-center gap-1.5 mb-3">
                <CheckCircle className="h-4.5 w-4.5 text-indigo-500" />
                <h3 className="font-semibold text-slate-800 text-xs uppercase tracking-wider">Log Asset Value Snapshot</h3>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 uppercase">Target Instrument</label>
                <select
                  value={valAssetId}
                  onChange={(e) => setValAssetId(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-xl px-2.5 py-2 hover:border-slate-350 focus:border-indigo-500 bg-slate-50/55 focus:bg-white focus:outline-none"
                  id="log-val-asset"
                >
                  {sortedAssets.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 uppercase">Snapshot Date of Audit</label>
                <input
                  type="date"
                  required
                  value={valDate}
                  onChange={(e) => setValDate(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-xl px-2.5 py-2 focus:border-indigo-500 bg-slate-50/55 focus:bg-white focus:outline-none"
                  id="log-val-date"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 uppercase">Asset Balance Valuation ({currencySymbol})</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs text-slate-400 font-bold">{currencySymbol}</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="1500.00"
                    value={valValue}
                    onChange={(e) => setValValue(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-xl pl-7 pr-3 py-2.5 focus:border-indigo-500 bg-slate-50/55 focus:bg-white focus:outline-none font-semibold text-slate-800"
                    id="log-val-amount"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Enter the entire net worth value of this asset on the selected audit day.</p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 uppercase">Valuation Tag / Memo</label>
                <input
                  type="text"
                  placeholder="e.g. End of March Statement Audit"
                  value={valNote}
                  onChange={(e) => setValNote(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-xl px-2.5 py-2 focus:border-indigo-500 bg-slate-50/55 focus:bg-white focus:outline-none"
                  id="log-val-note"
                />
              </div>

              <button
                type="submit"
                className="w-full text-xs font-semibold py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-opacity"
              >
                Record Valuation Snapshot
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Right side: Dynamic logs history log list */}
      <div className="lg:col-span-2 space-y-4">
        {/* Selector Filters */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center gap-3 justify-between">
          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <ListFilter className="h-4.5 w-4.5 text-slate-400" />
            <span className="text-xs font-bold text-slate-700 uppercase">Input Catalogues Filter</span>
          </div>
          <select
            value={filterAssetId}
            onChange={(e) => setFilterAssetId(e.target.value)}
            className="text-xs border border-slate-150 rounded-xl px-3 py-1.5 bg-slate-50 focus:bg-white focus:outline-none font-medium self-stretch sm:self-auto min-w-[200px]"
            id="log-filter-asset"
          >
            <option value="ALL">Show Combined Assets</option>
            {sortedAssets.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        {/* Ledger items */}
        {activeLogType === 'transactions' ? (
          /* TRANSACTION LOG TABLE */
          <div className="bg-white rounded-2xl border border-slate-101 shadow-sm overflow-hidden flex flex-col">
            <div className="bg-slate-50/50 px-5 py-3.5 border-b border-indigo-50 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-emerald-500 animate-pulse" /> Cash Flow Registry ({filteredTransactions.length})
              </span>
            </div>

            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12 px-4 italic text-slate-400 text-xs">No capital cash transfers have been logged. Use the setup form on the left to add additions or withdrawals.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-100/50 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-100">
                      <th className="px-5 py-2.5">Audit Date</th>
                      <th className="px-4 py-2.5">Asset name</th>
                      <th className="px-4 py-2.5">Transfer Category</th>
                      <th className="px-4 py-2.5 text-right">Cash Amount</th>
                      <th className="px-5 py-2.5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                    {filteredTransactions.map((t) => {
                      const asset = assets.find((a) => a.id === t.assetId);
                      const isContribution = t.amount >= 0;
                      return (
                        <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-3 whitespace-nowrap text-slate-700 font-bold">{t.date}</td>
                          <td className="px-4 py-3 truncate max-w-[150px]" title={asset?.name}>
                            <div className="flex flex-col">
                              <span>{asset?.name || 'Unknown Asset'}</span>
                              {t.note && <span className="text-[10px] text-slate-400 font-normal truncate max-w-[130px]">{t.note}</span>}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isContribution ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                            }`}>
                              {isContribution ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                              {isContribution ? 'Add Funds' : 'Withdrawal'}
                            </span>
                          </td>
                          <td className={`px-4 py-3 text-right whitespace-nowrap font-bold ${isContribution ? 'text-emerald-600' : 'text-red-500'}`}>
                            {isContribution ? '+' : '-'}
                            {formatCurrency(Math.abs(t.amount), currencySymbol)}
                          </td>
                          <td className="px-5 py-3 text-center whitespace-nowrap">
                            <button
                              onClick={() => onDeleteTransaction(t.id)}
                              className="p-1 text-slate-350 hover:text-red-650 hover:bg-slate-50 rounded"
                              title="Delete Row"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          /* VALUATIONS LOG TABLE */
          <div className="bg-white rounded-2xl border border-slate-101 shadow-sm overflow-hidden flex flex-col">
            <div className="bg-slate-50/50 px-5 py-3.5 border-b border-indigo-50 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-indigo-500 animate-pulse" /> Verified Valuations Registry ({filteredValuations.length})
              </span>
            </div>

            {filteredValuations.length === 0 ? (
              <div className="text-center py-12 px-4 italic text-slate-400 text-xs">No valuation audits have been recorded. Log a current portfolio valuation on the left.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-100/50 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-100">
                      <th className="px-5 py-2.5">Audit Date</th>
                      <th className="px-4 py-2.5">Asset name</th>
                      <th className="px-4 py-2.5">Record Note</th>
                      <th className="px-4 py-2.5 text-right">Net Value</th>
                      <th className="px-5 py-2.5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                    {filteredValuations.map((v) => {
                      const asset = assets.find((a) => a.id === v.assetId);
                      return (
                        <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-3 whitespace-nowrap text-slate-700 font-bold">{v.date}</td>
                          <td className="px-4 py-3 truncate max-w-[155px]" title={asset?.name}>{asset?.name || 'Unknown Asset'}</td>
                          <td className="px-4 py-3 italic truncate text-slate-400 max-w-[185px]" title={v.note}>{v.note || 'None'}</td>
                          <td className="px-4 py-3 text-right whitespace-nowrap font-bold text-indigo-700">
                            {formatCurrency(v.value, currencySymbol)}
                          </td>
                          <td className="px-5 py-3 text-center whitespace-nowrap">
                            <button
                              onClick={() => onDeleteValuation(v.id)}
                              className="p-1 text-slate-350 hover:text-red-650 hover:bg-slate-50 rounded"
                              title="Delete Row"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
