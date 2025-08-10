import { NextResponse } from 'next/server';

export async function GET() {
  const redact = (v?: string) => (v ? `${v.slice(0, 4)}***${v.slice(-4)}` : undefined);
  const hasJson = !!process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  const hasMaps = !!process.env.GOOGLE_MAPS_API_KEY;
  const project = process.env.GOOGLE_PROJECT_ID;
  const region = process.env.GOOGLE_REGION;
  const model = process.env.VERTEX_MODEL_ID || 'gemini-2.5-flash';
  const rag = process.env.VERTEX_RAG_CORPUS;
  const prompt = process.env.VERTEX_CHAT_PROMPT_ID;

  const status = {
    vertex: {
      projectConfigured: !!project,
      regionConfigured: !!region,
      model,
      serviceAccountJson: hasJson,
      ragConfigured: !!rag,
      promptConfigured: !!prompt,
    },
    maps: hasMaps,
    baseUrl: process.env.NEXT_PUBLIC_SITE_URL,
    glimpses: {
      project,
      region,
      rag,
      prompt,
      mapsKey: redact(process.env.GOOGLE_MAPS_API_KEY),
    },
  };

  const ok = status.vertex.projectConfigured && status.vertex.regionConfigured && status.vertex.serviceAccountJson;
  return NextResponse.json({ success: ok, status });
}


