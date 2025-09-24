/**
 * Business Rules Engine
 * Houston Mobile Notary Pros - Core Business Logic Enforcement
 * 
 * This engine enforces all business rules and integrates seamlessly with existing
 * systems: PricingEngine, UnifiedDistanceService, and GHL automation.
 */

import { logger } from '../logger';
import { getErrorMessage } from '@/lib/utils/error-utils';
import { UnifiedDistanceService } from '../maps/unified-distance-service';
import { PricingEngine } from '../pricing-engine';
import * as ghl from '../ghl/management';
import { 
  BUSINESS_RULES_CONFIG, 
  GHL_INTEGRATION_MAPPING,
  BusinessRuleResult,
  BusinessRuleContext,
  BusinessRuleType,
  ServiceAreaValidation,
  DocumentLimitsValidation,
  PricingValidation,
  CancellationValidation,
  ServiceAreaValidationSchema,
  DocumentLimitsValidationSchema,
  PricingValidationSchema,
  CancellationValidationSchema
} from './config';

// ============================================================================
// 🎯 CORE BUSINESS RULES ENGINE
// ============================================================================

export class BusinessRulesEngine {
  private readonly requestId: string;
  private readonly context: BusinessRuleContext;

  constructor(context: Partial<BusinessRuleContext> = {}) {
    this.requestId = context.requestId || `br_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.context = {
      requestId: this.requestId,
      timestamp: new Date(),
      ...context
    };

    logger.info('BusinessRulesEngine initialized', {
      requestId: this.requestId,
      hasBooking: !!context.booking,
      hasGhlContactId: !!context.ghlContactId
    });
  }

  // ============================================================================
  // 🚀 MAIN VALIDATION METHODS
  // ============================================================================

  /**
   * Validate all business rules for a booking
   */
  async validateAll(params: {
    serviceType: string;
    location?: { address: string; coordinates?: { lat: number; lng: number } };
    documentCount: number;
    documentTypes?: string[];
    customerType?: string;
    scheduledDateTime?: Date;
    pricing?: any;
  }): Promise<{
    isValid: boolean;
    serviceArea: BusinessRuleResult;
    documentLimits: BusinessRuleResult;
    pricing: BusinessRuleResult;
    violations: string[];
    ghlActions: {
      tags: string[];
      customFields: Record<string, any>;
      workflows: string[];
    };
  }> {
    const startTime = Date.now();
    
    try {
      logger.info('Starting comprehensive business rules validation', {
        requestId: this.requestId,
        serviceType: params.serviceType,
        documentCount: params.documentCount,
        hasLocation: !!params.location
      });

      // 1. Service Area Validation
      const serviceAreaResult = params.location 
        ? await this.validateServiceArea({
            distance: 0, // Will be calculated
            address: params.location.address,
            serviceType: params.serviceType,
            coordinates: params.location.coordinates
          })
        : this.createValidResult('serviceArea');

      // 2. Document Limits Validation
      const documentLimitsResult = await this.validateDocumentLimits({
        serviceType: params.serviceType,
        documentCount: params.documentCount,
        documentTypes: params.documentTypes,
        hasRestrictedDocuments: this.checkForRestrictedDocuments(params.documentTypes)
      });

      // 3. Pricing Validation (if pricing data provided)
      const pricingResult = params.pricing 
        ? await this.validatePricing(params.pricing)
        : this.createValidResult('pricing');

      // Aggregate results
      const allViolations = [
        ...serviceAreaResult.violations,
        ...documentLimitsResult.violations,
        ...pricingResult.violations
      ];

      const aggregatedGhlActions = this.aggregateGhlActions([
        serviceAreaResult,
        documentLimitsResult,
        pricingResult
      ]);

      const duration = Date.now() - startTime;
      const isValid = allViolations.length === 0;

      logger.info('Business rules validation completed', {
        requestId: this.requestId,
        isValid,
        violationCount: allViolations.length,
        duration,
        serviceType: params.serviceType
      });

      return {
        isValid,
        serviceArea: serviceAreaResult,
        documentLimits: documentLimitsResult,
        pricing: pricingResult,
        violations: allViolations,
        ghlActions: aggregatedGhlActions
      };

    } catch (error) {
      logger.error('Business rules validation failed', {
        requestId: this.requestId,
        error: error instanceof Error ? getErrorMessage(error) : String(error),
        serviceType: params.serviceType
      });
      throw error;
    }
  }

  // ============================================================================
  // 📍 SERVICE AREA VALIDATION
  // ============================================================================

  /**
   * Validate service area business rules
   */
  async validateServiceArea(params: ServiceAreaValidation): Promise<BusinessRuleResult> {
    try {
      // Validate input
      const validatedParams = ServiceAreaValidationSchema.parse(params);
      
      logger.info('Validating service area rules', {
        requestId: this.requestId,
        serviceType: validatedParams.serviceType,
        address: validatedParams.address
      });

      // Calculate distance using existing UnifiedDistanceService
      const distanceResult = await UnifiedDistanceService.calculateDistance(
        validatedParams.address,
        validatedParams.serviceType
      );

      const distance = distanceResult.distance.miles;
      const rules = BUSINESS_RULES_CONFIG.serviceArea;
      const violations: string[] = [];
      const recommendations: string[] = [];

      // Rule 1: Maximum distance check
      if (distance > rules.maxServiceRadius) {
        violations.push(`Distance of ${distance.toFixed(1)} miles exceeds maximum service area of ${rules.maxServiceRadius} miles`);
        recommendations.push('Consider contacting us directly for special arrangements');
      }

      // Rule 2: Classify service zone for GHL tagging
      const zone = this.classifyServiceZone(distance);
      
      // Rule 3: Extended service availability check
      if (distance > 50 && distance <= rules.maxServiceRadius) {
        // Extended service is available within max radius
        // No additional restrictions needed
      }

      // Generate GHL actions
      const ghlActions = {
        tags: [zone.tag],
        customFields: {
          [GHL_INTEGRATION_MAPPING.serviceArea.customFields.distance]: distance,
          [GHL_INTEGRATION_MAPPING.serviceArea.customFields.travelFee]: distanceResult.travelFee,
          [GHL_INTEGRATION_MAPPING.serviceArea.customFields.serviceZone]: zone.name
        },
        workflows: distance > 50 ? [GHL_INTEGRATION_MAPPING.serviceArea.workflows.extendedService] : []
      };

      // Add travel fee information to recommendations
      if (distanceResult.travelFee > 0) {
        recommendations.push(`Travel fee of $${distanceResult.travelFee.toFixed(2)} applies for distances beyond free radius`);
      }

      return {
        isValid: violations.length === 0,
        ruleType: 'serviceArea',
        violations,
        recommendations,
        ghlActions
      };

    } catch (error) {
      logger.error('Service area validation failed', {
        requestId: this.requestId,
        error: error instanceof Error ? getErrorMessage(error) : String(error)
      });
      throw error;
    }
  }

  // ============================================================================
  // 📄 DOCUMENT LIMITS VALIDATION
  // ============================================================================

  /**
   * Validate document limits business rules
   */
  async validateDocumentLimits(params: DocumentLimitsValidation): Promise<BusinessRuleResult> {
    try {
      // Validate input
      const validatedParams = DocumentLimitsValidationSchema.parse(params);
      
      logger.info('Validating document limits rules', {
        requestId: this.requestId,
        serviceType: validatedParams.serviceType,
        documentCount: validatedParams.documentCount
      });

      const rules = BUSINESS_RULES_CONFIG.documentLimits;
      const serviceLimit = rules.serviceLimits[validatedParams.serviceType as keyof typeof rules.serviceLimits];
      const violations: string[] = [];
      const recommendations: string[] = [];
      const tags: string[] = [];
      const workflows: string[] = [];

      if (!serviceLimit) {
        violations.push(`Unknown service type: ${validatedParams.serviceType}`);
        return this.createErrorResult('documentLimits', violations);
      }

      // Rule 1: Check for restricted documents (HELOC)
      if (validatedParams.hasRestrictedDocuments || 
          validatedParams.documentTypes?.some(type => rules.restrictedDocuments.includes(type))) {
        violations.push('HELOC documents require office space and cannot be processed');
        recommendations.push('Please contact us to discuss alternative arrangements');
        tags.push(GHL_INTEGRATION_MAPPING.documentLimits.tags.restrictedType);
        workflows.push(GHL_INTEGRATION_MAPPING.documentLimits.workflows.helocRestriction);
      }

      // Rule 2: Check document count limits
      const isOverLimit = validatedParams.documentCount > serviceLimit.base;
      const extraDocuments = Math.max(0, validatedParams.documentCount - serviceLimit.base);
      const extraDocumentFees = extraDocuments * serviceLimit.extraFee;

      if (isOverLimit && serviceLimit.extraFee > 0) {
        recommendations.push(`${extraDocuments} additional document${extraDocuments > 1 ? 's' : ''} will incur extra fees of $${extraDocumentFees.toFixed(2)}`);
        tags.push(GHL_INTEGRATION_MAPPING.documentLimits.tags.overLimit);
        if (extraDocumentFees > 0) {
          tags.push(GHL_INTEGRATION_MAPPING.documentLimits.tags.extraFeesApplied);
        }
      } else {
        tags.push(GHL_INTEGRATION_MAPPING.documentLimits.tags.underLimit);
      }

      // Generate GHL actions
      const ghlActions = {
        tags,
        customFields: {
          [GHL_INTEGRATION_MAPPING.documentLimits.customFields.documentCount]: validatedParams.documentCount,
          [GHL_INTEGRATION_MAPPING.documentLimits.customFields.extraDocFees]: extraDocumentFees,
          [GHL_INTEGRATION_MAPPING.documentLimits.customFields.documentType]: validatedParams.documentTypes?.join(', ') || 'Not specified'
        },
        workflows
      };

      return {
        isValid: violations.length === 0,
        ruleType: 'documentLimits',
        violations,
        recommendations,
        ghlActions
      };

    } catch (error) {
      logger.error('Document limits validation failed', {
        requestId: this.requestId,
        error: error instanceof Error ? getErrorMessage(error) : String(error)
      });
      throw error;
    }
  }

  // ============================================================================
  // 💰 PRICING VALIDATION
  // ============================================================================

  /**
   * Validate pricing transparency business rules
   */
  async validatePricing(params: PricingValidation): Promise<BusinessRuleResult> {
    try {
      // Validate input
      const validatedParams = PricingValidationSchema.parse(params);
      
      logger.info('Validating pricing rules', {
        requestId: this.requestId,
        serviceType: validatedParams.serviceType,
        totalPrice: validatedParams.totalPrice
      });

      const rules = BUSINESS_RULES_CONFIG.pricingTransparency;
      const violations: string[] = [];
      const recommendations: string[] = [];
      const tags: string[] = [GHL_INTEGRATION_MAPPING.pricing.tags.baseService];

      // Rule 1: Fee disclosure validation
      if (!rules.feeDisclosure.showUpfront) {
        violations.push('All fees must be disclosed upfront');
      }

      // Rule 2: Pricing breakdown validation
      const breakdown = {
        baseService: validatedParams.basePrice,
        travelFee: validatedParams.travelFee,
        extraDocumentFees: validatedParams.extraDocumentFees,
        discounts: -validatedParams.discounts,
        totalPrice: validatedParams.totalPrice
      };

      // Verify calculation accuracy
      const calculatedTotal = breakdown.baseService + breakdown.travelFee + breakdown.extraDocumentFees - validatedParams.discounts;
      if (Math.abs(calculatedTotal - validatedParams.totalPrice) > 0.01) {
        violations.push('Pricing calculation mismatch detected');
      }

      // Add appropriate tags
      if (validatedParams.travelFee > 0) {
        tags.push(GHL_INTEGRATION_MAPPING.pricing.tags.travelFeesApplied);
      }
      if (validatedParams.extraDocumentFees > 0) {
        tags.push(GHL_INTEGRATION_MAPPING.pricing.tags.extraDocFees);
      }
      if (validatedParams.discounts > 0) {
        tags.push(GHL_INTEGRATION_MAPPING.pricing.tags.discountApplied);
      }

      // Generate GHL actions
      const ghlActions = {
        tags,
        customFields: {
          [GHL_INTEGRATION_MAPPING.pricing.customFields.baseServiceFee]: validatedParams.basePrice,
          [GHL_INTEGRATION_MAPPING.pricing.customFields.travelFeeAmount]: validatedParams.travelFee,
          [GHL_INTEGRATION_MAPPING.pricing.customFields.extraDocFees]: validatedParams.extraDocumentFees,
          [GHL_INTEGRATION_MAPPING.pricing.customFields.discountAmount]: validatedParams.discounts,
          [GHL_INTEGRATION_MAPPING.pricing.customFields.finalTotal]: validatedParams.totalPrice,
          [GHL_INTEGRATION_MAPPING.pricing.customFields.feeBreakdown]: JSON.stringify(breakdown)
        },
        workflows: [GHL_INTEGRATION_MAPPING.pricing.workflows.pricingCalculated]
      };

      return {
        isValid: violations.length === 0,
        ruleType: 'pricing',
        violations,
        recommendations,
        ghlActions
      };

    } catch (error) {
      logger.error('Pricing validation failed', {
        requestId: this.requestId,
        error: error instanceof Error ? getErrorMessage(error) : String(error)
      });
      throw error;
    }
  }

  // ============================================================================
  // ❌ CANCELLATION POLICY VALIDATION
  // ============================================================================

  /**
   * Validate cancellation policy business rules
   */
  async validateCancellation(params: CancellationValidation): Promise<BusinessRuleResult & {
    refundEligibility: {
      amount: string;
      reason: string;
    };
  }> {
    try {
      // Validate input
      const validatedParams = CancellationValidationSchema.parse(params);
      
      logger.info('Validating cancellation rules', {
        requestId: this.requestId,
        bookingId: validatedParams.bookingId,
        reason: validatedParams.reason
      });

      const rules = BUSINESS_RULES_CONFIG.cancellationPolicy;
      const violations: string[] = [];
      const recommendations: string[] = [];
      let refundTag: string;
      let workflowId: string;
      let refundAmount: string;
      let refundReason: string;

      // Calculate hours until appointment
      const hoursUntilAppointment = (validatedParams.scheduledDateTime.getTime() - validatedParams.requestedAt.getTime()) / (1000 * 60 * 60);

      // Rule 1: Weather exception handling
      if (validatedParams.isWeatherRelated && rules.weatherPolicy === 'no_charge') {
        refundAmount = 'full_deposit';
        refundReason = 'Weather exception - full refund approved';
        refundTag = GHL_INTEGRATION_MAPPING.cancellation.tags.weatherException;
        workflowId = GHL_INTEGRATION_MAPPING.cancellation.workflows.weatherCancellation;
        recommendations.push('Full refund approved due to weather conditions');
      }
      // Rule 2: Standard cancellation window
      else if (hoursUntilAppointment >= rules.policy.fullRefundWindow) {
        refundAmount = 'full_deposit';
        refundReason = `Cancelled with ${hoursUntilAppointment.toFixed(1)} hours notice`;
        refundTag = GHL_INTEGRATION_MAPPING.cancellation.tags.fullRefund;
        workflowId = GHL_INTEGRATION_MAPPING.cancellation.workflows.cancellationRequest;
        recommendations.push(`Full refund approved - cancelled with sufficient notice (${rules.policy.fullRefundWindow}+ hours required)`);
      }
      // Rule 3: Late cancellation or no-show
      else {
        refundAmount = '0';
        refundReason = hoursUntilAppointment < 0 ? 'No-show penalty' : `Late cancellation (${hoursUntilAppointment.toFixed(1)} hours notice)`;
        refundTag = hoursUntilAppointment < 0 
          ? GHL_INTEGRATION_MAPPING.cancellation.tags.noShow
          : GHL_INTEGRATION_MAPPING.cancellation.tags.noRefund;
        workflowId = hoursUntilAppointment < 0
          ? GHL_INTEGRATION_MAPPING.cancellation.workflows.noShowRecovery
          : GHL_INTEGRATION_MAPPING.cancellation.workflows.cancellationRequest;
        violations.push(`Cancellation with less than ${rules.policy.fullRefundWindow} hours notice - deposit forfeited`);
      }

      // Generate GHL actions
      const ghlActions = {
        tags: [refundTag],
        customFields: {
          [GHL_INTEGRATION_MAPPING.cancellation.customFields.cancellationReason]: validatedParams.reason,
          [GHL_INTEGRATION_MAPPING.cancellation.customFields.cancellationTime]: hoursUntilAppointment.toFixed(1),
          [GHL_INTEGRATION_MAPPING.cancellation.customFields.refundAmount]: refundAmount
        },
        workflows: [workflowId]
      };

      return {
        isValid: violations.length === 0,
        ruleType: 'cancellation',
        violations,
        recommendations,
        ghlActions,
        refundEligibility: {
          amount: refundAmount,
          reason: refundReason
        }
      };

    } catch (error) {
      logger.error('Cancellation validation failed', {
        requestId: this.requestId,
        error: error instanceof Error ? getErrorMessage(error) : String(error)
      });
      throw error;
    }
  }

  // ============================================================================
  // 🔗 GHL INTEGRATION METHODS
  // ============================================================================

  /**
   * Apply business rule results to GHL
   */
  async applyToGHL(results: BusinessRuleResult[], contactId?: string): Promise<void> {
    if (!contactId && !this.context.ghlContactId) {
      logger.warn('No GHL contact ID available for business rule application', {
        requestId: this.requestId
      });
      return;
    }

    const ghlContactId = contactId || this.context.ghlContactId!;
    const aggregatedActions = this.aggregateGhlActions(results);

    try {
      logger.info('Applying business rules to GHL', {
        requestId: this.requestId,
        contactId: ghlContactId,
        tagCount: aggregatedActions.tags.length,
        customFieldCount: Object.keys(aggregatedActions.customFields).length,
        workflowCount: aggregatedActions.workflows.length
      });

      // Apply tags
      if (aggregatedActions.tags.length > 0) {
        await ghl.addContactTags(ghlContactId, aggregatedActions.tags);
      }

      // Apply custom fields
      if (Object.keys(aggregatedActions.customFields).length > 0) {
        await ghl.updateContact(ghlContactId, {
          customFields: Object.entries(aggregatedActions.customFields).map(([id, value]) => ({
            id,
            field_value: value
          }))
        });
      }

      // Trigger workflows
      for (const workflowId of aggregatedActions.workflows) {
        await ghl.addContactToWorkflow(ghlContactId, workflowId);
      }

      logger.info('Business rules successfully applied to GHL', {
        requestId: this.requestId,
        contactId: ghlContactId
      });

    } catch (error) {
      logger.error('Failed to apply business rules to GHL', {
        requestId: this.requestId,
        contactId: ghlContactId,
        error: error instanceof Error ? getErrorMessage(error) : String(error)
      });
      throw error;
    }
  }

  // ============================================================================
  // 🛠️ HELPER METHODS
  // ============================================================================

  private classifyServiceZone(distance: number): { name: string; tag: string } {
    // Simple zone classification based on distance
    if (distance <= 30) {
      return { name: 'houston_metro', tag: 'houston_metro' };
    } else if (distance <= 50) {
      return { name: 'extended_range', tag: 'extended_range' };
    } else {
      return { name: 'maximum_range', tag: 'maximum_range' };
    }
  }

  private checkForRestrictedDocuments(documentTypes?: string[]): boolean {
    if (!documentTypes) return false;
    const restrictedDocs = BUSINESS_RULES_CONFIG.documentLimits.restrictedDocuments;
    return documentTypes.some(type => restrictedDocs.includes(type.toUpperCase()));
  }

  private aggregateGhlActions(results: BusinessRuleResult[]): {
    tags: string[];
    customFields: Record<string, any>;
    workflows: string[];
  } {
    const allTags = new Set<string>();
    const allCustomFields: Record<string, any> = {};
    const allWorkflows = new Set<string>();

    for (const result of results) {
      // Aggregate tags
      result.ghlActions.tags.forEach(tag => allTags.add(tag));
      
      // Aggregate custom fields
      Object.assign(allCustomFields, result.ghlActions.customFields);
      
      // Aggregate workflows
      result.ghlActions.workflows.forEach(workflow => allWorkflows.add(workflow));
    }

    return {
      tags: Array.from(allTags),
      customFields: allCustomFields,
      workflows: Array.from(allWorkflows)
    };
  }

  private createValidResult(ruleType: BusinessRuleType): BusinessRuleResult {
    return {
      isValid: true,
      ruleType,
      violations: [],
      recommendations: [],
      ghlActions: {
        tags: [],
        customFields: {},
        workflows: []
      }
    };
  }

  private createErrorResult(ruleType: BusinessRuleType, violations: string[]): BusinessRuleResult {
    return {
      isValid: false,
      ruleType,
      violations,
      recommendations: [],
      ghlActions: {
        tags: [],
        customFields: {},
        workflows: []
      }
    };
  }
}

// ============================================================================
// 🎯 FACTORY FUNCTIONS
// ============================================================================

/**
 * Create a new Business Rules Engine instance
 */
export function createBusinessRulesEngine(context?: Partial<BusinessRuleContext>): BusinessRulesEngine {
  return new BusinessRulesEngine(context);
}

/**
 * Quick validation function for simple use cases
 */
export async function validateBusinessRules(params: {
  serviceType: string;
  location?: { address: string; coordinates?: { lat: number; lng: number } };
  documentCount: number;
  documentTypes?: string[];
  customerType?: string;
  scheduledDateTime?: Date;
  pricing?: any;
  ghlContactId?: string;
}): Promise<{
  isValid: boolean;
  violations: string[];
  ghlActions: {
    tags: string[];
    customFields: Record<string, any>;
    workflows: string[];
  };
}> {
  const engine = createBusinessRulesEngine({
    ghlContactId: params.ghlContactId
  });

  const result = await engine.validateAll(params);
  
  return {
    isValid: result.isValid,
    violations: result.violations,
    ghlActions: result.ghlActions
  };
} 
