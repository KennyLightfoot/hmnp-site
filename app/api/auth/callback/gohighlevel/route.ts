import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    if (!code) {
      return NextResponse.redirect(new URL("/auth/error?error=NoCode", baseUrl));
    }

    // Exchange the code for an access token
    const tokenResponse = await fetch("https://services.leadconnectorhq.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: process.env.GHL_CLIENT_ID || "",
        client_secret: process.env.GHL_CLIENT_SECRET || "",
        code: code,
        redirect_uri: `${baseUrl}/api/auth/callback/oauth`,
      }).toString(),
    });

    const data = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("Token exchange failed:", data);
      return NextResponse.redirect(new URL("/auth/error?error=TokenExchangeFailed", baseUrl));
    }

    // Redirect to the success page with the token
    return NextResponse.redirect(new URL("/auth/success", baseUrl));
  } catch (error) {
    console.error("OAuth callback error:", error);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return NextResponse.redirect(new URL("/auth/error?error=CallbackError", baseUrl));
  }
}

export const dynamic = "force-dynamic"; 