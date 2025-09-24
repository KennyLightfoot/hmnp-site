export function getServiceValue(serviceType: string, numberOfSigners: number): number {
  switch (serviceType) {
    case 'quick-stamp-local':
      return 50 + (numberOfSigners > 1 ? (numberOfSigners - 1) * 10 : 0)
    case 'standard-notary':
      if (numberOfSigners === 1) return 75
      if (numberOfSigners === 2) return 80
      return 85
    case 'extended-hours-notary':
      return 100 + (numberOfSigners > 2 ? (numberOfSigners - 2) * 5 : 0)
    case 'loan-signing-specialist':
      return 150
    case 'ron-services':
      return 25
    case 'business-solutions':
      return 125
    case 'support-service':
      return 50
    default:
      return 75
  }
}


