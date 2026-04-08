import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const events = await prisma.event.findMany({
      where: { userId: session.user.id },
      orderBy: { start: "asc" },
    });
    return NextResponse.json(events);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, description, start, end, category, color, syncToTasks } = body;

    const event = await prisma.event.create({
      data: {
        title,
        description,
        start: new Date(start),
        end: new Date(end),
        category: category || "general",
        color,
        userId: session.user.id,
      },
    });

    // If syncToTasks is true, create a record in Task model
    if (syncToTasks) {
      await prisma.task.create({
        data: {
          title,
          description,
          dueDate: new Date(end),
          userId: session.user.id,
          priority: "medium",
          status: "todo",
          category: category || "general"
        },
      });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error("Event creation error:", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
