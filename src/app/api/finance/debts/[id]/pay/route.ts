import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { amount, date, autoTransaction } = await request.json();
    const payAmount = parseFloat(amount);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Add payment record
      const payment = await tx.financeDebtPayment.create({
        data: {
          debtId: id,
          amount: payAmount,
          date: date ? new Date(date) : new Date(),
        },
      });

      // 2. Update debt paid amount
      const debt = await tx.financeDebt.update({
        where: { id },
        data: {
          paidAmount: {
            increment: payAmount,
          },
        },
      });

      // 3. Mark as lunas if paid amount >= total debt
      if (debt.paidAmount >= debt.totalDebt) {
        await tx.financeDebt.update({
          where: { id },
          data: { status: 'lunas' },
        });
      }

      // 4. Create mirroring transaction if requested
      if (autoTransaction) {
        await tx.financeTransaction.create({
          data: {
            name: `Bayar Cicilan: ${debt.name}`,
            amount: payAmount,
            type: 'expense',
            category: 'Cicilan',
            date: date ? new Date(date) : new Date(),
            userId: debt.userId,
          },
        });
      }

      return payment;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
