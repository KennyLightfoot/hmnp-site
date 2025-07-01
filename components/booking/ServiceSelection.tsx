"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FrontendServiceType } from '@/lib/types/service-types';
import { Clock, DollarSign } from 'lucide-react';

interface ServiceOption {
  id: string;
  key: FrontendServiceType;
  name: string;
  description: string;
  duration: number;
  price: number;
  requiresDeposit: boolean;
  depositAmount: number;
}

interface ServiceSelectionProps {
  services: ServiceOption[];
  selectedService: ServiceOption | null;
  onServiceSelect: (service: ServiceOption) => void;
  loading?: boolean;
}

export function ServiceSelection({ 
  services, 
  selectedService, 
  onServiceSelect, 
  loading = false 
}: ServiceSelectionProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Service</h2>
        <p className="text-gray-600">Select the notary service that best fits your needs</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <Card 
            key={service.id} 
            className={`cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${
              selectedService?.id === service.id 
                ? 'ring-2 ring-indigo-600 shadow-lg' 
                : 'hover:border-indigo-300'
            }`}
            onClick={() => onServiceSelect(service)}
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{service.name}</CardTitle>
                <Badge variant="secondary" className="text-lg font-semibold">
                  ${service.price}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4">{service.description}</p>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {service.duration} min
                </div>
                
                {service.requiresDeposit && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    ${service.depositAmount} deposit
                  </div>
                )}
              </div>
              
              {selectedService?.id === service.id && (
                <div className="mt-3 p-2 bg-indigo-50 rounded-md">
                  <p className="text-sm text-indigo-700 font-medium">
                    ✓ Selected
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}