"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, XCircle, Info, Copy, ExternalLink } from "lucide-react"

export default function GHLEnhancedDiagnosticPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const runDiagnostic = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/ghl-enhanced-diagnostic")
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
      <h1 className="text-3xl font-bold mb-6">GoHighLevel Enhanced Diagnostic</h1>

      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertTitle>Important</AlertTitle>
        <AlertDescription>
          This tool provides detailed diagnostics for your GoHighLevel integration to help identify and fix issues.
        </AlertDescription>
      </Alert>

      <div className="mb-6">
        <Button onClick={runDiagnostic} disabled={loading}>
          {loading ? "Running Diagnostics..." : "Run Diagnostics"}
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
        <Tabs defaultValue="summary">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="endpoints">Endpoint Tests</TabsTrigger>
            <TabsTrigger value="errors">Error Details</TabsTrigger>
            <TabsTrigger value="solutions">Solutions</TabsTrigger>
          </TabsList>

          <TabsContent value="summary">
            <Card>
              <CardHeader>
                <CardTitle>Diagnostic Summary</CardTitle>
                <CardDescription>Overview of your GoHighLevel API integration status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-2">API Key Status</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Value</p>
                        <p>{results.apiKeyInfo?.value || "Not available"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Format</p>
                        <p className={results.apiKeyInfo?.isPIT ? "text-green-600" : "text-red-600"}>
                          {results.apiKeyInfo?.isPIT ? "Valid PIT Format" : 'Invalid Format (should start with "pit-")'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Length</p>
                        <p>{results.apiKeyInfo?.length || 0} characters</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Validity</p>
                        <p className={results.apiKeyInfo?.isValid ? "text-green-600" : "text-red-600"}>
                          {results.apiKeyInfo?.isValid
                            ? "Valid (works with at least one endpoint)"
                            : "Invalid (doesn't work with any endpoint)"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-2">Endpoint Status</h3>
                    <div className="space-y-2">
                      {results.endpointTests?.map((test: any, index: number) => (
                        <div key={index} className="flex justify-between items-center">
                          <span>{test.name}</span>
                          {test.success ? (
                            <span className="text-green-600 flex items-center">
                              <CheckCircle className="h-4 w-4 mr-1" /> Working
                            </span>
                          ) : (
                            <span className="text-red-600 flex items-center">
                              <XCircle className="h-4 w-4 mr-1" /> Failed ({test.status} {test.statusText})
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-2">Overall Assessment</h3>
                    {results.apiKeyInfo?.isValid ? (
                      <Alert className="bg-green-50 border-green-200">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <AlertTitle className="text-green-700">Integration Working</AlertTitle>
                        <AlertDescription className="text-green-600">
                          Your GoHighLevel integration is working with at least one endpoint. Check the Endpoint Tests
                          tab for details.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Alert className="bg-red-50 border-red-200">
                        <XCircle className="h-4 w-4 text-red-500" />
                        <AlertTitle className="text-red-700">Integration Not Working</AlertTitle>
                        <AlertDescription className="text-red-600">
                          Your GoHighLevel integration is not working with any of the tested endpoints. See the
                          Solutions tab for recommendations.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="endpoints">
            <Card>
              <CardHeader>
                <CardTitle>Endpoint Test Results</CardTitle>
                <CardDescription>Detailed results for each API endpoint tested</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.endpointTests?.map((test: any, index: number) => (
                    <div
                      key={index}
                      className={`border rounded-md p-4 ${test.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{test.name}</h3>
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

                      <div className="text-sm mb-2">
                        <span className="font-medium">Endpoint:</span> {test.endpoint}
                      </div>

                      <div className="text-sm mb-2">
                        <span className="font-medium">Status:</span>{" "}
                        <span className={test.success ? "text-green-600" : "text-red-600"}>
                          {test.status} {test.statusText}
                        </span>
                      </div>

                      {test.success && test.responsePreview && (
                        <div className="mt-2">
                          <h4 className="text-sm font-medium mb-1">Response Preview:</h4>
                          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">{test.responsePreview}</pre>
                        </div>
                      )}

                      {!test.success && test.errorData && (
                        <div className="mt-2">
                          <h4 className="text-sm font-medium mb-1">Error Details:</h4>
                          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">{test.errorData}</pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="errors">
            <Card>
              <CardHeader>
                <CardTitle>Error Details</CardTitle>
                <CardDescription>Detailed error information to help troubleshoot issues</CardDescription>
              </CardHeader>
              <CardContent>
                {results.errorDetails && results.errorDetails.length > 0 ? (
                  <div className="space-y-4">
                    {results.errorDetails.map((error: any, index: number) => (
                      <div key={index} className="border border-red-200 bg-red-50 rounded-md p-4">
                        <div className="mb-2">
                          <h3 className="font-medium">Error from {error.endpoint}</h3>
                          <div className="text-sm text-red-600">Status: {error.status}</div>
                        </div>

                        <div className="mt-2">
                          <h4 className="text-sm font-medium mb-1">Error Message:</h4>
                          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">{error.message}</pre>

                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 text-xs"
                            onClick={() => copyToClipboard(error.message)}
                          >
                            <Copy className="h-3 w-3 mr-1" /> Copy Error Message
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>No Detailed Errors</AlertTitle>
                    <AlertDescription>
                      No detailed error information is available. This could mean there were no errors, or the errors
                      didn't provide detailed information.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="solutions">
            <Card>
              <CardHeader>
                <CardTitle>Recommended Solutions</CardTitle>
                <CardDescription>Steps to fix your GoHighLevel integration issues</CardDescription>
              </CardHeader>
              <CardContent>
                {results.recommendations && results.recommendations.length > 0 ? (
                  <div className="space-y-4">
                    {results.recommendations.map((rec: any, index: number) => (
                      <div
                        key={index}
                        className={`border rounded-md p-4 ${
                          rec.priority === "high"
                            ? "border-red-200 bg-red-50"
                            : rec.priority === "medium"
                              ? "border-yellow-200 bg-yellow-50"
                              : "border-blue-200 bg-blue-50"
                        }`}
                      >
                        <div className="mb-2">
                          <h3 className="font-medium">{rec.issue}</h3>
                          <div
                            className={`text-sm ${
                              rec.priority === "high"
                                ? "text-red-600"
                                : rec.priority === "medium"
                                  ? "text-yellow-600"
                                  : "text-blue-600"
                            }`}
                          >
                            Priority: {rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)}
                          </div>
                        </div>

                        <div className="mt-2">
                          <h4 className="text-sm font-medium mb-1">Solution:</h4>
                          <p className="text-sm">{rec.solution}</p>
                        </div>
                      </div>
                    ))}

                    <div className="mt-6">
                      <h3 className="font-medium mb-2">General Steps to Fix GoHighLevel Integration:</h3>
                      <ol className="list-decimal pl-5 space-y-2">
                        <li>Verify your GoHighLevel account is active and in good standing</li>
                        <li>
                          Generate a new Private Integration Token (PIT) in GoHighLevel
                          <ul className="list-disc pl-5 mt-1">
                            <li>Go to Settings &gt; Integrations</li>
                            <li>Click on "Create New Integration"</li>
                            <li>Select all necessary scopes (Contacts, Calendars, Workflows, etc.)</li>
                            <li>Generate a new token</li>
                          </ul>
                        </li>
                        <li>Update your environment variable with the new token</li>
                        <li>Run the diagnostic again to verify the fix</li>
                      </ol>
                    </div>

                    <div className="mt-6">
                      <Button
                        className="flex items-center"
                        onClick={() =>
                          window.open(
                            "https://help.gohighlevel.com/support/solutions/articles/48001208518-private-integration-token-pit-",
                            "_blank",
                          )
                        }
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        GoHighLevel PIT Documentation
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Alert>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <AlertTitle>No Issues Detected</AlertTitle>
                    <AlertDescription>
                      No specific issues were detected with your GoHighLevel integration. If you're still experiencing
                      problems, please contact GoHighLevel support.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

