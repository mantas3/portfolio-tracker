/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Asset, Transaction, Valuation } from '../types';

export const DEMO_ASSETS: Asset[] = [
  {
    id: 'asset-1',
    name: 'Vanguard S&P 500 ETF',
    symbol: 'VOO',
    type: 'etf',
    currency: '€',
    description: 'Tracks the performance of the S&P 500 Index, representing 500 of the largest U.S. companies.',
    createdAt: '2025-05-01'
  },
  {
    id: 'asset-2',
    name: 'Fidelity Global Growth Fund',
    symbol: 'FGGFX',
    type: 'fund',
    currency: '€',
    description: 'Actively managed mutual fund focused on high-quality growing global equities.',
    createdAt: '2025-06-01'
  },
  {
    id: 'asset-3',
    name: 'Mintos P2P Lending',
    symbol: 'MINTOS',
    type: 'p2p',
    currency: '€',
    description: 'P2P platform investing in multi-originator consumer and business loans with buyback guarantees.',
    createdAt: '2025-08-01'
  }
];

export const DEMO_TRANSACTIONS: Transaction[] = [
  // Asset 1: S&P 500 ETF contributions
  { id: 't-1-1', assetId: 'asset-1', date: '2025-05-05', amount: 1000, note: 'Initial investment' },
  { id: 't-1-2', assetId: 'asset-1', date: '2025-07-10', amount: 500, note: 'Monthly saving contribution' },
  { id: 't-1-3', assetId: 'asset-1', date: '2025-09-15', amount: 500, note: 'Monthly saving contribution' },
  { id: 't-1-4', assetId: 'asset-1', date: '2025-11-20', amount: 500, note: 'Bonus investment' },
  { id: 't-1-5', assetId: 'asset-1', date: '2026-01-15', amount: 1000, note: 'New Year allocation' },
  { id: 't-1-6', assetId: 'asset-1', date: '2026-03-10', amount: 500, note: 'Monthly saving contribution' },
  { id: 't-1-7', assetId: 'asset-1', date: '2026-05-05', amount: 500, note: 'Monthly saving contribution' },

  // Asset 2: Global Growth Fund contributions
  { id: 't-2-1', assetId: 'asset-2', date: '2025-06-05', amount: 2000, note: 'Core fund setup' },
  { id: 't-2-2', assetId: 'asset-2', date: '2025-12-10', amount: 1000, note: 'End of year saving' },

  // Asset 3: P2P lending contributions
  { id: 't-3-1', assetId: 'asset-3', date: '2025-08-01', amount: 500, note: 'Initial P2P setup' },
  { id: 't-3-2', assetId: 'asset-3', date: '2025-10-01', amount: 500, note: 'Reinvesting payout' }
];

export const DEMO_VALUATIONS: Valuation[] = [
  // Asset 1 Valuations (VOO)
  { id: 'v-1-1', assetId: 'asset-1', date: '2025-05-31', value: 1020, note: 'May end' },
  { id: 'v-1-2', assetId: 'asset-1', date: '2025-06-30', value: 1040, note: 'June end' },
  { id: 'v-1-3', assetId: 'asset-1', date: '2025-07-31', value: 1580, note: 'July end' },
  { id: 'v-1-4', assetId: 'asset-1', date: '2025-08-31', value: 1550, note: 'August market drop' },
  { id: 'v-1-5', assetId: 'asset-1', date: '2025-09-30', value: 2120, note: 'September end' },
  { id: 'v-1-6', assetId: 'asset-1', date: '2025-10-31', value: 2180, note: 'October rally' },
  { id: 'v-1-7', assetId: 'asset-1', date: '2025-11-30', value: 2780, note: 'November end' },
  { id: 'v-1-8', assetId: 'asset-1', date: '2025-12-31', value: 2950, note: 'Santa Rally' },
  { id: 'v-1-9', assetId: 'asset-1', date: '2026-01-31', value: 4050, note: 'January high' },
  { id: 'v-1-10', assetId: 'asset-1', date: '2026-02-28', value: 4120, note: 'February end' },
  { id: 'v-1-11', assetId: 'asset-1', date: '2026-03-31', value: 4750, note: 'March end' },
  { id: 'v-1-12', assetId: 'asset-1', date: '2026-04-30', value: 4820, note: 'April end' },
  { id: 'v-1-13', assetId: 'asset-1', date: '2026-05-25', value: 5450, note: 'Latest valuation' },

  // Asset 2 Valuations (FGGFX)
  { id: 'v-2-1', assetId: 'asset-2', date: '2025-06-30', value: 2050, note: 'June check' },
  { id: 'v-2-2', assetId: 'asset-2', date: '2025-07-31', value: 1980, note: 'July correction' },
  { id: 'v-2-3', assetId: 'asset-2', date: '2025-08-31', value: 2100, note: 'August recovery' },
  { id: 'v-2-4', assetId: 'asset-2', date: '2025-09-30', value: 2150, note: 'September end' },
  { id: 'v-2-5', assetId: 'asset-2', date: '2025-10-31', value: 2240, note: 'October growth' },
  { id: 'v-2-6', assetId: 'asset-2', date: '2025-11-30', value: 2380, note: 'November trend' },
  { id: 'v-2-7', assetId: 'asset-2', date: '2025-12-31', value: 3520, note: 'December close' },
  { id: 'v-2-8', assetId: 'asset-2', date: '2026-01-31', value: 3640, note: 'New Year start' },
  { id: 'v-2-9', assetId: 'asset-2', date: '2026-02-28', value: 3750, note: 'February record' },
  { id: 'v-2-10', assetId: 'asset-2', date: '2026-03-31', value: 3800, note: 'March audit' },
  { id: 'v-2-11', assetId: 'asset-2', date: '2026-04-30', value: 3920, note: 'April peak' },
  { id: 'v-2-12', assetId: 'asset-2', date: '2026-05-25', value: 4150, note: 'May runup' },

  // Asset 3 Valuations (MINTOS)
  { id: 'v-3-1', assetId: 'asset-3', date: '2025-08-31', value: 504, note: 'First month interest' },
  { id: 'v-3-2', assetId: 'asset-3', date: '2025-09-30', value: 508, note: 'September interest' },
  { id: 'v-3-3', assetId: 'asset-3', date: '2025-10-31', value: 1016, note: 'October check' },
  { id: 'v-3-4', assetId: 'asset-3', date: '2025-11-30', value: 1024, note: 'November interest' },
  { id: 'v-3-5', assetId: 'asset-3', date: '2025-12-31', value: 1032, note: 'End of year compounding' },
  { id: 'v-3-6', assetId: 'asset-3', date: '2026-01-31', value: 1040, note: 'January interest' },
  { id: 'v-3-7', assetId: 'asset-3', date: '2026-02-28', value: 1048, note: 'February interest' },
  { id: 'v-3-8', assetId: 'asset-3', date: '2026-03-31', value: 1056, note: 'March interest' },
  { id: 'v-3-9', assetId: 'asset-3', date: '2026-04-30', value: 1065, note: 'April interest' },
  { id: 'v-3-10', assetId: 'asset-3', date: '2025-05-25', value: 1074, note: 'Latest compounding' }
];
