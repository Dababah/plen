import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";

const checkSchema = z.object({
  habitItemId: z.string().optional().nullable(), // null = toggle whole habit
  isCompleted: z.boolean(),
});

// Helper: get today's date at midnight
function getTodayDate(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export async function POST(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const habit = await prisma.habit.findFirst({
      where: { id: params.id, userId: session.user.id },
    });
    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = checkSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { habitItemId, isCompleted } = parsed.data;
    const today = getTodayDate();

    if (isCompleted) {
      // Upsert log for today
      await prisma.habitLog.upsert({
        where: {
          habitId_habitItemId_date: {
            habitId: params.id,
            habitItemId: habitItemId || "",
            date: today,
          },
        },
        create: {
          habitId: params.id,
          habitItemId: habitItemId || null,
          date: today,
          isCompleted: true,
        },
        update: {
          isCompleted: true,
        },
      });
    } else {
      // Delete the log for today
      await prisma.habitLog.deleteMany({
        where: {
          habitId: params.id,
          habitItemId: habitItemId || null,
          date: today,
        },
      });
    }

    // Return updated habit with today's logs
    const updatedWithLogs = await prisma.habit.findUnique({
      where: { id: params.id },
      include: {
        items: true,
        logs: true, // Need all logs to calculate streak, but maybe slow for very huge data. We'll do it for now.
      },
    });

    if (!updatedWithLogs) throw new Error("Habit not found");

    // Calculate streak
    let streak = 0;
    const now = new Date();
    const dayKeys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    const scheduleDaysStrings = habit.scheduleDays ? JSON.parse(habit.scheduleDays) as string[] : null;
    
    // Group logs by date time value
    const logGroups: Record<number, number> = {};
    updatedWithLogs.logs.forEach(log => {
      const ms = log.date.getTime();
      logGroups[ms] = (logGroups[ms] || 0) + 1;
    });

    const itemRequiredCount = updatedWithLogs.items.length === 0 ? 1 : updatedWithLogs.items.length;

    for (let i = 0; i < 730; i++) { // Max check 2 years
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const isScheduled = habit.frequency === "daily" || !scheduleDaysStrings || scheduleDaysStrings.includes(dayKeys[d.getDay()]);
      
      if (!isScheduled) continue; // Skip off-days

      const ms = d.getTime();
      const logsCount = logGroups[ms] || 0;
      
      const isFullyCompleted = logsCount >= itemRequiredCount;

      if (isFullyCompleted) {
        streak++;
      } else {
        if (i === 0) {
          // If today is not completed, we don't break the streak from yesterday.
          // Just continue to yesterday.
          continue;
        } else {
          // If yesterday or older is not completed, streak is broken.
          break;
        }
      }
    }

    let milestoneReached = false;
    let milestoneCount = 0;

    // Save streak
    if (updatedWithLogs.currentStreak !== streak) {
      const milestones = [3, 10, 30, 50, 100, 200, 300, 365, 500, 1000];
      
      // If streak increased and hit a milestone
      if (streak > updatedWithLogs.currentStreak && milestones.includes(streak)) {
        milestoneReached = true;
        milestoneCount = streak;
        // Create activity
        await prisma.activity.create({
          data: {
            userId: session.user.id,
            type: "HABIT_MILESTONE",
            referenceId: habit.id,
            metadata: JSON.stringify({ milestone: streak, habitTitle: habit.title })
          }
        });
      }

      await prisma.habit.update({
        where: { id: params.id },
        data: { currentStreak: streak }
      });
    }

    // Final fetch for response (only today's logs needed for UI)
    const finalUpdated = await prisma.habit.findUnique({
      where: { id: params.id },
      include: {
        items: { orderBy: { position: "asc" } },
        logs: {
          where: { date: today },
        },
      },
    });

    return NextResponse.json({
      ...finalUpdated,
      milestoneReached,
      milestoneCount 
    });
  } catch (error) {
    console.error("Habit check error:", error);
    return NextResponse.json({ error: "Failed to toggle check" }, { status: 500 });
  }
}

