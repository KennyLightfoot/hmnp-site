import { NextRequest } from 'next/server';
import { sendChat } from '@/lib/vertex';

export async function POST(req: NextRequest) {
  const { user } = await req.json();
  if (!user) {
    return new Response(JSON.stringify({ error: 'user required' }), { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const result = await sendChat(user);
        if (result.text) {
          controller.enqueue(encoder.encode(`data: ${result.text}\n\n`));
        }
        if (result.bookingJson) {
          controller.enqueue(encoder.encode(`event: booking\n`));
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(result.bookingJson)}\n\n`));
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
