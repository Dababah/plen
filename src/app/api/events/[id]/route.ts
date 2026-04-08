import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

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
    const { title, description, start, end, category, color, syncToTasks } = body;

    // Fetch original to find associated task if title changes
    const originalEvent = await prisma.event.findUnique({
      where: { id: params.id, userId: session.user.id }
    });

    const event = await prisma.event.update({
      where: { 
        id: params.id,
        userId: session.user.id 
      },
      data: {
        title,
        description,
        start: new Date(start),
        end: new Date(end),
        category,
        color,
      },
    });

    // Sync to Task if requested
    if (syncToTasks && originalEvent) {
      await prisma.task.updateMany({
        where: {
          userId: session.user.id,
          title: originalEvent.title,
          status: { not: 'done' } // Only update unfinished tasks
        },
        data: {
          title,
          description,
          dueDate: new Date(end),
          category: category || "general"
        }
      });
    }

    return NextResponse.json(event);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
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
    await prisma.event.delete({
      where: { 
        id: params.id,
        userId: session.user.id 
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
