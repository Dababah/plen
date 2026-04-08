import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (!session?.user) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/auth/signin`);
  }

  if (error || !code) {
    console.error("Google Calendar Auth Error:", error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard?error=google_calendar_auth_failed`);
  }

  try {
    const rootUrl = "https://oauth2.googleapis.com/token";
    
    // Use current host for more reliable redirects
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
    const host = new URL(req.url).host;
    const redirectUri = `${protocol}://${host}/api/auth/google-calendar/callback`;

    const options = {
      code,
      client_id: process.env.AUTH_GOOGLE_ID!,
      client_secret: process.env.AUTH_GOOGLE_SECRET!,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    };

    const response = await fetch(rootUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(options).toString(),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error_description || data.error);
    }

    const { access_token, refresh_token, expires_in, scope, token_type, id_token } = data;

    // Get the Google User Info to find their providerAccountId
    const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    const userInfo = await userInfoResponse.json();
    const providerAccountId = userInfo.id;

    // Upsert the Account entry
    const existingAccount = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: "google",
      },
    });

    if (existingAccount) {
      await prisma.account.update({
        where: { id: existingAccount.id },
        data: {
          access_token,
          refresh_token: refresh_token || existingAccount.refresh_token,
          expires_at: Math.floor(Date.now() / 1000 + expires_in),
          scope,
          token_type,
          id_token,
          providerAccountId, // Optional: update if changed
        },
      });
    } else {
      await prisma.account.create({
        data: {
          userId: session.user.id!,
          type: "oauth",
          provider: "google",
          providerAccountId: providerAccountId,
          access_token,
          refresh_token,
          expires_at: Math.floor(Date.now() / 1000 + expires_in),
          scope,
          token_type,
          id_token,
        },
      });
    }

    // Success redirect for popup flow
    const lang = (session.user as any).lang || 'id';
    return NextResponse.redirect(`${protocol}://${host}/${lang}/auth/google-calendar-success`);
  } catch (err: any) {
    console.error("Callback Error:", err);
    // On error, we still want to notify the parent window to close or show error
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
    const host = new URL(req.url).host;
    return NextResponse.redirect(`${protocol}://${host}/dashboard?error=${encodeURIComponent(err.message)}`);
  }
}
