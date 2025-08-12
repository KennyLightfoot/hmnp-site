import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit } from '@/lib/security/rate-limiting';
import { getErrorMessage } from '@/lib/utils/error-utils';
import { proofAPI, RONService } from '@/lib/proof/api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withRateLimit('public', 'debug_proof_connection')(async (request: NextRequest) => {
  try {
    // Test 1: Check if Proof API is enabled
    const isEnabled = proofAPI.isEnabled();
    console.log('🔍 Proof API enabled:', isEnabled);

    if (!isEnabled) {
      return NextResponse.json({
        success: false,
        error: 'Proof API not configured',
        details: 'PROOF_API_KEY environment variable is missing'
      });
    }

    // Test 2: Test API connection
    const connectionTest = await proofAPI.testConnection();
    console.log('🔍 Connection test:', connectionTest);

    // Test 3: Try creating a simple transaction with SIMPLIFIED payload format
    const testPayload = {
      signers: [{
        name: 'Test Customer',
        email: 'test@houstonmobilenotarypros.com',
        phone: '2815555555',
        role: 'signer' as const,
        authenticationMethod: 'id_verification' as const
      }],
      // SIMPLIFIED: No documents initially
      documents: [],
      title: 'Debug Test RON Session',
      description: 'Testing simplified Proof.com integration',
      metadata: {
        bookingId: 'debug-test-123',
        service: 'DEBUG_TEST'
      }
    };

    console.log('🔍 Testing SIMPLIFIED transaction creation with payload:', JSON.stringify(testPayload, null, 2));
    
    let transaction = null;
    let transactionError = null;
    
    try {
      transaction = await proofAPI.createTransaction(testPayload);
      console.log('✅ Transaction creation result:', transaction);
    } catch (error) {
      transactionError = error instanceof Error ? getErrorMessage(error) : String(error);
      console.error('❌ Transaction creation error:', transactionError);
    }

    // Test 4: Try RON Service method
    let ronSession = null;
    let ronError = null;
    
    try {
      ronSession = await RONService.createRONSession({
        id: 'debug-test-456',
        customerName: 'Debug Customer',
        customerEmail: 'debug@houstonmobilenotarypros.com',
        customerPhone: '2815555555',
        documentTypes: ['General Document'],
        scheduledDateTime: new Date()
      });
      console.log('✅ RON Service result:', ronSession);
    } catch (error) {
      ronError = error instanceof Error ? getErrorMessage(error) : String(error);
      console.error('❌ RON Service error:', ronError);
    }

    return NextResponse.json({
      success: true,
      tests: {
        isEnabled,
        connectionTest,
        transactionCreation: {
          success: !!transaction,
          transactionId: transaction?.id,
          sessionUrl: transaction?.sessionUrl,
          status: transaction?.status,
          error: transactionError
        },
        ronServiceTest: {
          success: !!ronSession,
          transactionId: ronSession?.id,
          sessionUrl: ronSession?.sessionUrl,
          status: ronSession?.status,
          error: ronError
        }
      },
      environment: {
        PROOF_API_KEY: process.env.PROOF_API_KEY ? 'Set' : 'Missing',
        PROOF_API_URL: process.env.PROOF_API_URL || 'https://api.proof.com',
        PROOF_ENVIRONMENT: process.env.PROOF_ENVIRONMENT || 'sandbox'
      }
    });

  } catch (error) {
    console.error('🚨 Debug test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? getErrorMessage(error) : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
})
