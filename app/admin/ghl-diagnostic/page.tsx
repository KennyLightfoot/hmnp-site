"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, Info } from "lucide-react"

export default function GHLDiagnosticPage() {
  const [apiKey, setApiKey] = useState("")
  const [keyTestResult, setKeyTestResult] = useState<any>(null)
  const [keyTestLoading, setKeyTestLoading] = useState(false)

  const [connectionResult, setConnectionResult] = useState<any>(null)
  const [connectionLoading, setConnectionLoading] = useState(false)

  const [workflowsResult, setWorkflowsResult] = useState<any>(null)
  const [workflowsLoading, setWorkflowsLoading] = useState(false)

  const [calendarsResult, setCalendarsResult] = useState<any>(null)
  const [calendarsLoading, setCalendarsLoading] = useState(false)

  const [customFieldsResult, setCustomFieldsResult] = useState<any>(null)
  const [customFieldsLoading, setCustomFieldsLoading] = useState(false)

  // Test a specific API key
  const testApiKey = async () => {
    if (!apiKey) return

    setKeyTestLoading(true)
    setKeyTestResult(null)

    try {
      const response = await fetch("/api/admin/test-ghl-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key: apiKey }),
      })

      const result = await response.json()
      setKeyTestResult(result)
    } catch (error) {
      setKeyTestResult({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setKeyTestLoading(false)
    }
  }

  // Test the configured API connection
  const testConnection = async () => {
    setConnectionLoading(true)
    setConnectionResult(null)

    try {
      const response = await fetch("/api/admin/test-ghl-connection")
      const result = await response.json()
      setConnectionResult(result)
    } catch (error) {
      setConnectionResult({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setConnectionLoading(false)
    }
  }

  // Test workflows
  const testWorkflows = async () => {
    setWorkflowsLoading(true)
    setWorkflowsResult(null)

    try {
      const response = await fetch("/api/admin/test-ghl-workflows")
      const result = await response.json()
      setWorkflowsResult(result)
    } catch (error) {
      setWorkflowsResult({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setWorkflowsLoading(false)
    }
  }

  // Test calendars
  const testCalendars = async () => {
    setCalendarsLoading(true)
    setCalendarsResult(null)

    try {
      const response = await fetch("/api/admin/test-ghl-calendars")
      const result = await response.json()
      setCalendarsResult(result)
    } catch (error) {
      setCalendarsResult({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setCalendarsLoading(false)
    }
  }

  // Test custom fields
  const testCustomFields = async () => {
    setCustomFieldsLoading(true)
    setCustomFieldsResult(null)

    try {
      const response = await fetch("/api/admin/test-ghl-custom-fields")
      const result = await response.json()
      setCustomFieldsResult(result)
    } catch (error) {
      setCustomFieldsResult({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setCustomFieldsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">GoHighLevel Diagnostic Tool</h1>

      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertTitle>Important</AlertTitle>
        <AlertDescription>
          This tool helps diagnose issues with your GoHighLevel integration. Use it to test your API keys, connection,
          workflows, calendars, and custom fields.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="api-key">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="api-key">API Key Test</TabsTrigger>
          <TabsTrigger value="connection">Connection</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="calendars">Calendars</TabsTrigger>
          <TabsTrigger value="custom-fields">Custom Fields</TabsTrigger>
        </TabsList>

        <TabsContent value="api-key">
          <Card>
            <CardHeader>
              <CardTitle>Test API Key</CardTitle>
              <CardDescription>Enter a GoHighLevel API key to test if it works correctly.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Input
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your GoHighLevel API key"
                  className="flex-1"
                />
                <Button onClick={testApiKey} disabled={keyTestLoading}>
                  {keyTestLoading ? "Testing..." : "Test Key"}
                </Button>
              </div>

              {keyTestResult && (
                <div className="mt-4">
                  {keyTestResult.success ? (
                    <Alert className="bg-green-50 border-green-200">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <AlertTitle className="text-green-700">Success</AlertTitle>
                      <AlertDescription className="text-green-600">
                        API key is valid and working correctly.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert className="bg-red-50 border-red-200">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <AlertTitle className="text-red-700">Error</AlertTitle>
                      <AlertDescription className="text-red-600">{keyTestResult.error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="mt-4 bg-gray-50 p-4 rounded-md">
                    <h3 className="font-medium mb-2">Details:</h3>
                    <pre className="text-xs overflow-auto p-2 bg-gray-100 rounded">
                      {JSON.stringify(keyTestResult.details || {}, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col items-start">
              <h3 className="font-medium mb-2">Tips:</h3>
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li>Private Integration Tokens (PIT) start with "pit-"</li>
                <li>JWT tokens are longer and don't have a specific prefix</li>
                <li>Make sure your API key has the necessary permissions</li>
                <li>Check that your account is active and in good standing</li>
              </ul>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="connection">
          <Card>
            <CardHeader>
              <CardTitle>Test API Connection</CardTitle>
              <CardDescription>Test the connection to GoHighLevel using the configured API key.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={testConnection} disabled={connectionLoading}>
                {connectionLoading ? "Testing Connection..." : "Test Connection"}
              </Button>

              {connectionResult && (
                <div className="mt-4">
                  {connectionResult.success ? (
                    <Alert className="bg-green-50 border-green-200">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <AlertTitle className="text-green-700">Success</AlertTitle>
                      <AlertDescription className="text-green-600">
                        Connection to GoHighLevel API is working correctly.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert className="bg-red-50 border-red-200">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <AlertTitle className="text-red-700">Error</AlertTitle>
                      <AlertDescription className="text-red-600">{connectionResult.error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="mt-4 bg-gray-50 p-4 rounded-md">
                    <h3 className="font-medium mb-2">Details:</h3>
                    <pre className="text-xs overflow-auto p-2 bg-gray-100 rounded">
                      {JSON.stringify(connectionResult.details || {}, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflows">
          <Card>
            <CardHeader>
              <CardTitle>Test Workflows</CardTitle>
              <CardDescription>Check if the configured workflow IDs exist and are accessible.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={testWorkflows} disabled={workflowsLoading}>
                {workflowsLoading ? "Testing Workflows..." : "Test Workflows"}
              </Button>

              {workflowsResult && (
                <div className="mt-4">
                  {workflowsResult.success ? (
                    <Alert className="bg-green-50 border-green-200">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <AlertTitle className="text-green-700">Success</AlertTitle>
                      <AlertDescription className="text-green-600">
                        All configured workflow IDs are valid and accessible.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert className="bg-red-50 border-red-200">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <AlertTitle className="text-red-700">Error</AlertTitle>
                      <AlertDescription className="text-red-600">{workflowsResult.error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="mt-4 bg-gray-50 p-4 rounded-md">
                    <h3 className="font-medium mb-2">Workflow Status:</h3>
                    <pre className="text-xs overflow-auto p-2 bg-gray-100 rounded">
                      {JSON.stringify(workflowsResult.details?.workflowStatus || {}, null, 2)}
                    </pre>
                  </div>

                  {workflowsResult.details?.allWorkflows && (
                    <div className="mt-4 bg-gray-50 p-4 rounded-md">
                      <h3 className="font-medium mb-2">Available Workflows:</h3>
                      <pre className="text-xs overflow-auto p-2 bg-gray-100 rounded">
                        {JSON.stringify(workflowsResult.details.allWorkflows, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendars">
          <Card>
            <CardHeader>
              <CardTitle>Test Calendars</CardTitle>
              <CardDescription>Check if the configured calendar IDs exist and are accessible.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={testCalendars} disabled={calendarsLoading}>
                {calendarsLoading ? "Testing Calendars..." : "Test Calendars"}
              </Button>

              {calendarsResult && (
                <div className="mt-4">
                  {calendarsResult.success ? (
                    <Alert className="bg-green-50 border-green-200">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <AlertTitle className="text-green-700">Success</AlertTitle>
                      <AlertDescription className="text-green-600">
                        All configured calendar IDs are valid and accessible.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert className="bg-red-50 border-red-200">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <AlertTitle className="text-red-700">Error</AlertTitle>
                      <AlertDescription className="text-red-600">{calendarsResult.error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="mt-4 bg-gray-50 p-4 rounded-md">
                    <h3 className="font-medium mb-2">Calendar Status:</h3>
                    <pre className="text-xs overflow-auto p-2 bg-gray-100 rounded">
                      {JSON.stringify(calendarsResult.details?.calendarStatus || {}, null, 2)}
                    </pre>
                  </div>

                  {calendarsResult.details?.allCalendars && (
                    <div className="mt-4 bg-gray-50 p-4 rounded-md">
                      <h3 className="font-medium mb-2">Available Calendars:</h3>
                      <pre className="text-xs overflow-auto p-2 bg-gray-100 rounded">
                        {JSON.stringify(calendarsResult.details.allCalendars, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom-fields">
          <Card>
            <CardHeader>
              <CardTitle>Test Custom Fields</CardTitle>
              <CardDescription>Check if the required custom fields exist in your GoHighLevel account.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={testCustomFields} disabled={customFieldsLoading}>
                {customFieldsLoading ? "Testing Custom Fields..." : "Test Custom Fields"}
              </Button>

              {customFieldsResult && (
                <div className="mt-4">
                  {customFieldsResult.success ? (
                    <Alert className="bg-green-50 border-green-200">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <AlertTitle className="text-green-700">Success</AlertTitle>
                      <AlertDescription className="text-green-600">
                        All required custom fields exist in your GoHighLevel account.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert className="bg-red-50 border-red-200">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <AlertTitle className="text-red-700">Error</AlertTitle>
                      <AlertDescription className="text-red-600">{customFieldsResult.error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="mt-4 bg-gray-50 p-4 rounded-md">
                    <h3 className="font-medium mb-2">Custom Field Status:</h3>
                    <pre className="text-xs overflow-auto p-2 bg-gray-100 rounded">
                      {JSON.stringify(customFieldsResult.details?.customFieldStatus || {}, null, 2)}
                    </pre>
                  </div>

                  {customFieldsResult.details?.allCustomFields && (
                    <div className="mt-4 bg-gray-50 p-4 rounded-md">
                      <h3 className="font-medium mb-2">Available Custom Fields:</h3>
                      <pre className="text-xs overflow-auto p-2 bg-gray-100 rounded">
                        {JSON.stringify(customFieldsResult.details.allCustomFields, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

