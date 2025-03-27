"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info, AlertTriangle, CheckCircle } from "lucide-react"

export default function GHLWorkflowGuidePage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">GoHighLevel Workflow Setup Guide</h1>

      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertTitle>Important</AlertTitle>
        <AlertDescription>
          This guide will help you set up your GoHighLevel workflows correctly to work with your website integration.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="contact">Contact Form</TabsTrigger>
          <TabsTrigger value="booking">Booking</TabsTrigger>
          <TabsTrigger value="call">Call Request</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Overview</CardTitle>
              <CardDescription>Understanding how workflows connect to your website</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>
                  GoHighLevel workflows are automated sequences that run when triggered by specific events. For your
                  website integration, you need to set up the following workflows:
                </p>

                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong>Contact Form Workflow</strong> - Triggered when someone submits a contact form
                  </li>
                  <li>
                    <strong>New Contact Workflow</strong> - Triggered when a new contact is created
                  </li>
                  <li>
                    <strong>Booking Workflow</strong> - Triggered when someone books an appointment
                  </li>
                  <li>
                    <strong>Call Request Workflow</strong> - Triggered when someone requests a call
                  </li>
                </ul>

                <Alert className="bg-amber-50 border-amber-200">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <AlertTitle className="text-amber-700">Important Note</AlertTitle>
                  <AlertDescription className="text-amber-600">
                    Each workflow must be created in GoHighLevel first, then its ID must be added to your environment
                    variables.
                  </AlertDescription>
                </Alert>

                <h3 className="text-lg font-medium mt-6">How Workflows Are Triggered</h3>

                <p>When a user submits a form on your website:</p>

                <ol className="list-decimal pl-5 space-y-2">
                  <li>Your website code creates a contact in GoHighLevel</li>
                  <li>Your code then triggers the appropriate workflow using the workflow ID</li>
                  <li>GoHighLevel executes the workflow actions (emails, SMS, etc.)</li>
                </ol>

                <h3 className="text-lg font-medium mt-6">Required Environment Variables</h3>

                <div className="bg-gray-50 p-4 rounded-md">
                  <pre className="text-sm">
                    GHL_CONTACT_FORM_WORKFLOW_ID=your-workflow-id-here GHL_NEW_CONTACT_WORKFLOW_ID=your-workflow-id-here
                    GHL_NEW_BOOKING_WORKFLOW_ID=your-workflow-id-here GHL_CALL_REQUEST_WORKFLOW_ID=your-workflow-id-here
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle>Contact Form Workflow</CardTitle>
              <CardDescription>How to set up the workflow for contact form submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Step 1: Create the Workflow in GoHighLevel</h3>

                <ol className="list-decimal pl-5 space-y-2">
                  <li>Log in to your GoHighLevel account</li>
                  <li>Go to Automations &gt; Workflows</li>
                  <li>Click "Create Workflow"</li>
                  <li>Name it "Website Contact Form"</li>
                  <li>Select "Manual" as the trigger type</li>
                  <li>Add your desired actions (email notifications, SMS, etc.)</li>
                  <li>Save the workflow</li>
                </ol>

                <Alert className="bg-blue-50 border-blue-200">
                  <Info className="h-4 w-4 text-blue-500" />
                  <AlertTitle className="text-blue-700">Tip</AlertTitle>
                  <AlertDescription className="text-blue-600">
                    You can use merge fields like {"{"}
                    {"{"} contact.firstName {"}"}
                    {"}"}, {"{"}
                    {"{"} contact.email {"}"}
                    {"}"}, etc. in your workflow actions.
                  </AlertDescription>
                </Alert>

                <h3 className="text-lg font-medium mt-6">Step 2: Get the Workflow ID</h3>

                <ol className="list-decimal pl-5 space-y-2">
                  <li>After saving, open the workflow</li>
                  <li>Look at the URL in your browser</li>
                  <li>The workflow ID is the string after "/workflows/" in the URL</li>
                  <li>
                    Example: https://app.gohighlevel.com/v2/location/12345/workflows/<strong>abc123def456</strong>/edit
                  </li>
                  <li>Copy this ID: abc123def456</li>
                </ol>

                <h3 className="text-lg font-medium mt-6">Step 3: Add to Environment Variables</h3>

                <p>Add this environment variable to your project:</p>

                <div className="bg-gray-50 p-4 rounded-md">
                  <pre className="text-sm">GHL_CONTACT_FORM_WORKFLOW_ID=abc123def456</pre>
                </div>

                <h3 className="text-lg font-medium mt-6">Step 4: Test the Workflow</h3>

                <p>
                  Use the Test Contact page we created at <code>/admin/ghl-test-contact</code> to test if your workflow
                  is triggered correctly.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="booking">
          <Card>
            <CardHeader>
              <CardTitle>Booking Workflow</CardTitle>
              <CardDescription>How to set up the workflow for appointment bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Step 1: Create the Workflow in GoHighLevel</h3>

                <ol className="list-decimal pl-5 space-y-2">
                  <li>Log in to your GoHighLevel account</li>
                  <li>Go to Automations > Workflows</li>
                  <li>Click "Create Workflow"</li>
                  <li>Name it "Website Booking Confirmation"</li>
                  <li>Select "Manual" as the trigger type</li>
                  <li>
                    Add actions like:
                    <ul className="list-disc pl-5 mt-2">
                      <li>Send confirmation email to the client</li>
                      <li>Send notification email to your team</li>
                      <li>Add a tag to the contact (e.g., "Website Booking")</li>
                      <li>Send an SMS reminder</li>
                    </ul>
                  </li>
                  <li>Save the workflow</li>
                </ol>

                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertTitle className="text-green-700">Best Practice</AlertTitle>
                  <AlertDescription className="text-green-600">
                    Include appointment details like date, time, and service type in your confirmation messages using
                    merge fields.
                  </AlertDescription>
                </Alert>

                <h3 className="text-lg font-medium mt-6">Step 2: Get the Workflow ID</h3>

                <ol className="list-decimal pl-5 space-y-2">
                  <li>After saving, open the workflow</li>
                  <li>Look at the URL in your browser</li>
                  <li>The workflow ID is the string after "/workflows/" in the URL</li>
                  <li>
                    Example: https://app.gohighlevel.com/v2/location/12345/workflows/<strong>xyz789abc123</strong>/edit
                  </li>
                  <li>Copy this ID: xyz789abc123</li>
                </ol>

                <h3 className="text-lg font-medium mt-6">Step 3: Add to Environment Variables</h3>

                <p>Add this environment variable to your project:</p>

                <div className="bg-gray-50 p-4 rounded-md">
                  <pre className="text-sm">GHL_NEW_BOOKING_WORKFLOW_ID=xyz789abc123</pre>
                </div>

                <h3 className="text-lg font-medium mt-6">Step 4: Calendar IDs</h3>

                <p>
                  You also need to set up your calendar IDs. Go to Calendars in GoHighLevel, select each calendar, and
                  copy the ID from the URL.
                </p>

                <div className="bg-gray-50 p-4 rounded-md">
                  <pre className="text-sm">
                    GHL_ESSENTIAL_CALENDAR_ID=calendar-id-here GHL_PRIORITY_CALENDAR_ID=calendar-id-here
                    GHL_LOAN_CALENDAR_ID=calendar-id-here GHL_SPECIALTY_CALENDAR_ID=calendar-id-here
                    GHL_CALLS_CALENDAR_ID=calendar-id-here
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="call">
          <Card>
            <CardHeader>
              <CardTitle>Call Request Workflow</CardTitle>
              <CardDescription>How to set up the workflow for call requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Step 1: Create the Workflow in GoHighLevel</h3>

                <ol className="list-decimal pl-5 space-y-2">
                  <li>Log in to your GoHighLevel account</li>
                  <li>Go to Automations > Workflows</li>
                  <li>Click "Create Workflow"</li>
                  <li>Name it "Website Call Request"</li>
                  <li>Select "Manual" as the trigger type</li>
                  <li>
                    Add actions like:
                    <ul className="list-disc pl-5 mt-2">
                      <li>Send confirmation email to the client</li>
                      <li>Send notification email to your team</li>
                      <li>Create a task for your team to call the client</li>
                      <li>Add a tag to the contact (e.g., "Call Requested")</li>
                    </ul>
                  </li>
                  <li>Save the workflow</li>
                </ol>

                <h3 className="text-lg font-medium mt-6">Step 2: Get the Workflow ID</h3>

                <ol className="list-decimal pl-5 space-y-2">
                  <li>After saving, open the workflow</li>
                  <li>Look at the URL in your browser</li>
                  <li>The workflow ID is the string after "/workflows/" in the URL</li>
                  <li>
                    Example: https://app.gohighlevel.com/v2/location/12345/workflows/<strong>def456ghi789</strong>/edit
                  </li>
                  <li>Copy this ID: def456ghi789</li>
                </ol>

                <h3 className="text-lg font-medium mt-6">Step 3: Add to Environment Variables</h3>

                <p>Add this environment variable to your project:</p>

                <div className="bg-gray-50 p-4 rounded-md">
                  <pre className="text-sm">GHL_CALL_REQUEST_WORKFLOW_ID=def456ghi789</pre>
                </div>

                <h3 className="text-lg font-medium mt-6">Step 4: Custom Fields</h3>

                <p>Make sure you have these custom fields created in GoHighLevel for call requests:</p>

                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong>requestedCallDate</strong> - The date the client wants to be called
                  </li>
                  <li>
                    <strong>requestedCallTime</strong> - The time the client wants to be called
                  </li>
                  <li>
                    <strong>message</strong> - Any additional message from the client
                  </li>
                </ul>

                <Alert className="bg-amber-50 border-amber-200 mt-4">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <AlertTitle className="text-amber-700">Important</AlertTitle>
                  <AlertDescription className="text-amber-600">
                    The field names in GoHighLevel must match exactly with the names used in your code.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

