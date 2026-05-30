/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, Wallet, PlusCircle, ArrowUpRight, DollarSign } from 'lucide-react';
import { PortfolioSummary, AssetPerformance, HistoricalPoint } from '../types';
import { formatCurrency, formatPercent } from '../utils/portfolioUtils';

interface MetricCardsProps {
  summary: PortfolioSummary;
  performances: AssetPerformance[];
  historicalData: HistoricalPoint[];
  currencySymbol: string;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  summary,
  performances,
  historicalData,
  currencySymbol,
}) => {
  const isProfit = summary.totalProfit >= 0;

  let lastMonthEarnings = 0;
  let lastMonthPercent = 0;
  let displayMonthText = '';

  if (historicalData && historicalData.length > 0) {
    if (historicalData.length >= 2) {
      const lastPoint = historicalData[historicalData.length - 1];
      const prevPoint = historicalData[historicalData.length - 2];
      lastMonthEarnings = lastPoint.profit - prevPoint.profit;

      const deltaInvested = lastPoint.invested - prevPoint.invested;
      const capitalAtRisk = prevPoint.value + Math.max(0, deltaInvested);
      lastMonthPercent = capitalAtRisk > 0 ? (lastMonthEarnings / capitalAtRisk) * 100 : 0;

      // Extract month name
      const [year, month] = lastPoint.date.split('-');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      displayMonthText = `${months[parseInt(month, 10) - 1]} ${year}`;
    } else {
      const lastPoint = historicalData[0];
      lastMonthEarnings = lastPoint.profit;
      lastMonthPercent = lastPoint.invested > 0 ? (lastPoint.profit / lastPoint.invested) * 100 : 0;

      const [year, month] = lastPoint.date.split('-');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      displayMonthText = `${months[parseInt(month, 10) - 1]} ${year}`;
    }
  }

  const isEarningsPositive = lastMonthEarnings >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
      {/* Total Contributions / Invested */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-slate-500 font-medium text-sm">Total Invested</span>
          <div className="bg-cyan-50 p-2 rounded-xl text-cyan-600">
            <PlusCircle className="h-5 w-5" />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-3xl font-bold text-slate-900 tracking-tight">
            {formatCurrency(summary.totalInvested, currencySymbol)}
          </span>
          <div className="flex items-center gap-1.5 mt-2.5 text-xs">
            <span className="text-slate-600 font-medium">
              {performances.length} Active {performances.length === 1 ? 'Asset' : 'Assets'}
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500">Cumulative funding basis</span>
          </div>
        </div>
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-cyan-50/20 rounded-full" />
      </motion.div>

      {/* Target Asset Allocation Card / Value */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-slate-500 font-medium text-sm">Portfolio Value</span>
          <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600">
            <Wallet className="h-5 w-5" />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-3xl font-bold text-slate-900 tracking-tight">
            {formatCurrency(summary.totalValue, currencySymbol)}
          </span>
          <div className="flex items-center gap-1.5 mt-2 text-xs">
            <span
              className={`flex items-center font-semibold px-2 py-0.5 rounded-full ${
                isProfit ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
              }`}
            >
              {isProfit ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {formatPercent(summary.percentageReturn)}
            </span>
            <span className="text-slate-500">all-time yield</span>
          </div>
        </div>
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-indigo-50/20 rounded-full" />
      </motion.div>

      {/* Net Gains / Losses */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-slate-500 font-medium text-sm">Total Profit / Loss</span>
          <div
            className={`p-2 rounded-xl ${
              isProfit ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
            }`}
          >
            <ArrowUpRight className="h-5 w-5" />
          </div>
        </div>
        <div className="flex flex-col">
          <span
            className={`text-3xl font-bold tracking-tight ${
              isProfit ? 'text-emerald-600' : 'text-red-600'
            }`}
          >
            {isProfit ? '+' : ''}
            {formatCurrency(summary.totalProfit, currencySymbol)}
          </span>
          <div className="flex items-center gap-1.5 mt-2.5 text-xs text-slate-500">
            <span>Market gains + dividends</span>
          </div>
        </div>
        <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full ${isProfit ? 'bg-emerald-50/20' : 'bg-red-50/20'}`} />
      </motion.div>

      {/* Last Month Earnings */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-slate-500 font-medium text-sm">Last Month Earnings</span>
          <div
            className={`p-2 rounded-xl ${
              isEarningsPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            }`}
          >
            {isEarningsPositive ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
          </div>
        </div>
        <div className="flex flex-col">
          <span
            className={`text-3xl font-bold tracking-tight ${
              isEarningsPositive ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {isEarningsPositive ? '+' : ''}
            {formatCurrency(lastMonthEarnings, currencySymbol)}
          </span>
          <div className="flex items-center gap-1.5 mt-2.5 text-xs">
            <span
              className={`font-semibold px-2 py-0.5 rounded-full ${
                isEarningsPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
              }`}
            >
              {isEarningsPositive ? '+' : ''}{lastMonthPercent.toFixed(1)}%
            </span>
            <span className="text-slate-500 whitespace-nowrap">
              {displayMonthText ? `yield in ${displayMonthText}` : 'prior period delta'}
            </span>
          </div>
        </div>
        <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full ${isEarningsPositive ? 'bg-emerald-50/20' : 'bg-rose-50/20'}`} />
      </motion.div>
    </div>
  );
};
