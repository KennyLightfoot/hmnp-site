import { z } from 'zod';
import { logger } from '@/lib/logger';
import { cache } from '@/lib/cache';

const uploadLogger = logger.forService('FileUploadSecurity');

// File upload security configuration
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  ALLOWED_MIME_TYPES: [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'application/zip',
    'application/x-zip-compressed'
  ],
  ALLOWED_EXTENSIONS: [
    '.pdf', '.jpg', '.jpeg', '.png', '.gif', '.webp',
    '.doc', '.docx', '.xls', '.xlsx', '.txt', '.zip'
  ],
  DANGEROUS_EXTENSIONS: [
    '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js',
    '.jar', '.sh', '.py', '.pl', '.php', '.asp', '.aspx', '.jsp'
  ],
  VIRUS_SCAN_TIMEOUT: 2 * 60 * 1000, // 2 minutes
} as const;

// File upload validation schema
export const fileUploadSchema = z.object({
  filename: z.string()
    .min(1, 'Filename is required')
    .max(255, 'Filename too long')
    .refine(
      (filename) => !UPLOAD_CONFIG.DANGEROUS_EXTENSIONS.some(ext => 
        filename.toLowerCase().endsWith(ext)
      ),
      'File type not allowed for security reasons'
    ),
  fileSize: z.number()
    .min(1, 'File size must be greater than 0')
    .max(UPLOAD_CONFIG.MAX_FILE_SIZE, `File size must be less than ${UPLOAD_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB`),
  contentType: z.string()
    .refine(
      (type) => UPLOAD_CONFIG.ALLOWED_MIME_TYPES.includes(type as any),
      'File type not supported'
    ),
});

export interface UploadSecurityResult {
  isValid: boolean;
  errors: string[];
  sanitizedFilename: string;
  securityScore: number;
}

export interface VirusScanResult {
  isClean: boolean;
  scanStatus: 'pending' | 'clean' | 'infected' | 'error' | 'timeout';
  scanDate: Date;
  threatName?: string;
  scanId: string;
}

export class FileUploadSecurity {
  
  /**
   * Comprehensive file upload validation
   */
  static validateUpload(input: {
    filename: string;
    fileSize: number;
    contentType: string;
  }): UploadSecurityResult {
    const errors: string[] = [];
    let securityScore = 100;

    try {
      // Schema validation
      fileUploadSchema.parse(input);
    } catch (error) {
      if (error instanceof z.ZodError) {
        errors.push(...error.errors.map(e => e.message));
        securityScore -= 30;
      }
    }

    // Advanced filename validation
    const sanitizedFilename = this.sanitizeFilename(input.filename);
    
    // Check for suspicious patterns
    if (this.containsSuspiciousPatterns(input.filename)) {
      errors.push('Filename contains suspicious patterns');
      securityScore -= 25;
    }

    // Check file extension matches MIME type
    if (!this.validateMimeTypeExtensionMatch(input.filename, input.contentType)) {
      errors.push('File extension does not match content type');
      securityScore -= 20;
    }

    // Check for polyglot file attacks
    if (this.detectPolyglotAttempt(input.filename, input.contentType)) {
      errors.push('Potential polyglot file attack detected');
      securityScore -= 50;
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedFilename,
      securityScore,
    };
  }

  /**
   * Advanced filename sanitization
   */
  private static sanitizeFilename(filename: string): string {
    // Remove path traversal attempts
    let sanitized = filename.replace(/[\/\\:\*\?"<>\|]/g, '_');
    
    // Remove null bytes and control characters
    sanitized = sanitized.replace(/[\x00-\x1f\x80-\x9f]/g, '_');
    
    // Remove leading/trailing dots and spaces
    sanitized = sanitized.replace(/^[.\s]+|[.\s]+$/g, '');
    
    // Limit consecutive underscores
    sanitized = sanitized.replace(/_+/g, '_');
    
    // Ensure filename isn't empty after sanitization
    if (!sanitized || sanitized === '_') {
      sanitized = `document_${Date.now()}`;
    }

    // Preserve file extension
    const lastDotIndex = filename.lastIndexOf('.');
    if (lastDotIndex > 0) {
      const extension = filename.slice(lastDotIndex).toLowerCase();
      if (UPLOAD_CONFIG.ALLOWED_EXTENSIONS.includes(extension as any)) {
        // Remove any existing extension from sanitized name and add original
        const nameWithoutExt = sanitized.replace(/\.[^.]*$/, '');
        sanitized = `${nameWithoutExt}${extension}`;
      }
    }

    return sanitized;
  }

  /**
   * Check for suspicious filename patterns
   */
  private static containsSuspiciousPatterns(filename: string): boolean {
    const suspiciousPatterns = [
      /\.\./,                    // Path traversal
      /\x00/,                    // Null bytes
      /script:/i,                // Script injection
      /javascript:/i,            // JavaScript protocol
      /data:/i,                  // Data URLs
      /vbscript:/i,             // VBScript
      /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i, // Windows reserved names
      /\.(php|asp|jsp|py|pl|rb|exe|bat|cmd)$/i, // Dangerous extensions
    ];

    return suspiciousPatterns.some(pattern => pattern.test(filename));
  }

  /**
   * Validate that file extension matches MIME type
   */
  private static validateMimeTypeExtensionMatch(filename: string, mimeType: string): boolean {
    const extension = filename.toLowerCase().split('.').pop();
    
    const mimeExtensionMap: Record<string, string[]> = {
      'application/pdf': ['pdf'],
      'image/jpeg': ['jpg', 'jpeg'],
      'image/png': ['png'],
      'image/gif': ['gif'],
      'image/webp': ['webp'],
      'application/msword': ['doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
      'application/vnd.ms-excel': ['xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['xlsx'],
      'text/plain': ['txt'],
      'application/zip': ['zip'],
      'application/x-zip-compressed': ['zip'],
    };

    const expectedExtensions = mimeExtensionMap[mimeType];
    return expectedExtensions ? expectedExtensions.includes(extension || '') : false;
  }

  /**
   * Detect potential polyglot file attacks
   */
  private static detectPolyglotAttempt(filename: string, mimeType: string): boolean {
    // Check for multiple extensions that could indicate polyglot attempts
    const extensions = filename.toLowerCase().split('.').slice(1);
    
    // More than 2 extensions is suspicious
    if (extensions.length > 2) return true;
    
    // Check for dangerous extension combinations
    const dangerousCombinations = [
      ['html', 'txt'], ['php', 'jpg'], ['asp', 'gif'], 
      ['jsp', 'png'], ['js', 'pdf'], ['exe', 'zip']
    ];
    
    return dangerousCombinations.some(combo => 
      combo.every(ext => extensions.includes(ext))
    );
  }

  /**
   * Check virus scan status for uploaded file
   */
  static async checkVirusScanStatus(s3Key: string): Promise<VirusScanResult> {
    const scanId = `scan_${Buffer.from(s3Key).toString('base64')}`;
    
    try {
      // Check cache first for scan results
      const cachedResult = await cache.get<VirusScanResult>(`virus_scan:${scanId}`);
      if (cachedResult) {
        return cachedResult;
      }

      // Query S3 object tags to check scan status
      const scanResult = await this.queryS3ScanTags(s3Key);
      
      // Cache the result
      if (scanResult.scanStatus !== 'pending') {
        await cache.set(`virus_scan:${scanId}`, scanResult, {
          ttl: 24 * 60 * 60, // Cache for 24 hours
        });
      }

      return scanResult;
    } catch (error) {
      uploadLogger.error('Failed to check virus scan status', { s3Key, error });
      
      return {
        isClean: false,
        scanStatus: 'error',
        scanDate: new Date(),
        scanId,
      };
    }
  }

  /**
   * Query S3 object tags for scan results
   */
  private static async queryS3ScanTags(s3Key: string): Promise<VirusScanResult> {
    const scanId = `scan_${Buffer.from(s3Key).toString('base64')}`;
    
    try {
      // Import AWS SDK dynamically to avoid bundling in client
      const { GetObjectTaggingCommand, S3Client } = await import('@aws-sdk/client-s3');
      
      const s3Client = new S3Client({
        region: process.env.AWS_REGION || 'us-east-1',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        },
      });

      const command = new GetObjectTaggingCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: s3Key,
      });

      const response = await s3Client.send(command);
      const tags = response.TagSet || [];
      
      // Look for ClamAV scan tags
      const statusTag = tags.find(tag => tag.Key === 'clamav-scan-status');
      const timestampTag = tags.find(tag => tag.Key === 'clamav-scan-timestamp');
      const threatTag = tags.find(tag => tag.Key === 'clamav-threat-name');

      if (!statusTag) {
        return {
          isClean: false,
          scanStatus: 'pending',
          scanDate: new Date(),
          scanId,
        };
      }

      const scanStatus = statusTag.Value as VirusScanResult['scanStatus'];
      const isClean = scanStatus === 'clean';
      const scanDate = timestampTag?.Value ? new Date(timestampTag.Value) : new Date();
      const threatName = threatTag?.Value;

      return {
        isClean,
        scanStatus,
        scanDate,
        scanId,
        threatName,
      };
    } catch (error) {
      uploadLogger.error('Failed to query S3 scan tags', { s3Key, error });
      
      return {
        isClean: false,
        scanStatus: 'error',
        scanDate: new Date(),
        scanId,
      };
    }
  }

  /**
   * Trigger virus scan for uploaded file
   */
  static async triggerVirusScan(s3Key: string): Promise<boolean> {
    try {
      // This would typically trigger a Lambda function that:
      // 1. Downloads the file from S3
      // 2. Scans it with ClamAV
      // 3. Tags the S3 object with scan results
      
      // For now, we'll simulate the scan by tagging the object
      const { PutObjectTaggingCommand, S3Client } = await import('@aws-sdk/client-s3');
      
      const s3Client = new S3Client({
        region: process.env.AWS_REGION || 'us-east-1',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        },
      });

      const command = new PutObjectTaggingCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: s3Key,
        Tagging: {
          TagSet: [
            {
              Key: 'clamav-scan-status',
              Value: 'pending',
            },
            {
              Key: 'clamav-scan-timestamp',
              Value: new Date().toISOString(),
            },
            {
              Key: 'scan-requested-by',
              Value: 'file-upload-security',
            },
          ],
        },
      });

      await s3Client.send(command);
      
      // In production, you would invoke a Lambda function here
      // await this.invokeClamAVLambda(s3Key);
      
      uploadLogger.info('Virus scan triggered for file', { s3Key });
      return true;
    } catch (error) {
      uploadLogger.error('Failed to trigger virus scan', { s3Key, error });
      return false;
    }
  }

  /**
   * Wait for virus scan completion with timeout
   */
  static async waitForVirusScan(
    s3Key: string, 
    timeoutMs: number = UPLOAD_CONFIG.VIRUS_SCAN_TIMEOUT
  ): Promise<VirusScanResult> {
    const startTime = Date.now();
    const pollInterval = 5000; // 5 seconds
    
    while (Date.now() - startTime < timeoutMs) {
      const scanResult = await this.checkVirusScanStatus(s3Key);
      
      if (scanResult.scanStatus !== 'pending') {
        return scanResult;
      }
      
      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
    
    // Timeout reached
    return {
      isClean: false,
      scanStatus: 'timeout',
      scanDate: new Date(),
      scanId: `scan_${Buffer.from(s3Key).toString('base64')}`,
    };
  }

  /**
   * Generate secure S3 key for uploaded file
   */
  static generateSecureS3Key(
    category: string,
    sessionId: string,
    sanitizedFilename: string,
    userId: string
  ): string {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const userHash = Buffer.from(userId).toString('base64').substring(0, 8);
    
    return `${category}/${sessionId}/${timestamp}-${userHash}-${randomSuffix}-${sanitizedFilename}`;
  }

  /**
   * Rate limiting for file uploads per user
   */
  static async checkUploadRateLimit(userId: string): Promise<{ allowed: boolean; remainingUploads: number }> {
    const rateLimitKey = `upload_rate_limit:${userId}`;
    const dailyLimit = 50; // 50 uploads per day per user
    const windowSeconds = 24 * 60 * 60; // 24 hours

    try {
      const currentCount = await cache.get<number>(rateLimitKey) || 0;
      
      if (currentCount >= dailyLimit) {
        return { allowed: false, remainingUploads: 0 };
      }

      // Increment counter
      await cache.set(rateLimitKey, currentCount + 1, { ttl: windowSeconds });
      
      return { 
        allowed: true, 
        remainingUploads: dailyLimit - currentCount - 1 
      };
    } catch (error) {
      uploadLogger.error('Failed to check upload rate limit', { userId, error });
      // On error, allow upload but log for monitoring
      return { allowed: true, remainingUploads: dailyLimit };
    }
  }

  /**
   * Comprehensive security audit for file upload
   */
  static async auditFileUpload(params: {
    userId: string;
    filename: string;
    fileSize: number;
    contentType: string;
    ipAddress: string;
    userAgent: string;
  }) {
    const auditLog = {
      timestamp: new Date().toISOString(),
      userId: params.userId,
      filename: params.filename,
      fileSize: params.fileSize,
      contentType: params.contentType,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      securityChecks: {
        filenameValidation: false,
        mimeTypeValidation: false,
        sizeValidation: false,
        rateLimitCheck: false,
        suspiciousPatterns: false,
      },
    };

    // Perform security validation
    const validationResult = this.validateUpload({
      filename: params.filename,
      fileSize: params.fileSize,
      contentType: params.contentType,
    });

    auditLog.securityChecks.filenameValidation = validationResult.isValid;
    auditLog.securityChecks.mimeTypeValidation = !validationResult.errors.some(e => 
      e.includes('content type') || e.includes('File type')
    );
    auditLog.securityChecks.sizeValidation = params.fileSize <= UPLOAD_CONFIG.MAX_FILE_SIZE;
    auditLog.securityChecks.suspiciousPatterns = !this.containsSuspiciousPatterns(params.filename);

    // Check rate limiting
    const rateLimitResult = await this.checkUploadRateLimit(params.userId);
    auditLog.securityChecks.rateLimitCheck = rateLimitResult.allowed;

    // Log security audit
    uploadLogger.info('File upload security audit', auditLog);

    // Alert on security violations
    if (!validationResult.isValid || validationResult.securityScore < 70) {
      uploadLogger.warn('File upload security violation detected', {
        ...auditLog,
        securityScore: validationResult.securityScore,
        violations: validationResult.errors,
      });
    }

    return {
      auditLog,
      validationResult,
      rateLimitResult,
    };
  }
}

export default FileUploadSecurity;