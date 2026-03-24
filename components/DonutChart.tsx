'use client';

import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const PALETTE = [
  '#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd',
  '#22c55e', '#16a34a', '#4ade80', '#86efac',
  '#f97316', '#ea580c', '#fb923c', '#fdba74',
  '#06b6d4', '#0891b2', '#67e8f9', '#a5f3fc',
  '#f43f5e', '#e11d48', '#fb7185', '#fda4af',
];

interface CategoryData {
  categoria: string;
  total: number;
}

interface DonutChartProps {
  data: CategoryData[];
  title?: string;
  moneda?: string;
}

function fmt(n: number) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(n);
}

export default function DonutChart({ data, title = 'Por Categoría' }: DonutChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="glass p-6">
        <p className="text-sm text-gray-400 font-semibold mb-4">{title}</p>
        <div className="flex items-center justify-center h-48 text-gray-600 text-sm">Sin datos</div>
      </div>
    );
  }

  const sorted = [...data].sort((a, b) => b.total - a.total).slice(0, 10);

  const chartData = {
    labels: sorted.map((d) => d.categoria),
    datasets: [
      {
        data: sorted.map((d) => d.total),
        backgroundColor: PALETTE.slice(0, sorted.length),
        borderColor: 'rgba(0,0,0,0)',
        borderWidth: 0,
        hoverOffset: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: '72%',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) => ` ${ctx.label}: ${fmt(ctx.raw)}`,
        },
        backgroundColor: 'rgba(15,15,30,0.95)',
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        padding: 10,
      },
    },
  };

  return (
    <div className="glass p-6">
      <p className="text-sm text-gray-400 font-semibold uppercase tracking-wider mb-5">{title}</p>
      <div className="flex gap-6">
        <div className="w-40 h-40 shrink-0 relative">
          <Doughnut data={chartData} options={options as any} />
        </div>
        <div className="flex-1 space-y-2 overflow-auto max-h-44">
          {sorted.map((d, i) => (
            <div key={d.categoria} className="flex items-center gap-2 text-xs">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: PALETTE[i] }}
              />
              <span className="text-gray-300 truncate flex-1">{d.categoria}</span>
              <span className="text-gray-400 font-mono">{fmt(d.total)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
