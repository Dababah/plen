"use client";

import React, { useMemo } from "react";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  TrendingUp, 
  Wallet, 
  Target, 
  Briefcase 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatIDR } from "@/lib/finance-utils";
import { FinanceState } from "@/lib/finance-types";

export interface FinanceOverviewProps {
  data: FinanceState;
  dict: any;
  selectedDate: Date;
}

export default function FinanceOverview({ data, dict, selectedDate }: FinanceOverviewProps) {
  const { 
    totalIncome, 
    totalExpense, 
    totalSavingsThisMonth, 
    remainingBudget,
    incomeTrend,
    expenseTrend,
    savingsTrend,
    budgetTrend,
    totalInvestmentValue
  } = useMemo(() => {
    const month = selectedDate.getMonth();
    const year = selectedDate.getFullYear();

    const isSameMonth = (dateStr: string) => {
      const d = new Date(dateStr);
      return d.getMonth() === month && d.getFullYear() === year;
    };

    const isLastMonth = (dateStr: string) => {
      const d = new Date(dateStr);
      const lastMonth = new Date(year, month - 1, 1);
      return d.getMonth() === lastMonth.getMonth() && d.getFullYear() === lastMonth.getFullYear();
    };

    // Current Month Totals
    const currentTransactions = data.transactions.filter(t => isSameMonth(t.date));
    const incomeThisMonth = currentTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expenseThisMonth = currentTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const savingsThisMonth = data.savingDeposits.filter(d => isSameMonth(d.date)).reduce((acc, d) => acc + d.amount, 0);
    
    // Last Month Totals for Trends
    const lastTransactions = data.transactions.filter(t => isLastMonth(t.date));
    const incomeLastMonth = lastTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expenseLastMonth = lastTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const savingsLastMonth = data.savingDeposits.filter(d => isLastMonth(d.date)).reduce((acc, d) => acc + d.amount, 0);

    // Budget Calculation
    // Rumus USER: 
    // - jika ada budgetCategories: sum(budget limits) - Total Pengeluaran
    // - jika tidak ada: Total Pemasukan - Total Pengeluaran
    const totalBudgetLimit = data.budgets.reduce((acc, b) => acc + b.budget, 0);
    
    const calculateRemBudget = (inc: number, exp: number, limit: number) => {
        if (limit > 0) return limit - exp;
        return inc - exp;
    };

    const remBudget = calculateRemBudget(incomeThisMonth, expenseThisMonth, totalBudgetLimit);
    const remBudgetLastMonth = calculateRemBudget(incomeLastMonth, expenseLastMonth, totalBudgetLimit);

    // Trend Calculation helper
    const getTrend = (curr: number, prev: number) => {
      if (prev === 0) return curr === 0 ? 0 : 100;
      return Math.round(((curr - prev) / prev) * 100);
    };

    return {
      totalIncome: incomeThisMonth,
      totalExpense: expenseThisMonth,
      totalSavingsThisMonth: savingsThisMonth,
      remainingBudget: remBudget,
      incomeTrend: getTrend(incomeThisMonth, incomeLastMonth),
      expenseTrend: getTrend(expenseThisMonth, expenseLastMonth),
      savingsTrend: getTrend(savingsThisMonth, savingsLastMonth),
      budgetTrend: getTrend(remBudget, remBudgetLastMonth),
      totalInvestmentValue: data.investments.reduce((acc, i) => acc + i.currentValue, 0)
    };
  }, [data, selectedDate]);

  const StatCard = ({ title, amount, trend, icon: Icon, color }: any) => (
    <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:border-zinc-300 hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className={cn("p-2 rounded-lg text-white shadow-sm", color)}>
          <Icon size={14} />
        </div>
        <div className={cn(
          "flex items-center gap-0.5 px-1.5 py-1 rounded-full text-[9px] font-black tracking-tight",
          trend >= 0 
            ? "text-emerald-600 bg-emerald-50" 
            : "text-red-500 bg-red-50"
        )}>
          {trend >= 0 ? <ArrowUpRight size={10} strokeWidth={3} /> : <ArrowDownLeft size={10} strokeWidth={3} />}
          {Math.abs(trend)}%
        </div>
      </div>
      <div className="space-y-0.5">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{title}</p>
        <p className={cn(
            "text-sm md:text-base font-black leading-none truncate",
            amount < 0 ? "text-red-600" : "text-zinc-900"
        )}>
          {amount < 0 ? '-' : ''}{formatIDR(Math.abs(amount))}
        </p>
        <p className="text-[9px] text-slate-300 font-bold uppercase tracking-tight pt-1">{dict.finance.overview.vsLastMonth}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title={dict.finance.overview.income}
          amount={totalIncome}
          trend={incomeTrend}
          icon={TrendingUp}
          color="bg-zinc-900"
        />
        <StatCard 
          title={dict.finance.overview.expense}
          amount={totalExpense}
          trend={expenseTrend}
          icon={ArrowDownLeft}
          color="bg-slate-200 !text-zinc-900"
        />
        <StatCard 
          title={dict.finance.overview.savings}
          amount={totalSavingsThisMonth}
          trend={savingsTrend}
          icon={Target}
          color="bg-zinc-900"
        />
        <StatCard 
          title={dict.finance.overview.budget}
          amount={remainingBudget}
          trend={budgetTrend}
          icon={Wallet}
          color="bg-zinc-900"
        />
      </div>

      {/* Portfolio Quick Look */}
      <div className="flex items-center justify-between p-3 px-5 rounded-2xl bg-zinc-50 border border-slate-100 group hover:border-zinc-300 transition-all">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-zinc-900 group-hover:scale-110 transition-transform">
            <Briefcase size={14} />
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{dict.finance.overview.investmentPortfolio}</p>
            <p className="text-xs font-black text-zinc-900 leading-none">{formatIDR(totalInvestmentValue)}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest">
           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
           {dict.finance.overview.marketActive}
        </div>
      </div>
    </div>
  );
}
