import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";

const addMilestoneSchema = z.object({
  title: z.string().min(1),
});

const toggleMilestoneSchema = z.object({
  milestoneId: z.string().min(1),
  isCompleted: z.boolean(),
});

// Recalculate goal progress based on milestones
async function recalculateProgress(goalId: string) {
  const milestones = await prisma.milestone.findMany({
    where: { goalId },
  });

  if (milestones.length === 0) {
    await prisma.goal.update({
      where: { id: goalId },
      data: { progress: 0 },
    });
    return;
  }

  const completed = milestones.filter((m) => m.isCompleted).length;
  const progress = Math.round((completed / milestones.length) * 100);

  await prisma.goal.update({
    where: { id: goalId },
    data: { progress },
  });
}

// POST = add milestone
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
    // Verify goal ownership
    const goal = await prisma.goal.findFirst({
      where: { id: params.id, userId: session.user.id },
    });
    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = addMilestoneSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const milestone = await prisma.milestone.create({
      data: {
        title: parsed.data.title,
        goalId: params.id,
      },
    });

    await recalculateProgress(params.id);

    // Return updated goal
    const updatedGoal = await prisma.goal.findUnique({
      where: { id: params.id },
      include: { milestones: { orderBy: { createdAt: "asc" } } },
    });

    return NextResponse.json(updatedGoal, { status: 201 });
  } catch (error) {
    console.error("Milestone creation error:", error);
    return NextResponse.json({ error: "Failed to add milestone" }, { status: 500 });
  }
}

// PATCH = toggle milestone completion
export async function PATCH(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Verify goal ownership
    const goal = await prisma.goal.findFirst({
      where: { id: params.id, userId: session.user.id },
    });
    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = toggleMilestoneSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    await prisma.milestone.update({
      where: { id: parsed.data.milestoneId },
      data: { isCompleted: parsed.data.isCompleted },
    });

    await recalculateProgress(params.id);

    const updatedGoal = await prisma.goal.findUnique({
      where: { id: params.id },
      include: { milestones: { orderBy: { createdAt: "asc" } } },
    });

    return NextResponse.json(updatedGoal);
  } catch (error) {
    console.error("Milestone toggle error:", error);
    return NextResponse.json({ error: "Failed to toggle milestone" }, { status: 500 });
  }
}

// DELETE = remove a milestone
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
    const goal = await prisma.goal.findFirst({
      where: { id: params.id, userId: session.user.id },
    });
    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const milestoneId = searchParams.get("milestoneId");
    if (!milestoneId) {
      return NextResponse.json({ error: "milestoneId required" }, { status: 400 });
    }

    await prisma.milestone.delete({
      where: { id: milestoneId },
    });

    await recalculateProgress(params.id);

    const updatedGoal = await prisma.goal.findUnique({
      where: { id: params.id },
      include: { milestones: { orderBy: { createdAt: "asc" } } },
    });

    return NextResponse.json(updatedGoal);
  } catch (error) {
    console.error("Milestone delete error:", error);
    return NextResponse.json({ error: "Failed to delete milestone" }, { status: 500 });
  }
}
