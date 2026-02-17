/**
 * GMB Profile Optimizer - Houston Mobile Notary Pros
 * Handles business verification, local keyword integration, and profile optimization
 */

import { LOCAL_SEO_ZIP_CODES } from '../local-seo-data';
import { generateLocationKeywords } from '../local-keyword-generator';

export interface GMBProfileData {
  businessName: string;
  description: string;
  categories: string[];
  serviceArea: {
    center: { lat: number; lng: number };
    radiusMiles: number;
    cities: string[];
  };
  services: GMBService[];
  attributes: GMBAttribute[];
  hours: GMBHours;
  photos: GMBPhotoCategory[];
  website: string;
  phone: string;
}

export interface GMBService {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  pricing?: {
    min: number;
    max: number;
    unit: string;
  };
}

export interface GMBAttribute {
  id: string;
  name: string;
  value: string | boolean;
}

export interface GMBHours {
  monday: { open: string; close: string } | null;
  tuesday: { open: string; close: string } | null;
  wednesday: { open: string; close: string } | null;
  thursday: { open: string; close: string } | null;
  friday: { open: string; close: string } | null;
  saturday: { open: string; close: string } | null;
  sunday: { open: string; close: string } | null;
}

export interface GMBPhotoCategory {
  category: 'LOGO' | 'COVER' | 'INTERIOR' | 'EXTERIOR' | 'PRODUCT' | 'TEAM' | 'AT_WORK' | 'FOOD_AND_DRINK' | 'MENU' | 'COMMON_AREA' | 'ROOMS';
  photos: string[];
  priority: number;
}

export class GMBProfileOptimizer {
  private baseLocation = { lat: 29.5633, lng: -95.2088 }; // Pearland, TX 77591
  private businessPhone = '832-617-4285';
  private businessWebsite = 'https://houstonmobilenotarypros.com';

  /**
   * Generate optimized GMB profile data
   */
  generateOptimizedProfile(): GMBProfileData {
    return {
      businessName: 'Houston Mobile Notary Pros',
      description: this.generateOptimizedDescription(),
      categories: this.getPrimaryCategories(),
      serviceArea: this.generateServiceArea(),
      services: this.generateServices(),
      attributes: this.generateAttributes(),
      hours: this.generateBusinessHours(),
      photos: this.generatePhotoCategories(),
      website: this.businessWebsite,
      phone: this.businessPhone,
    };
  }

  /**
   * Generate SEO-optimized business description
   */
  private generateOptimizedDescription(): string {
    const localKeywords = generateLocationKeywords('77591');
    const primaryKeywords = localKeywords.primary.slice(0, 10);
    
    return `Professional mobile notary services serving Houston, Pearland, Sugar Land, and surrounding areas within 25 miles. Licensed notary public providing convenient on-site notarization, loan signing services, and Remote Online Notarization (RON). Available 24/7 for emergency notary services including real estate closings, estate planning documents, and business transactions. Trusted by over 2,000 satisfied clients with same-day availability. Serving ${primaryKeywords.slice(0, 5).join(', ')} and more locations throughout the Greater Houston area.`;
  }

  /**
   * Get primary GMB categories
   */
  private getPrimaryCategories(): string[] {
    return [
      'Notary public',
      'Legal services',
      'Document preparation service',
      'Real estate service',
      'Loan agency',
      'Business service',
      'Mobile service',
      'Professional service'
    ];
  }

  /**
   * Generate service area configuration
   */
  private generateServiceArea() {
    const cities = LOCAL_SEO_ZIP_CODES.map(location => location.city);
    return {
      center: this.baseLocation,
      radiusMiles: 25,
      cities: [...new Set(cities)],
    };
  }

  /**
   * Generate optimized service listings
   */
  private generateServices(): GMBService[] {
    return [
      {
        id: 'mobile-notary',
        name: 'Mobile Notary Services',
        description: 'Professional notary services at your location. Documents notarized on-site for your convenience.',
        keywords: ['mobile notary', 'traveling notary', 'on-site notarization', 'notary services'],
        pricing: { min: 15, max: 25, unit: 'per signature' }
      },
      {
        id: 'loan-signing',
        name: 'Loan Signing Services',
        description: 'Certified loan signing agent for real estate transactions. Mortgage, refinance, and HELOC closings.',
        keywords: ['loan signing agent', 'mortgage signing', 'real estate closing', 'refinance documents'],
        pricing: { min: 100, max: 200, unit: 'per signing' }
      },
      {
        id: 'ron-services',
        name: 'Remote Online Notarization (RON)',
        description: 'Secure online notarization available 24/7. Video-based notarization for ultimate convenience.',
        keywords: ['remote online notarization', 'RON', 'online notary', 'video notarization'],
        pricing: { min: 35, max: 50, unit: 'per document' }
      },
      {
        id: 'estate-planning',
        name: 'Estate Planning Documents',
        description: 'Notarization of wills, trusts, power of attorney, and other estate planning documents.',
        keywords: ['estate planning', 'will notarization', 'power of attorney', 'trust documents'],
        pricing: { min: 15, max: 25, unit: 'per signature' }
      },
      {
        id: 'business-documents',
        name: 'Business Document Notarization',
        description: 'Corporate documents, contracts, and business agreements notarized professionally.',
        keywords: ['business notary', 'corporate documents', 'contract notarization', 'business agreements'],
        pricing: { min: 20, max: 30, unit: 'per document' }
      },
      {
        id: 'emergency-services',
        name: '24/7 Emergency Notary',
        description: 'Urgent notary services available around the clock for time-sensitive documents.',
        keywords: ['emergency notary', '24/7 notary', 'urgent notarization', 'after hours notary'],
        pricing: { min: 50, max: 100, unit: 'per visit' }
      }
    ];
  }

  /**
   * Generate business attributes
   */
  private generateAttributes(): GMBAttribute[] {
    return [
      { id: 'has_wheelchair_accessible_entrance', name: 'Wheelchair accessible entrance', value: true },
      { id: 'has_wheelchair_accessible_parking', name: 'Wheelchair accessible parking', value: true },
      { id: 'accepts_credit_cards', name: 'Accepts credit cards', value: true },
      { id: 'accepts_debit_cards', name: 'Accepts debit cards', value: true },
      { id: 'accepts_cash', name: 'Accepts cash', value: true },
      { id: 'accepts_checks', name: 'Accepts checks', value: true },
      { id: 'appointment_required', name: 'Appointment required', value: true },
      { id: 'online_appointments', name: 'Online appointments', value: true },
      { id: 'onsite_services', name: 'Onsite services', value: true },
      { id: 'wheelchair_accessible', name: 'Wheelchair accessible', value: true },
      { id: 'lgbtq_friendly', name: 'LGBTQ+ friendly', value: true },
      { id: 'women_owned', name: 'Women-owned', value: false },
      { id: 'veteran_owned', name: 'Veteran-owned', value: false },
      { id: 'serves_seniors', name: 'Serves seniors', value: true },
      { id: 'has_restroom', name: 'Has restroom', value: true },
      { id: 'free_wi_fi', name: 'Free Wi-Fi', value: true },
      { id: 'outdoor_seating', name: 'Outdoor seating', value: false },
      { id: 'dogs_allowed', name: 'Dogs allowed', value: true },
      { id: 'family_friendly', name: 'Family friendly', value: true },
      { id: 'has_private_lots', name: 'Has private lots', value: true }
    ];
  }

  /**
   * Generate business hours
   */
  private generateBusinessHours(): GMBHours {
    return {
      monday: { open: '08:00', close: '20:00' },
      tuesday: { open: '08:00', close: '20:00' },
      wednesday: { open: '08:00', close: '20:00' },
      thursday: { open: '08:00', close: '20:00' },
      friday: { open: '08:00', close: '20:00' },
      saturday: { open: '09:00', close: '18:00' },
      sunday: { open: '10:00', close: '17:00' }
    };
  }

  /**
   * Generate photo categories and priorities
   */
  private generatePhotoCategories(): GMBPhotoCategory[] {
    return [
      {
        category: 'LOGO',
        photos: ['/images/logo-square.png', '/images/logo-horizontal.png'],
        priority: 1
      },
      {
        category: 'COVER',
        photos: ['/images/gmb-cover-houston-mobile-notary.jpg'],
        priority: 2
      },
      {
        category: 'AT_WORK',
        photos: [
          '/images/notary-at-work-1.jpg',
          '/images/notary-at-work-2.jpg',
          '/images/loan-signing-session.jpg',
          '/images/ron-session.jpg'
        ],
        priority: 3
      },
      {
        category: 'PRODUCT',
        photos: [
          '/images/notary-seal.jpg',
          '/images/notary-journal.jpg',
          '/images/documents-signing.jpg',
          '/images/mobile-notary-kit.jpg'
        ],
        priority: 4
      },
      {
        category: 'TEAM',
        photos: [
          '/images/notary-headshot.jpg',
          '/images/team-professional.jpg'
        ],
        priority: 5
      },
      {
        category: 'EXTERIOR',
        photos: [
          '/images/mobile-unit-exterior.jpg',
          '/images/service-locations.jpg'
        ],
        priority: 6
      }
    ];
  }

  /**
   * Generate Q&A responses with local keywords
   */
  generateQAResponses(): Array<{ question: string; answer: string; keywords: string[] }> {
    const locations = LOCAL_SEO_ZIP_CODES.slice(0, 8);
    
    return [
      {
        question: 'What areas do you serve?',
        answer: `We provide mobile notary services throughout the Greater Houston area within a 25-mile radius of Pearland, TX. Our service area includes ${locations.map(l => l.city).join(', ')}, and surrounding communities. We travel to your location for maximum convenience.`,
        keywords: ['service area', 'mobile notary', 'Houston', 'Pearland', 'service locations']
      },
      {
        question: 'How much do your services cost?',
        answer: 'Mobile notary services start at $85 (standard) or $125 (extended hours). Loan signing starts at $175. Remote Online Notarization (RON) starts at $25 per session. Travel within 20 miles is included; tiered travel fees apply beyond that. We accept cash and credit cards.',
        keywords: ['pricing', 'cost', 'notary fees', 'loan signing', 'RON pricing']
      },
      {
        question: 'Do you offer same-day service?',
        answer: 'Yes! We offer same-day and emergency notary services 24/7. For urgent needs, we can typically arrive within 1-2 hours depending on location and availability. Emergency services include additional fees for immediate response.',
        keywords: ['same day', 'emergency', '24/7', 'urgent', 'immediate service']
      },
      {
        question: 'Are you licensed and insured?',
        answer: 'Yes, we are fully licensed Texas notaries public with active commissions. We carry comprehensive errors and omissions insurance and are bonded for your protection. All our notaries are certified and background checked.',
        keywords: ['licensed', 'insured', 'bonded', 'certified', 'Texas notary']
      },
      {
        question: 'What documents can you notarize?',
        answer: 'We can notarize a wide variety of documents including real estate documents, wills, power of attorney, affidavits, loan documents, business contracts, and more. We handle both personal and business notarizations with proper identification required.',
        keywords: ['document types', 'real estate', 'wills', 'power of attorney', 'business documents']
      },
      {
        question: 'Do you offer Remote Online Notarization?',
        answer: 'Yes! We offer secure Remote Online Notarization (RON) services available 24/7. This allows you to get documents notarized from anywhere with an internet connection through our secure video platform. RON is legally recognized in Texas for most document types.',
        keywords: ['RON', 'remote online notarization', 'video notarization', 'online notary', 'secure platform']
      }
    ];
  }

  /**
   * Generate local keyword-optimized posts
   */
  generateLocalPosts(): Array<{ content: string; callToAction: string; keywords: string[] }> {
    const locations = LOCAL_SEO_ZIP_CODES.slice(0, 6);
    
    return locations.map(location => ({
      content: `🏠 Now serving ${location.city}! Professional mobile notary services available in your area. From ${location.landmarks.join(', ')} - we come to you! Same-day appointments available.`,
      callToAction: `Book your mobile notary appointment in ${location.city} today!`,
      keywords: [`mobile notary ${location.city}`, `notary services ${location.city}`, `${location.city} notary`]
    }));
  }
}

export const gmbProfileOptimizer = new GMBProfileOptimizer(); 