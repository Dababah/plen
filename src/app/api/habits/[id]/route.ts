import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";

const updateHabitSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  icon: z.string().optional(),
  frequency: z.enum(["daily", "custom"]).optional(),
  scheduleDays: z.array(z.string()).optional().nullable(),
});

export async function PUT(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = updateHabitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { title, description, icon, frequency, scheduleDays } = parsed.data;

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (icon !== undefined) updateData.icon = icon;
    if (frequency !== undefined) updateData.frequency = frequency;
    if (scheduleDays !== undefined) {
      updateData.scheduleDays = scheduleDays ? JSON.stringify(scheduleDays) : null;
    }

    const habit = await prisma.habit.update({
      where: { id: params.id, userId: session.user.id },
      data: updateData,
      include: {
        items: { orderBy: { position: "asc" } },
        logs: true,
      },
    });

    return NextResponse.json(habit);
  } catch (error) {
    console.error("Habit update error:", error);
    return NextResponse.json({ error: "Failed to update habit" }, { status: 500 });
  }
}

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
    await prisma.habit.delete({
      where: { id: params.id, userId: session.user.id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Habit delete error:", error);
    return NextResponse.json({ error: "Failed to delete habit" }, { status: 500 });
  }
}
