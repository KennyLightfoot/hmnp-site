-- Enhanced Document Security Migration
-- This adds a new Document model with comprehensive security features
-- while maintaining compatibility with existing NotarizationDocument

-- Create enhanced Document table
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "s3Key" TEXT NOT NULL,
    "originalFilename" TEXT NOT NULL,
    "sanitizedFilename" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "uploadedById" TEXT NOT NULL,
    "securityScore" INTEGER NOT NULL DEFAULT 100,
    "scanStatus" TEXT NOT NULL DEFAULT 'pending',
    "scanResult" JSONB,
    "accessLevel" TEXT NOT NULL DEFAULT 'private',
    "encryptionStatus" TEXT DEFAULT 'unencrypted',
    "checksumSha256" TEXT,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "lastAccessedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "bookingId" TEXT,
    "sessionId" TEXT,
    "uploadMetadata" JSONB,
    "tags" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraints for proper referential integrity
ALTER TABLE "Document" ADD CONSTRAINT "Document_uploadedById_fkey" 
    FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Document" ADD CONSTRAINT "Document_bookingId_fkey" 
    FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create DocumentAccess table for granular access control
CREATE TABLE "DocumentAccess" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessType" TEXT NOT NULL DEFAULT 'read',
    "grantedById" TEXT NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastUsedAt" TIMESTAMP(3),
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,

    CONSTRAINT "DocumentAccess_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraints for DocumentAccess
ALTER TABLE "DocumentAccess" ADD CONSTRAINT "DocumentAccess_documentId_fkey" 
    FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DocumentAccess" ADD CONSTRAINT "DocumentAccess_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DocumentAccess" ADD CONSTRAINT "DocumentAccess_grantedById_fkey" 
    FOREIGN KEY ("grantedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Create DocumentAuditLog table for comprehensive audit trail
CREATE TABLE "DocumentAuditLog" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    "securityFlags" TEXT[],
    "riskScore" INTEGER DEFAULT 0,

    CONSTRAINT "DocumentAuditLog_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraint for DocumentAuditLog
ALTER TABLE "DocumentAuditLog" ADD CONSTRAINT "DocumentAuditLog_documentId_fkey" 
    FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DocumentAuditLog" ADD CONSTRAINT "DocumentAuditLog_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create DocumentVersion table for version control
CREATE TABLE "DocumentVersion" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "s3Key" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "checksumSha256" TEXT,
    "changes" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "DocumentVersion_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraints for DocumentVersion
ALTER TABLE "DocumentVersion" ADD CONSTRAINT "DocumentVersion_documentId_fkey" 
    FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DocumentVersion" ADD CONSTRAINT "DocumentVersion_createdById_fkey" 
    FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Create indexes for optimal query performance
CREATE INDEX "Document_uploadedById_idx" ON "Document"("uploadedById");
CREATE INDEX "Document_bookingId_idx" ON "Document"("bookingId");
CREATE INDEX "Document_sessionId_idx" ON "Document"("sessionId");
CREATE INDEX "Document_s3Key_idx" ON "Document"("s3Key");
CREATE INDEX "Document_category_idx" ON "Document"("category");
CREATE INDEX "Document_scanStatus_idx" ON "Document"("scanStatus");
CREATE INDEX "Document_createdAt_idx" ON "Document"("createdAt" DESC);
CREATE INDEX "Document_expiresAt_idx" ON "Document"("expiresAt") WHERE "expiresAt" IS NOT NULL;

CREATE INDEX "DocumentAccess_documentId_idx" ON "DocumentAccess"("documentId");
CREATE INDEX "DocumentAccess_userId_idx" ON "DocumentAccess"("userId");
CREATE INDEX "DocumentAccess_grantedById_idx" ON "DocumentAccess"("grantedById");
CREATE INDEX "DocumentAccess_active_idx" ON "DocumentAccess"("isActive", "expiresAt");

CREATE INDEX "DocumentAuditLog_documentId_idx" ON "DocumentAuditLog"("documentId");
CREATE INDEX "DocumentAuditLog_userId_idx" ON "DocumentAuditLog"("userId");
CREATE INDEX "DocumentAuditLog_timestamp_idx" ON "DocumentAuditLog"("timestamp" DESC);
CREATE INDEX "DocumentAuditLog_action_idx" ON "DocumentAuditLog"("action");
CREATE INDEX "DocumentAuditLog_risk_idx" ON "DocumentAuditLog"("riskScore" DESC) WHERE "riskScore" > 0;

CREATE INDEX "DocumentVersion_documentId_idx" ON "DocumentVersion"("documentId");
CREATE INDEX "DocumentVersion_version_idx" ON "DocumentVersion"("documentId", "versionNumber");

-- Create unique constraints
CREATE UNIQUE INDEX "DocumentAccess_unique_user_document_active" ON "DocumentAccess"("documentId", "userId", "accessType") 
    WHERE "isActive" = true AND ("expiresAt" IS NULL OR "expiresAt" > CURRENT_TIMESTAMP);

CREATE UNIQUE INDEX "DocumentVersion_unique_document_version" ON "DocumentVersion"("documentId", "versionNumber");

-- Add check constraints for data integrity
ALTER TABLE "Document" ADD CONSTRAINT "Document_fileSize_positive" CHECK ("fileSize" > 0);
ALTER TABLE "Document" ADD CONSTRAINT "Document_securityScore_range" CHECK ("securityScore" >= 0 AND "securityScore" <= 100);
ALTER TABLE "Document" ADD CONSTRAINT "Document_scanStatus_valid" CHECK ("scanStatus" IN ('pending', 'scanning', 'clean', 'infected', 'error', 'quarantined'));
ALTER TABLE "Document" ADD CONSTRAINT "Document_category_valid" CHECK ("category" IN ('general', 'ron-documents', 'identification', 'supporting', 'assignment', 'signed'));
ALTER TABLE "Document" ADD CONSTRAINT "Document_accessLevel_valid" CHECK ("accessLevel" IN ('public', 'private', 'restricted', 'confidential'));
ALTER TABLE "Document" ADD CONSTRAINT "Document_encryptionStatus_valid" CHECK ("encryptionStatus" IN ('unencrypted', 'client-side', 'server-side', 'end-to-end'));

ALTER TABLE "DocumentAccess" ADD CONSTRAINT "DocumentAccess_accessType_valid" CHECK ("accessType" IN ('read', 'write', 'delete', 'share', 'admin'));
ALTER TABLE "DocumentAccess" ADD CONSTRAINT "DocumentAccess_usageCount_positive" CHECK ("usageCount" >= 0);

ALTER TABLE "DocumentVersion" ADD CONSTRAINT "DocumentVersion_versionNumber_positive" CHECK ("versionNumber" > 0);
ALTER TABLE "DocumentVersion" ADD CONSTRAINT "DocumentVersion_fileSize_positive" CHECK ("fileSize" > 0);

ALTER TABLE "DocumentAuditLog" ADD CONSTRAINT "DocumentAuditLog_riskScore_range" CHECK ("riskScore" >= 0 AND "riskScore" <= 100);

-- Add triggers for automatic updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_document_updated_at BEFORE UPDATE ON "Document"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add trigger for automatic audit logging
CREATE OR REPLACE FUNCTION log_document_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Log document access and modifications
    IF TG_OP = 'UPDATE' THEN
        INSERT INTO "DocumentAuditLog" ("id", "documentId", "action", "timestamp", "metadata")
        VALUES (
            'audit_' || extract(epoch from now())::text || '_' || substring(md5(random()::text) from 1 for 8),
            NEW."id",
            'UPDATE',
            CURRENT_TIMESTAMP,
            jsonb_build_object(
                'changes', row_to_json(NEW.*) - row_to_json(OLD.*),
                'trigger', 'automatic'
            )
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO "DocumentAuditLog" ("id", "documentId", "action", "timestamp", "metadata")
        VALUES (
            'audit_' || extract(epoch from now())::text || '_' || substring(md5(random()::text) from 1 for 8),
            OLD."id",
            'DELETE',
            CURRENT_TIMESTAMP,
            jsonb_build_object(
                'deleted_record', row_to_json(OLD.*),
                'trigger', 'automatic'
            )
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER document_audit_trigger AFTER UPDATE OR DELETE ON "Document"
    FOR EACH ROW EXECUTE FUNCTION log_document_changes();

-- Create view for active documents with access control
CREATE VIEW "ActiveDocuments" AS
SELECT 
    d.*,
    u."name" as "uploaderName",
    u."email" as "uploaderEmail",
    COUNT(da."id") as "accessGrantCount",
    COUNT(dal."id") as "auditLogCount"
FROM "Document" d
LEFT JOIN "User" u ON d."uploadedById" = u."id"
LEFT JOIN "DocumentAccess" da ON d."id" = da."documentId" AND da."isActive" = true
LEFT JOIN "DocumentAuditLog" dal ON d."id" = dal."documentId"
WHERE d."isActive" = true
GROUP BY d."id", u."name", u."email";

-- Create security-focused views for monitoring
CREATE VIEW "SecurityAlerts" AS
SELECT 
    d."id",
    d."originalFilename",
    d."securityScore",
    d."scanStatus",
    d."createdAt",
    u."email" as "uploaderEmail",
    COUNT(CASE WHEN dal."riskScore" > 50 THEN 1 END) as "highRiskEvents"
FROM "Document" d
LEFT JOIN "User" u ON d."uploadedById" = u."id"
LEFT JOIN "DocumentAuditLog" dal ON d."id" = dal."documentId"
WHERE d."securityScore" < 70 OR d."scanStatus" IN ('infected', 'error')
GROUP BY d."id", d."originalFilename", d."securityScore", d."scanStatus", d."createdAt", u."email";

-- Insert initial configuration data
INSERT INTO "DocumentAuditLog" ("id", "documentId", "action", "timestamp", "metadata")
SELECT 
    'migration_' || extract(epoch from now())::text || '_' || "id",
    "id",
    'MIGRATION_INIT',
    CURRENT_TIMESTAMP,
    jsonb_build_object(
        'source', 'security_migration',
        'note', 'Document security system initialized'
    )
FROM "Document" LIMIT 0; -- This will create the structure but insert no rows since there are no documents yet

COMMENT ON TABLE "Document" IS 'Enhanced document storage with comprehensive security features';
COMMENT ON TABLE "DocumentAccess" IS 'Granular access control for documents';
COMMENT ON TABLE "DocumentAuditLog" IS 'Comprehensive audit trail for all document operations';
COMMENT ON TABLE "DocumentVersion" IS 'Version control for document changes';
COMMENT ON VIEW "ActiveDocuments" IS 'Active documents with aggregated access and audit information';
COMMENT ON VIEW "SecurityAlerts" IS 'Documents requiring security attention';