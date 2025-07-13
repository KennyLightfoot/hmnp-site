import { GoogleAuth } from 'google-auth-library';
import fs from 'fs';

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

export async function* sendChatStream(userPrompt: string): AsyncGenerator<LLMResponse> {
  const auth = new GoogleAuth({ scopes: 'https://www.googleapis.com/auth/cloud-platform' });
  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();

  const body = {
    systemInstruction: { "reference": promptId },
    contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    tools: [{
      citationSources: [{ corpus: corpus }]
    }],
    generationConfig: { temperature: 0.3 },
    structuredOutputConfig: { enable: true }
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
  fs.mkdirSync('logs', { recursive: true });
  const logStream = fs.createWriteStream('logs/vertex.log', { flags: 'a' });

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let full = '';
  let bookingJson: any = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    logStream.write(chunk);
    buffer += chunk;
    let lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const json = JSON.parse(line);
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          full += text;
          yield { text };
        }
        const inline = json.candidates?.[0]?.content?.parts?.[1]?.inlineData;
        if (inline) {
          bookingJson = JSON.parse(Buffer.from(inline.data, 'base64').toString('utf8'));
        }
      } catch {
        /* ignore */
      }
    }
  }

  logStream.end();

  if (bookingJson) {
    yield { bookingJson };
  }
}

export async function sendChat(userPrompt: string): Promise<LLMResponse> {
  let finalText = '';
  let booking: any = null;
  for await (const chunk of sendChatStream(userPrompt)) {
    if (chunk.text) finalText += chunk.text;
    if (chunk.bookingJson) booking = chunk.bookingJson;
  }
  return { text: finalText, bookingJson: booking };
}
