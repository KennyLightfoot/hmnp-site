-- CreateEnum
CREATE TYPE "NotarizationStatus" AS ENUM ('PENDING_CONFIRMATION', 'CONFIRMED', 'CANCELLED_BY_SIGNER', 'CANCELLED_BY_NOTARY', 'AWAITING_DOCUMENTS', 'DOCUMENTS_UPLOADED', 'READY_FOR_SESSION', 'SESSION_IN_PROGRESS', 'POST_SESSION_PROCESSING', 'COMPLETED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "NotarizationSession" (
    "id" TEXT NOT NULL,
    "signerId" TEXT NOT NULL,
    "notaryId" TEXT,
    "scheduledDateTime" TIMESTAMP(3),
    "status" "NotarizationStatus" NOT NULL DEFAULT 'PENDING_CONFIRMATION',
    "dailyRoomUrl" TEXT,
    "dailyRecordingId" TEXT,
    "kbaStatus" TEXT,
    "idVerificationStatus" TEXT,
    "notaryJournalEntry" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotarizationSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotarizationDocument" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "s3Key" TEXT NOT NULL,
    "originalFilename" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadedById" TEXT NOT NULL,
    "isSigned" BOOLEAN NOT NULL DEFAULT false,
    "signedS3Key" TEXT,
    "signedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotarizationDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NotarizationSession_signerId_idx" ON "NotarizationSession"("signerId");

-- CreateIndex
CREATE INDEX "NotarizationSession_notaryId_idx" ON "NotarizationSession"("notaryId");

-- CreateIndex
CREATE INDEX "NotarizationSession_status_idx" ON "NotarizationSession"("status");

-- CreateIndex
CREATE INDEX "NotarizationDocument_sessionId_idx" ON "NotarizationDocument"("sessionId");

-- CreateIndex
CREATE INDEX "NotarizationDocument_uploadedById_idx" ON "NotarizationDocument"("uploadedById");

-- AddForeignKey
ALTER TABLE "NotarizationSession" ADD CONSTRAINT "NotarizationSession_signerId_fkey" FOREIGN KEY ("signerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotarizationSession" ADD CONSTRAINT "NotarizationSession_notaryId_fkey" FOREIGN KEY ("notaryId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotarizationDocument" ADD CONSTRAINT "NotarizationDocument_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "NotarizationSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotarizationDocument" ADD CONSTRAINT "NotarizationDocument_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
