-- AlterTable
ALTER TABLE "NotarizationDocument" ADD COLUMN     "sourceAssignmentDocumentId" TEXT;

-- CreateIndex
CREATE INDEX "NotarizationDocument_sourceAssignmentDocumentId_idx" ON "NotarizationDocument"("sourceAssignmentDocumentId");

-- AddForeignKey
ALTER TABLE "NotarizationDocument" ADD CONSTRAINT "NotarizationDocument_sourceAssignmentDocumentId_fkey" FOREIGN KEY ("sourceAssignmentDocumentId") REFERENCES "AssignmentDocument"("id") ON DELETE SET NULL ON UPDATE CASCADE;
