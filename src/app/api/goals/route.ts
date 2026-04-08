import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";

const createGoalSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  targetDate: z.string().optional(),
  category: z.string().optional(),
  color: z.string().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const goals = await prisma.goal.findMany({
      where: { userId: session.user.id },
      include: {
        milestones: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(goals);
  } catch (error) {
    console.error("Goals fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch goals" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createGoalSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { title, description, targetDate } = parsed.data;

    const goal = await prisma.goal.create({
      data: {
        title,
        description: description || null,
        targetDate: targetDate ? new Date(targetDate) : null,
        progress: 0,
        userId: session.user.id,
      },
      include: {
        milestones: true,
      },
    });

    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    console.error("Goal creation error:", error);
    return NextResponse.json({ error: "Failed to create goal" }, { status: 500 });
  }
}
