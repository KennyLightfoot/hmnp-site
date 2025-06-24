"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Edit, Trash2, Plus, MapPin } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ServiceAreaForm from './ServiceAreaForm';
import { useToast } from '@/hooks/use-toast';

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

export default function ServiceAreasClient() {
  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingArea, setEditingArea] = useState<ServiceArea | null>(null);
  const { toast } = useToast();

  // Fetch service areas
  const fetchServiceAreas = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/service-areas');
      
      if (!response.ok) {
        throw new Error('Failed to fetch service areas');
      }

      const data = await response.json();
      setServiceAreas(data.serviceAreas || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Failed to fetch service areas:', err);
    } finally {
      setLoading(false);
    }
  };

  // Delete service area
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/service-areas/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: "Service area deleted successfully",
        });
        fetchServiceAreas();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to delete service area",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete service area",
        variant: "destructive",
      });
      console.error('Delete error:', err);
    }
  };

  // Toggle active status
  const handleToggleActive = async (area: ServiceArea) => {
    try {
      const response = await fetch(`/api/admin/service-areas/${area.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          active: !area.active
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: `Service area ${area.active ? 'deactivated' : 'activated'} successfully`,
        });
        fetchServiceAreas();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update service area",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update service area",
        variant: "destructive",
      });
      console.error('Toggle active error:', err);
    }
  };

  // Handle form success
  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingArea(null);
    fetchServiceAreas();
    toast({
      title: "Success",
      description: editingArea ? "Service area updated successfully" : "Service area created successfully",
    });
  };

  // Handle form cancel
  const handleFormCancel = () => {
    setShowForm(false);
    setEditingArea(null);
  };

  // Handle edit
  const handleEdit = (area: ServiceArea) => {
    setEditingArea(area);
    setShowForm(true);
  };

  useEffect(() => {
    fetchServiceAreas();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500">Loading service areas...</div>
      </div>
    );
  }

  if (showForm) {
    return (
      <ServiceAreaForm
        serviceArea={editingArea}
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
      />
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium">Service Areas ({serviceAreas.length})</h2>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Service Area
        </Button>
      </div>

      {serviceAreas.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <MapPin className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No service areas</h3>
            <p className="text-gray-500 text-center mb-4">
              Get started by creating your first service area with polygon boundaries.
            </p>
            <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Service Area
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {serviceAreas.map((area) => (
            <Card key={area.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {area.name}
                      <Badge variant={area.active ? "default" : "secondary"}>
                        {area.active ? "Active" : "Inactive"}
                      </Badge>
                    </CardTitle>
                    {area.description && (
                      <CardDescription className="mt-1">
                        {area.description}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(area)}
                      className="flex items-center gap-1"
                    >
                      <Edit className="h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(area.id, area.name)}
                      className="flex items-center gap-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-gray-900">Fee Multiplier</div>
                    <div className="text-gray-600">{area.serviceFeeMultiplier}x</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Bookings</div>
                    <div className="text-gray-600">{area.bookingCount || 0} bookings</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Last Updated</div>
                    <div className="text-gray-600">
                      {new Date(area.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Button
                    variant={area.active ? "outline" : "default"}
                    size="sm"
                    onClick={() => handleToggleActive(area)}
                  >
                    {area.active ? "Deactivate" : "Activate"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 