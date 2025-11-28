import path from 'node:path';
import { promises as fs } from 'node:fs';

import { prisma } from '@/lib/db';
import { Prisma } from '@/lib/prisma-types';
import { normalizeSlug } from '@/lib/blogs';

const AGENT_BLOGS_DIR = path.join(process.cwd(), 'content', 'blogs');

type JsonValue = Prisma.JsonValue;

function toJson(value?: Record<string, unknown> | null): JsonValue | undefined {
  if (!value) return undefined;
  return value as JsonValue;
}

export interface AgentBlogPayload {
  jobId?: string | null;
  blogData: {
    title: string;
    slug?: string | null;
    summary?: string | null;
    metaDescription?: string | null;
    author?: string | null;
    body: string;
    publishedAt?: string | null;
  };
  job?: Record<string, unknown> | null;
  timestamp?: string | null;
}

export interface AgentLeadPayload {
  correlationId: string;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  message?: string | null;
  serviceType?: string | null;
  urgency?: string | null;
  status?: string | null;
  source?: string | null;
  raw?: Record<string, unknown>;
}

export interface AgentJobPayload {
  jobId: string;
  correlationId?: string | null;
  customerName?: string | null;
  phone?: string | null;
  email?: string | null;
  serviceType?: string | null;
  status?: string | null;
  appointmentDateTime?: string | null;
  confirmedPrice?: number | string | null;
  raw?: Record<string, unknown>;
}

export interface AgentPricingPayload {
  correlationId: string;
  total: number | string;
  baseFee?: number | string | null;
  travelFee?: number | string | null;
  rushFee?: number | string | null;
  pricingVersion?: string | null;
  needsReview?: boolean | null;
  raw?: Record<string, unknown>;
}

function toDecimal(value?: number | string | null): Prisma.Decimal | null {
  if (value == null) return null;
  try {
    return new Prisma.Decimal(value);
  } catch {
    return null;
  }
}

function parseDate(input?: string | null): Date {
  if (!input) return new Date();
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return new Date();
  }
  return date;
}

function buildFrontmatter(metadata: Record<string, unknown>): string {
  const lines = Object.entries(metadata)
    .map(([key, value]) => `${key}: ${JSON.stringify(value ?? '')}`)
    .join('\n');
  return `---\n${lines}\n---`;
}

export async function persistAgentBlog(payload: AgentBlogPayload) {
  const { blogData } = payload;
  const slug = normalizeSlug(
    blogData.slug || blogData.title || payload.jobId || `blog-${Date.now()}`,
  );
  const publishedAtIso =
    blogData.publishedAt || payload.timestamp || new Date().toISOString();
  const publishedAtDate = parseDate(publishedAtIso);
  const summary = blogData.summary || '';
  const metaDescription = blogData.metaDescription || summary;
  const frontmatter = buildFrontmatter({
    title: blogData.title,
    slug,
    summary,
    metaDescription,
    author: blogData.author || 'Houston Mobile Notary Pros',
    date: publishedAtIso,
    jobId: payload.jobId ?? undefined,
    source: 'agents',
  });

  await fs.mkdir(AGENT_BLOGS_DIR, { recursive: true });
  const filePath = path.join(AGENT_BLOGS_DIR, `${slug}.md`);
  const content = `${frontmatter}\n\n${blogData.body.trim()}\n`;
  await fs.writeFile(filePath, content, 'utf8');

  const jobMetadata = payload.job ? (payload.job as JsonValue) : undefined;

  if (payload.jobId) {
    const existing = await prisma.agentBlog.findUnique({
      where: { jobId: payload.jobId },
    });
    if (existing) {
      await prisma.agentBlog.update({
        where: { id: existing.id },
        data: {
          title: blogData.title,
          slug,
          summary,
          metaDescription,
          author: blogData.author,
          publishedAt: publishedAtDate,
          filePath,
          metadata: jobMetadata ?? existing.metadata ?? undefined,
          updatedAt: new Date(),
        },
      });
      return { slug, filePath };
    }
  }

  await prisma.agentBlog.upsert({
    where: { slug },
    update: {
      title: blogData.title,
      summary,
      metaDescription,
      author: blogData.author,
      publishedAt: publishedAtDate,
      filePath,
      jobId: payload.jobId ?? undefined,
      metadata: jobMetadata,
      updatedAt: new Date(),
    },
    create: {
      title: blogData.title,
      slug,
      summary,
      metaDescription,
      author: blogData.author,
      publishedAt: publishedAtDate,
      filePath,
      jobId: payload.jobId ?? undefined,
      metadata: jobMetadata,
    },
  });

  return { slug, filePath };
}

export async function upsertAgentLead(payload: AgentLeadPayload) {
  return prisma.agentLead.upsert({
    where: { correlationId: payload.correlationId },
    update: {
      name: payload.name ?? undefined,
      phone: payload.phone ?? undefined,
      email: payload.email ?? undefined,
      message: payload.message ?? undefined,
      serviceType: payload.serviceType ?? undefined,
      urgency: payload.urgency ?? undefined,
      status: payload.status ?? undefined,
      source: payload.source ?? undefined,
      metadata: toJson(payload.raw),
      updatedAt: new Date(),
    },
    create: {
      correlationId: payload.correlationId,
      name: payload.name ?? undefined,
      phone: payload.phone ?? undefined,
      email: payload.email ?? undefined,
      message: payload.message ?? undefined,
      serviceType: payload.serviceType ?? undefined,
      urgency: payload.urgency ?? undefined,
      status: payload.status ?? undefined,
      source: payload.source ?? undefined,
      metadata: toJson(payload.raw),
    },
  });
}

export async function upsertAgentJob(payload: AgentJobPayload) {
  return prisma.agentJob.upsert({
    where: { jobId: payload.jobId },
    update: {
      correlationId: payload.correlationId ?? undefined,
      customerName: payload.customerName ?? undefined,
      phone: payload.phone ?? undefined,
      email: payload.email ?? undefined,
      serviceType: payload.serviceType ?? undefined,
      status: payload.status ?? undefined,
      appointmentDateTime: payload.appointmentDateTime
        ? new Date(payload.appointmentDateTime)
        : undefined,
      confirmedPrice: toDecimal(payload.confirmedPrice),
      metadata: toJson(payload.raw),
      updatedAt: new Date(),
    },
    create: {
      jobId: payload.jobId,
      correlationId: payload.correlationId ?? undefined,
      customerName: payload.customerName ?? undefined,
      phone: payload.phone ?? undefined,
      email: payload.email ?? undefined,
      serviceType: payload.serviceType ?? undefined,
      status: payload.status ?? undefined,
      appointmentDateTime: payload.appointmentDateTime
        ? new Date(payload.appointmentDateTime)
        : undefined,
      confirmedPrice: toDecimal(payload.confirmedPrice),
      metadata: toJson(payload.raw),
    },
  });
}

export async function upsertAgentPricingQuote(payload: AgentPricingPayload) {
  return prisma.agentPricingQuote.upsert({
    where: { correlationId: payload.correlationId },
    update: {
      total: new Prisma.Decimal(payload.total),
      baseFee: toDecimal(payload.baseFee),
      travelFee: toDecimal(payload.travelFee),
      rushFee: toDecimal(payload.rushFee),
      pricingVersion: payload.pricingVersion ?? undefined,
      needsReview: payload.needsReview ?? undefined,
      metadata: toJson(payload.raw),
      updatedAt: new Date(),
    },
    create: {
      correlationId: payload.correlationId,
      total: new Prisma.Decimal(payload.total),
      baseFee: toDecimal(payload.baseFee),
      travelFee: toDecimal(payload.travelFee),
      rushFee: toDecimal(payload.rushFee),
      pricingVersion: payload.pricingVersion ?? undefined,
      needsReview: payload.needsReview ?? undefined,
      metadata: toJson(payload.raw),
    },
  });
}

