import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// GET all transactions (filtered by month if provided)
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month'); // Expects YYYY-MM

  try {
    let where: any = { userId: session.user.id };

    if (month) {
      const [year, monthNum] = month.split('-').map(Number);
      const startDate = new Date(year, monthNum - 1, 1);
      const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999);
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    const transactions = await prisma.financeTransaction.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({ success: true, data: transactions });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST new transaction
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, amount, type, category, date } = body;

    const transaction = await prisma.financeTransaction.create({
      data: {
        name,
        amount: parseFloat(amount),
        type,
        category,
        date: date ? new Date(date) : new Date(),
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true, data: transaction });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
