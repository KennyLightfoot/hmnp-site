import { describe, it, expect, vi, beforeEach } from 'vitest';

// Set environment variables BEFORE importing the module that uses them
// process.env.S3_BUCKET_NAME = 'mock-bucket'; // MOVED TO tests/setupEnv.ts
// process.env.AWS_REGION = 'mock-region'; // MOVED TO tests/setupEnv.ts

// Now import the module that uses the mocked dependency
import {
    getPresignedDownloadUrl,
    getPresignedUploadUrl,
    registerUploadedDocument
} from '@/app/portal/_actions/documents';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/database-connection';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { Role, type AssignmentDocument, AssignmentStatus } from '@prisma/client';

// --- Mocks ---

// Mock next-auth
vi.mock('next-auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next-auth')>();
  return {
    ...actual,
    getServerSession: vi.fn(),
  };
});
const mockedGetServerSession = vi.mocked(getServerSession);

// Mock prisma
vi.mock('@/lib/database-connection', () => ({
  prisma: {
    assignmentDocument: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    assignment: {
        findUnique: vi.fn(),
    },
    // Mock other prisma models/methods as needed
  },
}));
const mockedPrismaDocumentFindUnique = vi.mocked(prisma.assignmentDocument.findUnique);
const mockedPrismaAssignmentFindUnique = vi.mocked(prisma.assignment.findUnique);
const mockedPrismaDocumentCreate = vi.mocked(prisma.assignmentDocument.create);

// Mock S3 Presigner
vi.mock('@aws-sdk/s3-request-presigner', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@aws-sdk/s3-request-presigner')>();
    return {
      ...actual,
      getSignedUrl: vi.fn(),
    };
});
const mockedGetSignedUrl = vi.mocked(getSignedUrl);

// Mock S3 Presigner (Upload)
vi.mock('@aws-sdk/s3-presigned-post', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@aws-sdk/s3-presigned-post')>();
    return {
      ...actual,
      createPresignedPost: vi.fn(),
    };
});
const mockedCreatePresignedPost = vi.mocked(createPresignedPost);

// Mock S3 Client (needed by the action module scope)
vi.mock('@aws-sdk/client-s3', () => {
    return {
      S3Client: vi.fn().mockImplementation(() => ({
        // Mock client methods if needed, send is common
        send: vi.fn(),
      })),
      GetObjectCommand: vi.fn((args) => ({ /* return mock command state if needed */ args })), // Return args for inspection
      PutObjectCommand: vi.fn((args) => ({ /* return mock command state if needed */ args })), // Added for potential use
    };
});

// Mock resend (to prevent API key error during import from dependent modules)
vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({ data: { id: 'mock-email-id' }, error: null }), // Mock the send method if needed elsewhere
    },
  })),
}));

// Mock nanoid (used for generating unique key in download - keep for now)
vi.mock('nanoid', () => ({
    nanoid: vi.fn(() => 'random-nanoid-string'),
}));

// --- Tests ---

describe('getPresignedDownloadUrl Server Action', () => {

    beforeEach(() => {
        // Reset mocks before each test
        vi.resetAllMocks();
    });

    it('should return error if user is not authenticated', async () => {
        mockedGetServerSession.mockResolvedValueOnce(null); // Simulate no session

        const result = await getPresignedDownloadUrl('doc-123');

        expect(result.error).toBe('Not authenticated');
        expect(result.url).toBeUndefined();
        expect(mockedPrismaDocumentFindUnique).not.toHaveBeenCalled();
        expect(mockedGetSignedUrl).not.toHaveBeenCalled();
    });

    it('should return error if document is not found', async () => {
        // Simulate authenticated user
        mockedGetServerSession.mockResolvedValueOnce({
            user: { id: 'user-staff', role: Role.STAFF },
            expires: 'never',
        });
        // Simulate document not found
        mockedPrismaDocumentFindUnique.mockResolvedValueOnce(null);

        const result = await getPresignedDownloadUrl('doc-nonexistent');

        expect(result.error).toBe('Document or associated assignment not found');
        expect(result.url).toBeUndefined();
        expect(mockedPrismaDocumentFindUnique).toHaveBeenCalledWith({
            where: { id: 'doc-nonexistent' },
            include: { assignment: { select: { id: true, partnerAssignedToId: true } } },
        });
        expect(mockedGetSignedUrl).not.toHaveBeenCalled();
    });

    // --- Authorization Tests ---

    it('should allow STAFF user to get URL for any document', async () => {
        // Simulate authenticated STAFF user
        const mockSessionStaff = { user: { id: 'user-staff', role: Role.STAFF }, expires: 'never' };
        mockedGetServerSession.mockResolvedValueOnce(mockSessionStaff);

        // Simulate document found with an assignment NOT assigned to this user (should still work for STAFF)
        // Define the nested assignment part first for clarity
        const mockAssignmentStaff = { id: 'assign-abc', partnerAssignedToId: 'other-partner-id' };
        const mockDocumentStaff: AssignmentDocument & { assignment: typeof mockAssignmentStaff } = {
            id: 'doc-123',
            key: 'path/to/document.pdf', // Corrected from s3Key
            assignmentId: mockAssignmentStaff.id,
            filename: 'document.pdf',
            uploadedAt: new Date(),
            uploadedById: 'uploader-id',
            assignment: mockAssignmentStaff,
        };
        mockedPrismaDocumentFindUnique.mockResolvedValueOnce(mockDocumentStaff);

        // Simulate successful signed URL generation
        const mockSignedUrl = 'https://mock-bucket.s3.mock-region.amazonaws.com/path/to/document.pdf?sig=123';
        mockedGetSignedUrl.mockResolvedValueOnce(mockSignedUrl);

        const result = await getPresignedDownloadUrl('doc-123');

        expect(result.error).toBeUndefined();
        expect(result.url).toBe(mockSignedUrl);
        expect(mockedPrismaDocumentFindUnique).toHaveBeenCalledWith({
            where: { id: 'doc-123' },
            include: { assignment: { select: { id: true, partnerAssignedToId: true } } },
        });
        // Verify getSignedUrl was called correctly
        expect(mockedGetSignedUrl).toHaveBeenCalledTimes(1);
        expect(mockedGetSignedUrl).toHaveBeenCalledWith(
            expect.anything(), // S3Client instance
            expect.objectContaining({ // Mocked GetObjectCommand return value
                args: expect.objectContaining({ // Actual args passed to GetObjectCommand constructor
                    Bucket: process.env.S3_BUCKET_NAME,
                    Key: mockDocumentStaff.key,
                    ResponseContentDisposition: `attachment; filename="${mockDocumentStaff.filename}"`,
                })
            }),
            expect.objectContaining({ expiresIn: 300 }) // Updated expiry
        );
    });

    it('should allow ADMIN user to get URL for any document', async () => {
        // Simulate authenticated ADMIN user
        const mockSessionAdmin = { user: { id: 'user-admin', role: Role.ADMIN }, expires: 'never' };
        mockedGetServerSession.mockResolvedValueOnce(mockSessionAdmin);

        // Simulate document found
        const mockAssignmentAdmin = { id: 'assign-def', partnerAssignedToId: 'yet-another-partner' };
        const mockDocumentAdmin: AssignmentDocument & { assignment: typeof mockAssignmentAdmin } = {
            id: 'doc-456',
            key: 'another/path/report.docx', // Corrected from s3Key
            assignmentId: mockAssignmentAdmin.id,
            filename: 'report.docx',
            uploadedAt: new Date(),
            uploadedById: 'uploader-id-2',
            assignment: mockAssignmentAdmin,
        };
        mockedPrismaDocumentFindUnique.mockResolvedValueOnce(mockDocumentAdmin);

        // Simulate successful signed URL generation
        const mockSignedUrl = 'https://mock-bucket.s3.mock-region.amazonaws.com/another/path/report.docx?sig=456';
        mockedGetSignedUrl.mockResolvedValueOnce(mockSignedUrl);

        const result = await getPresignedDownloadUrl('doc-456');

        expect(result.error).toBeUndefined();
        expect(result.url).toBe(mockSignedUrl);
        expect(mockedPrismaDocumentFindUnique).toHaveBeenCalledWith({
            where: { id: 'doc-456' },
            include: { assignment: { select: { id: true, partnerAssignedToId: true } } },
        });
        expect(mockedGetSignedUrl).toHaveBeenCalledTimes(1);
        expect(mockedGetSignedUrl).toHaveBeenCalledWith(
            expect.anything(), // S3Client instance
            expect.objectContaining({ // Mocked GetObjectCommand return value
                args: expect.objectContaining({ // Actual args passed to GetObjectCommand constructor
                    Bucket: process.env.S3_BUCKET_NAME,
                    Key: mockDocumentAdmin.key,
                    ResponseContentDisposition: `attachment; filename="${mockDocumentAdmin.filename}"`,
                })
            }),
            expect.objectContaining({ expiresIn: 300 }) // Updated expiry
        );
    });

    it('should allow assigned PARTNER user to get URL', async () => {
        // Simulate authenticated PARTNER user
        const partnerUserId = 'partner-assigned';
        const mockSessionPartner = { user: { id: partnerUserId, role: Role.PARTNER }, expires: 'never' };
        mockedGetServerSession.mockResolvedValueOnce(mockSessionPartner);

        // Simulate document found where assignment IS assigned to this user
        const mockAssignmentPartner = { id: 'assign-ghi', partnerAssignedToId: partnerUserId }; // Matches session user ID
        const mockDocumentPartner: AssignmentDocument & { assignment: typeof mockAssignmentPartner } = {
            id: 'doc-789',
            key: 'partner/files/contract.pdf', // Corrected from s3Key
            assignmentId: mockAssignmentPartner.id,
            filename: 'contract.pdf',
            uploadedAt: new Date(),
            uploadedById: 'staff-uploader',
            assignment: mockAssignmentPartner,
        };
        mockedPrismaDocumentFindUnique.mockResolvedValueOnce(mockDocumentPartner);

        // Simulate successful signed URL generation
        const mockSignedUrl = 'https://mock-bucket.s3.mock-region.amazonaws.com/partner/files/contract.pdf?sig=789';
        mockedGetSignedUrl.mockResolvedValueOnce(mockSignedUrl);

        const result = await getPresignedDownloadUrl('doc-789');

        expect(result.error).toBeUndefined();
        expect(result.url).toBe(mockSignedUrl);
        expect(mockedPrismaDocumentFindUnique).toHaveBeenCalledWith({
            where: { id: 'doc-789' },
            include: { assignment: { select: { id: true, partnerAssignedToId: true } } },
        });
        expect(mockedGetSignedUrl).toHaveBeenCalledTimes(1);
        expect(mockedGetSignedUrl).toHaveBeenCalledWith(
            expect.anything(), // S3Client instance
            expect.objectContaining({ // Mocked GetObjectCommand return value
                args: expect.objectContaining({ // Actual args passed to GetObjectCommand constructor
                    Bucket: process.env.S3_BUCKET_NAME,
                    Key: mockDocumentPartner.key,
                    ResponseContentDisposition: `attachment; filename="${mockDocumentPartner.filename}"`,
                })
            }),
            expect.objectContaining({ expiresIn: 300 }) // Updated expiry
        );
    });

    it('should return Unauthorized for PARTNER user trying to access unassigned document', async () => {
        // Simulate authenticated PARTNER user
        const partnerUserId = 'partner-unassigned';
        const mockSessionPartner = { user: { id: partnerUserId, role: Role.PARTNER }, expires: 'never' };
        mockedGetServerSession.mockResolvedValueOnce(mockSessionPartner);

        // Simulate document found where assignment is NOT assigned to this user
        const mockAssignmentUnassigned = { id: 'assign-xyz', partnerAssignedToId: 'DIFFERENT-partner-id' }; // Does NOT match session user ID
        const mockDocumentUnassigned: AssignmentDocument & { assignment: typeof mockAssignmentUnassigned } = {
            id: 'doc-abc',
            key: 'confidential/other_partner.txt', // Corrected from s3Key
            assignmentId: mockAssignmentUnassigned.id,
            filename: 'other_partner.txt',
            uploadedAt: new Date(),
            uploadedById: 'another-staff',
            assignment: mockAssignmentUnassigned,
        };
        mockedPrismaDocumentFindUnique.mockResolvedValueOnce(mockDocumentUnassigned);

        // Should not call getSignedUrl
        const result = await getPresignedDownloadUrl('doc-abc');

        expect(result.error).toBe('Unauthorized');
        expect(result.url).toBeUndefined();
        expect(mockedPrismaDocumentFindUnique).toHaveBeenCalledWith({
            where: { id: 'doc-abc' },
            include: { assignment: { select: { id: true, partnerAssignedToId: true } } },
        });
        expect(mockedGetSignedUrl).not.toHaveBeenCalled();
    });


    // --- Success Case Detail Test ---

    it('should call getSignedUrl with correct parameters on success', async () => {
        // Using STAFF user for simplicity, auth already tested above
        const mockSessionStaff = { user: { id: 'user-staff', role: Role.STAFF }, expires: 'never' };
        mockedGetServerSession.mockResolvedValueOnce(mockSessionStaff);

        const mockAssignmentSuccess = { id: 'assign-final', partnerAssignedToId: 'any-partner' };
        const mockDocumentSuccess: AssignmentDocument & { assignment: typeof mockAssignmentSuccess } = {
            id: 'doc-success',
            key: 'final/project/document.zip', // Corrected from s3Key
            assignmentId: mockAssignmentSuccess.id,
            filename: 'document.zip',
            uploadedAt: new Date(),
            uploadedById: 'final-uploader',
            assignment: mockAssignmentSuccess,
        };
        mockedPrismaDocumentFindUnique.mockResolvedValueOnce(mockDocumentSuccess);

        const mockSignedUrl = 'https://mock-bucket.s3.mock-region.amazonaws.com/final/project/document.zip?sig=success';
        mockedGetSignedUrl.mockResolvedValueOnce(mockSignedUrl);

        const result = await getPresignedDownloadUrl('doc-success');

        expect(result.error).toBeUndefined();
        expect(result.url).toBe(mockSignedUrl);
        expect(mockedPrismaDocumentFindUnique).toHaveBeenCalledTimes(1);

        // Verify getSignedUrl call details
        expect(mockedGetSignedUrl).toHaveBeenCalledTimes(1);
        const expectedBucket = process.env.S3_BUCKET_NAME;
        expect(mockedGetSignedUrl).toHaveBeenCalledWith(
            expect.anything(), // The S3Client instance
            expect.objectContaining({ // Mocked GetObjectCommand return value
                args: expect.objectContaining({ // Actual args passed to GetObjectCommand constructor
                    Bucket: expectedBucket,
                    Key: mockDocumentSuccess.key,
                    ResponseContentDisposition: `attachment; filename="${mockDocumentSuccess.filename}"`,
                })
            }),
            expect.objectContaining({ // The options object
                expiresIn: 300 // Updated expiry
            })
        );
         // Ensure the mock S3 client was instantiated (implicitly checked by getSignedUrl call)
         // Ensure the GetObjectCommand was instantiated (implicitly checked by getSignedUrl call)
    });

    // TODO: Add test for successful URL generation // REMOVED - Covered by the specific test above

}); 

// --- Tests for getPresignedUploadUrl ---

describe('getPresignedUploadUrl Server Action', () => {
    const defaultInput = {
        assignmentId: 'assign-upload-123',
        filename: 'test-upload.pdf',
        contentType: 'application/pdf',
        fileSize: 1024 * 1024, // 1MB
    };

    // Define the mock UUID generator
    const mockUuidGenerator = vi.fn(() => '00000000-0000-0000-0000-000000000000');

    beforeEach(() => {
        vi.resetAllMocks();
        // Reset the mock function before each test
        mockUuidGenerator.mockClear(); 
        // Ensure it returns the desired value if needed again, though clear might be enough
        mockUuidGenerator.mockReturnValue('00000000-0000-0000-0000-000000000000');
    });

    it('should return error if user is not authenticated', async () => {
        mockedGetServerSession.mockResolvedValueOnce(null);
        const result = await getPresignedUploadUrl(defaultInput.assignmentId, defaultInput.filename, defaultInput.contentType);
        expect(result.error).toBe('Not authenticated');
        expect((result as any).post).toBeUndefined(); // post doesn't exist on error
        expect(mockedCreatePresignedPost).not.toHaveBeenCalled();
    });

    it('should return error if user is PARTNER', async () => {
        const mockSessionPartner = { user: { id: 'partner-1', role: Role.PARTNER }, expires: 'never' };
        mockedGetServerSession.mockResolvedValueOnce(mockSessionPartner);
        const result = await getPresignedUploadUrl(defaultInput.assignmentId, defaultInput.filename, defaultInput.contentType);
        expect(result.error).toBe('Unauthorized');
        expect((result as any).post).toBeUndefined(); // post doesn't exist on error
        expect(mockedCreatePresignedPost).not.toHaveBeenCalled();
    });

    it('should return generic error when S3 post generation fails (simulating input issues / assignment not found)', async () => {
        const mockSessionStaff = { user: { id: 'staff-1', role: Role.STAFF }, expires: 'never' };
        mockedGetServerSession.mockResolvedValueOnce(mockSessionStaff);

        // Pass the mock dependency here as well, although it won't be used if createPresignedPost is mocked to fail early
        const result = await getPresignedUploadUrl(
            defaultInput.assignmentId, 
            defaultInput.filename, 
            defaultInput.contentType,
            { uuidGenerator: mockUuidGenerator } // Pass mock
        );

        expect(result.error).toBe('Failed to prepare upload link.');
        expect(result.url).toBeUndefined();
        expect(result.fields).toBeUndefined();
        expect(result.key).toBeUndefined();

        expect(mockedPrismaAssignmentFindUnique).not.toHaveBeenCalled();
    });

    it('should successfully generate presigned post for STAFF user', async () => {
        const mockSessionStaff = { user: { id: 'staff-1', role: Role.STAFF }, expires: 'never' };
        mockedGetServerSession.mockResolvedValueOnce(mockSessionStaff);

        const expectedKey = `assignments/${defaultInput.assignmentId}/00000000-0000-0000-0000-000000000000-${defaultInput.filename}`;
        const mockPresignedPostResult = {
            url: `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`,
            fields: { Key: expectedKey, 'Content-Type': defaultInput.contentType }
        };
        mockedCreatePresignedPost.mockResolvedValue(mockPresignedPostResult);

        // Pass the mock dependency
        const result = await getPresignedUploadUrl(
            defaultInput.assignmentId, 
            defaultInput.filename, 
            defaultInput.contentType,
            { uuidGenerator: mockUuidGenerator } // Pass mock
        );

        expect(result.error).toBeUndefined();
        expect(result.url).toBe(mockPresignedPostResult.url);
        expect(result.fields).toEqual(mockPresignedPostResult.fields);
        expect(result.key).toBe(expectedKey);

        expect(mockedPrismaAssignmentFindUnique).not.toHaveBeenCalled();
        expect(mockedCreatePresignedPost).toHaveBeenCalledTimes(1);
        expect(mockedCreatePresignedPost).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                Bucket: process.env.S3_BUCKET_NAME,
                Key: expectedKey,
                Conditions: [
                    ["content-length-range", 0, 10 * 1024 * 1024],
                    ["starts-with", "$Content-Type", defaultInput.contentType],
                ],
                Fields: expect.objectContaining({
                     'Content-Type': defaultInput.contentType,
                }),
                Expires: 300, 
            })
        );
    });

     it('should successfully generate presigned post for ADMIN user', async () => {
        const mockSessionAdmin = { user: { id: 'admin-1', role: Role.ADMIN }, expires: 'never' };
        mockedGetServerSession.mockResolvedValueOnce(mockSessionAdmin);

        const expectedKeyAdmin = `assignments/${defaultInput.assignmentId}/00000000-0000-0000-0000-000000000000-${defaultInput.filename}`;
        const mockPresignedPostResultAdmin = { url: 'mock-url', fields: { Key: expectedKeyAdmin } };
        mockedCreatePresignedPost.mockResolvedValue(mockPresignedPostResultAdmin);

        // Pass the mock dependency
        const result = await getPresignedUploadUrl(
            defaultInput.assignmentId, 
            defaultInput.filename, 
            defaultInput.contentType,
            { uuidGenerator: mockUuidGenerator } // Pass mock
        );

        expect(result.error).toBeUndefined();
        expect(result.url).toBe(mockPresignedPostResultAdmin.url);
        expect(result.fields).toEqual(mockPresignedPostResultAdmin.fields);
        expect(result.key).toBe(expectedKeyAdmin);

        expect(mockedPrismaAssignmentFindUnique).not.toHaveBeenCalled();
        expect(mockedCreatePresignedPost).toHaveBeenCalledTimes(1);
    });

}); 

// --- Tests for registerUploadedDocument ---

describe('registerUploadedDocument Server Action', () => {
    const defaultRegisterInput = {
        assignmentId: 'assign-register-456',
        filename: 'registered-doc.txt',
        s3Key: 'assignments/assign-register-456/mocked-uuid/registered-doc.txt',
        contentType: 'text/plain', // Included in signature, might be stored
    };

    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('should return error if user is not authenticated', async () => {
        mockedGetServerSession.mockResolvedValueOnce(null);
        const result = await registerUploadedDocument(
            defaultRegisterInput.assignmentId,
            defaultRegisterInput.filename,
            defaultRegisterInput.s3Key,
            defaultRegisterInput.contentType
        );
        expect(result.error).toBe('Not authenticated');
        expect(result.documentId).toBeUndefined();
        expect(mockedPrismaDocumentCreate).not.toHaveBeenCalled();
    });

    it('should return error if user is PARTNER', async () => {
        const mockSessionPartner = { user: { id: 'partner-reg', role: Role.PARTNER }, expires: 'never' };
        mockedGetServerSession.mockResolvedValueOnce(mockSessionPartner);
        const result = await registerUploadedDocument(
            defaultRegisterInput.assignmentId,
            defaultRegisterInput.filename,
            defaultRegisterInput.s3Key,
            defaultRegisterInput.contentType
        );
        expect(result.error).toBe('Unauthorized');
        expect(result.documentId).toBeUndefined();
        expect(mockedPrismaDocumentCreate).not.toHaveBeenCalled();
    });

    it('should successfully register document for STAFF user', async () => {
        const staffUserId = 'staff-reg';
        const mockSessionStaff = { user: { id: staffUserId, role: Role.STAFF }, expires: 'never' };
        mockedGetServerSession.mockResolvedValueOnce(mockSessionStaff);

        // Provide a more complete object to satisfy the mock type-checking, even though only id is selected.
        const mockCreatedDocumentFull = {
            id: 'new-doc-id-123',
            assignmentId: defaultRegisterInput.assignmentId,
            filename: defaultRegisterInput.filename,
            key: defaultRegisterInput.s3Key,
            uploadedById: staffUserId,
            uploadedAt: new Date(),
        };
        mockedPrismaDocumentCreate.mockResolvedValueOnce(mockCreatedDocumentFull);

        const result = await registerUploadedDocument(
            defaultRegisterInput.assignmentId,
            defaultRegisterInput.filename,
            defaultRegisterInput.s3Key,
            defaultRegisterInput.contentType
        );

        expect(result.error).toBeUndefined();
        expect(result.documentId).toBe(mockCreatedDocumentFull.id); // Assert against the ID
        expect(mockedPrismaDocumentCreate).toHaveBeenCalledTimes(1);
        expect(mockedPrismaDocumentCreate).toHaveBeenCalledWith({
            data: {
                assignmentId: defaultRegisterInput.assignmentId,
                filename: defaultRegisterInput.filename,
                key: defaultRegisterInput.s3Key,
                uploadedById: staffUserId, // Check correct user ID is passed
                // Add contentType if the action saves it
            },
            select: {
                id: true,
            },
        });
    });

    it('should successfully register document for ADMIN user', async () => {
        const adminUserId = 'admin-reg';
        const mockSessionAdmin = { user: { id: adminUserId, role: Role.ADMIN }, expires: 'never' };
        mockedGetServerSession.mockResolvedValueOnce(mockSessionAdmin);

        // Provide a more complete object for type-checking
        const mockCreatedDocumentFullAdmin = {
             id: 'new-doc-id-456',
             assignmentId: defaultRegisterInput.assignmentId,
             filename: defaultRegisterInput.filename,
             key: defaultRegisterInput.s3Key,
             uploadedById: adminUserId,
             uploadedAt: new Date(),
        };
        mockedPrismaDocumentCreate.mockResolvedValueOnce(mockCreatedDocumentFullAdmin);

        const result = await registerUploadedDocument(
            defaultRegisterInput.assignmentId,
            defaultRegisterInput.filename,
            defaultRegisterInput.s3Key,
            defaultRegisterInput.contentType
        );

        expect(result.error).toBeUndefined();
        expect(result.documentId).toBe(mockCreatedDocumentFullAdmin.id); // Assert against the ID
        expect(mockedPrismaDocumentCreate).toHaveBeenCalledTimes(1);
        expect(mockedPrismaDocumentCreate).toHaveBeenCalledWith({
             data: {
                assignmentId: defaultRegisterInput.assignmentId,
                filename: defaultRegisterInput.filename,
                key: defaultRegisterInput.s3Key,
                uploadedById: adminUserId,
            },
            select: {
                id: true,
            },
        });
    });

    it('should return error if prisma create fails', async () => {
        const staffUserId = 'staff-fail';
        const mockSessionStaff = { user: { id: staffUserId, role: Role.STAFF }, expires: 'never' };
        mockedGetServerSession.mockResolvedValueOnce(mockSessionStaff);

        // Simulate prisma error
        const prismaError = new Error('Database connection failed');
        mockedPrismaDocumentCreate.mockRejectedValueOnce(prismaError);

        const result = await registerUploadedDocument(
            defaultRegisterInput.assignmentId,
            defaultRegisterInput.filename,
            defaultRegisterInput.s3Key,
            defaultRegisterInput.contentType
        );

        expect(result.error).toBe('Failed to save document record.');
        expect(result.documentId).toBeUndefined();
        expect(mockedPrismaDocumentCreate).toHaveBeenCalledTimes(1);
    });
}); 