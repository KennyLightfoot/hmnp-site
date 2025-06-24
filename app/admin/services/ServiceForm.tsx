"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, ArrowLeft, Save, Package, Calculator } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Service {
  id: string;
  name: string;
  description: string | null;
  serviceType: string;
  duration: number;
  price: number;
  requiresDeposit: boolean;
  depositAmount: number | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  bookingCount?: number;
}

interface ServiceFormProps {
  service?: Service | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const SERVICE_TYPES = [
  { value: 'STANDARD_NOTARY', label: 'Standard Notary', description: 'Basic notarization services for 1-2 documents' },
  { value: 'EXTENDED_HOURS_NOTARY', label: 'Extended Hours Notary', description: 'Extended service hours for up to 5 documents' },
  { value: 'LOAN_SIGNING_SPECIALIST', label: 'Loan Signing Specialist', description: 'Specialized loan document signing services' },
  { value: 'SPECIALTY_NOTARY_SERVICE', label: 'Specialty Notary Service', description: 'Specialized notarial services and unique documents' },
  { value: 'BUSINESS_SOLUTIONS', label: 'Business Solutions', description: 'Corporate and business notarization packages' },
  { value: 'SUPPORT_SERVICE', label: 'Support Service', description: 'Additional services and support offerings' }
];

const DURATION_OPTIONS = [
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
  { value: 150, label: '2.5 hours' },
  { value: 180, label: '3 hours' }
];

export default function ServiceForm({ service, onSuccess, onCancel }: ServiceFormProps) {
  const [formData, setFormData] = useState({
    name: service?.name || '',
    description: service?.description || '',
    serviceType: service?.serviceType || '',
    duration: service?.duration || 60,
    price: service?.price || 0,
    requiresDeposit: service?.requiresDeposit || false,
    depositAmount: service?.depositAmount || 0,
    active: service?.active !== undefined ? service.active : true,
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!service;
  const title = isEditing ? `Edit Service: ${service.name}` : 'Create New Service';

  // Handle form field changes
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };

      // Auto-calculate deposit amount if not set manually
      if (field === 'price' && !prev.depositAmount) {
        newData.depositAmount = Math.round(value * 0.3); // 30% default deposit
      }

      // Clear deposit amount if deposits are disabled
      if (field === 'requiresDeposit' && !value) {
        newData.depositAmount = 0;
      }

      return newData;
    });
  };

  // Validate form
  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Service name is required');
      return false;
    }

    if (!formData.serviceType) {
      setError('Service type is required');
      return false;
    }

    if (!formData.duration || formData.duration <= 0) {
      setError('Duration must be greater than 0');
      return false;
    }

    if (formData.price < 0) {
      setError('Price cannot be negative');
      return false;
    }

    if (formData.requiresDeposit && (!formData.depositAmount || formData.depositAmount <= 0)) {
      setError('Deposit amount must be greater than 0 when deposits are required');
      return false;
    }

    if (formData.requiresDeposit && formData.depositAmount >= formData.price) {
      setError('Deposit amount must be less than the service price');
      return false;
    }

    return true;
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = isEditing 
        ? `/api/admin/services/${service.id}`
        : '/api/admin/services';
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          serviceType: formData.serviceType,
          duration: formData.duration,
          price: formData.price,
          requiresDeposit: formData.requiresDeposit,
          depositAmount: formData.requiresDeposit ? formData.depositAmount : null,
          active: formData.active,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess();
      } else {
        setError(data.error || 'Failed to save service');
      }
    } catch (err) {
      setError('Failed to save service');
      console.error('Form submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Services
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500">
            {isEditing 
              ? 'Update service details, pricing, and configuration'
              : 'Create a new service with pricing and configuration settings'
            }
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Service Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Service Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Service Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Essential Notary Services"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Brief description of this service offering"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="serviceType">Service Type *</Label>
                <Select value={formData.serviceType} onValueChange={(value) => handleInputChange('serviceType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-gray-500">{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration *</Label>
                <Select value={formData.duration.toString()} onValueChange={(value) => handleInputChange('duration', parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATION_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => handleInputChange('active', checked)}
                />
                <Label htmlFor="active">Active</Label>
                <span className="text-sm text-gray-500">
                  {formData.active ? '(Available for booking)' : '(Hidden from customers)'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Pricing Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="price">Base Price *</Label>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">$</span>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                    className="flex-1"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Base service price before any additional fees or multipliers
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="requiresDeposit"
                    checked={formData.requiresDeposit}
                    onCheckedChange={(checked) => handleInputChange('requiresDeposit', checked)}
                  />
                  <Label htmlFor="requiresDeposit">Requires Deposit</Label>
                </div>

                {formData.requiresDeposit && (
                  <div className="space-y-2 pl-6">
                    <Label htmlFor="depositAmount">Deposit Amount</Label>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">$</span>
                      <Input
                        id="depositAmount"
                        type="number"
                        value={formData.depositAmount}
                        onChange={(e) => handleInputChange('depositAmount', parseFloat(e.target.value) || 0)}
                        min="0"
                        max={formData.price}
                        step="0.01"
                        className="flex-1"
                        placeholder="0.00"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Amount due at booking (remaining: {formatCurrency(formData.price - formData.depositAmount)})
                    </p>
                  </div>
                )}
              </div>

              {/* Pricing Summary */}
              {formData.price > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <h4 className="font-medium text-gray-900">Pricing Summary</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Base Price:</span>
                      <span className="font-medium">{formatCurrency(formData.price)}</span>
                    </div>
                    {formData.requiresDeposit && (
                      <>
                        <div className="flex justify-between">
                          <span>Deposit Required:</span>
                          <span className="font-medium">{formatCurrency(formData.depositAmount)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>Remaining at Service:</span>
                          <span>{formatCurrency(formData.price - formData.depositAmount)}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          
          <Button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {loading ? 'Saving...' : (isEditing ? 'Update Service' : 'Create Service')}
          </Button>
        </div>
      </form>
    </div>
  );
} 