/**
 * Automated Invoice Generator
 * Houston Mobile Notary Pros - Phase 2
 * 
 * Generates professional invoices with PDF support and automated delivery
 */

import { z } from 'zod';
import { getErrorMessage } from '@/lib/utils/error-utils';
import { logger } from '../logger';
import { prisma } from '../prisma';
import { addJob } from '../queue/queue-config';

// Invoice generation request schema
const InvoiceGenerationRequestSchema = z.object({
  type: z.enum(['booking', 'payment_confirmation', 'subscription', 'custom']),
  bookingId: z.string().optional(),
  paymentId: z.string().optional(),
  customerId: z.string().optional(),
  customerEmail: z.string().email(),
  customerName: z.string(),
  customerAddress: z.object({
    line1: z.string(),
    line2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string().default('US')
  }).optional(),
  lineItems: z.array(z.object({
    description: z.string(),
    quantity: z.number().positive(),
    unitPrice: z.number().positive(),
    amount: z.number().positive(),
    metadata: z.record(z.any()).optional()
  })),
  subtotal: z.number().positive(),
  taxRate: z.number().min(0).max(1).default(0.0825), // 8.25% Texas sales tax
  taxAmount: z.number().min(0),
  discountAmount: z.number().min(0).default(0),
  totalAmount: z.number().positive(),
  dueDate: z.string().datetime().optional(),
  notes: z.string().optional(),
  paymentTerms: z.string().default('Payment due upon receipt'),
  invoiceTemplate: z.enum(['standard', 'professional', 'minimal']).default('professional'),
  generatePDF: z.boolean().default(true),
  sendEmail: z.boolean().default(true),
  metadata: z.record(z.any()).optional()
});

// Invoice data interface
export interface InvoiceData {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  customer: {
    name: string;
    email: string;
    address?: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
  };
  company: {
    name: string;
    address: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
    phone: string;
    email: string;
    website: string;
    taxId?: string;
  };
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paymentTerms: string;
  notes?: string;
  metadata?: Record<string, any>;
}

// Invoice generation result
export interface InvoiceGenerationResult {
  success: boolean;
  invoiceId?: string;
  invoiceNumber?: string;
  pdfUrl?: string;
  emailSent?: boolean;
  error?: string;
  details?: any;
}

/**
 * Automated Invoice Generator
 */
export class InvoiceGenerator {
  private readonly companyInfo = {
    name: 'Houston Mobile Notary Pros',
    address: {
      line1: '123 Main Street',
      line2: 'Suite 100',
      city: 'Houston',
      state: 'TX',
      postalCode: '77001',
      country: 'US'
    },
    phone: '(713) 555-0123',
    email: 'billing@houstonmobilenotary.com',
    website: 'www.houstonmobilenotary.com',
    taxId: 'XX-XXXXXXX'
  };

  /**
   * Generate a comprehensive invoice
   */
  async generateInvoice(request: z.infer<typeof InvoiceGenerationRequestSchema>): Promise<InvoiceGenerationResult> {
    try {
      // Validate request
      const validatedRequest = InvoiceGenerationRequestSchema.parse(request);
      
      // Generate invoice number
      const invoiceNumber = await this.generateInvoiceNumber();
      
      // Calculate due date if not provided
      const dueDate = validatedRequest.dueDate || this.calculateDueDate(30); // 30 days default
      
      // Prepare invoice data
      const invoiceData: InvoiceData = {
        invoiceNumber,
        issueDate: new Date().toISOString(),
        dueDate,
        status: 'DRAFT',
        customer: {
          name: validatedRequest.customerName,
          email: validatedRequest.customerEmail,
          address: validatedRequest.customerAddress
        },
        company: this.companyInfo,
        lineItems: validatedRequest.lineItems,
        subtotal: validatedRequest.subtotal,
        taxRate: validatedRequest.taxRate,
        taxAmount: validatedRequest.taxAmount,
        discountAmount: validatedRequest.discountAmount,
        totalAmount: validatedRequest.totalAmount,
        paymentTerms: validatedRequest.paymentTerms,
        notes: validatedRequest.notes,
        metadata: validatedRequest.metadata
      };

      // Create invoice record in database
      // Create invoice record (placeholder since Invoice model doesn't exist)
      const invoice = { id: `invoice_${Date.now()}` };
      
      // Generate PDF if requested
      let pdfUrl: string | undefined;
      if (validatedRequest.generatePDF) {
        pdfUrl = await this.generateInvoicePDF(invoice.id, invoiceData, validatedRequest.invoiceTemplate);
      }
      
      // Send email if requested
      let emailSent = false;
      if (validatedRequest.sendEmail && pdfUrl) {
        emailSent = await this.sendInvoiceEmail(invoice.id, invoiceData, pdfUrl);
      }
      
      // Note: Invoice model doesn't exist in schema, so we'll skip database update
      // In a real implementation, you'd create an Invoice model or use a different approach
      logger.info('Invoice would be updated in database', {
        invoiceId: invoice.id,
        status: validatedRequest.sendEmail ? 'SENT' : 'DRAFT'
      });
      
      logger.info('Invoice generated successfully', {
        invoiceId: invoice.id,
        invoiceNumber,
        customerEmail: this.maskEmail(validatedRequest.customerEmail),
        totalAmount: validatedRequest.totalAmount,
        pdfGenerated: !!pdfUrl,
        emailSent
      });

      return {
        success: true,
        invoiceId: invoice.id,
        invoiceNumber,
        pdfUrl,
        emailSent,
        details: {
          lineItems: validatedRequest.lineItems.length,
          totalAmount: validatedRequest.totalAmount,
          dueDate
        }
      };

    } catch (error: any) {
      logger.error('Invoice generation failed', {
        error: getErrorMessage(error),
        request: this.sanitizeRequest(request)
      });

      return {
        success: false,
        error: getErrorMessage(error)
      };
    }
  }

  /**
   * Generate invoice from booking
   */
  async generateInvoiceFromBooking(bookingId: string, type: 'confirmation' | 'completion' = 'confirmation'): Promise<InvoiceGenerationResult> {
    try {
      // Fetch booking details
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          payments: true
        }
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      // Get service details
      const service = await prisma.service.findUnique({
        where: { id: booking.serviceId }
      });

      // Prepare line items based on booking
      const lineItems = [
        {
          description: `${service?.name || 'Notary Service'} - ${booking.scheduledDateTime}`,
          quantity: 1,
          unitPrice: booking.priceAtBooking.toNumber(),
          amount: booking.priceAtBooking.toNumber()
        }
      ];

      // Add travel fee if applicable
      if (booking.travelFee && booking.travelFee.toNumber() > 0) {
        lineItems.push({
          description: 'Travel Fee',
          quantity: 1,
          unitPrice: booking.travelFee.toNumber(),
          amount: booking.travelFee.toNumber()
        });
      }

      // Calculate totals
      const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
      const taxAmount = subtotal * 0.0825; // 8.25% Texas sales tax
      const totalAmount = subtotal + taxAmount;

      // Generate invoice
      return await this.generateInvoice({
        type: 'booking',
        bookingId,
        customerEmail: (booking as any).customerEmail || '',
        customerName: (booking as any).customerName || 'Customer',
        customerAddress: {
          line1: (booking as any).addressStreet || '',
          city: (booking as any).addressCity || '',
          state: (booking as any).addressState || '',
          postalCode: (booking as any).addressZip || '',
          country: 'US'
        },
        lineItems,
        subtotal,
        taxAmount,
        totalAmount,
        taxRate: 0.0825,
        discountAmount: 0,
        paymentTerms: 'Payment due upon receipt',
        invoiceTemplate: 'professional',
        generatePDF: true,
        sendEmail: true,
        notes: `Booking ID: ${bookingId}\nService Date: ${booking.scheduledDateTime}`,
        metadata: {
          bookingId,
          serviceId: booking.serviceId,
          type
        }
      });

    } catch (error: any) {
      logger.error('Failed to generate invoice from booking', {
        bookingId,
        type,
        error: getErrorMessage(error)
      });

      return {
        success: false,
        error: getErrorMessage(error)
      };
    }
  }

  /**
   * Generate invoice from payment
   */
  async generateInvoiceFromPayment(paymentId: string): Promise<InvoiceGenerationResult> {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          booking: true
        }
      });

      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.booking) {
        return await this.generateInvoiceFromBooking(payment.booking.id, 'confirmation');
      }

      // Handle standalone payment invoice
      const lineItems = [
        {
          description: 'Notary Services Payment',
          quantity: 1,
          unitPrice: Number(payment.amount),
          amount: Number(payment.amount)
        }
      ];

      return await this.generateInvoice({
        type: 'payment_confirmation',
        paymentId,
        customerEmail: (payment as any).customerEmail || '',
        customerName: (payment as any).customerName || 'Valued Customer',
        lineItems,
        subtotal: Number(payment.amount),
        taxAmount: 0,
        totalAmount: Number(payment.amount),
        taxRate: 0,
        discountAmount: 0,
        paymentTerms: 'Payment due upon receipt',
        invoiceTemplate: 'professional',
        generatePDF: true,
        sendEmail: true,
        metadata: {
          paymentId,
          paymentIntentId: (payment as any).paymentIntentId
        }
      });

    } catch (error: any) {
      logger.error('Failed to generate invoice from payment', {
        paymentId,
        error: getErrorMessage(error)
      });

      return {
        success: false,
        error: getErrorMessage(error)
      };
    }
  }

  // Private helper methods
  private async createInvoiceRecord(invoiceData: InvoiceData, request: any): Promise<any> {
    // Note: Invoice model doesn't exist in schema
    // In a real implementation, you'd create an Invoice model
    logger.info('Would create invoice record in database', {
      invoiceNumber: invoiceData.invoiceNumber,
      bookingId: request.bookingId,
      totalAmount: invoiceData.totalAmount
    });
    
    return { id: `invoice_${Date.now()}` };
  }

  private async generateInvoiceNumber(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    
    // Note: Invoice model doesn't exist in schema
    // In a real implementation, you'd count existing invoices
    const sequence = String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0');
    return `INV-${year}${month}-${sequence}`;
  }

  private calculateDueDate(daysFromNow: number): string {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + daysFromNow);
    return dueDate.toISOString();
  }

  private async generateInvoicePDF(invoiceId: string, invoiceData: InvoiceData, template: string): Promise<string> {
    // Queue PDF generation job
    await addJob('invoice', 'generate_pdf', {
      invoiceId,
      invoiceData,
      template
    });
    
    // Return placeholder URL - actual URL will be updated when PDF is generated
    return `/api/invoices/${invoiceId}/pdf`;
  }

  private async sendInvoiceEmail(invoiceId: string, invoiceData: InvoiceData, pdfUrl: string): Promise<boolean> {
    try {
      // Queue email sending job
      await addJob('notification', 'send', {
        type: 'invoice',
        invoiceId,
        customerEmail: invoiceData.customer.email,
        customerName: invoiceData.customer.name,
        invoiceNumber: invoiceData.invoiceNumber,
        totalAmount: invoiceData.totalAmount,
        dueDate: invoiceData.dueDate,
        pdfUrl
      });
      
      return true;
    } catch (error: any) {
      logger.error('Failed to queue invoice email', {
        invoiceId,
        error: getErrorMessage(error)
      });
      return false;
    }
  }

  private maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (!local || !domain) return '***@***';
    return `${local.slice(0, 2)}***@${domain}`;
  }

  private sanitizeRequest(request: any): any {
    const sanitized = { ...request };
    if (sanitized.customerEmail) {
      sanitized.customerEmail = this.maskEmail(sanitized.customerEmail);
    }
    return sanitized;
  }
}

// Singleton instance
export const invoiceGenerator = new InvoiceGenerator();

// Convenience functions
export async function generateInvoice(request: z.infer<typeof InvoiceGenerationRequestSchema>): Promise<InvoiceGenerationResult> {
  return invoiceGenerator.generateInvoice(request);
}

export async function generateInvoiceFromBooking(bookingId: string, type: 'confirmation' | 'completion' = 'confirmation'): Promise<InvoiceGenerationResult> {
  return invoiceGenerator.generateInvoiceFromBooking(bookingId, type);
}

export async function generateInvoiceFromPayment(paymentId: string): Promise<InvoiceGenerationResult> {
  return invoiceGenerator.generateInvoiceFromPayment(paymentId);
}
