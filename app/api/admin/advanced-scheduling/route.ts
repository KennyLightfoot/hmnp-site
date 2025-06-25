/**
 * Advanced AI Scheduling API Endpoint
 * Houston Mobile Notary Pros - Phase 5-B Implementation
 */

import { NextRequest, NextResponse } from 'next/server';
import { aiSchedulingOptimizer } from '@/lib/scheduling/ai-optimization';

// Simple logger for now
const logger = {
  error: (message: string, error?: any) => {
    console.error(message, error);
  }
};

export async function POST(request: NextRequest) {
  try {
    // Simple auth check - in production would use proper session management
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.includes('admin')) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'optimize_schedule':
        return await handleOptimizeSchedule(data);
      
      case 'optimize_routes':
        return await handleOptimizeRoutes(data);
      
      case 'balance_load':
        return await handleBalanceLoad(data);
      
      case 'predict_schedule':
        return await handlePredictSchedule(data);
      
      case 'learn_preferences':
        return await handleLearnPreferences(data);
      
      default:
        return NextResponse.json(
          { error: 'Invalid action specified' },
          { status: 400 }
        );
    }

  } catch (error) {
    logger.error('Advanced scheduling API error', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleOptimizeSchedule(data: any) {
  try {
    const result = await aiSchedulingOptimizer.optimizeSchedule(data);
    
    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    logger.error('Schedule optimization failed', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Schedule optimization failed' },
      { status: 500 }
    );
  }
}

async function handleOptimizeRoutes(data: any) {
  try {
    const { appointments, notaryId } = data;
    const result = await aiSchedulingOptimizer.optimizeRoutes(appointments, notaryId);
    
    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    logger.error('Route optimization failed', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Route optimization failed' },
      { status: 500 }
    );
  }
}

async function handleBalanceLoad(data: any) {
  try {
    const { bookingRequests, availableNotaries } = data;
    const result = await aiSchedulingOptimizer.balanceLoadAcrossNotaries(
      bookingRequests,
      availableNotaries
    );
    
    return NextResponse.json({
      success: true,
      data: Array.from(result.entries()).map(([notaryId, requests]) => ({
        notaryId,
        requests
      }))
    });

  } catch (error) {
    logger.error('Load balancing failed', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Load balancing failed' },
      { status: 500 }
    );
  }
}

async function handlePredictSchedule(data: any) {
  try {
    const { timeRange } = data;
    const result = await aiSchedulingOptimizer.predictOptimalSchedule(timeRange);
    
    return NextResponse.json({
      success: true,
      data: {
        ...result,
        optimalPricing: Array.from(result.optimalPricing.entries()).map(([service, price]) => ({
          service,
          price
        }))
      }
    });

  } catch (error) {
    logger.error('Schedule prediction failed', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Schedule prediction failed' },
      { status: 500 }
    );
  }
}

async function handleLearnPreferences(data: any) {
  try {
    const { customerId } = data;
    const result = await aiSchedulingOptimizer.learnCustomerPreferences(customerId);
    
    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    logger.error('Preference learning failed', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Preference learning failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Simple auth check
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.includes('admin')) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'status':
        return NextResponse.json({
          success: true,
          data: {
            status: 'active',
            features: [
              'ai_optimization',
              'route_optimization', 
              'load_balancing',
              'predictive_scheduling',
              'preference_learning'
            ],
            version: '1.0.0'
          }
        });
      
      default:
        return NextResponse.json(
          { error: 'Invalid action specified' },
          { status: 400 }
        );
    }

  } catch (error) {
    logger.error('Advanced scheduling API GET error', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 