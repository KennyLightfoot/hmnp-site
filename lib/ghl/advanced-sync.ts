/**
 * GHL Advanced Sync System - Phase 3-A Implementation
 * Houston Mobile Notary Pros
 * 
 * Features:
 * - Bidirectional contact synchronization with conflict resolution
 * - Advanced lead scoring algorithm with ML-style weighting
 * - Intelligent nurture campaign triggers
 * - Commission calculation system integration
 * - Real-time conflict detection and resolution
 */

import { PrismaClient } from '@prisma/client';
import * as ghl from './api';
import { logger } from '@/lib/logging/logger';

const prisma = new PrismaClient();

// Advanced Lead Scoring Configuration
interface LeadScoringWeights {
  demographics: {
    hasEmail: number;
    hasPhone: number;
    hasAddress: number;
    hasName: number;
  };
  engagement: {
    formSubmissions: number;
    websiteVisits: number;
    emailOpens: number;
    phoneAnswered: number;
  };
  intent: {
    serviceInquiry: number;
    priceInquiry: number;
    immediateBooking: number;
    specificService: number;
  };
  source: {
    organicSearch: number;
    paidAds: number;
    referral: number;
    directTraffic: number;
  };
  behavioral: {
    timeOnSite: number;
    pagesViewed: number;
    downloadedContent: number;
    socialEngagement: number;
  };
}

const LEAD_SCORING_WEIGHTS: LeadScoringWeights = {
  demographics: {
    hasEmail: 15,
    hasPhone: 20,
    hasAddress: 10,
    hasName: 5
  },
  engagement: {
    formSubmissions: 25,
    websiteVisits: 8,
    emailOpens: 12,
    phoneAnswered: 30
  },
  intent: {
    serviceInquiry: 35,
    priceInquiry: 20,
    immediateBooking: 50,
    specificService: 15
  },
  source: {
    organicSearch: 12,
    paidAds: 18,
    referral: 25,
    directTraffic: 8
  },
  behavioral: {
    timeOnSite: 5,
    pagesViewed: 3,
    downloadedContent: 15,
    socialEngagement: 8
  }
};

// Lead Quality Tiers
const LEAD_QUALITY_TIERS = {
  HOT: { min: 80, max: 100 },
  WARM: { min: 60, max: 79 },
  QUALIFIED: { min: 40, max: 59 },
  NURTURE: { min: 20, max: 39 },
  COLD: { min: 0, max: 19 }
};

// Nurture Campaign Configuration
const NURTURE_CAMPAIGNS = {
  HOT_LEAD_IMMEDIATE: {
    trigger: 'lead_score_80_plus',
    workflowId: 'hot-lead-immediate-response',
    priority: 'URGENT',
    responseTime: 5 // minutes
  },
  WARM_LEAD_FOLLOWUP: {
    trigger: 'lead_score_60_79',
    workflowId: 'warm-lead-24hr-followup',
    priority: 'HIGH',
    responseTime: 60 // minutes
  },
  QUALIFIED_NURTURE: {
    trigger: 'lead_score_40_59',
    workflowId: 'qualified-lead-nurture-sequence',
    priority: 'MEDIUM',
    responseTime: 1440 // 24 hours
  },
  NURTURE_DRIP: {
    trigger: 'lead_score_20_39',
    workflowId: 'nurture-drip-campaign',
    priority: 'LOW',
    responseTime: 4320 // 72 hours
  },
  COLD_REACTIVATION: {
    trigger: 'lead_score_under_20',
    workflowId: 'cold-lead-reactivation',
    priority: 'MINIMAL',
    responseTime: 10080 // 1 week
  }
};

export interface ContactSyncResult {
  success: boolean;
  action: 'created' | 'updated' | 'conflict_resolved' | 'skipped';
  contactId: string;
  conflicts?: string[];
  leadScore?: number;
  campaignTriggered?: string;
}

export interface ConflictResolution {
  field: string;
  localValue: any;
  ghlValue: any;
  resolvedValue: any;
  resolutionStrategy: 'local_wins' | 'ghl_wins' | 'merge' | 'manual_review';
}

/**
 * Advanced Lead Scoring Algorithm
 */
export async function calculateAdvancedLeadScore(contactId: string, additionalData?: any): Promise<number> {
  try {
    let totalScore = 0;
    const scoringDetails: any = {};

    // Get contact from GHL
    const ghlContact = await ghl.findContactByEmail(additionalData?.email);
    if (!ghlContact && !contactId) {
      throw new Error('Contact not found');
    }

    const contact = ghlContact || await ghl.getContact(contactId);
    const customFields = contact.customField || {};

    // Demographics Scoring
    let demoScore = 0;
    if (contact.email) demoScore += LEAD_SCORING_WEIGHTS.demographics.hasEmail;
    if (contact.phone) demoScore += LEAD_SCORING_WEIGHTS.demographics.hasPhone;
    if (contact.address1 || contact.city) demoScore += LEAD_SCORING_WEIGHTS.demographics.hasAddress;
    if (contact.firstName || contact.lastName) demoScore += LEAD_SCORING_WEIGHTS.demographics.hasName;
    scoringDetails.demographics = demoScore;
    totalScore += demoScore;

    // Engagement Scoring
    let engagementScore = 0;
    const formSubmissions = parseInt(customFields.cf_form_submissions || '0');
    const websiteVisits = parseInt(customFields.cf_website_visits || '0');
    const emailOpens = parseInt(customFields.cf_email_opens || '0');
    const phoneAnswered = customFields.cf_phone_answered === 'true' ? 1 : 0;

    engagementScore += Math.min(formSubmissions * LEAD_SCORING_WEIGHTS.engagement.formSubmissions, 50);
    engagementScore += Math.min(websiteVisits * LEAD_SCORING_WEIGHTS.engagement.websiteVisits, 40);
    engagementScore += Math.min(emailOpens * LEAD_SCORING_WEIGHTS.engagement.emailOpens, 36);
    engagementScore += phoneAnswered * LEAD_SCORING_WEIGHTS.engagement.phoneAnswered;
    scoringDetails.engagement = engagementScore;
    totalScore += engagementScore;

    // Intent Scoring
    let intentScore = 0;
    const hasServiceInquiry = customFields.cf_service_inquiry === 'true';
    const hasPriceInquiry = customFields.cf_price_inquiry === 'true';
    const hasImmediateBooking = customFields.cf_immediate_booking === 'true';
    const hasSpecificService = !!customFields.cf_service_type;

    if (hasServiceInquiry) intentScore += LEAD_SCORING_WEIGHTS.intent.serviceInquiry;
    if (hasPriceInquiry) intentScore += LEAD_SCORING_WEIGHTS.intent.priceInquiry;
    if (hasImmediateBooking) intentScore += LEAD_SCORING_WEIGHTS.intent.immediateBooking;
    if (hasSpecificService) intentScore += LEAD_SCORING_WEIGHTS.intent.specificService;
    scoringDetails.intent = intentScore;
    totalScore += intentScore;

    // Source Scoring
    let sourceScore = 0;
    const source = contact.source || customFields.cf_lead_source || '';
    if (source.includes('organic') || source.includes('google_organic')) {
      sourceScore += LEAD_SCORING_WEIGHTS.source.organicSearch;
    } else if (source.includes('ads') || source.includes('paid')) {
      sourceScore += LEAD_SCORING_WEIGHTS.source.paidAds;
    } else if (source.includes('referral')) {
      sourceScore += LEAD_SCORING_WEIGHTS.source.referral;
    } else if (source.includes('direct')) {
      sourceScore += LEAD_SCORING_WEIGHTS.source.directTraffic;
    }
    scoringDetails.source = sourceScore;
    totalScore += sourceScore;

    // Behavioral Scoring
    let behavioralScore = 0;
    const timeOnSite = parseInt(customFields.cf_time_on_site || '0');
    const pagesViewed = parseInt(customFields.cf_pages_viewed || '0');
    const downloadedContent = customFields.cf_downloaded_content === 'true' ? 1 : 0;
    const socialEngagement = parseInt(customFields.cf_social_engagement || '0');

    behavioralScore += Math.min(timeOnSite / 60 * LEAD_SCORING_WEIGHTS.behavioral.timeOnSite, 20);
    behavioralScore += Math.min(pagesViewed * LEAD_SCORING_WEIGHTS.behavioral.pagesViewed, 15);
    behavioralScore += downloadedContent * LEAD_SCORING_WEIGHTS.behavioral.downloadedContent;
    behavioralScore += Math.min(socialEngagement * LEAD_SCORING_WEIGHTS.behavioral.socialEngagement, 24);
    scoringDetails.behavioral = behavioralScore;
    totalScore += behavioralScore;

    // Cap the score at 100
    const finalScore = Math.min(Math.round(totalScore), 100);

    // Update the lead score in GHL
    await ghl.updateContactCustomFields(contact.id, {
      cf_lead_score: finalScore.toString(),
      cf_lead_score_breakdown: JSON.stringify(scoringDetails),
      cf_last_score_update: new Date().toISOString()
    });

    logger.info('Advanced lead score calculated', {
      contactId: contact.id,
      finalScore,
      breakdown: scoringDetails
    });

    return finalScore;

  } catch (error) {
    logger.error('Error calculating advanced lead score', { contactId, error });
    throw error;
  }
}

/**
 * Determine Lead Quality Tier
 */
export function getLeadQualityTier(score: number): keyof typeof LEAD_QUALITY_TIERS {
  for (const [tier, range] of Object.entries(LEAD_QUALITY_TIERS)) {
    if (score >= range.min && score <= range.max) {
      return tier as keyof typeof LEAD_QUALITY_TIERS;
    }
  }
  return 'COLD';
}

/**
 * Advanced Nurture Campaign Trigger
 */
export async function triggerNurtureCampaign(contactId: string, leadScore: number, context?: any): Promise<void> {
  try {
    const tier = getLeadQualityTier(leadScore);
    let campaign;

    // Determine appropriate campaign
    if (leadScore >= 80) {
      campaign = NURTURE_CAMPAIGNS.HOT_LEAD_IMMEDIATE;
    } else if (leadScore >= 60) {
      campaign = NURTURE_CAMPAIGNS.WARM_LEAD_FOLLOWUP;
    } else if (leadScore >= 40) {
      campaign = NURTURE_CAMPAIGNS.QUALIFIED_NURTURE;
    } else if (leadScore >= 20) {
      campaign = NURTURE_CAMPAIGNS.NURTURE_DRIP;
    } else {
      campaign = NURTURE_CAMPAIGNS.COLD_REACTIVATION;
    }

    // Add appropriate tags
    const tags = [
      `lead_score:${leadScore}`,
      `lead_tier:${tier}`,
      `campaign:${campaign.trigger}`,
      `priority:${campaign.priority.toLowerCase()}`
    ];

    await ghl.addTagsToContact(contactId, tags);

    // Update custom fields with campaign info
    await ghl.updateContactCustomFields(contactId, {
      cf_current_campaign: campaign.trigger,
      cf_campaign_priority: campaign.priority,
      cf_expected_response_time: campaign.responseTime.toString(),
      cf_campaign_triggered_at: new Date().toISOString()
    });

    // Trigger the GHL workflow
    await ghl.triggerWorkflow(contactId, campaign.workflowId);

    // Log to database for tracking
    await prisma.notaryJournal.create({
      data: {
        notaryId: 'system',
        action: 'CAMPAIGN_TRIGGERED',
        details: JSON.stringify({
          contactId,
          leadScore,
          tier,
          campaign: campaign.trigger,
          priority: campaign.priority,
          workflowId: campaign.workflowId
        }),
        createdAt: new Date()
      }
    });

    logger.info('Nurture campaign triggered', {
      contactId,
      leadScore,
      tier,
      campaign: campaign.trigger,
      workflowId: campaign.workflowId
    });

  } catch (error) {
    logger.error('Error triggering nurture campaign', { contactId, leadScore, error });
    throw error;
  }
}

/**
 * Bidirectional Contact Synchronization with Conflict Resolution
 */
export async function bidirectionalContactSync(
  contactId: string,
  localData?: any,
  resolutionStrategy: 'local_wins' | 'ghl_wins' | 'merge' | 'smart_merge' = 'smart_merge'
): Promise<ContactSyncResult> {
  try {
    // Get contact from both systems
    const ghlContact = await ghl.getContact(contactId);
    const localContact = localData || await prisma.booking.findFirst({
      where: { ghlContactId: contactId },
      orderBy: { updatedAt: 'desc' }
    });

    if (!ghlContact && !localContact) {
      throw new Error('Contact not found in either system');
    }

    const conflicts: ConflictResolution[] = [];
    let resolvedData: any = {};

    // Define critical fields for comparison
    const criticalFields = ['email', 'phone', 'firstName', 'lastName', 'address1', 'city', 'state', 'postalCode'];

    // Detect conflicts
    for (const field of criticalFields) {
      const ghlValue = ghlContact?.[field];
      const localValue = localContact?.[field] || localContact?.customerEmail || localContact?.customerPhone;

      if (ghlValue && localValue && ghlValue !== localValue) {
        const resolution = await resolveFieldConflict(field, localValue, ghlValue, resolutionStrategy);
        conflicts.push(resolution);
        resolvedData[field] = resolution.resolvedValue;
      } else {
        resolvedData[field] = ghlValue || localValue;
      }
    }

    // Handle custom fields synchronization
    const customFieldMapping = {
      'cf_booking_count': 'totalBookings',
      'cf_total_revenue': 'totalRevenue',
      'cf_last_service_date': 'lastServiceDate',
      'cf_preferred_service': 'preferredService',
      'cf_communication_preference': 'communicationPreference'
    };

    for (const [ghlField, localField] of Object.entries(customFieldMapping)) {
      if (localContact?.[localField]) {
        resolvedData.customFields = resolvedData.customFields || {};
        resolvedData.customFields[ghlField] = localContact[localField].toString();
      }
    }

    // Apply updates to GHL
    if (Object.keys(resolvedData).length > 0) {
      await ghl.updateContact({ id: contactId, ...resolvedData });
    }

    // Calculate and update lead score
    const leadScore = await calculateAdvancedLeadScore(contactId, resolvedData);

    // Trigger nurture campaign if needed
    await triggerNurtureCampaign(contactId, leadScore);

    // Update local database with GHL data
    if (localContact) {
      await prisma.booking.updateMany({
        where: { ghlContactId: contactId },
        data: {
          ghlSyncStatus: 'SYNCED',
          ghlLastSync: new Date(),
          updatedAt: new Date()
        }
      });
    }

    return {
      success: true,
      action: conflicts.length > 0 ? 'conflict_resolved' : 'updated',
      contactId,
      conflicts: conflicts.map(c => `${c.field}: ${c.resolutionStrategy}`),
      leadScore,
      campaignTriggered: getLeadQualityTier(leadScore)
    };

  } catch (error) {
    logger.error('Error in bidirectional contact sync', { contactId, error });
    throw error;
  }
}

/**
 * Resolve individual field conflicts using smart logic
 */
async function resolveFieldConflict(
  field: string,
  localValue: any,
  ghlValue: any,
  strategy: string
): Promise<ConflictResolution> {
  let resolvedValue: any;
  let resolutionStrategy: ConflictResolution['resolutionStrategy'];

  switch (strategy) {
    case 'local_wins':
      resolvedValue = localValue;
      resolutionStrategy = 'local_wins';
      break;
    
    case 'ghl_wins':
      resolvedValue = ghlValue;
      resolutionStrategy = 'ghl_wins';
      break;
    
    case 'merge':
      // Simple merge for text fields
      if (typeof localValue === 'string' && typeof ghlValue === 'string') {
        resolvedValue = `${localValue} | ${ghlValue}`;
        resolutionStrategy = 'merge';
      } else {
        resolvedValue = ghlValue; // Default to GHL for non-string
        resolutionStrategy = 'ghl_wins';
      }
      break;
    
    case 'smart_merge':
    default:
      // Smart resolution based on field type and data quality
      if (field === 'email') {
        // Prefer the email with more complete format
        resolvedValue = localValue.includes('@') && localValue.includes('.') ? localValue : ghlValue;
        resolutionStrategy = 'local_wins';
      } else if (field === 'phone') {
        // Prefer longer phone number (more complete)
        resolvedValue = localValue.length > ghlValue.length ? localValue : ghlValue;
        resolutionStrategy = localValue.length > ghlValue.length ? 'local_wins' : 'ghl_wins';
      } else if (field.includes('name')) {
        // Prefer capitalized names
        const localCap = localValue.charAt(0).toUpperCase() + localValue.slice(1).toLowerCase();
        const ghlCap = ghlValue.charAt(0).toUpperCase() + ghlValue.slice(1).toLowerCase();
        resolvedValue = localCap.length > ghlCap.length ? localCap : ghlCap;
        resolutionStrategy = 'merge';
      } else {
        // Default to most recent (GHL)
        resolvedValue = ghlValue;
        resolutionStrategy = 'ghl_wins';
      }
      break;
  }

  return {
    field,
    localValue,
    ghlValue,
    resolvedValue,
    resolutionStrategy
  };
}

/**
 * Commission Integration with GHL
 */
export async function syncCommissionDataToGHL(bookingId: string): Promise<void> {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        service: true,
        notaryAssignment: {
          include: {
            notary: true
          }
        }
      }
    });

    if (!booking?.ghlContactId) {
      throw new Error('Booking or GHL contact ID not found');
    }

    // Calculate commission details
    const totalAmount = booking.totalAmount || 0;
    const notary = booking.notaryAssignment?.notary;
    const commissionRate = notary?.commissionRate || 0.7; // Default 70%
    const commissionAmount = totalAmount * commissionRate;
    const companyFee = totalAmount - commissionAmount;

    // Update GHL with commission data
    await ghl.updateContactCustomFields(booking.ghlContactId, {
      cf_booking_total: totalAmount.toString(),
      cf_notary_commission: commissionAmount.toString(),
      cf_company_fee: companyFee.toString(),
      cf_commission_rate: (commissionRate * 100).toString() + '%',
      cf_notary_name: notary ? `${notary.firstName} ${notary.lastName}` : 'Unassigned',
      cf_payment_status: booking.paymentStatus || 'pending',
      cf_service_completed: booking.status === 'completed' ? 'Yes' : 'No'
    });

    // Add commission tracking tags
    const tags = [
      `commission:${Math.round(commissionAmount)}`,
      `notary:${notary?.id || 'unassigned'}`,
      `service:${booking.service?.name.replace(/\s+/g, '_') || 'standard'}`
    ];

    await ghl.addTagsToContact(booking.ghlContactId, tags);

    logger.info('Commission data synced to GHL', {
      bookingId,
      contactId: booking.ghlContactId,
      totalAmount,
      commissionAmount,
      companyFee
    });

  } catch (error) {
    logger.error('Error syncing commission data to GHL', { bookingId, error });
    throw error;
  }
}

/**
 * Comprehensive Lead Management Workflow
 */
export async function processCompleteLeadWorkflow(contactData: any): Promise<ContactSyncResult> {
  try {
    // Step 1: Create or update contact with bidirectional sync
    const syncResult = await bidirectionalContactSync(
      contactData.id,
      contactData,
      'smart_merge'
    );

    // Step 2: Calculate advanced lead score
    const leadScore = await calculateAdvancedLeadScore(contactData.id, contactData);

    // Step 3: Trigger appropriate nurture campaign
    await triggerNurtureCampaign(contactData.id, leadScore, contactData);

    // Step 4: Set up follow-up tasks based on lead tier
    const tier = getLeadQualityTier(leadScore);
    if (tier === 'HOT') {
      // Create immediate follow-up task
      await ghl.createTask(
        contactData.id,
        'HOT LEAD - Immediate Response Required',
        `Lead Score: ${leadScore}/100 - Contact within 5 minutes`,
        new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
        'urgent'
      );
    }

    return {
      ...syncResult,
      leadScore,
      campaignTriggered: tier
    };

  } catch (error) {
    logger.error('Error in complete lead workflow', { contactData, error });
    throw error;
  }
}

export default {
  calculateAdvancedLeadScore,
  bidirectionalContactSync,
  triggerNurtureCampaign,
  syncCommissionDataToGHL,
  processCompleteLeadWorkflow,
  getLeadQualityTier
}; 