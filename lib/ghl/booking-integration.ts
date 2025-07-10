import { prisma } from '@/lib/database-connection';
import * as ghl from '@/lib/ghl';

interface BookingPricing {
  basePrice: number;
  promoDiscount: number;
  finalPrice: number;
  depositAmount: number;
  promoCodeInfo?: {
    id: string;
    code: string;
    discountType: string;
    discountValue: number;
  };
}

interface CustomerData {
  firstName: string;
  lastName: string;
  fullName: string;
}

interface AddressData {
  street: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
}

// Helper function to normalize address data
function normalizeAddress(booking: any): AddressData {
  return {
    street: booking.addressStreet || null,
    city: booking.addressCity || null,
    state: booking.addressState || null,
    zip: booking.addressZip || null,
  };
}

// Helper: Create GHL contact and apply tags
export async function createGHLIntegration(
  booking: any,
  customerData: CustomerData,
  service: any,
  pricingData: BookingPricing,
  checkoutUrl?: string | null
): Promise<any> {
  if (!process.env.GHL_LOCATION_ID) {
    console.warn('GHL_LOCATION_ID not configured, skipping GHL integration');
    return null;
  }
  
  try {
    const { firstName, lastName, fullName } = customerData;
    const address = normalizeAddress(booking);
    
    // Prepare GHL contact payload
    const ghlContactPayload = {
      email: booking.customerEmail || booking.signerEmail,
      firstName,
      lastName,
      phone: booking.customerPhone || booking.signerPhone || undefined,
      address1: address.street || undefined,
      city: address.city || undefined,
      state: address.state || undefined,
      postalCode: address.zip || undefined,
      country: address.state ? 'US' : undefined,
      source: 'HMNP Website Booking',
      companyName: booking.companyName || undefined,
      locationId: process.env.GHL_LOCATION_ID,
      customField: {
        booking_id: booking.id,
        payment_url: checkoutUrl || '',
        payment_amount: pricingData.finalPrice.toString(),
        service_requested: service.name,
        service_price: service.basePrice.toString(),
        appointment_date: booking.scheduledDateTime ? 
          new Date(booking.scheduledDateTime).toLocaleDateString('en-US') : '',
        appointment_time: booking.scheduledDateTime ? 
          new Date(booking.scheduledDateTime).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }) : '',
      }
    };
    
    // Create/update contact
    const ghlContact = await ghl.upsertContact(ghlContactPayload);
    const contactId = ghlContact?.id || ghlContact?.contact?.id;
    
    if (contactId) {
      // Apply tags
      const tags = [
        'source:website_booking',
        `Service:${service.name.replace(/\s+/g, '_').toLowerCase()}`,
        `status:booking_${booking.status.toLowerCase()}`,
        'status:booking_created'
      ];
      
      if (pricingData.promoDiscount > 0) {
        tags.push('discount:applied');
      }
      
      if (pricingData.promoCodeInfo?.code) {
        tags.push(`promo:${pricingData.promoCodeInfo.code.toLowerCase()}`);
      }
      
      await ghl.addTagsToContact(contactId, tags);
      
      // Update booking with GHL contact ID
      await prisma.Booking.update({
        where: { id: booking.id },
        data: { ghlContactId: contactId }
      });
      
      return { contactId, tags };
    }
    
    return null;
  } catch (error) {
    console.error('GHL integration failed:', error);
    return null;
  }
} 