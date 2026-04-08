import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { image, name, username } = await req.json();

    const data: any = {};
    if (image && typeof image === "string") data.image = image;
    if (name && typeof name === "string") data.name = name;
    
    if (username && typeof username === "string") {
      // Validate username format (simple alphanumeric + underscore)
      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
      if (!usernameRegex.test(username)) {
        return NextResponse.json({ error: "Invalid username format (3-20 characters, alphanumeric and underscore only)" }, { status: 400 });
      }

      // Check uniqueness if changed
      const existing = await prisma.user.findFirst({
        where: { 
          username: username,
          NOT: { id: session.user.id }
        }
      });

      if (existing) {
        return NextResponse.json({ error: "username_taken" }, { status: 400 });
      }

      data.username = username;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No data to update" }, { status: 400 });
    }

    // Update user
    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data,
      select: { id: true, image: true, name: true, username: true },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
