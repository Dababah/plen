"use client";

import React, { useMemo, useState } from "react";
import { 
  Plus, 
  AlertCircle, 
  Wallet,
  Trash2,
  Edit3,
  Home,
  Utensils,
  Coffee,
  Car,
  ShoppingBag,
  Smartphone,
  Heart,
  Zap,
  Gift
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatIDR, getProgressBarColor } from "@/lib/finance-utils";
import { BudgetCategory, Transaction } from "@/lib/finance-types";
import BudgetModal from "./forms/BudgetModal";
import ConfirmModal from "@/components/ui/ConfirmModal";

const ICON_MAP: Record<string, React.ElementType> = {
  Wallet,
  Home,
  Utensils,
  Coffee,
  Car,
  ShoppingBag,
  Smartphone,
  Heart,
  Zap,
  Gift,
};

export interface BudgetManagerProps {
  budgets: BudgetCategory[];
  transactions: Transaction[];
  selectedDate: Date;
  dict: any;
  onAdd: (budget: Omit<BudgetCategory, 'id'>) => Promise<void>;
  onUpdate: (id: string, budget: Omit<BudgetCategory, 'id'>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function BudgetManager({ 
  budgets, 
  transactions, 
  selectedDate, 
  dict,
  onAdd, 
  onUpdate, 
  onDelete 
}: BudgetManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetCategory | undefined>(undefined);
  const [isDelConfirmOpen, setIsDelConfirmOpen] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState<BudgetCategory | null>(null);
  
  const budgetData = useMemo(() => {
    const month = selectedDate.getMonth();
    const year = selectedDate.getFullYear();

    return budgets.map(budget => {
      const spent = transactions
        .filter(t => 
            t.type === 'expense' && 
            t.category.toLowerCase() === budget.name.toLowerCase() &&
            new Date(t.date).getMonth() === month &&
            new Date(t.date).getFullYear() === year
        )
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        ...budget,
        spent,
        remaining: budget.budget - spent,
        percentage: (spent / budget.budget) * 100
      };
    });
  }, [budgets, transactions, selectedDate]);

  const handleOpenAdd = () => {
    setEditingBudget(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: BudgetCategory) => {
    setEditingBudget(b);
    setIsModalOpen(true);
  };

  const handleSave = async (data: Omit<BudgetCategory, "id">) => {
    if (editingBudget) {
      await onUpdate(editingBudget.id, data);
    } else {
      await onAdd(data);
    }
  };

  const handleDeleteClick = (budget: BudgetCategory) => {
    setBudgetToDelete(budget);
    setIsDelConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (budgetToDelete) {
      await onDelete(budgetToDelete.id);
      setBudgetToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
           <h2 className="text-xl font-black text-zinc-900 leading-none">{dict.finance.budgetManager.title}</h2>
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">{dict.finance.budgetManager.subtitle}</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 h-8 px-4 rounded-xl bg-zinc-900 text-white text-[10px] font-bold shadow-md hover:bg-zinc-800 transition-all active:scale-95 shrink-0"
        >
          <Plus size={14} />
          {dict.finance.budgetManager.add}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {budgetData.map((budget) => (
          <div key={budget.id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4 hover:border-zinc-300 transition-all group relative overflow-hidden">
             <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                   <div 
                     className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm"
                     style={{ backgroundColor: budget.color }}
                   >
                      {React.createElement(ICON_MAP[budget.icon as keyof typeof ICON_MAP] || Wallet, { size: 14 })}
                   </div>
                   <div>
                      <h3 className="text-xs font-black text-zinc-900 leading-none">{budget.name}</h3>
                      <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tight">{dict.finance.budgetManager.limit} {formatIDR(budget.budget)}</p>
                   </div>
                </div>
                <div className="flex items-center gap-1 scale-0 group-hover:scale-100 transition-transform origin-right">
                   <button 
                     onClick={() => handleOpenEdit(budget)}
                     className="p-1.5 rounded-lg hover:bg-zinc-100 text-slate-400 hover:text-zinc-900 transition-all"
                   >
                     <Edit3 size={12} />
                   </button>
                    <button 
                      onClick={() => handleDeleteClick(budget)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                </div>
             </div>

             <div className="space-y-2">
                <div className="flex justify-between items-end">
                   <span className={cn(
                     "text-[10px] font-black",
                     budget.percentage >= 100 ? "text-red-600" : budget.percentage >= 75 ? "text-amber-600" : "text-emerald-600"
                   )}>
                      {dict.finance.budgetManager.spent} {formatIDR(budget.spent)}
                   </span>
                   <span className="text-[9px] font-bold text-slate-300">{Math.round(budget.percentage)}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                   <div 
                     className={cn("h-full transition-all duration-1000", getProgressBarColor(budget.percentage))}
                     style={{ width: `${Math.min(100, budget.percentage)}%` }}
                   />
                </div>
             </div>

             <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-widest pt-2 border-t border-slate-50">
                <span className="text-slate-400">{dict.finance.budgetManager.remaining}</span>
                <span className={cn(budget.remaining < 0 ? "text-red-500" : "text-zinc-900")}>
                   {formatIDR(Math.abs(budget.remaining))} {budget.remaining < 0 ? dict.finance.budgetManager.over : ''}
                 </span>
             </div>

             {budget.percentage >= 100 && (
                <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-50 text-red-600 text-[8px] font-black uppercase">
                   <AlertCircle size={10} /> {dict.finance.budgetManager.over}
                </div>
             )}
          </div>
        ))}

        {budgetData.length === 0 && (
           <div className="col-span-full py-16 flex flex-col items-center justify-center gap-3 border border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
              <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-300">
                 <Wallet size={24} />
              </div>
              <div className="text-center space-y-1">
                 <p className="text-[11px] font-black text-zinc-900">{dict.finance.budgetManager.empty}</p>
                 <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{dict.finance.budgetManager.emptySubtitle}</p>
              </div>
              <button 
                onClick={handleOpenAdd}
                className="mt-4 flex items-center gap-2 h-9 px-6 rounded-xl bg-zinc-900 text-white text-[10px] font-black shadow-lg hover:bg-zinc-800 transition-all active:scale-95"
              >
                {dict.finance.budgetManager.firstBudget}
              </button>
           </div>
        )}
      </div>

      {isModalOpen && (
        <BudgetModal 
          dict={dict}
          initialData={editingBudget}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}

      <ConfirmModal
        isOpen={isDelConfirmOpen}
        onClose={() => setIsDelConfirmOpen(false)}
        onConfirm={confirmDelete}
        title={dict.finance.budgetManager.deleteModalTitle || (selectedDate.toLocaleString(dict.lang === 'id' ? 'id-ID' : 'en-US', { month: 'long' }) + " Budget")}
        message={budgetToDelete ? dict.finance.budgetManager.deleteConfirm.replace('{name}', budgetToDelete.name) : ""}
        variant="danger"
      />
    </div>
  );
}
