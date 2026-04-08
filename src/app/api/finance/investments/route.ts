import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const investments = await prisma.financeInvestment.findMany({
      where: { userId: session.user.id },
      orderBy: { buyDate: 'desc' },
    });
    return NextResponse.json({ success: true, data: investments });
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
    const { name, symbol, type, initialAmount, currentValue, lots, buyDate } = body;

    const newInvestment = await prisma.financeInvestment.create({
      data: {
        name,
        symbol: symbol || null,
        type,
        initialAmount: parseFloat(initialAmount),
        currentValue: currentValue ? parseFloat(currentValue) : parseFloat(initialAmount),
        lots: lots ? parseFloat(lots) : null,
        buyDate: buyDate ? new Date(buyDate) : new Date(),
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true, data: newInvestment });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
