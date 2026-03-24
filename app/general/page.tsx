'use client';

import { useState, useEffect, useCallback } from 'react';
import SummaryCards from '@/components/SummaryCards';
import DonutChart from '@/components/DonutChart';
import BarChart from '@/components/BarChart';
import MonthSelector from '@/components/MonthSelector';
import { LayoutDashboard, RefreshCw } from 'lucide-react';

interface AccountSummary {
  sheet: string;
  label: string;
  total_ingresos: number;
  total_egresos: number;
  balance: number;
  byCategory: { categoria: string; total: number; count: number }[];
}

interface GlobalSummary {
  accounts: AccountSummary[];
  total_ingresos: number;
  total_egresos: number;
  balance: number;
}

const ACCOUNT_COLORS: Record<string, string> = {
  Empresa: 'border-indigo-500/30 bg-indigo-500/5',
  Familia: 'border-green-500/30 bg-green-500/5',
  Personal: 'border-orange-500/30 bg-orange-500/5',
};
const ACCOUNT_TEXT: Record<string, string> = {
  Empresa: 'text-indigo-400',
  Familia: 'text-green-400',
  Personal: 'text-orange-400',
};

function fmt(n: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n);
}

export default function GeneralPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [data, setData] = useState<GlobalSummary | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [summaryRes, histRes] = await Promise.all([
        fetch(`/api/summary?sheet=all&month=${month}&year=${year}`),
        fetch(`/api/summary?sheet=Empresa&history=true`),
      ]);
      const [summary, hist] = await Promise.all([summaryRes.json(), histRes.json()]);
      setData(summary);
      setHistory(hist.history || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Consolidate all categories
  const allCategories = data?.accounts.flatMap((a) => a.byCategory).reduce(
    (acc: Record<string, number>, c) => {
      acc[c.categoria] = (acc[c.categoria] || 0) + c.total;
      return acc;
    },
    {}
  );
  const categoryData = Object.entries(allCategories || {}).map(([categoria, total]) => ({ categoria, total }));

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="w-6 h-6 text-violet-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Vista General</h1>
            <p className="text-sm text-gray-500">Consolidado de todas las cuentas</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <MonthSelector month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y); }} />
          <button onClick={fetchData} className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Global Summary Cards */}
      <SummaryCards
        ingresos={data?.total_ingresos || 0}
        egresos={data?.total_egresos || 0}
        balance={data?.balance || 0}
      />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BarChart
          data={history}
          title="Historial Ingresos vs Egresos (6 meses)"
        />
        <DonutChart
          data={categoryData}
          title="Egresos por Categoría (Consolidado)"
        />
      </div>

      {/* Per-account breakdown */}
      <div>
        <h2 className="text-sm text-gray-400 font-semibold uppercase tracking-wider mb-4">Resumen por Cuenta</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(data?.accounts || []).map((acc) => (
            <div key={acc.sheet} className={`glass border p-5 ${ACCOUNT_COLORS[acc.label] || ''}`}>
              <p className={`text-sm font-bold mb-4 ${ACCOUNT_TEXT[acc.label] || 'text-gray-400'}`}>
                {acc.label}
              </p>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Ingresos</span>
                  <span className="text-emerald-400 font-mono">{fmt(acc.total_ingresos)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Egresos</span>
                  <span className="text-rose-400 font-mono">{fmt(acc.total_egresos)}</span>
                </div>
                <div className="border-t border-white/5 pt-2 flex justify-between text-sm font-semibold">
                  <span className="text-gray-400">Balance</span>
                  <span className={acc.balance >= 0 ? 'text-violet-400 font-mono' : 'text-amber-400 font-mono'}>
                    {fmt(acc.balance)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
