'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import axios from 'axios';

const CalendarSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();
  const watchAllFields = watch();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/business-settings?category=booking');
      
      if (response.data.success) {
        const bookingSettings = response.data.settings.booking || {};
        
        // Set form values
        setValue('maxBookingsPerDay', parseInt(bookingSettings.maxBookingsPerDay || '10'));
        setValue('allowWeekendBookings', bookingSettings.allowWeekendBookings === 'true');
        setValue('minAdvanceBookingHours', parseInt(bookingSettings.minAdvanceBookingHours || '24'));
        setValue('maxAdvanceBookingDays', parseInt(bookingSettings.maxAdvanceBookingDays || '30'));
        setValue('businessStartHour', bookingSettings.businessStartHour || '08');
        setValue('businessEndHour', bookingSettings.businessEndHour || '18');
        setValue('businessTimeZone', bookingSettings.businessTimeZone || 'America/Chicago');
        setValue('holidayRestrictions', bookingSettings.holidayRestrictions || '');
        setValue('slotDurationMinutes', parseInt(bookingSettings.slotDurationMinutes || '30'));
      }
    } catch (err) {
      console.error('Error fetching calendar settings:', err);
      setError('Failed to load calendar settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setSaving(true);
      
      // Convert settings to format expected by API
      const settingsToSave = [
        {
          key: 'maxBookingsPerDay',
          value: data.maxBookingsPerDay.toString(),
          dataType: 'number',
          category: 'booking'
        },
        {
          key: 'allowWeekendBookings',
          value: data.allowWeekendBookings.toString(),
          dataType: 'boolean',
          category: 'booking'
        },
        {
          key: 'minAdvanceBookingHours',
          value: data.minAdvanceBookingHours.toString(),
          dataType: 'number',
          category: 'booking'
        },
        {
          key: 'maxAdvanceBookingDays',
          value: data.maxAdvanceBookingDays.toString(),
          dataType: 'number',
          category: 'booking'
        },
        {
          key: 'businessStartHour',
          value: data.businessStartHour,
          dataType: 'string',
          category: 'booking'
        },
        {
          key: 'businessEndHour',
          value: data.businessEndHour,
          dataType: 'string',
          category: 'booking'
        },
        {
          key: 'businessTimeZone',
          value: data.businessTimeZone,
          dataType: 'string',
          category: 'booking'
        },
        {
          key: 'holidayRestrictions',
          value: data.holidayRestrictions,
          dataType: 'string',
          category: 'booking'
        },
        {
          key: 'slotDurationMinutes',
          value: data.slotDurationMinutes.toString(),
          dataType: 'number',
          category: 'booking'
        },
      ];
      
      const response = await axios.post('/api/admin/business-settings', {
        settings: settingsToSave
      });
      
      if (response.data.success) {
        toast({
          title: 'Settings saved successfully',
          description: 'Your calendar settings have been updated.',
          variant: 'success',
        });
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (err) {
      console.error('Error saving calendar settings:', err);
      toast({
        title: 'Error saving settings',
        description: err.message || 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center p-8">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-4">Loading calendar settings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendar Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="maxBookingsPerDay">Max Bookings Per Day</Label>
            <Input
              id="maxBookingsPerDay"
              type="number"
              min={1}
              max={50}
              {...register('maxBookingsPerDay', { required: true, min: 1, max: 50 })}
            />
            {errors.maxBookingsPerDay && (
              <p className="text-sm text-red-500">Please enter a valid number (1-50)</p>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="allowWeekendBookings"
              checked={watchAllFields.allowWeekendBookings}
              onCheckedChange={(checked) => setValue('allowWeekendBookings', checked)}
            />
            <Label htmlFor="allowWeekendBookings">Allow Weekend Bookings</Label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="businessStartHour">Business Start Hour</Label>
              <Input
                id="businessStartHour"
                type="number"
                min={0}
                max={23}
                {...register('businessStartHour', { required: true, min: 0, max: 23 })}
              />
              {errors.businessStartHour && (
                <p className="text-sm text-red-500">Please enter a valid number (0-23)</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="businessEndHour">Business End Hour</Label>
              <Input
                id="businessEndHour"
                type="number"
                min={1}
                max={24}
                {...register('businessEndHour', { required: true, min: 1, max: 24 })}
              />
              {errors.businessEndHour && (
                <p className="text-sm text-red-500">Please enter a valid number (1-24)</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="businessTimeZone">Business Timezone</Label>
            <Select 
              onValueChange={(value) => setValue('businessTimeZone', value)} 
              value={watchAllFields.businessTimeZone || 'America/Chicago'}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="minAdvanceBookingHours">Minimum Advance Booking (Hours)</Label>
            <Input
              id="minAdvanceBookingHours"
              type="number"
              min={0}
              max={168}
              {...register('minAdvanceBookingHours', { required: true, min: 0, max: 168 })}
            />
            {errors.minAdvanceBookingHours && (
              <p className="text-sm text-red-500">Please enter a valid number (0-168)</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="maxAdvanceBookingDays">Maximum Advance Booking (Days)</Label>
            <Input
              id="maxAdvanceBookingDays"
              type="number"
              min={1}
              max={365}
              {...register('maxAdvanceBookingDays', { required: true, min: 1, max: 365 })}
            />
            {errors.maxAdvanceBookingDays && (
              <p className="text-sm text-red-500">Please enter a valid number (1-365)</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="slotDurationMinutes">Appointment Slot Duration (Minutes)</Label>
            <Select 
              onValueChange={(value) => setValue('slotDurationMinutes', parseInt(value))} 
              value={watchAllFields.slotDurationMinutes?.toString() || '30'}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">60 minutes (1 hour)</SelectItem>
                <SelectItem value="90">90 minutes (1.5 hours)</SelectItem>
                <SelectItem value="120">120 minutes (2 hours)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="holidayRestrictions">Holiday Restrictions (comma-separated dates, MM/DD format)</Label>
            <Input
              id="holidayRestrictions"
              placeholder="12/25,01/01,07/04"
              {...register('holidayRestrictions')}
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? (
              <>
                <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></span>
                Saving...
              </>
            ) : 'Save Settings'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CalendarSettings;
