-- CreateEnum
CREATE TYPE "SupportIssueType" AS ENUM ('booking_question', 'payment_issue', 'reschedule_request', 'cancellation_request', 'service_issue', 'technical_support', 'billing_inquiry', 'general_inquiry', 'complaint', 'feedback');

-- CreateEnum
CREATE TYPE "SupportPriority" AS ENUM ('low', 'medium', 'high', 'urgent');

-- CreateEnum
CREATE TYPE "SupportStatus" AS ENUM ('open', 'in_progress', 'waiting_customer', 'resolved', 'closed');

-- CreateTable
CREATE TABLE "SupportTicket" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT,
    "customerEmail" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "issueType" "SupportIssueType" NOT NULL,
    "priority" "SupportPriority" NOT NULL DEFAULT 'medium',
    "description" TEXT NOT NULL,
    "status" "SupportStatus" NOT NULL DEFAULT 'open',
    "assignedTo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),
    "customerSatisfaction" INTEGER,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "metadata" JSONB,

    CONSTRAINT "SupportTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportResponse" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isAutomated" BOOLEAN NOT NULL DEFAULT false,
    "responseTime" INTEGER NOT NULL,
    "nextSteps" TEXT[],
    "escalationNeeded" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "metadata" JSONB,

    CONSTRAINT "SupportResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerSupportHistory" (
    "id" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "interactionType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "CustomerSupportHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SupportTicket_customerEmail_idx" ON "SupportTicket"("customerEmail");

-- CreateIndex
CREATE INDEX "SupportTicket_bookingId_idx" ON "SupportTicket"("bookingId");

-- CreateIndex
CREATE INDEX "SupportTicket_status_idx" ON "SupportTicket"("status");

-- CreateIndex
CREATE INDEX "SupportTicket_priority_idx" ON "SupportTicket"("priority");

-- CreateIndex
CREATE INDEX "SupportTicket_issueType_idx" ON "SupportTicket"("issueType");

-- CreateIndex
CREATE INDEX "SupportTicket_assignedTo_idx" ON "SupportTicket"("assignedTo");

-- CreateIndex
CREATE INDEX "SupportResponse_ticketId_idx" ON "SupportResponse"("ticketId");

-- CreateIndex
CREATE INDEX "CustomerSupportHistory_customerEmail_idx" ON "CustomerSupportHistory"("customerEmail");

-- CreateIndex
CREATE INDEX "CustomerSupportHistory_ticketId_idx" ON "CustomerSupportHistory"("ticketId");

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportResponse" ADD CONSTRAINT "SupportResponse_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "SupportTicket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerSupportHistory" ADD CONSTRAINT "CustomerSupportHistory_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "SupportTicket"("id") ON DELETE RESTRICT ON UPDATE CASCADE; 