/**
 * Finance Module Type Definitions
 */

export type Transaction = {
  id: string;
  name: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string; // ISO date string
  note?: string;
};

export type BudgetCategory = {
  id: string;
  name: string;
  budget: number;
  color?: string;
  icon?: string;
};

export type SavingGoal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string; // Optional for flexibility
  color?: string;
  icon?: string;
};

export type Debt = {
  id: string;
  name: string;
  totalDebt: number;
  paidAmount: number;
  monthlyPayment: number;
  startDate: string;
  dueDayOfMonth: number; // 1-31
  status: 'aktif' | 'lunas';
};

export type SavingDeposit = {
  id: string;
  goalId: string;
  amount: number;
  date: string;
};

export type DebtPayment = {
  id: string;
  debtId: string;
  amount: number;
  date: string;
};

export type InvestmentType = 'reksa_dana' | 'saham' | 'obligasi' | 'crypto' | 'lainnya';

export type Investment = {
  id: string;
  name: string;
  type: InvestmentType;
  initialAmount: number;
  currentValue: number;
  buyDate: string;
  symbol?: string; // For stocks
  lots?: number; // For stocks
  lastUpdated?: string;
};

export type FinanceState = {
  transactions: Transaction[];
  budgets: BudgetCategory[];
  savings: SavingGoal[];
  debts: Debt[];
  investments: Investment[];
  savingDeposits: SavingDeposit[];
  debtPayments: DebtPayment[];
};
