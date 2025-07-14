import { GoogleAuth } from 'google-auth-library';
import fs from 'fs';

export interface LLMResponse {
  text?: string;
  bookingJson?: any;
}

function logVertexResponse(prompt: string, response: LLMResponse) {
  try {
    fs.mkdirSync('logs', { recursive: true });
    const logEntry = {
      timestamp: new Date().toISOString(),
      prompt,
      response,
      hasBookingJson: !!response.bookingJson
    };
    fs.appendFileSync('logs/vertex.log', JSON.stringify(logEntry) + '\n');
  } catch (error) {
    console.error('Failed to write to vertex log:', error);
  }
}

const project = process.env.GOOGLE_PROJECT_ID;
const location = process.env.GOOGLE_REGION;
const model = process.env.VERTEX_MODEL_ID || 'gemini-2.5-flash';
const corpus = process.env.VERTEX_RAG_CORPUS;
const promptId = process.env.VERTEX_CHAT_PROMPT_ID;

const apiEndpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/publishers/google/models/${model}:streamGenerateContent`;

export async function sendChat(
  userPrompt: string, 
  systemPrompt?: string, 
  context?: any
): Promise<LLMResponse> {
  // Use service account credentials from environment
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON environment variable is required');
  }
  
  const credentials = JSON.parse(serviceAccountJson);
  // Explicitly format the private key to replace escaped newlines
  credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');

  const auth = new GoogleAuth({ 
    credentials,
    scopes: 'https://www.googleapis.com/auth/cloud-platform' 
  });
  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();

  // Build the request body
  const body: any = {
    contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    tools: [{
      citationSources: [{ corpus: corpus }]
    }],
    generationConfig: { 
      temperature: 0.3,
      maxOutputTokens: 1000
    }
  };

  // Add system instruction - prefer custom systemPrompt over default promptId
  if (systemPrompt) {
    body.systemInstruction = { 
      parts: [{ text: systemPrompt }] 
    };
  } else if (promptId) {
    body.systemInstruction = { "reference": promptId };
  }

  // Add context as additional parts if provided
  if (context) {
    const contextText = `Context: ${JSON.stringify(context, null, 2)}`;
    body.contents[0].parts.push({ text: contextText });
  }

  // Remove the structured response schema for now - it's too restrictive for general chat
  // body.generationConfig.responseSchema = { ... }

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

  const result = { text: full, bookingJson };
  logVertexResponse(userPrompt, result);
  return result;
}
