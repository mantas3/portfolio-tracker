/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Asset, Transaction, Valuation, HistoricalPoint, PortfolioSummary, AssetPerformance, AssetType } from '../types';

/**
 * Returns the end date of a month given a YYYY-MM string
 */
export function getEndOfMonth(yearMonth: string): string {
  const [year, month] = yearMonth.split('-').map(Number);
  // Date(year, month, 0) returns the last day of the previous month.
  // So Date(year, month, 0) for month gives the last day of that month.
  const date = new Date(year, month, 0);
  const day = String(date.getDate()).padStart(2, '0');
  const monthStr = String(month).padStart(2, '0');
  return `${year}-${monthStr}-${day}`;
}

/**
 * Lists all month strings (YYYY-MM) from a start date (or min date in transactions/valuations)
 * up to a given end date (defaulting to current date or max date found).
 */
export function generateMonthRange(start: string, end: string): string[] {
  const months: string[] = [];
  const currentDate = new Date(start);
  const endDate = new Date(end);

  // Set to day 1 to avoid month length issues during calculation
  currentDate.setDate(1);
  endDate.setDate(1);

  while (currentDate <= endDate) {
    const y = currentDate.getFullYear();
    const m = String(currentDate.getMonth() + 1).padStart(2, '0');
    months.push(`${y}-${m}`);
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  return months;
}

/**
 * Calculates current valuation, total invested, profit and returns for each asset.
 */
export function calculateAssetPerformance(
  assets: Asset[],
  transactions: Transaction[],
  valuations: Valuation[]
): AssetPerformance[] {
  return assets.map((asset) => {
    // 1. Total Invested (cumulative transactions)
    const assetTransactions = transactions.filter((t) => t.assetId === asset.id);
    const totalInvested = assetTransactions.reduce((sum, t) => sum + t.amount, 0);

    // 2. Find latest valuation
    const assetValuations = valuations
      .filter((v) => v.assetId === asset.id)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let totalValue = 0;
    let lastValuationDate = 'N/A';

    if (assetValuations.length > 0) {
      const latestVal = assetValuations[assetValuations.length - 1];
      const valuationDate = latestVal.date;
      lastValuationDate = valuationDate;

      // Add transactions happened *after* the latest valuation
      const transactionsAfterValuation = assetTransactions.filter(
        (t) => new Date(t.date).getTime() > new Date(valuationDate).getTime()
      );
      const postValuationContribution = transactionsAfterValuation.reduce((sum, t) => sum + t.amount, 0);

      totalValue = latestVal.value + postValuationContribution;
    } else {
      // If no valuation, estimate total value as total invested
      totalValue = totalInvested;
    }

    const totalProfit = totalValue - totalInvested;
    const percentageReturn = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

    return {
      assetId: asset.id,
      assetName: asset.name,
      assetType: asset.type,
      totalValue,
      totalInvested,
      totalProfit,
      percentageReturn,
      lastValuationDate,
    };
  });
}

/**
 * Summarizes the entire portfolio performance.
 */
export function calculatePortfolioSummary(performances: AssetPerformance[]): PortfolioSummary {
  const totalValue = performances.reduce((sum, p) => sum + p.totalValue, 0);
  const totalInvested = performances.reduce((sum, p) => sum + p.totalInvested, 0);
  const totalProfit = totalValue - totalInvested;
  const percentageReturn = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

  return {
    totalValue,
    totalInvested,
    totalProfit,
    percentageReturn,
  };
}

/**
 * Generates historical performance database suitable for line charts.
 */
export function calculateHistoricalPerformance(
  assets: Asset[],
  transactions: Transaction[],
  valuations: Valuation[]
): HistoricalPoint[] {
  // Find date range
  const allDates = [
    ...assets.map((a) => a.createdAt),
    ...transactions.map((t) => t.date),
    ...valuations.map((v) => v.date),
  ].filter(Boolean);

  if (allDates.length === 0) return [];

  allDates.sort();
  const startDate = allDates[0].substring(0, 7) + '-01'; // Beginning of first month
  const endDate = allDates[allDates.length - 1].substring(0, 7) + '-01'; // Beginning of last month

  // We want to ensure the historical points are generated up to at least current date so the chart is fresh
  const todaySlash = new Date().toISOString().substring(0, 7);
  const actualEndDate = new Date(endDate) < new Date(todaySlash + '-01') ? todaySlash + '-01' : endDate;

  const monthRange = generateMonthRange(startDate, actualEndDate);

  return monthRange.map((yearMonth) => {
    const endOfMonthDate = getEndOfMonth(yearMonth);
    const point: HistoricalPoint = {
      date: yearMonth,
      invested: 0,
      value: 0,
      profit: 0,
      returnPercentage: 0,
    };

    assets.forEach((asset) => {
      // Cumulative invested for this asset up to this month end
      const assetTransactions = transactions.filter(
        (t) => t.assetId === asset.id && t.date <= endOfMonthDate
      );
      const investedAmount = assetTransactions.reduce((sum, t) => sum + t.amount, 0);

      // Latest valuation before or on this month end
      const assetValuations = valuations
        .filter((v) => v.assetId === asset.id && v.date <= endOfMonthDate)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      let currentAssetVal = 0;

      if (assetValuations.length > 0) {
        const latestVal = assetValuations[assetValuations.length - 1];
        const valDate = latestVal.date;

        // Transactions after that valuation date, but before or on endOfMonthDate
        const pendingTrans = assetTransactions.filter((t) => t.date > valDate);
        const addedAmount = pendingTrans.reduce((sum, t) => sum + t.amount, 0);

        currentAssetVal = latestVal.value + addedAmount;
      } else {
        // No valuation on record yet up to this month end -> estimate as cash balance
        currentAssetVal = investedAmount;
      }

      // Add to running totals
      point.invested += investedAmount;
      point.value += currentAssetVal;

      // Also store individual asset value on this date for advanced breakdown charts
      point[asset.id] = currentAssetVal;
    });

    point.profit = point.value - point.invested;
    point.returnPercentage = point.invested > 0 ? (point.profit / point.invested) * 100 : 0;

    return point;
  });
}

/**
 * Group valuations or historical points to show allocation.
 */
export function getAssetTypeAllocation(performances: AssetPerformance[]): { name: string; value: number; color: string }[] {
  const types: Record<AssetType, number> = {
    etf: 0,
    fund: 0,
    p2p: 0,
    pension: 0,
    other: 0,
  };

  performances.forEach((p) => {
    types[p.assetType] += p.totalValue;
  });

  const colors = {
    etf: '#4f46e5',  // Indigo
    fund: '#06b6d4', // Cyan
    p2p: '#10b981',  // Emerald
    pension: '#a855f7', // Purple
    other: '#f59e0b', // Amber
  };

  const displayName = {
    etf: 'ETFs',
    fund: 'Mutual Funds',
    p2p: 'P2P Lending',
    pension: 'Pension Funds',
    other: 'Other/Cash',
  };

  return (Object.keys(types) as AssetType[])
    .map((type) => ({
      name: displayName[type],
      value: Math.max(0, types[type]),
      color: colors[type],
    }))
    .filter((v) => v.value > 0);
}

/**
 * Format currency value
 */
export function formatCurrency(amount: number, symbol: string = '€'): string {
  return `${symbol}${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatPercent(amount: number): string {
  const plus = amount > 0 ? '+' : '';
  return `${plus}${amount.toFixed(1)}%`;
}
