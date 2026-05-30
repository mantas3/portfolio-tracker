/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  TrendingUp,
  Layers,
  FileText,
  Settings,
  PieChart,
  DollarSign,
  Briefcase,
  ExternalLink,
  ChevronRight,
  Calculator,
  RefreshCw
} from 'lucide-react';

import { Asset, Transaction, Valuation } from './types';
import { DEMO_ASSETS, DEMO_TRANSACTIONS, DEMO_VALUATIONS } from './data/demoData';
import {
  calculateAssetPerformance,
  calculatePortfolioSummary,
  calculateHistoricalPerformance,
  formatCurrency,
  formatPercent
} from './utils/portfolioUtils';

// Components
import { MetricCards } from './components/MetricCards';
import { ChartsDashboard } from './components/ChartsDashboard';
import { AssetsList } from './components/AssetsList';
import { TransactionValuationLogger } from './components/TransactionValuationLogger';
import { DataManagement } from './components/DataManagement';

export default function App() {
  // Main database state
  const [assets, setAssets] = useState<Asset[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [valuations, setValuations] = useState<Valuation[]>([]);
  const currencySymbol = '€';

  // Navigation state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'assets' | 'logs' | 'data'>('dashboard');
  const [selectedAssetId, setSelectedAssetId] = useState<string>('all');

  // Load from local database (server-side priority, falling back to localStorage)
  useEffect(() => {
    const initData = async () => {
      try {
        // Fetch the database
        const response = await fetch('/api/db');
        if (response.ok) {
          const dbData = await response.json();
          if (dbData.assets && dbData.assets.length > 0) {
            setAssets(dbData.assets);
            setTransactions(dbData.transactions || []);
            setValuations(dbData.valuations || []);
            // Keep client side cache updated
            localStorage.setItem('inv_tracker_assets', JSON.stringify(dbData.assets));
            localStorage.setItem('inv_tracker_transactions', JSON.stringify(dbData.transactions || []));
            localStorage.setItem('inv_tracker_valuations', JSON.stringify(dbData.valuations || []));
            return;
          }
        }
      } catch (err) {
        console.warn('Backend DB fetch failed, resorting to client side LocalStorage...', err);
      }

      // LocalStorage or Demo Data fallback if database is empty or unreachable
      try {
        const storedAssets = localStorage.getItem('inv_tracker_assets');
        const storedTxns = localStorage.getItem('inv_tracker_transactions');
        const storedVals = localStorage.getItem('inv_tracker_valuations');

        if (storedAssets && JSON.parse(storedAssets).length > 0) {
          const loadedAssets = JSON.parse(storedAssets);
          const loadedTxns = storedTxns ? JSON.parse(storedTxns) : [];
          const loadedVals = storedVals ? JSON.parse(storedVals) : [];
          setAssets(loadedAssets);
          setTransactions(loadedTxns);
          setValuations(loadedVals);
          // Sync it back to server so the server is initialized too!
          saveBackendState(loadedAssets, loadedTxns, loadedVals);
        } else {
          // Empty state for both server and local storage - load nice initial demo portfolio data
          setAssets(DEMO_ASSETS);
          setTransactions(DEMO_TRANSACTIONS);
          setValuations(DEMO_VALUATIONS);
          saveBackendState(DEMO_ASSETS, DEMO_TRANSACTIONS, DEMO_VALUATIONS);
          // And store locally
          localStorage.setItem('inv_tracker_assets', JSON.stringify(DEMO_ASSETS));
          localStorage.setItem('inv_tracker_transactions', JSON.stringify(DEMO_TRANSACTIONS));
          localStorage.setItem('inv_tracker_valuations', JSON.stringify(DEMO_VALUATIONS));
        }
      } catch {
        setAssets(DEMO_ASSETS);
        setTransactions(DEMO_TRANSACTIONS);
        setValuations(DEMO_VALUATIONS);
      }
    };

    initData();
  }, []);

  // Save changes to database API on backend
  const saveBackendState = async (newAssets: Asset[], newTxns: Transaction[], newVals: Valuation[]) => {
    try {
      await fetch('/api/db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assets: newAssets,
          transactions: newTxns,
          valuations: newVals,
        }),
      });
    } catch (err) {
      console.error('Failed to sync state to server database:', err);
    }
  };

  // Save to LocalStorage helper
  const saveState = (newAssets: Asset[], newTxns: Transaction[], newVals: Valuation[]) => {
    // 1. Client cache update
    localStorage.setItem('inv_tracker_assets', JSON.stringify(newAssets));
    localStorage.setItem('inv_tracker_transactions', JSON.stringify(newTxns));
    localStorage.setItem('inv_tracker_valuations', JSON.stringify(newVals));
    // 2. Persistent server-side update
    saveBackendState(newAssets, newTxns, newVals);
  };

  // State modification events
  const handleAddAsset = (newAssetData: Omit<Asset, 'id' | 'createdAt'>) => {
    const newAsset: Asset = {
      ...newAssetData,
      id: `asset-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    const updated = [newAsset, ...assets];
    setAssets(updated);
    saveState(updated, transactions, valuations);
  };

  const handleEditAsset = (updatedAsset: Asset) => {
    const updated = assets.map((a) => (a.id === updatedAsset.id ? updatedAsset : a));
    setAssets(updated);
    saveState(updated, transactions, valuations);
  };

  const handleDeleteAsset = (assetId: string) => {
    // Delete the asset itself, but we can preserve transactions or valuations for safety,
    // or prune them. Pruning associated data keeps local storage clean and consistent!
    const updatedAssets = assets.filter((a) => a.id !== assetId);
    const updatedTxns = transactions.filter((t) => t.assetId !== assetId);
    const updatedVals = valuations.filter((v) => v.assetId !== assetId);

    setAssets(updatedAssets);
    setTransactions(updatedTxns);
    setValuations(updatedVals);
    saveState(updatedAssets, updatedTxns, updatedVals);

    if (selectedAssetId === assetId) {
      setSelectedAssetId('all');
    }
  };

  const handleAddTransaction = (newTxnData: Omit<Transaction, 'id'>) => {
    const newTxn: Transaction = {
      ...newTxnData,
      id: `t-${Date.now()}`,
    };
    const updated = [newTxn, ...transactions];
    setTransactions(updated);
    saveState(assets, updated, valuations);
  };

  const handleDeleteTransaction = (txnId: string) => {
    const updated = transactions.filter((t) => t.id !== txnId);
    setTransactions(updated);
    saveState(assets, updated, valuations);
  };

  const handleAddValuation = (newValData: Omit<Valuation, 'id'>) => {
    // Ensure if a valuation on this date already exists for this asset, we replace/update it
    // rather than appending duplicates, representing pristine time-series entry paths!
    const existingIndex = valuations.findIndex(
      (v) => v.assetId === newValData.assetId && v.date === newValData.date
    );

    let updated: Valuation[];
    if (existingIndex > -1) {
      updated = [...valuations];
      updated[existingIndex] = {
        ...valuations[existingIndex],
        value: newValData.value,
        note: newValData.note,
      };
    } else {
      const newVal: Valuation = {
        ...newValData,
        id: `v-${Date.now()}`,
      };
      updated = [newVal, ...valuations];
    }

    setValuations(updated);
    saveState(assets, transactions, updated);
  };

  const handleDeleteValuation = (valId: string) => {
    const updated = valuations.filter((v) => v.id !== valId);
    setValuations(updated);
    saveState(assets, transactions, updated);
  };

  // Reset database triggers
  const handleClearData = () => {
    setAssets([]);
    setTransactions([]);
    setValuations([]);
    saveState([], [], []);
    setSelectedAssetId('all');
  };

  const handleLoadDemoData = () => {
    setAssets(DEMO_ASSETS);
    setTransactions(DEMO_TRANSACTIONS);
    setValuations(DEMO_VALUATIONS);
    saveState(DEMO_ASSETS, DEMO_TRANSACTIONS, DEMO_VALUATIONS);
  };

  const handleImportData = (data: { assets: Asset[]; transactions: Transaction[]; valuations: Valuation[] }) => {
    setAssets(data.assets);
    setTransactions(data.transactions);
    setValuations(data.valuations);
    saveState(data.assets, data.transactions, data.valuations);
    return true;
  };

  const handleExportData = () => {
    const payload = JSON.stringify(
      {
        assets,
        transactions,
        valuations,
        format: "investment-tracker-backup",
        version: "1.0",
        exportedAt: new Date().toISOString(),
      },
      null,
      2
    );

    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const timestamp = new Date().toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0];
    link.download = `investment_tracker_backup_${timestamp}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Financial Mathematics Processing
  const assetPerformances = useMemo(() => {
    return calculateAssetPerformance(assets, transactions, valuations);
  }, [assets, transactions, valuations]);

  const portfolioSummary = useMemo(() => {
    return calculatePortfolioSummary(assetPerformances);
  }, [assetPerformances]);

  const historicalDataPoints = useMemo(() => {
    return calculateHistoricalPerformance(assets, transactions, valuations);
  }, [assets, transactions, valuations]);

  const overallLastMonthMetrics = useMemo(() => {
    let lastMonthEarnings = 0;
    let lastMonthPercent = 0;
    if (historicalDataPoints && historicalDataPoints.length > 0) {
      if (historicalDataPoints.length >= 2) {
        const lastPoint = historicalDataPoints[historicalDataPoints.length - 1];
        const prevPoint = historicalDataPoints[historicalDataPoints.length - 2];
        lastMonthEarnings = lastPoint.profit - prevPoint.profit;

        const deltaInvested = lastPoint.invested - prevPoint.invested;
        const capitalAtRisk = prevPoint.value + Math.max(0, deltaInvested);
        lastMonthPercent = capitalAtRisk > 0 ? (lastMonthEarnings / capitalAtRisk) * 100 : 0;
      } else {
        const lastPoint = historicalDataPoints[0];
        lastMonthEarnings = lastPoint.profit;
        lastMonthPercent = lastPoint.invested > 0 ? (lastPoint.profit / lastPoint.invested) * 100 : 0;
      }
    }
    return { earnings: lastMonthEarnings, percent: lastMonthPercent };
  }, [historicalDataPoints]);

  const overallLast12MonthsMetrics = useMemo(() => {
    const last12MonthsEarnings: number[] = [];
    let last12MonthsPercent = 0;
    let last12MonthsInterest = 0;
    let avgMonthlyProfit = 0;
    let avgMonthlyPercent = 0;

    if (historicalDataPoints && historicalDataPoints.length > 0) {
      const len = historicalDataPoints.length;
      const start = Math.max(0, len - 12);
      for (let i = start; i < len; i++) {
        const current = historicalDataPoints[i];
        const prev = i > 0 ? historicalDataPoints[i - 1] : null;
        const monthlyGain = prev ? (current.profit - prev.profit) : current.profit;
        last12MonthsEarnings.push(monthlyGain);
      }

      last12MonthsInterest = last12MonthsEarnings.reduce((sum, val) => sum + val, 0);

      const priorPoint = len > 12 ? historicalDataPoints[len - 13] : null;
      const baseValue = priorPoint ? priorPoint.value : 0;
      const currentPoint = historicalDataPoints[len - 1];
      const deltaInvested = currentPoint.invested - (priorPoint ? priorPoint.invested : 0);
      const capitalAtRisk = baseValue + Math.max(0, deltaInvested);

      last12MonthsPercent = capitalAtRisk > 0 ? (last12MonthsInterest / capitalAtRisk) * 100 : 0;

      avgMonthlyProfit = last12MonthsEarnings.length > 0 ? last12MonthsInterest / last12MonthsEarnings.length : 0;
      avgMonthlyPercent = last12MonthsEarnings.length > 0 ? last12MonthsPercent / last12MonthsEarnings.length : 0;
    }

    return {
      last12MonthsInterest,
      last12MonthsPercent,
      avgMonthlyProfit,
      avgMonthlyPercent,
    };
  }, [historicalDataPoints]);

  // Dashboard filtering computations
  const dashboardAssets = useMemo(() => {
    if (selectedAssetId === 'all') return assets;
    return assets.filter((a) => a.id === selectedAssetId);
  }, [assets, selectedAssetId]);

  const dashboardTransactions = useMemo(() => {
    if (selectedAssetId === 'all') return transactions;
    return transactions.filter((t) => t.assetId === selectedAssetId);
  }, [transactions, selectedAssetId]);

  const dashboardValuations = useMemo(() => {
    if (selectedAssetId === 'all') return valuations;
    return valuations.filter((v) => v.assetId === selectedAssetId);
  }, [valuations, selectedAssetId]);

  const dashboardPerformances = useMemo(() => {
    return calculateAssetPerformance(dashboardAssets, dashboardTransactions, dashboardValuations);
  }, [dashboardAssets, dashboardTransactions, dashboardValuations]);

  const dashboardSummary = useMemo(() => {
    return calculatePortfolioSummary(dashboardPerformances);
  }, [dashboardPerformances]);

  const dashboardHistoricalData = useMemo(() => {
    return calculateHistoricalPerformance(dashboardAssets, dashboardTransactions, dashboardValuations);
  }, [dashboardAssets, dashboardTransactions, dashboardValuations]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased font-sans flex flex-col">
      {/* Top Header Section */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-xs">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-600" />
            <h1 className="text-xs font-black tracking-tight text-slate-900 uppercase">Portfolio Ledger</h1>
          </div>
          
          {/* Quick Stats Banner */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold border border-slate-100 rounded-2xl py-2 px-4 bg-slate-50/50 w-full lg:w-auto">
            <div className="flex items-center gap-1 text-slate-500">
              <span>Total Invested:</span>
              <strong className="text-slate-800 font-bold">{formatCurrency(portfolioSummary.totalInvested, currencySymbol)}</strong>
            </div>
            <div className="text-slate-200 hidden lg:block">|</div>
            <div className="flex items-center gap-1 text-slate-500">
              <span>Portfolio Value:</span>
              <strong className="text-indigo-650 font-bold">{formatCurrency(portfolioSummary.totalValue, currencySymbol)}</strong>
            </div>
            <div className="text-slate-200 hidden lg:block">|</div>
            <div className="flex items-center gap-1 text-slate-500">
              <span>Total Profit/Loss:</span>
              <span className={`font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 ${
                portfolioSummary.totalProfit >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
              }`}>
                {portfolioSummary.totalProfit >= 0 ? '+' : ''}{formatCurrency(portfolioSummary.totalProfit, currencySymbol)} ({formatPercent(portfolioSummary.percentageReturn)})
              </span>
            </div>
            <div className="text-slate-200 hidden lg:block">|</div>
            <div className="flex items-center gap-1 text-slate-500">
              <span>Last Month:</span>
              <span className={`font-bold px-1.5 py-0.5 rounded-md ${
                overallLastMonthMetrics.earnings >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-750'
              }`}>
                {overallLastMonthMetrics.earnings >= 0 ? '+' : ''}{formatCurrency(overallLastMonthMetrics.earnings, currencySymbol)} ({overallLastMonthMetrics.percent >= 0 ? '+' : ''}{overallLastMonthMetrics.percent.toFixed(1)}%)
              </span>
            </div>
            <div className="text-slate-200 hidden lg:block">|</div>
            <div className="flex items-center gap-1 text-slate-500">
              <span>Avg. Monthly (12M):</span>
              <span className={`font-bold px-1.5 py-0.5 rounded-md ${
                overallLast12MonthsMetrics.avgMonthlyProfit >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
              }`}>
                {overallLast12MonthsMetrics.avgMonthlyProfit >= 0 ? '+' : ''}{formatCurrency(overallLast12MonthsMetrics.avgMonthlyProfit, currencySymbol)} ({overallLast12MonthsMetrics.avgMonthlyPercent >= 0 ? '+' : ''}{overallLast12MonthsMetrics.avgMonthlyPercent.toFixed(1)}%)
              </span>
            </div>
            <div className="text-slate-200 hidden lg:block">|</div>
            <div className="flex items-center gap-1 text-slate-500">
              <span>Last 12M Interest:</span>
              <span className={`font-bold px-1.5 py-0.5 rounded-md ${
                overallLast12MonthsMetrics.last12MonthsInterest >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
              }`}>
                {overallLast12MonthsMetrics.last12MonthsInterest >= 0 ? '+' : ''}{formatCurrency(overallLast12MonthsMetrics.last12MonthsInterest, currencySymbol)} ({overallLast12MonthsMetrics.last12MonthsPercent >= 0 ? '+' : ''}{overallLast12MonthsMetrics.last12MonthsPercent.toFixed(1)}%)
              </span>
            </div>
          </div>

        </div>
      </header>

      {/* Main Body Layout */}
      <main className="flex-grow max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Navigation Tabs Bar */}
        <div className="flex border-b border-slate-200 gap-2 mb-8 overflow-x-auto pb-px custom-scroll">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 py-3 px-4 font-semibold text-xs border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'border-indigo-600 text-indigo-650'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <PieChart className="h-4 w-4" />
            Dashboard Analytics
          </button>
          <button
            onClick={() => setActiveTab('assets')}
            className={`flex items-center gap-2 py-3 px-4 font-semibold text-xs border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'assets'
                ? 'border-indigo-600 text-indigo-650'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <Layers className="h-4 w-4" />
            Asset Catalog ({assets.length})
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-2 py-3 px-4 font-semibold text-xs border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'logs'
                ? 'border-indigo-600 text-indigo-650'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <FileText className="h-4 w-4" />
            Manual Ledger Logs
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`flex items-center gap-2 py-3 px-4 font-semibold text-xs border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'data'
                ? 'border-indigo-600 text-indigo-650'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <Settings className="h-4 w-4" />
            System Backup
          </button>
        </div>

        {/* Dynamic Tab Switchboard Views */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Asset Filter Selector Dropdown Card */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Performance Dashboard</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Track growth, monthly return yields, and ledger statistics</p>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-stretch sm:items-center gap-2.5">
                    <label htmlFor="dashboard-asset-select" className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap flex items-center">
                      Select Asset View:
                    </label>
                    <select
                      id="dashboard-asset-select"
                      value={selectedAssetId}
                      onChange={(e) => setSelectedAssetId(e.target.value)}
                      className="bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs rounded-xl font-bold px-3.5 py-2 border border-slate-200 transition-colors cursor-pointer outline-none focus:border-indigo-550 focus:ring-1 focus:ring-indigo-550 min-w-[220px]"
                    >
                      <option value="all">All Assets Combined (Portfolio)</option>
                      {[...assets].sort((a, b) => a.name.localeCompare(b.name)).map((asset) => (
                        <option key={asset.id} value={asset.id}>
                          {asset.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <MetricCards
                  summary={dashboardSummary}
                  performances={dashboardPerformances}
                  historicalData={dashboardHistoricalData}
                  currencySymbol={currencySymbol}
                />
                <ChartsDashboard
                  historicalData={dashboardHistoricalData}
                  performances={dashboardPerformances}
                  assets={dashboardAssets}
                  currencySymbol={currencySymbol}
                />
              </motion.div>
            )}

            {activeTab === 'assets' && (
              <motion.div
                key="assets"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <AssetsList
                  assets={assets}
                  performances={assetPerformances}
                  currencySymbol={currencySymbol}
                  onAddAsset={handleAddAsset}
                  onEditAsset={handleEditAsset}
                  onDeleteAsset={handleDeleteAsset}
                />
              </motion.div>
            )}

            {activeTab === 'logs' && (
              <motion.div
                key="logs"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <TransactionValuationLogger
                  assets={assets}
                  transactions={transactions}
                  valuations={valuations}
                  currencySymbol={currencySymbol}
                  onAddTransaction={handleAddTransaction}
                  onDeleteTransaction={handleDeleteTransaction}
                  onAddValuation={handleAddValuation}
                  onDeleteValuation={handleDeleteValuation}
                />
              </motion.div>
            )}

            {activeTab === 'data' && (
              <motion.div
                key="data"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <DataManagement
                  onImportData={handleImportData}
                  onExportData={handleExportData}
                  assetsCount={assets.length}
                  transactionsCount={transactions.length}
                  valuationsCount={valuations.length}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>


    </div>
  );
}
