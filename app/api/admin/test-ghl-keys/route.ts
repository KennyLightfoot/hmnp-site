import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { pitKey, jwtKey } = await request.json()

    // Test the PIT key
    const pitResult = await testKey(pitKey)

    // Test the JWT key
    const jwtResult = await testKey(jwtKey, true)

    return NextResponse.json({
      pit: pitResult,
      jwt: jwtResult,
    })
  } catch (error) {
    console.error("Error testing API keys:", error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

async function testKey(key: string, isJwt = false): Promise<{ success: boolean; error?: string; details?: any }> {
  if (!key) {
    return { success: false, error: "No key provided" }
  }

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Version: "2021-07-28",
    }

    // Set the correct authorization header based on key type
    if (isJwt) {
      headers["Authorization"] = `Bearer ${key}`
    } else {
      headers["Authorization"] = key
    }

    const response = await fetch("https://services.leadconnectorhq.com/locations", {
      method: "GET",
      headers,
      cache: "no-store",
    })

    if (!response.ok) {
      let errorData = {}
      try {
        errorData = await response.json()
      } catch (e) {
        try {
          errorData = { message: await response.text() }
        } catch (e2) {
          errorData = { message: response.statusText }
        }
      }

      return {
        success: false,
        error: `API Error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`,
      }
    }

    const data = await response.json()
    return {
      success: true,
      details: {
        locations:
          data.locations?.map((loc: any) => ({
            id: loc.id,
            name: loc.name,
          })) || [],
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

