import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

  if (!q || q.length < 3) {
    return NextResponse.json([]);
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            OR: [
              { username: { contains: q } }, // Case-insensitive on Prisma MySQL defaults depending on collation
              { name: { contains: q } }
            ]
          },
          // Ensure they actually have a username set, so they are fully onboarded and publicly viewable
          { username: { not: null } }
        ]
      },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        followers: {
          where: { followerId: session.user.id },
          select: { followerId: true }
        }
      },
      take: 20
    });

    const results = users.map(u => ({
      ...u,
      isFollowing: u.followers.length > 0,
      followers: undefined // remove the nested object
    }));

    return NextResponse.json(results);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Failed to search network" }, { status: 500 });
  }
}
