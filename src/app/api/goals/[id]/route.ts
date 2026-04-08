import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";

const updateGoalSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  targetDate: z.string().optional().nullable(),
  status: z.enum(["in_progress", "completed", "paused"]).optional(),
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
    const parsed = updateGoalSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { title, description, targetDate, status } = parsed.data;

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (targetDate !== undefined) {
      updateData.targetDate = targetDate ? new Date(targetDate) : null;
    }

    // Handle status-based progress changes
    if (status !== undefined) {
      // We store status in progress field logic:
      // If status is completed, set progress to 100
      if (status === "completed") {
        updateData.progress = 100;
        // Also complete all milestones
        await prisma.milestone.updateMany({
          where: { goalId: params.id },
          data: { isCompleted: true },
        });
      }
    }

    const goal = await prisma.goal.update({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      data: updateData,
      include: {
        milestones: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return NextResponse.json(goal);
  } catch (error) {
    console.error("Goal update error:", error);
    return NextResponse.json({ error: "Failed to update goal" }, { status: 500 });
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
    await prisma.goal.delete({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Goal delete error:", error);
    return NextResponse.json({ error: "Failed to delete goal" }, { status: 500 });
  }
}
