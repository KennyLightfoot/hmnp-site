-- Create tables to store data pushed from the agents service via webhooks

CREATE TABLE "AgentBlog" (
    "id" TEXT NOT NULL,
    "jobId" TEXT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT,
    "metaDescription" TEXT,
    "author" TEXT,
    "publishedAt" TIMESTAMP(3),
    "filePath" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'agents',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AgentBlog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AgentBlog_jobId_key" ON "AgentBlog"("jobId");
CREATE UNIQUE INDEX "AgentBlog_slug_key" ON "AgentBlog"("slug");
CREATE INDEX "AgentBlog_publishedAt_idx" ON "AgentBlog"("publishedAt");
CREATE INDEX "AgentBlog_createdAt_idx" ON "AgentBlog"("createdAt");

CREATE TABLE "AgentLead" (
    "id" TEXT NOT NULL,
    "correlationId" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "message" TEXT,
    "serviceType" TEXT,
    "urgency" TEXT,
    "status" TEXT,
    "source" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AgentLead_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AgentLead_correlationId_key" ON "AgentLead"("correlationId");
CREATE INDEX "AgentLead_status_idx" ON "AgentLead"("status");
CREATE INDEX "AgentLead_source_idx" ON "AgentLead"("source");
CREATE INDEX "AgentLead_createdAt_idx" ON "AgentLead"("createdAt");

CREATE TABLE "AgentJob" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "correlationId" TEXT,
    "customerName" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "serviceType" TEXT,
    "status" TEXT,
    "appointmentDateTime" TIMESTAMP(3),
    "confirmedPrice" NUMERIC(10,2),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AgentJob_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AgentJob_jobId_key" ON "AgentJob"("jobId");
CREATE INDEX "AgentJob_status_idx" ON "AgentJob"("status");
CREATE INDEX "AgentJob_appointmentDateTime_idx" ON "AgentJob"("appointmentDateTime");
CREATE INDEX "AgentJob_createdAt_idx" ON "AgentJob"("createdAt");

CREATE TABLE "AgentPricingQuote" (
    "id" TEXT NOT NULL,
    "correlationId" TEXT NOT NULL,
    "total" NUMERIC(10,2) NOT NULL,
    "baseFee" NUMERIC(10,2),
    "travelFee" NUMERIC(10,2),
    "rushFee" NUMERIC(10,2),
    "metadata" JSONB,
    "pricingVersion" TEXT,
    "needsReview" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AgentPricingQuote_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AgentPricingQuote_correlationId_key" ON "AgentPricingQuote"("correlationId");
CREATE INDEX "AgentPricingQuote_needsReview_idx" ON "AgentPricingQuote"("needsReview");
CREATE INDEX "AgentPricingQuote_createdAt_idx" ON "AgentPricingQuote"("createdAt");

