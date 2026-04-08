import { Transaction, BudgetCategory, SavingGoal, Debt, Investment } from "./finance-types";

const now = new Date();
const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);

export const DUMMY_TRANSACTIONS: Transaction[] = [
  // Current Month
  { id: '1', name: 'Gaji April', amount: 15000000, type: 'income', category: 'Gaji', date: now.toISOString() },
  { id: '2', name: 'Sewa Apartemen', amount: 3500000, type: 'expense', category: 'Tempat Tinggal', date: now.toISOString() },
  { id: '3', name: 'Stock Kelontong', amount: 800000, type: 'expense', category: 'Belanja', date: now.toISOString() },
  { id: '4', name: 'Tagihan Listrik', amount: 450000, type: 'expense', category: 'Tagihan', date: now.toISOString() },
  // Last Month
  { id: '5', name: 'Gaji Maret', amount: 15000000, type: 'income', category: 'Gaji', date: lastMonth.toISOString() },
  { id: '6', name: 'Makan Malam', amount: 250000, type: 'expense', category: 'Hiburan', date: lastMonth.toISOString() },
  { id: '7', name: 'Bensin', amount: 300000, type: 'expense', category: 'Transportasi', date: lastMonth.toISOString() },
  { id: '8', name: 'Bonus Project', amount: 5000000, type: 'income', category: 'Freelance', date: lastMonth.toISOString() },
  // 3 Months Ago
  { id: '9', name: 'Gaji Februari', amount: 15000000, type: 'income', category: 'Gaji', date: twoMonthsAgo.toISOString() },
  { id: '10', name: 'Gadget Baru', amount: 4500000, type: 'expense', category: 'Lifestyle', date: twoMonthsAgo.toISOString() },
  // More transactions...
];

export const DUMMY_BUDGETS: BudgetCategory[] = [
  { id: 'b1', name: 'Makanan & Minuman', budget: 3000000, color: '#10b981' },
  { id: 'b2', name: 'Transportasi', budget: 1000000, color: '#f59e0b' },
  { id: 'b3', name: 'Hiburan', budget: 1500000, color: '#3b82f6' },
  { id: 'b4', name: 'Belanja Bulanan', budget: 2000000, color: '#8b5cf6' },
  { id: 'b5', name: 'Lainnya', budget: 500000, color: '#64748b' },
];

export const DUMMY_SAVINGS: SavingGoal[] = [
  { id: 's1', name: 'Dana Darurat', targetAmount: 50000000, currentAmount: 12500000, targetDate: '2026-12-31' },
  { id: 's2', name: 'Liburan Jepang', targetAmount: 25000000, currentAmount: 18000000, targetDate: '2026-06-15' },
  { id: 's3', name: 'Mobil Baru', targetAmount: 250000000, currentAmount: 45000000, targetDate: '2028-01-01' },
];

export const DUMMY_DEBTS: Debt[] = [
  { id: 'd1', name: 'KPR Rumah', totalDebt: 750000000, paidAmount: 120000000, monthlyPayment: 4500000, startDate: '2024-01-10', dueDayOfMonth: 10, status: 'aktif' },
  { id: 'd2', name: 'Cicilan Laptop', totalDebt: 18000000, paidAmount: 12000000, monthlyPayment: 1500000, startDate: '2025-05-05', dueDayOfMonth: 5, status: 'aktif' },
];

export const DUMMY_INVESTMENTS: Investment[] = [
  { id: 'i1', name: 'BBCA', type: 'saham', initialAmount: 25000000, currentValue: 27500000, buyDate: '2024-02-15', symbol: 'BBCA', lots: 3 },
  { id: 'i2', name: 'TLKM', type: 'saham', initialAmount: 12000000, currentValue: 11400000, buyDate: '2024-11-20', symbol: 'TLKM', lots: 4 },
  { id: 'i3', name: 'Bibit - Suconcor Stable Fund', type: 'reksa_dana', initialAmount: 5000000, currentValue: 5250000, buyDate: '2025-01-10' },
  { id: 'i4', name: 'Crypto Bucket', type: 'crypto', initialAmount: 2000000, currentValue: 1850000, buyDate: '2025-03-01' },
];
