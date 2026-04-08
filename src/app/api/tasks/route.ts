import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  status: z.enum(["todo", "in_progress", "done", "cancelled"]).default("todo"),
  category: z.string().optional().default("Lainnya"),
  dueDate: z.string().optional().nullable(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const tasks = await prisma.task.findMany({
      where: {
        userId: session.user.id,
        isArchived: false,
      },
      include: {
        subtasks: {
          orderBy: { position: "asc" },
        },
      },
      orderBy: {
        position: "asc",
      },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("[TASKS_GET]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = taskSchema.parse(body);

    // Verify user exists in DB before inserting
    const userExists = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true },
    });

    if (!userExists) {
      console.error("[TASKS_POST] user not found in DB, session.user.id =", session.user.id);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get max position for the status
    const lastTask = await prisma.task.findFirst({
      where: {
        userId: session.user.id,
        status: validated.status,
        isArchived: false,
      },
      orderBy: { position: "desc" },
    });

    const newPosition = lastTask ? lastTask.position + 1 : 0;

    const task = await prisma.task.create({
      data: {
        ...validated,
        dueDate: validated.dueDate ? new Date(validated.dueDate) : null,
        userId: session.user.id,
        position: newPosition,
      },
      include: {
        subtasks: true,
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    console.error("[TASKS_POST]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
