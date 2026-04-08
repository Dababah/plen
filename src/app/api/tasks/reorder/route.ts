import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const reorderSchema = z.array(z.object({
  id: z.string(),
  position: z.number(),
  status: z.enum(["todo", "in_progress", "done", "cancelled"]),
}));

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = reorderSchema.parse(body);

    const transaction = await prisma.$transaction(
      validated.map((task) =>
        prisma.task.update({
          where: { id: task.id, userId: session!.user!.id },
          data: {
            position: task.position,
            status: task.status,
            // Update timestamps if status changed to final state
            ...(task.status === "done" ? { completedAt: new Date() } : {}),
            ...(task.status === "cancelled" ? { cancelledAt: new Date() } : {}),
            ...(!["done", "cancelled"].includes(task.status) ? { completedAt: null, cancelledAt: null } : {}),
          },
        })
      )
    );

    return NextResponse.json({ success: true, count: transaction.length });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    console.error("[TASKS_REORDER]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
 

