"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function GHLTestPage() {
  const [apiStatus, setApiStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [apiMessage, setApiMessage] = useState("")
  const [calendarStatus, setCalendarStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [calendarMessage, setCalendarMessage] = useState("")
  const [workflowStatus, setWorkflowStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [workflowMessage, setWorkflowMessage] = useState("")
  const [contactStatus, setContactStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [contactMessage, setContactMessage] = useState("")
  const [appointmentStatus, setAppointmentStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [appointmentMessage, setAppointmentMessage] = useState("")
  const [customFieldsStatus, setCustomFieldsStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [customFieldsMessage, setCustomFieldsMessage] = useState("")
  const [testResults, setTestResults] = useState<Record<string, any>>({})

  // Key testing states
  const [pitKey, setPitKey] = useState("pit-3ae2ef20-f255-4b04-a80b-db71698ac884")
  const [jwtKey, setJwtKey] = useState(
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2NhdGlvbl9pZCI6Im9VdllOVHcyV3Z1bDdKU0pwbHFRIiwiY29tcGFueV9pZCI6Ik1LeHhKWEd5bTQxYWNucjZ6dEQyIiwidmVyc2lvbiI6MSwiaWF0IjoxNzAxOTg5NjI4MzY5LCJzdWIiOiJ1c2VyX2lkIn0.OhG7eQuY4ufsWR7zfLDRLw6rcADC1Gr6LQfnycYLhc0",
  )
  const [keyTestStatus, setKeyTestStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [keyTestResults, setKeyTestResults] = useState<any>(null)

  // Test API Connection
  const testApiConnection = async () => {
    setApiStatus("loading")
    setApiMessage("")

    try {
      const response = await fetch("/api/admin/test-ghl-connection")
      const data = await response.json()

      if (data.success) {
        setApiStatus("success")
        setApiMessage("API connection successful!")
        setTestResults((prev) => ({ ...prev, api: data.details }))
      } else {
        setApiStatus("error")
        setApiMessage(`API connection failed: ${data.error}`)
      }
    } catch (error) {
      setApiStatus("error")
      setApiMessage(`Error testing API connection: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  // Test Calendar IDs
  const testCalendarIds = async () => {
    setCalendarStatus("loading")
    setCalendarMessage("")

    try {
      const response = await fetch("/api/admin/test-ghl-calendars")
      const data = await response.json()

      if (data.success) {
        setCalendarStatus("success")
        setCalendarMessage("Calendar IDs verified successfully!")
        setTestResults((prev) => ({ ...prev, calendars: data.details }))
      } else {
        setCalendarStatus("error")
        setCalendarMessage(`Calendar verification failed: ${data.error}`)
      }
    } catch (error) {
      setCalendarStatus("error")
      setCalendarMessage(`Error testing calendars: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  // Test Workflow IDs
  const testWorkflowIds = async () => {
    setWorkflowStatus("loading")
    setWorkflowMessage("")

    try {
      const response = await fetch("/api/admin/test-ghl-workflows")
      const data = await response.json()

      if (data.success) {
        setWorkflowStatus("success")
        setWorkflowMessage("Workflow IDs verified successfully!")
        setTestResults((prev) => ({ ...prev, workflows: data.details }))
      } else {
        setWorkflowStatus("error")
        setWorkflowMessage(`Workflow verification failed: ${data.error}`)
      }
    } catch (error) {
      setWorkflowStatus("error")
      setWorkflowMessage(`Error testing workflows: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  // Test Custom Fields
  const testCustomFields = async () => {
    setCustomFieldsStatus("loading")
    setCustomFieldsMessage("")

    try {
      const response = await fetch("/api/admin/test-ghl-custom-fields")
      const data = await response.json()

      if (data.success) {
        setCustomFieldsStatus("success")
        setCustomFieldsMessage("Custom fields verified successfully!")
        setTestResults((prev) => ({ ...prev, customFields: data.details }))
      } else {
        setCustomFieldsStatus("error")
        setCustomFieldsMessage(`Custom fields verification failed: ${data.error}`)
      }
    } catch (error) {
      setCustomFieldsStatus("error")
      setCustomFieldsMessage(`Error testing custom fields: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  // Test Contact Creation
  const testContactCreation = async () => {
    setContactStatus("loading")
    setContactMessage("")

    try {
      const response = await fetch("/api/admin/test-ghl-contact-creation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: "Test",
          lastName: "User",
          email: `test-${Date.now()}@example.com`,
          phone: "5555555555",
        }),
      })

      const data = await response.json()

      if (data.success) {
        setContactStatus("success")
        setContactMessage("Test contact created successfully!")
        setTestResults((prev) => ({ ...prev, contact: data.details }))
      } else {
        setContactStatus("error")
        setContactMessage(`Contact creation failed: ${data.error}`)
      }
    } catch (error) {
      setContactStatus("error")
      setContactMessage(`Error creating test contact: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  // Test Appointment Creation
  const testAppointmentCreation = async () => {
    setAppointmentStatus("loading")
    setAppointmentMessage("")

    try {
      const response = await fetch("/api/admin/test-ghl-appointment-creation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (data.success) {
        setAppointmentStatus("success")
        setAppointmentMessage("Test appointment created successfully!")
        setTestResults((prev) => ({ ...prev, appointment: data.details }))
      } else {
        setAppointmentStatus("error")
        setAppointmentMessage(`Appointment creation failed: ${data.error}`)
      }
    } catch (error) {
      setAppointmentStatus("error")
      setAppointmentMessage(
        `Error creating test appointment: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  // Test both API keys
  const testApiKeys = async () => {
    setKeyTestStatus("loading")
    setKeyTestResults(null)

    try {
      const response = await fetch("/api/admin/test-ghl-keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pitKey,
          jwtKey,
        }),
      })

      const data = await response.json()
      setKeyTestResults(data)

      if (data.pit.success || data.jwt.success) {
        setKeyTestStatus("success")
      } else {
        setKeyTestStatus("error")
      }
    } catch (error) {
      setKeyTestStatus("error")
      console.error("Error testing API keys:", error)
    }
  }

  // Run all tests
  const runAllTests = async () => {
    await testApiConnection()
    await testCalendarIds()
    await testWorkflowIds()
    await testCustomFields()
    await testContactCreation()
    await testAppointmentCreation()
  }

  const StatusIcon = ({ status }: { status: "idle" | "loading" | "success" | "error" }) => {
    if (status === "loading") return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
    if (status === "success") return <CheckCircle className="h-5 w-5 text-green-500" />
    if (status === "error") return <XCircle className="h-5 w-5 text-red-500" />
    return <AlertCircle className="h-5 w-5 text-gray-300" />
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">GoHighLevel Integration Test</h1>
      <p className="text-gray-500 mb-8">
        Use this utility to test your GoHighLevel integration and verify that all components are working correctly.
      </p>

      {/* API Key Testing Section */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-4">API Key Testing</h2>
        <p className="text-gray-500 mb-4">
          Test both your Private Integration Token (PIT) and JWT API key to determine which one works with the API.
        </p>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Test API Keys</CardTitle>
            <CardDescription>Enter your GoHighLevel API keys to test which one works</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pitKey">Private Integration Token (PIT)</Label>
              <Input
                id="pitKey"
                value={pitKey}
                onChange={(e) => setPitKey(e.target.value)}
                placeholder="pit-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              />
              <p className="text-xs text-gray-500">Found in Settings &gt; Integrations &gt; Private Integrations</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jwtKey">JWT API Key</Label>
              <Input
                id="jwtKey"
                value={jwtKey}
                onChange={(e) => setJwtKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              />
              <p className="text-xs text-gray-500">Found in Settings &gt; Business Profile &gt; API Key</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={testApiKeys} disabled={keyTestStatus === "loading"} className="w-full">
              {keyTestStatus === "loading" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Test Both Keys
            </Button>
          </CardFooter>
        </Card>

        {keyTestResults && (
          <div className="space-y-4">
            <Card className={`border-l-4 ${keyTestResults.pit.success ? "border-l-green-500" : "border-l-red-500"}`}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  {keyTestResults.pit.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 mr-2" />
                  )}
                  Private Integration Token (PIT)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {keyTestResults.pit.success ? (
                  <div>
                    <p className="text-green-600 font-medium">Success! This key works with the API.</p>
                    <p className="text-sm mt-2">
                      Found {keyTestResults.pit.details?.locations?.length || 0} locations.
                    </p>
                    <Alert className="mt-4">
                      <AlertTitle>Recommended Action</AlertTitle>
                      <AlertDescription>
                        Set this key as your <code className="bg-gray-100 px-1 py-0.5 rounded">GHL_API_KEY</code>{" "}
                        environment variable.
                      </AlertDescription>
                    </Alert>
                  </div>
                ) : (
                  <div>
                    <p className="text-red-600 font-medium">Failed! This key does not work with the API.</p>
                    <p className="text-sm mt-2">Error: {keyTestResults.pit.error}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className={`border-l-4 ${keyTestResults.jwt.success ? "border-l-green-500" : "border-l-red-500"}`}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  {keyTestResults.jwt.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 mr-2" />
                  )}
                  JWT API Key
                </CardTitle>
              </CardHeader>
              <CardContent>
                {keyTestResults.jwt.success ? (
                  <div>
                    <p className="text-green-600 font-medium">Success! This key works with the API.</p>
                    <p className="text-sm mt-2">
                      Found {keyTestResults.jwt.details?.locations?.length || 0} locations.
                    </p>
                    <Alert className="mt-4">
                      <AlertTitle>Recommended Action</AlertTitle>
                      <AlertDescription>
                        Set this key as your <code className="bg-gray-100 px-1 py-0.5 rounded">GHL_API_KEY</code>{" "}
                        environment variable.
                      </AlertDescription>
                    </Alert>
                  </div>
                ) : (
                  <div>
                    <p className="text-red-600 font-medium">Failed! This key does not work with the API.</p>
                    <p className="text-sm mt-2">Error: {keyTestResults.jwt.error}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Run All Tests</CardTitle>
            <CardDescription>Test all aspects of your GoHighLevel integration at once</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={runAllTests} className="w-full">
              Run All Tests
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Connection</CardTitle>
            <StatusIcon status={apiStatus} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {apiStatus === "idle"
                ? "Not Tested"
                : apiStatus === "loading"
                  ? "Testing..."
                  : apiStatus === "success"
                    ? "Connected"
                    : "Failed"}
            </div>
            {apiMessage && <p className="text-xs text-muted-foreground mt-1">{apiMessage}</p>}
          </CardContent>
          <CardFooter>
            <Button onClick={testApiConnection} variant="outline" className="w-full" disabled={apiStatus === "loading"}>
              {apiStatus === "loading" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Test API Connection
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calendar IDs</CardTitle>
            <StatusIcon status={calendarStatus} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {calendarStatus === "idle"
                ? "Not Tested"
                : calendarStatus === "loading"
                  ? "Testing..."
                  : calendarStatus === "success"
                    ? "Verified"
                    : "Failed"}
            </div>
            {calendarMessage && <p className="text-xs text-muted-foreground mt-1">{calendarMessage}</p>}
          </CardContent>
          <CardFooter>
            <Button
              onClick={testCalendarIds}
              variant="outline"
              className="w-full"
              disabled={calendarStatus === "loading"}
            >
              {calendarStatus === "loading" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Test Calendar IDs
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workflow IDs</CardTitle>
            <StatusIcon status={workflowStatus} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workflowStatus === "idle"
                ? "Not Tested"
                : workflowStatus === "loading"
                  ? "Testing..."
                  : workflowStatus === "success"
                    ? "Verified"
                    : "Failed"}
            </div>
            {workflowMessage && <p className="text-xs text-muted-foreground mt-1">{workflowMessage}</p>}
          </CardContent>
          <CardFooter>
            <Button
              onClick={testWorkflowIds}
              variant="outline"
              className="w-full"
              disabled={workflowStatus === "loading"}
            >
              {workflowStatus === "loading" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Test Workflow IDs
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custom Fields</CardTitle>
            <StatusIcon status={customFieldsStatus} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customFieldsStatus === "idle"
                ? "Not Tested"
                : customFieldsStatus === "loading"
                  ? "Testing..."
                  : customFieldsStatus === "success"
                    ? "Verified"
                    : "Failed"}
            </div>
            {customFieldsMessage && <p className="text-xs text-muted-foreground mt-1">{customFieldsMessage}</p>}
          </CardContent>
          <CardFooter>
            <Button
              onClick={testCustomFields}
              variant="outline"
              className="w-full"
              disabled={customFieldsStatus === "loading"}
            >
              {customFieldsStatus === "loading" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Test Custom Fields
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contact Creation</CardTitle>
            <StatusIcon status={contactStatus} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {contactStatus === "idle"
                ? "Not Tested"
                : contactStatus === "loading"
                  ? "Testing..."
                  : contactStatus === "success"
                    ? "Created"
                    : "Failed"}
            </div>
            {contactMessage && <p className="text-xs text-muted-foreground mt-1">{contactMessage}</p>}
          </CardContent>
          <CardFooter>
            <Button
              onClick={testContactCreation}
              variant="outline"
              className="w-full"
              disabled={contactStatus === "loading"}
            >
              {contactStatus === "loading" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Test Contact Creation
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appointment Creation</CardTitle>
            <StatusIcon status={appointmentStatus} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {appointmentStatus === "idle"
                ? "Not Tested"
                : appointmentStatus === "loading"
                  ? "Testing..."
                  : appointmentStatus === "success"
                    ? "Created"
                    : "Failed"}
            </div>
            {appointmentMessage && <p className="text-xs text-muted-foreground mt-1">{appointmentMessage}</p>}
          </CardContent>
          <CardFooter>
            <Button
              onClick={testAppointmentCreation}
              variant="outline"
              className="w-full"
              disabled={appointmentStatus === "loading"}
            >
              {appointmentStatus === "loading" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Test Appointment Creation
            </Button>
          </CardFooter>
        </Card>
      </div>

      {Object.keys(testResults).length > 0 && (
        <Tabs defaultValue="api" className="w-full">
          <TabsList className="grid grid-cols-6 mb-4">
            {Object.keys(testResults).includes("api") && <TabsTrigger value="api">API</TabsTrigger>}
            {Object.keys(testResults).includes("calendars") && <TabsTrigger value="calendars">Calendars</TabsTrigger>}
            {Object.keys(testResults).includes("workflows") && <TabsTrigger value="workflows">Workflows</TabsTrigger>}
            {Object.keys(testResults).includes("customFields") && (
              <TabsTrigger value="customFields">Custom Fields</TabsTrigger>
            )}
            {Object.keys(testResults).includes("contact") && <TabsTrigger value="contact">Contact</TabsTrigger>}
            {Object.keys(testResults).includes("appointment") && (
              <TabsTrigger value="appointment">Appointment</TabsTrigger>
            )}
          </TabsList>

          {Object.keys(testResults).includes("api") && (
            <TabsContent value="api">
              <Card>
                <CardHeader>
                  <CardTitle>API Connection Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-96">
                    {JSON.stringify(testResults.api, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {Object.keys(testResults).includes("calendars") && (
            <TabsContent value="calendars">
              <Card>
                <CardHeader>
                  <CardTitle>Calendar Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-96">
                    {JSON.stringify(testResults.calendars, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {Object.keys(testResults).includes("workflows") && (
            <TabsContent value="workflows">
              <Card>
                <CardHeader>
                  <CardTitle>Workflow Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-96">
                    {JSON.stringify(testResults.workflows, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {Object.keys(testResults).includes("customFields") && (
            <TabsContent value="customFields">
              <Card>
                <CardHeader>
                  <CardTitle>Custom Fields Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-96">
                    {JSON.stringify(testResults.customFields, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {Object.keys(testResults).includes("contact") && (
            <TabsContent value="contact">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Creation Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-96">
                    {JSON.stringify(testResults.contact, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {Object.keys(testResults).includes("appointment") && (
            <TabsContent value="appointment">
              <Card>
                <CardHeader>
                  <CardTitle>Appointment Creation Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-96">
                    {JSON.stringify(testResults.appointment, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      )}
    </div>
  )
}

