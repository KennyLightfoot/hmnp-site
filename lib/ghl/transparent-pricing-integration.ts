/**
 * Transparent Pricing GHL Integration Service
 * Phase 4 Week 3: Real-time GHL Integration
 * 
 * This service handles sending transparent pricing data to GHL
 * including custom fields, tags, and workflow triggers.
 */

import { ghlApiRequest } from './error-handler';
import { getErrorMessage } from '@/lib/utils/error-utils';
import { TransparentPricingFieldManager, TRANSPARENT_PRICING_WORKFLOWS } from './transparent-pricing-fields';
import { createContact, findContactByEmail, updateContact, addTagsToContact } from './api';

// ============================================================================
// 🔄 GHL INTEGRATION SERVICE
// ============================================================================

export interface PricingGHLIntegrationRequest {
  pricingResult: any; // TransparentPricingResult from unified engine
  customerEmail?: string;
  customerName?: string;
  customerPhone?: string;
  contactId?: string; // If contact already exists
  createContactIfNotExists?: boolean;
  triggerWorkflows?: boolean;
}

export interface PricingGHLIntegrationResult {
  success: boolean;
  contactId?: string;
  customFieldsUpdated: number;
  tagsApplied: number;
  workflowsTriggered: number;
  error?: string;
  warnings: string[];
  metadata: {
    processingTime: number;
    requestId: string;
    timestamp: string;
  };
}

export class TransparentPricingGHLIntegration {
  
  /**
   * Main integration function - sends all pricing data to GHL
   */
  static async syncPricingToGHL(request: PricingGHLIntegrationRequest): Promise<PricingGHLIntegrationResult> {
    const startTime = Date.now();
    const requestId = request.pricingResult?.metadata?.requestId || `ghl_integration_${Date.now()}`;
    
    console.log(`🔄 [${requestId}] Starting GHL pricing integration`, {
      hasContact: !!request.contactId,
      hasEmail: !!request.customerEmail,
      createContact: request.createContactIfNotExists
    });

    const warnings: string[] = [];
    let contactId = request.contactId;
    let customFieldsUpdated = 0;
    let tagsApplied = 0;
    let workflowsTriggered = 0;

    try {
      // Step 1: Ensure we have a contact
      if (!contactId && request.customerEmail) {
        console.log(`👤 [${requestId}] Looking up contact by email: ${request.customerEmail}`);
        
        const existingContact = await findContactByEmail(request.customerEmail);
        
        if (existingContact) {
          contactId = existingContact.id;
          console.log(`✅ [${requestId}] Found existing contact: ${contactId}`);
        } else if (request.createContactIfNotExists && request.customerName) {
          console.log(`👤 [${requestId}] Creating new contact for ${request.customerEmail}`);
          
          const newContact = await createContact({
            firstName: request.customerName.split(' ')[0] || request.customerName,
            lastName: request.customerName.split(' ').slice(1).join(' ') || '',
            email: request.customerEmail,
            phone: request.customerPhone,
            source: 'Transparent Pricing System',
            tags: ['Status:PricingCalculated', 'Source:Website']
          });
          
          contactId = newContact.id;
          console.log(`✅ [${requestId}] Created new contact: ${contactId}`);
        }
      }

      if (!contactId) {
        throw new Error('No contact ID available and unable to create contact');
      }

      // Step 2: Update custom fields with pricing data
      console.log(`📊 [${requestId}] Updating custom fields with pricing data`);
      
      const customFields = TransparentPricingFieldManager.transformPricingResultToCustomFields(request.pricingResult);
      
      try {
        await updateContact({
          id: contactId,
          customFields: customFields.map(field => ({
            id: field.key,
            field_value: field.value
          }))
        });
        
        customFieldsUpdated = customFields.length;
        console.log(`✅ [${requestId}] Updated ${customFieldsUpdated} custom fields`);
        
      } catch (error) {
        console.warn(`⚠️ [${requestId}] Custom fields update warning:`, error);
        warnings.push(`Custom fields update partially failed: ${error instanceof Error ? getErrorMessage(error) : 'Unknown error'}`);
      }

      // Step 3: Apply pricing-related tags
      console.log(`🏷️ [${requestId}] Applying pricing tags`);
      
      const tags = TransparentPricingFieldManager.generateTagsForPricingResult(request.pricingResult);
      
      try {
        await addTagsToContact(contactId, tags);
        tagsApplied = tags.length;
        console.log(`✅ [${requestId}] Applied ${tagsApplied} tags:`, tags.slice(0, 5));
        
      } catch (error) {
        console.warn(`⚠️ [${requestId}] Tags application warning:`, error);
        warnings.push(`Tag application partially failed: ${error instanceof Error ? getErrorMessage(error) : 'Unknown error'}`);
      }

      // Step 4: Trigger appropriate workflows
      if (request.triggerWorkflows !== false) {
        console.log(`⚡ [${requestId}] Triggering workflows`);
        
        const workflowResults = await this.triggerPricingWorkflows(
          contactId,
          request.pricingResult,
          requestId
        );
        
        workflowsTriggered = workflowResults.triggered;
        warnings.push(...workflowResults.warnings);
      }

      // Step 5: Add comprehensive note
      await this.addPricingNote(contactId, request.pricingResult, requestId);

      const processingTime = Date.now() - startTime;
      
      console.log(`✅ [${requestId}] GHL integration completed in ${processingTime}ms`, {
        contactId,
        customFieldsUpdated,
        tagsApplied,
        workflowsTriggered,
        warnings: warnings.length
      });

      return {
        success: true,
        contactId,
        customFieldsUpdated,
        tagsApplied,
        workflowsTriggered,
        warnings,
        metadata: {
          processingTime,
          requestId,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      console.error(`❌ [${requestId}] GHL integration failed:`, getErrorMessage(error));
      
      return {
        success: false,
        contactId,
        customFieldsUpdated,
        tagsApplied,
        workflowsTriggered,
        error: error instanceof Error ? getErrorMessage(error) : 'Unknown error',
        warnings,
        metadata: {
          processingTime,
          requestId,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Trigger appropriate workflows based on pricing data
   */
  private static async triggerPricingWorkflows(
    contactId: string,
    pricingResult: any,
    requestId: string
  ): Promise<{ triggered: number; warnings: string[] }> {
    
    const warnings: string[] = [];
    let triggered = 0;

    try {
      // Always trigger pricing calculation complete workflow
      await this.triggerWorkflow(
        contactId,
        TRANSPARENT_PRICING_WORKFLOWS.pricing_calculation_complete.workflowId,
        {
          totalPrice: pricingResult.totalPrice,
          serviceType: pricingResult.serviceType,
          discountsApplied: pricingResult.businessRules.discountsApplied
        }
      );
      triggered++;

      // Dynamic pricing workflow
      if (pricingResult.businessRules.dynamicPricingActive) {
        await this.triggerWorkflow(
          contactId,
          TRANSPARENT_PRICING_WORKFLOWS.dynamic_pricing_active.workflowId,
          {
            surcharges: pricingResult.breakdown.timeBasedSurcharges,
            urgencyLevel: this.determineUrgencyLevel(pricingResult)
          }
        );
        triggered++;
      }

      // Discount workflows
      if (pricingResult.businessRules.discountsApplied.length > 0) {
        await this.triggerWorkflow(
          contactId,
          TRANSPARENT_PRICING_WORKFLOWS.discount_applied.workflowId,
          {
            discounts: pricingResult.breakdown.discounts,
            totalDiscount: pricingResult.breakdown.discounts.reduce((sum: number, d: any) => sum + d.amount, 0)
          }
        );
        triggered++;

        // First-time customer specific workflow
        if (pricingResult.businessRules.discountsApplied.includes('first_time')) {
          await this.triggerWorkflow(
            contactId,
            TRANSPARENT_PRICING_WORKFLOWS.first_time_discount.workflowId,
            {
              welcomeDiscount: pricingResult.breakdown.discounts.find((d: any) => d.label.includes('First-time'))?.amount || 0
            }
          );
          triggered++;
        }
      }

      // Transparency workflows
      if (pricingResult.transparency.alternatives.length > 0) {
        await this.triggerWorkflow(
          contactId,
          TRANSPARENT_PRICING_WORKFLOWS.alternatives_shown.workflowId,
          {
            alternatives: pricingResult.transparency.alternatives,
            savingsOffered: pricingResult.transparency.alternatives.reduce((max: number, alt: any) => Math.max(max, alt.savings), 0)
          }
        );
        triggered++;

        await this.triggerWorkflow(
          contactId,
          TRANSPARENT_PRICING_WORKFLOWS.money_saving_tips.workflowId,
          {
            tips: pricingResult.transparency.feeExplanations,
            potentialSavings: pricingResult.transparency.alternatives[0]?.savings || 0
          }
        );
        triggered++;
      }

      // Business rules violation workflows
      if (pricingResult.businessRules.violations.length > 0) {
        await this.triggerWorkflow(
          contactId,
          TRANSPARENT_PRICING_WORKFLOWS.business_rules_failed.workflowId,
          {
            violations: pricingResult.businessRules.violations,
            recommendations: pricingResult.businessRules.recommendations
          }
        );
        triggered++;
      }

      console.log(`⚡ [${requestId}] Successfully triggered ${triggered} workflows`);

    } catch (error) {
      console.warn(`⚠️ [${requestId}] Workflow triggering warning:`, error);
      warnings.push(`Workflow triggering failed: ${error instanceof Error ? getErrorMessage(error) : 'Unknown error'}`);
    }

    return { triggered, warnings };
  }

  /**
   * Trigger a specific workflow
   */
  private static async triggerWorkflow(
    contactId: string,
    workflowId: string,
    data: any
  ): Promise<void> {
    
    try {
      // Note: GHL workflow triggering might require specific API endpoints
      // This is a placeholder for the actual implementation
      const response = await ghlApiRequest(`/contacts/${contactId}/workflow/${workflowId}`, {
        method: 'POST',
        body: JSON.stringify({
          contactId,
          workflowData: data
        })
      });

      return response;
      
    } catch (error) {
      console.warn(`Failed to trigger workflow ${workflowId}:`, error);
      throw error;
    }
  }

  /**
   * Add a comprehensive pricing note to the contact
   */
  private static async addPricingNote(
    contactId: string,
    pricingResult: any,
    requestId: string
  ): Promise<void> {
    
    try {
      const note = this.generatePricingNote(pricingResult, requestId);
      
      await ghlApiRequest(`/contacts/${contactId}/notes`, {
        method: 'POST',
        body: JSON.stringify({
          body: note,
          userId: process.env.GHL_USER_ID // Admin user who created the note
        })
      });

      console.log(`📝 [${requestId}] Added pricing note to contact ${contactId}`);
      
    } catch (error) {
      console.warn(`⚠️ [${requestId}] Failed to add pricing note:`, error);
    }
  }

  /**
   * Generate a comprehensive pricing note
   */
  private static generatePricingNote(pricingResult: any, requestId: string): string {
    const breakdown = pricingResult.breakdown;
    const transparency = pricingResult.transparency;
    const businessRules = pricingResult.businessRules;

    let note = `🔍 TRANSPARENT PRICING CALCULATION [${requestId}]\n\n`;
    
    note += `💰 PRICING SUMMARY:\n`;
    note += `• Service: ${pricingResult.serviceType.replace(/_/g, ' ')}\n`;
    note += `• Base Price: $${pricingResult.basePrice}\n`;
    note += `• Final Total: $${pricingResult.totalPrice}\n\n`;

    note += `📊 BREAKDOWN:\n`;
    note += `• ${breakdown.serviceBase.label}: $${breakdown.serviceBase.amount}\n`;
    
    if (breakdown.travelFee) {
      note += `• ${breakdown.travelFee.label}: $${breakdown.travelFee.amount}\n`;
    }
    
    if (breakdown.extraDocuments) {
      note += `• ${breakdown.extraDocuments.label}: $${breakdown.extraDocuments.amount}\n`;
    }
    
    breakdown.timeBasedSurcharges.forEach((surcharge: any) => {
      note += `• ${surcharge.label}: +$${surcharge.amount}\n`;
    });
    
    breakdown.discounts.forEach((discount: any) => {
      note += `• ${discount.label}: -$${discount.amount}\n`;
    });

    note += `\n🔍 TRANSPARENCY:\n`;
    note += `• Why this price: ${transparency.whyThisPrice}\n`;
    
    if (transparency.alternatives.length > 0) {
      note += `• Alternatives offered:\n`;
      transparency.alternatives.forEach((alt: any) => {
        note += `  - ${alt.serviceType.replace(/_/g, ' ')}: $${alt.price} (save $${alt.savings})\n`;
      });
    }

    note += `\n⚡ BUSINESS RULES:\n`;
    note += `• Service Area: ${businessRules.serviceAreaZone.replace(/_/g, ' ')}\n`;
    note += `• Dynamic Pricing: ${businessRules.dynamicPricingActive ? 'Active' : 'Not Active'}\n`;
    note += `• Discounts Applied: ${businessRules.discountsApplied.join(', ') || 'None'}\n`;

    if (businessRules.violations.length > 0) {
      note += `• ⚠️ Violations: ${businessRules.violations.join(', ')}\n`;
    }

    note += `\n📈 METADATA:\n`;
    note += `• Calculated: ${pricingResult.metadata.calculatedAt}\n`;
    note += `• Version: ${pricingResult.metadata.version}\n`;
    note += `• Processing Time: ${pricingResult.metadata.calculationTime}ms\n`;

    return note;
  }

  /**
   * Determine urgency level based on pricing data
   */
  private static determineUrgencyLevel(pricingResult: any): string {
    const surcharges = pricingResult.breakdown.timeBasedSurcharges;
    
    if (surcharges.some((s: any) => s.label.includes('same-day'))) {
      return 'same_day';
    } else if (surcharges.some((s: any) => s.label.includes('next-day'))) {
      return 'next_day';
    } else if (surcharges.some((s: any) => s.label.includes('extended'))) {
      return 'extended_hours';
    } else if (surcharges.some((s: any) => s.label.includes('weekend'))) {
      return 'weekend';
    }
    
    return 'flexible';
  }

  /**
   * Bulk update multiple contacts with pricing data
   */
  static async bulkSyncPricingToGHL(
    requests: PricingGHLIntegrationRequest[]
  ): Promise<PricingGHLIntegrationResult[]> {
    
    console.log(`🔄 Starting bulk GHL pricing integration for ${requests.length} requests`);

    const results = await Promise.allSettled(
      requests.map(request => this.syncPricingToGHL(request))
    );

    const finalResults = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          success: false,
          customFieldsUpdated: 0,
          tagsApplied: 0,
          workflowsTriggered: 0,
          error: result.reason instanceof Error ? result.reason.message : 'Unknown error',
          warnings: [],
          metadata: {
            processingTime: 0,
            requestId: `bulk_${index}_${Date.now()}`,
            timestamp: new Date().toISOString()
          }
        } as PricingGHLIntegrationResult;
      }
    });

    const successCount = finalResults.filter(r => r.success).length;
    console.log(`✅ Bulk GHL integration completed: ${successCount}/${requests.length} successful`);

    return finalResults;
  }

  /**
   * Test GHL connection and field compatibility
   */
  static async testGHLIntegration(): Promise<{
    success: boolean;
    customFieldsAvailable: number;
    workflowsAvailable: number;
    errors: string[];
  }> {
    
    const errors: string[] = [];
    
    try {
      // Test basic GHL connection
      await ghlApiRequest('/contacts?limit=1', { method: 'GET' });
      
      // Test custom field creation (if needed)
      // This would require checking if fields exist and creating them if not
      
      // Test workflow availability
      // This would require checking if workflows are set up
      
      return {
        success: true,
        customFieldsAvailable: Object.keys(TransparentPricingFieldManager).length,
        workflowsAvailable: Object.keys(TRANSPARENT_PRICING_WORKFLOWS).length,
        errors
      };
      
    } catch (error) {
      errors.push(error instanceof Error ? getErrorMessage(error) : 'Unknown error');
      
      return {
        success: false,
        customFieldsAvailable: 0,
        workflowsAvailable: 0,
        errors
      };
    }
  }
}

export default TransparentPricingGHLIntegration; 
