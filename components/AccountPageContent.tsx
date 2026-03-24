'use client';

import { useState, useEffect, useCallback } from 'react';
import SummaryCards from '@/components/SummaryCards';
import DonutChart from '@/components/DonutChart';
import BarChart from '@/components/BarChart';
import TransactionsTable from '@/components/TransactionsTable';
import MonthSelector from '@/components/MonthSelector';
import { RefreshCw } from 'lucide-react';
import type { Transaction } from '@/lib/sheets';

interface AccountPageProps {
  sheet: string;
  label: string;
  icon: React.ReactNode;
  accentColor: string;
}

interface Summary {
  total_ingresos: number;
  total_egresos: number;
  balance: number;
  byCategory: { categoria: string; total: number }[];
}

export default function AccountPageContent({ sheet, label, icon, accentColor }: AccountPageProps) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [summary, setSummary] = useState<Summary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [sumRes, txRes, histRes] = await Promise.all([
        fetch(`/api/summary?sheet=${sheet}&month=${month}&year=${year}`),
        fetch(`/api/transactions?sheet=${sheet}&month=${month}&year=${year}`),
        fetch(`/api/summary?sheet=${sheet}&history=true`),
      ]);
      const [sum, tx, hist] = await Promise.all([sumRes.json(), txRes.json(), histRes.json()]);
      setSummary(sum);
      setTransactions(tx.transactions || []);
      setHistory(hist.history || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [sheet, month, year]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className={`text-2xl`}>{icon}</div>
          <div>
            <h1 className={`text-2xl font-bold ${accentColor}`}>{label}</h1>
            <p className="text-sm text-gray-500">Estado de cuenta — {month}/{year}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <MonthSelector month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y); }} />
          <button onClick={fetchData} className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <SummaryCards
        ingresos={summary?.total_ingresos || 0}
        egresos={summary?.total_egresos || 0}
        balance={summary?.balance || 0}
      />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BarChart data={history} title="Historial 6 Meses" />
        <DonutChart data={summary?.byCategory || []} title="Egresos por Categoría" />
      </div>

      {/* Transactions */}
      <TransactionsTable transactions={transactions} />
    </div>
  );
}
