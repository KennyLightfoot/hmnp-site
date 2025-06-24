"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Edit, Trash2, Plus, Package, Clock, DollarSign, Filter } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ServiceForm from './ServiceForm';
import { useToast } from '@/hooks/use-toast';

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
  bookingCount: number;
}

const SERVICE_TYPE_LABELS = {
  'STANDARD_NOTARY': 'Standard Notary',
  'EXTENDED_HOURS_NOTARY': 'Extended Hours',
  'LOAN_SIGNING_SPECIALIST': 'Loan Signing',
  'SPECIALTY_NOTARY_SERVICE': 'Specialty Service',
  'BUSINESS_SOLUTIONS': 'Business Solutions',
  'SUPPORT_SERVICE': 'Support Service'
};

export default function ServicesClient() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [filterActive, setFilterActive] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch services
  const fetchServices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterActive !== null) params.set('active', filterActive);
      if (filterType) params.set('serviceType', filterType);

      const response = await fetch(`/api/admin/services?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }

      const data = await response.json();
      setServices(data.services || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Failed to fetch services:', err);
    } finally {
      setLoading(false);
    }
  };

  // Delete service
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/services/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: "Service deleted successfully",
        });
        fetchServices();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to delete service",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete service",
        variant: "destructive",
      });
      console.error('Delete error:', err);
    }
  };

  // Toggle active status
  const handleToggleActive = async (service: Service) => {
    try {
      const response = await fetch(`/api/admin/services/${service.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          active: !service.active
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: `Service ${service.active ? 'deactivated' : 'activated'} successfully`,
        });
        fetchServices();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update service",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update service",
        variant: "destructive",
      });
      console.error('Toggle active error:', err);
    }
  };

  // Handle form success
  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingService(null);
    fetchServices();
    toast({
      title: "Success",
      description: editingService ? "Service updated successfully" : "Service created successfully",
    });
  };

  // Handle form cancel
  const handleFormCancel = () => {
    setShowForm(false);
    setEditingService(null);
  };

  // Handle edit
  const handleEdit = (service: Service) => {
    setEditingService(service);
    setShowForm(true);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  useEffect(() => {
    fetchServices();
  }, [filterActive, filterType]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500">Loading services...</div>
      </div>
    );
  }

  if (showForm) {
    return (
      <ServiceForm
        service={editingService}
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

      {/* Header with filters and actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-medium">Services ({services.length})</h2>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Filters */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={filterActive || 'all'} onValueChange={(value) => setFilterActive(value === 'all' ? null : value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterType || 'all'} onValueChange={(value) => setFilterType(value === 'all' ? null : value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(SERVICE_TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Service
          </Button>
        </div>
      </div>

      {services.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Package className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
            <p className="text-gray-500 text-center mb-4">
              {filterActive || filterType ? 'No services match your current filters.' : 'Get started by creating your first service offering.'}
            </p>
            <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Service
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {services.map((service) => (
            <Card key={service.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {service.name}
                      <Badge variant={service.active ? "default" : "secondary"}>
                        {service.active ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="outline">
                        {SERVICE_TYPE_LABELS[service.serviceType as keyof typeof SERVICE_TYPE_LABELS] || service.serviceType}
                      </Badge>
                    </CardTitle>
                    {service.description && (
                      <CardDescription className="mt-1">
                        {service.description}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(service)}
                      className="flex items-center gap-1"
                    >
                      <Edit className="h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(service.id, service.name)}
                      className="flex items-center gap-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-gray-900 flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      Price
                    </div>
                    <div className="text-gray-600">{formatCurrency(service.price)}</div>
                    {service.requiresDeposit && service.depositAmount && (
                      <div className="text-xs text-gray-500">
                        Deposit: {formatCurrency(service.depositAmount)}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Duration
                    </div>
                    <div className="text-gray-600">{service.duration} minutes</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Bookings</div>
                    <div className="text-gray-600">{service.bookingCount} bookings</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Last Updated</div>
                    <div className="text-gray-600">
                      {new Date(service.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Button
                    variant={service.active ? "outline" : "default"}
                    size="sm"
                    onClick={() => handleToggleActive(service)}
                  >
                    {service.active ? "Deactivate" : "Activate"}
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