import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all user IDs we are following
    const following = await prisma.follows.findMany({
      where: { followerId: session.user.id },
      select: { followingId: true }
    });
    
    // Also include our own activities
    const userIdsToFetch = [session.user.id, ...following.map(f => f.followingId)];

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activities = await prisma.activity.findMany({
      where: {
        OR: [
          { userId: { in: userIdsToFetch }, type: "HABIT_MILESTONE" },
          { type: "NEW_FOLLOWER", referenceId: session.user.id }
        ],
        createdAt: {
          gte: sevenDaysAgo
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        user: { select: { id: true, name: true, username: true, image: true } }
      }
    });
    const activitiesWithFollowing = activities.map(act => ({
      ...act,
      isFollowing: following.some(f => f.followingId === act.userId)
    }));

    return NextResponse.json(activitiesWithFollowing);
  } catch (error) {
    console.error("Feed error:", error);
    return NextResponse.json({ error: "Failed to fetch feed" }, { status: 500 });
  }
}
