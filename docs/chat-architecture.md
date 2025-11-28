## Chat Architecture – Web App ↔ Agents Service

### Overview

The HMNP chat stack is moving toward a model where the web app exposes a single
`/api/ai/chat` endpoint and delegates routing/intents to the **agents service**
when enabled, while keeping a **Vertex-only** path as a safe default.

### Backends

- **Vertex backend (default)**  
  - Route: `/api/ai/chat` (`app/api/ai/chat/route.ts`)  
  - Calls `sendChat` in `lib/vertex.ts` directly.  
  - Handles function calling into internal APIs (distance, availability,
    booking, payments, notes, escalation).

- **Agents backend (feature-flagged)**  
  - Same route: `/api/ai/chat`  
  - When `AI_CHAT_BACKEND=agents`, the route delegates to the agents service
    via `sendAgentsChat` in `lib/agents-client.ts`, which POSTs to
    `POST /chat` on the agents service.
  - The agents service owns: intent classification, routing, model choice,
    and higher-level orchestration.

### Feature Flag

- **Env var**: `AI_CHAT_BACKEND`
  - `vertex` (default / unset): `/api/ai/chat` uses Vertex directly.
  - `agents`: `/api/ai/chat` forwards scrubbed prompts and context to the
    agents service `/chat` endpoint.

`/api/ai/chat` is always responsible for:

- Rate limiting (`withRateLimit('public', 'ai_chat')`)
- PII scrubbing (`scrubPII`)
- Cache lookups/writes (`lib/ai/chat-cache.ts`)
- Conversation tracking (`ConversationTracker`)
- HTTP contract with the frontend

The backend (Vertex vs agents) is an implementation detail behind the route.

### Agents `/chat` Contract (web-app view)

The web app sends:

```ts
// lib/agents-client.ts
interface AgentsChatRequest {
  message: string;           // scrubbed prompt text
  context?: unknown;         // enhanced context (page, path, metadata, etc.)
  customerId?: string;       // optional customer identifier / email
  channel?: string;          // e.g. "web_chat"
}
```

The agents service responds with:

```ts
interface AgentsChatResponse {
  ok: boolean;
  reply: string;             // final text shown to user
  intent?: string;           // optional high-level intent
  metadata?: Record<string, unknown>;
  error?: string;
}
```

The `/api/ai/chat` route normalizes that into the existing response shape used
by the frontend (`response`, `intent`, `suggestedActions`, etc.), so the UI
does not need to change when switching backends.

### Responsibilities & Ownership

- **Web app (`/api/ai/chat`)**
  - Auth/session awareness (if needed)
  - Rate limiting and abuse prevention
  - PII scrubbing before any external calls
  - Caching decisions
  - Conversation logging into HMNP systems
  - Stable HTTP contract for the chat widget/clients

- **Agents service (`/chat`)**
  - Intent classification and routing (which agent/model to use)
  - Local vs cloud model selection, cost-aware routing
  - Agent pipelines (classification → router → cache → agent execution)
  - Returning a single, user-ready `reply` plus optional structured metadata

This split lets us evolve the agents side aggressively (new models, routing,
tools) while keeping the web app API surface and security model stable.

See `docs/AI_HYBRID_ROUTING.md` for the detailed routing table, prompt templates, and evaluation set used to tune the hybrid stack before enabling `AI_CHAT_BACKEND=agents` in production.


