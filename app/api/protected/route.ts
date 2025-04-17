import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json(
    {
      status: "error",
      message: "Protected API not implemented",
    },
    { status: 401 },
  )
}
