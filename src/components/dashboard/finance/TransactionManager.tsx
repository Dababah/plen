"use client";

import React, { useMemo, useState } from "react";
import { 
  Search, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Calendar,
  Trash2,
  Edit2,
  Inbox
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatIDR } from "@/lib/finance-utils";
import { Transaction, BudgetCategory } from "@/lib/finance-types";
import TransactionModal from "./forms/TransactionModal";
import ConfirmModal from "@/components/ui/ConfirmModal";

export interface TransactionManagerProps {
  transactions: Transaction[];
  budgets: BudgetCategory[];
  dict: any;
  lang: string;
  selectedDate: Date;
  onAdd: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onUpdate: (id: string, updates: Partial<Transaction>) => Promise<void>;
}

export default function TransactionManager({ 
  transactions, 
  budgets,
  dict, 
  lang,
  selectedDate, 
  onAdd, 
  onDelete, 
  onUpdate 
}: TransactionManagerProps) {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);
  const [isDelConfirmOpen, setIsDelConfirmOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<string | null>(null);

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || 
                             t.category.toLowerCase().includes(search.toLowerCase());
        return matchesSearch;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, search]);

  const handleOpenAdd = () => {
    setEditingTransaction(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: Transaction) => {
    setEditingTransaction(t);
    setIsModalOpen(true);
  };

  const handleSave = async (data: Omit<Transaction, "id">) => {
    if (editingTransaction) {
      await onUpdate(editingTransaction.id, data);
    } else {
      await onAdd(data);
    }
  };

  const handleDeleteClick = (id: string) => {
    setIdToDelete(id);
    setIsDelConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (idToDelete) {
      await onDelete(idToDelete);
      setIdToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input 
            type="text"
            placeholder={dict.finance.transactions.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-white border border-slate-100 text-[11px] focus:outline-none focus:ring-2 focus:ring-zinc-900/5 transition-all"
          />
        </div>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 h-10 px-4 rounded-xl bg-zinc-900 text-white text-[10px] font-bold shadow-md hover:bg-zinc-800 transition-all active:scale-95 shrink-0"
        >
          <Plus size={14} />
          {dict.finance.transactions.addBtn}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{dict.finance.transactions.table.txn}</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{dict.finance.transactions.table.category}</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{dict.finance.transactions.table.date}</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none text-right">{dict.finance.transactions.table.amount}</th>
                <th className="px-6 py-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTransactions.map((t) => (
                <tr key={t.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                        t.type === 'income' ? "bg-emerald-50 text-emerald-600" : "bg-zinc-100 text-zinc-900"
                      )}>
                        {t.type === 'income' ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                      </div>
                      <span className="text-[11px] font-black text-zinc-900 leading-none">{t.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-500 text-[9px] font-bold uppercase tracking-tight">
                      {t.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Calendar size={12} />
                      <span className="text-[10px] font-bold">{new Date(t.date).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={cn(
                      "text-[11px] font-black leading-none",
                      t.type === 'income' ? "text-emerald-600" : "text-zinc-900"
                    )}>
                      {t.type === 'income' ? '+' : '-'}{formatIDR(t.amount)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button 
                         onClick={() => handleOpenEdit(t)}
                         className="p-1.5 rounded-lg hover:bg-zinc-100 text-slate-400 hover:text-zinc-900 transition-all"
                       >
                         <Edit2 size={12} />
                       </button>
                        <button 
                          onClick={() => handleDeleteClick(t.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"
                        >
                          <Trash2 size={12} />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredTransactions.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-center">
               <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                  <Inbox size={24} />
               </div>
               <div className="space-y-1">
                  <p className="text-[11px] font-black text-zinc-900">{dict.finance.transactions.empty}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{dict.finance.transactions.emptySubtitle}</p>
               </div>
               <button 
                 onClick={handleOpenAdd}
                 className="mt-4 px-4 py-2 rounded-xl border border-slate-200 text-[10px] font-black uppercase tracking-widest hover:border-zinc-900 transition-all"
               >
                 {dict.finance.transactions.addNow}
               </button>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <TransactionModal 
          dict={dict}
          lang={lang}
          budgets={budgets}
          initialData={editingTransaction}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}

      <ConfirmModal
        isOpen={isDelConfirmOpen}
        onClose={() => setIsDelConfirmOpen(false)}
        onConfirm={confirmDelete}
        title={dict.finance.transactions.deleteModalTitle || (lang === 'id' ? "Hapus Transaksi" : "Delete Transaction")}
        message={dict.finance.transactions.deleteConfirm || (lang === 'id' ? "Apakah Anda yakin ingin menghapus transaksi ini?" : "Are you sure you want to delete this transaction?")}
        variant="danger"
      />
    </div>
  );
}
