"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, UserPlus, MapPin, Clock, DollarSign, Star, 
  TrendingUp, Award, Calendar, FileText, Settings,
  BarChart3, Navigation, AlertCircle, CheckCircle2
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

// Types for multi-notary operations
interface NotaryProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED';
  onboardingStatus: 'PENDING' | 'DOCUMENTS_REVIEW' | 'TRAINING' | 'APPROVED' | 'REJECTED';
  certificationNumber: string;
  certificationExpiry: Date;
  serviceAreas: ServiceArea[];
  availability: NotaryAvailability;
  performance: NotaryPerformance;
  commission: CommissionSettings;
  documents: NotaryDocument[];
}

interface ServiceArea {
  id: string;
  name: string;
  type: 'PRIMARY' | 'SECONDARY';
  maxDistance: number;
  isActive: boolean;
}

interface NotaryAvailability {
  weeklySchedule: {
    [key: string]: { start: string; end: string; isAvailable: boolean };
  };
  currentCapacity: number;
  maxCapacity: number;
  nextAvailable: Date;
}

interface NotaryPerformance {
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  averageRating: number;
  totalRatings: number;
  onTimeRate: number;
  revenue: number;
  monthlyGrowth: number;
}

interface CommissionSettings {
  type: 'PERCENTAGE' | 'FIXED' | 'TIERED';
  rate: number;
  minimumPayout: number;
  payoutSchedule: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
  totalEarned: number;
  pendingPayout: number;
}

interface NotaryDocument {
  id: string;
  type: 'CERTIFICATION' | 'INSURANCE' | 'BACKGROUND_CHECK' | 'CONTRACT' | 'TAX_FORM';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  uploadedAt: Date;
  expiryDate?: Date;
  fileName: string;
}

export default function NotaryManagementPage() {
  const [notaries, setNotaries] = useState<NotaryProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedNotary, setSelectedNotary] = useState<NotaryProfile | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const fetchNotaries = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/notaries');
      if (response.ok) {
        const data = await response.json();
        setNotaries(data.notaries || []);
      }
    } catch (error) {
      console.error('Failed to fetch notaries:', error);
      toast({
        title: "Error loading notaries",
        description: "Please refresh the page and try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotaries();
  }, []);

  const filteredNotaries = notaries.filter(notary => 
    filterStatus === 'ALL' || notary.status === filterStatus
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800';
      case 'SUSPENDED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOnboardingStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'DOCUMENTS_REVIEW': return 'bg-blue-100 text-blue-800';
      case 'TRAINING': return 'bg-purple-100 text-purple-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusUpdate = async (notaryId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/notaries/${notaryId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        await fetchNotaries();
        toast({ title: "Status updated successfully" });
      }
    } catch (error) {
      toast({
        title: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const calculateCommission = (notary: NotaryProfile) => {
    const { commission, performance } = notary;
    switch (commission.type) {
      case 'PERCENTAGE':
        return (performance.revenue * commission.rate) / 100;
      case 'FIXED':
        return performance.completedBookings * commission.rate;
      case 'TIERED':
        // Tiered commission logic would be more complex
        return (performance.revenue * commission.rate) / 100;
      default:
        return 0;
    }
  };

  const totalStats = {
    activeNotaries: notaries.filter(n => n.status === 'ACTIVE').length,
    pendingOnboarding: notaries.filter(n => n.onboardingStatus === 'PENDING').length,
    totalRevenue: notaries.reduce((sum, n) => sum + n.performance.revenue, 0),
    averageRating: notaries.reduce((sum, n) => sum + n.performance.averageRating, 0) / notaries.length || 0,
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Multi-Notary Operations</h1>
          <p className="text-muted-foreground">
            Manage your notary team, track performance, and scale your business
          </p>
        </div>
        
        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Notaries</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
              <SelectItem value="SUSPENDED">Suspended</SelectItem>
            </SelectContent>
          </Select>
          
          <Dialog open={isOnboardingOpen} onOpenChange={setIsOnboardingOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Notary
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Onboard New Notary</DialogTitle>
                <DialogDescription>
                  Start the onboarding process for a new mobile notary
                </DialogDescription>
              </DialogHeader>
              <NotaryOnboardingForm onClose={() => setIsOnboardingOpen(false)} onSuccess={fetchNotaries} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Notaries</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.activeNotaries}</div>
            <p className="text-xs text-muted-foreground">
              {totalStats.pendingOnboarding} pending onboarding
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalStats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.averageRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Team average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capacity</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {notaries.reduce((sum, n) => sum + n.availability.currentCapacity, 0)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Current utilization
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="overview">Team Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="areas">Service Areas</TabsTrigger>
          <TabsTrigger value="schedule">Scheduling</TabsTrigger>
          <TabsTrigger value="commissions">Commissions</TabsTrigger>
        </TabsList>

        {/* Team Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4">
            {filteredNotaries.map((notary) => (
              <Card key={notary.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={`/api/avatars/${notary.id}`} />
                      <AvatarFallback>{notary.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold">{notary.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{notary.email}</span>
                        <span>•</span>
                        <span>{notary.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getStatusColor(notary.status)}>
                          {notary.status}
                        </Badge>
                        <Badge className={getOnboardingStatusColor(notary.onboardingStatus)}>
                          {notary.onboardingStatus.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-medium">{notary.performance.completedBookings} bookings</div>
                      <div className="text-sm text-muted-foreground">
                        ⭐ {notary.performance.averageRating.toFixed(1)} rating
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">${notary.performance.revenue.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">revenue</div>
                    </div>
                    <Select
                      value={notary.status}
                      onValueChange={(value) => handleStatusUpdate(notary.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                        <SelectItem value="SUSPENDED">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-lg font-semibold">{notary.availability.currentCapacity}%</div>
                    <div className="text-xs text-muted-foreground">Capacity</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">{notary.performance.onTimeRate}%</div>
                    <div className="text-xs text-muted-foreground">On-time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">{notary.serviceAreas.length}</div>
                    <div className="text-xs text-muted-foreground">Areas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">${calculateCommission(notary).toFixed(0)}</div>
                    <div className="text-xs text-muted-foreground">Commission</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Compare individual notary performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {notaries.map((notary) => (
                  <div key={notary.id} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">{notary.name}</h4>
                      <Badge variant={notary.performance.averageRating >= 4.5 ? "default" : "secondary"}>
                        ⭐ {notary.performance.averageRating.toFixed(1)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Completion Rate</span>
                          <span>{((notary.performance.completedBookings / notary.performance.totalBookings) * 100).toFixed(0)}%</span>
                        </div>
                        <Progress value={(notary.performance.completedBookings / notary.performance.totalBookings) * 100} />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>On-time Rate</span>
                          <span>{notary.performance.onTimeRate}%</span>
                        </div>
                        <Progress value={notary.performance.onTimeRate} />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Capacity</span>
                          <span>{notary.availability.currentCapacity}%</span>
                        </div>
                        <Progress value={notary.availability.currentCapacity} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Service Areas Tab */}
        <TabsContent value="areas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Area Assignments</CardTitle>
              <CardDescription>Manage geographic coverage and territories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notaries.map((notary) => (
                  <div key={notary.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium">{notary.name}</h4>
                      <Button variant="outline" size="sm">
                        <MapPin className="h-4 w-4 mr-2" />
                        Edit Areas
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {notary.serviceAreas.map((area) => (
                        <Badge key={area.id} variant={area.type === 'PRIMARY' ? "default" : "secondary"}>
                          {area.name} ({area.maxDistance}mi)
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scheduling Tab */}
        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Availability</CardTitle>
              <CardDescription>Monitor capacity and schedule optimization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notaries.map((notary) => (
                  <div key={notary.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{notary.name}</h4>
                      <div className="text-sm text-muted-foreground">
                        Next available: {notary.availability.nextAvailable.toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {notary.availability.currentCapacity}% / {notary.availability.maxCapacity}%
                        </div>
                        <div className="text-xs text-muted-foreground">Current / Max Capacity</div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        View Schedule
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Commissions Tab */}
        <TabsContent value="commissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Commission Management</CardTitle>
              <CardDescription>Track earnings and payout schedules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notaries.map((notary) => (
                  <div key={notary.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium">{notary.name}</h4>
                        <div className="text-sm text-muted-foreground">
                          {notary.commission.type} • {notary.commission.payoutSchedule}
                        </div>
                      </div>
                      <Badge variant="outline">
                        {notary.commission.type === 'PERCENTAGE' ? `${notary.commission.rate}%` : `$${notary.commission.rate}`}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="font-medium">${notary.commission.totalEarned.toLocaleString()}</div>
                        <div className="text-muted-foreground">Total Earned</div>
                      </div>
                      <div>
                        <div className="font-medium">${notary.commission.pendingPayout.toLocaleString()}</div>
                        <div className="text-muted-foreground">Pending Payout</div>
                      </div>
                      <div>
                        <div className="font-medium">${calculateCommission(notary).toFixed(0)}</div>
                        <div className="text-muted-foreground">This Period</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Notary Onboarding Form Component
function NotaryOnboardingForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    certificationNumber: '',
    certificationExpiry: '',
    serviceAreas: [] as string[],
    commissionRate: 25,
    commissionType: 'PERCENTAGE',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/admin/notaries/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({ title: "Notary onboarding initiated successfully" });
        onSuccess();
        onClose();
      } else {
        throw new Error('Failed to initiate onboarding');
      }
    } catch (error) {
      toast({
        title: "Onboarding failed",
        description: "Please try again or contact support",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="certificationNumber">Certification Number</Label>
          <Input
            id="certificationNumber"
            value={formData.certificationNumber}
            onChange={(e) => setFormData({ ...formData, certificationNumber: e.target.value })}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="certificationExpiry">Certification Expiry</Label>
        <Input
          id="certificationExpiry"
          type="date"
          value={formData.certificationExpiry}
          onChange={(e) => setFormData({ ...formData, certificationExpiry: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="commissionType">Commission Type</Label>
          <Select
            value={formData.commissionType}
            onValueChange={(value) => setFormData({ ...formData, commissionType: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PERCENTAGE">Percentage</SelectItem>
              <SelectItem value="FIXED">Fixed per booking</SelectItem>
              <SelectItem value="TIERED">Tiered</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="commissionRate">
            Commission Rate {formData.commissionType === 'PERCENTAGE' ? '(%)' : '($)'}
          </Label>
          <Input
            id="commissionRate"
            type="number"
            value={formData.commissionRate}
            onChange={(e) => setFormData({ ...formData, commissionRate: Number(e.target.value) })}
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          Start Onboarding
        </Button>
      </div>
    </form>
  );
}
