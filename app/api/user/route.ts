import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json(
    {
      status: "error",
      message: "User API not implemented",
    },
    { status: 401 },
  )
}
