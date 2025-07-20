export function debugApiResponse(endpoint: string, response: Response, data: any) {
  try {
    const debugInfo: Record<string, any> = {
      endpoint,
      status: response.status,
      ok: response.ok,
      dataReceived: typeof data !== 'undefined' && data !== null,
      dataType: Array.isArray(data) ? 'array' : typeof data,
    };

    if (data && typeof data === 'object') {
      if ('availableSlots' in data && Array.isArray((data as any).availableSlots)) {
        debugInfo.slotsCount = (data as any).availableSlots.length;
        debugInfo.sampleSlot = (data as any).availableSlots[0];
      }
      if ('slots' in data && Array.isArray((data as any).slots)) {
        debugInfo.slotsCount = (data as any).slots.length;
        debugInfo.sampleSlot = (data as any).slots[0];
      }
    }

    // eslint-disable-next-line no-console
    console.log('🔍 [API DEBUG]', debugInfo);

    // Mark in performance timeline (browser only)
    if (typeof window !== 'undefined' && (window as any).performance?.mark) {
      try {
        (window as any).performance.mark(`api-${endpoint}-complete`);
      } catch {
        /* noop */
      }
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('debugApiResponse error:', err);
  }
}

export function withDebug(handler: (req: Request) => Promise<Response>) {
  return async (req: Request): Promise<Response> => {
    console.log(`📥 ${req.method} ${req.url}`);
    try {
      const res = await handler(req);
      console.log(`📤 Response status: ${res.status}`);
      return res;
    } catch (error: any) {
      console.error('💥 Handler error:', error);
      // Lazy import to avoid bringing NextResponse into global scope when not running in Next
      const { NextResponse } = await import('next/server');
      return NextResponse.json(
        {
          success: false,
          error: error?.message ?? 'Internal Server Error',
          stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
        },
        { status: 500 },
      );
    }
  };
} 