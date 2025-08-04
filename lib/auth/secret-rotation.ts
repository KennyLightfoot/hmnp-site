import { randomBytes } from 'crypto';
import { redis } from '@/lib/redis';

export interface SecretRotationConfig {
  secretName: string;
  rotationIntervalDays: number;
  gracePeriodDays: number;
  notificationDays: number;
}

export interface SecretVersion {
  version: number;
  secret: string;
  createdAt: string;
  expiresAt: string;
  isActive: boolean;
}

export class SecretRotationService {
  private static readonly DEFAULT_CONFIGS: Record<string, SecretRotationConfig> = {
    JWT_SECRET: {
      secretName: 'JWT_SECRET',
      rotationIntervalDays: 30,
      gracePeriodDays: 7,
      notificationDays: 3
    },
    JWT_REFRESH_SECRET: {
      secretName: 'JWT_REFRESH_SECRET',
      rotationIntervalDays: 60,
      gracePeriodDays: 14,
      notificationDays: 7
    },
    STRIPE_WEBHOOK_SECRET: {
      secretName: 'STRIPE_WEBHOOK_SECRET',
      rotationIntervalDays: 90,
      gracePeriodDays: 30,
      notificationDays: 7
    },
    RESEND_API_KEY: {
      secretName: 'RESEND_API_KEY',
      rotationIntervalDays: 90,
      gracePeriodDays: 30,
      notificationDays: 7
    }
  };

  /**
   * Initialize secret rotation tracking
   */
  static async initializeSecret(
    secretName: string,
    currentSecret: string,
    config?: SecretRotationConfig
  ): Promise<void> {
    const secretConfig = config || this.DEFAULT_CONFIGS[secretName];
    if (!secretConfig) {
      throw new Error(`No rotation config found for secret: ${secretName}`);
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + (secretConfig.rotationIntervalDays * 24 * 60 * 60 * 1000));

    const secretVersion: SecretVersion = {
      version: 1,
      secret: currentSecret,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      isActive: true
    };

    await redis.set(
      `secret:${secretName}:current`,
      JSON.stringify(secretVersion)
    );

    await redis.set(
      `secret:${secretName}:config`,
      JSON.stringify(secretConfig)
    );
  }

  /**
   * Generate new secret version
   */
  static async rotateSecret(secretName: string): Promise<{
    newSecret: string;
    oldSecret: string;
    version: number;
  }> {
    const currentData = await redis.get(`secret:${secretName}:current`);
    const configData = await redis.get(`secret:${secretName}:config`);

    if (!currentData || !configData) {
      throw new Error(`Secret ${secretName} not initialized`);
    }

    const current: SecretVersion = JSON.parse(currentData);
    const config: SecretRotationConfig = JSON.parse(configData);

    // Generate new secret
    const newSecret = this.generateSecret(secretName);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (config.rotationIntervalDays * 24 * 60 * 60 * 1000));

    const newVersion: SecretVersion = {
      version: current.version + 1,
      secret: newSecret,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      isActive: true
    };

    // Store new version as current
    await redis.set(
      `secret:${secretName}:current`,
      JSON.stringify(newVersion)
    );

    // Store old version with grace period
    const graceExpiresAt = new Date(now.getTime() + (config.gracePeriodDays * 24 * 60 * 60 * 1000));
    const oldVersion: SecretVersion = {
      ...current,
      isActive: false,
      expiresAt: graceExpiresAt.toISOString()
    };

    await redis.set(
      `secret:${secretName}:version_${current.version}`,
      JSON.stringify(oldVersion)
    );

    // Set expiration for old version
    await redis.expire(
      `secret:${secretName}:version_${current.version}`,
      config.gracePeriodDays * 24 * 60 * 60
    );

    return {
      newSecret,
      oldSecret: current.secret,
      version: newVersion.version
    };
  }

  /**
   * Get current secret
   */
  static async getCurrentSecret(secretName: string): Promise<string | null> {
    const currentData = await redis.get(`secret:${secretName}:current`);
    if (!currentData) return null;

    const current: SecretVersion = JSON.parse(currentData);
    return current.secret;
  }

  /**
   * Get all valid secrets (current + grace period)
   */
  static async getValidSecrets(secretName: string): Promise<string[]> {
    const secrets = [];
    
    // Get current secret
    const currentData = await redis.get(`secret:${secretName}:current`);
    if (currentData) {
      const current: SecretVersion = JSON.parse(currentData);
      secrets.push(current.secret);
    }

    // Get secrets in grace period
    const pattern = `secret:${secretName}:version_*`;
    const keys = await redis.keys(pattern);
    
    for (const key of keys) {
      const versionData = await redis.get(key);
      if (versionData) {
        const version: SecretVersion = JSON.parse(versionData);
        if (new Date(version.expiresAt) > new Date()) {
          secrets.push(version.secret);
        }
      }
    }

    return [...new Set(secrets)]; // Remove duplicates
  }

  /**
   * Check if secret needs rotation
   */
  static async needsRotation(secretName: string): Promise<{
    needsRotation: boolean;
    daysUntilExpiry: number;
    notificationRequired: boolean;
  }> {
    const currentData = await redis.get(`secret:${secretName}:current`);
    const configData = await redis.get(`secret:${secretName}:config`);

    if (!currentData || !configData) {
      return {
        needsRotation: false,
        daysUntilExpiry: 0,
        notificationRequired: false
      };
    }

    const current: SecretVersion = JSON.parse(currentData);
    const config: SecretRotationConfig = JSON.parse(configData);

    const now = new Date();
    const expiresAt = new Date(current.expiresAt);
    const daysUntilExpiry = Math.ceil((expiresAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

    return {
      needsRotation: daysUntilExpiry <= 0,
      daysUntilExpiry,
      notificationRequired: daysUntilExpiry <= config.notificationDays
    };
  }

  /**
   * Get rotation status for all secrets
   */
  static async getRotationStatus(): Promise<Record<string, {
    lastRotated: string;
    nextRotation: string;
    needsRotation: boolean;
    notificationRequired: boolean;
  }>> {
    const status: Record<string, any> = {};

    for (const secretName of Object.keys(this.DEFAULT_CONFIGS)) {
      const currentData = await redis.get(`secret:${secretName}:current`);
      
      if (currentData) {
        const current: SecretVersion = JSON.parse(currentData);
        const rotationCheck = await this.needsRotation(secretName);

        status[secretName] = {
          lastRotated: current.createdAt,
          nextRotation: current.expiresAt,
          needsRotation: rotationCheck.needsRotation,
          notificationRequired: rotationCheck.notificationRequired
        };
      }
    }

    return status;
  }

  /**
   * Generate secret based on type
   */
  private static generateSecret(secretName: string): string {
    switch (secretName) {
      case 'JWT_SECRET':
      case 'JWT_REFRESH_SECRET':
        return randomBytes(64).toString('hex');
      
      case 'STRIPE_WEBHOOK_SECRET':
        return `whsec_${randomBytes(32).toString('hex')}`;
      
      default:
        return randomBytes(32).toString('hex');
    }
  }

  /**
   * Cleanup expired secrets
   */
  static async cleanupExpiredSecrets(): Promise<void> {
    const now = new Date();
    
    for (const secretName of Object.keys(this.DEFAULT_CONFIGS)) {
      const pattern = `secret:${secretName}:version_*`;
      const keys = await redis.keys(pattern);
      
      for (const key of keys) {
        const versionData = await redis.get(key);
        if (versionData) {
          const version: SecretVersion = JSON.parse(versionData);
          if (new Date(version.expiresAt) <= now) {
            await redis.del(key);
          }
        }
      }
    }
  }

  /**
   * Schedule rotation check (to be called by cron)
   */
  static async scheduleRotationCheck(): Promise<{
    rotationsNeeded: string[];
    notificationsNeeded: string[];
  }> {
    const rotationsNeeded: string[] = [];
    const notificationsNeeded: string[] = [];

    for (const secretName of Object.keys(this.DEFAULT_CONFIGS)) {
      const status = await this.needsRotation(secretName);
      
      if (status.needsRotation) {
        rotationsNeeded.push(secretName);
      }
      
      if (status.notificationRequired) {
        notificationsNeeded.push(secretName);
      }
    }

    return { rotationsNeeded, notificationsNeeded };
  }
} 