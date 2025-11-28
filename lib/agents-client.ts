/**
 * Thin client for talking to the HMNP Agents service from the web app.
 *
 * This is intentionally very small and opinionated:
 * - Server-side only (used by route handlers and server components)
 * - No client-side exposure of the agents base URL
 * - Minimal types that mirror the agents HTTP responses
 */

import { buildAgentsUrl, AGENTS_ADMIN_SECRET } from './agents-config';

// ───────────────────────────────── Types ────────────────────────────────

export interface AgentsBlog {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  slug: string;
  summary: string;
  metaDescription: string;
  body: string;
}

export interface AgentsBlogsResponse {
  ok: boolean;
  count: number;
  blogs: AgentsBlog[];
  error?: string;
}

export interface AgentsLead {
  correlationId: string;
  name?: string;
  phone?: string;
  email?: string;
  message?: string;
  serviceType?: string;
  urgency?: string;
  status?: string;
  source?: string;
  timestamp: string;
}

export interface AgentsLeadsResponse {
  ok: boolean;
  count: number;
  leads: AgentsLead[];
  error?: string;
}

export interface AgentsJob {
  jobId: string;
  correlationId?: string;
  customerName?: string;
  phone?: string;
  email?: string;
  serviceType?: string;
  appointmentDateTime?: string;
  status?: string;
  confirmedPrice?: number;
}

export interface AgentsJobsResponse {
  ok: boolean;
  count: number;
  jobs: AgentsJob[];
  error?: string;
}

export interface AgentsPricingQuote {
  correlationId: string;
  total: number;
  baseFee: number;
  travelFee: number;
  rushFee: number;
  pricingVersion?: string;
  needsReview?: boolean;
  timestamp: string;
}

export interface AgentsPricingResponse {
  ok: boolean;
  count: number;
  pricing: AgentsPricingQuote[];
  error?: string;
}

export interface AgentsStats {
  totalLeads: number;
  totalJobs: number;
  totalPricingQuotes: number;
  leadsByStatus?: Record<string, number>;
  jobsByStatus?: Record<string, number>;
  quotesNeedingReview?: number;
  [key: string]: unknown;
}

export interface AgentsStatsResponse {
  ok: boolean;
  stats: AgentsStats;
  error?: string;
}

export interface RunAgentsJobRequest {
  text?: string;
  question?: string;
  prompt?: string;
  metadata?: Record<string, unknown> | string;
  jobType?: string;
  contentType?: string;
  urgency?: string;
  correlationId?: string;
  enqueue?: boolean;
}

export interface RunAgentsJobResponse {
  ok: boolean;
  correlationId: string;
  jobId: string | null;
  classification: unknown | null;
  routing: unknown | null;
  data: unknown | null;
  cacheHit: boolean;
  executionTimeMs: number;
  error: string | null;
  meta: Record<string, unknown> | null;
}

export type AgentsReviewJobStatus =
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'IN_PROGRESS'
  | 'FAILED';

export type AgentsReviewJobType = 'BLOG' | 'AD' | 'REPLY' | 'IMAGE' | string;

export interface AgentsReviewJob {
  id: string;
  type: AgentsReviewJobType;
  status: AgentsReviewJobStatus;
  createdAt: string;
  updatedAt: string;
  payload: unknown;
  result?: unknown | null;
  reviewerNotes?: string | null;
}

export interface ListReviewJobsResponse {
  ok: boolean;
  count: number;
  jobs: AgentsReviewJob[];
  error?: string;
}

export interface GetReviewJobResponse {
  ok: boolean;
  job: AgentsReviewJob;
  error?: string;
}

// ────────────────────────────── Internal helper ─────────────────────────

async function fetchFromAgents<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const url = buildAgentsUrl(path);

  const response = await fetch(url, {
    // Always keep this server-side
    cache: 'no-store',
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(
      `Agents request failed: ${response.status} ${response.statusText}`,
    );
  }

  return (await response.json()) as T;
}

// ───────────────────────────── Public helpers ───────────────────────────

export async function fetchApprovedBlogsFromAgents(): Promise<AgentsBlogsResponse> {
  return fetchFromAgents<AgentsBlogsResponse>('/blogs/approved');
}

export async function fetchAgentsLeads(params: {
  limit?: number;
  status?: string;
  source?: string;
  dateFrom?: string;
}): Promise<AgentsLeadsResponse> {
  const search = new URLSearchParams();

  if (params.limit != null) search.set('limit', String(params.limit));
  if (params.status) search.set('status', params.status);
  if (params.source) search.set('source', params.source);
  if (params.dateFrom) search.set('dateFrom', params.dateFrom);

  const path =
    search.size > 0
      ? `/api/business/leads?${search.toString()}`
      : '/api/business/leads';

  return fetchFromAgents<AgentsLeadsResponse>(path);
}

export async function fetchAgentsJobs(params: {
  limit?: number;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<AgentsJobsResponse> {
  const search = new URLSearchParams();

  if (params.limit != null) search.set('limit', String(params.limit));
  if (params.status) search.set('status', params.status);
  if (params.dateFrom) search.set('dateFrom', params.dateFrom);
  if (params.dateTo) search.set('dateTo', params.dateTo);

  const path =
    search.size > 0
      ? `/api/business/jobs?${search.toString()}`
      : '/api/business/jobs';

  return fetchFromAgents<AgentsJobsResponse>(path);
}

export async function fetchAgentsPricing(params: {
  limit?: number;
  needsReview?: boolean;
  dateFrom?: string;
}): Promise<AgentsPricingResponse> {
  const search = new URLSearchParams();

  if (params.limit != null) search.set('limit', String(params.limit));
  if (params.needsReview != null) {
    search.set('needsReview', params.needsReview ? 'true' : 'false');
  }
  if (params.dateFrom) search.set('dateFrom', params.dateFrom);

  const path =
    search.size > 0
      ? `/api/business/pricing?${search.toString()}`
      : '/api/business/pricing';

  return fetchFromAgents<AgentsPricingResponse>(path);
}

export async function fetchAgentsStats(): Promise<AgentsStatsResponse> {
  return fetchFromAgents<AgentsStatsResponse>('/api/business/stats');
}

export async function runAgentsJob(
  payload: RunAgentsJobRequest,
): Promise<RunAgentsJobResponse> {
  return fetchFromAgents<RunAgentsJobResponse>('/jobs', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ───────────────────────────── Chat adapter (planned) ─────────────────────

/**
 * Shape of the chat request the web app sends to the agents service.
 * This intentionally mirrors the core fields of `/api/ai/chat` so the
 * adapter in the Next.js route can stay thin.
 */
export interface AgentsChatRequest {
  message: string;
  context?: unknown;
  customerId?: string;
  channel?: string;
}

export interface AgentsChatResponse {
  ok: boolean;
  reply: string;
  intent?: string;
  metadata?: Record<string, unknown>;
  error?: string;
}

/**
 * Send a chat message to the agents service `/chat` endpoint.
 *
 * NOTE: The `/chat` endpoint is part of the agents service and may be
 * rolled out after this adapter. The web app will only call this when
 * the `AI_CHAT_BACKEND=agents` feature flag is enabled.
 */
export async function sendAgentsChat(
  payload: AgentsChatRequest,
): Promise<AgentsChatResponse> {
  return fetchFromAgents<AgentsChatResponse>('/chat', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ───────────────────── Content review helpers (admin-only) ────────────────────

/**
 * List jobs in the owner review queue, typically filtered to pending BLOG
 * jobs for the content UI. Uses the protected /review/jobs endpoint and
 * includes the admin secret when configured.
 */
export async function listReviewJobs(params: {
  status?: AgentsReviewJobStatus;
  contentType?: AgentsReviewJobType;
  limit?: number;
}): Promise<ListReviewJobsResponse> {
  const search = new URLSearchParams();

  if (params.status) search.set('status', params.status);
  if (params.contentType) search.set('contentType', String(params.contentType));
  if (params.limit != null) search.set('limit', String(params.limit));

  const path =
    search.size > 0
      ? `/review/jobs?${search.toString()}`
      : '/review/jobs';

  const headers: Record<string, string> = {};
  if (AGENTS_ADMIN_SECRET) {
    headers['x-api-key'] = AGENTS_ADMIN_SECRET;
  }

  return fetchFromAgents<ListReviewJobsResponse>(path, {
    headers,
  });
}

export async function getReviewJob(
  id: string,
): Promise<GetReviewJobResponse> {
  const headers: Record<string, string> = {};
  if (AGENTS_ADMIN_SECRET) {
    headers['x-api-key'] = AGENTS_ADMIN_SECRET;
  }

  return fetchFromAgents<GetReviewJobResponse>(`/review/jobs/${id}`, {
    headers,
  });
}

export async function approveReviewJob(
  id: string,
): Promise<GetReviewJobResponse> {
  const headers: Record<string, string> = {};
  if (AGENTS_ADMIN_SECRET) {
    headers['x-api-key'] = AGENTS_ADMIN_SECRET;
  }

  return fetchFromAgents<GetReviewJobResponse>(
    `/review/jobs/${id}/approve`,
    {
      method: 'POST',
      headers,
    },
  );
}

export async function rejectReviewJob(
  id: string,
  reviewerNotes?: string,
): Promise<GetReviewJobResponse> {
  const headers: Record<string, string> = {};
  if (AGENTS_ADMIN_SECRET) {
    headers['x-api-key'] = AGENTS_ADMIN_SECRET;
  }

  const body =
    reviewerNotes && reviewerNotes.trim().length > 0
      ? JSON.stringify({ reviewerNotes })
      : JSON.stringify({});

  return fetchFromAgents<GetReviewJobResponse>(
    `/review/jobs/${id}/reject`,
    {
      method: 'POST',
      headers,
      body,
    },
  );
}


