import { GoogleAuth } from 'google-auth-library';
import { getErrorMessage } from '@/lib/utils/error-utils';
import fs from 'fs';

export interface LLMResponse {
  text?: string;
  bookingJson?: any;
}

// Function calling interfaces
interface FunctionCall {
  name: string;
  args: Record<string, any>;
}

interface FunctionResult {
  name: string;
  response: any;
}

// ---------------------------------------------------------------------------
// 📝 Vertex response logging
// ---------------------------------------------------------------------------
// In production on Vercel the filesystem is read-only (except /tmp). Attempting
// to write to ./logs causes noisy ENOENT errors that clutter the logs.  We
// therefore log to a local file only in development.  In production we fallback
// to a concise console.info to retain visibility without throwing.

function logVertexResponse(prompt: string, response: LLMResponse) {
  // Production (incl. Vercel) → console only
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
    console.info('[Vertex]', {
      prompt: prompt.slice(0, 200),
      text: response.text?.slice(0, 200),
      hasBookingJson: !!response.bookingJson
    });
    return;
  }

  // Local development → append to ./logs/vertex.log for deeper debugging
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
    // Don’t crash on logging errors; emit once for visibility.
    console.error('Local Vertex log write failed:', error);
  }
}

const project = process.env.GOOGLE_PROJECT_ID;
const location = process.env.GOOGLE_REGION;
const model = process.env.VERTEX_MODEL_ID || 'gemini-2.5-flash';
const corpus = process.env.VERTEX_RAG_CORPUS;
const promptId = process.env.VERTEX_CHAT_PROMPT_ID;

function buildApiEndpoint(): string {
  if (!project) throw new Error('GOOGLE_PROJECT_ID is required for Vertex AI');
  if (!location) throw new Error('GOOGLE_REGION is required for Vertex AI');
  const modelId = model || 'gemini-2.5-flash';
  return `https://${location}-aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/publishers/google/models/${modelId}:streamGenerateContent`;
}

// Response formatting instructions appended to every system prompt for consistency
const STYLE_GUIDE = `\n\nSTYLE GUIDE (internal):\n• Keep answers to 2–4 sentences.\n• First sentence: give the price or direct answer.\n• Second: briefly explain what's included / why.\n• Third: offer to book, get a quote, or call.\n• Use clear, friendly tone. No markdown or code fences.`;

// Function definitions for AI tools
const FUNCTION_DEFINITIONS = [
  {
    name: 'get_distance',
    description: 'Calculate distance and travel fee from business location to customer address',
    parameters: {
      type: 'object',
      properties: {
        address: {
          type: 'string',
          description: 'Customer address or ZIP code (e.g., "77008" or "123 Main St, Houston, TX")'
        },
        serviceType: {
          type: 'string',
          description: 'Type of service for pricing calculation',
          enum: ['QUICK_STAMP_LOCAL', 'STANDARD_NOTARY', 'EXTENDED_HOURS', 'LOAN_SIGNING', 'RON_SERVICES', 'BUSINESS_ESSENTIALS', 'BUSINESS_GROWTH'],
          default: 'STANDARD_NOTARY'
        }
      },
      required: ['address']
    }
  },
  {
    name: 'get_availability',
    description: 'Check if a specific datetime is available for booking',
    parameters: {
      type: 'object',
      properties: {
        datetime: {
          type: 'string',
          description: 'Requested appointment datetime in ISO format (e.g., "2025-01-17T15:00")'
        },
        serviceType: {
          type: 'string',
          description: 'Type of service to check availability for',
          enum: ['QUICK_STAMP_LOCAL', 'STANDARD_NOTARY', 'EXTENDED_HOURS', 'LOAN_SIGNING', 'RON_SERVICES', 'BUSINESS_ESSENTIALS', 'BUSINESS_GROWTH'],
          default: 'STANDARD_NOTARY'
        }
      },
      required: ['datetime']
    }
  },
  {
    name: 'create_booking',
    description: 'Create a booking appointment in the system',
    parameters: {
      type: 'object',
      properties: {
        serviceType: { type: 'string' },
        customerName: { type: 'string' },
        customerEmail: { type: 'string' },
        scheduledDateTime: { type: 'string', description: 'ISO datetime' },
        locationAddress: { type: 'string' }
      },
      required: ['serviceType', 'customerName', 'customerEmail', 'scheduledDateTime']
    }
  },
  {
    name: 'create_payment_link',
    description: 'Create a Stripe checkout session and return a payment URL',
    parameters: {
      type: 'object',
      properties: {
        bookingId: { type: 'string' },
        customerEmail: { type: 'string' },
        customerName: { type: 'string' },
        amount: { type: 'number' },
        description: { type: 'string' }
      },
      required: ['customerEmail', 'customerName', 'amount', 'description']
    }
  },
  {
    name: 'check_pending_payment',
    description: 'Check if a contact has pending payments',
    parameters: {
      type: 'object',
      properties: {
        contactId: { type: 'string' }
      },
      required: ['contactId']
    }
  },
  {
    name: 'log_note',
    description: 'Log a note to the CRM contact timeline',
    parameters: {
      type: 'object',
      properties: {
        contactId: { type: 'string' },
        message: { type: 'string' }
      },
      required: ['contactId', 'message']
    }
  },
  {
    name: 'escalate_to_human',
    description: 'Escalate the conversation to a human and notify the team',
    parameters: {
      type: 'object',
      properties: {
        contactId: { type: 'string' },
        reason: { type: 'string' },
        customerEmail: { type: 'string' },
        customerPhone: { type: 'string' }
      },
      required: ['reason']
    }
  }
];

// Execute function calls by hitting our internal APIs
async function executeFunction(functionCall: FunctionCall): Promise<FunctionResult> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://houstonmobilenotarypros.com';
  
  try {
    if (functionCall.name === 'get_distance') {
      const { address, serviceType = 'STANDARD_NOTARY' } = functionCall.args;
      const url = new URL('/api/_ai/get-distance', baseUrl);
      
      // Handle both ZIP codes and full addresses
      if (address.match(/^\d{5}$/)) {
        url.searchParams.set('zip', address);
      } else {
        url.searchParams.set('address', address);
      }
      url.searchParams.set('serviceType', serviceType);
      
      const response = await fetch(url.toString());
      const data = await response.json();
      
      return {
        name: 'get_distance',
        response: data
      };
    }
    
    if (functionCall.name === 'get_availability') {
      const { datetime, serviceType = 'STANDARD_NOTARY' } = functionCall.args;
      const url = new URL('/api/_ai/get-availability', baseUrl);
      url.searchParams.set('datetime', datetime);
      url.searchParams.set('serviceType', serviceType);
      
      const response = await fetch(url.toString());
      const data = await response.json();
      
      return {
        name: 'get_availability',
        response: data
      };
    }
    if (functionCall.name === 'create_booking') {
      const url = new URL('/api/booking/create', baseUrl);
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(functionCall.args)
      });
      const data = await response.json();
      return { name: 'create_booking', response: data };
    }
    if (functionCall.name === 'create_payment_link') {
      const url = new URL('/api/create-checkout-session', baseUrl);
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(functionCall.args)
      });
      const data = await response.json();
      return { name: 'create_payment_link', response: data };
    }
    if (functionCall.name === 'check_pending_payment') {
      // Placeholder implementation – backend endpoint can be added later
      const { contactId } = functionCall.args || {};
      return { name: 'check_pending_payment', response: { contactId, pending: false } };
    }
    if (functionCall.name === 'log_note') {
      const url = new URL('/api/_ai/log-note', baseUrl);
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(functionCall.args)
      });
      const data = await response.json();
      return { name: 'log_note', response: data };
    }
    if (functionCall.name === 'escalate_to_human') {
      const url = new URL('/api/_ai/escalate', baseUrl);
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(functionCall.args)
      });
      const data = await response.json();
      return { name: 'escalate_to_human', response: data };
    }
    
    throw new Error(`Unknown function: ${functionCall.name}`);
    
  } catch (error) {
    console.error(`Function execution error for ${functionCall.name}:`, error);
    return {
      name: functionCall.name,
      response: {
        error: `Failed to execute ${functionCall.name}`,
        details: error instanceof Error ? getErrorMessage(error) : 'Unknown error'
      }
    };
  }
}

export async function sendChat(
  userPrompt: string, 
  systemPrompt?: string, 
  context?: any
): Promise<LLMResponse> {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON environment variable is required');
  }
  if (!project || !location) {
    throw new Error('GOOGLE_PROJECT_ID and GOOGLE_REGION are required for Vertex AI');
  }
  // Use service account credentials from environment
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  
  // Remove outer quotes if they exist (common in environment variables)
  let jsonStr = serviceAccountJson;
  if (jsonStr.startsWith('"') && jsonStr.endsWith('"')) {
    jsonStr = jsonStr.slice(1, -1);
  }
  
  const credentials = JSON.parse(jsonStr);
  // Explicitly format the private key to replace escaped newlines
  credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');

  const auth = new GoogleAuth({ 
    credentials,
    scopes: 'https://www.googleapis.com/auth/cloud-platform' 
  });
  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();
  const accessToken = typeof tokenResponse === 'string'
    ? tokenResponse
    : tokenResponse?.token;
  if (!accessToken) {
    throw new Error('Failed to obtain access token from GoogleAuth');
  }

  // Build the request body with both retrieval and function tools
  const body: any = {
    contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    tools: [
      {
        function_declarations: FUNCTION_DEFINITIONS
      }
    ],
    generationConfig: { 
      temperature: 0.2,
      maxOutputTokens: 300
    }
  };

  const ragEnabled = typeof corpus === 'string' && corpus.length > 0;
  if (ragEnabled) {
    body.tools.unshift({
      retrieval: {
        vertex_rag_store: {
          rag_resources: [{ rag_corpus: corpus }],
          similarity_top_k: 5
        },
        disable_attribution: false
      }
    });
  }

  // Add system instruction - prefer custom systemPrompt over default promptId
  if (systemPrompt) {
    body.systemInstruction = { 
      parts: [{ text: systemPrompt + STYLE_GUIDE }] 
    };
  } else if (promptId) {
    body.systemInstruction = { "reference": promptId };
  }

  // Add context as additional parts if provided
  if (context) {
    const contextText = `Context: ${JSON.stringify(context, null, 2)}`;
    body.contents[0].parts.push({ text: contextText });
  }

  // Function calling loop - may need multiple requests
  let conversationHistory = [...body.contents];
  let finalResponse = { text: '', bookingJson: null };
  const MAX_ITERATIONS = 6; // Allow more cycles but still protect against loops

  let lastAssembledText = '';
  for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
    // Update body with current conversation history
    body.contents = conversationHistory;

  const res = await fetch(buildApiEndpoint(), {
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
    let buffer = '';
    let assembledText = '';
  let bookingJson: any = null;
    let functionCalls: FunctionCall[] = [];

    // Parse streaming response
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split(/\n/);
      buffer = lines.pop() || '';

      for (const raw of lines) {
        const line = raw.trim();
        if (!line) continue;

        const jsonStr = line.startsWith('data:') ? line.slice(5).trim() : line;

  try {
          const parsed = JSON.parse(jsonStr);
          const candidate = parsed?.candidates?.[0];
          const parts = candidate?.content?.parts;
          
          if (Array.isArray(parts)) {
            for (const part of parts) {
              // Text content
              if (typeof part?.text === 'string') {
                assembledText += part.text;
      }
              
              // Function calls
              if (part?.functionCall) {
                functionCalls.push({
                  name: part.functionCall.name,
                  args: part.functionCall.args || {}
                });
              }
              
              // Booking JSON (existing functionality)
              if (!bookingJson && part?.inlineData?.data) {
                try {
                  bookingJson = JSON.parse(Buffer.from(part.inlineData.data, 'base64').toString('utf8'));
                } catch (_) {
                  /* noop */
                }
              }
      }
    }
        } catch (_err) {
          // Ignore parse errors
  }
      }
    }

    // If no function calls, we're done
    if (functionCalls.length === 0) {
      let cleanText = assembledText.trim();
      if (cleanText.startsWith(']')) {
        cleanText = cleanText.slice(1).trimStart();
      }
      
      finalResponse = { text: cleanText, bookingJson };
      break;
    }

    // Store for fallback in case we exceed MAX_ITERATIONS
    if (assembledText.trim()) {
      lastAssembledText = assembledText.trim();
    }

    // Execute function calls
    console.log(`Executing ${functionCalls.length} function calls:`, functionCalls.map(fc => fc.name));
    
    const functionResults: FunctionResult[] = [];
    for (const functionCall of functionCalls) {
      const result = await executeFunction(functionCall);
      functionResults.push(result);
    }

    // Add function call and results to conversation history
    conversationHistory.push({
      role: 'model',
      parts: functionCalls.map(fc => ({
        functionCall: {
          name: fc.name,
          args: fc.args
        }
      }))
    });

    conversationHistory.push({
      role: 'function',
      parts: functionResults.map(fr => ({
        functionResponse: {
          name: fr.name,
          response: fr.response
        }
      }))
    });

    // Continue loop to get final response with function results
  }

  // Fallback: if loop exited without a clean finalResponse but we did capture
  // some text, use it so the caller isn’t left empty-handed.
  if (!finalResponse.text && lastAssembledText) {
    finalResponse.text = lastAssembledText;
  }

  const result = finalResponse;
  logVertexResponse(userPrompt, result);
  return result;
}
