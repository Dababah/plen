import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth() as any;
  const userId = session?.user?.id;
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();

    // Ensure the investment belongs to the user
    const existing = await prisma.financeInvestment.findUnique({
      where: { id, userId }
    });

    if (!existing) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const updated = await prisma.financeInvestment.update({
      where: { id },
      data: {
        name: body.name,
        type: body.type,
        initialAmount: body.initialAmount,
        currentValue: body.currentValue,
        buyDate: body.buyDate,
        symbol: body.symbol,
        lots: body.lots
      }
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth() as any;
  const userId = session?.user?.id;
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { id } = await params;

    // Ensure the investment belongs to the user
    const existing = await prisma.financeInvestment.findUnique({
      where: { id, userId }
    });

    if (!existing) {
      return new NextResponse("Not Found", { status: 404 });
    }

    await prisma.financeInvestment.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
