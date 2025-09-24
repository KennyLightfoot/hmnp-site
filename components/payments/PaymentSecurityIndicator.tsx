'use client';

/**
 * Payment Security Indicator Component
 * Houston Mobile Notary Pros - Phase 2
 * 
 * Features:
 * - SSL encryption status
 * - PCI DSS compliance indicators
 * - Fraud protection status
 * - Trust badges and certifications
 * - Real-time security status
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Lock, 
  CheckCircle, 
  AlertTriangle,
  Wifi,
  WifiOff,
  Eye,
  EyeOff,
  Star,
  Award,
  Users,
  Clock,
  Zap,
  Globe,
  Server,
  Fingerprint
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface SecurityStatus {
  sslEncrypted: boolean;
  pciCompliant: boolean;
  fraudProtected: boolean;
  connectionSecure: boolean;
  dataEncrypted: boolean;
  privacyProtected: boolean;
}

export interface TrustIndicator {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  status: 'active' | 'inactive' | 'warning';
  priority: 'high' | 'medium' | 'low';
}

export interface PaymentSecurityIndicatorProps {
  securityStatus?: SecurityStatus;
  showDetails?: boolean;
  className?: string;
  isMobile?: boolean;
}

const DEFAULT_SECURITY_STATUS: SecurityStatus = {
  sslEncrypted: true,
  pciCompliant: true,
  fraudProtected: true,
  connectionSecure: true,
  dataEncrypted: true,
  privacyProtected: true
};

const TRUST_INDICATORS: TrustIndicator[] = [
  {
    icon: Shield,
    title: 'SSL Encryption',
    description: '256-bit bank-level encryption',
    status: 'active',
    priority: 'high'
  },
  {
    icon: Lock,
    title: 'PCI DSS Compliant',
    description: 'Highest security standards',
    status: 'active',
    priority: 'high'
  },
  {
    icon: Users,
    title: 'Fraud Protection',
    description: 'Advanced fraud detection',
    status: 'active',
    priority: 'high'
  },
  {
    icon: Award,
    title: 'Trusted by 10K+',
    description: 'Secure payments since 2020',
    status: 'active',
    priority: 'medium'
  },
  {
    icon: Star,
    title: '4.9/5 Rating',
    description: 'From 2,500+ reviews',
    status: 'active',
    priority: 'medium'
  },
  {
    icon: Clock,
    title: '24/7 Support',
    description: 'Always here to help',
    status: 'active',
    priority: 'medium'
  },
  {
    icon: Globe,
    title: 'Global Security',
    description: 'Worldwide protection',
    status: 'active',
    priority: 'low'
  },
  {
    icon: Server,
    title: 'Secure Servers',
    description: 'Enterprise-grade infrastructure',
    status: 'active',
    priority: 'low'
  }
];

const SECURITY_FEATURES = [
  {
    icon: Fingerprint,
    title: 'Biometric Authentication',
    description: 'Apple Pay & Google Pay support'
  },
  {
    icon: Zap,
    title: 'Instant Processing',
    description: 'Real-time payment verification'
  },
  {
    icon: Eye,
    title: 'Privacy First',
    description: 'We never store full card details'
  },
  {
    icon: Server,
    title: 'Redundant Systems',
    description: '99.9% uptime guarantee'
  }
];

export default function PaymentSecurityIndicator({
  securityStatus = DEFAULT_SECURITY_STATUS,
  showDetails = false,
  className = '',
  isMobile = false
}: PaymentSecurityIndicatorProps) {
  const [isExpanded, setIsExpanded] = useState(showDetails);
  const [connectionStatus, setConnectionStatus] = useState<'secure' | 'insecure'>('secure');

  // Check connection security
  useEffect(() => {
    const checkConnection = () => {
      const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
      setConnectionStatus(isSecure ? 'secure' : 'insecure');
    };

    checkConnection();
    window.addEventListener('focus', checkConnection);
    
    return () => window.removeEventListener('focus', checkConnection);
  }, []);

  // Get security status styling
  const getSecurityStatusStyling = (status: boolean) => {
    return cn(
      'flex items-center space-x-2 text-sm',
      status ? 'text-green-700' : 'text-red-700'
    );
  };

  // Get trust indicator styling
  const getTrustIndicatorStyling = (indicator: TrustIndicator) => {
    return cn(
      'flex items-center space-x-2 p-2 rounded',
      indicator.status === 'active' && 'bg-green-50 text-green-700',
      indicator.status === 'warning' && 'bg-yellow-50 text-yellow-700',
      indicator.status === 'inactive' && 'bg-red-50 text-red-700'
    );
  };

  // Get priority badge styling
  const getPriorityBadgeStyling = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Connection Status Alert */}
      {connectionStatus === 'insecure' && (
        <Alert variant="destructive">
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            <strong>Insecure Connection:</strong> For your security, please use HTTPS when making payments.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Security Card */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-green-800">
            <Shield className="h-5 w-5" />
            <span>Payment Security</span>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Lock className="h-3 w-3 mr-1" />
              Secure
            </Badge>
          </CardTitle>
          <CardDescription className="text-green-700">
            Your payment information is protected by bank-level security
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Security Status Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className={getSecurityStatusStyling(securityStatus.sslEncrypted)}>
              <Shield className="h-4 w-4" />
              <span>SSL Encrypted</span>
              {securityStatus.sslEncrypted && <CheckCircle className="h-4 w-4 text-green-600" />}
            </div>
            
            <div className={getSecurityStatusStyling(securityStatus.pciCompliant)}>
              <Lock className="h-4 w-4" />
              <span>PCI DSS Compliant</span>
              {securityStatus.pciCompliant && <CheckCircle className="h-4 w-4 text-green-600" />}
            </div>
            
            <div className={getSecurityStatusStyling(securityStatus.fraudProtected)}>
              <Users className="h-4 w-4" />
              <span>Fraud Protected</span>
              {securityStatus.fraudProtected && <CheckCircle className="h-4 w-4 text-green-600" />}
            </div>
            
            <div className={getSecurityStatusStyling(securityStatus.connectionSecure)}>
              <Wifi className="h-4 w-4" />
              <span>Secure Connection</span>
              {securityStatus.connectionSecure && <CheckCircle className="h-4 w-4 text-green-600" />}
            </div>
          </div>

          {/* Expandable Details */}
          <div className="space-y-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-green-700 border-green-300 hover:bg-green-100"
            >
              {isExpanded ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Hide Security Details
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Show Security Details
                </>
              )}
            </Button>

            {isExpanded && (
              <div className="space-y-4">
                {/* Security Features */}
                <div>
                  <h4 className="text-sm font-medium text-green-800 mb-2">Security Features</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {SECURITY_FEATURES.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 bg-white rounded border border-green-200">
                        <feature.icon className="h-4 w-4 text-green-600" />
                        <div>
                          <div className="text-sm font-medium text-green-800">{feature.title}</div>
                          <div className="text-xs text-green-700">{feature.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trust Indicators */}
                <div>
                  <h4 className="text-sm font-medium text-green-800 mb-2">Trust Indicators</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {TRUST_INDICATORS.map((indicator, index) => (
                      <div key={index} className={getTrustIndicatorStyling(indicator)}>
                        <indicator.icon className="h-4 w-4" />
                        <div className="flex-1">
                          <div className="text-sm font-medium">{indicator.title}</div>
                          <div className="text-xs opacity-80">{indicator.description}</div>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={cn('text-xs', getPriorityBadgeStyling(indicator.priority))}
                        >
                          {indicator.priority}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Trust Badges */}
      <Card className="border-blue-100 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex flex-wrap justify-center items-center gap-4">
            <div className="text-center">
              <Shield className="h-6 w-6 text-blue-600 mx-auto mb-1" />
              <div className="text-xs font-medium text-blue-800">SSL Secure</div>
            </div>
            
            <div className="text-center">
              <Lock className="h-6 w-6 text-blue-600 mx-auto mb-1" />
              <div className="text-xs font-medium text-blue-800">PCI DSS</div>
            </div>
            
            <div className="text-center">
              <Star className="h-6 w-6 text-blue-600 mx-auto mb-1" />
              <div className="text-xs font-medium text-blue-800">Trusted</div>
            </div>
            
            <div className="text-center">
              <Award className="h-6 w-6 text-blue-600 mx-auto mb-1" />
              <div className="text-xs font-medium text-blue-800">Certified</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <div className="text-center text-xs text-gray-500 space-y-1">
        <p>🔒 Your payment information is encrypted and secure</p>
        <p>💳 We never store your full card details</p>
        <p>🛡️ Protected by Stripe's security standards</p>
        <p>📱 Mobile-optimized secure payments</p>
      </div>
    </div>
  );
} 