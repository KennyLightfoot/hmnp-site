/**
 * 🎯 NAP Audit Service - Phase 5 Local SEO Enhancement
 * Houston Mobile Notary Pros - Business Data Standardization
 * 
 * Ensures consistent Name, Address, Phone data across all platforms
 * for maximum local SEO impact.
 */

import { prisma } from '@/lib/prisma';

export interface BusinessNAPData {
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    formatted: string;
  };
  phone: string;
  website: string;
  businessHours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  serviceAreas: string[];
  categories: string[];
}

export interface NAPInconsistency {
  platform: string;
  field: string;
  currentValue: string;
  standardValue: string;
  severity: 'high' | 'medium' | 'low';
  impact: string;
}

export interface NAPAuditResult {
  businessData: BusinessNAPData;
  totalCitations: number;
  consistentCitations: number;
  inconsistentCitations: number;
  inconsistencies: NAPInconsistency[];
  consistencyScore: number;
  recommendations: string[];
}

export class NAPAuditService {
  private static instance: NAPAuditService;
  private standardBusinessData: BusinessNAPData;

  private constructor() {
    // Houston Mobile Notary Pros - Standardized Business Data
    this.standardBusinessData = {
      name: "Houston Mobile Notary Pros",
      address: {
        street: "Houston Metro Area",
        city: "Houston",
        state: "TX",
        zipCode: "77591",
        formatted: "Houston Metro Area, Houston, TX 77591"
      },
      phone: "(713) 364-4065",
      website: "https://houstonmobilenotarypros.com",
      businessHours: {
        monday: "7:00 AM - 9:00 PM",
        tuesday: "7:00 AM - 9:00 PM", 
        wednesday: "7:00 AM - 9:00 PM",
        thursday: "7:00 AM - 9:00 PM",
        friday: "7:00 AM - 9:00 PM",
        saturday: "8:00 AM - 6:00 PM",
        sunday: "8:00 AM - 6:00 PM"
      },
      serviceAreas: [
        "Houston Metro Area",
        "Harris County",
        "Montgomery County", 
        "Fort Bend County",
        "Galveston County"
      ],
      categories: [
        "Mobile Notary Services",
        "Loan Signing Agent",
        "Remote Online Notarization",
        "Document Notarization",
        "Legal Services"
      ]
    };
  }

  static getInstance(): NAPAuditService {
    if (!NAPAuditService.instance) {
      NAPAuditService.instance = new NAPAuditService();
    }
    return NAPAuditService.instance;
  }

  /**
   * Get standardized business data
   */
  getStandardBusinessData(): BusinessNAPData {
    return { ...this.standardBusinessData };
  }

  /**
   * Audit NAP consistency across all citations
   */
  async auditNAPConsistency(): Promise<NAPAuditResult> {
    console.log('🔍 Starting NAP consistency audit...');
    
    try {
      // Get all citations from database
      const citations = await this.getAllCitations();
      
      // Analyze each citation for consistency
      const inconsistencies: NAPInconsistency[] = [];
      let consistentCount = 0;
      
      for (const citation of citations) {
        const citationInconsistencies = this.analyzeCitationConsistency(citation);
        
        if (citationInconsistencies.length === 0) {
          consistentCount++;
        } else {
          inconsistencies.push(...citationInconsistencies);
        }
      }
      
      // Calculate consistency score
      const consistencyScore = citations.length > 0 
        ? Math.round((consistentCount / citations.length) * 100)
        : 100;
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(inconsistencies);
      
      const result: NAPAuditResult = {
        businessData: this.standardBusinessData,
        totalCitations: citations.length,
        consistentCitations: consistentCount,
        inconsistentCitations: citations.length - consistentCount,
        inconsistencies,
        consistencyScore,
        recommendations
      };
      
      // Log audit results
      await this.logAuditResult(result);
      
      console.log(`✅ NAP audit complete - ${consistencyScore}% consistency`);
      return result;
      
    } catch (error) {
      console.error('❌ NAP audit failed:', error);
      throw error;
    }
  }

  /**
   * Validate individual citation data
   */
  analyzeCitationConsistency(citation: any): NAPInconsistency[] {
    const inconsistencies: NAPInconsistency[] = [];
    const standard = this.standardBusinessData;
    
    // Check business name
    if (citation.businessName && citation.businessName !== standard.name) {
      inconsistencies.push({
        platform: citation.platform,
        field: 'businessName',
        currentValue: citation.businessName,
        standardValue: standard.name,
        severity: 'high',
        impact: 'Affects brand recognition and local search rankings'
      });
    }
    
    // Check phone number
    if (citation.phone && citation.phone !== standard.phone) {
      inconsistencies.push({
        platform: citation.platform,
        field: 'phone',
        currentValue: citation.phone,
        standardValue: standard.phone,
        severity: 'high',
        impact: 'Confuses customers and search engines'
      });
    }
    
    // Check website URL
    if (citation.website && citation.website !== standard.website) {
      inconsistencies.push({
        platform: citation.platform,
        field: 'website',
        currentValue: citation.website,
        standardValue: standard.website,
        severity: 'medium',
        impact: 'Reduces website traffic and SEO value'
      });
    }
    
    // Check address components
    if (citation.address) {
      if (citation.address.city !== standard.address.city) {
        inconsistencies.push({
          platform: citation.platform,
          field: 'city',
          currentValue: citation.address.city,
          standardValue: standard.address.city,
          severity: 'high',
          impact: 'Critical for local search visibility'
        });
      }
      
      if (citation.address.state !== standard.address.state) {
        inconsistencies.push({
          platform: citation.platform,
          field: 'state',
          currentValue: citation.address.state,
          standardValue: standard.address.state,
          severity: 'high',
          impact: 'Affects local search targeting'
        });
      }
      
      if (citation.address.zipCode !== standard.address.zipCode) {
        inconsistencies.push({
          platform: citation.platform,
          field: 'zipCode',
          currentValue: citation.address.zipCode,
          standardValue: standard.address.zipCode,
          severity: 'medium',
          impact: 'Impacts local search precision'
        });
      }
    }
    
    return inconsistencies;
  }

  /**
   * Generate recommendations based on inconsistencies
   */
  private generateRecommendations(inconsistencies: NAPInconsistency[]): string[] {
    const recommendations: string[] = [];
    
    if (inconsistencies.length === 0) {
      recommendations.push("✅ Excellent! All citations are consistent with standard business data.");
      return recommendations;
    }
    
    const highSeverityCount = inconsistencies.filter(i => i.severity === 'high').length;
    const mediumSeverityCount = inconsistencies.filter(i => i.severity === 'medium').length;
    
    if (highSeverityCount > 0) {
      recommendations.push(`🚨 Fix ${highSeverityCount} high-priority inconsistencies immediately - these significantly impact local SEO`);
    }
    
    if (mediumSeverityCount > 0) {
      recommendations.push(`⚠️ Address ${mediumSeverityCount} medium-priority inconsistencies to improve local search performance`);
    }
    
    // Platform-specific recommendations
    const platformCounts = this.countInconsistenciesByPlatform(inconsistencies);
    Object.entries(platformCounts).forEach(([platform, count]) => {
      recommendations.push(`🔧 Update ${platform} listing - ${count} inconsistencies found`);
    });
    
    // General recommendations
    recommendations.push("📋 Use automated citation management to maintain consistency");
    recommendations.push("🔄 Schedule monthly NAP audits to catch drift early");
    recommendations.push("📊 Monitor local search rankings after corrections");
    
    return recommendations;
  }

  /**
   * Count inconsistencies by platform
   */
  private countInconsistenciesByPlatform(inconsistencies: NAPInconsistency[]): Record<string, number> {
    const counts: Record<string, number> = {};
    
    inconsistencies.forEach(inconsistency => {
      counts[inconsistency.platform] = (counts[inconsistency.platform] || 0) + 1;
    });
    
    return counts;
  }

  /**
   * Get all citations from database
   */
  private async getAllCitations(): Promise<any[]> {
    try {
      // In a real implementation, this would fetch from Citation model
      // For now, we'll return mock data to demonstrate the system
      return [
        {
          id: 1,
          platform: 'Google My Business',
          businessName: 'Houston Mobile Notary Pros',
          phone: '(713) 364-4065',
          website: 'https://houstonmobilenotarypros.com',
          address: {
            street: 'Houston Metro Area',
            city: 'Houston',
            state: 'TX',
            zipCode: '77591'
          },
          status: 'active',
          verified: true
        },
        {
          id: 2,
          platform: 'Yelp',
          businessName: 'Houston Mobile Notary Pros',
          phone: '(713) 364-4065',
          website: 'https://houstonmobilenotarypros.com',
          address: {
            street: 'Houston Metro Area',
            city: 'Houston',
            state: 'TX',
            zipCode: '77591'
          },
          status: 'active',
          verified: false
        }
      ];
    } catch (error) {
      console.error('Error fetching citations:', error);
      return [];
    }
  }

  /**
   * Log audit results to database
   */
  private async logAuditResult(result: NAPAuditResult): Promise<void> {
    try {
      // In a real implementation, this would save to AuditLog model
      console.log('📊 NAP Audit Results:', {
        timestamp: new Date().toISOString(),
        consistencyScore: result.consistencyScore,
        totalCitations: result.totalCitations,
        inconsistencies: result.inconsistencies.length
      });
    } catch (error) {
      console.error('Error logging audit result:', error);
    }
  }

  /**
   * Standardize business data format
   */
  standardizeBusinessData(data: Partial<BusinessNAPData>): BusinessNAPData {
    return {
      ...this.standardBusinessData,
      ...data
    };
  }

  /**
   * Validate business data format
   */
  validateBusinessData(data: BusinessNAPData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!data.name || data.name.trim().length === 0) {
      errors.push('Business name is required');
    }
    
    if (!data.phone || !/^\(\d{3}\) \d{3}-\d{4}$/.test(data.phone)) {
      errors.push('Phone number must be in format (XXX) XXX-XXXX');
    }
    
    if (!data.website || !data.website.startsWith('https://')) {
      errors.push('Website must be a valid HTTPS URL');
    }
    
    if (!data.address.city || !data.address.state || !data.address.zipCode) {
      errors.push('Complete address is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Export singleton instance
export const napAuditService = NAPAuditService.getInstance(); 