// File: app/api/test-ghl/route.ts
import { NextResponse } from 'next/server';
import { getErrorMessage } from '@/lib/utils/error-utils';
import { testGetLocationDetails } from '@/lib/ghl'; // Assuming lib is aliased to @/lib

export async function GET() {
  console.log('/api/test-ghl endpoint hit');
  try {
    const locationDetails = await testGetLocationDetails();
    return NextResponse.json({ success: true, data: locationDetails });
  } catch (error: any) {
    const errorMessage = error instanceof Error ? getErrorMessage(error) : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('/api/test-ghl error:', errorMessage, errorStack);
    let status = 500;
    // Check if the error object or its message contains a status code
    if (error.response && error.response.status) {
        status = error.response.status;
    } else if (getErrorMessage(error) && getErrorMessage(error).includes('status')) {
        const match = getErrorMessage(error).match(/status[code\s:]*(\d+)/i); // More robust regex for status
        if (match && match[1]) {
            status = parseInt(match[1], 10);
        }
    }
    return NextResponse.json({ success: false, error: errorMessage, details: errorStack }, { status });
  }
}
