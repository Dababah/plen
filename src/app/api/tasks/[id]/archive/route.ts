import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const task = await prisma.task.update({
      where: { id, userId: session.user.id },
      data: {
        isArchived: true,
        archivedAt: new Date(),
        archivedReason: "manual",
      },
    });
    return NextResponse.json(task);
  } catch (error) {
    console.error(`[TASK_ARCHIVE_${id}]`, error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
