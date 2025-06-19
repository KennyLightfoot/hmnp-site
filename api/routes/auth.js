/**
 * Authentication Routes
 * Houston Mobile Notary Pros API
 */

import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * Validation middleware
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

/**
 * Helper function to generate tokens
 */
const generateTokens = (user) => {
  // Create access token (short-lived)
  const accessToken = jwt.sign(
    { 
      id: user.id, 
      email: user.email,
      firstName: user.firstName
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  // Create refresh token (long-lived)
  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

/**
 * POST /api/auth/login
 * Authenticates a user and returns JWT tokens
 */
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: { roles: { include: { role: true } } }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: 'Account disabled',
        message: 'Your account has been disabled. Please contact support.'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    // Record login attempt
    await prisma.loginAttempt.create({
      data: {
        userId: user.id,
        success: isPasswordValid,
        ipAddress: req.ip || '0.0.0.0',
        userAgent: req.headers['user-agent']
      }
    });

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Store refresh token in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt
      }
    });

    // Update last login timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    // Extract role names
    const roles = user.roles.map(r => r.role.name);

    res.json({
      success: true,
      message: 'Authentication successful',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication error',
      message: 'An error occurred during authentication'
    });
  }
}));

/**
 * POST /api/auth/refresh
 * Refreshes an expired access token using a valid refresh token
 */
router.post('/refresh', [
  body('refreshToken').notEmpty().withMessage('Refresh token is required'),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  try {
    const { refreshToken } = req.body;

    // Find the refresh token in the database
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true }
    });

    if (!storedToken) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        message: 'Refresh token not found'
      });
    }

    // Check if token is expired or revoked
    const now = new Date();
    if (storedToken.expiresAt < now || storedToken.revokedAt) {
      return res.status(401).json({
        success: false,
        error: 'Token expired',
        message: 'Refresh token has expired or been revoked'
      });
    }

    // Verify the refresh token
    try {
      jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      console.debug('Invalid refresh token:', err.message);
      await prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revokedAt: new Date() }
      });

      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        message: 'Refresh token validation failed'
      });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(storedToken.user);

    // Revoke the old refresh token
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() }
    });

    // Store the new refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: storedToken.user.id,
        expiresAt
      }
    });

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      accessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      error: 'Token refresh error',
      message: 'An error occurred while refreshing your session'
    });
  }
}));

/**
 * POST /api/auth/logout
 * Revokes the provided refresh token
 */
router.post('/logout', authenticate, [
  body('refreshToken').notEmpty().withMessage('Refresh token is required'),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  try {
    const { refreshToken } = req.body;

    // Find and revoke the refresh token
    await prisma.refreshToken.updateMany({
      where: {
        token: refreshToken,
        userId: req.user.id, // Ensure token belongs to the logged-in user
        revokedAt: null
      },
      data: {
        revokedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout error',
      message: 'An error occurred during logout'
    });
  }
}));

/**
 * POST /api/auth/register
 * Registers a new user (restricted to admins or for initial setup)
 */
router.post('/register', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/).withMessage('Password must include uppercase, lowercase, number and special character'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').optional(),
  body('phoneNumber').optional(),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  try {
    const { email, password, firstName, lastName, phoneNumber, isAdmin } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Registration failed',
        message: 'User with this email already exists'
      });
    }

    // Check if this is the first user (allow admin role for first user)
    const userCount = await prisma.user.count();
    let rolesToAssign = ['USER'];

    // Only assign admin to first user or if requested by an existing admin
    if (isAdmin && (userCount === 0 || 
         (req.user && req.user.roles && req.user.roles.includes('ADMIN')))) {
      rolesToAssign.push('ADMIN');
    }

    // Hash the password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create transaction to create user and roles
    const user = await prisma.$transaction(async (tx) => {
      // Create the user
      const newUser = await tx.user.create({
        data: {
          email,
          passwordHash,
          firstName,
          lastName,
          phoneNumber
        }
      });

      // Get role IDs
      const roles = await tx.role.findMany({
        where: {
          name: {
            in: rolesToAssign
          }
        }
      });

      // Assign roles to user
      for (const role of roles) {
        await tx.userRole.create({
          data: {
            userId: newUser.id,
            roleId: role.id
          }
        });
      }

      return newUser;
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      userId: user.id
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration error',
      message: 'An error occurred during registration'
    });
  }
}));

/**
 * GET /api/auth/profile
 * Returns the profile of the authenticated user
 */
router.get('/profile', authenticate, asyncHandler(async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { roles: { include: { role: true } } }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'User profile not found'
      });
    }

    // Extract roles
    const roles = user.roles.map(r => r.role.name);

    res.json({
      success: true,
      profile: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        profileImageUrl: user.profileImageUrl,
        roles,
        lastLoginAt: user.lastLoginAt
      }
    });
  } catch (error) {
    console.error('Profile retrieval error:', error);
    res.status(500).json({
      success: false,
      error: 'Profile error',
      message: 'An error occurred while retrieving your profile'
    });
  }
}));

/**
 * PUT /api/auth/profile
 * Updates the profile of the authenticated user
 */
router.put('/profile', authenticate, [
  body('firstName').optional(),
  body('lastName').optional(),
  body('phoneNumber').optional(),
  body('profileImageUrl').optional(),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  try {
    const { firstName, lastName, phoneNumber, profileImageUrl } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(phoneNumber !== undefined && { phoneNumber }),
        ...(profileImageUrl !== undefined && { profileImageUrl })
      }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        phoneNumber: updatedUser.phoneNumber,
        profileImageUrl: updatedUser.profileImageUrl
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      error: 'Profile update error',
      message: 'An error occurred while updating your profile'
    });
  }
}));

/**
 * PUT /api/auth/password
 * Changes the password of the authenticated user
 */
router.put('/password', authenticate, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/).withMessage('Password must include uppercase, lowercase, number and special character'),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get the user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Password change failed',
        message: 'Current password is incorrect'
      });
    }

    // Hash the new password
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update the password
    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash: newPasswordHash }
    });

    // Revoke all refresh tokens for security
    await prisma.refreshToken.updateMany({
      where: {
        userId: req.user.id,
        revokedAt: null
      },
      data: { revokedAt: new Date() }
    });

    res.json({
      success: true,
      message: 'Password changed successfully. Please login again with your new password.'
    });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({
      success: false,
      error: 'Password change error',
      message: 'An error occurred while changing your password'
    });
  }
}));

export default router;
