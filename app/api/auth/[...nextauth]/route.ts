import { NextResponse } from "next/server"

// This is a placeholder route handler for auth
// It replaces the NextAuth.js handler with a simple implementation

export async function GET(request: Request) {
  return NextResponse.json(
    {
      status: "error",
      message: "Authentication not implemented",
    },
    { status: 401 },
  )
}

export async function POST(request: Request) {
  return NextResponse.json(
    {
      status: "error",
      message: "Authentication not implemented",
    },
    { status: 401 },
  )
}
