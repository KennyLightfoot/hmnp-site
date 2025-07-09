'use client';

/**
 * Pricing Management Dashboard - Houston Mobile Notary Pros
 * Phase 2: Admin interface for dynamic pricing and promotional management
 * 
 * Features:
 * - Real-time pricing configuration
 * - Promotional campaign management
 * - Pricing analytics and insights
 * - Business rules overrides
 * - A/B testing for pricing strategies
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  DollarSign, 
  TrendingUp, 
  Settings, 
  Percent,
  Gift,
  Users,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Target,
  Zap
} from 'lucide-react';

// ============================================================================
// 📊 PRICING DASHBOARD INTERFACE
// ============================================================================

interface PricingRule {
  id: string;
  name: string;
  type: 'base_price' | 'time_multiplier' | 'service_area' | 'document_fee';
  serviceType: string;
  value: number;
  isActive: boolean;
  lastModified: string;
  modifiedBy: string;
}

interface PromotionalCampaign {
  id: string;
  code: string;
  name: string;
  type: 'percentage' | 'fixed_amount';
  value: number;
  maxValue?: number;
  minOrderValue: number;
  currentUses: number;
  maxUses?: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  eligibleServices: string[];
  customerTypes: string[];
}

interface PricingAnalytics {
  totalRevenue: number;
  averageOrderValue: number;
  discountUsage: number;
  conversionRate: number;
  topPromoCodes: Array<{ code: string; uses: number; revenue: number }>;
  revenueByService: Array<{ service: string; revenue: number; bookings: number }>;
  pricingEffectiveness: {
    dynamicPricingImpact: number;
    discountImpact: number;
    conversionImprovement: number;
  };
}

export default function PricingManagementDashboard() {
  // State management
  const [activeTab, setActiveTab] = useState('overview');
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [promotionalCampaigns, setPromotionalCampaigns] = useState<PromotionalCampaign[]>([]);
  const [pricingAnalytics, setPricingAnalytics] = useState<PricingAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isCreateRuleOpen, setIsCreateRuleOpen] = useState(false);
  const [isCreateCampaignOpen, setIsCreateCampaignOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<PricingRule | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<PromotionalCampaign | null>(null);

  // Form states
  const [newRule, setNewRule] = useState({
    name: '',
    type: 'base_price' as const,
    serviceType: '',
    value: 0,
    isActive: true
  });

  const [newCampaign, setNewCampaign] = useState({
    code: '',
    name: '',
    type: 'percentage' as const,
    value: 0,
    maxValue: undefined as number | undefined,
    minOrderValue: 0,
    maxUses: undefined as number | undefined,
    validFrom: '',
    validUntil: '',
    isActive: true,
    eligibleServices: [] as string[],
    customerTypes: [] as string[]
  });

  // Load data on component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, these would be API calls
      // For now, we'll use mock data
      setPricingRules(mockPricingRules);
      setPromotionalCampaigns(mockPromotionalCampaigns);
      setPricingAnalytics(mockPricingAnalytics);
    } catch (error) {
      setError('Failed to load pricing data');
      console.error('Dashboard loading error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRule = async () => {
    try {
      // API call to create new pricing rule
      const createdRule: PricingRule = {
        id: `rule_${Date.now()}`,
        ...newRule,
        lastModified: new Date().toISOString(),
        modifiedBy: 'Current Admin' // Would be from auth context
      };

      setPricingRules(prev => [...prev, createdRule]);
      setIsCreateRuleOpen(false);
      setNewRule({
        name: '',
        type: 'base_price',
        serviceType: '',
        value: 0,
        isActive: true
      });
    } catch (error) {
      setError('Failed to create pricing rule');
    }
  };

  const handleCreateCampaign = async () => {
    try {
      // API call to create new promotional campaign
      const createdCampaign: PromotionalCampaign = {
        id: `campaign_${Date.now()}`,
        ...newCampaign,
        currentUses: 0
      };

      setPromotionalCampaigns(prev => [...prev, createdCampaign]);
      setIsCreateCampaignOpen(false);
      setNewCampaign({
        code: '',
        name: '',
        type: 'percentage',
        value: 0,
        maxValue: undefined,
        minOrderValue: 0,
        maxUses: undefined,
        validFrom: '',
        validUntil: '',
        isActive: true,
        eligibleServices: [],
        customerTypes: []
      });
    } catch (error) {
      setError('Failed to create promotional campaign');
    }
  };

  const toggleRuleStatus = async (ruleId: string) => {
    setPricingRules(prev => 
      prev.map(rule => 
        rule.id === ruleId 
          ? { ...rule, isActive: !rule.isActive, lastModified: new Date().toISOString() }
          : rule
      )
    );
  };

  const toggleCampaignStatus = async (campaignId: string) => {
    setPromotionalCampaigns(prev =>
      prev.map(campaign =>
        campaign.id === campaignId
          ? { ...campaign, isActive: !campaign.isActive }
          : campaign
      )
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading pricing dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pricing Management</h1>
        <p className="text-gray-600">Manage dynamic pricing rules, promotional campaigns, and view pricing analytics</p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Dashboard */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pricing-rules">Pricing Rules</TabsTrigger>
          <TabsTrigger value="promotions">Promotions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Revenue Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${pricingAnalytics?.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-green-600">+12% from last month</p>
              </CardContent>
            </Card>

            {/* Average Order Value */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${pricingAnalytics?.averageOrderValue}</div>
                <p className="text-xs text-blue-600">+5% from last month</p>
              </CardContent>
            </Card>

            {/* Active Promotions */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Promotions</CardTitle>
                <Gift className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{promotionalCampaigns.filter(c => c.isActive).length}</div>
                <p className="text-xs text-gray-600">{promotionalCampaigns.length} total campaigns</p>
              </CardContent>
            </Card>

            {/* Conversion Rate */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <Target className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pricingAnalytics?.conversionRate}%</div>
                <p className="text-xs text-orange-600">+3% from last month</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common pricing management tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={() => setIsCreateCampaignOpen(true)} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Promotional Campaign
                </Button>
                <Button onClick={() => setIsCreateRuleOpen(true)} variant="outline" className="w-full">
                  <Settings className="mr-2 h-4 w-4" />
                  Add Pricing Rule
                </Button>
                <Button variant="outline" className="w-full">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Detailed Analytics
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest pricing changes and campaign updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">WINTER25 campaign activated</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Extended hours pricing updated</p>
                      <p className="text-xs text-gray-500">5 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Loyalty discount thresholds adjusted</p>
                      <p className="text-xs text-gray-500">1 day ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pricing Rules Tab */}
        <TabsContent value="pricing-rules">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Pricing Rules</h2>
                <p className="text-gray-600">Manage dynamic pricing configurations and business rules</p>
              </div>
              <Button onClick={() => setIsCreateRuleOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Rule
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rule Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Service Type</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Modified</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pricingRules.map((rule) => (
                      <TableRow key={rule.id}>
                        <TableCell className="font-medium">{rule.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{rule.type.replace('_', ' ')}</Badge>
                        </TableCell>
                        <TableCell>{rule.serviceType}</TableCell>
                        <TableCell>
                          {rule.type.includes('multiplier') ? `${rule.value}x` : `$${rule.value}`}
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={rule.isActive}
                            onCheckedChange={() => toggleRuleStatus(rule.id)}
                          />
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {new Date(rule.lastModified).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Promotions Tab */}
        <TabsContent value="promotions">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Promotional Campaigns</h2>
                <p className="text-gray-600">Manage discount codes and promotional offers</p>
              </div>
              <Button onClick={() => setIsCreateCampaignOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Campaign
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {promotionalCampaigns.map((campaign) => (
                <Card key={campaign.id} className={`${campaign.isActive ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{campaign.name}</CardTitle>
                      <Badge variant={campaign.isActive ? 'default' : 'secondary'}>
                        {campaign.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <CardDescription>Code: {campaign.code}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium">Discount:</p>
                      <p className="text-lg">
                        {campaign.type === 'percentage' 
                          ? `${(campaign.value * 100)}%` 
                          : `$${campaign.value}`}
                        {campaign.maxValue && ` (max $${campaign.maxValue})`}
                      </p>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>Usage:</span>
                      <span>{campaign.currentUses}{campaign.maxUses ? `/${campaign.maxUses}` : ''}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>Valid until:</span>
                      <span>{new Date(campaign.validUntil).toLocaleDateString()}</span>
                    </div>

                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Switch
                        checked={campaign.isActive}
                        onCheckedChange={() => toggleCampaignStatus(campaign.id)}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Pricing Analytics</h2>
              <p className="text-gray-600">Insights into pricing performance and customer behavior</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue by Service */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Service Type</CardTitle>
                  <CardDescription>Performance breakdown by service category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pricingAnalytics?.revenueByService.map((service, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{service.service}</p>
                          <p className="text-sm text-gray-500">{service.bookings} bookings</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">${service.revenue.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Promo Codes */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Promo Codes</CardTitle>
                  <CardDescription>Most successful promotional campaigns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pricingAnalytics?.topPromoCodes.map((promo, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{promo.code}</p>
                          <p className="text-sm text-gray-500">{promo.uses} uses</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">${promo.revenue.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Pricing Effectiveness */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing Strategy Effectiveness</CardTitle>
                <CardDescription>Impact of dynamic pricing and promotional strategies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      +{pricingAnalytics?.pricingEffectiveness.dynamicPricingImpact}%
                    </div>
                    <p className="text-sm text-gray-600">Dynamic Pricing Impact</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      +{pricingAnalytics?.pricingEffectiveness.discountImpact}%
                    </div>
                    <p className="text-sm text-gray-600">Discount Impact on Sales</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      +{pricingAnalytics?.pricingEffectiveness.conversionImprovement}%
                    </div>
                    <p className="text-sm text-gray-600">Conversion Improvement</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Rule Dialog */}
      <Dialog open={isCreateRuleOpen} onOpenChange={setIsCreateRuleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Pricing Rule</DialogTitle>
            <DialogDescription>
              Define a new dynamic pricing rule for your services
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rule-name">Rule Name</Label>
              <Input
                id="rule-name"
                value={newRule.name}
                onChange={(e) => setNewRule(prev => ({...prev, name: e.target.value}))}
                placeholder="e.g., Same-day service multiplier"
              />
            </div>
            <div>
              <Label htmlFor="rule-type">Rule Type</Label>
              <Select value={newRule.type} onValueChange={(value: any) => setNewRule(prev => ({...prev, type: value}))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="base_price">Base Price</SelectItem>
                  <SelectItem value="time_multiplier">Time Multiplier</SelectItem>
                  <SelectItem value="service_area">Service Area Fee</SelectItem>
                  <SelectItem value="document_fee">Document Fee</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="service-type">Service Type</Label>
              <Select value={newRule.serviceType} onValueChange={(value) => setNewRule(prev => ({...prev, serviceType: value}))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STANDARD_NOTARY">Standard Notary</SelectItem>
                  <SelectItem value="EXTENDED_HOURS">Extended Hours</SelectItem>
                  <SelectItem value="LOAN_SIGNING">Loan Signing</SelectItem>
                  <SelectItem value="RON_SERVICES">RON Services</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="rule-value">Value</Label>
              <Input
                id="rule-value"
                type="number"
                value={newRule.value}
                onChange={(e) => setNewRule(prev => ({...prev, value: parseFloat(e.target.value)}))}
                placeholder="0.00"
              />
            </div>
            <Button onClick={handleCreateRule} className="w-full">
              Create Rule
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Campaign Dialog */}
      <Dialog open={isCreateCampaignOpen} onOpenChange={setIsCreateCampaignOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Promotional Campaign</DialogTitle>
            <DialogDescription>
              Set up a new discount code or promotional offer
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="campaign-code">Promo Code</Label>
                <Input
                  id="campaign-code"
                  value={newCampaign.code}
                  onChange={(e) => setNewCampaign(prev => ({...prev, code: e.target.value.toUpperCase()}))}
                  placeholder="WINTER25"
                />
              </div>
              <div>
                <Label htmlFor="campaign-name">Campaign Name</Label>
                <Input
                  id="campaign-name"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign(prev => ({...prev, name: e.target.value}))}
                  placeholder="Winter Special Promotion"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="discount-type">Discount Type</Label>
                <Select value={newCampaign.type} onValueChange={(value: any) => setNewCampaign(prev => ({...prev, type: value}))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="discount-value">Discount Value</Label>
                <Input
                  id="discount-value"
                  type="number"
                  value={newCampaign.value}
                  onChange={(e) => setNewCampaign(prev => ({...prev, value: parseFloat(e.target.value)}))}
                  placeholder={newCampaign.type === 'percentage' ? '0.15' : '25'}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="valid-from">Valid From</Label>
                <Input
                  id="valid-from"
                  type="date"
                  value={newCampaign.validFrom}
                  onChange={(e) => setNewCampaign(prev => ({...prev, validFrom: e.target.value}))}
                />
              </div>
              <div>
                <Label htmlFor="valid-until">Valid Until</Label>
                <Input
                  id="valid-until"
                  type="date"
                  value={newCampaign.validUntil}
                  onChange={(e) => setNewCampaign(prev => ({...prev, validUntil: e.target.value}))}
                />
              </div>
            </div>

            <Button onClick={handleCreateCampaign} className="w-full">
              Create Campaign
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================================================
// 📊 MOCK DATA (In production, this would come from APIs)
// ============================================================================

const mockPricingRules: PricingRule[] = [
  {
    id: 'rule_1',
    name: 'Same-day Service Multiplier',
    type: 'time_multiplier',
    serviceType: 'STANDARD_NOTARY',
    value: 1.5,
    isActive: true,
    lastModified: '2025-01-08T10:00:00Z',
    modifiedBy: 'Admin User'
  },
  {
    id: 'rule_2',
    name: 'Extended Range Travel Fee',
    type: 'service_area',
    serviceType: 'ALL',
    value: 0.75,
    isActive: true,
    lastModified: '2025-01-07T15:30:00Z',
    modifiedBy: 'Admin User'
  },
  {
    id: 'rule_3',
    name: 'Extra Document Fee',
    type: 'document_fee',
    serviceType: 'STANDARD_NOTARY',
    value: 7,
    isActive: true,
    lastModified: '2025-01-06T09:15:00Z',
    modifiedBy: 'Admin User'
  }
];

const mockPromotionalCampaigns: PromotionalCampaign[] = [
  {
    id: 'campaign_1',
    code: 'WELCOME10',
    name: 'First-Time Customer Discount',
    type: 'percentage',
    value: 0.1,
    maxValue: 25,
    minOrderValue: 0,
    currentUses: 47,
    maxUses: undefined,
    validFrom: '2025-01-01',
    validUntil: '2025-12-31',
    isActive: true,
    eligibleServices: [],
    customerTypes: ['new']
  },
  {
    id: 'campaign_2',
    code: 'WINTER25',
    name: 'Winter Special',
    type: 'fixed_amount',
    value: 25,
    minOrderValue: 75,
    currentUses: 23,
    maxUses: 100,
    validFrom: '2025-01-01',
    validUntil: '2025-03-31',
    isActive: true,
    eligibleServices: ['STANDARD_NOTARY', 'EXTENDED_HOURS'],
    customerTypes: []
  },
  {
    id: 'campaign_3',
    code: 'LOYAL20',
    name: 'Loyalty Customer Reward',
    type: 'percentage',
    value: 0.2,
    maxValue: 50,
    minOrderValue: 0,
    currentUses: 12,
    maxUses: undefined,
    validFrom: '2025-01-01',
    validUntil: '2025-12-31',
    isActive: true,
    eligibleServices: [],
    customerTypes: ['loyalty']
  }
];

const mockPricingAnalytics: PricingAnalytics = {
  totalRevenue: 45230,
  averageOrderValue: 127,
  discountUsage: 18.5,
  conversionRate: 23.8,
  topPromoCodes: [
    { code: 'WELCOME10', uses: 47, revenue: 3240 },
    { code: 'WINTER25', uses: 23, revenue: 2180 },
    { code: 'LOYAL20', uses: 12, revenue: 1950 }
  ],
  revenueByService: [
    { service: 'Standard Notary', revenue: 18920, bookings: 187 },
    { service: 'Loan Signing', revenue: 15670, bookings: 89 },
    { service: 'Extended Hours', revenue: 7830, bookings: 72 },
    { service: 'RON Services', revenue: 2810, bookings: 94 }
  ],
  pricingEffectiveness: {
    dynamicPricingImpact: 12.3,
    discountImpact: 8.7,
    conversionImprovement: 15.2
  }
}; 