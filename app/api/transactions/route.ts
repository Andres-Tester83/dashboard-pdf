import { NextRequest, NextResponse } from 'next/server';
import { getTransactions } from '@/lib/sheets';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sheet = searchParams.get('sheet') || 'Empresa';
  const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : undefined;
  const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined;

  try {
    const transactions = await getTransactions(sheet, month, year);
    return NextResponse.json({ transactions, total: transactions.length });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Error al obtener transacciones' }, { status: 500 });
  }
}
