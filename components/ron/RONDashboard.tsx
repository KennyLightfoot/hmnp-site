'use client';

/**
 * RON Dashboard Component
 * 
 * A comprehensive dashboard for initiating and managing RON sessions
 * using BlueNotary integration.
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { DateTime } from 'luxon';
import axios from 'axios';

// UI Components
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Icons
import {
  FileText,
  Upload,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  Clock,
  ExternalLink,
  Video,
  RefreshCw,
  Lock,
  Shield,
  Info,
  Zap,
  Phone
} from 'lucide-react';

// Validation schema for RON session creation
const createRONSessionSchema = z.object({
  customerName: z.string().min(1, 'Full name is required'),
  customerEmail: z.string().email('Valid email is required'),
  customerPhone: z.string().min(10, 'Valid phone number is required').max(15),
  documentType: z.enum(['GENERAL', 'LOAN_SIGNING', 'POWER_OF_ATTORNEY', 'REAL_ESTATE', 'OTHER']),
  scheduledDateTime: z.string().optional(),
  notes: z.string().optional(),
});

type RONSessionFormValues = z.infer<typeof createRONSessionSchema>;

type RONSession = {
  id: string;
  status: string;
  sessionUrl: string;
  notaryName?: string;
  createdAt: string;
  expiresAt?: string;
};

export default function RONDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('new');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<boolean>(false);
  const [createdSession, setCreatedSession] = useState<RONSession | null>(null);
  const [activeSessions, setActiveSessions] = useState<RONSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form for new RON session
  const form = useForm<RONSessionFormValues>({
    resolver: zodResolver(createRONSessionSchema),
    defaultValues: {
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      documentType: 'GENERAL',
      scheduledDateTime: '',
      notes: '',
    },
  });
  
  // Load active sessions
  useEffect(() => {
    if (activeTab === 'active') {
      fetchActiveSessions();
    }
  }, [activeTab]);
  
  const fetchActiveSessions = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would fetch from your database
      // This is a placeholder for demonstration
      const response = await axios.get('/api/ron/active-sessions');
      setActiveSessions(response.data.sessions || []);
    } catch (error) {
      console.error('Failed to fetch active sessions', error);
      // For demo, show some placeholder data
      setActiveSessions([
        {
          id: 'sample-1',
          status: 'PENDING',
          sessionUrl: 'https://app.bluenotary.us/session/sample-1',
          notaryName: 'John Doe',
          createdAt: new Date().toISOString(),
          expiresAt: DateTime.now().plus({ days: 7 }).toISO() || undefined,
        },
        {
          id: 'sample-2',
          status: 'SCHEDULED',
          sessionUrl: 'https://app.bluenotary.us/session/sample-2',
          notaryName: 'Jane Smith',
          createdAt: new Date().toISOString(),
          expiresAt: DateTime.now().plus({ days: 3 }).toISO() || undefined,
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle form submission
  const onSubmit = async (data: RONSessionFormValues) => {
    setIsCreating(true);
    setCreateError(null);
    setCreateSuccess(false);
    
    try {
      // Convert form values to API request
      const apiRequest = {
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        documentTypes: [data.documentType],
        scheduledDateTime: data.scheduledDateTime || undefined,
        notes: data.notes,
      };
      
      // Call the API to create a RON session
      const response = await axios.post('/api/ron/initiate', apiRequest);
      
      if (response.data.success && response.data.session) {
        setCreateSuccess(true);
        setCreatedSession(response.data.session);
        
        // Reset form
        form.reset();
        
        // Switch to active tab after successful creation
        setTimeout(() => {
          setActiveTab('active');
          fetchActiveSessions();
        }, 3000);
      } else {
        setCreateError('Failed to create RON session. Please try again.');
      }
    } catch (error: any) {
      console.error('Error creating RON session', error);
      setCreateError(
        error.response?.data?.error ||
        'An unexpected error occurred. Please try again.'
      );
    } finally {
      setIsCreating(false);
    }
  };
  
  // Get session status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'IN_PROGRESS':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'EXPIRED':
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'FAILED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#002147] mb-2">
          Remote Online Notarization Dashboard
        </h1>
        <p className="text-gray-600 mb-6">
          Create and manage your secure RON sessions powered by BlueNotary
        </p>
        
        {/* Main tabs for dashboard sections */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-8"
        >
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="new" className="flex items-center gap-2">
              <Zap className="h-4 w-4" /> New RON Session
            </TabsTrigger>
            <TabsTrigger value="active" className="flex items-center gap-2">
              <Video className="h-4 w-4" /> Active Sessions
            </TabsTrigger>
          </TabsList>
          
          {/* New RON Session Tab */}
          <TabsContent value="new" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left column - form */}
              <Card className="border-2 border-[#002147]/10">
                <CardHeader>
                  <CardTitle>Create RON Session</CardTitle>
                  <CardDescription>
                    Fill out the form to create a new secure BlueNotary RON session
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      {/* Customer Name */}
                      <FormField
                        control={form.control}
                        name="customerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Customer Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormDescription>
                              Enter the name exactly as it appears on ID
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Customer Email */}
                      <FormField
                        control={form.control}
                        name="customerEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input 
                                type="email" 
                                placeholder="customer@example.com" 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Session invite will be sent to this email
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Customer Phone */}
                      <FormField
                        control={form.control}
                        name="customerPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="(123) 456-7890" 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Used for text notifications and verification
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Document Type */}
                      <FormField
                        control={form.control}
                        name="documentType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Document Type</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select document type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="GENERAL">General Document</SelectItem>
                                <SelectItem value="LOAN_SIGNING">Loan Signing</SelectItem>
                                <SelectItem value="POWER_OF_ATTORNEY">Power of Attorney</SelectItem>
                                <SelectItem value="REAL_ESTATE">Real Estate</SelectItem>
                                <SelectItem value="OTHER">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Select the primary document type to be notarized
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Scheduled Date/Time (optional) */}
                      <FormField
                        control={form.control}
                        name="scheduledDateTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Scheduled Date/Time (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                type="datetime-local" 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Leave blank for immediate availability
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Notes (optional) */}
                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Additional Notes (Optional)</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Any special instructions or details about this session" 
                                className="resize-none" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {createError && (
                        <Alert variant="destructive" className="mt-4">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Error</AlertTitle>
                          <AlertDescription>
                            {createError}
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      {createSuccess && (
                        <Alert className="mt-4 bg-green-50 text-green-800 border-green-100">
                          <CheckCircle2 className="h-4 w-4" />
                          <AlertTitle>Success!</AlertTitle>
                          <AlertDescription>
                            RON session created successfully. An email has been sent to the customer with instructions.
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-[#A52A2A] hover:bg-[#8B0000]"
                        disabled={isCreating}
                      >
                        {isCreating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating Session...
                          </>
                        ) : (
                          <>
                            <Lock className="mr-2 h-4 w-4" />
                            Create Secure RON Session
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
              
              {/* Right column - info/result */}
              <div className="space-y-6">
                {/* BlueNotary Info */}
                <Card className="border-blue-100 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="text-blue-800 flex items-center">
                      <Shield className="mr-2 h-5 w-5" />
                      BlueNotary RON
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 text-blue-700">
                      <p className="text-sm">
                        Our RON sessions are powered by BlueNotary, a secure and compliant platform for remote online notarization.
                      </p>
                      
                      <div className="bg-white rounded-lg p-3 border border-blue-100">
                        <h4 className="font-semibold text-sm text-blue-800">What's included:</h4>
                        <ul className="mt-2 space-y-1 text-xs">
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-3 w-3 mt-0.5 text-blue-600 flex-shrink-0" />
                            <span>Credential Analysis (ID Verification)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-3 w-3 mt-0.5 text-blue-600 flex-shrink-0" />
                            <span>Knowledge-Based Authentication (KBA)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-3 w-3 mt-0.5 text-blue-600 flex-shrink-0" />
                            <span>Secure Audio-Video Session Recording</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-3 w-3 mt-0.5 text-blue-600 flex-shrink-0" />
                            <span>Digital Notarial Certificates</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-3 w-3 mt-0.5 text-blue-600 flex-shrink-0" />
                            <span>Tamper-Evident Technology</span>
                          </li>
                        </ul>
                      </div>
                      
                      <p className="text-xs flex items-start gap-1">
                        <Info className="h-3 w-3 mt-0.5 text-blue-600 flex-shrink-0" />
                        <span>RON is legally valid in all 50 states under the Full Faith and Credit clause.</span>
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t border-blue-100 pt-4">
                    <a
                      href="https://www.bluenotary.us/how-it-works"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-700 hover:text-blue-900 flex items-center"
                    >
                      How it works <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                    <a
                      href="tel:+1-832-617-4285"
                      className="text-xs text-blue-700 hover:text-blue-900 flex items-center"
                    >
                      <Phone className="h-3 w-3 mr-1" /> Need help?
                    </a>
                  </CardFooter>
                </Card>
                
                {/* Session Result (conditionally shown) */}
                {createdSession && (
                  <Card className="border-green-100 bg-green-50">
                    <CardHeader>
                      <CardTitle className="text-green-800 flex items-center">
                        <CheckCircle2 className="mr-2 h-5 w-5" />
                        Session Created
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4 text-green-700">
                        <div className="bg-white rounded-lg p-3 border border-green-100">
                          <h4 className="font-semibold text-sm text-green-800">Session Details:</h4>
                          <div className="mt-3 space-y-2 text-sm">
                            <div>
                              <span className="font-medium">Session ID:</span>
                              <span className="ml-1 font-mono text-xs">{createdSession.id}</span>
                            </div>
                            <div>
                              <span className="font-medium">Status:</span>
                              <Badge className={`ml-2 ${getStatusBadgeColor(createdSession.status)}`}>
                                {createdSession.status}
                              </Badge>
                            </div>
                            {createdSession.expiresAt && (
                              <div>
                                <span className="font-medium">Expires:</span>
                                <span className="ml-1">
                                  {DateTime.fromISO(createdSession.expiresAt).toLocaleString(DateTime.DATETIME_FULL)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-xs flex items-start gap-1">
                          <Info className="h-3 w-3 mt-0.5 text-green-600 flex-shrink-0" />
                          <span>An email has been sent to the customer with instructions to join the session.</span>
                        </p>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t border-green-100 pt-4">
                      <a
                        href={createdSession.sessionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-700 hover:text-green-900 flex items-center text-sm font-medium"
                      >
                        View Session <ExternalLink className="h-4 w-4 ml-1" />
                      </a>
                    </CardFooter>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
          
          {/* Active Sessions Tab */}
          <TabsContent value="active" className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-[#002147]">Active RON Sessions</h2>
              <Button 
                variant="outline" 
                size="sm"
                onClick={fetchActiveSessions}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-[#002147]" />
              </div>
            ) : activeSessions.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {activeSessions.map((session) => (
                  <Card key={session.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <Badge className={getStatusBadgeColor(session.status)}>
                          {session.status}
                        </Badge>
                        <div className="text-xs text-gray-500">
                          {DateTime.fromISO(session.createdAt).toRelative()}
                        </div>
                      </div>
                      <CardTitle className="text-lg mt-2 truncate">
                        Session {session.id.slice(0, 8)}...
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="space-y-2 text-sm">
                        {session.notaryName && (
                          <div className="flex items-center gap-1 text-gray-600">
                            <span className="font-medium">Notary:</span>
                            <span>{session.notaryName}</span>
                          </div>
                        )}
                        {session.expiresAt && (
                          <div className="flex items-center gap-1 text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>Expires {DateTime.fromISO(session.expiresAt).toRelative()}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="border-t pt-3 flex justify-between">
                      <a
                        href={session.sessionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#A52A2A] hover:text-[#8B0000] text-sm flex items-center"
                      >
                        Open Session <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                      <Button variant="ghost" size="sm" className="h-8 px-2">
                        Details
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="pt-6 flex flex-col items-center justify-center text-center p-8">
                  <Video className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No active sessions</h3>
                  <p className="text-gray-500 mb-4">
                    You don't have any active RON sessions at the moment.
                  </p>
                  <Button 
                    onClick={() => setActiveTab('new')} 
                    className="bg-[#A52A2A] hover:bg-[#8B0000]"
                  >
                    <Zap className="mr-2 h-4 w-4" />
                    Create New Session
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}