"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Briefcase,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCcw,
  BrainCircuit,
  PieChart as PieChartIcon,
  ChevronUp,
  Edit2,
  Trash2,
  FileUp,
  Loader2,
  TrendingUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { parseStockbitPdf, OpenPosition } from "@/lib/stockbit-parser";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  YAxis,
  XAxis,
  Tooltip
} from "recharts";
import { cn } from "@/lib/utils";
import { formatIDR } from "@/lib/finance-utils";
import { Investment } from "@/lib/finance-types";
import InvestmentModal from "./forms/InvestmentModal";
import ConfirmModal from "@/components/ui/ConfirmModal";

export interface InvestmentPortfolioProps {
  investments: Investment[];
  dict: any;
  lang: string;
  onUpdateValue: (id: string, value: number) => Promise<void>;
  onUpdate: (id: string, data: Partial<Investment>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onAdd: (investment: Omit<Investment, 'id'>) => Promise<void>;
}

export default function InvestmentPortfolio({ investments, dict, lang, onUpdateValue, onUpdate, onDelete, onAdd }: InvestmentPortfolioProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<Record<string, string>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | undefined>();
  const [isDelConfirmOpen, setIsDelConfirmOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importPreview, setImportPreview] = useState<OpenPosition[] | null>(null);
  const [importStatus, setImportStatus] = useState<string>("");
  const [stockDetails, setStockDetails] = useState<Record<string, any>>({});
  const [ihsgData, setIhsgData] = useState<{
    price: number | null;
    change: number | null;
    changePercent: number | null;
    chartData: any[];
  } | null>(null);

  const IHSG_SYMBOL = "^JKSE";

  // Auto refresh stock prices when tab opens
  useEffect(() => {
    fetchIhsg();
    if (investments.some(i => i.type === 'saham')) {
      refreshPrices();
    }
  }, []);

  const fetchIhsg = async () => {
    try {
      const res = await fetch(`/api/finance/stock-price?symbol=${IHSG_SYMBOL}&range=1mo&interval=1d`);
      const data = await res.json();
      if (data.price) {
        const prevClose = data.previousClose || data.price;
        const change = data.price - prevClose;
        const changePercent = (change / prevClose) * 100;
        setIhsgData({
          price: data.price,
          change,
          changePercent,
          chartData: data.chartData || []
        });
      }
    } catch (e) {
      console.error(dict.finance.investments.pdfError.replace('{error}', 'IHSG'), e);
    }
  };

  // Calculate totals
  const { totalInitial, totalCurrent, totalPnL, totalPnLPercent, allocationData } = useMemo(() => {
    const initial = investments.reduce((acc, i) => acc + i.initialAmount, 0);
    const current = investments.reduce((acc, i) => acc + i.currentValue, 0);
    const pnl = current - initial;
    const pnlPercent = initial > 0 ? (pnl / initial) * 100 : 0;

    // Allocation logic
    const types: Record<string, number> = {};
    investments.forEach(inv => {
      types[inv.type] = (types[inv.type] || 0) + inv.currentValue;
    });

    const alloc = Object.entries(types).map(([name, value]) => ({
      name: name.replace('_', ' ').toUpperCase(),
      value
    }));

    return {
      totalInitial: initial,
      totalCurrent: current,
      totalPnL: pnl,
      totalPnLPercent: pnlPercent,
      allocationData: alloc
    };
  }, [investments]);

  const COLORS = ['#18181b', '#3f3f46', '#71717a', '#a1a1aa', '#d4d4d8'];

  const handleOpenAdd = () => {
    setEditingInvestment(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (inv: Investment) => {
    setEditingInvestment(inv);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setIdToDelete(id);
    setIsDelConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (idToDelete) {
      await onDelete(idToDelete);
      setIdToDelete(null);
    }
  };

  const handleSave = async (data: Omit<Investment, 'id'>) => {
    if (editingInvestment) {
      await onUpdate(editingInvestment.id, data);
    } else {
      await onAdd(data);
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportStatus(dict.finance.investments.extracting);
    try {
      const positions = await parseStockbitPdf(file);
      if (positions.length === 0) {
        throw new Error(dict.finance.investments.pdfError.replace('{error}', 'NO_POSITIONS'));
      }
      setImportPreview(positions);
    } catch (err: any) {
      console.error("Stockbit Parser Error:", err);
      alert(`Gagal membaca PDF: ${err.message || "Pastikan ini adalah file 'Transaction History' dari Stockbit."}`);
    } finally {
      setIsImporting(false);
      setImportStatus("");
      // Reset input
      e.target.value = '';
    }
  };

  const confirmImport = async () => {
    if (!importPreview) return;
    setIsImporting(true);
    setImportStatus(dict.finance.investments.saving);
    try {
      for (const pos of importPreview) {
        // Fetch LIVE price before adding to ensure instant data
        let livePrice = pos.averagePrice;
        let chartData = null;
        
        try {
          const symbolJK = pos.symbol.includes('.') ? pos.symbol : `${pos.symbol}.JK`;
          const res = await fetch(`/api/finance/stock-price?symbol=${symbolJK}&range=1mo&interval=1d`);
          const data = await res.json();
          if (data.price) {
            livePrice = data.price;
            chartData = data.chartData;
          }
        } catch (e) {
          console.error(`Gagal ambil harga live untuk ${pos.symbol}`, e);
        }

        const newCurrentValue = livePrice * pos.totalLot * 100;
        
        await onAdd({
          name: pos.symbol,
          symbol: pos.symbol,
          type: 'saham',
          initialAmount: pos.modal,
          currentValue: newCurrentValue,
          buyDate: new Date().toISOString(),
          lots: pos.totalLot
        });

        // Set local stock details if we fetched them
        if (chartData) {
          // We don't have the ID yet (it's generated on server), 
          // but we can trigger a full refresh after a short delay
        }
      }
      setImportPreview(null);
      // Trigger a short delayed refresh to catch the new IDs and set chart data
      setTimeout(() => refreshPrices(), 1500);
    } catch (err) {
      console.error(err);
      alert(dict.finance.investments.importFailed);
    } finally {
      setIsImporting(false);
      setImportStatus("");
    }
  };

  const refreshPrices = async () => {
    setIsRefreshing(true);
    await fetchIhsg();
    for (const inv of investments) {
      if (inv.type === 'saham' && inv.symbol) {
        try {
          const symbolJK = inv.symbol.includes('.') ? inv.symbol : `${inv.symbol}.JK`;
          const res = await fetch(`/api/finance/stock-price?symbol=${symbolJK}&range=1mo&interval=1d`);
          const data = await res.json();

          if (data.price) {
            const newCurrentValue = data.price * (inv.lots || 0) * 100;
            await onUpdate(inv.id, {
              ...inv,
              currentValue: newCurrentValue
            });
            setStockDetails(prev => ({ ...prev, [inv.id]: data }));
          }
        } catch (e) {
          console.error(`Gagal refresh ${inv.symbol}`, e);
        }
      }
    }
    setIsRefreshing(false);
  };

  const analyzeAsset = async (inv: Investment) => {
    setAnalyzingId(inv.id);
    try {
      const pnlPercent = ((inv.currentValue - inv.initialAmount) / inv.initialAmount * 100).toFixed(2);
      const res = await fetch('/api/finance/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetData: {
            symbol: inv.symbol || inv.name,
            name: inv.name,
            buyPrice: inv.initialAmount / ((inv.lots || 1) * (inv.type === 'saham' ? 100 : 1)),
            currentPrice: inv.currentValue / ((inv.lots || 1) * (inv.type === 'saham' ? 100 : 1)),
            lots: inv.lots || 0,
            pnl: pnlPercent,
            buyDate: inv.buyDate
          }
        })
      });
      const result = await res.json();
      if (result.success && result.data) {
        setAnalysisResult(prev => ({ ...prev, [inv.id]: result.data }));
      }
    } catch (e) {
      console.error("AI Analysis failed", e);
    }
    setAnalyzingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Real-time IDX (IHSG) Index Header */}
      <div className="p-4 rounded-2xl bg-zinc-50 border border-slate-100 flex items-center justify-between gap-6 overflow-hidden relative group">
        <div className="flex items-center gap-4 z-10">
          <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center shrink-0">
             <TrendingUp size={20} className={cn(ihsgData?.change && ihsgData.change >= 0 ? "text-emerald-500" : "text-rose-500")} />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-[10px] font-black text-zinc-900 leading-none">IDX COMPOSITE (IHSG)</h3>
            <div className="flex items-baseline gap-2">
              <p className="text-sm font-black text-zinc-900 leading-none">{ihsgData?.price?.toLocaleString('id-ID') || '---'}</p>
              <p className={cn(
                "text-[9px] font-bold leading-none",
                ihsgData?.change && ihsgData.change >= 0 ? "text-emerald-500" : "text-rose-500"
              )}>
                {ihsgData?.change && ihsgData.change >= 0 ? '+' : ''}{ihsgData?.changePercent?.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 h-12 max-w-[500px] relative">
          {ihsgData?.chartData && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ihsgData.chartData}>
                <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke={ihsgData.change && ihsgData.change >= 0 ? "#10b981" : "#ef4444"} 
                    strokeWidth={2} 
                    dot={false}
                    isAnimationActive={true}
                    animationDuration={1500}
                />
                <YAxis hide domain={['auto', 'auto']} />
                <XAxis hide />
                <Tooltip 
                  content={({ active, payload }: any) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-zinc-900 text-white px-2 py-1 rounded-md text-[9px] font-black shadow-xl border border-zinc-700 animate-in fade-in zoom-in duration-200">
                          {payload[0].value?.toLocaleString('id-ID')}
                        </div>
                      );
                    }
                    return null;
                  }}
                  cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="hidden lg:flex items-center gap-1 opacity-20 group-hover:opacity-100 transition-opacity absolute right-4">
           <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{dict.finance.investments.marketState}</p>
           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </div>

      {/* Portfolio Header with Global Actions - ALWAYS VISIBLE */}
      <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6 overflow-hidden relative group">
        <div className="flex-1 space-y-4">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{dict.finance.investments.total}</p>
            <div className="flex items-baseline gap-2 leading-none">
              <h2 className="text-2xl font-black text-zinc-900">{formatIDR(totalCurrent)}</h2>
              <div className={cn(
                "flex items-center gap-0.5 text-[10px] font-black leading-none pb-0.5",
                totalPnL >= 0 ? "text-emerald-500" : "text-red-500"
              )}>
                {totalPnL >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownLeft size={10} />}
                {formatIDR(Math.abs(totalPnL))} ({totalPnLPercent.toFixed(2)}%)
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={refreshPrices}
              disabled={isRefreshing}
              className="flex items-center gap-2 h-9 px-4 rounded-xl bg-zinc-50 border border-slate-100 text-zinc-600 text-[10px] font-black hover:bg-white hover:border-zinc-300 transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCcw size={12} className={cn(isRefreshing && "animate-spin")} />
              {dict.finance.investments.refresh}
            </button>
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 h-9 px-4 rounded-xl bg-zinc-900 text-white text-[10px] font-black shadow-md hover:bg-zinc-800 transition-all active:scale-95"
            >
              <Plus size={12} />
              Tambah Aset
            </button>
            <div className="relative">
              <input
                type="file"
                accept=".pdf"
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                onChange={handlePdfUpload}
                disabled={isImporting}
              />
              <button
                className="flex items-center gap-2 h-9 px-4 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-black hover:bg-blue-600 hover:text-white transition-all active:scale-95 disabled:opacity-50"
              >
                {isImporting ? <Loader2 size={12} className="animate-spin" /> : <FileUp size={12} />}
                {isImporting ? importStatus : dict.finance.investments.importStockbit}
              </button>
            </div>
          </div>
        </div>

        {/* Allocation Pie Chart */}
        <div className="w-full md:w-32 lg:w-40 h-32 relative">
          {investments.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={45}
                  paddingAngle={5}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={1500}
                >
                  {allocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-slate-100 rounded-full">
              <PieChartIcon size={20} className="text-slate-200" />
            </div>
          )}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <PieChartIcon size={12} className="text-zinc-300 opacity-20" />
          </div>
        </div>
      </div>

      {investments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {investments.map((inv) => {
              const pnl = inv.currentValue - inv.initialAmount;
              const pnlPercent = inv.initialAmount > 0 ? (pnl / inv.initialAmount) * 100 : 0;
              const isProfit = pnl >= 0;

              return (
                <motion.div
                  key={inv.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-zinc-300 transition-all group overflow-hidden flex flex-col relative"
                >
                  <div className="p-5 flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-500 text-[8px] font-black uppercase tracking-tight">
                            {inv.type.replace('_', ' ')}
                          </span>
                          <h3 className="text-xs font-black text-zinc-900 leading-none">{inv.symbol || inv.name}</h3>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium truncate max-w-[180px]">{inv.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] font-black text-zinc-900 leading-none">{formatIDR(inv.currentValue)}</p>
                        <div className={cn(
                          "flex items-center justify-end gap-0.5 text-[9px] font-bold mt-1",
                          isProfit ? "text-emerald-500" : "text-red-500"
                        )}>
                          {isProfit ? <TrendingUp size={8} /> : <TrendingUp size={8} className="rotate-180" />}
                          {isProfit ? '+' : ''}{pnlPercent.toFixed(2)}%
                        </div>
                      </div>
                    </div>

                    {inv.type === 'saham' && stockDetails[inv.id]?.chartData && (
                      <div className="h-10 w-full mt-2 relative" style={{ minHeight: '40px', minWidth: '0px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={stockDetails[inv.id].chartData}>
                            <Tooltip
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  return (
                                    <div className="bg-zinc-900 px-2 py-1 rounded shadow-2xl border border-zinc-800 animate-in fade-in zoom-in-95 duration-200">
                                      <p className="text-[9px] font-black text-white tracking-tighter tabular-nums">
                                        {formatIDR(payload[0].value as number)}
                                      </p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                              cursor={{ stroke: isProfit ? "#10b981" : "#ef4444", strokeWidth: 1, strokeDasharray: '2 2' }}
                              isAnimationActive={false}
                            />
                            <Line
                              type="monotone"
                              dataKey="price"
                              stroke={isProfit ? "#10b981" : "#ef4444"}
                              strokeWidth={2}
                              dot={false}
                              isAnimationActive={false}
                            />
                            <YAxis hide domain={['auto', 'auto']} />
                            <XAxis hide />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                      <div className="space-y-0.5">
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{dict.finance.investments.modalAvg}</p>
                        <div className="flex items-baseline gap-1">
                          <p className="text-[10px] font-black text-zinc-900">{formatIDR(inv.initialAmount)}</p>
                          <p className="text-[8px] text-slate-400 font-bold">(@{formatIDR(inv.initialAmount / (inv.lots ? inv.lots * 100 : 1))})</p>
                        </div>
                      </div>
                      <div className="space-y-0.5 text-right">
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{dict.finance.investments.assetLive}</p>
                        <div className="flex items-baseline justify-end gap-1">
                          <p className="text-[10px] font-black text-zinc-900">{inv.lots ? `${inv.lots} Lot` : '-'}</p>
                          <p className="text-[8px] text-slate-400 font-bold">(@{formatIDR(inv.currentValue / (inv.lots ? inv.lots * 100 : 1))})</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1 px-5 pb-5">
                    <button
                      onClick={() => analyzeAsset(inv)}
                      disabled={analyzingId === inv.id}
                      className="flex-1 flex items-center justify-center gap-2 h-9 rounded-xl bg-violet-50 text-violet-700 text-[9px] font-black uppercase tracking-widest hover:bg-violet-600 hover:text-white transition-all active:scale-95 disabled:opacity-50"
                    >
                      <BrainCircuit size={12} className={analyzingId === inv.id ? "animate-pulse" : ""} />
                      {analyzingId === inv.id ? dict.finance.investments.analyzing : dict.finance.investments.analyzeAI}
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(inv)}
                        className="p-2 h-9 w-9 rounded-xl bg-zinc-50 text-slate-400 hover:text-zinc-800 hover:bg-white hover:border-zinc-300 border border-transparent transition-all active:scale-90 flex items-center justify-center"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(inv.id)}
                        className="p-2 h-9 w-9 rounded-xl bg-rose-50 text-rose-400 hover:text-rose-600 hover:bg-white hover:border-rose-300 border border-transparent transition-all active:scale-90 flex items-center justify-center"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* AI Analysis Result Panel */}
                  {analysisResult[inv.id] && (
                    <div className="bg-zinc-900 p-4 animate-in slide-in-from-top duration-500 relative">
                      <p className="text-[10px] text-zinc-400 font-bold mb-3 uppercase tracking-widest flex items-center gap-2">
                        <BrainCircuit size={10} className="text-violet-400" />
                        {dict.finance.investments.aiInsightTitle}
                      </p>
                      <p className="text-[10px] text-zinc-200 leading-relaxed font-medium whitespace-pre-line">
                        {analysisResult[inv.id]}
                      </p>
                      <div className="mt-4 pt-3 border-t border-zinc-800">
                        <p className="text-[8px] text-zinc-500 italic">{dict.finance.investments.aiDisclaimer}</p>
                      </div>
                      <button
                        onClick={() => setAnalysisResult(prev => {
                          const next = { ...prev };
                          delete next[inv.id];
                          return next;
                        })}
                        className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
                      >
                        <ChevronUp size={12} />
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className="py-20 flex flex-col items-center justify-center gap-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl">
          <div className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center text-slate-300">
            <Briefcase size={28} />
          </div>
          <div className="text-center space-y-2">
            <p className="text-[13px] font-black text-zinc-900">{dict.finance.investments.empty}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed px-10">{dict.finance.investments.emptySubtitle}</p>
            <p className="text-[9px] text-zinc-400 font-black italic">{dict.finance.investments.tip}</p>
          </div>
        </div>
      )}

      {isModalOpen && (
        <InvestmentModal 
          dict={dict}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          initialData={editingInvestment}
        />
      )}

      <ConfirmModal 
        isOpen={isDelConfirmOpen}
        onClose={() => setIsDelConfirmOpen(false)}
        onConfirm={confirmDelete}
        title={dict.finance.investments.deleteModalTitle || (lang === 'id' ? "Hapus Aset" : "Delete Asset")}
        message={dict.finance.investments.deleteConfirm || (lang === 'id' ? "Apakah Anda yakin ingin menghapus aset ini? Tindakan ini tidak dapat dibatalkan." : "Are you sure you want to delete this asset? This action cannot be undone.")}
        variant="danger"
      />

      {/* Import Preview Modal with Portal for true full-page blur */}
      {importPreview && typeof document !== 'undefined' && require('react-dom').createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-white/5 backdrop-blur-2xl transition-all duration-500">
          <div 
            className="fixed inset-0" 
            onClick={() => setImportPreview(null)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] relative z-10"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-zinc-50">
              <div>
                <h2 className="text-lg font-black text-zinc-900">{dict.finance.investments.previewTitle}</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                  {dict.finance.investments.previewMatch.replace('{count}', importPreview.length.toString())}
                </p>
              </div>
              <button
                onClick={() => setImportPreview(null)}
                className="p-2 rounded-xl hover:bg-white text-slate-400 hover:text-zinc-900 transition-all border border-transparent hover:border-slate-100"
              >
                <ChevronUp className="rotate-180" size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-200">
                  <TrendingUp size={16} />
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-blue-900 leading-none">{dict.finance.investments.fifoActive}</p>
                  <p className="text-[10px] text-blue-700 font-medium leading-relaxed">
                    {dict.finance.investments.fifoDesc}
                  </p>
                </div>
              </div>

              <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white">
                <table className="w-full text-left font-mono">
                  <thead className="bg-zinc-50 border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">{dict.finance.investments.table.symbol}</th>
                      <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">{dict.finance.investments.table.lot}</th>
                      <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">{dict.finance.investments.table.avg}</th>
                      <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">{dict.finance.investments.table.total}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {importPreview.map((pos) => (
                      <tr key={pos.symbol} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <span className="text-xs font-black text-zinc-900">{pos.symbol}</span>
                        </td>
                        <td className="px-4 py-3 text-center text-xs font-bold text-zinc-600">{pos.totalLot}</td>
                        <td className="px-4 py-3 text-right text-xs font-black text-zinc-900">{formatIDR(pos.averagePrice)}</td>
                        <td className="px-4 py-3 text-right text-xs font-black text-zinc-900">{formatIDR(pos.modal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-6 bg-zinc-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setImportPreview(null)}
                className="px-6 h-11 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-zinc-900 transition-all active:scale-95"
              >
                {dict.finance.investments.cancel}
              </button>
              <button
                onClick={confirmImport}
                disabled={isImporting}
                className="px-8 h-11 rounded-xl bg-zinc-900 text-white text-[11px] font-black uppercase tracking-widest shadow-xl shadow-zinc-200 hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3"
              >
                {isImporting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                {isImporting ? dict.finance.investments.importing : dict.finance.investments.confirmImport}
              </button>
            </div>
          </motion.div>
        </div>,
        document.body
      )}
    </div>
  );
}
