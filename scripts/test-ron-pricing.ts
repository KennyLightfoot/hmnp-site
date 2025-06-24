import { calculateTexasCompliantRONPrice, validateRONPricing } from '../lib/pricing';

function testRONPricing() {
  console.log('🧪 Testing Texas RON Pricing Compliance...\n');

  // Test cases from Texas law documentation
  const testCases = [
    {
      name: '1 document, 1 signer, single acknowledgment',
      notarizations: 1,
      actType: 'acknowledgment' as const,
      signers: 1,
      expectedTotal: 35.00
    },
    {
      name: 'Same doc, 2 signers acknowledged together',
      notarizations: 1,
      actType: 'acknowledgment' as const,
      signers: 2,
      expectedTotal: 36.00
    },
    {
      name: '2 separate documents, 1 signer each',
      notarizations: 2,
      actType: 'acknowledgment' as const,
      signers: 1,
      expectedTotal: 70.00
    },
    {
      name: 'Single oath/affirmation taken remotely',
      notarizations: 1,
      actType: 'oath' as const,
      signers: 1,
      expectedTotal: 35.00
    }
  ];

  let allTestsPassed = true;

  for (const test of testCases) {
    console.log(`📋 Testing: ${test.name}`);
    
    // Calculate total for all notarizations
    let totalCalculated = 0;
    for (let i = 0; i < test.notarizations; i++) {
      const pricing = calculateTexasCompliantRONPrice(1, test.actType, test.signers);
      totalCalculated += pricing.totalFee;
    }

    const passed = Math.abs(totalCalculated - test.expectedTotal) < 0.01;
    allTestsPassed = allTestsPassed && passed;

    console.log(`   Expected: $${test.expectedTotal.toFixed(2)}`);
    console.log(`   Calculated: $${totalCalculated.toFixed(2)}`);
    console.log(`   Result: ${passed ? '✅ PASS' : '❌ FAIL'}\n`);

    if (passed) {
      // Show breakdown for successful tests
      const samplePricing = calculateTexasCompliantRONPrice(1, test.actType, test.signers);
      console.log('   Breakdown:');
      samplePricing.breakdown.forEach(item => {
        console.log(`     ${item}`);
      });
      
      if (test.notarizations > 1) {
        console.log(`     (× ${test.notarizations} notarizations)`);
      }
      console.log('');
    }
  }

  // Test compliance validation
  console.log('🔍 Testing Compliance Validation...\n');
  
  const validationTests = [
    {
      name: 'Valid RON pricing',
      ronFee: 25.00,
      notarialFee: 10.00,
      shouldPass: true
    },
    {
      name: 'RON fee exceeds limit',
      ronFee: 30.00,
      notarialFee: 10.00,
      shouldPass: false
    },
    {
      name: 'Notarial fee exceeds limit',
      ronFee: 25.00,
      notarialFee: 15.00,
      shouldPass: false
    }
  ];

  for (const test of validationTests) {
    console.log(`🔐 Testing: ${test.name}`);
    
    const validation = validateRONPricing(test.ronFee, test.notarialFee, 1, 1);
    const passed = validation.isCompliant === test.shouldPass;
    allTestsPassed = allTestsPassed && passed;

    console.log(`   Expected: ${test.shouldPass ? 'Compliant' : 'Non-compliant'}`);
    console.log(`   Result: ${validation.isCompliant ? 'Compliant' : 'Non-compliant'}`);
    console.log(`   Status: ${passed ? '✅ PASS' : '❌ FAIL'}`);
    
    if (!validation.isCompliant) {
      console.log('   Violations:');
      validation.violations.forEach(violation => {
        console.log(`     - ${violation}`);
      });
    }
    console.log('');
  }

  // Summary
  console.log('📊 Test Summary');
  console.log(`Overall Result: ${allTestsPassed ? '✅ All tests passed!' : '❌ Some tests failed!'}`);
  
  if (allTestsPassed) {
    console.log('\n🎉 Texas RON pricing implementation is fully compliant!');
    console.log('✅ All calculations match Texas legal requirements');
    console.log('✅ Validation functions work correctly');
    console.log('✅ Ready for production use');
  } else {
    console.log('\n⚠️ Issues found in pricing implementation');
    console.log('Please review and fix the failing tests before deployment');
  }

  return allTestsPassed;
}

// Run the tests
if (require.main === module) {
  const success = testRONPricing();
  process.exit(success ? 0 : 1);
}

export { testRONPricing }; 