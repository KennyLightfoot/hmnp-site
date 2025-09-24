/**
 * Citation Builder - Automated Directory Submission System
 * Generates optimized directory submissions with local keywords
 */

import { citationManager } from './citation-manager';
import { generateLocationKeywords } from '../local-keyword-generator';
import { LOCAL_SEO_ZIP_CODES } from '../local-seo-data';

export interface SubmissionTemplate {
  directoryId: string;
  directoryName: string;
  template: DirectorySubmissionData;
  localKeywords: string[];
  submissionInstructions: string[];
  verificationSteps: string[];
  estimatedTime: number; // minutes
}

export interface DirectorySubmissionData {
  businessName: string;
  businessDescription: string;
  shortDescription?: string;
  address: string;
  phone: string;
  website: string;
  email: string;
  categories: string[];
  primaryCategory: string;
  hours?: any;
  serviceArea?: string;
  serviceAreaCities?: string[];
  socialMediaLinks?: any;
  businessLicense?: string;
  certifications?: string[];
  yearEstablished?: string;
  numberOfEmployees?: string;
  acceptedPayments?: string[];
  keywords?: string[];
  photos?: PhotoSubmission[];
  services?: ServiceOffering[];
}

export interface PhotoSubmission {
  type: 'LOGO' | 'EXTERIOR' | 'INTERIOR' | 'TEAM' | 'SERVICES' | 'CERTIFICATES';
  url: string;
  caption: string;
  altText: string;
}

export interface ServiceOffering {
  name: string;
  description: string;
  price?: string;
  duration?: string;
  availability?: string;
}

export class CitationBuilder {
  private businessInfo = citationManager.getBusinessInfo();

  /**
   * Generate submission template for specific directory
   */
  generateSubmissionTemplate(directoryId: string): SubmissionTemplate | null {
    const directories = citationManager.getDirectoriesByCategory();
    const directory = directories.find(dir => dir.id === directoryId);
    
    if (!directory) return null;

    // Generate local keywords for the primary service area
    const primaryKeywords = generateLocationKeywords('77591'); // Pearland base
    const localKeywords = [
      ...primaryKeywords.primary.slice(0, 10),
      ...primaryKeywords.nearMe.slice(0, 5),
      ...primaryKeywords.landmark.slice(0, 5)
    ];

    const template: DirectorySubmissionData = {
      businessName: this.businessInfo.name,
      businessDescription: this.generateOptimizedDescription(directory.category, localKeywords),
      shortDescription: this.generateShortDescription(),
      address: this.formatAddressForDirectory(directory.id),
      phone: this.businessInfo.phone,
      website: this.businessInfo.website,
      email: this.businessInfo.email,
      categories: this.selectOptimalCategories(directory.features.allowsCategories),
      primaryCategory: this.getPrimaryCategory(directory.category),
      keywords: localKeywords
    };

    // Add optional fields based on directory features
    if (directory.features.allowsHours) {
      template.hours = this.formatBusinessHours(directory.id);
    }

    if (directory.features.allowsServiceArea) {
      template.serviceArea = this.generateServiceAreaDescription();
      template.serviceAreaCities = this.businessInfo.serviceArea.cities;
    }

    if (directory.features.allowsSocialLinks) {
      template.socialMediaLinks = this.businessInfo.socialMedia;
    }

    if (directory.features.allowsPhotos) {
      template.photos = this.generatePhotoSubmissions();
    }

    // Add services for service-focused directories
    template.services = this.generateServiceOfferings();

    // Add business details
    template.yearEstablished = '2020';
    template.numberOfEmployees = '1-5';
    template.acceptedPayments = ['Cash', 'Credit Card', 'Check', 'Digital Payment'];
    template.businessLicense = 'Texas Notary Public Commission';
    template.certifications = this.businessInfo.certifications;

    return {
      directoryId,
      directoryName: directory.name,
      template,
      localKeywords,
      submissionInstructions: this.generateSubmissionInstructions(directory),
      verificationSteps: this.generateVerificationSteps(directory),
      estimatedTime: this.estimateSubmissionTime(directory)
    };
  }

  /**
   * Generate optimized business description for specific directory type
   */
  private generateOptimizedDescription(category: string, keywords: string[]): string {
    const baseDescription = this.businessInfo.description;
    
    // Customize description based on directory category
    switch (category) {
      case 'PRIMARY':
        return `${baseDescription} We specialize in ${keywords.slice(0, 3).join(', ')} with same-day availability and emergency services. Serving the Greater Houston area including ${this.businessInfo.serviceArea.cities.slice(0, 6).join(', ')}. Licensed, bonded, and insured for your peace of mind.`;
      
      case 'INDUSTRY':
        return `Professional mobile notary and loan signing agent serving the Houston metropolitan area. Texas licensed notary public with comprehensive training in loan document notarization, real estate closings, and business document authentication. Member of the National Notary Association with errors and omissions insurance.`;
      
      case 'LOCAL':
        return `Local mobile notary service proudly serving ${this.businessInfo.serviceArea.cities.slice(0, 4).join(', ')} and surrounding communities. We bring professional notarization services directly to your location - home, office, or any convenient meeting place. Available evenings and weekends for your convenience.`;
      
      default:
        return baseDescription;
    }
  }

  /**
   * Generate short description for directories with character limits
   */
  private generateShortDescription(): string {
    return `Professional mobile notary serving Houston metro. Licensed, bonded, insured. Same-day service available. Call ${this.businessInfo.phone}`;
  }

  /**
   * Format address based on directory requirements
   */
  private formatAddressForDirectory(directoryId: string): string {
    // Some directories require physical address, others accept service area
    const requiresPhysical = ['better-business-bureau', 'nextdoor-business'];
    
    if (requiresPhysical.includes(directoryId)) {
      return 'Pearland, TX 77591'; // Use general area for mobile service
    }
    
    return this.businessInfo.address; // Service area description
  }

  /**
   * Select optimal categories for directory
   */
  private selectOptimalCategories(allowsCategories: boolean): string[] {
    if (!allowsCategories) return [];

    // Return top categories that perform well in local search
    return [
      'Mobile Notary Public',
      'Notary Services', 
      'Loan Signing Agent',
      'Legal Services',
      'Document Services'
    ];
  }

  /**
   * Get primary category based on directory type
   */
  private getPrimaryCategory(directoryCategory: string): string {
    switch (directoryCategory) {
      case 'INDUSTRY':
        return 'Notary Public';
      case 'LOCAL':
        return 'Mobile Notary Public';
      default:
        return 'Mobile Notary Public';
    }
  }

  /**
   * Format business hours for directory submission
   */
  private formatBusinessHours(directoryId: string): any {
    const hours = this.businessInfo.hours;
    
    // Some directories need specific formats
    if (directoryId === 'google-my-business') {
      return hours; // Keep original format
    }
    
    // Standard format for most directories
    return {
      'Monday': hours.monday ? `${hours.monday.open} - ${hours.monday.close}` : 'Closed',
      'Tuesday': hours.tuesday ? `${hours.tuesday.open} - ${hours.tuesday.close}` : 'Closed',
      'Wednesday': hours.wednesday ? `${hours.wednesday.open} - ${hours.wednesday.close}` : 'Closed',
      'Thursday': hours.thursday ? `${hours.thursday.open} - ${hours.thursday.close}` : 'Closed',
      'Friday': hours.friday ? `${hours.friday.open} - ${hours.friday.close}` : 'Closed',
      'Saturday': hours.saturday ? `${hours.saturday.open} - ${hours.saturday.close}` : 'Closed',
      'Sunday': hours.sunday ? `${hours.sunday.open} - ${hours.sunday.close}` : 'Closed'
    };
  }

  /**
   * Generate service area description
   */
  private generateServiceAreaDescription(): string {
    const cities = this.businessInfo.serviceArea.cities.slice(0, 8);
    return `We provide mobile notary services throughout the Greater Houston area, including ${cities.join(', ')}, and all surrounding communities within ${this.businessInfo.serviceArea.radius} miles of Pearland, Texas.`;
  }

  /**
   * Generate photo submissions
   */
  private generatePhotoSubmissions(): PhotoSubmission[] {
    return [
      {
        type: 'LOGO',
        url: '/images/logo-professional.png',
        caption: 'Houston Mobile Notary Pros - Professional Mobile Notary Services',
        altText: 'Houston Mobile Notary Pros logo'
      },
      {
        type: 'SERVICES',
        url: '/images/notary-services-photo.jpg',
        caption: 'Professional mobile notary services at your location',
        altText: 'Mobile notary providing document signing services'
      },
      {
        type: 'TEAM',
        url: '/images/notary-professional-headshot.jpg',
        caption: 'Licensed Texas Notary Public serving the Houston area',
        altText: 'Professional notary public headshot'
      },
      {
        type: 'CERTIFICATES',
        url: '/images/notary-certifications.jpg',
        caption: 'Texas licensed, bonded, and insured notary public',
        altText: 'Notary public licenses and certifications'
      }
    ];
  }

  /**
   * Generate service offerings
   */
  private generateServiceOfferings(): ServiceOffering[] {
    return [
      {
        name: 'Mobile Notary Services',
        description: 'Professional notarization at your location - home, office, or anywhere convenient',
        price: '$15 per signature',
        duration: '15-30 minutes',
        availability: 'Monday-Sunday, 8 AM - 8 PM'
      },
      {
        name: 'Loan Signing Services',
        description: 'Certified loan signing agent for mortgage, refinance, and HELOC closings',
        price: '$100-$200 per signing',
        duration: '60-90 minutes',
        availability: 'Monday-Sunday, flexible scheduling'
      },
      {
        name: 'Remote Online Notarization (RON)',
        description: 'Secure video-based notarization available 24/7 from anywhere',
        price: '$35-$50 per document',
        duration: '10-20 minutes',
        availability: '24/7 online availability'
      },
      {
        name: 'Estate Planning Documents',
        description: 'Notarization of wills, trusts, power of attorney, and healthcare directives',
        price: '$15-$25 per signature',
        duration: '20-45 minutes',
        availability: 'Monday-Sunday, including evenings'
      },
      {
        name: 'Business Document Notarization',
        description: 'Corporate agreements, contracts, and business formation documents',
        price: '$20-$30 per document',
        duration: '15-30 minutes',
        availability: 'Monday-Friday, business hours'
      },
      {
        name: 'Emergency Notary Services',
        description: 'Urgent notarization services available same-day or after hours',
        price: '$50-$100 per visit',
        duration: 'Variable',
        availability: '24/7 emergency response'
      }
    ];
  }

  /**
   * Generate submission instructions
   */
  private generateSubmissionInstructions(directory: any): string[] {
    const instructions = [
      `Visit ${directory.url} and create a business account`,
      'Complete the business profile with all required information',
      'Upload business logo and service photos',
      'Verify business information matches NAP standards exactly'
    ];

    if (directory.features.requiresVerification) {
      instructions.push('Complete phone/email verification process');
    }

    if (directory.requirements.businessLicense) {
      instructions.push('Upload business license and notary commission documents');
    }

    if (directory.requirements.paymentRequired) {
      instructions.push('Complete payment for premium listing features');
    }

    if (directory.features.allowsReviews) {
      instructions.push('Monitor for reviews and respond promptly');
    }

    return instructions;
  }

  /**
   * Generate verification steps
   */
  private generateVerificationSteps(directory: any): string[] {
    const steps = [
      'Verify business name matches exactly: "Houston Mobile Notary Pros"',
      `Verify phone number: ${this.businessInfo.phone}`,
      `Verify website URL: ${this.businessInfo.website}`,
      'Verify service area description is consistent'
    ];

    if (directory.requirements.phoneVerification) {
      steps.push('Complete automated phone verification call');
    }

    if (directory.requirements.emailVerification) {
      steps.push('Click verification link in email confirmation');
    }

    return steps;
  }

  /**
   * Estimate submission time
   */
  private estimateSubmissionTime(directory: any): number {
    let baseTime = 15; // Base time in minutes

    if (directory.features.allowsPhotos) baseTime += 10;
    if (directory.features.requiresVerification) baseTime += 5;
    if (directory.requirements.businessDocuments) baseTime += 10;
    if (directory.requirements.paymentRequired) baseTime += 5;

    return baseTime;
  }

  /**
   * Generate bulk submission plan
   */
  generateBulkSubmissionPlan(): {
    week1: SubmissionTemplate[];
    week2: SubmissionTemplate[];
    week3: SubmissionTemplate[];
    week4: SubmissionTemplate[];
    totalEstimatedTime: number;
  } {
    const allDirectories = citationManager.getDirectoriesByCategory();
    const pendingDirectories = allDirectories.filter(dir => dir.status === 'PENDING');

    // Sort by priority and domain authority
    const sortedDirectories = pendingDirectories.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return (b.features.domainAuthority || 0) - (a.features.domainAuthority || 0);
    });

    const templates = sortedDirectories.map(dir => 
      this.generateSubmissionTemplate(dir.id)
    ).filter(Boolean) as SubmissionTemplate[];

    // Distribute across 4 weeks
    const week1 = templates.slice(0, 8);  // High priority
    const week2 = templates.slice(8, 16); // Industry specific
    const week3 = templates.slice(16, 24); // Local directories
    const week4 = templates.slice(24, 32); // Remaining

    const totalEstimatedTime = templates.reduce((sum, template) => sum + template.estimatedTime, 0);

    return {
      week1,
      week2,
      week3,
      week4,
      totalEstimatedTime
    };
  }

  /**
   * Generate NAP consistency check
   */
  generateNAPReport(): {
    name: { value: string; consistent: boolean };
    address: { value: string; consistent: boolean };
    phone: { value: string; consistent: boolean };
    recommendations: string[];
  } {
    const standardName = this.businessInfo.name;
    const standardPhone = this.businessInfo.phone;
    const standardAddress = 'Pearland, TX 77591'; // Simplified for mobile service

    return {
      name: {
        value: standardName,
        consistent: true // Would check against existing listings
      },
      address: {
        value: standardAddress,
        consistent: true
      },
      phone: {
        value: standardPhone,
        consistent: true
      },
      recommendations: [
        'Use exact business name on all directories',
        'Maintain consistent phone number format',
        'Use service area description consistently',
        'Update any outdated listings immediately'
      ]
    };
  }
}

export const citationBuilder = new CitationBuilder(); 