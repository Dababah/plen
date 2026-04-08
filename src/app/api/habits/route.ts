import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";

const createHabitSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  icon: z.string().optional(),
  frequency: z.enum(["daily", "custom"]).default("daily"),
  scheduleDays: z.array(z.string()).optional(), // ["mon","wed","fri"]
  items: z.array(z.string().min(1)).optional(), // sub-item titles
});

// Helper: get today's date at midnight (UTC)
function getTodayDate(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const today = getTodayDate();

    const habits = await prisma.habit.findMany({
      where: { userId: session.user.id },
      include: {
        items: { orderBy: { position: "asc" } },
        logs: {
          where: {
            date: today,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(habits);
  } catch (error) {
    console.error("Habits fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch habits" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createHabitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { title, description, icon, frequency, scheduleDays, items } = parsed.data;

    const habit = await prisma.habit.create({
      data: {
        title,
        description: description || null,
        icon: icon || "⚡",
        frequency,
        scheduleDays: scheduleDays ? JSON.stringify(scheduleDays) : null,
        userId: session.user.id,
        items: items && items.length > 0
          ? {
              create: items.map((t, idx) => ({
                title: t,
                position: idx,
              })),
            }
          : undefined,
      },
      include: {
        items: { orderBy: { position: "asc" } },
        logs: true,
      },
    });

    return NextResponse.json(habit, { status: 201 });
  } catch (error) {
    console.error("Habit creation error:", error);
    return NextResponse.json({ error: "Failed to create habit" }, { status: 500 });
  }
}
