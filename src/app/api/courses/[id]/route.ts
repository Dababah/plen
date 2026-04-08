import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const courseSchema = z.object({
  id: z.string().optional(),
  day: z.string().min(1),
  startTime: z.string().min(5).max(5), // HH:mm
  endTime: z.string().min(5).max(5),   // HH:mm
  courseCode: z.string().min(1),
  courseName: z.string().min(1),
  className: z.string().optional().nullable(),
  lecturer: z.string().optional().nullable(),
  room: z.string().optional().nullable(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  color: z.string().optional().nullable(),
});

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = courseSchema.parse(body);

    const existingCourse = await prisma.course.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingCourse || existingCourse.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const course = await prisma.course.update({
      where: { id },
      data: {
        ...validated,
      },
    });

    return NextResponse.json(course);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    console.error("[COURSES_PUT]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const existingCourse = await prisma.course.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingCourse || existingCourse.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.course.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[COURSES_DELETE]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
