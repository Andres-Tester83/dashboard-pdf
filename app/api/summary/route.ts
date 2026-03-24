import { NextRequest, NextResponse } from 'next/server';
import { getAllAccountsSummary, getAccountSummary, getMonthlyHistory } from '@/lib/sheets';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sheet = searchParams.get('sheet') || 'all';
  const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : undefined;
  const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined;
  const history = searchParams.get('history') === 'true';

  try {
    if (history) {
      const label = sheet === 'all' ? 'Empresa' : sheet;
      const data = await getMonthlyHistory(label === 'all' ? 'Empresa' : label, 6);
      return NextResponse.json({ history: data });
    }

    if (sheet === 'all') {
      const summaries = await getAllAccountsSummary(month, year);
      const totalIngresos = summaries.reduce((s, a) => s + a.total_ingresos, 0);
      const totalEgresos = summaries.reduce((s, a) => s + a.total_egresos, 0);
      return NextResponse.json({
        accounts: summaries,
        total_ingresos: totalIngresos,
        total_egresos: totalEgresos,
        balance: totalIngresos - totalEgresos,
      });
    }

    const summary = await getAccountSummary(sheet, sheet, month, year);
    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error fetching summary:', error);
    return NextResponse.json({ error: 'Error al obtener resumen' }, { status: 500 });
  }
}
