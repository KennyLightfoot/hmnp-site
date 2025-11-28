-- CreateEnum
CREATE TYPE "ContentJobType" AS ENUM ('BLOG', 'AD', 'REVIEW_REPLY', 'CUSTOMER_REPLY', 'DOCUMENT_SUMMARY');

-- CreateEnum
CREATE TYPE "ContentJobStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'PUBLISHED');

-- CreateTable
CREATE TABLE "ContentJob" (
    "id" TEXT NOT NULL,
    "type" "ContentJobType" NOT NULL,
    "status" "ContentJobStatus" NOT NULL DEFAULT 'NEW',
    "title" TEXT,
    "instructions" TEXT,
    "targetCity" TEXT,
    "serviceType" TEXT,
    "tonePreset" TEXT,
    "agentJobId" TEXT,
    "draft" JSONB,
    "approvedContent" JSONB,
    "publishedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentJob_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ContentJob" ADD CONSTRAINT "ContentJob_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Indexes
CREATE INDEX "ContentJob_status_idx" ON "ContentJob"("status");
CREATE INDEX "ContentJob_agentJobId_idx" ON "ContentJob"("agentJobId");

