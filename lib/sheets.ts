import { google } from 'googleapis';
import { unstable_cache } from 'next/cache';

const SHEET_ID = process.env.GOOGLE_SHEET_ID!;

function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n').replace(/^"|"$/g, ''),
    },
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets.readonly',
      'https://www.googleapis.com/auth/drive',
    ],
  });
}

export interface Transaction {
// ... omitting unchanged interface code
  fecha: string;
  banco: string;
  cuenta_tipo: string;
  periodo: string;
  moneda: string;
  descripcion_raw: string;
  beneficiario: string;
  categoria: string;
  sub_categoria: string;
  descripcion_clara: string;
  monto: number;
  tipo: 'INGRESO' | 'EGRESO';
  metodo: string;
  regla_aplicada: string;
  confianza: string;
  archivo_origen: string;
  fecha_procesado: string;
}

// Column mapping from Google Sheets headers
const COL = {
  fecha: 0,
  banco: 1,
  cuenta_tipo: 2,
  periodo: 3,
  moneda: 4,
  descripcion_raw: 5,
  beneficiario: 6,
  categoria: 7,
  sub_categoria: 8,
  descripcion_clara: 9,
  monto: 10,
  tipo: 11,
  metodo: 12,
  regla_aplicada: 13,
  confianza: 14,
  archivo_origen: 15,
  fecha_procesado: 16,
};

function rowToTransaction(row: string[]): Transaction {
  return {
    fecha: row[COL.fecha] || '',
    banco: row[COL.banco] || '',
    cuenta_tipo: row[COL.cuenta_tipo] || '',
    periodo: row[COL.periodo] || '',
    moneda: row[COL.moneda] || 'MXN',
    descripcion_raw: row[COL.descripcion_raw] || '',
    beneficiario: row[COL.beneficiario] || '',
    categoria: row[COL.categoria] || '',
    sub_categoria: row[COL.sub_categoria] || '',
    descripcion_clara: row[COL.descripcion_clara] || '',
    monto: parseFloat(row[COL.monto]?.toString().replace(/[$,\s]/g, '')) || 0,
    tipo: (row[COL.tipo] ? row[COL.tipo].toString().trim().toUpperCase() : 'EGRESO') as 'INGRESO' | 'EGRESO',
    metodo: row[COL.metodo] || '',
    regla_aplicada: row[COL.regla_aplicada] || '',
    confianza: row[COL.confianza] || '',
    archivo_origen: row[COL.archivo_origen] || '',
    fecha_procesado: row[COL.fecha_procesado] || '',
  };
}

function parseDate(fechaStr: string): { month: number; year: number } | null {
  const parts = fechaStr.split('/');
  if (parts.length === 3) {
    let m = parseInt(parts[0]);
    let d = parseInt(parts[1]);
    let y = parseInt(parts[2]);
    
    if (m > 12) {
      return { month: d, year: y };
    }
    return { month: m, year: y };
  }
  return null;
}

const getCachedSheet = (sheet: string) => unstable_cache(
  async () => {
    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${sheet}!A2:Q10000`, 
    });
    return response.data.values || [];
  },
  ['google-sheets-data', sheet],
  { tags: ['sheets', sheet], revalidate: 60 }
)();

export async function getTransactions(
  sheet: string,
  month?: number,
  year?: number
): Promise<Transaction[]> {
  const rows = await getCachedSheet(sheet);

  let transactions = rows
    .filter((row) => row.length >= 11 && row[COL.fecha])
    .map(rowToTransaction);

  // Filter by month/year if provided
  if (month && year) {
    transactions = transactions.filter((tx) => {
      const d = parseDate(tx.fecha);
      return d && d.month === month && d.year === year;
    });
  }

  return transactions;
}

export interface CategorySummary {
  categoria: string;
  total: number;
  count: number;
}

export interface AccountSummary {
  sheet: string;
  label: string;
  total_ingresos: number;
  total_egresos: number;
  balance: number;
  moneda: string;
  byCategory: CategorySummary[];
}

export async function getAccountSummary(
  sheet: string,
  label: string,
  month?: number,
  year?: number
): Promise<AccountSummary> {
  const transactions = await getTransactions(sheet, month, year);

  const ingresos = transactions
    .filter((t) => t.tipo === 'INGRESO')
    .reduce((sum, t) => sum + t.monto, 0);

  const egresos = transactions
    .filter((t) => t.tipo === 'EGRESO')
    .reduce((sum, t) => sum + t.monto, 0);

  // Group egresos by category
  const categoryMap: Record<string, { total: number; count: number }> = {};
  transactions
    .filter((t) => t.tipo === 'EGRESO')
    .forEach((t) => {
      const cat = t.categoria || 'Sin Categoría';
      if (!categoryMap[cat]) categoryMap[cat] = { total: 0, count: 0 };
      categoryMap[cat].total += t.monto;
      categoryMap[cat].count += 1;
    });

  const byCategory: CategorySummary[] = Object.entries(categoryMap)
    .map(([categoria, data]) => ({ categoria, ...data }))
    .sort((a, b) => b.total - a.total);

  return {
    sheet,
    label,
    total_ingresos: ingresos,
    total_egresos: egresos,
    balance: ingresos - egresos,
    moneda: transactions[0]?.moneda || 'MXN',
    byCategory,
  };
}

export async function getAllAccountsSummary(month?: number, year?: number) {
  const accounts = [
    { sheet: 'Empresa', label: 'Empresa' },
    { sheet: 'Familia', label: 'Familia' },
    { sheet: 'Personal', label: 'Personal' },
  ];

  const results = await Promise.all(
    accounts.map(({ sheet, label }) => getAccountSummary(sheet, label, month, year))
  );

  return results;
}

// Get monthly history for the last N months
export async function getMonthlyHistory(sheet: string, months: number = 6) {
  const now = new Date();
  const history = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    const transactions = await getTransactions(sheet, month, year);

    const ingresos = transactions
      .filter((t) => t.tipo === 'INGRESO')
      .reduce((sum, t) => sum + t.monto, 0);
    const egresos = transactions
      .filter((t) => t.tipo === 'EGRESO')
      .reduce((sum, t) => sum + t.monto, 0);

    history.push({
      month,
      year,
      label: d.toLocaleDateString('es-MX', { month: 'short', year: '2-digit' }),
      ingresos,
      egresos,
    });
  }

  return history;
}
