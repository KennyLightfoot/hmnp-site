import { sendChat, LLMResponse } from '@/lib/vertex'
import { alertManager } from '@/lib/monitoring/alert-manager'

interface AIProviderResponse extends LLMResponse {
  text: string
}

const BACKOFF_MS = [100, 400, 1600] // 3 attempts → 100 ms, 400 ms, 1.6 s

/**
 * Return an LLM response with automatic retry and provider fail-over.
 * 1) Vertex AI (Gemini) — 3 retries, exponential back-off
 * 2) OpenAI (if OPENAI_API_KEY present)
 * 3) Tiny rule-based FAQ fallback so users always get *something*
 */
export async function getResponse(
  prompt: string,
  systemPrompt?: string,
  context?: any
): Promise<AIProviderResponse> {
  let lastError: any

  // ---------- 1. Vertex AI with retry ----------
  for (let i = 0; i < BACKOFF_MS.length; i++) {
    try {
      const res = await sendChat(prompt, systemPrompt, context)
      if (res?.text && res.text.trim()) {
        return res as AIProviderResponse
      }
      throw new Error('Vertex AI returned empty text')
    } catch (err) {
      lastError = err
      if (i < BACKOFF_MS.length - 1) {
        await new Promise(r => setTimeout(r, BACKOFF_MS[i]))
      }
    }
  }

  // ---------- 2. OpenAI fallback ----------
  const openaiKey = process.env.OPENAI_API_KEY
  if (openaiKey) {
    try {
      const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
          messages: [
            systemPrompt ? { role: 'system', content: systemPrompt } : null,
            { role: 'user', content: prompt }
          ].filter(Boolean),
          temperature: 0.7,
          max_tokens: 256
        })
      })
      const json: any = await resp.json()
      const text: string | undefined = json?.choices?.[0]?.message?.content
      if (text && text.trim()) {
        // Record that we had to fallback
        try {
          await alertManager.recordMetric('ai.chat.provider.fallback', 1, { provider: 'openai' })
        } catch (_) {}
        return { text } as AIProviderResponse
      }
      throw new Error('OpenAI returned empty text')
    } catch (err) {
      lastError = err
    }
  }

  // ---------- 3. Rule-based FAQ fallback ----------
  const faq = ruleBasedFallback(prompt)
  if (faq) {
    try {
      await alertManager.recordMetric('ai.chat.provider.fallback', 1, { provider: 'faq' })
    } catch (_) {}
    return { text: faq } as AIProviderResponse
  }

  // ---------- All providers exhausted ----------
  throw lastError || new Error('AI providers unavailable')
}

function ruleBasedFallback(prompt: string): string | null {
  const q = prompt.toLowerCase()
  if (q.includes('price') || q.includes('cost')) {
    return 'Standard Mobile Notary visits start at $75 within 30 miles of Houston. Let me know your address and document count and I can give an exact quote!'
  }
  if (q.includes('hours') || q.includes('open')) {
    return 'We’re available 7 am – 9 pm every day for mobile visits, and 24/7 for remote online notarization. How can I help?'
  }
  if (q.includes('phone') || q.includes('contact')) {
    return 'You can reach us at (832) 617-4285 anytime, or just ask me here and I’ll help right away.'
  }
  return null
} 