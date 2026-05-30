/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  LineChart,
  Line,
  ComposedChart,
} from 'recharts';
import { motion } from 'motion/react';
import { Eye, EyeOff, LayoutGrid, CalendarRange, PieChartIcon, TrendingUp } from 'lucide-react';
import { HistoricalPoint, AssetPerformance, Asset } from '../types';
import { formatCurrency, formatPercent, getAssetTypeAllocation } from '../utils/portfolioUtils';

interface ChartsDashboardProps {
  historicalData: HistoricalPoint[];
  performances: AssetPerformance[];
  assets: Asset[];
  currencySymbol: string;
}

export const ChartsDashboard: React.FC<ChartsDashboardProps> = ({
  historicalData,
  performances,
  assets,
  currencySymbol,
}) => {
  const sortedAssets = useMemo(() => {
    return [...assets].sort((a, b) => a.name.localeCompare(b.name));
  }, [assets]);

  const [timeRange, setTimeRange] = useState<'3M' | '6M' | '1Y' | 'ALL'>('ALL');
  const [showAssetStack, setShowAssetStack] = useState<boolean>(false);

  // Filter historical data based on selected time range
  const filteredData = useMemo(() => {
    if (!historicalData || historicalData.length === 0) return [];

    const now = new Date();
    let monthsToSubtract = 999; // For 'ALL'

    if (timeRange === '3M') monthsToSubtract = 3;
    else if (timeRange === '6M') monthsToSubtract = 6;
    else if (timeRange === '1Y') monthsToSubtract = 12;

    const cutOffDate = new Date();
    cutOffDate.setMonth(now.getMonth() - monthsToSubtract);

    // Date format in historicalData is YYYY-MM
    // Get year-month ceiling for the cutOffDate
    const cutOffYear = cutOffDate.getFullYear();
    const cutOffMonth = String(cutOffDate.getMonth() + 1).padStart(2, '0');
    const cutOffString = `${cutOffYear}-${cutOffMonth}`;

    return historicalData.filter((point) => point.date >= cutOffString);
  }, [historicalData, timeRange]);

  // Calculate monthly returns (both absolute profit difference and % rate)
  const monthlyReturnsData = useMemo(() => {
    if (!historicalData || historicalData.length === 0) return [];

    const returns = historicalData.map((point, index) => {
      let numericReturn = 0;
      let percentReturn = 0;

      if (index === 0) {
        numericReturn = point.profit;
        percentReturn = point.invested > 0 ? (point.profit / point.invested) * 100 : 0;
      } else {
        const prevPoint = historicalData[index - 1];
        numericReturn = point.profit - prevPoint.profit;

        const deltaInvested = point.invested - prevPoint.invested;
        const capitalAtRisk = prevPoint.value + Math.max(0, deltaInvested);
        percentReturn = capitalAtRisk > 0 ? (numericReturn / capitalAtRisk) * 100 : 0;
      }

      return {
        date: point.date,
        numericReturn,
        percentReturn,
      };
    });

    // Filter based on selected time range
    const now = new Date();
    let monthsToSubtract = 999;

    if (timeRange === '3M') monthsToSubtract = 3;
    else if (timeRange === '6M') monthsToSubtract = 6;
    else if (timeRange === '1Y') monthsToSubtract = 12;

    const cutOffDate = new Date();
    cutOffDate.setMonth(now.getMonth() - monthsToSubtract);

    const cutOffYear = cutOffDate.getFullYear();
    const cutOffMonth = String(cutOffDate.getMonth() + 1).padStart(2, '0');
    const cutOffString = `${cutOffYear}-${cutOffMonth}`;

    return returns.filter((point) => point.date >= cutOffString);
  }, [historicalData, timeRange]);

  // Asset type allocations
  const allocationData = useMemo(() => {
    return getAssetTypeAllocation(performances);
  }, [performances]);

  // Asset individual concentrations
  const assetRankingData = useMemo(() => {
    return performances
      .map((p) => ({
        name: p.assetName,
        value: p.totalValue,
        percentage: performances.reduce((sum, item) => sum + item.totalValue, 0) > 0
          ? (p.totalValue / performances.reduce((sum, item) => sum + item.totalValue, 0)) * 100
          : 0,
        invested: p.totalInvested,
      }))
      .sort((a, b) => b.value - a.value);
  }, [performances]);

  if (historicalData.length === 0 || performances.length === 0) {
    return (
      <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center py-16 px-4 mb-8">
        <div className="w-16 h-16 bg-white border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400 shadow-sm">
          <PieChartIcon className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">Visual Dashboards Awaiting Logs</h3>
        <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
          Once you specify at least one asset and record historical cash transfers or portfolio valuation snapshots, performance telemetry graphs will update automatically.
        </p>
      </div>
    );
  }

  // Generate nice colors for individual assets in the stacked line
  const assetColors = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6'];

  return (
    <div className="space-y-6 mb-8">
      {/* Chart controls & range switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2">
          <CalendarRange className="h-5 w-5 text-indigo-500" />
          <span className="font-semibold text-slate-800 text-sm">Dashboard Diagnostics</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto justify-end">
          <div className="flex border border-slate-200 rounded-lg p-0.5 overflow-hidden text-xs bg-slate-50 font-medium">
            {(['3M', '6M', '1Y', 'ALL'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setTimeRange(r)}
                className={`py-1.5 px-3 rounded-md transition-all ${
                  timeRange === r
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {r === 'ALL' ? 'All Time' : r}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowAssetStack(!showAssetStack)}
            className="flex items-center gap-1 py-1.5 px-3 bg-slate-150 hover:bg-slate-200 text-slate-600 text-xs rounded-lg font-medium border border-slate-200 transition-all"
          >
            {showAssetStack ? (
              <>
                <EyeOff className="h-3 w-3" /> Hide Assets Line
              </>
            ) : (
              <>
                <Eye className="h-3 w-3" /> Underlay Asset Details
              </>
            )}
          </button>
        </div>
      </div>

      <div>
        {/* Core Growth Plot */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Growth & Cost Basis Trajectory</h3>
              <p className="text-xs text-slate-500 mt-0.5">Dual curve monitoring total invested vs. current net assets</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-indigo-600"></span> Value</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-slate-300"></span> Invested</span>
            </div>
          </div>

          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: 15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorBasis" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#64748b" stopOpacity={0.02}/>
                    <stop offset="95%" stopColor="#64748b" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  stroke="#94a3b8"
                  fontSize={11}
                  tickFormatter={(val) => {
                    const [year, month] = val.split('-');
                    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    return `${months[parseInt(month, 10) - 1]} ${year.substring(2)}`;
                  }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  stroke="#94a3b8"
                  fontSize={11}
                  width={65}
                  tickFormatter={(val) => formatCurrency(val, currencySymbol)}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as HistoricalPoint;
                      return (
                        <div className="bg-slate-900 border border-slate-800 text-slate-100 p-3.5 rounded-xl shadow-xl text-xs max-w-sm">
                          <p className="font-bold mb-2 text-slate-300 border-b border-slate-800 pb-1.5">{data.date}</p>
                          <div className="space-y-1">
                            <div className="flex justify-between gap-8">
                              <span>Asset Net Worth:</span>
                              <span className="font-bold text-white">{formatCurrency(data.value, currencySymbol)}</span>
                            </div>
                            <div className="flex justify-between gap-8">
                              <span>Cost Basis (Invested):</span>
                              <span className="font-semibold text-slate-300">{formatCurrency(data.invested, currencySymbol)}</span>
                            </div>
                            <div className="flex justify-between gap-8 border-t border-slate-800 pt-1.5 mt-1">
                              <span>Absolute Return:</span>
                              <span className={`font-semibold ${data.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {data.profit >= 0 ? '+' : ''}{formatCurrency(data.profit, currencySymbol)}
                              </span>
                            </div>
                            <div className="flex justify-between gap-8">
                              <span>Percentage Yield:</span>
                              <span className={`font-semibold ${data.returnPercentage >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {formatPercent(data.returnPercentage)}
                              </span>
                            </div>

                            {showAssetStack && (
                              <div className="border-t border-slate-800 pt-1.5 mt-2 space-y-1">
                                <p className="font-semibold text-[10px] text-slate-400 uppercase tracking-widest mb-1">Asset Value Split</p>
                                {sortedAssets.map((asset) => {
                                  if (data[asset.id] !== undefined) {
                                    return (
                                      <div key={asset.id} className="flex justify-between text-[10px] text-slate-300">
                                        <span className="truncate max-w-[120px]">{asset.name}:</span>
                                        <span>{formatCurrency(data[asset.id], currencySymbol)}</span>
                                      </div>
                                    );
                                  }
                                  return null;
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorValue)" />
                <Area type="monotone" dataKey="invested" stroke="#94a3b8" strokeDasharray="4 4" strokeWidth={1.5} fillOpacity={1} fill="url(#colorBasis)" />

                {/* Optional lines showing underlying assets */}
                {showAssetStack &&
                  sortedAssets.map((asset, index) => (
                    <Line
                      key={asset.id}
                      type="monotone"
                      dataKey={asset.id}
                      stroke={assetColors[index % assetColors.length]}
                      strokeWidth={1.5}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                  ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Monthly Returns Analysis (Composed Bar & Line Chart) */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col h-[380px]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Monthly Asset Returns & Yield</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Monthly net yield value (bars, left scale) mapped against monthly portfolio percentage return rate (line, right scale)
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span> Gain
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500"></span> Loss
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Return Rate (%)
            </span>
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={monthlyReturnsData} margin={{ top: 10, right: 15, left: 15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                stroke="#94a3b8"
                fontSize={11}
                tickFormatter={(val) => {
                  const [year, month] = val.split('-');
                  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                  return `${months[parseInt(month, 10) - 1]} ${year.substring(2)}`;
                }}
              />
              <YAxis
                yAxisId="left"
                tickLine={false}
                axisLine={false}
                stroke="#94a3b8"
                fontSize={11}
                width={65}
                tickFormatter={(val) => formatCurrency(val, currencySymbol)}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tickLine={false}
                axisLine={false}
                stroke="#94a3b8"
                fontSize={11}
                width={45}
                tickFormatter={(val) => `${val >= 0 ? '+' : ''}${val.toFixed(0)}%`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    const isPositive = data.numericReturn >= 0;
                    return (
                      <div className="bg-slate-900 border border-slate-800 text-slate-100 p-3.5 rounded-xl shadow-xl text-xs max-w-xs">
                        <p className="font-bold mb-2 text-slate-300 border-b border-slate-800 pb-1.5">{data.date}</p>
                        <div className="space-y-1">
                          <div className="flex justify-between gap-8">
                            <span>Monthly Net Return:</span>
                            <span className={`font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {isPositive ? '+' : ''}{formatCurrency(data.numericReturn, currencySymbol)}
                            </span>
                          </div>
                          <div className="flex justify-between gap-8">
                            <span>Monthly Yield Rate:</span>
                            <span className={`font-bold ${data.percentReturn >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {data.percentReturn >= 0 ? '+' : ''}{data.percentReturn.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar yAxisId="left" dataKey="numericReturn" radius={[4, 4, 0, 0]}>
                {monthlyReturnsData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.numericReturn >= 0 ? '#10b981' : '#ef4444'}
                  />
                ))}
              </Bar>
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="percentReturn"
                stroke="#4f46e5"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#4f46e5', strokeWidth: 1 }}
                activeDot={{ r: 5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Absolute Profit Yield Trend */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col h-[320px]">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Net Lifetime Return Percentage</h3>
            <p className="text-xs text-slate-500 mt-0.5">Historical trend tracking percentage returns</p>
          </div>

          <div className="flex-1 min-h-0 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  stroke="#94a3b8"
                  fontSize={10}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  stroke="#94a3b8"
                  fontSize={10}
                  width={45}
                  tickFormatter={(val) => `${val.toFixed(0)}%`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const returnVal = data.returnPercentage;
                      return (
                        <div className="bg-slate-900 border border-slate-800 text-slate-100 px-3.5 py-2 rounded-xl shadow-xl text-xs">
                          <p className="font-bold text-slate-300 mb-1">{data.date}</p>
                          <div className="flex items-center gap-1.5">
                            <span>Yield Return:</span>
                            <span className={`font-semibold ${returnVal >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {formatPercent(returnVal)}
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="returnPercentage"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 2, fill: '#10b981', strokeWidth: 1 }}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Individual Asset Concentration Bars */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col h-[320px]">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Asset Exposure Distribution</h3>
            <p className="text-xs text-slate-500 mt-0.5">Individual asset sizes weighed against total net value</p>
          </div>

          <div className="flex-1 overflow-y-auto mt-4 pr-1 space-y-3.5 custom-scroll">
            {assetRankingData.map((asset, idx) => {
              const themeColor = assetColors[idx % assetColors.length];
              return (
                <div key={asset.name} className="flex flex-col text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-800 truncate max-w-[170px]" title={asset.name}>
                      {asset.name}
                    </span>
                    <div className="flex gap-2">
                      <span className="text-slate-500 font-medium">{formatCurrency(asset.value, currencySymbol)}</span>
                      <span className="font-semibold text-slate-900 bg-slate-50 px-1.5 py-0.5 rounded text-[10px]">
                        {asset.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${asset.percentage}%` }}
                      transition={{ duration: 0.6, delay: idx * 0.05 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: themeColor }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
