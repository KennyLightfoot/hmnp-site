"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, User, UserCheck, UserX, Mail, Phone } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export interface SignerInfo {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  role: 'PRIMARY' | 'SECONDARY' | 'WITNESS';
  notificationPreference: 'EMAIL' | 'SMS' | 'BOTH';
  specialInstructions?: string;
}

interface MultiSignerFormProps {
  signers: SignerInfo[];
  onSignersChange: (signers: SignerInfo[]) => void;
  maxSigners?: number;
  showRoles?: boolean;
  showNotificationPrefs?: boolean;
}

const SIGNER_ROLES = [
  { value: 'PRIMARY', label: 'Primary Signer', icon: UserCheck },
  { value: 'SECONDARY', label: 'Additional Signer', icon: User },
  { value: 'WITNESS', label: 'Witness', icon: UserX },
];

const NOTIFICATION_PREFERENCES = [
  { value: 'EMAIL', label: 'Email Only', icon: Mail },
  { value: 'SMS', label: 'SMS Only', icon: Phone },
  { value: 'BOTH', label: 'Email & SMS', icon: Mail },
];

export default function MultiSignerForm({ 
  signers, 
  onSignersChange, 
  maxSigners = 10,
  showRoles = true,
  showNotificationPrefs = true 
}: MultiSignerFormProps) {
  const [errors, setErrors] = useState<{ [key: number]: string }>({});

  const addSigner = () => {
    if (signers.length >= maxSigners) return;
    
    const newSigner: SignerInfo = {
      name: '',
      email: '',
      phone: '',
      role: signers.length === 0 ? 'PRIMARY' : 'SECONDARY',
      notificationPreference: 'EMAIL',
      specialInstructions: ''
    };
    
    onSignersChange([...signers, newSigner]);
  };

  const removeSigner = (index: number) => {
    if (signers.length <= 1) return; // Always keep at least one signer
    
    const newSigners = signers.filter((_, i) => i !== index);
    
    // Ensure at least one PRIMARY signer remains
    if (!newSigners.some(s => s.role === 'PRIMARY') && newSigners.length > 0) {
      newSigners[0].role = 'PRIMARY';
    }
    
    onSignersChange(newSigners);
    
    // Clear any errors for removed signer
    const newErrors = { ...errors };
    delete newErrors[index];
    setErrors(newErrors);
  };

  const updateSigner = (index: number, field: keyof SignerInfo, value: string) => {
    const newSigners = [...signers];
    newSigners[index] = { ...newSigners[index], [field]: value };
    
    // If changing role to PRIMARY, ensure only one PRIMARY exists
    if (field === 'role' && value === 'PRIMARY') {
      newSigners.forEach((signer, i) => {
        if (i !== index && signer.role === 'PRIMARY') {
          newSigners[i].role = 'SECONDARY';
        }
      });
    }
    
    onSignersChange(newSigners);
    
    // Clear error for this field
    if (errors[index]) {
      const newErrors = { ...errors };
      delete newErrors[index];
      setErrors(newErrors);
    }
  };

  const validateSigners = () => {
    const newErrors: { [key: number]: string } = {};
    
    signers.forEach((signer, index) => {
      if (!signer.name.trim()) {
        newErrors[index] = 'Name is required';
      } else if (!signer.email.trim()) {
        newErrors[index] = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signer.email)) {
        newErrors[index] = 'Invalid email format';
      }
    });
    
    // Check for duplicate emails
    const emails = signers.map(s => s.email.toLowerCase());
    const duplicates = emails.filter((email, index) => emails.indexOf(email) !== index);
    
    if (duplicates.length > 0) {
      signers.forEach((signer, index) => {
        if (duplicates.includes(signer.email.toLowerCase())) {
          newErrors[index] = 'Duplicate email address';
        }
      });
    }
    
    // Ensure at least one PRIMARY signer
    if (!signers.some(s => s.role === 'PRIMARY')) {
      newErrors[0] = 'At least one primary signer is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const primarySignerCount = signers.filter(s => s.role === 'PRIMARY').length;
  const witnessCount = signers.filter(s => s.role === 'WITNESS').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Signers & Participants</h3>
          <p className="text-sm text-muted-foreground">
            Add all parties who need to be present for this notarization
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline">
            {signers.length} of {maxSigners} signers
          </Badge>
          {primarySignerCount !== 1 && (
            <Badge variant="destructive">
              {primarySignerCount} primary
            </Badge>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-medium">Primary Signers</p>
              <p className="text-sm text-muted-foreground">{primarySignerCount}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium">Additional Signers</p>
              <p className="text-sm text-muted-foreground">
                {signers.filter(s => s.role === 'SECONDARY').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <UserX className="h-5 w-5 text-purple-600" />
            <div>
              <p className="font-medium">Witnesses</p>
              <p className="text-sm text-muted-foreground">{witnessCount}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Validation Alert */}
      {primarySignerCount !== 1 && (
        <Alert>
          <AlertDescription>
            {primarySignerCount === 0 
              ? "You must designate at least one primary signer."
              : "Only one primary signer is allowed. Additional signers should be marked as 'Additional Signer'."}
          </AlertDescription>
        </Alert>
      )}

      {/* Signer Forms */}
      <div className="space-y-4">
        {signers.map((signer, index) => (
          <Card key={index} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  Signer {index + 1}
                  {showRoles && (
                    <Badge variant="secondary" className="ml-2">
                      {SIGNER_ROLES.find(r => r.value === signer.role)?.label}
                    </Badge>
                  )}
                </CardTitle>
                {signers.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSigner(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {errors[index] && (
                <Alert>
                  <AlertDescription className="text-red-600">
                    {errors[index]}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`signer-${index}-name`}>Full Name *</Label>
                  <Input
                    id={`signer-${index}-name`}
                    value={signer.name}
                    onChange={(e) => updateSigner(index, 'name', e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`signer-${index}-email`}>Email Address *</Label>
                  <Input
                    id={`signer-${index}-email`}
                    type="email"
                    value={signer.email}
                    onChange={(e) => updateSigner(index, 'email', e.target.value)}
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`signer-${index}-phone`}>Phone Number</Label>
                  <Input
                    id={`signer-${index}-phone`}
                    type="tel"
                    value={signer.phone || ''}
                    onChange={(e) => updateSigner(index, 'phone', e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>

                {showRoles && (
                  <div>
                    <Label htmlFor={`signer-${index}-role`}>Role *</Label>
                    <Select
                      value={signer.role}
                      onValueChange={(value) => updateSigner(index, 'role', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {SIGNER_ROLES.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            <div className="flex items-center gap-2">
                              <role.icon className="h-4 w-4" />
                              {role.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {showNotificationPrefs && (
                <div>
                  <Label htmlFor={`signer-${index}-notifications`}>Notification Preference</Label>
                  <Select
                    value={signer.notificationPreference}
                    onValueChange={(value) => updateSigner(index, 'notificationPreference', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select preference" />
                    </SelectTrigger>
                    <SelectContent>
                      {NOTIFICATION_PREFERENCES.map((pref) => (
                        <SelectItem key={pref.value} value={pref.value}>
                          <div className="flex items-center gap-2">
                            <pref.icon className="h-4 w-4" />
                            {pref.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor={`signer-${index}-instructions`}>Special Instructions</Label>
                <Textarea
                  id={`signer-${index}-instructions`}
                  value={signer.specialInstructions || ''}
                  onChange={(e) => updateSigner(index, 'specialInstructions', e.target.value)}
                  placeholder="Any special requirements or notes for this signer..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Signer Button */}
      {signers.length < maxSigners && (
        <Button
          type="button"
          variant="outline"
          onClick={addSigner}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Another Signer or Witness
        </Button>
      )}

      {/* Validation Button */}
      <Button
        type="button"
        onClick={validateSigners}
        variant="outline"
        className="w-full"
      >
        Validate All Signers
      </Button>
    </div>
  );
} 