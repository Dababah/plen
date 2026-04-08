import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { targetUserId } = await req.json();

    if (!targetUserId || targetUserId === session.user.id) {
      return NextResponse.json({ error: "Invalid target user" }, { status: 400 });
    }

    // Check if already following
    const existingFollow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: targetUserId
        }
      }
    });

    if (existingFollow) {
      // Unfollow
      await prisma.$transaction([
        prisma.follows.delete({
          where: {
            followerId_followingId: {
              followerId: session.user.id,
              followingId: targetUserId
            }
          }
        }),
        prisma.activity.deleteMany({
          where: {
            userId: session.user.id,
            type: "NEW_FOLLOWER",
            referenceId: targetUserId
          }
        })
      ]);
      return NextResponse.json({ following: false });
    } else {
      // Follow
      await prisma.$transaction([
        prisma.follows.create({
          data: {
            followerId: session.user.id,
            followingId: targetUserId
          }
        }),
        prisma.activity.create({
          data: {
            userId: session.user.id,
            type: "NEW_FOLLOWER",
            referenceId: targetUserId,
            metadata: JSON.stringify({ message: "Started following you" })
          }
        })
      ]);
      return NextResponse.json({ following: true });
    }
  } catch (error) {
    console.error("Follow error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
