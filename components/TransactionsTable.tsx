'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import type { Transaction } from '@/lib/sheets';

interface TransactionsTableProps {
  transactions: Transaction[];
}

function fmt(n: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);
}

export default function TransactionsTable({ transactions }: TransactionsTableProps) {
  const [search, setSearch] = useState('');
  const [filterTipo, setFilterTipo] = useState<'ALL' | 'INGRESO' | 'EGRESO'>('ALL');

  const filtered = transactions.filter((tx) => {
    const matchSearch =
      !search ||
      tx.descripcion_clara.toLowerCase().includes(search.toLowerCase()) ||
      tx.beneficiario.toLowerCase().includes(search.toLowerCase()) ||
      tx.categoria.toLowerCase().includes(search.toLowerCase());
    const matchTipo = filterTipo === 'ALL' || tx.tipo === filterTipo;
    return matchSearch && matchTipo;
  });

  return (
    <div className="glass p-6">
      <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
        <p className="text-sm text-gray-400 font-semibold uppercase tracking-wider">
          Transacciones ({filtered.length})
        </p>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 w-48"
            />
          </div>
          {/* Filter */}
          <div className="flex rounded-lg overflow-hidden border border-white/10">
            {(['ALL', 'INGRESO', 'EGRESO'] as const).map((tipo) => (
              <button
                key={tipo}
                onClick={() => setFilterTipo(tipo)}
                className={`px-3 py-2 text-xs font-medium transition-all ${
                  filterTipo === tipo
                    ? 'bg-violet-600 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {tipo === 'ALL' ? 'Todos' : tipo === 'INGRESO' ? '↑ Ingresos' : '↓ Egresos'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              {['Fecha', 'Descripción', 'Categoría', 'Monto', 'Método'].map((h) => (
                <th key={h} className="text-left py-3 px-3 text-xs text-gray-500 uppercase tracking-wider font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-600">
                  Sin transacciones para mostrar
                </td>
              </tr>
            ) : (
              filtered.map((tx, i) => (
                <tr
                  key={i}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="py-3 px-3 text-gray-400 text-xs whitespace-nowrap">{tx.fecha}</td>
                  <td className="py-3 px-3">
                    <p className="text-gray-200 truncate max-w-xs">{tx.descripcion_clara || tx.descripcion_raw}</p>
                    {tx.beneficiario && (
                      <p className="text-xs text-gray-500 truncate">{tx.beneficiario}</p>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-1 rounded-md bg-white/5 text-gray-300 text-xs">
                      {tx.categoria}
                    </span>
                    {tx.sub_categoria && (
                      <span className="ml-1 px-2 py-1 rounded-md bg-white/5 text-gray-500 text-xs">
                        {tx.sub_categoria}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap font-mono font-semibold">
                    <span className={tx.tipo === 'INGRESO' ? 'text-emerald-400' : 'text-rose-400'}>
                      {tx.tipo === 'INGRESO' ? '+' : '-'}{fmt(tx.monto)}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-gray-500 text-xs">{tx.metodo}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
