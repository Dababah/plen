import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const budgets = await prisma.financeBudget.findMany({
      where: { userId: session.user.id },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ success: true, data: budgets });
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
    const { name, budget, icon, color } = body;

    const newBudget = await prisma.financeBudget.create({
      data: {
        name,
        budget: parseFloat(budget),
        icon: icon || 'Wallet',
        color: color || '#18181b',
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true, data: newBudget });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
