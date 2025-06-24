"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, Minus, Shield, FileText, Clock, Users, 
  Award, MapPin, Zap, HelpCircle, DollarSign
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export interface ServiceAddon {
  id: string;
  name: string;
  description: string;
  addonType: string;
  price: number;
  isActive: boolean;
  requiresApproval: boolean;
  maxQuantity?: number;
  applicableServices: string[];
}

export interface SelectedAddon {
  addonId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
}

interface ServiceAddonsProps {
  serviceId: string;
  selectedAddons: SelectedAddon[];
  onAddonsChange: (addons: SelectedAddon[]) => void;
  totalSigners?: number;
  urgencyLevel?: 'standard' | 'same-day' | 'emergency';
  showPricing?: boolean;
}

// Predefined addon types with icons and descriptions
const ADDON_TYPES = {
  WITNESS: {
    icon: Users,
    label: 'Witness Service',
    description: 'Professional witness provided by our staff',
    color: 'blue'
  },
  APOSTILLE: {
    icon: Award,
    label: 'Apostille Service',
    description: 'International document authentication',
    color: 'purple'
  },
  EXTRA_COPY: {
    icon: FileText,
    label: 'Certified Copy',
    description: 'Additional certified copies of documents',
    color: 'green'
  },
  RUSH_SERVICE: {
    icon: Zap,
    label: 'Rush Service',
    description: 'Expedited processing and scheduling',
    color: 'orange'
  },
  TRAVEL_FEE: {
    icon: MapPin,
    label: 'Additional Travel',
    description: 'Extended travel outside standard service area',
    color: 'red'
  },
  AFTER_HOURS: {
    icon: Clock,
    label: 'After Hours Service',
    description: 'Service outside standard business hours',
    color: 'indigo'
  },
  ID_VERIFICATION: {
    icon: Shield,
    label: 'Enhanced ID Verification',
    description: 'Additional identity verification services',
    color: 'yellow'
  },
  DOCUMENT_PREP: {
    icon: FileText,
    label: 'Document Preparation',
    description: 'Professional document preparation assistance',
    color: 'teal'
  }
};

export default function ServiceAddons({
  serviceId,
  selectedAddons,
  onAddonsChange,
  totalSigners = 1,
  urgencyLevel = 'standard',
  showPricing = true
}: ServiceAddonsProps) {
  const [availableAddons, setAvailableAddons] = useState<ServiceAddon[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAvailableAddons();
  }, [serviceId]);

  const fetchAvailableAddons = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/services/${serviceId}/addons`);
      
      if (response.ok) {
        const data = await response.json();
        setAvailableAddons(data.addons || []);
      } else {
        // Fallback to default addons if API not available
        setAvailableAddons(getDefaultAddons());
      }
    } catch (error) {
      console.error('Failed to fetch addons:', error);
      setAvailableAddons(getDefaultAddons());
    } finally {
      setIsLoading(false);
    }
  };

  const getDefaultAddons = (): ServiceAddon[] => [
    {
      id: 'witness-1',
      name: 'Professional Witness',
      description: 'Credible witness provided by our certified staff',
      addonType: 'WITNESS',
      price: 25.00,
      isActive: true,
      requiresApproval: false,
      maxQuantity: 2,
      applicableServices: [serviceId]
    },
    {
      id: 'apostille-1',
      name: 'Apostille Service',
      description: 'Secretary of State apostille for international use',
      addonType: 'APOSTILLE',
      price: 75.00,
      isActive: true,
      requiresApproval: true,
      maxQuantity: 5,
      applicableServices: [serviceId]
    },
    {
      id: 'extra-copy-1',
      name: 'Certified Copy',
      description: 'Additional certified copies of notarized documents',
      addonType: 'EXTRA_COPY',
      price: 15.00,
      isActive: true,
      requiresApproval: false,
      maxQuantity: 10,
      applicableServices: [serviceId]
    },
    {
      id: 'rush-1',
      name: 'Same-Day Rush Service',
      description: 'Priority scheduling for same-day service',
      addonType: 'RUSH_SERVICE',
      price: 50.00,
      isActive: urgencyLevel !== 'standard',
      requiresApproval: false,
      maxQuantity: 1,
      applicableServices: [serviceId]
    },
    {
      id: 'after-hours-1',
      name: 'After Hours Service',
      description: 'Service outside standard business hours (6PM-8AM)',
      addonType: 'AFTER_HOURS',
      price: 40.00,
      isActive: true,
      requiresApproval: false,
      maxQuantity: 1,
      applicableServices: [serviceId]
    }
  ];

  const addAddon = (addon: ServiceAddon) => {
    const existingIndex = selectedAddons.findIndex(a => a.addonId === addon.id);
    
    if (existingIndex >= 0) {
      // Increment quantity if already selected
      const updated = [...selectedAddons];
      const currentQuantity = updated[existingIndex].quantity;
      const maxQty = addon.maxQuantity || 10;
      
      if (currentQuantity < maxQty) {
        updated[existingIndex].quantity = currentQuantity + 1;
        updated[existingIndex].totalPrice = updated[existingIndex].quantity * addon.price;
        onAddonsChange(updated);
      }
    } else {
      // Add new addon
      const newAddon: SelectedAddon = {
        addonId: addon.id,
        quantity: 1,
        unitPrice: addon.price,
        totalPrice: addon.price,
      };
      onAddonsChange([...selectedAddons, newAddon]);
    }
  };

  const removeAddon = (addonId: string) => {
    const existingIndex = selectedAddons.findIndex(a => a.addonId === addonId);
    
    if (existingIndex >= 0) {
      const updated = [...selectedAddons];
      
      if (updated[existingIndex].quantity > 1) {
        // Decrement quantity
        updated[existingIndex].quantity -= 1;
        updated[existingIndex].totalPrice = updated[existingIndex].quantity * updated[existingIndex].unitPrice;
        onAddonsChange(updated);
      } else {
        // Remove addon completely
        onAddonsChange(selectedAddons.filter(a => a.addonId !== addonId));
      }
    }
  };

  const updateAddonQuantity = (addonId: string, quantity: number) => {
    if (quantity <= 0) {
      onAddonsChange(selectedAddons.filter(a => a.addonId !== addonId));
      return;
    }

    const updated = selectedAddons.map(addon => 
      addon.addonId === addonId 
        ? {
            ...addon,
            quantity,
            totalPrice: quantity * addon.unitPrice
          }
        : addon
    );
    onAddonsChange(updated);
  };

  const getAddonTypeInfo = (type: string) => {
    return ADDON_TYPES[type as keyof typeof ADDON_TYPES] || {
      icon: HelpCircle,
      label: type,
      description: '',
      color: 'gray'
    };
  };

  const getSelectedQuantity = (addonId: string) => {
    return selectedAddons.find(a => a.addonId === addonId)?.quantity || 0;
  };

  const getTotalAddonCost = () => {
    return selectedAddons.reduce((total, addon) => total + addon.totalPrice, 0);
  };

  const getRecommendedAddons = () => {
    const recommended = [];
    
    // Recommend witness if multiple signers
    if (totalSigners > 2) {
      recommended.push('WITNESS');
    }
    
    // Recommend rush if urgent
    if (urgencyLevel === 'emergency' || urgencyLevel === 'same-day') {
      recommended.push('RUSH_SERVICE');
    }
    
    return recommended;
  };

  const recommendedTypes = getRecommendedAddons();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Service Add-ons</h3>
        <p className="text-sm text-muted-foreground">
          Customize your service with additional options
        </p>
      </div>

      {/* Recommendations */}
      {recommendedTypes.length > 0 && (
        <Alert>
          <HelpCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Recommended for your booking:</strong> Based on {totalSigners} signers and {urgencyLevel} urgency, 
            consider adding {recommendedTypes.map(type => getAddonTypeInfo(type).label).join(', ')}.
          </AlertDescription>
        </Alert>
      )}

      {/* Available Add-ons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {availableAddons.map((addon) => {
          const typeInfo = getAddonTypeInfo(addon.addonType);
          const selectedQuantity = getSelectedQuantity(addon.id);
          const isRecommended = recommendedTypes.includes(addon.addonType);
          const IconComponent = typeInfo.icon;

          return (
            <Card key={addon.id} className={`relative ${isRecommended ? 'ring-2 ring-blue-500' : ''}`}>
              {isRecommended && (
                <Badge className="absolute -top-2 -right-2 bg-blue-500">
                  Recommended
                </Badge>
              )}
              
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-${typeInfo.color}-100`}>
                      <IconComponent className={`h-5 w-5 text-${typeInfo.color}-600`} />
                    </div>
                    <div>
                      <CardTitle className="text-base">{addon.name}</CardTitle>
                      {showPricing && (
                        <p className="text-lg font-bold text-green-600">
                          ${addon.price.toFixed(2)}
                          {addon.maxQuantity && addon.maxQuantity > 1 && (
                            <span className="text-sm font-normal text-gray-500"> each</span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">{addon.description}</p>

                {addon.requiresApproval && (
                  <Badge variant="outline" className="text-amber-600">
                    Requires Approval
                  </Badge>
                )}

                {/* Quantity Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeAddon(addon.id)}
                      disabled={selectedQuantity === 0}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    
                    <Input
                      type="number"
                      value={selectedQuantity}
                      onChange={(e) => updateAddonQuantity(addon.id, parseInt(e.target.value) || 0)}
                      min="0"
                      max={addon.maxQuantity || 10}
                      className="w-16 text-center"
                    />
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addAddon(addon)}
                      disabled={selectedQuantity >= (addon.maxQuantity || 10)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {selectedQuantity > 0 && showPricing && (
                    <div className="text-right">
                      <p className="font-medium text-green-600">
                        ${(selectedQuantity * addon.price).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {selectedQuantity} × ${addon.price.toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Selected Add-ons Summary */}
      {selectedAddons.length > 0 && showPricing && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-green-800 flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Add-ons Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {selectedAddons.map((selectedAddon) => {
              const addon = availableAddons.find(a => a.id === selectedAddon.addonId);
              if (!addon) return null;

              return (
                <div key={selectedAddon.addonId} className="flex justify-between text-sm">
                  <span>
                    {addon.name} × {selectedAddon.quantity}
                  </span>
                  <span className="font-medium">
                    ${selectedAddon.totalPrice.toFixed(2)}
                  </span>
                </div>
              );
            })}
            <Separator />
            <div className="flex justify-between font-semibold text-green-800">
              <span>Total Add-ons:</span>
              <span>${getTotalAddonCost().toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Text */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Add-ons marked "Requires Approval" need staff confirmation before your appointment</p>
        <p>• Pricing may vary based on location and specific requirements</p>
        <p>• Contact us if you need a custom service not listed above</p>
      </div>
    </div>
  );
} 