'use client';

import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface BarDataPoint {
  label: string;
  ingresos: number;
  egresos: number;
}

interface BarChartProps {
  data: BarDataPoint[];
  title?: string;
}

function fmt(n: number) {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n}`;
}

export default function BarChart({ data, title = 'Ingresos vs Egresos' }: BarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="glass p-6">
        <p className="text-sm text-gray-400 font-semibold mb-4">{title}</p>
        <div className="flex items-center justify-center h-48 text-gray-600 text-sm">Sin datos</div>
      </div>
    );
  }

  const chartData = {
    labels: data.map((d) => d.label),
    datasets: [
      {
        label: 'Ingresos',
        data: data.map((d) => d.ingresos),
        backgroundColor: 'rgba(34,197,94,0.7)',
        borderRadius: 8,
        borderSkipped: false,
      },
      {
        label: 'Egresos',
        data: data.map((d) => d.egresos),
        backgroundColor: 'rgba(244,63,94,0.7)',
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#9ca3af',
          usePointStyle: true,
          pointStyle: 'circle',
          font: { size: 11 },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15,15,30,0.95)',
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (ctx: any) => ` ${ctx.dataset.label}: ${fmt(ctx.raw)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.03)' },
        ticks: { color: '#6b7280', font: { size: 11 } },
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: {
          color: '#6b7280',
          font: { size: 11 },
          callback: (v: any) => fmt(v),
        },
      },
    },
  };

  return (
    <div className="glass p-6">
      <p className="text-sm text-gray-400 font-semibold uppercase tracking-wider mb-5">{title}</p>
      <div className="h-56">
        <Bar data={chartData} options={options as any} />
      </div>
    </div>
  );
}
