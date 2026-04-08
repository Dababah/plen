"use client";

import React, { useMemo } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  PieChart, 
  Pie, 
  Legend 
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  ArrowUpRight, 
  ArrowDownLeft 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatIDR } from "@/lib/finance-utils";
import { Transaction, BudgetCategory } from "@/lib/finance-types";

interface FinanceChartsProps {
  transactions: Transaction[];
  budgets: BudgetCategory[];
  selectedDate: Date;
  dict: any;
}

export default function FinanceCharts({ transactions, budgets, selectedDate, dict }: FinanceChartsProps) {
  // 1. Data for Donut Chart (Spending per category this month)
  const { pieData, totalExpenseThisMonth } = useMemo(() => {
    const month = selectedDate.getMonth();
    const year = selectedDate.getFullYear();

    const filtered = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === month && d.getFullYear() === year && t.type === 'expense';
    });

    const expenseByCategory = filtered.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    const total = filtered.reduce((acc, t) => acc + t.amount, 0);

    const data = Object.entries(expenseByCategory).map(([name, value]) => ({
      name,
      value,
      color: budgets.find(b => b.name === name)?.color || '#94a3b8'
    })).sort((a, b) => b.value - a.value);

    return { pieData: data, totalExpenseThisMonth: total };
  }, [transactions, budgets, selectedDate]);

  // 2. Data for Bar Chart (Trend 6 months based on selectedDate)
  const { trendData, avgExpense, peakMonth } = useMemo(() => {
    const data = [];
    const idMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const enMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthNames = dict.lang === 'id' ? idMonths : enMonths;
    
    let totalExp6Months = 0;
    let maxExp = -1;
    let maxMonthName = '';

    for (let i = 5; i >= 0; i--) {
        const d = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - i, 1);
        const m = d.getMonth();
        const y = d.getFullYear();

        const periodTransactions = transactions.filter(t => {
            const td = new Date(t.date);
            return td.getMonth() === m && td.getFullYear() === y;
        });

        const inc = periodTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        const exp = periodTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

        if (exp > maxExp) {
            maxExp = exp;
            maxMonthName = monthNames[m];
        }
        totalExp6Months += exp;

        data.push({
            name: monthNames[m],
            income: inc,
            expense: exp,
            fullMonthName: `${monthNames[m]} ${y}`
        });
    }

    return { 
        trendData: data, 
        avgExpense: totalExp6Months / 6,
        peakMonth: maxMonthName
    };
  }, [transactions, selectedDate]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl shadow-2xl scale-95 origin-bottom">
          <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1.5">{label}</p>
          <div className="space-y-1">
            {payload.map((p: any, i: number) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color || p.fill }} />
                <p className="text-[10px] font-black text-white">{formatIDR(p.value)}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Donut Chart Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm flex flex-col">
        <div className="flex items-center justify-between mb-8">
           <div className="space-y-1">
              <h3 className="text-xs font-black text-zinc-900 uppercase tracking-tight">{dict.finance.charts.expenseByCategory}</h3>
              <p className="text-[9px] text-slate-400 font-medium">{dict.finance.charts.currentMonth}</p>
           </div>
           <div className="w-20 h-20 shrink-0">
             <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <PieChart>
                   <Pie
                      data={pieData}
                      innerRadius={30}
                      outerRadius={45}
                      paddingAngle={5}
                      dataKey="value"
                      animationDuration={1000}
                   >
                      {pieData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                   </Pie>
                </PieChart>
             </ResponsiveContainer>
           </div>
        </div>

        <div className="flex-1 space-y-4">
           {pieData.slice(0, 5).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between group">
                 <div className="flex items-center gap-3">
                    <div className="w-1 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <p className="text-[11px] font-bold text-zinc-900 group-hover:text-zinc-600 transition-colors">{item.name}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-[11px] font-black text-zinc-900">{formatIDR(item.value)}</p>
                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-0.5">
                        {totalExpenseThisMonth > 0 ? Math.round((item.value / totalExpenseThisMonth) * 100) : 0}%
                    </p>
                 </div>
              </div>
           ))}
           {pieData.length === 0 && (
             <div className="py-10 text-center flex flex-col items-center gap-2 opacity-20">
                <ArrowDownLeft size={20} />
                <p className="text-[10px] font-bold">{dict.finance.transactions.empty}</p>
             </div>
           )}
        </div>
      </div>

      {/* Bar Chart Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-8">
           <div className="space-y-1">
              <h3 className="text-xs font-black text-zinc-900 uppercase tracking-tight">{dict.finance.charts.cashFlowTrend}</h3>
              <p className="text-[9px] text-slate-400 font-medium">{dict.finance.charts.last6Months}</p>
           </div>
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                 <div className="w-2 h-2 rounded bg-zinc-900" />
                 <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">In</p>
              </div>
              <div className="flex items-center gap-1.5">
                 <div className="w-2 h-2 rounded bg-slate-200" />
                 <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Out</p>
              </div>
           </div>
        </div>

        <div className="h-[200px] w-full">
           <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={trendData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                 <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} 
                    dy={10}
                 />
                 <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 8, fontWeight: 700, fill: '#cbd5e1' }} 
                 />
                 <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                 <Bar dataKey="income" fill="#18181b" radius={[4, 4, 0, 0]} barSize={12} animationDuration={1500} />
                 <Bar dataKey="expense" fill="#e2e8f0" radius={[4, 4, 0, 0]} barSize={12} animationDuration={1500} />
              </BarChart>
           </ResponsiveContainer>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
           <div className="space-y-1">
              <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest leading-none">{dict.finance.charts.averageExpense}</p>
              <p className="text-xs font-black text-zinc-900 leading-none">{formatIDR(avgExpense)}</p>
           </div>
           <div className="flex items-center gap-1.5">
              <div className="p-1 rounded bg-red-50 text-red-500">
                 <TrendingUp size={10} />
              </div>
              <div className="space-y-0.5">
                 <p className="text-[8px] font-bold text-slate-400 leading-none">{dict.finance.charts.peak} (Exp)</p>
                 <p className="text-[9px] font-black text-zinc-900 leading-none">{peakMonth}</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
