import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";

const addItemSchema = z.object({
  title: z.string().min(1),
});

// POST = add sub-item
export async function POST(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const habit = await prisma.habit.findFirst({
      where: { id: params.id, userId: session.user.id },
      include: { items: true },
    });
    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = addItemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    await prisma.habitItem.create({
      data: {
        title: parsed.data.title,
        habitId: params.id,
        position: habit.items.length,
      },
    });

    // Return updated habit
    const updated = await prisma.habit.findUnique({
      where: { id: params.id },
      include: {
        items: { orderBy: { position: "asc" } },
        logs: true,
      },
    });

    return NextResponse.json(updated, { status: 201 });
  } catch (error) {
    console.error("HabitItem creation error:", error);
    return NextResponse.json({ error: "Failed to add item" }, { status: 500 });
  }
}

// DELETE = remove sub-item
export async function DELETE(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const habit = await prisma.habit.findFirst({
      where: { id: params.id, userId: session.user.id },
    });
    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId");
    if (!itemId) {
      return NextResponse.json({ error: "itemId required" }, { status: 400 });
    }

    // Also delete associated logs
    await prisma.habitLog.deleteMany({
      where: { habitId: params.id, habitItemId: itemId },
    });

    await prisma.habitItem.delete({
      where: { id: itemId },
    });

    const updated = await prisma.habit.findUnique({
      where: { id: params.id },
      include: {
        items: { orderBy: { position: "asc" } },
        logs: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("HabitItem delete error:", error);
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}
