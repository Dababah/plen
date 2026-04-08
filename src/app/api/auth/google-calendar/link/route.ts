import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(req: Request) {
  const session = await auth();

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  
  // Use current host for more reliable redirects
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const host = new URL(req.url).host;
  const redirectUri = `${protocol}://${host}/api/auth/google-calendar/callback`;
  
  const options = {
    redirect_uri: redirectUri,
    client_id: process.env.AUTH_GOOGLE_ID!,
    access_type: "offline",
    response_type: "code",
    prompt: "select_account consent",
    login_hint: session.user.email || undefined,
    scope: [
      "https://www.googleapis.com/auth/calendar.events",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ].join(" "),
  };

  const qs = new URLSearchParams(options as any);

  return NextResponse.redirect(`${rootUrl}?${qs.toString()}`);
}
