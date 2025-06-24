import { PrismaClient, ServiceType, DiscountType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  // Create services using upsert (create if not exists, update if exists)
  console.log('📱 Seeding Mobile Services...');
  const mobileServices = [
    {
      id: 'cmb8ovso10000ve9xwvtf0my0',
      name: 'Standard Mobile Notary',
      serviceType: ServiceType.STANDARD_NOTARY,
      price: 75.00,
      depositAmount: 25.00,
      requiresDeposit: true,
      active: true,
      description: 'General notary services at your location. Includes travel within a 20-mile radius, printing, and scanning for standard documents.',
      duration: 90,
      updatedAt: new Date(),
    },
    {
      id: 'cmb8p8ww20003veixccludati',
      name: 'Priority Mobile Notary (Rush)',
      serviceType: ServiceType.STANDARD_NOTARY,
      price: 100.00,
      depositAmount: 25.00,
      requiresDeposit: true,
      active: true,
      description: 'Expedited mobile notary services for urgent needs. Higher priority scheduling.',
      duration: 90,
      updatedAt: new Date(),
    },
    {
      id: 'cmb8ovsxo0001ve9xi40rj4g5',
      name: 'Loan Signing Specialist',
      serviceType: ServiceType.LOAN_SIGNING_SPECIALIST,
      price: 150.00,
      depositAmount: 25.00,
      requiresDeposit: true,
      active: true,
      description: 'Specialized handling and notarization of real estate loan documents. Price starts at $150. Additional fees may apply for complex signings or extensive document packages.',
      duration: 180,
      updatedAt: new Date(),
    },
    {
      id: 'cmb8ovt3d0002ve9xks32rktv',
      name: 'Extended Hours Notary',
      serviceType: ServiceType.EXTENDED_HOURS_NOTARY,
      price: 100.00,
      depositAmount: 25.00,
      requiresDeposit: true,
      active: true,
      description: 'After-hours notary services for your convenience. Available evenings and weekends.',
      duration: 90,
      updatedAt: new Date(),
    },
    {
      id: 'cmb8p8wzg0005veixjjwvis8d',
      name: 'Corporate Document Notarization',
      serviceType: ServiceType.BUSINESS_SOLUTIONS,
      price: 125.00,
      depositAmount: 25.00,
      requiresDeposit: true,
      active: false, // Deactivated
      description: 'Professional notarization services for corporate documents and business agreements.',
      duration: 120,
      updatedAt: new Date(),
    },
    {
      id: 'cmb8p8wy70004veixh5vs1z5n',
      name: 'I-9 Employment Verification',
      serviceType: ServiceType.SPECIALTY_NOTARY_SERVICE,
      price: 50.00,
      depositAmount: 25.00,
      requiresDeposit: true,
      active: false, // Deactivated
      description: 'I-9 employment verification services for HR departments.',
      duration: 60,
      updatedAt: new Date(),
    },
  ];

  // RON Services - Texas Compliant Pricing (Gov't Code §406.111 & §406.024)
  console.log('🌐 Seeding RON Services (Texas Compliant)...');
  const ronServices = [
    {
      id: 'ron_standard_001',
      name: 'RON Standard Acknowledgment',
      serviceType: ServiceType.STANDARD_NOTARY,
      price: 35.00, // $25 RON fee + $10 acknowledgment (1 signer)
      depositAmount: 0.00,
      requiresDeposit: false,
      active: true,
      description: 'Texas-compliant Remote Online Notarization for acknowledgments. $25 RON service fee + $10 acknowledgment fee per TX Gov\'t Code §406.111 & §406.024. Additional signers: +$1 each.',
      duration: 45,
      updatedAt: new Date(),
    },
    {
      id: 'ron_oath_002',
      name: 'RON Oath/Affirmation',
      serviceType: ServiceType.STANDARD_NOTARY,
      price: 35.00, // $25 RON fee + $10 oath
      depositAmount: 0.00,
      requiresDeposit: false,
      active: true,
      description: 'Texas-compliant Remote Online Notarization for oaths and affirmations. $25 RON service fee + $10 oath fee per TX Gov\'t Code §406.111 & §406.024.',
      duration: 30,
      updatedAt: new Date(),
    },
    {
      id: 'ron_loan_003',
      name: 'RON Loan Document Package',
      serviceType: ServiceType.LOAN_SIGNING_SPECIALIST,  
      price: 35.00, // Base Texas-compliant rate for single notarization
      depositAmount: 0.00,
      requiresDeposit: false,
      active: true,
      description: 'Texas-compliant Remote Online Notarization for loan documents. Pricing: $25 RON fee per notarized document + applicable notarial act fees. Multiple documents may require separate notarizations.',
      duration: 120,
      updatedAt: new Date(),
    },
    {
      id: 'ron_business_004',
      name: 'RON Business Documents',
      serviceType: ServiceType.BUSINESS_SOLUTIONS,
      price: 35.00, // Base Texas-compliant rate
      depositAmount: 0.00,
      requiresDeposit: false,
      active: true,
      description: 'Texas-compliant Remote Online Notarization for business documents. $25 RON service fee + applicable notarial act fees per TX Gov\'t Code §406.111 & §406.024.',
      duration: 60,
      updatedAt: new Date(),
    },
  ];

  // Combine all services
  const services = [...mobileServices, ...ronServices];

  for (const service of services) {
    await prisma.service.upsert({
      where: { id: service.id },
      update: {
        name: service.name,
        serviceType: service.serviceType,
        price: service.price,
        depositAmount: service.depositAmount,
        requiresDeposit: service.requiresDeposit,
        active: service.active,
        description: service.description,
        duration: service.duration,
        updatedAt: new Date(),
      },
      create: service,
    });
    console.log(`Upserted service: ${service.name} (ID: ${service.id})`);
  }

  // Seed Business Settings
  console.log('⚙️  Seeding Business Settings...');
  const businessSettings = [
    {
      id: 'bs_service_radius',
      key: 'SERVICE_RADIUS_MILES',
      value: '25',
      dataType: 'number',
      description: 'Maximum service radius for mobile notary services',
      category: 'service_area',
      updatedAt: new Date(),
    },
    {
      id: 'bs_ron_enabled',
      key: 'RON_SERVICES_ENABLED',
      value: 'true',
      dataType: 'boolean',
      description: 'Enable Remote Online Notarization services',
      category: 'features',
      updatedAt: new Date(),
    },
    {
      id: 'bs_base_travel_fee',
      key: 'BASE_TRAVEL_FEE',
      value: '15.00',
      dataType: 'decimal',
      description: 'Base travel fee for mobile services',
      category: 'pricing',
      updatedAt: new Date(),
    },
  ];

  for (const setting of businessSettings) {
    await prisma.businessSettings.upsert({
      where: { id: setting.id },
      update: {
        key: setting.key,
        value: setting.value,
        dataType: setting.dataType,
        description: setting.description,
        category: setting.category,
        updatedAt: new Date(),
      },
      create: setting,
    });
    console.log(`Upserted business setting: ${setting.key}`);
  }

  // Seed Promo Codes
  console.log('🎫 Seeding Promo Codes...');
  const promoCodes = [
    {
      id: 'promo_ron_launch',
      code: 'RONLAUNCH',
      description: 'RON service launch discount',
      discountType: DiscountType.FIXED_AMOUNT,
      discountValue: 20.00,
      minimumAmount: 75.00,
      maxDiscountAmount: 20.00,
      usageLimit: 50,
      usageCount: 0,
      perCustomerLimit: 1,
      validFrom: new Date(),
      validUntil: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      active: true,
      applicableServices: ['ron_standard_001', 'ron_loan_002', 'ron_business_003'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  for (const promo of promoCodes) {
    await prisma.promoCode.upsert({
      where: { id: promo.id },
      update: {
        code: promo.code,
        description: promo.description,
        discountType: promo.discountType as DiscountType,
        discountValue: promo.discountValue,
        minimumAmount: promo.minimumAmount,
        maxDiscountAmount: promo.maxDiscountAmount,
        usageLimit: promo.usageLimit,
        usageCount: promo.usageCount,
        perCustomerLimit: promo.perCustomerLimit,
        validFrom: promo.validFrom,
        validUntil: promo.validUntil,
        active: promo.active,
        applicableServices: promo.applicableServices,
        updatedAt: new Date(),
      },
      create: promo,
    });
    console.log(`Upserted promo code: ${promo.code}`);
  }

  console.log(`🎉 Comprehensive seeding finished!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
