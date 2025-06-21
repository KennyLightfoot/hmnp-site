'use server'

import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Role } from "@prisma/client";
import { randomUUID } from "crypto";

// Ensure necessary environment variables are set
if (!process.env.S3_BUCKET_NAME) {
  throw new Error("S3_BUCKET_NAME environment variable is not set.");
}
if (!process.env.AWS_REGION) {
  throw new Error("AWS_REGION environment variable is not set.");
}

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  // Credentials will be automatically picked up from environment variables
  // (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY) or an IAM role.
});

const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;

/**
 * Generates a pre-signed URL for downloading an assignment document.
 * Performs authorization checks before generating the URL.
 */
export async function getPresignedDownloadUrl(documentId: string): Promise<{ error?: string; url?: string }> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { error: "Not authenticated" };
  }

  const user = session.user as any; // Use custom Session type if available
  const userId = user.id as string;
  const userRole = user.role as Role;

  if (!userId || !userRole) {
    console.error("User ID or Role missing from session");
    return { error: "Authentication error" };
  }

  try {
    // 1. Fetch the document and its associated assignment
    const document = await prisma.assignmentDocument.findUnique({
      where: { id: documentId },
      include: {
        assignment: {
          select: { id: true, partnerAssignedToId: true }, // Select only needed fields
        },
      },
    });

    if (!document || !document.assignment) {
      return { error: "Document or associated assignment not found" };
    }

    // 2. Authorization Check
    const isStaffOrAdmin = userRole === Role.ADMIN || userRole === Role.STAFF;
    const isAssignedPartner = userRole === Role.PARTNER && document.assignment.partnerAssignedToId === userId;

    if (!isStaffOrAdmin && !isAssignedPartner) {
      console.warn(`User ${userId} (${userRole}) unauthorized download attempt for doc ${documentId}`);
      return { error: "Unauthorized" };
    }

    // 3. Generate Pre-signed URL
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: document.key, // Use the object key stored in the database
      // Optional: Force download with a specific filename
      ResponseContentDisposition: `attachment; filename="${document.filename}"`,
    });

    const url = await getSignedUrl(s3Client, command, {
      expiresIn: 300, // URL expires in 5 minutes (300 seconds)
    });

    // TODO: Log the download attempt (optional)
    // await prisma.downloadLog.create(...);

    return { url };

  } catch (error) {
    console.error(`Failed to generate pre-signed URL for doc ${documentId}:`, error);
    return { error: "Failed to prepare download link." };
  }
}

/**
 * Generates a pre-signed POST URL for uploading a document directly to S3.
 * Performs authorization checks (Staff/Admin only).
 */
export async function getPresignedUploadUrl(
  assignmentId: string, // Ensure upload is associated with an assignment
  filename: string,
  contentType: string,
  // Add optional dependencies parameter
  dependencies: { uuidGenerator: () => string } = { uuidGenerator: randomUUID }
): Promise<{ error?: string; url?: string; fields?: Record<string, string>; key?: string }> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { error: "Not authenticated" };
  }

  const user = session.user as any;
  const userId = user.id as string;
  const userRole = user.role as Role;

  if (!userId || !userRole) {
    return { error: "Authentication error" };
  }

  // Authorization Check: Only Staff or Admin can upload
  if (userRole !== Role.ADMIN && userRole !== Role.STAFF) {
    console.warn(`User ${userId} (${userRole}) unauthorized upload attempt for assignment ${assignmentId}`);
    return { error: "Unauthorized" };
  }

  // TODO: Add check to ensure assignmentId exists and is valid?

  try {
    // Use the injected dependency
    const key = `assignments/${assignmentId}/${dependencies.uuidGenerator()}-${filename}`;
    const MAX_FILE_SIZE_MB = 10;
    const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

    const { url, fields } = await createPresignedPost(s3Client, {
      Bucket: S3_BUCKET_NAME,
      Key: key,
      Fields: {
        // "Content-Type": contentType, // Try removing this from Fields
      },
      Conditions: [
        ["content-length-range", 0, MAX_FILE_SIZE_BYTES], // Max file size
        // Optional: Restrict content type more strictly if needed
        // ["starts-with", "$Content-Type", "image/"], // Example: Only images
        // ["starts-with", "$Content-Type", contentType], // Ensure uploaded type matches provided type - REMOVED FOR MORE FLEXIBILITY
        ["starts-with", "$Content-Type", ""] // Explicitly allow any content type
      ],
      Expires: 300, // URL expires in 5 minutes
    });

    return { url, fields, key };

  } catch (error) {
    console.error(`Failed to generate pre-signed upload URL for ${filename}:`, error);
    return { error: "Failed to prepare upload link." };
  }
}

/**
 * Server action to register an uploaded document in the database
 * after it has been successfully uploaded to S3.
 */
export async function registerUploadedDocument(
  assignmentId: string,
  filename: string,
  s3Key: string,
  contentType: string // Store content type for future use?
): Promise<{ error?: string; documentId?: string }> {
   const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { error: "Not authenticated" };
  }

  const user = session.user as any;
  const userId = user.id as string;
  const userRole = user.role as Role;

  if (!userId || !userRole) {
    return { error: "Authentication error" };
  }

  // Authorization Check: Only Staff or Admin (consistency)
  if (userRole !== Role.ADMIN && userRole !== Role.STAFF) {
     return { error: "Unauthorized" };
  }

  try {
    const newDocument = await prisma.assignmentDocument.create({
      data: {
        assignmentId: assignmentId,
        filename: filename,
        key: s3Key,
        uploadedById: userId, // Associate with the user who initiated the upload
        // Consider storing contentType if useful
      },
      select: {
        id: true, // Return the ID of the newly created document
      },
    });

    // TODO: Optionally create a StatusHistory entry for document upload?

    return { documentId: newDocument.id };

  } catch (error) {
    console.error(`Failed to register document ${filename} (key: ${s3Key}):`, error);
    // TODO: Consider deleting the orphaned S3 object if DB registration fails?
    return { error: "Failed to save document record." };
  }

} 