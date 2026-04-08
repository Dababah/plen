"use client";

import React, { useState } from "react";
import { 
  Wallet, 
  Target, 
  CreditCard, 
  Briefcase,
  BarChart2,
  LayoutDashboard,
  History as HistoryIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useFinanceData } from "@/hooks/use-finance-data";

import FinanceOverview from "./FinanceOverview";
import TransactionManager from "./TransactionManager";
import BudgetManager from "./BudgetManager";
import SavingsTracker from "./SavingsTracker";
import DebtManager from "./DebtManager";
import InvestmentPortfolio from "./InvestmentPortfolio";
import FinanceCharts from "./FinanceCharts";
import MonthSelector from "./MonthSelector";

type Tab = 'summary' | 'transactions' | 'budget' | 'savings' | 'debts' | 'investments' | 'analytics';

export default function FinanceView({ lang, dict }: { lang: string, dict: any }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  // Get initial tab from URL or default to summary
  const currentTab = (searchParams.get('tab') as Tab) || 'summary';
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleTabChange = (tab: Tab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };
  
  const activeTab = currentTab;
  
  const { 
    transactions, 
    budgets, 
    savings, 
    debts, 
    investments, 
    savingDeposits,
    debtPayments,
    isLoading,
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
  } = useFinanceData();

  const isStateEmpty = !isLoading && 
                       transactions.length === 0 && 
                       budgets.length === 0 && 
                       savings.length === 0 && 
                       debts.length === 0 && 
                       investments.length === 0;



  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'summary', label: dict.finance.tabs.summary, icon: LayoutDashboard },
    { id: 'transactions', label: dict.finance.tabs.transactions, icon: HistoryIcon },
    { id: 'budget', label: dict.finance.tabs.budget, icon: Wallet },
    { id: 'savings', label: dict.finance.tabs.savings, icon: Target },
    { id: 'debts', label: dict.finance.tabs.debts, icon: CreditCard },
    { id: 'investments', label: dict.finance.tabs.investments, icon: Briefcase },
    { id: 'analytics', label: dict.finance.tabs.analytics, icon: BarChart2 },
  ];

  if (isLoading) return (
    <div className="p-20 flex flex-col items-center justify-center gap-4 animate-in fade-in duration-700">
      <div className="w-12 h-12 rounded-full border-2 border-zinc-900 border-t-transparent animate-spin" />
      <p className="text-[10px] font-black text-zinc-900 uppercase tracking-widest">{dict.finance.loading}</p>
    </div>
  );

  return (
    <div className="space-y-6 pb-20 overflow-y-auto no-scrollbar h-full px-1">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-zinc-900 leading-none mb-1">
            {dict.finance.title}
          </h1>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">{dict.finance.subtitle}</p>
        </div>
        
        {/* Month & Example Picker */}
        <div className="flex items-center gap-3">

            <MonthSelector 
                selectedDate={selectedDate} 
                onChange={setSelectedDate} 
            />
        </div>
      </div>

      {/* Modern Tabs */}
      <div className="flex items-center gap-1 p-1 bg-zinc-50 border border-slate-100 rounded-xl overflow-x-auto scrollbar-hide no-scrollbar sticky top-0 z-20 backdrop-blur-md bg-white/80">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black transition-all whitespace-nowrap uppercase tracking-widest",
              activeTab === tab.id 
                ? "bg-zinc-900 text-white shadow-lg shadow-zinc-200" 
                : "text-slate-400 hover:text-zinc-900 hover:bg-white border border-transparent hover:border-slate-100"
            )}
          >
            <tab.icon size={13} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dynamic Tab Content */}
      <div className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
        {activeTab === 'summary' && (
          <div className="space-y-6">
            <FinanceOverview 
                data={{ transactions, budgets, savings, debts, investments, savingDeposits, debtPayments }} 
                dict={dict} 
                selectedDate={selectedDate}
            />
            <FinanceCharts transactions={transactions} budgets={budgets} selectedDate={selectedDate} dict={dict} />
          </div>
        )}
        {activeTab === 'transactions' && (
          <TransactionManager 
            lang={lang}
            transactions={transactions} 
            budgets={budgets}
            dict={dict} 
            selectedDate={selectedDate}
            onAdd={addTransaction} 
            onDelete={deleteTransaction}
            onUpdate={updateTransaction}
          />
        )}
        {activeTab === 'budget' && (
          <BudgetManager 
            budgets={budgets} 
            transactions={transactions} 
            selectedDate={selectedDate}
            dict={dict}
            onAdd={addBudget} 
            onUpdate={updateBudget}
            onDelete={deleteBudget}
          />
        )}
        {activeTab === 'savings' && (
          <SavingsTracker 
            savings={savings} 
            selectedDate={selectedDate}
            dict={dict}
            onAdd={addSavingGoal} 
            onContribute={addSavingContribution} 
          />
        )}
        {activeTab === 'debts' && (
          <DebtManager 
            debts={debts} 
            selectedDate={selectedDate}
            dict={dict}
            onAdd={addDebt} 
            onPay={addDebtPayment}
          />
        )}
        {activeTab === 'investments' && (
          <InvestmentPortfolio 
            investments={investments} 
            dict={dict}
            lang={lang}
            onUpdate={updateInvestment}
            onDelete={deleteInvestment}
            onUpdateValue={async (id: string, value: number) => updateInvestment(id, { currentValue: value })}
            onAdd={addInvestment}
          />
        )}
        {activeTab === 'analytics' && (
          <FinanceCharts transactions={transactions} budgets={budgets} selectedDate={selectedDate} dict={dict} />
        )}
      </div>
    </div>
  );
}
