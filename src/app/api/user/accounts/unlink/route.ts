import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { provider } = await req.json();

  if (!provider) {
    return new NextResponse("Provider is required", { status: 400 });
  }

  try {
    // Find the account
    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: provider,
      },
    });

    if (!account) {
      return NextResponse.json({ success: true, message: "Account already not found" });
    }

    // We clear tokens and scope to "de-authorize" the calendar/specific integration
    // while keeping the record if it's used for login (optional safety)
    await prisma.account.update({
      where: { id: account.id },
      data: {
        refresh_token: null,
        access_token: null,
        expires_at: null,
        scope: "email profile", // Reset to basic scopes
      },
    });

    return NextResponse.json({ success: true, message: "Unlinked successfully" });
  } catch (error: any) {
    console.error("Unlink Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
