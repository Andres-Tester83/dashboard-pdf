'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Users,
  User,
  TrendingUp,
  Upload,
} from 'lucide-react';
import PdfUploader from './PdfUploader';
import { useState } from 'react';

const navItems = [
  { href: '/general',  label: 'General',  icon: LayoutDashboard, color: 'text-violet-400' },
  { href: '/empresa',  label: 'Empresa',  icon: Building2,       color: 'text-indigo-400' },
  { href: '/familia',  label: 'Familia',  icon: Users,           color: 'text-green-400'  },
  { href: '/personal', label: 'Personal', icon: User,            color: 'text-orange-400' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [showUploader, setShowUploader] = useState(false);

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-gray-900/80 backdrop-blur-xl border-r border-white/5 flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center pulse-glow">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-sm">FintechHood</p>
            <p className="text-xs text-gray-500">Dashboard Financiero</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon, color }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                active
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? color : 'group-hover:' + color}`} />
              <span className="text-sm font-medium">{label}</span>
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Upload Button */}
      <div className="p-4 border-t border-white/5">
        <button
          onClick={() => setShowUploader(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-semibold transition-all duration-200 shadow-lg shadow-violet-900/30 hover:shadow-violet-700/40"
        >
          <Upload className="w-4 h-4" />
          Subir Estado de Cuenta
        </button>
      </div>

      {/* PDF Uploader Modal */}
      {showUploader && <PdfUploader onClose={() => setShowUploader(false)} />}
    </aside>
  );
}
