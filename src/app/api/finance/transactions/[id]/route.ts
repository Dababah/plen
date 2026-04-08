import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { name, amount, type, category, date } = body;

    const updatedTransaction = await prisma.financeTransaction.update({
      where: { id },
      data: {
        name,
        amount: parseFloat(amount),
        type,
        category,
        date: date ? new Date(date) : new Date(),
      },
    });

    return NextResponse.json({ success: true, data: updatedTransaction });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.financeTransaction.delete({
      where: { id },
    });
    return NextResponse.json({ success: true, message: 'Transaction deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
