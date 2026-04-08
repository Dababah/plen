import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(1).max(50),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const categories = await prisma.taskCategory.findMany({
      where: { userId: session.user.id },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("[TASK_CATEGORIES_GET]", error);
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
    const validated = categorySchema.parse(body);

    const category = await prisma.taskCategory.create({
      data: {
        name: validated.name,
        userId: session.user.id,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    // Handle uniqueness constraint
    if ((error as any).code === "P2002") {
      return NextResponse.json({ error: "Category already exists" }, { status: 409 });
    }
    console.error("[TASK_CATEGORIES_POST]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
