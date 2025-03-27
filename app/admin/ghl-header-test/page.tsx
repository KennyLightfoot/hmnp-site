"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, XCircle, AlertTriangle, Info, Copy } from "lucide-react"

export default function GHLHeaderTestPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const runDiagnostic = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/ghl-detailed-diagnostic")
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setResults(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runDiagnostic()
  }, [])

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => alert("Copied to clipboard!"))
      .catch((err) => console.error("Failed to copy:", err))
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">GoHighLevel Header Test</h1>

      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertTitle>Important</AlertTitle>
        <AlertDescription>
          This tool tests different header combinations to find the correct one for your GoHighLevel integration.
        </AlertDescription>
      </Alert>

      <div className="mb-6">
        <Button onClick={runDiagnostic} disabled={loading}>
          {loading ? "Running Tests..." : "Run Tests"}
        </Button>
      </div>

      {error && (
        <Alert className="mb-6 bg-red-50 border-red-200">
          <XCircle className="h-4 w-4 text-red-500" />
          <AlertTitle className="text-red-700">Error</AlertTitle>
          <AlertDescription className="text-red-600">{error}</AlertDescription>
        </Alert>
      )}

      {results && (
        <Tabs defaultValue="headers">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="headers">Header Tests</TabsTrigger>
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
            <TabsTrigger value="env">Environment Variables</TabsTrigger>
            <TabsTrigger value="apikey">API Key</TabsTrigger>
          </TabsList>

          <TabsContent value="headers">
            <Card>
              <CardHeader>
                <CardTitle>Header Test Results</CardTitle>
                <CardDescription>Testing different header combinations to find what works</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.testResults &&
                    results.testResults.map((test: any, index: number) => (
                      <div
                        key={index}
                        className={`border rounded-md p-4 ${test.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{test.testName}</h3>
                          {test.success ? (
                            <span className="text-green-600 flex items-center">
                              <CheckCircle className="h-4 w-4 mr-1" /> Working
                            </span>
                          ) : (
                            <span className="text-red-600 flex items-center">
                              <XCircle className="h-4 w-4 mr-1" /> Failed
                            </span>
                          )}
                        </div>

                        {test.status && (
                          <div className="text-sm mb-2">
                            Status:{" "}
                            <span className={test.success ? "text-green-600" : "text-red-600"}>
                              {test.status} {test.statusText}
                            </span>
                          </div>
                        )}

                        {test.error && <div className="text-sm text-red-600 mb-2">Error: {test.error}</div>}

                        {test.headers && (
                          <div className="mt-2">
                            <h4 className="text-sm font-medium mb-1">Headers Used:</h4>
                            <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                              {JSON.stringify(test.headers, null, 2)}
                            </pre>

                            {test.success && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2 text-xs"
                                onClick={() => copyToClipboard(JSON.stringify(test.headers, null, 2))}
                              >
                                <Copy className="h-3 w-3 mr-1" /> Copy Working Headers
                              </Button>
                            )}
                          </div>
                        )}

                        {test.locationId && (
                          <div className="mt-2 text-sm text-green-600">Location ID: {test.locationId}</div>
                        )}

                        {test.responsePreview && (
                          <div className="mt-2">
                            <h4 className="text-sm font-medium mb-1">Response Preview:</h4>
                            <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">{test.responsePreview}</pre>
                          </div>
                        )}
                      </div>
                    ))}
                </div>

                <div className="mt-6">
                  <h3 className="font-medium mb-2">Recommendations:</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    {results.testResults && !results.testResults.some((test: any) => test.success) && (
                      <>
                        <li className="text-red-600">
                          All header combinations failed. Check your API key and network connectivity.
                        </li>
                        <li>Generate a new API key in your GoHighLevel account</li>
                        <li>Ensure your API key has the necessary permissions</li>
                      </>
                    )}

                    {results.testResults && results.testResults.some((test: any) => test.success) && (
                      <li className="text-green-600">
                        Use the {results.testResults.find((test: any) => test.success)?.testName} header format in your
                        code
                      </li>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workflows">
            <Card>
              <CardHeader>
                <CardTitle>Workflow Validation</CardTitle>
                <CardDescription>Checking if your workflow IDs exist in your GoHighLevel account</CardDescription>
              </CardHeader>
              <CardContent>
                {results.workflowValidation && results.workflowValidation.length > 0 ? (
                  <div className="space-y-4">
                    {results.workflowValidation.map((workflow: any, index: number) => (
                      <div
                        key={index}
                        className={`border rounded-md p-4 ${workflow.exists ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{workflow.key}</h3>
                          {workflow.exists ? (
                            <span className="text-green-600 flex items-center">
                              <CheckCircle className="h-4 w-4 mr-1" /> Valid
                            </span>
                          ) : (
                            <span className="text-red-600 flex items-center">
                              <XCircle className="h-4 w-4 mr-1" /> Invalid
                            </span>
                          )}
                        </div>

                        <div className="text-sm">Value: {workflow.value || "Not set"}</div>

                        <div className="text-sm mt-1">
                          Status:{" "}
                          <span className={workflow.exists ? "text-green-600" : "text-red-600"}>{workflow.reason}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>No Workflow Data</AlertTitle>
                    <AlertDescription>
                      Could not retrieve workflow data. This may be due to authentication issues.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="mt-6">
                  <h3 className="font-medium mb-2">How to Fix Workflow Issues:</h3>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>Go to your GoHighLevel account</li>
                    <li>Navigate to Automations &gt; Workflows</li>
                    <li>Find or create the workflows you need</li>
                    <li>Copy the workflow ID from the URL when viewing a workflow</li>
                    <li>Update your environment variables with the correct workflow IDs</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="env">
            <Card>
              <CardHeader>
                <CardTitle>Environment Variables</CardTitle>
                <CardDescription>Status of your GoHighLevel environment variables</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {results.environmentVariables &&
                    Object.entries(results.environmentVariables).map(([key, value]: [string, any]) => (
                      <div key={key} className="flex justify-between border-b pb-2">
                        <span className="font-medium">{key}</span>
                        <span className={value === "Not set" ? "text-red-600" : "text-green-600"}>
                          {value === "Not set" ? "Not set" : "Set"}
                        </span>
                      </div>
                    ))}
                </div>

                <div className="mt-6">
                  <h3 className="font-medium mb-2">Required Environment Variables:</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      <strong>GHL_API_KEY</strong>: Your GoHighLevel API key (PIT format)
                    </li>
                    <li>
                      <strong>GHL_API_BASE_URL</strong>: The base URL for the GoHighLevel API (optional, defaults to
                      https://services.leadconnectorhq.com)
                    </li>
                    <li>
                      <strong>GHL_*_WORKFLOW_ID</strong>: IDs for your various workflows
                    </li>
                    <li>
                      <strong>GHL_*_CALENDAR_ID</strong>: IDs for your various calendars
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="apikey">
            <Card>
              <CardHeader>
                <CardTitle>API Key Analysis</CardTitle>
                <CardDescription>Analysis of your GoHighLevel API key format</CardDescription>
              </CardHeader>
              <CardContent>
                {results.apiKeyFormat && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="border rounded-md p-4">
                        <h3 className="font-medium mb-2">Format</h3>
                        <div className="text-sm">
                          Is PIT Format:{" "}
                          <span className={results.apiKeyFormat.isPIT ? "text-green-600" : "text-red-600"}>
                            {results.apiKeyFormat.isPIT ? "Yes" : "No"}
                          </span>
                        </div>
                      </div>

                      <div className="border rounded-md p-4">
                        <h3 className="font-medium mb-2">Length</h3>
                        <div className="text-sm">Key Length: {results.apiKeyFormat.length} characters</div>
                      </div>

                      <div className="border rounded-md p-4">
                        <h3 className="font-medium mb-2">Prefix</h3>
                        <div className="text-sm">Starts With: {results.apiKeyFormat.prefix}</div>
                      </div>

                      <div className="border rounded-md p-4">
                        <h3 className="font-medium mb-2">Suffix</h3>
                        <div className="text-sm">Ends With: {results.apiKeyFormat.suffix}</div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h3 className="font-medium mb-2">Analysis:</h3>
                      {results.apiKeyFormat.isPIT ? (
                        <Alert className="bg-green-50 border-green-200">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <AlertTitle className="text-green-700">Valid PIT Format</AlertTitle>
                          <AlertDescription className="text-green-600">
                            Your API key is in the correct PIT format (starts with "pit-").
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <Alert className="bg-red-50 border-red-200">
                          <XCircle className="h-4 w-4 text-red-500" />
                          <AlertTitle className="text-red-700">Invalid PIT Format</AlertTitle>
                          <AlertDescription className="text-red-600">
                            Your API key does not start with "pit-". GoHighLevel v2 API requires a Private Integration
                            Token (PIT).
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-6">
                  <h3 className="font-medium mb-2">How to Get a Valid API Key:</h3>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>Log in to your GoHighLevel account</li>
                    <li>Go to Settings > Integrations</li>
                    <li>Click on "Create New Integration"</li>
                    <li>Select the necessary scopes (Contacts, Calendars, Workflows, etc.)</li>
                    <li>Generate a new Private Integration Token (PIT)</li>
                    <li>Copy the token and update your GHL_API_KEY environment variable</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

