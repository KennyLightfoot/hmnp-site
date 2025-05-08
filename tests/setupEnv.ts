import { vi } from 'vitest';

// Set environment variables required by modules during import
process.env.S3_BUCKET_NAME = 'mock-bucket';
process.env.AWS_REGION = 'mock-region';

// Optionally, mock other global dependencies or setup here
// console.log('Vitest setup file executed'); 