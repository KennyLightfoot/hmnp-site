import { GoogleAuth } from 'google-auth-library';

export interface LLMResponse {
  text?: string;
  bookingJson?: any;
}

const project = process.env.GOOGLE_PROJECT_ID;
const location = process.env.GOOGLE_REGION;
const model = process.env.VERTEX_MODEL_ID || 'gemini-2.5-flash';
const corpus = process.env.VERTEX_RAG_CORPUS;
const promptId = process.env.VERTEX_CHAT_PROMPT_ID;

const apiEndpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/publishers/google/models/${model}:streamGenerateContent`;

export async function sendChat(userPrompt: string): Promise<LLMResponse> {
  const auth = new GoogleAuth({ scopes: 'https://www.googleapis.com/auth/cloud-platform' });
  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();

  const body = {
    systemInstruction: { "reference": promptId },
    contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    tools: [{
      citationSources: [{ corpus: corpus }]
    }],
    generationConfig: { temperature: 0.3 }
  };

  const res = await fetch(apiEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Vertex request failed: ${text}`);
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let full = '';
  let bookingJson: any = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    full += chunk;
  }

  try {
    const parsed = JSON.parse(full);
    if (parsed.candidates && parsed.candidates[0]) {
      const parts = parsed.candidates[0].content.parts;
      if (typeof parts[0]?.text === 'string') {
        full = parts[0].text;
      }
      if (parts[1]?.inlineData) {
        bookingJson = JSON.parse(Buffer.from(parts[1].inlineData.data, 'base64').toString('utf8'));
      }
    }
  } catch (e) {
    // ignore parse errors
  }

  return { text: full, bookingJson };
}
