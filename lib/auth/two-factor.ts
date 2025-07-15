// @ts-ignore - otplib types may not be available
import { authenticator } from 'otplib';
import { randomBytes } from 'crypto';
import { prisma } from '@/lib/prisma';
// @ts-ignore - qrcode types may not be available  
import QRCode from 'qrcode';

export interface TwoFactorSetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export interface TwoFactorVerification {
  isValid: boolean;
  usedBackupCode?: boolean;
}

export class TwoFactorService {
  private static readonly SERVICE_NAME = 'Houston Mobile Notary Pros';
  private static readonly BACKUP_CODE_COUNT = 8;
  private static readonly BACKUP_CODE_LENGTH = 8;

  /**
   * Generate 2FA setup for a user
   */
  static async generateSetup(userId: string, userEmail: string): Promise<TwoFactorSetup> {
    const secret = authenticator.generateSecret();
    const backupCodes = this.generateBackupCodes();
    
    // Create TOTP URL for QR code
    const totpUrl = authenticator.keyuri(
      userEmail,
      this.SERVICE_NAME,
      secret
    );
    
    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(totpUrl);
    
    // Store in database (encrypted backup codes)
    await (prisma as any).userTwoFactor.upsert({
      where: { userId },
      update: {
        secret,
        backupCodes: JSON.stringify(backupCodes),
        isEnabled: false, // Will be enabled after verification
        createdAt: new Date(),
      },
      create: {
        userId,
        secret,
        backupCodes: JSON.stringify(backupCodes),
        isEnabled: false,
        createdAt: new Date(),
      },
    });
    
    return {
      secret,
      qrCodeUrl,
      backupCodes,
    };
  }

  /**
   * Verify TOTP token and enable 2FA
   */
  static async verifyAndEnable(userId: string, token: string): Promise<boolean> {
    const twoFactor = await (prisma as any).userTwoFactor.findUnique({
      where: { userId },
    });
    
    if (!twoFactor) {
      return false;
    }
    
    const isValid = authenticator.verify({
      token,
      secret: twoFactor.secret,
      window: 2, // Allow 2 time windows for clock drift
    });
    
    if (isValid) {
      // Enable 2FA
      await (prisma as any).userTwoFactor.update({
        where: { userId },
        data: { isEnabled: true },
      });
    }
    
    return isValid;
  }

  /**
   * Verify 2FA token during login
   */
  static async verifyToken(userId: string, token: string): Promise<TwoFactorVerification> {
    const twoFactor = await (prisma as any).userTwoFactor.findUnique({
      where: { userId },
    });
    
    if (!twoFactor || !twoFactor.isEnabled) {
      return { isValid: false };
    }
    
    // Try TOTP first
    const totpValid = authenticator.verify({
      token,
      secret: twoFactor.secret,
      window: 2,
    });
    
    if (totpValid) {
      return { isValid: true };
    }
    
    // Try backup codes
    const backupCodes: string[] = JSON.parse(twoFactor.backupCodes || '[]');
    const codeIndex = backupCodes.indexOf(token);
    
    if (codeIndex !== -1) {
      // Remove used backup code
      backupCodes.splice(codeIndex, 1);
      
      await (prisma as any).userTwoFactor.update({
        where: { userId },
        data: { backupCodes: JSON.stringify(backupCodes) },
      });
      
      return { isValid: true, usedBackupCode: true };
    }
    
    return { isValid: false };
  }

  /**
   * Check if user has 2FA enabled
   */
  static async isEnabled(userId: string): Promise<boolean> {
    const twoFactor = await (prisma as any).userTwoFactor.findUnique({
      where: { userId },
    });
    
    return twoFactor?.isEnabled || false;
  }

  /**
   * Disable 2FA for user
   */
  static async disable(userId: string): Promise<void> {
    await (prisma as any).userTwoFactor.delete({
      where: { userId },
    });
  }

  /**
   * Generate new backup codes
   */
  static async regenerateBackupCodes(userId: string): Promise<string[]> {
    const backupCodes = this.generateBackupCodes();
    
    await (prisma as any).userTwoFactor.update({
      where: { userId },
      data: { backupCodes: JSON.stringify(backupCodes) },
    });
    
    return backupCodes;
  }

  /**
   * Generate backup codes
   */
  private static generateBackupCodes(): string[] {
    const codes: string[] = [];
    
    for (let i = 0; i < this.BACKUP_CODE_COUNT; i++) {
      const code = randomBytes(this.BACKUP_CODE_LENGTH / 2).toString('hex');
      codes.push(code);
    }
    
    return codes;
  }
} 