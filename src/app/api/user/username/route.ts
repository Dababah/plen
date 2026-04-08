import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { username, image } = await req.json();

    if (!username || typeof username !== "string" || username.length < 3) {
      return NextResponse.json({ error: "Invalid username" }, { status: 400 });
    }

    const normalized = username.toLowerCase().trim();

    // Check if taken
    const existing = await prisma.user.findUnique({
      where: { username: normalized },
    });

    if (existing) {
      return NextResponse.json({ error: "Username is already taken" }, { status: 409 });
    }

    // Update user
    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: { 
        username: normalized,
        image: image || undefined // Only update if image is provided
      },
      select: { id: true, username: true, image: true },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Username setup error:", error);
    return NextResponse.json({ error: "Failed to set username" }, { status: 500 });
  }
}
