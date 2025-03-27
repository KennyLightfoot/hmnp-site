import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  
  if (!code) {
    return NextResponse.redirect(new URL("/auth/error?error=NoCode", baseUrl));
  }

  // Redirect to the NextAuth callback URL with the code
  return NextResponse.redirect(new URL(`/api/auth/callback/gohighlevel?code=${code}`, baseUrl));
}

export const dynamic = "force-dynamic"; 