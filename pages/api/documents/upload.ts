import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable'; // Using formidable for parsing multipart/form-data
import { S3Client, PutObjectCommand, PutObjectCommandOutput } from "@aws-sdk/client-s3";
import fs from 'fs'; // Needed for reading file stream if formidable saves to temp

// Environment variable checks
const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID_HMNP;
const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY_HMNP;
const awsRegion = process.env.AWS_REGION_HMNP;

if (!awsAccessKeyId || !awsSecretAccessKey || !awsRegion) {
  console.error("AWS S3 configuration is incomplete. Missing AWS_ACCESS_KEY_ID_HMNP, AWS_SECRET_ACCESS_KEY_HMNP, or AWS_REGION_HMNP environment variables.");
  // This service will likely fail to initialize or operate correctly without these.
}

const s3 = new S3Client({
  region: awsRegion,
  credentials: {
    accessKeyId: awsAccessKeyId!, // Using ! as we've checked above, ensure they are truly set in env
    secretAccessKey: awsSecretAccessKey!,
  }
});

// Important: Disable Next.js body parser for this route as formidable will handle it
export const config = {
  api: {
    bodyParser: false,
  },
};

interface FormidableFiles {
  [fieldname: string]: formidable.File | formidable.File[] | undefined;
}

interface FormidableFields {
  [fieldname: string]: string | string[] | undefined;
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB, same as frontend
const ACCEPTED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  // TODO: Implement robust authentication/authorization if users should be logged in

  const form = formidable({
    maxFileSize: MAX_FILE_SIZE_BYTES,
    // multiples: false, // If you expect only one file for 'document' field
  });

  try {
    const [fields, files] = await new Promise<[FormidableFields, FormidableFiles]>((resolve, reject) => {
      form.parse(req, (err: Error | null, parsedFields: formidable.Fields, parsedFiles: formidable.Files) => {
        if (err) {
          console.error('Formidable parsing error:', err);
          // Handle specific formidable errors like maxFileSize exceeded
          if (err && typeof err === 'object' && 'code' in err && (err as { code: unknown }).code === 1009) { // formidable's error code for maxFileSizeExceeded
            return reject({ statusCode: 413, message: 'File size exceeds the 10MB limit.' });
          }
          return reject({ statusCode: 400, message: 'Error parsing form data.' });
        }
        resolve([parsedFields, parsedFiles]);
      });
    }).catch(err => {
        // This catch is for Promise rejection from form.parse, e.g. file size limit
        throw err;
    });

    // --- 1. Extract and Validate Fields ---
    const name = fields.name?.[0];
    const email = fields.email?.[0];
    const documentType = fields.documentType?.[0]; // Optional
    const consent = fields.consent?.[0];

    if (!name || !email || !consent || consent !== 'true') {
      return res.status(400).json({ message: 'Missing required fields: name, email, or consent.' });
    }
    // Add more specific validation for name, email format if needed (Zod could be used here too)

    // --- 2. Validate File ---
    const uploadedFile = files.document ? (Array.isArray(files.document) ? files.document[0] : files.document) : undefined;

    if (!uploadedFile) {
      return res.status(400).json({ message: 'No document file provided.' });
    }

    if (!uploadedFile.mimetype || !ACCEPTED_MIME_TYPES.includes(uploadedFile.mimetype)) {
      return res.status(400).json({ message: `Invalid file type. Accepted types: ${ACCEPTED_MIME_TYPES.join(', ')}` });
    }

    if (uploadedFile.size > MAX_FILE_SIZE_BYTES) {
      return res.status(413).json({ message: 'File size exceeds the 10MB limit.' }); // Should be caught by formidable, but good to double check
    }

    console.log('Received fields:', { name, email, documentType, consent });
    console.log('Received file:', {
      originalFilename: uploadedFile.originalFilename,
      mimetype: uploadedFile.mimetype,
      size: uploadedFile.size,
      filepath: uploadedFile.filepath, // Temporary path where formidable saves the file
    });

    // --- 3. TODO: Virus/Malware Scanning ---
    // Placeholder: Before uploading to S3, scan the file at uploadedFile.filepath
    // Example: const scanResult = await scanFile(uploadedFile.filepath);
    // if (!scanResult.isSafe) {
    //   fs.unlinkSync(uploadedFile.filepath); // Delete temp file
    //   return res.status(400).json({ message: 'Malware detected in file.' });
    // }

    // --- 4. Secure AWS S3 Upload ---
    const s3BucketName = process.env.S3_BUCKET_NAME_HMNP;
    if (!s3BucketName) {
      console.error('S3_BUCKET_NAME_HMNP not configured in environment variables.');
      if (uploadedFile.filepath) fs.unlinkSync(uploadedFile.filepath); // Delete temp file
      return res.status(500).json({ message: 'Server configuration error: S3 bucket not specified.' });
    }

    if (!uploadedFile.filepath) {
        // This case should ideally not be reached if file validation is robust
        console.error('File path is missing before S3 upload attempt.');
        return res.status(500).json({ message: 'Internal server error: Missing file path.' });
    }

    const fileStream = fs.createReadStream(uploadedFile.filepath);
    const uniqueFilename = `${new Date().toISOString().replace(/:/g, '-')}-${uploadedFile.originalFilename || 'unknown-file'}`.replace(/\s+/g, '_'); // Replace spaces too

    const s3UploadParams = {
      Bucket: s3BucketName,
      Key: `client-uploads/${uniqueFilename}`,
      Body: fileStream,
      ContentType: uploadedFile.mimetype || 'application/octet-stream',
    };

    try {
      const command = new PutObjectCommand({
        ...s3UploadParams,
        ServerSideEncryption: 'AES256', // Explicitly request SSE-S3 for S3-managed keys
      });
      const s3UploadResponse: PutObjectCommandOutput = await s3.send(command);
      
      const fileUrl = `https://${s3BucketName}.s3.${awsRegion}.amazonaws.com/${s3UploadParams.Key}`;
      console.log('S3 Upload Successful. ETag:', s3UploadResponse.ETag, 'URL:', fileUrl);

      fs.unlinkSync(uploadedFile.filepath); // Delete temp file after successful S3 upload

      // TODO: Store metadata about the upload in your database if needed (e.g., fileUrl, userId, etc.)

      return res.status(201).json({ 
        message: 'Document uploaded successfully.', 
        fileUrl: fileUrl 
      });
    } catch (s3Error: unknown) {
      let s3ErrorMessage = 'An unknown S3 error occurred during upload.';
      if (s3Error instanceof Error) {
        s3ErrorMessage = s3Error.message;
      } else if (typeof s3Error === 'string') {
        s3ErrorMessage = s3Error;
      }
      console.error('S3 Upload Error (raw):', s3Error); // Log the original error object for more details
      
      if (uploadedFile?.filepath) { 
          try {
              fs.unlinkSync(uploadedFile.filepath); 
          } catch (unlinkErr) {
              console.error('Error deleting temp file after S3 error:', unlinkErr);
          }
      }
      return res.status(500).json({ message: 'Failed to upload document. Please try again later.', details: s3ErrorMessage });
    }

  } catch (error: unknown) {
    let errorMessage = 'An unexpected error occurred processing your request.';
    let statusCode = 500;

    if (typeof error === 'object' && error !== null) {
      if ('message' in error && typeof (error as { message: unknown }).message === 'string') {
        errorMessage = (error as { message: string }).message;
      }
      // Check for statusCode property, common in custom error objects or from libraries
      if ('statusCode' in error && typeof (error as { statusCode: unknown }).statusCode === 'number') {
        statusCode = (error as { statusCode: number }).statusCode;
      }
    } else if (typeof error === 'string') {
      errorMessage = error; // If the error is just a string
    }

    console.error('API Error in /api/documents/upload (raw):', error); 

    // Note on temp file cleanup: formidable handles temp file cleanup on its own errors if `keepExtensions` or a `uploadDir` is used.
    // If files are manually moved or `formidable` isn't cleaning up, additional logic here or in a `finally` might be needed.
    // The current logic tries to clean up the temp file in the S3 error block.

    return res.status(statusCode).json({ message: errorMessage });
  }
}

// --- TODO: Helper function for Virus Scanning (conceptual) ---
// async function scanFile(filePath: string): Promise<{ isSafe: boolean; details?: any }> {
//   // Implement actual scanning logic here
//   console.warn(`Virus scanning for ${filePath} is not implemented.`);
//   return { isSafe: true }; // Default to safe for now
// }
