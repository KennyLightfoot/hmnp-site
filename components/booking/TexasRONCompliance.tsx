import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Scale, FileText, Eye, Clock } from 'lucide-react';
import { calculateTexasCompliantRONPrice, validateRONPricing } from '@/lib/pricing';

interface TexasRONComplianceProps {
  numberOfSigners: number;
  notarialActType?: 'acknowledgment' | 'oath' | 'other';
  showDetailedBreakdown?: boolean;
  className?: string;
}

export default function TexasRONCompliance({
  numberOfSigners = 1,
  notarialActType = 'acknowledgment',
  showDetailedBreakdown = true,
  className = ''
}: TexasRONComplianceProps) {
  
  const ronPricing = calculateTexasCompliantRONPrice(1, notarialActType, numberOfSigners);
  const validation = validateRONPricing(ronPricing.ronServiceFee, ronPricing.notarialActFee, 1, numberOfSigners);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Compliance Summary */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              <CardTitle className="text-lg text-green-800">Texas RON Compliance</CardTitle>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Legal Maximum: ${validation.maxAllowedTotal.toFixed(2)}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-green-600" />
              <span className="text-sm">
                <strong>RON Fee:</strong> ${ronPricing.ronServiceFee.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-green-600" />
              <span className="text-sm">
                <strong>Notarial Fee:</strong> ${ronPricing.notarialActFee.toFixed(2)}
              </span>
            </div>
          </div>
          
          <Alert>
            <AlertDescription className="text-sm">
              <strong>Total Cost: ${ronPricing.totalFee.toFixed(2)}</strong> for {numberOfSigners} signer{numberOfSigners > 1 ? 's' : ''} - 
              Fully compliant with Texas Government Code §406.111 and §406.024
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {showDetailedBreakdown && (
        <>
          {/* Pricing Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#A52A2A]" />
                Fee Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {ronPricing.breakdown.map((item, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className={item.startsWith(' ') ? 'ml-4 text-gray-600' : 'font-medium'}>
                    {item.split(':')[0]}
                  </span>
                  {item.includes('$') && (
                    <span className="font-mono">
                      {item.match(/\$[\d.]+/)?.[0]}
                    </span>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Legal Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-600" />
                Legal Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {ronPricing.complianceNotes.map((note, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-gray-700">{note}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Prohibited Charges */}
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-orange-800">
                <Clock className="h-5 w-5" />
                What We Cannot Charge
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm text-orange-700 space-y-1">
                <div>• No "technology" or "platform" surcharges beyond the $25 RON cap</div>
                <div>• No travel fees (signer is remote)</div>
                <div>• No convenience or processing fees on notarial services</div>
                <div>• No additional fees for document upload or download</div>
              </div>
              <Alert className="border-orange-200">
                <AlertDescription className="text-sm text-orange-800">
                  All fees must be clearly itemized and comply with Texas statutory limits.
                  Non-notarial services may be charged separately if clearly disclosed.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
} 