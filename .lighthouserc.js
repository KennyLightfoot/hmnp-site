module.exports = {
  ci: {
    collect: {
      numberOfRuns: 1,
      url: [
        process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000/',
        (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000') + '/booking',
        (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000') + '/notary/ron'
      ]
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.85 }],
        'uses-long-cache-ttl': 'warn',
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
}


