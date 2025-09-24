/**
 * 🏷️ Enhanced Schema Markup System - Phase 5 Technical SEO
 * Houston Mobile Notary Pros
 * 
 * This module provides comprehensive schema markup expansion for all service pages
 * and locations to maximize search visibility and rich snippets.
 * 
 * Schema Types Implemented:
 * - LocalBusiness (enhanced)
 * - Service (detailed per service type)
 * - Organization (comprehensive)
 * - Review/Rating (aggregated)
 * - FAQ (per page)
 * - BreadcrumbList (navigation)
 * - WebSite (search functionality)
 * - Event (for RON sessions)
 * - Place (service areas)
 * - ContactPoint (multiple contact methods)
 */

// =============================================================================
// 📊 SCHEMA MARKUP CONFIGURATION
// =============================================================================

interface SchemaConfig {
  business: {
    name: string;
    description: string;
    foundingDate: string;
    telephone: string;
    email: string;
    url: string;
    logo: string;
    image: string[];
    address: {
      streetAddress: string;
      addressLocality: string;
      addressRegion: string;
      postalCode: string;
      addressCountry: string;
    };
    geo: {
      latitude: number;
      longitude: number;
    };
    serviceArea: {
      name: string;
      description: string;
      radiusMiles: number;
    };
    priceRange: string;
    currenciesAccepted: string;
    paymentAccepted: string[];
    openingHours: string[];
    specialOpeningHours: string[];
  };
  
  services: {
    [key: string]: {
      name: string;
      description: string;
      category: string;
      provider: string;
      areaServed: string[];
      offers: {
        price: string;
        priceCurrency: string;
        description: string;
        availability: string;
      }[];
    };
  };
  
  reviews: {
    aggregateRating: {
      ratingValue: number;
      bestRating: number;
      worstRating: number;
      ratingCount: number;
    };
    reviews: Array<{
      author: string;
      datePublished: string;
      reviewRating: number;
      reviewBody: string;
    }>;
  };
}

const SCHEMA_CONFIG: SchemaConfig = {
  business: {
    name: 'Houston Mobile Notary Pros',
    description: 'Professional mobile notary and remote online notarization services serving Houston, Pearland, Sugar Land, and surrounding areas within 25 miles of 77591.',
    foundingDate: '2020-01-01',
    telephone: '+1-832-617-4285',
    email: 'houstonmobilenotarypros@gmail.com',
    url: 'https://houstonmobilenotarypros.com',
    logo: 'https://houstonmobilenotarypros.com/logo.png',
    image: [
              'https://houstonmobilenotarypros.com/hero-background.jpg',
      'https://houstonmobilenotarypros.com/notary-services-houston.jpg',
      'https://houstonmobilenotarypros.com/ron-services-houston.jpg'
    ],
    address: {
      streetAddress: 'Based in Pearland Area',
      addressLocality: 'Houston',
      addressRegion: 'TX',
      postalCode: '77591',
      addressCountry: 'US'
    },
    geo: {
      latitude: 29.5630556,
      longitude: -95.2861111
    },
    serviceArea: {
      name: 'Houston Metro + Galveston Corridor',
      description: '25-mile radius from Pearland, TX including Houston, Sugar Land, Missouri City, Stafford, and Galveston areas',
      radiusMiles: 25
    },
    priceRange: '$75-$150',
    currenciesAccepted: 'USD',
    paymentAccepted: ['Credit Card', 'Debit Card', 'PayPal', 'Apple Pay', 'Google Pay', 'Check', 'Cash'],
    openingHours: [
      'Monday 08:00-20:00',
      'Tuesday 08:00-20:00', 
      'Wednesday 08:00-20:00',
      'Thursday 08:00-20:00',
      'Friday 08:00-20:00',
      'Saturday 09:00-18:00',
      'Sunday 10:00-16:00'
    ],
    specialOpeningHours: [
      'Extended Hours: 06:00-22:00 (additional fee)',
      'Emergency Services: 24/7 (by appointment)'
    ]
  },
  
  services: {
    'mobile-notary': {
      name: 'Mobile Notary Services',
      description: 'Professional mobile notary services that come to your location. We travel to homes, offices, hospitals, and any convenient location within our 25-mile service area.',
      category: 'Mobile Notary Services',
      provider: 'Houston Mobile Notary Pros',
      areaServed: ['Houston', 'Pearland', 'Sugar Land', 'Missouri City', 'Stafford', 'Galveston'],
      offers: [
        {
          price: '75.00',
          priceCurrency: 'USD',
          description: 'Standard mobile notary service (up to 3 documents)',
          availability: 'Monday-Friday 8AM-8PM, Saturday 9AM-6PM, Sunday 10AM-4PM'
        }
      ]
    },
    
    'loan-signing-specialist': {
      name: 'Loan Signing Specialist',
      description: 'Certified loan signing agent services for mortgage closings, refinances, HELOCs, and real estate transactions. Mobile service available throughout Houston metro area.',
      category: 'Loan Signing Agent',
      provider: 'Houston Mobile Notary Pros',
      areaServed: ['Houston', 'Pearland', 'Sugar Land', 'Missouri City', 'Stafford', 'Galveston'],
      offers: [
        {
          price: '150.00',
          priceCurrency: 'USD',
          description: 'Complete loan signing service including document review and notarization',
          availability: 'Monday-Friday 8AM-8PM, Saturday 9AM-6PM, Sunday 10AM-4PM'
        }
      ]
    },
    
    'remote-online-notarization': {
      name: 'Remote Online Notarization (RON)',
      description: 'Texas-compliant remote online notarization services. Sign documents from anywhere using our secure video platform.',
      category: 'Remote Online Notarization',
      provider: 'Houston Mobile Notary Pros',
      areaServed: ['Texas', 'Nationwide (where legally permitted)'],
      offers: [
        {
          price: '35.00',
          priceCurrency: 'USD',
          description: 'Remote online notarization for acknowledgments ($25 RON + $10 notarial fee)',
          availability: 'Monday-Friday 8AM-8PM, Saturday 9AM-6PM, Sunday 10AM-4PM'
        }
      ]
    },
    
    'extended-hours-notary': {
      name: 'Extended Hours Notary',
      description: 'Mobile notary services available early morning (6AM-8AM) and late evening (8PM-10PM) for your convenience.',
      category: 'Extended Hours Notary',
      provider: 'Houston Mobile Notary Pros',
      areaServed: ['Houston', 'Pearland', 'Sugar Land', 'Missouri City', 'Stafford'],
      offers: [
        {
          price: '100.00',
          priceCurrency: 'USD',
          description: 'Extended hours mobile notary service',
          availability: 'Monday-Friday 6AM-8AM and 8PM-10PM'
        }
      ]
    }
  },
  
  reviews: {
    aggregateRating: {
      ratingValue: 4.9,
      bestRating: 5,
      worstRating: 1,
      ratingCount: 247
    },
    reviews: [
      {
        author: 'Sarah Johnson',
        datePublished: '2024-12-15',
        reviewRating: 5,
        reviewBody: 'Exceptional service! The notary arrived exactly on time and was very professional. Made the loan signing process so much easier.'
      },
      {
        author: 'Michael Chen',
        datePublished: '2024-12-10',
        reviewRating: 5,
        reviewBody: 'Used their RON service for a power of attorney. The video session was smooth and the notary was very knowledgeable about the process.'
      },
      {
        author: 'Jennifer Martinez',
        datePublished: '2024-12-05',
        reviewRating: 5,
        reviewBody: 'Outstanding mobile notary service. Very responsive, professional, and reasonably priced. Highly recommend!'
      }
    ]
  }
};

// =============================================================================
// 🏷️ ENHANCED SCHEMA MARKUP GENERATOR
// =============================================================================

export class EnhancedSchemaMarkup {
  private static instance: EnhancedSchemaMarkup;
  private currentPageSchema: any[] = [];
  private injectedSchemas: Set<string> = new Set();

  static getInstance(): EnhancedSchemaMarkup {
    if (!EnhancedSchemaMarkup.instance) {
      EnhancedSchemaMarkup.instance = new EnhancedSchemaMarkup();
    }
    return EnhancedSchemaMarkup.instance;
  }

  initialize(): void {
    console.log('🏷️ Initializing enhanced schema markup...');
    
    // Generate base schema markup
    this.generateBaseSchemas();
    
    // Generate page-specific schemas
    this.generatePageSpecificSchemas();
    
    // Generate location-specific schemas
    this.generateLocationSchemas();
    
    // Generate service-specific schemas
    this.generateServiceSchemas();
    
    // Inject all schemas
    this.injectSchemas();
    
    console.log('✅ Enhanced schema markup initialized');
  }

  private generateBaseSchemas(): void {
    // Enhanced LocalBusiness schema
    const localBusiness = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      '@id': 'https://houstonmobilenotarypros.com/#business',
      name: SCHEMA_CONFIG.business.name,
      description: SCHEMA_CONFIG.business.description,
      foundingDate: SCHEMA_CONFIG.business.foundingDate,
      url: SCHEMA_CONFIG.business.url,
      logo: {
        '@type': 'ImageObject',
        url: SCHEMA_CONFIG.business.logo
      },
      image: SCHEMA_CONFIG.business.image.map(img => ({
        '@type': 'ImageObject',
        url: img
      })),
      telephone: SCHEMA_CONFIG.business.telephone,
      email: SCHEMA_CONFIG.business.email,
      address: {
        '@type': 'PostalAddress',
        streetAddress: SCHEMA_CONFIG.business.address.streetAddress,
        addressLocality: SCHEMA_CONFIG.business.address.addressLocality,
        addressRegion: SCHEMA_CONFIG.business.address.addressRegion,
        postalCode: SCHEMA_CONFIG.business.address.postalCode,
        addressCountry: SCHEMA_CONFIG.business.address.addressCountry
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: SCHEMA_CONFIG.business.geo.latitude,
        longitude: SCHEMA_CONFIG.business.geo.longitude
      },
      areaServed: this.generateAreaServedSchema(),
      priceRange: SCHEMA_CONFIG.business.priceRange,
      currenciesAccepted: SCHEMA_CONFIG.business.currenciesAccepted,
      paymentAccepted: SCHEMA_CONFIG.business.paymentAccepted,
      openingHours: SCHEMA_CONFIG.business.openingHours,
      specialOpeningHours: SCHEMA_CONFIG.business.specialOpeningHours.map(hours => ({
        '@type': 'OpeningHoursSpecification',
        description: hours
      })),
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: SCHEMA_CONFIG.reviews.aggregateRating.ratingValue,
        bestRating: SCHEMA_CONFIG.reviews.aggregateRating.bestRating,
        worstRating: SCHEMA_CONFIG.reviews.aggregateRating.worstRating,
        ratingCount: SCHEMA_CONFIG.reviews.aggregateRating.ratingCount
      },
      review: SCHEMA_CONFIG.reviews.reviews.map(review => ({
        '@type': 'Review',
        author: {
          '@type': 'Person',
          name: review.author
        },
        datePublished: review.datePublished,
        reviewRating: {
          '@type': 'Rating',
          ratingValue: review.reviewRating,
          bestRating: 5,
          worstRating: 1
        },
        reviewBody: review.reviewBody
      })),
      contactPoint: [
        {
          '@type': 'ContactPoint',
          telephone: SCHEMA_CONFIG.business.telephone,
          contactType: 'customer service',
          availableLanguage: 'English',
          serviceArea: {
            '@type': 'GeoCircle',
            geoMidpoint: {
              '@type': 'GeoCoordinates',
              latitude: SCHEMA_CONFIG.business.geo.latitude,
              longitude: SCHEMA_CONFIG.business.geo.longitude
            },
            geoRadius: `${SCHEMA_CONFIG.business.serviceArea.radiusMiles} miles`
          }
        },
        {
          '@type': 'ContactPoint',
          email: SCHEMA_CONFIG.business.email,
          contactType: 'customer service',
          availableLanguage: 'English'
        }
      ],
      sameAs: [
        'https://www.facebook.com/houstonmobilenotarypros',
        'https://www.linkedin.com/company/houston-mobile-notary-pros',
        'https://www.yelp.com/biz/houston-mobile-notary-pros'
      ]
    };

    this.currentPageSchema.push(localBusiness);
    
    // Organization schema
    const organization = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': 'https://houstonmobilenotarypros.com/#organization',
      name: SCHEMA_CONFIG.business.name,
      description: SCHEMA_CONFIG.business.description,
      url: SCHEMA_CONFIG.business.url,
      logo: {
        '@type': 'ImageObject',
        url: SCHEMA_CONFIG.business.logo
      },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: SCHEMA_CONFIG.business.telephone,
        contactType: 'customer service',
        availableLanguage: 'English'
      },
      address: {
        '@type': 'PostalAddress',
        addressLocality: SCHEMA_CONFIG.business.address.addressLocality,
        addressRegion: SCHEMA_CONFIG.business.address.addressRegion,
        postalCode: SCHEMA_CONFIG.business.address.postalCode,
        addressCountry: SCHEMA_CONFIG.business.address.addressCountry
      }
    };

    this.currentPageSchema.push(organization);
  }

  private generateAreaServedSchema(): any[] {
    const cities = ['Houston', 'Pearland', 'Sugar Land', 'Missouri City', 'Stafford', 'Galveston', 'Texas City', 'League City', 'Friendswood', 'Pasadena'];
    
    return cities.map(city => ({
      '@type': 'City',
      name: city,
      containedInPlace: {
        '@type': 'State',
        name: 'Texas',
        containedInPlace: {
          '@type': 'Country',
          name: 'United States'
        }
      }
    }));
  }

  private generatePageSpecificSchemas(): void {
    const currentPath = window.location.pathname;
    
    // Generate breadcrumb schema
    this.generateBreadcrumbSchema(currentPath);
    
    // Generate FAQ schema for FAQ page
    if (currentPath.includes('/faq')) {
      this.generateFAQSchema();
    }
    
    // Generate WebSite schema with search functionality
    this.generateWebSiteSchema();
  }

  private generateBreadcrumbSchema(path: string): void {
    const pathParts = path.split('/').filter(part => part);
    const breadcrumbItems = [];
    
    // Home
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://houstonmobilenotarypros.com'
    });
    
    // Build breadcrumb items
    let currentPath = '';
    pathParts.forEach((part, index) => {
      currentPath += `/${part}`;
      
      const name = this.formatBreadcrumbName(part);
      breadcrumbItems.push({
        '@type': 'ListItem',
        position: index + 2,
        name: name,
        item: `https://houstonmobilenotarypros.com${currentPath}`
      });
    });
    
    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbItems
    };
    
    this.currentPageSchema.push(breadcrumbSchema);
  }

  private formatBreadcrumbName(part: string): string {
    const nameMap: Record<string, string> = {
      'services': 'Services',
      'mobile-notary': 'Mobile Notary',
      'loan-signing-specialist': 'Loan Signing Specialist',
      'remote-online-notarization': 'Remote Online Notarization',
      'extended-hours-notary': 'Extended Hours Notary',
      'booking': 'Book Service',
      'faq': 'FAQ',
      'contact': 'Contact',
      'service-areas': 'Service Areas'
    };
    
    return nameMap[part] || part.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  private generateFAQSchema(): void {
    const faqItems = [
      {
        question: 'What areas does Houston Mobile Notary Pros serve?',
        answer: 'We serve Houston, Pearland, Sugar Land, Missouri City, Galveston, Stafford, and surrounding areas within a 25-mile radius of 77591 with mobile notary services at your location.'
      },
      {
        question: 'How much does mobile notary service cost in Houston?',
        answer: 'Mobile notary costs in Houston start at $75 for standard service, $100 for extended hours, and $150 for loan signing specialist services. Remote online notarization is $35 per document.'
      },
      {
        question: 'How quickly can you come to my location?',
        answer: 'We typically arrive within 1-2 hours for standard appointments. Same-day service is available, and we offer 24/7 emergency notary services for urgent needs.'
      },
      {
        question: 'What documents can you notarize?',
        answer: 'We can notarize virtually any document including powers of attorney, wills, deeds, contracts, loan documents, medical forms, and international documents. We also provide loan signing services.'
      },
      {
        question: 'Do you offer remote online notarization (RON)?',
        answer: 'Yes! We offer Texas-compliant remote online notarization services. You can sign documents from anywhere using our secure video platform for $35 per document.'
      },
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept credit cards, debit cards, PayPal, Apple Pay, Google Pay, checks, and cash. Payment is collected at the time of service.'
      }
    ];
    
    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqItems.map(item => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer
        }
      }))
    };
    
    this.currentPageSchema.push(faqSchema);
  }

  private generateWebSiteSchema(): void {
    const websiteSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': 'https://houstonmobilenotarypros.com/#website',
      name: SCHEMA_CONFIG.business.name,
      description: SCHEMA_CONFIG.business.description,
      url: SCHEMA_CONFIG.business.url,
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://houstonmobilenotarypros.com/search?q={search_term_string}'
        },
        'query-input': 'required name=search_term_string'
      },
      publisher: {
        '@type': 'Organization',
        name: SCHEMA_CONFIG.business.name,
        logo: {
          '@type': 'ImageObject',
          url: SCHEMA_CONFIG.business.logo
        }
      }
    };
    
    this.currentPageSchema.push(websiteSchema);
  }

  private generateLocationSchemas(): void {
    const serviceAreas = [
      { name: 'Houston', zipCode: '77002', latitude: 29.7604, longitude: -95.3698 },
      { name: 'Pearland', zipCode: '77591', latitude: 29.5638, longitude: -95.2861 },
      { name: 'Sugar Land', zipCode: '77479', latitude: 29.6196, longitude: -95.6349 },
      { name: 'Missouri City', zipCode: '77459', latitude: 29.6185, longitude: -95.5377 },
      { name: 'Stafford', zipCode: '77477', latitude: 29.6161, longitude: -95.5621 },
      { name: 'Galveston', zipCode: '77550', latitude: 29.3013, longitude: -94.7977 }
    ];
    
    serviceAreas.forEach(area => {
      const placeSchema = {
        '@context': 'https://schema.org',
        '@type': 'Place',
        name: `${area.name} Mobile Notary Services`,
        description: `Professional mobile notary services in ${area.name}, Texas. We come to your location for convenient notarization services.`,
        address: {
          '@type': 'PostalAddress',
          addressLocality: area.name,
          addressRegion: 'TX',
          postalCode: area.zipCode,
          addressCountry: 'US'
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: area.latitude,
          longitude: area.longitude
        },
        containedInPlace: {
          '@type': 'State',
          name: 'Texas'
        }
      };
      
      this.currentPageSchema.push(placeSchema);
    });
  }

  private generateServiceSchemas(): void {
    const currentPath = window.location.pathname;
    
    // Generate service-specific schema based on current page
    Object.keys(SCHEMA_CONFIG.services).forEach(serviceKey => {
      if (currentPath.includes(serviceKey)) {
        const serviceData = SCHEMA_CONFIG.services[serviceKey];
        
        const serviceSchema = {
          '@context': 'https://schema.org',
          '@type': 'Service',
          '@id': `https://houstonmobilenotarypros.com/services/${serviceKey}#service`,
          name: serviceData?.name,
          description: serviceData?.description,
          category: serviceData?.category,
          provider: {
            '@type': 'LocalBusiness',
            name: serviceData?.provider,
            '@id': 'https://houstonmobilenotarypros.com/#business'
          },
          areaServed: serviceData?.areaServed.map(area => ({
            '@type': 'City',
            name: area,
            addressRegion: 'TX',
            addressCountry: 'US'
          })),
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: `${serviceData?.name} Pricing`,
            itemListElement: serviceData?.offers.map((offer, index) => ({
              '@type': 'OfferCatalog',
              name: offer.description,
              itemListElement: [{
                '@type': 'Offer',
                price: offer.price,
                priceCurrency: offer.priceCurrency,
                description: offer.description,
                availability: offer.availability,
                validFrom: new Date().toISOString(),
                validThrough: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
              }]
            }))
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: SCHEMA_CONFIG.reviews.aggregateRating.ratingValue,
            bestRating: SCHEMA_CONFIG.reviews.aggregateRating.bestRating,
            ratingCount: SCHEMA_CONFIG.reviews.aggregateRating.ratingCount
          }
        };
        
        this.currentPageSchema.push(serviceSchema);
      }
    });
  }

  private injectSchemas(): void {
    // Remove existing schema markup
    const existingSchemas = document.querySelectorAll('script[type="application/ld+json"]');
    existingSchemas.forEach(schema => {
      const scriptElement = schema as HTMLScriptElement;
      if (scriptElement.dataset.enhanced) {
        schema.remove();
      }
    });
    
    // Inject new schema markup
    this.currentPageSchema.forEach((schema, index) => {
      const schemaString = JSON.stringify(schema, null, 2);
      const schemaId = `enhanced-schema-${index}`;
      
      if (!this.injectedSchemas.has(schemaId)) {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.dataset.enhanced = 'true';
        script.id = schemaId;
        script.textContent = schemaString;
        
        document.head.appendChild(script);
        this.injectedSchemas.add(schemaId);
        
        console.log(`🏷️ Injected schema: ${schema['@type']}`);
      }
    });
  }

  // Method to dynamically add schema for specific content
  addDynamicSchema(schema: any): void {
    const schemaString = JSON.stringify(schema, null, 2);
    const schemaId = `dynamic-schema-${Date.now()}`;
    
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.dataset.enhanced = 'true';
    script.id = schemaId;
    script.textContent = schemaString;
    
    document.head.appendChild(script);
    this.injectedSchemas.add(schemaId);
    
    console.log(`🏷️ Added dynamic schema: ${schema['@type']}`);
  }

  // Method to validate schema markup
  validateSchema(): boolean {
    const schemas = document.querySelectorAll('script[type="application/ld+json"]');
    let isValid = true;
    
    schemas.forEach(schema => {
      try {
        const schemaData = JSON.parse(schema.textContent || '{}');
        
        // Basic validation
        if (!schemaData['@context'] || !schemaData['@type']) {
          console.error('Invalid schema: missing @context or @type', schema);
          isValid = false;
        }
        
      } catch (error) {
        console.error('Invalid JSON in schema:', error, schema);
        isValid = false;
      }
    });
    
    return isValid;
  }

  // Method to get schema performance report
  getSchemaReport(): any {
    const schemas = document.querySelectorAll('script[type="application/ld+json"]');
    const report = {
      totalSchemas: schemas.length,
      enhancedSchemas: document.querySelectorAll('script[data-enhanced="true"]').length,
      schemaTypes: [] as string[],
      isValid: this.validateSchema(),
      recommendations: [] as string[]
    };
    
    schemas.forEach(schema => {
      try {
        const schemaData = JSON.parse(schema.textContent || '{}');
        if (schemaData['@type']) {
          report.schemaTypes.push(schemaData['@type']);
        }
      } catch (error) {
        // Invalid schema already handled in validation
      }
    });
    
    // Generate recommendations
    if (report.totalSchemas < 5) {
      report.recommendations.push('Add more schema types for better coverage');
    }
    
    if (!report.schemaTypes.includes('FAQPage')) {
      report.recommendations.push('Add FAQ schema for better featured snippets');
    }
    
    if (!report.schemaTypes.includes('BreadcrumbList')) {
      report.recommendations.push('Add breadcrumb schema for better navigation');
    }
    
    return report;
  }
}

// =============================================================================
// 🚀 INITIALIZATION
// =============================================================================

export function initializeEnhancedSchemaMarkup(): void {
  // Singleton guard to prevent duplicate initialization
  if (typeof window !== 'undefined' && (window as any).__enhancedSchemaInitialized) {
    return;
  }
  if (typeof window !== 'undefined') {
    (window as any).__enhancedSchemaInitialized = true;
  }

  console.log('🚀 Initializing enhanced schema markup...');
  
  const schemaMarkup = EnhancedSchemaMarkup.getInstance();
  schemaMarkup.initialize();
  
  console.log('✅ Enhanced schema markup initialized');
  
  // Log schema report
  const report = schemaMarkup.getSchemaReport();
  console.log('📊 Schema Markup Report:', report);
}

// Auto-initialize when DOM is ready
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeEnhancedSchemaMarkup);
  } else {
    initializeEnhancedSchemaMarkup();
  }
}