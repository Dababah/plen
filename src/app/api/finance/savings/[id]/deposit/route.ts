import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { amount, date } = await request.json();
    const depositAmount = parseFloat(amount);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Add deposit record
      const deposit = await tx.financeSavingDeposit.create({
        data: {
          savingGoalId: id,
          amount: depositAmount,
          date: date ? new Date(date) : new Date(),
        },
      });

      // 2. Update saving goal balance
      await tx.financeSavingGoal.update({
        where: { id },
        data: {
          currentAmount: {
            increment: depositAmount,
          },
        },
      });

      return deposit;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
