## Hybrid LLM Routing Plan (Vertex + Agents)

### Goals
- Keep `/api/ai/chat` stable while allowing the agents service to decide between **hosted** (Vertex/OpenAI/Gemini) and **local** models per job.
- Guarantee safety rules (see `docs/AI_ASSISTANT_QUICK_REFERENCE.md`) even when local models handle low-risk tasks.
- Provide a repeatable evaluation set so we can measure accuracy/quality before switching more traffic to the hybrid path.

### Job Types & Recommended Models

| Job Type | Primary Models | Fallback | Notes |
|----------|----------------|----------|-------|
| `pricing` (quotes, travel fees) | Hosted pricing agent (Gemini 2.5 / GPT-4o) | Local Llama 3.1 70B | Hosted models stay authoritative when the quote can trigger payments. |
| `classification` (intent, policy) | Local Llama 3.2 11B | Vertex | Fast, cheap, and keeps PIIs local. |
| `customer_reply` (SMS/email) | Local for low-risk, hosted for escalations | Vertex (hosted) | Use tone presets from `content/tone-presets.ts`; escalate to hosted when intent = `complaint`, `legal`, `VIP`. |
| `review_reply` | Hosted (Gemini 2.5) for 1-3⭐ reviews, local for 4-5⭐ | Local | Hosted models keep nuance + brand safety under negative sentiment. |
| `content_blog` | Hosted (Gemini 2.5 w/ RAG) | Local summarizer | Pull brand voice prompts from `docs/AI_RECEPTIONIST.md` + tone presets. |
| `sop_followup` | Local | Hosted | Deterministic templates; local is sufficient. |
| `lead_scoring` | Local + simple rules | Hosted (only if confidence < 0.6) | Outputs normalized score 0–1 plus tags. |

### Prompt Templates

#### Pricing Agent (Hosted)
```
You are HMNP's pricing expert. Use the 2025 mobile/RON pricebook:
- Standard Mobile: $75 base, up to 4 docs, 20mi included.
- Extended Hours: $125 base, 30mi included, evening/weekend friendly.
- Loan Signing: $175 flat, 30mi included, +$25 evenings/weekends.
Add travel tiers: 21–30mi +$25, 31–40mi +$45, 41–50mi +$65.
Rush fee: +$20 same day, +$40 <4h notice.
Respond with JSON: { "total": number, "baseFee": number, "travelFee": number, "rushFee": number, "explanation": string }.
```

#### Customer Reply Agent (Local)
```
You are HMNP's concierge. Tone preset: {{tone_preset.examplePrompt}}.
Rules:
- Acknowledge emotion first.
- Offer 2 actionable next steps.
- Never promise HELOC or out-of-coverage service.
Return a short paragraph (≤120 words) plus `action_recommendations` array.
```

#### Review Reply Agent (Hosted for ≤3⭐)
```
We received a {{rating}}⭐ review on {{platform}}:
"{{reviewText}}"
Write a 60-80 word response that:
1. Thanks the reviewer and mirrors any praise.
2. If rating ≤3, apologizes once and offers a fix.
3. Reinforces punctuality + extended hours promise.
Sign as "— The HMNP Team".
```

### Evaluation Set
- File: `automation/evals/hybrid-routing-evals.json`
- Command: `pnpm agents:eval-plan`
  - Prints counts per job type and hosted/local preference.
  - Use inside the agents repo to replay each case and record accuracy / safety.
- Each entry includes:
  - `jobType`
  - Sample payload (`input`)
  - `expectedRouting`: ordered steps the router should take (e.g., `classifier:local`, `pricing_agent:hosted`).
  - `successCriteria`: bullet list operators can audit.

### How to Use the Eval Set
1. Run `pnpm agents:eval-plan` for a quick summary and to confirm the JSON is valid.
2. Inside the agents service, build a simple runner that:
   - Loads each test case.
   - Forces the router to follow the listed `expectedRouting`.
   - Logs <model, latency, cost, pass/fail notes>.
3. Store results in `automation/evals/results/*.json` (ignored by git) so you can compare hosted vs local changes before flipping `AI_CHAT_BACKEND=agents` to production.

### Routing Rules Cheat Sheet
- **Hosted required** when:
  - Price will be shown to customers automatically.
  - Sentiment ≤ 3⭐ or intent includes `complaint`, `legal`, `chargeback`.
  - Blog/content is going to be published externally.
- **Local preferred** when:
  - Task is classification, scoring, SOP reminders, or templated SMS.
  - Output feeds internal dashboards only.
  - Customer PII should remain on the automation box.
- **Human review**:
  - Any HELOC request.
  - Requests outside 60-mile coverage.
  - RON bookings flagged as "international" or "crypto".

Keep this document alongside `docs/chat-architecture.md` and `docs/AI_ASSISTANT_QUICK_REFERENCE.md` so you always know which prompts, tone presets, and eval cases to update when the routing policy changes.

