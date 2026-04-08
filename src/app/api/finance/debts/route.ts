import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const debts = await prisma.financeDebt.findMany({
      where: { userId: session.user.id },
      orderBy: { startDate: 'desc' },
    });
    return NextResponse.json({ success: true, data: debts });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, totalDebt, monthlyPayment, dueDayOfMonth, startDate } = body;

    const newDebt = await prisma.financeDebt.create({
      data: {
        name,
        totalDebt: parseFloat(totalDebt),
        paidAmount: 0,
        monthlyPayment: parseFloat(monthlyPayment),
        dueDayOfMonth: parseInt(dueDayOfMonth),
        startDate: startDate ? new Date(startDate) : new Date(),
        status: 'aktif',
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true, data: newDebt });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
