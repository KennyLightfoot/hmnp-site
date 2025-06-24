"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { AlertCircle, ArrowLeft, Save, MapPin } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import PolygonEditor from '../../../components/admin/PolygonEditor';

interface ServiceArea {
  id: string;
  name: string;
  description: string | null;
  polygonCoordinates: any;
  serviceFeeMultiplier: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  bookingCount?: number;
}

interface ServiceAreaFormProps {
  serviceArea?: ServiceArea | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ServiceAreaForm({ serviceArea, onSuccess, onCancel }: ServiceAreaFormProps) {
  const [formData, setFormData] = useState({
    name: serviceArea?.name || '',
    description: serviceArea?.description || '',
    serviceFeeMultiplier: serviceArea?.serviceFeeMultiplier || 1.0,
    active: serviceArea?.active !== undefined ? serviceArea.active : true,
  });
  
  const [polygonCoordinates, setPolygonCoordinates] = useState(serviceArea?.polygonCoordinates || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!serviceArea;
  const title = isEditing ? `Edit Service Area: ${serviceArea.name}` : 'Create New Service Area';

  // Handle form field changes
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle polygon data from map editor
  const handlePolygonChange = (polygonData: any) => {
    setPolygonCoordinates(polygonData);
  };

  // Validate form
  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Service area name is required');
      return false;
    }

    if (!polygonCoordinates) {
      setError('Please draw a polygon on the map to define the service area');
      return false;
    }

    if (formData.serviceFeeMultiplier < 0.5 || formData.serviceFeeMultiplier > 5.0) {
      setError('Service fee multiplier must be between 0.5 and 5.0');
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
        ? `/api/admin/service-areas/${serviceArea.id}`
        : '/api/admin/service-areas';
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          polygonCoordinates,
          serviceFeeMultiplier: formData.serviceFeeMultiplier,
          active: formData.active,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess();
      } else {
        setError(data.error || 'Failed to save service area');
      }
    } catch (err) {
      setError('Failed to save service area');
      console.error('Form submission error:', err);
    } finally {
      setLoading(false);
    }
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
          Back to Service Areas
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500">
            {isEditing 
              ? 'Update the service area details and polygon boundaries'
              : 'Create a new service area with polygon boundaries and pricing settings'
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
          {/* Form Fields */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Service Area Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Service Area Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Houston Metro Core"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Optional description of this service area"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="multiplier">Service Fee Multiplier</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="multiplier"
                    type="number"
                    value={formData.serviceFeeMultiplier}
                    onChange={(e) => handleInputChange('serviceFeeMultiplier', parseFloat(e.target.value) || 1.0)}
                    min="0.5"
                    max="5.0"
                    step="0.1"
                    className="w-24"
                  />
                  <span className="text-sm text-gray-500">
                    (0.5x - 5.0x base pricing)
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Multiplier applied to base service prices in this area. 1.0 = normal pricing, 1.5 = 50% higher
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => handleInputChange('active', checked)}
                />
                <Label htmlFor="active">Active</Label>
                <span className="text-sm text-gray-500">
                  {formData.active ? '(Available for bookings)' : '(Hidden from customers)'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Map Editor */}
          <Card>
            <CardHeader>
              <CardTitle>Polygon Boundaries *</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Draw a polygon on the map to define the service area boundaries. 
                  Click points to create the polygon shape.
                </p>
                
                <div className="border rounded-lg overflow-hidden">
                  <PolygonEditor
                    initialPolygon={polygonCoordinates}
                    onPolygonChange={handlePolygonChange}
                    height="400px"
                  />
                </div>

                {polygonCoordinates && (
                  <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                    ✓ Polygon defined with {polygonCoordinates.coordinates?.[0]?.length - 1 || 0} points
                  </div>
                )}
              </div>
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
            {loading ? 'Saving...' : (isEditing ? 'Update Service Area' : 'Create Service Area')}
          </Button>
        </div>
      </form>
    </div>
  );
} 