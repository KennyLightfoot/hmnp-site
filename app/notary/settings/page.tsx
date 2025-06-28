'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Settings, User, Bell, Shield, MapPin } from 'lucide-react';

export default function NotarySettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#002147] flex items-center">
          <Settings className="h-6 w-6 mr-2" />
          Notary Settings
        </h2>
        <p className="text-gray-600 mt-1">
          Manage your notary profile and preferences
        </p>
      </div>

      <div className="grid gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Update your notary profile and commission details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="commission-number">Commission Number</Label>
                <Input id="commission-number" placeholder="TX123456789" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="commission-expiry">Commission Expiry</Label>
                <Input id="commission-expiry" type="date" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="base-address">Base Address</Label>
              <Input id="base-address" placeholder="1234 Main St, Houston, TX 77001" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="service-radius">Service Radius (miles)</Label>
              <Select defaultValue="25">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 miles</SelectItem>
                  <SelectItem value="25">25 miles</SelectItem>
                  <SelectItem value="50">50 miles</SelectItem>
                  <SelectItem value="100">100 miles</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="bg-[#A52A2A] hover:bg-[#8B0000]">
              Update Profile
            </Button>
          </CardContent>
        </Card>

        {/* Service Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Service Preferences
            </CardTitle>
            <CardDescription>
              Configure your service availability and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="daily-capacity">Daily Booking Capacity</Label>
              <Select defaultValue="8">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4">4 bookings per day</SelectItem>
                  <SelectItem value="6">6 bookings per day</SelectItem>
                  <SelectItem value="8">8 bookings per day</SelectItem>
                  <SelectItem value="12">12 bookings per day</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-4">
              <Label>Preferred Service Types</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch id="mobile-notary" defaultChecked />
                  <Label htmlFor="mobile-notary">Mobile Notary Services</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="ron-services" defaultChecked />
                  <Label htmlFor="ron-services">Remote Online Notarization</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="loan-signing-specialist" />
                  <Label htmlFor="loan-signing-specialist">Loan Signing Services</Label>
                </div>
              </div>
            </div>
            <Button className="bg-[#A52A2A] hover:bg-[#8B0000]">
              Save Preferences
            </Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notification Settings
            </CardTitle>
            <CardDescription>
              Manage how you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>New Booking Notifications</Label>
                  <p className="text-sm text-gray-500">Get notified when new bookings are assigned</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Reminder Notifications</Label>
                  <p className="text-sm text-gray-500">Receive reminders before appointments</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-gray-500">Receive text message notifications</p>
                </div>
                <Switch />
              </div>
            </div>
            <Button className="bg-[#A52A2A] hover:bg-[#8B0000]">
              Save Notification Settings
            </Button>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Security Settings
            </CardTitle>
            <CardDescription>
              Manage your account security and access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                </div>
                <Button variant="outline" size="sm">
                  Enable 2FA
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Session Timeout</Label>
                  <p className="text-sm text-gray-500">Automatically log out after inactivity</p>
                </div>
                <Select defaultValue="30">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button variant="outline">
              Change Password
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 