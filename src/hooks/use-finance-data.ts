"use client";

import useSWR, { mutate } from 'swr';
import { 
  FinanceState, 
  Transaction, 
  BudgetCategory, 
  SavingGoal, 
  Debt, 
  Investment, 
  SavingDeposit, 
  DebtPayment 
} from '../lib/finance-types';

const fetcher = (url: string) => fetch(url).then(res => res.json()).then(res => {
  if (!res.success) throw new Error(res.error);
  return res.data;
});

export function useFinanceData(selectedDate?: Date) {
  // Format period for transaction filtering (YYYY-MM)
  const period = selectedDate ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}` : null;

  // SWR Fetches
  const { data: transactions = [], error: tError, isLoading: tLoading } = useSWR<Transaction[]>(
    period ? `/api/finance/transactions?month=${period}` : '/api/finance/transactions', 
    fetcher
  );

  const { data: budgets = [], error: bError, isLoading: bLoading } = useSWR<BudgetCategory[]>(
    '/api/finance/budgets', 
    fetcher
  );

  const { data: savings = [], error: sError, isLoading: sLoading } = useSWR<SavingGoal[]>(
    '/api/finance/savings', 
    fetcher
  );

  const { data: debts = [], error: dError, isLoading: dLoading } = useSWR<Debt[]>(
    '/api/finance/debts', 
    fetcher
  );

  const { data: investments = [], error: iError, isLoading: iLoading } = useSWR<Investment[]>(
    '/api/finance/investments', 
    fetcher
  );

  const isLoading = tLoading || bLoading || sLoading || dLoading || iLoading;
  const error = tError || bError || sError || dError || iError;

  // Generic request helper for mutations
  const request = async (url: string, method: string, body?: any) => {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    });
    
    // Handle 204 No Content or empty responses
    if (res.status === 204) return null;
    
    const result = await res.json();
    if (!result.success) throw new Error(result.error);
    return result.data;
  };

  // Actions - Transactions
  const addTransaction = async (t: Omit<Transaction, 'id'>) => {
    await request('/api/finance/transactions', 'POST', t);
    mutate(period ? `/api/finance/transactions?month=${period}` : '/api/finance/transactions');
  };

  const deleteTransaction = async (id: string) => {
    await request(`/api/finance/transactions/${id}`, 'DELETE');
    mutate(period ? `/api/finance/transactions?month=${period}` : '/api/finance/transactions');
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    await request(`/api/finance/transactions/${id}`, 'PUT', updates);
    mutate(period ? `/api/finance/transactions?month=${period}` : '/api/finance/transactions');
  };

  // Actions - Budgets
  const addBudget = async (b: Omit<BudgetCategory, 'id'>) => {
    await request('/api/finance/budgets', 'POST', b);
    mutate('/api/finance/budgets');
  };

  const updateBudget = async (id: string, data: Omit<BudgetCategory, 'id'>) => {
    await request(`/api/finance/budgets/${id}`, 'PUT', data);
    mutate('/api/finance/budgets');
  };

  const deleteBudget = async (id: string) => {
    await request(`/api/finance/budgets/${id}`, 'DELETE');
    mutate('/api/finance/budgets');
  };

  // Actions - Savings
  const addSavingGoal = async (g: Omit<SavingGoal, 'id' | 'currentAmount'>) => {
    await request('/api/finance/savings', 'POST', g);
    mutate('/api/finance/savings');
  };

  const addSavingContribution = async (goalId: string, amount: number, date: string = new Date().toISOString()) => {
    await request(`/api/finance/savings/${goalId}/deposit`, 'POST', { amount, date });
    mutate('/api/finance/savings');
  };

  // Actions - Debts
  const addDebt = async (d: Omit<Debt, 'id' | 'paidAmount' | 'status'>) => {
    await request('/api/finance/debts', 'POST', d);
    mutate('/api/finance/debts');
  };

  const addDebtPayment = async (debtId: string, amount: number, date: string = new Date().toISOString(), autoTransaction: boolean = true) => {
    await request(`/api/finance/debts/${debtId}/pay`, 'POST', { amount, date });
    mutate('/api/finance/debts');
    if (autoTransaction) {
        mutate(period ? `/api/finance/transactions?month=${period}` : '/api/finance/transactions');
    }
  };

  // Actions - Investments
  const addInvestment = async (inv: Omit<Investment, 'id'>) => {
    await request('/api/finance/investments', 'POST', inv);
    mutate('/api/finance/investments');
  };

  const updateInvestment = async (id: string, data: Partial<Investment>) => {
    await request(`/api/finance/investments/${id}`, 'PUT', data);
    mutate('/api/finance/investments');
  };

  const deleteInvestment = async (id: string) => {
    await request(`/api/finance/investments/${id}`, 'DELETE');
    mutate('/api/finance/investments');
  };

  return {
    transactions,
    budgets,
    savings,
    debts,
    investments,
    savingDeposits: [], // Handled via specific goal fetches if needed
    debtPayments: [],   // Handled via specific debt fetches if needed
    isLoading,
    error,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    addBudget,
    updateBudget,
    deleteBudget,
    addSavingGoal,
    addSavingContribution,
    addDebt,
    addDebtPayment,
    addInvestment,
    updateInvestment,
    deleteInvestment,
  };
}
