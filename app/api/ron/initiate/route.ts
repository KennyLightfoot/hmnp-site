/**
 * RON Session Initiation API
 * 
 * Creates a new BlueNotary RON session and returns the session details.
 */
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { RONService } from '@/lib/ron/bluenotary';
import { z } from 'zod';

// Validation schema for request
const CreateRONSessionSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required'),
  customerEmail: z.string().email('Valid email is required'),
  customerPhone: z.string().optional(),
  documentTypes: z.array(z.string()).optional(),
  scheduledDateTime: z.string().optional(),
  callbackUrl: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    
    const validationResult = CreateRONSessionSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validationResult.error.errors },
        { status: 400 }
      );
    }
    
    const { 
      customerName, 
      customerEmail, 
      customerPhone, 
      documentTypes, 
      scheduledDateTime 
    } = validationResult.data;
    
    // Parse scheduledDateTime if provided
    let parsedDateTime: Date | undefined;
    if (scheduledDateTime) {
      try {
        parsedDateTime = new Date(scheduledDateTime);
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid scheduledDateTime format' },
          { status: 400 }
        );
      }
    }
    
    // Check if RON is available
    if (!RONService.isRONAvailable()) {
      logger.error('RON service is not available');
      return NextResponse.json(
        { error: 'RON service is not available' },
        { status: 503 }
      );
    }
    
    // Create RON session
    const session = await RONService.createRONSession({
      id: `ron_${Date.now()}`,
      customerName,
      customerEmail,
      customerPhone,
      documentTypes,
      scheduledDateTime: parsedDateTime,
    });
    
    if (!session) {
      logger.error('Failed to create RON session', {
        customerEmail,
        customerName,
      });
      
      return NextResponse.json(
        { error: 'Failed to create RON session' },
        { status: 500 }
      );
    }
    
    // Return session details
    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        status: session.status,
        sessionUrl: session.sessionUrl,
        expiresAt: session.expiresAt,
      },
    });
  } catch (error) {
    logger.error('Error creating RON session', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}