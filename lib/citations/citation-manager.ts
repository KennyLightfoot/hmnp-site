/**
 * Citation Manager - Houston Mobile Notary Pros
 * Comprehensive local citation and directory management system
 * Target: 100+ directory listings for local SEO domination
 */

import { LOCAL_SEO_ZIP_CODES } from '../local-seo-data';

export interface BusinessInfo {
  name: string;
  address: string;
  phone: string;
  website: string;
  email: string;
  description: string;
  categories: string[];
  serviceArea: {
    radius: number;
    center: { lat: number; lng: number };
    cities: string[];
    zipCodes: string[];
  };
  hours: BusinessHours;
  socialMedia: SocialMediaProfiles;
  certifications: string[];
  licenses: string[];
}

export interface BusinessHours {
  monday: { open: string; close: string } | null;
  tuesday: { open: string; close: string } | null;
  wednesday: { open: string; close: string } | null;
  thursday: { open: string; close: string } | null;
  friday: { open: string; close: string } | null;
  saturday: { open: string; close: string } | null;
  sunday: { open: string; close: string } | null;
}

export interface SocialMediaProfiles {
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  instagram?: string;
  youtube?: string;
}

export interface DirectoryListing {
  id: string;
  name: string;
  url: string;
  category: 'PRIMARY' | 'INDUSTRY' | 'LOCAL' | 'SOCIAL' | 'NICHE';
  priority: number; // 1-5, 1 being highest priority
  status: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'NEEDS_UPDATE';
  submissionDate?: Date;
  approvalDate?: Date;
  listingUrl?: string;
  napConsistency: number; // 0-100%
  features: DirectoryFeatures;
  requirements: DirectoryRequirements;
  notes?: string;
}

export interface DirectoryFeatures {
  allowsPhotos: boolean;
  allowsHours: boolean;
  allowsDescription: boolean;
  allowsCategories: boolean;
  allowsReviews: boolean;
  allowsServiceArea: boolean;
  allowsSocialLinks: boolean;
  requiresVerification: boolean;
  providesBacklink: boolean;
  domainAuthority?: number;
}

export interface DirectoryRequirements {
  businessLicense?: boolean;
  physicalAddress?: boolean;
  phoneVerification?: boolean;
  emailVerification?: boolean;
  businessDocuments?: boolean;
  paymentRequired?: boolean;
  minimumReviews?: number;
}

export interface CitationAudit {
  totalCitations: number;
  consistentCitations: number;
  inconsistentCitations: number;
  napConsistencyScore: number;
  duplicateCitations: number;
  incompleteListings: number;
  topPerformingDirectories: string[];
  recommendedActions: string[];
}

export class CitationManager {
  private businessInfo: BusinessInfo;
  private directories: DirectoryListing[] = [];

  constructor() {
    this.businessInfo = this.initializeBusinessInfo();
    this.directories = this.initializeDirectories();
  }

  /**
   * Initialize standardized business information
   */
  private initializeBusinessInfo(): BusinessInfo {
    return {
      name: 'Houston Mobile Notary Pros LLC',
      address: 'Service-area business • Texas City, TX 77591 (25-mile radius)',
      phone: '832-617-4285',
      website: 'https://houstonmobilenotarypros.com',
      email: 'contact@houstonmobilenotarypros.com',
      description: 'Professional mobile notary services serving Houston, Pearland, Sugar Land, and surrounding areas within 25 miles. Licensed notary public providing convenient on-site notarization, loan signing services, and Remote Online Notarization (RON). Available 24/7 for emergency notary services.',
      categories: [
        'Mobile Notary Public',
        'Loan Signing Agent',
        'Notary Services',
        'Legal Services',
        'Document Notarization',
        'Real Estate Services',
        'Business Services'
      ],
      serviceArea: {
        radius: 25,
        center: { lat: 29.3838, lng: -94.9027 }, // Texas City, TX
        cities: [...new Set(LOCAL_SEO_ZIP_CODES.map(location => location.city))],
        zipCodes: LOCAL_SEO_ZIP_CODES.map(location => location.zipCode)
      },
      hours: {
        monday: { open: '09:00', close: '18:00' },
        tuesday: { open: '09:00', close: '18:00' },
        wednesday: { open: '09:00', close: '18:00' },
        thursday: { open: '09:00', close: '18:00' },
        friday: { open: '09:00', close: '18:00' },
        saturday: { open: '09:00', close: '16:00' },
        sunday: null
      },
      socialMedia: {
        facebook: 'https://facebook.com/houstonmobilenotarypros',
        linkedin: 'https://linkedin.com/company/houston-mobile-notary-pros',
        instagram: 'https://instagram.com/houstonmobilenotarypros'
      },
      certifications: [
        'Texas Licensed Notary Public',
        'Certified Loan Signing Agent',
        'National Notary Association Member',
        'Remote Online Notarization Certified'
      ],
      licenses: [
        'Texas Notary Public Commission',
        'Errors & Omissions Insurance',
        'General Liability Insurance',
        'Bonded Notary Public'
      ]
    };
  }

  /**
   * Initialize directory listings with categories and priorities
   */
  private initializeDirectories(): DirectoryListing[] {
    return [
      // PRIMARY DIRECTORIES (Tier 1)
      {
        id: 'google-my-business',
        name: 'Google My Business',
        url: 'https://business.google.com',
        category: 'PRIMARY',
        priority: 1,
        status: 'APPROVED', // Already set up
        features: {
          allowsPhotos: true,
          allowsHours: true,
          allowsDescription: true,
          allowsCategories: true,
          allowsReviews: true,
          allowsServiceArea: true,
          allowsSocialLinks: true,
          requiresVerification: true,
          providesBacklink: false,
          domainAuthority: 100
        },
        requirements: {
          phoneVerification: true,
          emailVerification: true
        },
        napConsistency: 100
      },
      {
        id: 'yelp-business',
        name: 'Yelp for Business',
        url: 'https://biz.yelp.com',
        category: 'PRIMARY',
        priority: 1,
        status: 'PENDING',
        features: {
          allowsPhotos: true,
          allowsHours: true,
          allowsDescription: true,
          allowsCategories: true,
          allowsReviews: true,
          allowsServiceArea: true,
          allowsSocialLinks: true,
          requiresVerification: true,
          providesBacklink: true,
          domainAuthority: 95
        },
        requirements: {
          phoneVerification: true,
          emailVerification: true
        },
        napConsistency: 0
      },
      {
        id: 'yellow-pages',
        name: 'Yellow Pages (YP.com)',
        url: 'https://www.yellowpages.com',
        category: 'PRIMARY',
        priority: 1,
        status: 'PENDING',
        features: {
          allowsPhotos: true,
          allowsHours: true,
          allowsDescription: true,
          allowsCategories: true,
          allowsReviews: true,
          allowsServiceArea: false,
          allowsSocialLinks: true,
          requiresVerification: false,
          providesBacklink: true,
          domainAuthority: 85
        },
        requirements: {
          emailVerification: true
        },
        napConsistency: 0
      },
      {
        id: 'better-business-bureau',
        name: 'Better Business Bureau',
        url: 'https://www.bbb.org',
        category: 'PRIMARY',
        priority: 1,
        status: 'PENDING',
        features: {
          allowsPhotos: true,
          allowsHours: true,
          allowsDescription: true,
          allowsCategories: true,
          allowsReviews: true,
          allowsServiceArea: true,
          allowsSocialLinks: true,
          requiresVerification: true,
          providesBacklink: true,
          domainAuthority: 90
        },
        requirements: {
          businessLicense: true,
          emailVerification: true,
          paymentRequired: true
        },
        napConsistency: 0
      },
      {
        id: 'angie-list',
        name: 'Angie\'s List (Angi)',
        url: 'https://www.angi.com',
        category: 'PRIMARY',
        priority: 2,
        status: 'PENDING',
        features: {
          allowsPhotos: true,
          allowsHours: true,
          allowsDescription: true,
          allowsCategories: true,
          allowsReviews: true,
          allowsServiceArea: true,
          allowsSocialLinks: false,
          requiresVerification: true,
          providesBacklink: true,
          domainAuthority: 88
        },
        requirements: {
          phoneVerification: true,
          emailVerification: true,
          businessDocuments: true
        },
        napConsistency: 0
      },
      {
        id: 'nextdoor-business',
        name: 'Nextdoor Business',
        url: 'https://business.nextdoor.com',
        category: 'LOCAL',
        priority: 2,
        status: 'PENDING',
        features: {
          allowsPhotos: true,
          allowsHours: true,
          allowsDescription: true,
          allowsCategories: true,
          allowsReviews: true,
          allowsServiceArea: true,
          allowsSocialLinks: false,
          requiresVerification: true,
          providesBacklink: false,
          domainAuthority: 92
        },
        requirements: {
          physicalAddress: true,
          emailVerification: true
        },
        napConsistency: 0
      },

      // INDUSTRY-SPECIFIC DIRECTORIES
      {
        id: 'national-notary-association',
        name: 'National Notary Association',
        url: 'https://www.nationalnotary.org',
        category: 'INDUSTRY',
        priority: 1,
        status: 'PENDING',
        features: {
          allowsPhotos: false,
          allowsHours: false,
          allowsDescription: true,
          allowsCategories: true,
          allowsReviews: false,
          allowsServiceArea: true,
          allowsSocialLinks: false,
          requiresVerification: true,
          providesBacklink: true,
          domainAuthority: 70
        },
        requirements: {
          businessLicense: true,
          paymentRequired: true
        },
        napConsistency: 0
      },
      {
        id: 'american-association-notaries',
        name: 'American Association of Notaries',
        url: 'https://www.americannotariesassociation.org',
        category: 'INDUSTRY',
        priority: 2,
        status: 'PENDING',
        features: {
          allowsPhotos: false,
          allowsHours: false,
          allowsDescription: true,
          allowsCategories: true,
          allowsReviews: false,
          allowsServiceArea: true,
          allowsSocialLinks: false,
          requiresVerification: true,
          providesBacklink: true,
          domainAuthority: 65
        },
        requirements: {
          businessLicense: true,
          paymentRequired: true
        },
        napConsistency: 0
      },
      {
        id: 'texas-secretary-state',
        name: 'Texas Secretary of State',
        url: 'https://www.sos.state.tx.us',
        category: 'INDUSTRY',
        priority: 1,
        status: 'APPROVED', // Required for licensing
        features: {
          allowsPhotos: false,
          allowsHours: false,
          allowsDescription: false,
          allowsCategories: false,
          allowsReviews: false,
          allowsServiceArea: false,
          allowsSocialLinks: false,
          requiresVerification: true,
          providesBacklink: true,
          domainAuthority: 95
        },
        requirements: {
          businessLicense: true
        },
        napConsistency: 100
      },
      {
        id: 'notary-locate',
        name: 'NotaryLocate.com',
        url: 'https://www.notarylocate.com',
        category: 'INDUSTRY',
        priority: 2,
        status: 'PENDING',
        features: {
          allowsPhotos: true,
          allowsHours: true,
          allowsDescription: true,
          allowsCategories: true,
          allowsReviews: false,
          allowsServiceArea: true,
          allowsSocialLinks: false,
          requiresVerification: false,
          providesBacklink: true,
          domainAuthority: 45
        },
        requirements: {},
        napConsistency: 0
      },
      {
        id: '123notary',
        name: '123Notary.com',
        url: 'https://www.123notary.com',
        category: 'INDUSTRY',
        priority: 2,
        status: 'PENDING',
        features: {
          allowsPhotos: true,
          allowsHours: true,
          allowsDescription: true,
          allowsCategories: true,
          allowsReviews: true,
          allowsServiceArea: true,
          allowsSocialLinks: false,
          requiresVerification: false,
          providesBacklink: true,
          domainAuthority: 50
        },
        requirements: {
          paymentRequired: true
        },
        napConsistency: 0
      },

      // LOCAL HOUSTON DIRECTORIES
      {
        id: 'houston-com',
        name: 'Houston.com',
        url: 'https://www.houston.com',
        category: 'LOCAL',
        priority: 2,
        status: 'PENDING',
        features: {
          allowsPhotos: true,
          allowsHours: true,
          allowsDescription: true,
          allowsCategories: true,
          allowsReviews: false,
          allowsServiceArea: true,
          allowsSocialLinks: true,
          requiresVerification: false,
          providesBacklink: true,
          domainAuthority: 65
        },
        requirements: {},
        napConsistency: 0
      },
      {
        id: 'greater-houston-partnership',
        name: 'Greater Houston Partnership',
        url: 'https://www.houston.org',
        category: 'LOCAL',
        priority: 2,
        status: 'PENDING',
        features: {
          allowsPhotos: true,
          allowsHours: true,
          allowsDescription: true,
          allowsCategories: true,
          allowsReviews: false,
          allowsServiceArea: false,
          allowsSocialLinks: true,
          requiresVerification: true,
          providesBacklink: true,
          domainAuthority: 72
        },
        requirements: {
          paymentRequired: true,
          businessDocuments: true
        },
        napConsistency: 0
      },
      {
        id: 'pearland-chamber',
        name: 'Pearland Chamber of Commerce',
        url: 'https://www.pearlandchamber.org',
        category: 'LOCAL',
        priority: 1,
        status: 'PENDING',
        features: {
          allowsPhotos: true,
          allowsHours: true,
          allowsDescription: true,
          allowsCategories: true,
          allowsReviews: false,
          allowsServiceArea: true,
          allowsSocialLinks: true,
          requiresVerification: true,
          providesBacklink: true,
          domainAuthority: 55
        },
        requirements: {
          paymentRequired: true,
          businessDocuments: true
        },
        napConsistency: 0
      }
    ];
  }

  /**
   * Get business information for submissions
   */
  getBusinessInfo(): BusinessInfo {
    return this.businessInfo;
  }

  /**
   * Get all directories by category
   */
  getDirectoriesByCategory(category?: string): DirectoryListing[] {
    if (!category) return this.directories;
    return this.directories.filter(dir => dir.category === category);
  }

  /**
   * Get directories by priority
   */
  getDirectoriesByPriority(priority: number): DirectoryListing[] {
    return this.directories.filter(dir => dir.priority === priority);
  }

  /**
   * Get pending submissions
   */
  getPendingSubmissions(): DirectoryListing[] {
    return this.directories.filter(dir => dir.status === 'PENDING');
  }

  /**
   * Update directory status
   */
  updateDirectoryStatus(directoryId: string, status: DirectoryListing['status'], data?: Partial<DirectoryListing>): boolean {
    const directory = this.directories.find(dir => dir.id === directoryId);
    if (!directory) return false;

    directory.status = status;
    if (data) {
      Object.assign(directory, data);
    }

    if (status === 'SUBMITTED') {
      directory.submissionDate = new Date();
    } else if (status === 'APPROVED') {
      directory.approvalDate = new Date();
    }

    return true;
  }

  /**
   * Calculate NAP consistency score
   */
  calculateNAPConsistency(): number {
    const totalDirectories = this.directories.filter(dir => dir.status === 'APPROVED').length;
    if (totalDirectories === 0) return 0;

    const consistentDirectories = this.directories.filter(
      dir => dir.status === 'APPROVED' && dir.napConsistency >= 95
    ).length;

    return Math.round((consistentDirectories / totalDirectories) * 100);
  }

  /**
   * Generate citation audit report
   */
  generateCitationAudit(): CitationAudit {
    const totalCitations = this.directories.filter(dir => dir.status === 'APPROVED').length;
    const consistentCitations = this.directories.filter(
      dir => dir.status === 'APPROVED' && dir.napConsistency >= 95
    ).length;
    const inconsistentCitations = totalCitations - consistentCitations;
    const incompleteListings = this.directories.filter(dir => dir.status === 'NEEDS_UPDATE').length;

    const topPerformingDirectories = this.directories
      .filter(dir => dir.status === 'APPROVED' && dir.features.domainAuthority && dir.features.domainAuthority >= 80)
      .sort((a, b) => (b.features.domainAuthority || 0) - (a.features.domainAuthority || 0))
      .slice(0, 5)
      .map(dir => dir.name);

    const recommendedActions = this.generateRecommendedActions();

    return {
      totalCitations,
      consistentCitations,
      inconsistentCitations,
      napConsistencyScore: this.calculateNAPConsistency(),
      duplicateCitations: 0, // Would need duplicate detection logic
      incompleteListings,
      topPerformingDirectories,
      recommendedActions
    };
  }

  /**
   * Generate recommended actions for citation improvement
   */
  private generateRecommendedActions(): string[] {
    const actions: string[] = [];

    // Check for pending high-priority submissions
    const pendingHighPriority = this.directories.filter(
      dir => dir.status === 'PENDING' && dir.priority === 1
    );
    if (pendingHighPriority.length > 0) {
      actions.push(`Submit to ${pendingHighPriority.length} high-priority directories: ${pendingHighPriority.map(d => d.name).join(', ')}`);
    }

    // Check NAP consistency
    const napScore = this.calculateNAPConsistency();
    if (napScore < 95) {
      actions.push(`Improve NAP consistency (currently ${napScore}%) by updating inconsistent listings`);
    }

    // Check for incomplete listings
    const incomplete = this.directories.filter(dir => dir.status === 'NEEDS_UPDATE');
    if (incomplete.length > 0) {
      actions.push(`Update ${incomplete.length} incomplete listings: ${incomplete.map(d => d.name).join(', ')}`);
    }

    // Check for industry-specific opportunities
    const pendingIndustry = this.directories.filter(
      dir => dir.status === 'PENDING' && dir.category === 'INDUSTRY'
    );
    if (pendingIndustry.length > 0) {
      actions.push(`Submit to ${pendingIndustry.length} industry-specific directories for authority building`);
    }

    return actions;
  }

  /**
   * Generate submission template for a directory
   */
  generateSubmissionTemplate(directoryId: string): any {
    const directory = this.directories.find(dir => dir.id === directoryId);
    if (!directory) return null;

    const template: any = {
      businessName: this.businessInfo.name,
      description: this.businessInfo.description
    };

    // Add fields based on directory features
    if (directory.features.allowsHours) {
      template.hours = this.businessInfo.hours;
    }

    if (directory.features.allowsCategories) {
      template.categories = this.businessInfo.categories;
    }

    if (directory.features.allowsServiceArea) {
      template.serviceArea = this.businessInfo.serviceArea;
    }

    if (directory.features.allowsSocialLinks) {
      template.socialMedia = this.businessInfo.socialMedia;
    }

    // Contact information
    template.phone = this.businessInfo.phone;
    template.website = this.businessInfo.website;
    template.email = this.businessInfo.email;

    // Service area description
    template.serviceAreaDescription = `Serving ${this.businessInfo.serviceArea.cities.slice(0, 5).join(', ')} and surrounding areas within ${this.businessInfo.serviceArea.radius} miles`;

    return template;
  }

  /**
   * Get submission statistics
   */
  getSubmissionStats(): {
    total: number;
    pending: number;
    submitted: number;
    approved: number;
    rejected: number;
    needsUpdate: number;
    byCategory: { [key: string]: number };
    byPriority: { [key: number]: number };
  } {
    const stats = {
      total: this.directories.length,
      pending: 0,
      submitted: 0,
      approved: 0,
      rejected: 0,
      needsUpdate: 0,
      byCategory: {} as { [key: string]: number },
      byPriority: {} as { [key: number]: number }
    };

    this.directories.forEach(dir => {
      // Count by status
      stats[dir.status.toLowerCase() as keyof typeof stats]++;

      // Count by category
      stats.byCategory[dir.category] = (stats.byCategory[dir.category] || 0) + 1;

      // Count by priority
      stats.byPriority[dir.priority] = (stats.byPriority[dir.priority] || 0) + 1;
    });

    return stats;
  }
}

export const citationManager = new CitationManager(); 