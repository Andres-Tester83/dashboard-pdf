'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X, CheckCircle, AlertCircle, Loader2, FileText } from 'lucide-react';

interface PdfUploaderProps {
  onClose: () => void;
}

const CUENTAS = ['Empresa', 'Familia', 'Personal'];

export default function PdfUploader({ onClose }: PdfUploaderProps) {
  const router = useRouter();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [cuenta, setCuenta] = useState('Personal');
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleFile = (f: File) => {
    if (!f.name.toLowerCase().endsWith('.pdf')) {
      setMessage('Solo se aceptan archivos PDF');
      setStatus('error');
      return;
    }
    setFile(f);
    setStatus('idle');
    setMessage('');
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  const handleUpload = async () => {
    if (!file) return;
    setStatus('uploading');
    setProgress(0);
    setProgressText('Conectando con el servidor...');

    const fd = new FormData();
    fd.append('file', file);
    fd.append('cuenta', cuenta);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok) {
        startSimulatedProgress();
      } else {
        setStatus('error');
        setMessage(data.error || 'Error desconocido');
      }
    } catch {
      setStatus('error');
      setMessage('Error de conexión');
    }
  };

  const startSimulatedProgress = () => {
    let p = 0;
    setProgressText('Subiendo PDF a Drive (1/4)...');
    
    intervalRef.current = setInterval(() => {
      p += 1;
      setProgress(p);

      if (p === 15) setProgressText('🤖 Gemini analizando transacciones (2/4)...');
      if (p === 45) setProgressText('🧠 Clasificando categorías automáticamente (3/4)...');
      if (p === 75) setProgressText('📊 Guardando en Sheets y ejecutando scripts (4/4)...');

      if (p >= 100) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setProgressText('¡Terminado!');
        setStatus('success');
        setMessage('Carga exitosa. Actualizando dashboard...');
        
        setTimeout(() => {
          router.refresh();
          setTimeout(() => onClose(), 800);
        }, 1500);
      }
    }, 250); // 100 steps * 250ms = 25s
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass w-full max-w-md p-6 fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">Subir Estado de Cuenta</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Account selector */}
        <div className="mb-4">
          <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Cuenta</label>
          <div className="flex gap-2">
            {CUENTAS.map((c) => {
              const colors: Record<string, string> = {
                Empresa: 'border-indigo-500 text-indigo-400 bg-indigo-500/10',
                Familia: 'border-green-500 text-green-400 bg-green-500/10',
                Personal: 'border-orange-500 text-orange-400 bg-orange-500/10',
              };
              const active = cuenta === c;
              return (
                <button
                  key={c}
                  onClick={() => setCuenta(c)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                    active ? colors[c] : 'border-white/10 text-gray-500 hover:border-white/20'
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>

        {/* Drop zone */}
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => document.getElementById('pdf-input')?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            dragging
              ? 'border-violet-400 bg-violet-500/10'
              : file
              ? 'border-green-500/50 bg-green-500/5'
              : 'border-white/10 hover:border-white/20 hover:bg-white/5'
          }`}
        >
          <input
            id="pdf-input"
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
          {file ? (
            <div className="flex flex-col items-center gap-2">
              <FileText className="w-10 h-10 text-green-400" />
              <p className="text-white text-sm font-medium">{file.name}</p>
              <p className="text-gray-500 text-xs">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-10 h-10 text-gray-500" />
              <p className="text-gray-300 text-sm">Arrastra tu PDF aquí</p>
              <p className="text-gray-500 text-xs">o haz clic para seleccionar</p>
            </div>
          )}
        </div>

        {/* Status indicator */}
        {status === 'uploading' && progress > 0 && (
          <div className="mt-6 fade-in">
            <div className="flex justify-between text-xs mb-2 px-1">
              <span className="text-violet-300 font-medium">{progressText}</span>
              <span className="text-violet-400 font-bold">{progress}%</span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 relative">
              <div 
                className="h-full bg-gradient-to-r from-violet-500 to-indigo-400 rounded-full transition-all duration-300 ease-out relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="mt-6 flex items-start gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20 fade-in">
            <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
            <p className="text-green-300 text-sm leading-relaxed">{message}</p>
          </div>
        )}
        {status === 'error' && (
          <div className="mt-6 flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 fade-in">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-red-300 text-sm leading-relaxed">{message}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 text-sm hover:bg-white/5 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || status === 'uploading' || status === 'success'}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {status === 'uploading' ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Subiendo...</>
            ) : status === 'success' ? (
              <><CheckCircle className="w-4 h-4" /> Listo</>
            ) : (
              <><Upload className="w-4 h-4" /> Procesar PDF</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
