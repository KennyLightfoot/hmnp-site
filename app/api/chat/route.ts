import { NextRequest } from 'next/server';
import { sendChatStream } from '@/lib/vertex';

export async function POST(req: NextRequest) {
  const { user } = await req.json();
  if (!user) {
    return new Response(JSON.stringify({ error: 'user required' }), { status: 400 });
  }

  const encoder = new TextEncoder();
  let bookingJson: any = null;
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of sendChatStream(user)) {
          if (chunk.text) {
            controller.enqueue(encoder.encode(`data: ${chunk.text}\n\n`));
          }
          if (chunk.bookingJson) {
            bookingJson = chunk.bookingJson;
          }
        }
        if (bookingJson) {
          try {
            const bookingRes = await fetch(new URL('/api/booking', req.url), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(bookingJson)
            });
            const data = await bookingRes.json();
            controller.enqueue(encoder.encode(`event: booking-confirm\n`));
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
          } catch (err: any) {
            controller.enqueue(encoder.encode(`event: booking-error\n`));
            controller.enqueue(encoder.encode(`data: ${err.message}\n\n`));
          }
        }
        controller.close();
      } catch (e: any) {
        controller.enqueue(encoder.encode(`event: error\n`));
        controller.enqueue(encoder.encode(`data: ${e.message}\n\n`));
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}
