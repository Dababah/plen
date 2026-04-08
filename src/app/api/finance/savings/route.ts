import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const goals = await prisma.financeSavingGoal.findMany({
      where: { userId: session.user.id },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ success: true, data: goals });
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
    const { name, targetAmount, icon, color } = body;

    const newGoal = await prisma.financeSavingGoal.create({
      data: {
        name,
        targetAmount: parseFloat(targetAmount),
        currentAmount: 0,
        icon: icon || 'Target',
        color: color || '#18181b',
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true, data: newGoal });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
