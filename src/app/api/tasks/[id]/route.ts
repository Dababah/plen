import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const taskUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  status: z.enum(["todo", "in_progress", "done", "cancelled"]).optional(),
  category: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  subtasks: z.array(z.object({
    id: z.string().optional(),
    title: z.string().min(1),
    isDone: z.boolean().default(false),
    position: z.number().default(0),
  })).optional(),
});

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const validated = taskUpdateSchema.parse(body);

    const { subtasks, ...taskData } = validated;

    // Handle task fields
    const updateData: any = { ...taskData };
    if (taskData.dueDate !== undefined) {
      updateData.dueDate = taskData.dueDate ? new Date(taskData.dueDate) : null;
    }

    // Set timestamps for status changes
    if (taskData.status === "done") {
      updateData.completedAt = new Date();
      updateData.cancelledAt = null;
    } else if (taskData.status === "cancelled") {
      updateData.cancelledAt = new Date();
      updateData.completedAt = null;
    } else if (taskData.status && ["todo", "in_progress"].includes(taskData.status)) {
      updateData.completedAt = null;
      updateData.cancelledAt = null;
    }

    const task = await prisma.$transaction(async (tx) => {
      // 1. Update task
      const updatedTask = await tx.task.update({
        where: { id, userId: session!.user!.id },
        data: updateData,
        include: { subtasks: true },
      });

      // 2. Handle subtasks if provided
      if (subtasks) {
        // Simple strategy: replace all for now or perform smarter diff
        await tx.subtask.deleteMany({ where: { taskId: id } });
        if (subtasks.length > 0) {
          await tx.subtask.createMany({
            data: subtasks.map((s, i) => ({
              taskId: id,
              title: s.title,
              isDone: s.isDone,
              position: s.position || i,
            })),
          });
        }
      }

      return tx.task.findUnique({
        where: { id },
        include: { subtasks: { orderBy: { position: "asc" } } },
      });
    });

    return NextResponse.json(task);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    console.error(`[TASK_PUT_${id}]`, error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.task.delete({
      where: { id, userId: session!.user!.id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`[TASK_DELETE_${id}]`, error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
