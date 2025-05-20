import { S3Client, GetObjectCommand, PutObjectTaggingCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { execFileSync } from 'child_process';
import { Readable } from 'stream';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';

const s3 = new S3Client({});

// IMPORTANT: These paths depend on how you package ClamAV and its definitions.
// If using a Lambda Layer, /opt/ is common. Otherwise, adjust to their location in your deployment package.
const CLAMSCAN_PATH = process.env.CLAMSCAN_PATH || '/opt/clamav/bin/clamscan';
const VIRUS_DEFS_PATH = process.env.VIRUS_DEFS_PATH || '/opt/clamav/defs';

// Helper to stream S3 object to a local file
async function downloadFileFromS3(bucket, key, downloadPath) {
  console.log(`Attempting to download s3://${bucket}/${key} to ${downloadPath}`);
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  const { Body, ContentLength } = await s3.send(command);
  console.log(`S3 GetObject response received. ContentLength: ${ContentLength}`);
  if (!(Body instanceof Readable)) {
    throw new Error('S3 object body is not a readable stream.');
  }
  await writeFile(downloadPath, Body);
  console.log(`File downloaded successfully to ${downloadPath}`);
}

export const handler = async (event) => {
  console.log('Received S3 event:', JSON.stringify(event, null, 2));

  for (const record of event.Records) {
    const bucketName = record.s3.bucket.name;
    const objectKey = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
    // Generate a unique-ish name for the temp file, especially if multiple objects could have same name
    const tempFileName = `${Date.now()}-${objectKey.split('/').pop() || 'unknownfile'}`;
    const tempFilePath = join('/tmp', tempFileName);

    console.log(`Processing ${objectKey} from bucket ${bucketName}. Temp file: ${tempFilePath}`);

    try {
      // 1. Download the file from S3 to Lambda's /tmp directory
      await downloadFileFromS3(bucketName, objectKey, tempFilePath);

      // 2. Scan the file using ClamAV
      console.log(`Scanning ${tempFilePath} with ClamAV... Database: ${VIRUS_DEFS_PATH}`);
      let scanResultOutput = '';
      let isSafe = false;

      try {
        const clamscanArgs = [
          `--database=${VIRUS_DEFS_PATH}`,
          '--stdout',
          '--no-summary',
          // Consider adding resource limits for clamscan if needed, e.g.:
          // '--max-filesize=100M', // Max file size for ClamAV to scan
          // '--max-scansize=150M', // Max data to scan per file
          tempFilePath
        ];
        console.log(`Executing: ${CLAMSCAN_PATH} ${clamscanArgs.join(' ')}`);
        
        scanResultOutput = execFileSync(CLAMSCAN_PATH, clamscanArgs, { encoding: 'utf-8', timeout: 120000 }); // 2 min timeout
        console.log('ClamAV scan raw output:', scanResultOutput);

        if (scanResultOutput.includes(`${tempFilePath}: OK`)) {
          isSafe = true;
        } else if (scanResultOutput.includes('FOUND')) {
          // This case might be covered by the catch block if ClamAV exits with 1
          isSafe = false;
        } else {
          console.warn('Ambiguous ClamAV scan result (no OK, no FOUND):', scanResultOutput);
          isSafe = false; // Default to unsafe
        }
      } catch (error) {
        // This block catches errors from execFileSync, including non-zero exit codes from clamscan.
        // ClamAV exits with 1 if a virus is found.
        console.error('ClamAV execution error object:', JSON.stringify(error));
        scanResultOutput = error.stdout?.toString() || error.message;
        console.error('ClamAV execution error output/message:', scanResultOutput);

        if (error.status === 1 && scanResultOutput.includes('FOUND')) { 
          isSafe = false;
          console.log('Virus detected by ClamAV (exit code 1).');
        } else {
          console.error('ClamAV scan failed or other non-zero exit code:', error.status);
          isSafe = false; 
        }
      }
      
      // 3. Take action based on scan result
      if (isSafe) {
        console.log(`${objectKey} is clean. Tagging object.`);
        await s3.send(new PutObjectTaggingCommand({
          Bucket: bucketName,
          Key: objectKey,
          Tagging: { TagSet: [{ Key: 'clamav-scan-status', Value: 'clean' }, {Key: 'clamav-scan-date', Value: new Date().toISOString()}] },
        }));
      } else {
        console.warn(`${objectKey} is INFECTED or scan failed. Deleting object.`);
        await s3.send(new DeleteObjectCommand({
          Bucket: bucketName,
          Key: objectKey,
        }));
        console.log(`Deleted infected/problematic file: ${objectKey}`);
        // TODO: Optionally, send an SNS notification or log to a security dashboard here.
        // Consider tagging before delete if logs/notifications need the tag.
      }

    } catch (error) {
      console.error(`Error processing ${objectKey}: ${error.message}`, error.stack);
      try {
        await s3.send(new PutObjectTaggingCommand({
          Bucket: bucketName,
          Key: objectKey, 
          Tagging: { TagSet: [{ Key: 'clamav-scan-status', Value: 'error' }, {Key: 'clamav-scan-error', Value: error.message.substring(0,250)}, {Key: 'clamav-scan-date', Value: new Date().toISOString()}] },
        }));
      } catch (tagError) {
        console.error(`Failed to tag ${objectKey} as error:`, tagError);
      }
    } finally {
      // 4. Clean up the temporary file from Lambda's /tmp
      try {
        console.log(`Deleting temporary file: ${tempFilePath}`);
        await unlink(tempFilePath);
      } catch (cleanupError) {
        // Log if temp file doesn't exist or can't be deleted, but don't fail the whole function.
        if (cleanupError.code !== 'ENOENT') { // ENOENT = Error No Entity (file not found)
            console.warn(`Error deleting temporary file ${tempFilePath}:`, cleanupError);
        }
      }
    }
  }
  console.log('Finished processing all S3 event records.');
  return { status: 'OK', message: 'All records processed.' };
};
