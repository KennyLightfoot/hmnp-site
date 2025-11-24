import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { NotaryApplicationStatus, Prisma } from '@/lib/prisma-types'
import { z } from 'zod'
import { logger } from '@/lib/logger'
import { getErrorMessage } from '@/lib/utils/error-utils'

const applySchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(10),
  commissionNumber: z.string().optional(),
  commissionState: z.string().optional(),
  commissionExpiry: z.string().optional(),
  statesLicensed: z.array(z.string()).min(1),
  countiesServed: z.array(z.string()).optional(),
  yearsExperience: z.number().int().min(0).optional(),
  serviceTypes: z.array(z.string()).min(1),
  languagesSpoken: z.array(z.string()).optional(),
  specialCertifications: z.array(z.string()).optional(),
  eoInsuranceProvider: z.string().optional(),
  eoInsurancePolicy: z.string().optional(),
  eoInsuranceExpiry: z.string().optional(),
  baseAddress: z.string().optional(),
  baseZip: z.string().optional(),
  serviceRadiusMiles: z.number().int().min(1).max(100).optional(),
  availabilityNotes: z.string().optional(),
  whyInterested: z.string().optional(),
  references: z.string().optional(),
  resumeUrl: z.string().url().optional().or(z.literal('')),
  termsAccepted: z.boolean(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = applySchema.parse(body)

    if (!validatedData.termsAccepted) {
      return NextResponse.json(
        { error: 'You must accept the terms and conditions' },
        { status: 400 }
      )
    }

    // Check if application already exists for this email
    const existingApplication = await prisma.notaryApplication.findUnique({
      where: { email: validatedData.email },
    })

    if (existingApplication) {
      return NextResponse.json(
        { error: 'An application with this email already exists' },
        { status: 400 }
      )
    }

    // Parse dates
    const commissionExpiry = validatedData.commissionExpiry
      ? new Date(validatedData.commissionExpiry)
      : null
    const eoInsuranceExpiry = validatedData.eoInsuranceExpiry
      ? new Date(validatedData.eoInsuranceExpiry)
      : null

    // Create application
    const application = await prisma.notaryApplication.create({
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        phone: validatedData.phone,
        commissionNumber: validatedData.commissionNumber,
        commissionState: validatedData.commissionState,
        commissionExpiry: commissionExpiry,
        statesLicensed: validatedData.statesLicensed,
        countiesServed: validatedData.countiesServed || [],
        yearsExperience: validatedData.yearsExperience,
        serviceTypes: validatedData.serviceTypes,
        languagesSpoken: validatedData.languagesSpoken || [],
        specialCertifications: validatedData.specialCertifications || [],
        eoInsuranceProvider: validatedData.eoInsuranceProvider,
        eoInsurancePolicy: validatedData.eoInsurancePolicy,
        eoInsuranceExpiry: eoInsuranceExpiry,
        baseAddress: validatedData.baseAddress,
        baseZip: validatedData.baseZip,
        serviceRadiusMiles: validatedData.serviceRadiusMiles || 25,
        availabilityNotes: validatedData.availabilityNotes,
        whyInterested: validatedData.whyInterested,
        references: validatedData.references,
        resumeUrl: validatedData.resumeUrl || null,
        status: NotaryApplicationStatus.PENDING,
      },
    })

    // Send notification emails
    try {
      const { sendApplicationConfirmationEmail, sendAdminApplicationNotification } = await import('@/lib/email/templates/notary-application')
      
      await Promise.all([
        sendApplicationConfirmationEmail({
          firstName: application.firstName,
          lastName: application.lastName,
          email: application.email,
          applicationId: application.id,
        }),
        sendAdminApplicationNotification({
          applicationId: application.id,
          applicantName: `${application.firstName} ${application.lastName}`,
          applicantEmail: application.email,
          applicantPhone: application.phone,
          statesLicensed: application.statesLicensed,
          serviceTypes: application.serviceTypes,
        }),
      ])
    } catch (error) {
      logger.error('Failed to send application notification emails', { error })
      // Don't fail the request if email fails
    }

    logger.info('Notary application submitted', {
      applicationId: application.id,
      email: application.email,
    })

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      applicationId: application.id,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid form data', 
          message: 'Please check your form inputs and try again.',
          details: error.errors 
        },
        { status: 400 }
      )
    }

    // Handle Prisma errors with detailed logging
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      const prismaError = error as Prisma.PrismaClientKnownRequestError
      
      // Log detailed error information for debugging
      logger.error('Prisma error submitting notary application', {
        code: prismaError.code,
        meta: prismaError.meta,
        message: prismaError.message,
        // Don't log full stack in production to avoid exposing internals
        stack: process.env.NODE_ENV === 'development' ? prismaError.stack : undefined,
      })

      // Handle specific Prisma error codes
      if (prismaError.code === 'P2002') {
        // Unique constraint violation (duplicate email)
        return NextResponse.json(
          { 
            error: 'An application with this email already exists',
            message: 'An application with this email address has already been submitted. Please use a different email or contact us if you need to update your application.',
          },
          { status: 409 }
        )
      }

      if (prismaError.code === 'P2025') {
        // Record not found
        return NextResponse.json(
          { 
            error: 'Record not found',
            message: 'The requested record was not found.',
          },
          { status: 404 }
        )
      }

      // Check for schema-related errors (missing table/enum)
      const errorMessage = getErrorMessage(error).toLowerCase()
      if (
        errorMessage.includes('does not exist') ||
        errorMessage.includes('relation') ||
        errorMessage.includes('enum') ||
        errorMessage.includes('type') ||
        prismaError.code === 'P1001' || // Connection error
        prismaError.code === 'P1003' || // Database does not exist
        prismaError.code === 'P2021'    // Table does not exist
      ) {
        logger.error('Database schema error detected - migration may be needed', {
          code: prismaError.code,
          message: prismaError.message,
          hint: 'The NotaryApplication table or related enums may not exist in the database. Run migrations.',
        })
        
        return NextResponse.json(
          { 
            error: 'Database configuration error',
            message: 'The application service is temporarily unavailable. Please try again later or contact support.',
          },
          { status: 503 }
        )
      }

      // Generic Prisma error
      return NextResponse.json(
        { 
          error: 'Database operation failed',
          message: 'Failed to submit application due to a database error. Please try again later.',
        },
        { status: 500 }
      )
    }

    // Handle Prisma validation errors
    if (error instanceof Prisma.PrismaClientValidationError) {
      logger.error('Prisma validation error submitting notary application', {
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      })
      
      return NextResponse.json(
        { 
          error: 'Invalid data provided',
          message: 'The application data is invalid. Please check your inputs and try again.',
        },
        { status: 400 }
      )
    }

    // Handle other errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    
    logger.error('Error submitting notary application', {
      error: errorMessage,
      stack: process.env.NODE_ENV === 'development' ? errorStack : undefined,
      errorType: error instanceof Error ? error.constructor.name : typeof error,
    })

    return NextResponse.json(
      { 
        error: 'Failed to submit application. Please try again.',
        message: 'An unexpected error occurred while submitting your application. Please try again later or contact support if the problem persists.',
      },
      { status: 500 }
    )
  }
}

