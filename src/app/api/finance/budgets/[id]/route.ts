import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { name, budget, icon, color } = body;

    const updatedBudget = await prisma.financeBudget.update({
      where: { id },
      data: {
        name,
        budget: parseFloat(budget),
        icon,
        color,
      },
    });

    return NextResponse.json({ success: true, data: updatedBudget });
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
    await prisma.financeBudget.delete({
      where: { id },
    });
    return NextResponse.json({ success: true, message: 'Budget deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
