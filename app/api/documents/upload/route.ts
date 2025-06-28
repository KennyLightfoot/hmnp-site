import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { FileUploadSecurity } from '@/lib/security/file-upload-security';
import { z } from 'zod';
import { headers } from 'next/headers';

const uploadLogger = logger.forService('DocumentUpload');

const uploadRequestSchema = z.object({
  filename: z.string().min(1).max(255),
  fileSize: z.number().min(1).max(50 * 1024 * 1024), // 50MB max
  contentType: z.string().min(1),
  category: z.enum(['general', 'ron-documents', 'identification', 'supporting']).default('general'),
  bookingId: z.string().optional(),
  sessionId: z.string().optional(),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const headersList = headers();
  const ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown';
  const userAgent = headersList.get('user-agent') || 'unknown';

  // 1. Authentication Check
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as any).id;

  try {
    // 2. Parse and validate request
    const body = await request.json();
    const validatedInput = uploadRequestSchema.parse(body);

    // 3. Comprehensive security audit
    const securityAudit = await FileUploadSecurity.auditFileUpload({
      userId,
      filename: validatedInput.filename,
      fileSize: validatedInput.fileSize,
      contentType: validatedInput.contentType,
      ipAddress,
      userAgent,
    });

    // 4. Check validation results
    if (!securityAudit.validationResult.isValid) {
      uploadLogger.warn('File upload blocked - security validation failed', {
        userId,
        filename: validatedInput.filename,
        errors: securityAudit.validationResult.errors,
      });

      return NextResponse.json({
        error: 'File upload validation failed',
        details: securityAudit.validationResult.errors,
      }, { status: 400 });
    }

    // 5. Check rate limiting
    if (!securityAudit.rateLimitResult.allowed) {
      uploadLogger.warn('File upload blocked - rate limit exceeded', {
        userId,
        filename: validatedInput.filename,
      });

      return NextResponse.json({
        error: 'Upload rate limit exceeded',
        message: 'Too many uploads today. Please try again tomorrow.',
      }, { status: 429 });
    }

    // 6. Additional authorization checks for specific categories
    if (validatedInput.category === 'ron-documents' && validatedInput.sessionId) {
      const ronBooking = await prisma.Booking.findUnique({
        where: { 
          id: validatedInput.sessionId,
          locationType: 'REMOTE_ONLINE_NOTARIZATION'
        },
      });

      if (!ronBooking || ronBooking.signerId !== userId) {
        return NextResponse.json({ 
          error: 'Forbidden: Invalid RON session access' 
        }, { status: 403 });
      }
    }

    // 7. Generate secure S3 key
    const sanitizedFilename = securityAudit.validationResult.sanitizedFilename;
    const s3Key = FileUploadSecurity.generateSecureS3Key(
      validatedInput.category,
      validatedInput.sessionId || validatedInput.bookingId || 'general',
      sanitizedFilename,
      userId
    );

    // 8. Create document record in database
    const documentRecord = await prisma.Document.create({
      data: {
        id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        s3Key: s3Key,
        originalFilename: validatedInput.filename,
        sanitizedFilename: sanitizedFilename,
        contentType: validatedInput.contentType,
        fileSize: validatedInput.fileSize,
        category: validatedInput.category,
        uploadedById: userId,
        securityScore: securityAudit.validationResult.securityScore,
        scanStatus: 'pending',
        bookingId: validatedInput.bookingId || null,
        sessionId: validatedInput.sessionId || null,
        uploadMetadata: {
          ipAddress,
          userAgent,
          uploadTimestamp: new Date().toISOString(),
          securityAudit: securityAudit.auditLog,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // 9. Generate presigned upload URL (placeholder - integrate with your S3 setup)
    const uploadUrl = await generatePresignedUploadUrl(s3Key, validatedInput.contentType);

    // 10. Log successful upload initiation
    uploadLogger.info('Document upload initiated successfully', {
      documentId: documentRecord.id,
      userId,
      filename: sanitizedFilename,
      category: validatedInput.category,
      s3Key,
      securityScore: securityAudit.validationResult.securityScore,
    });

    // 11. Return upload details
    return NextResponse.json({
      success: true,
      message: 'Document upload initiated successfully',
      data: {
        documentId: documentRecord.id,
        uploadUrl,
        s3Key,
        filename: sanitizedFilename,
        securityScore: securityAudit.validationResult.securityScore,
        remainingUploads: securityAudit.rateLimitResult.remainingUploads,
        scanStatus: 'pending',
        metadata: {
          category: validatedInput.category,
          contentType: validatedInput.contentType,
          fileSize: validatedInput.fileSize,
        },
      },
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      uploadLogger.warn('Document upload validation error', {
        userId,
        errors: error.errors,
      });

      return NextResponse.json({
        error: 'Validation failed',
        details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
      }, { status: 400 });
    }

    uploadLogger.error('Document upload failed', {
      userId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json({
      error: 'Internal server error',
      message: 'Failed to initiate document upload',
    }, { status: 500 });
  }
}

/**
 * Generate presigned URL for S3 upload
 * This is a placeholder - integrate with your actual S3 setup
 */
async function generatePresignedUploadUrl(s3Key: string, contentType: string): Promise<string> {
  // In a real implementation, you would:
  // 1. Use AWS SDK to generate presigned URL
  // 2. Set appropriate expiration time (15 minutes)
  // 3. Add content-type restriction
  // 4. Add file size restrictions
  
  // For now, return a placeholder URL
  return `/api/s3/upload?key=${encodeURIComponent(s3Key)}&content-type=${encodeURIComponent(contentType)}`;
}

/**
 * Get upload status and virus scan results
 */
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const documentId = searchParams.get('documentId');

  if (!documentId) {
    return NextResponse.json({ error: 'Document ID required' }, { status: 400 });
  }

  try {
    const document = await prisma.Document.findUnique({
      where: { id: documentId },
      include: {
        uploadedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const userId = (session.user as any).id;
    
    // Check if user has access to this document
    if (document.uploadedById !== userId && !(session.user as any).role?.includes('ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check virus scan status
    const virusScanResult = await FileUploadSecurity.checkVirusScanStatus(document.s3Key);

    // Update scan status in database if changed
    if (virusScanResult.scanStatus !== document.scanStatus) {
      await prisma.Document.update({
        where: { id: documentId },
        data: { 
          scanStatus: virusScanResult.scanStatus,
          scanResult: virusScanResult,
          updatedAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        documentId: document.id,
        filename: document.sanitizedFilename,
        originalFilename: document.originalFilename,
        contentType: document.contentType,
        fileSize: document.fileSize,
        category: document.category,
        uploadDate: document.createdAt,
        securityScore: document.securityScore,
        scanStatus: virusScanResult.scanStatus,
        scanResult: virusScanResult,
        isAccessible: virusScanResult.isClean && virusScanResult.scanStatus === 'clean',
        uploadedBy: document.uploadedBy,
      },
    });

  } catch (error) {
    uploadLogger.error('Failed to get document status', {
      documentId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json({
      error: 'Failed to retrieve document status',
    }, { status: 500 });
  }
}