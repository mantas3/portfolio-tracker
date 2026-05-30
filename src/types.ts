/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AssetType = 'etf' | 'fund' | 'p2p' | 'pension' | 'other';

export interface Asset {
  id: string;
  name: string;
  symbol: string;
  type: AssetType;
  currency: string;
  description?: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  assetId: string;
  date: string; // YYYY-MM-DD
  amount: number; // positive = contribution, negative = withdrawal
  note?: string;
}

export interface Valuation {
  id: string;
  assetId: string;
  date: string; // YYYY-MM-DD
  value: number; // portfolio value on this date
  note?: string;
}

export interface PortfolioSummary {
  totalValue: number;
  totalInvested: number;
  totalProfit: number;
  percentageReturn: number;
}

export interface AssetPerformance extends PortfolioSummary {
  assetId: string;
  assetName: string;
  assetType: AssetType;
  lastValuationDate: string;
}

export interface HistoricalPoint {
  date: string; // YYYY-MM or YYYY-MM-DD for grouping
  invested: number;
  value: number;
  profit: number;
  returnPercentage: number;
  [assetId: string]: any; // asset values on this date
}
