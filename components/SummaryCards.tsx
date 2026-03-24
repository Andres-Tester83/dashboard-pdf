'use client';

import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

interface SummaryCardsProps {
  ingresos: number;
  egresos: number;
  balance: number;
  moneda?: string;
  label?: string;
}

function fmt(n: number, moneda = 'MXN') {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: moneda,
    minimumFractionDigits: 2,
  }).format(n);
}

export default function SummaryCards({ ingresos, egresos, balance, moneda = 'MXN' }: SummaryCardsProps) {
  const cards = [
    {
      label: 'Total Ingresos',
      value: fmt(ingresos, moneda),
      icon: TrendingUp,
      color: 'text-emerald-400',
      bg: 'from-emerald-500/10 to-emerald-600/5',
      border: 'border-emerald-500/20',
      glow: 'shadow-emerald-900/20',
    },
    {
      label: 'Total Egresos',
      value: fmt(egresos, moneda),
      icon: TrendingDown,
      color: 'text-rose-400',
      bg: 'from-rose-500/10 to-rose-600/5',
      border: 'border-rose-500/20',
      glow: 'shadow-rose-900/20',
    },
    {
      label: 'Balance',
      value: fmt(balance, moneda),
      icon: Wallet,
      color: balance >= 0 ? 'text-violet-400' : 'text-amber-400',
      bg: balance >= 0 ? 'from-violet-500/10 to-violet-600/5' : 'from-amber-500/10 to-amber-600/5',
      border: balance >= 0 ? 'border-violet-500/20' : 'border-amber-500/20',
      glow: balance >= 0 ? 'shadow-violet-900/20' : 'shadow-amber-900/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map(({ label, value, icon: Icon, color, bg, border, glow }) => (
        <div
          key={label}
          className={`glass bg-gradient-to-br ${bg} border ${border} shadow-xl ${glow} p-6 fade-in`}
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs uppercase tracking-widest text-gray-400 font-medium">{label}</p>
            <div className={`w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
          </div>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
      ))}
    </div>
  );
}
