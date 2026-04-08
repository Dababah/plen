import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const courseSchema = z.object({
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

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const courses = await prisma.course.findMany({
      where: { userId: session.user.id },
      orderBy: [
        { day: "asc" }, // This might need a custom weight for sorting days
        { startTime: "asc" }
      ],
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error("[COURSES_GET]", error);
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
    const validated = courseSchema.parse(body);

    const course = await prisma.course.create({
      data: {
        ...validated,
        userId: session.user.id,
      },
    });

    return NextResponse.json(course);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    console.error("[COURSES_POST]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
