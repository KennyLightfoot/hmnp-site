import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Password reset request schema
const resetRequestSchema = z.object({
  email: z.string().email('Valid email is required'),
});

// Password reset confirmation schema
const resetConfirmSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

/**
 * POST /api/auth/password-reset
 * Request password reset (send reset email)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = resetRequestSchema.parse(body);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true, name: true }
    });

    // Always return success to prevent email enumeration attacks
    const successResponse = {
      success: true,
      message: 'If an account with that email exists, you will receive a password reset link.',
    };

    if (!user) {
      // Still return success but don't send email
      return NextResponse.json(successResponse);
    }

    // Generate reset token (expires in 1 hour)
    const resetToken = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        type: 'password-reset' 
      },
      process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET!,
      { expiresIn: '1h' }
    );

    // Create reset URL
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    // Send reset email if Resend is configured
    if (process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: process.env.FROM_EMAIL || 'notifications@houstonmobilenotarypros.com',
          to: user.email,
          subject: 'Reset Your Password - HMNP',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Reset Your Password</h2>
              <p>Hello ${user.name || 'there'},</p>
              <p>You requested to reset your password for your Houston Mobile Notary Pros account.</p>
              <p>Click the button below to reset your password:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" 
                   style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  Reset Password
                </a>
              </div>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #666;">${resetUrl}</p>
              <p><strong>This link will expire in 1 hour.</strong></p>
              <p>If you didn't request this password reset, you can safely ignore this email.</p>
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 12px;">
                Houston Mobile Notary Pros<br>
                This is an automated message, please do not reply.
              </p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error('Password reset email failed:', emailError);
        // Don't fail the request if email fails
      }
    } else {
      console.log(`Password reset token for ${user.email}: ${resetToken}`);
    }

    return NextResponse.json(successResponse);

  } catch (error) {
    console.error('Password reset request error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation failed',
        details: error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/auth/password-reset
 * Confirm password reset (set new password)
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, newPassword } = resetConfirmSchema.parse(body);

    // Verify reset token
    let decoded: any;
    try {
      decoded = jwt.verify(
        token, 
        process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET!
      );
    } catch (jwtError) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Verify token type and get user
    if (decoded.type !== 'password-reset') {
      return NextResponse.json(
        { error: 'Invalid reset token' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true }
    });

    if (!user || user.email !== decoded.email) {
      return NextResponse.json(
        { error: 'Invalid reset token' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user password
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        password: hashedPassword,
        updatedAt: new Date(),
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully. You can now sign in with your new password.',
    });

  } catch (error) {
    console.error('Password reset confirmation error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation failed',
        details: error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
} 