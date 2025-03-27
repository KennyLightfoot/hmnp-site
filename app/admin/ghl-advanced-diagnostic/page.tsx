"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, XCircle, Info } from "lucide-react"

export default function GHLAdvancedDiagnosticPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const runDiagnostic = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/ghl-debug")
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

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">GoHighLevel Advanced Diagnostic</h1>

      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertTitle>Important</AlertTitle>
        <AlertDescription>
          This tool performs a deep analysis of your GoHighLevel integration to identify the exact issues.
        </AlertDescription>
      </Alert>

      <div className="mb-6">
        <Button onClick={runDiagnostic} disabled={loading}>
          {loading ? "Running Diagnostic..." : "Run Diagnostic"}
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
            <TabsTrigger value="auth">Authentication</TabsTrigger>
            <TabsTrigger value="env">Environment</TabsTrigger>
            <TabsTrigger value="network">Network</TabsTrigger>
          </TabsList>

          <TabsContent value="summary">
            <Card>
              <CardHeader>
                <CardTitle>Diagnostic Summary</CardTitle>
                <CardDescription>Overall status of your GoHighLevel integration</CardDescription>
              </CardHeader>
              <CardContent>
                {results.success ? (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <AlertTitle className="text-green-700">Success</AlertTitle>
                    <AlertDescription className="text-green-600">
                      At least one authentication method is working correctly.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="bg-red-50 border-red-200">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <AlertTitle className="text-red-700">Error</AlertTitle>
                    <AlertDescription className="text-red-600">
                      All authentication methods failed. See the Authentication tab for details.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="mt-4">
                  <h3 className="font-medium mb-2">Quick Recommendations:</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    {!results.success && (
                      <li className="text-red-600">
                        Your API key is not working with any authentication method. You may need to generate a new API
                        key.
                      </li>
                    )}

                    {results.networkTest && !results.networkTest.success && (
                      <li className="text-red-600">
                        Network connectivity to GoHighLevel API is failing. Check your network/firewall settings.
                      </li>
                    )}

                    {results.environmentVariables && !results.environmentVariables.GHL_API_KEY && (
                      <li className="text-red-600">GHL_API_KEY environment variable is not set.</li>
                    )}

                    {results.authTests && results.authTests.some((test: any) => test.success) && (
                      <li className="text-green-600">
                        Working authentication method found:{" "}
                        {results.authTests.find((test: any) => test.success)?.method}
                      </li>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="auth">
            <Card>
              <CardHeader>
                <CardTitle>Authentication Tests</CardTitle>
                <CardDescription>Results of testing different authentication methods</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.authTests.map((test: any, index: number) => (
                    <div key={index} className="border rounded-md p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{test.method}</h3>
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

                      <div className="text-sm text-gray-600 mb-2">Status: {test.status || "N/A"}</div>

                      {test.error && <div className="text-sm text-red-600 mb-2">Error: {test.error}</div>}

                      <div className="mt-2">
                        <h4 className="text-sm font-medium mb-1">Headers Used:</h4>
                        <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                          {JSON.stringify(test.headers, null, 2)}
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <h3 className="font-medium mb-2">Recommendations:</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    {results.authTests && !results.authTests.some((test: any) => test.success) && (
                      <>
                        <li>Generate a new API key in your GoHighLevel account</li>
                        <li>Ensure your API key has the necessary permissions</li>
                        <li>Check that your account is active and in good standing</li>
                      </>
                    )}

                    {results.authTests && results.authTests.some((test: any) => test.success) && (
                      <li className="text-green-600">
                        Use the {results.authTests.find((test: any) => test.success)?.method} authentication method in
                        your code
                      </li>
                    )}
                  </ul>
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
                  {Object.entries(results.environmentVariables || {}).map(([key, value]: [string, any]) => (
                    <div key={key} className="flex justify-between border-b pb-2">
                      <span className="font-medium">{key}</span>
                      <span className={value === "Not set" ? "text-red-600" : "text-green-600"}>{value}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <h3 className="font-medium mb-2">Recommendations:</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    {Object.entries(results.environmentVariables || {})
                      .filter(([_, value]) => value === "Not set")
                      .map(([key]) => (
                        <li key={key} className="text-red-600">
                          Set the {key} environment variable
                        </li>
                      ))}

                    {Object.entries(results.environmentVariables || {}).every(([_, value]) => value !== "Not set") && (
                      <li className="text-green-600">All required environment variables are set</li>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="network">
            <Card>
              <CardHeader>
                <CardTitle>Network Connectivity</CardTitle>
                <CardDescription>Status of network connectivity to GoHighLevel API</CardDescription>
              </CardHeader>
              <CardContent>
                {results.networkTest && results.networkTest.success ? (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <AlertTitle className="text-green-700">Success</AlertTitle>
                    <AlertDescription className="text-green-600">
                      Network connectivity to GoHighLevel API is working correctly.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="bg-red-50 border-red-200">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <AlertTitle className="text-red-700">Error</AlertTitle>
                    <AlertDescription className="text-red-600">
                      {results.networkTest?.error || "Network connectivity to GoHighLevel API is failing."}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="mt-4 bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium mb-2">Network Test Details:</h3>
                  <pre className="text-xs overflow-auto p-2 bg-gray-100 rounded">
                    {JSON.stringify(results.networkTest || {}, null, 2)}
                  </pre>
                </div>

                <div className="mt-4 bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium mb-2">Server Information:</h3>
                  <pre className="text-xs overflow-auto p-2 bg-gray-100 rounded">
                    {JSON.stringify(results.serverInfo || {}, null, 2)}
                  </pre>
                </div>

                <div className="mt-6">
                  <h3 className="font-medium mb-2">Recommendations:</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    {results.networkTest && !results.networkTest.success && (
                      <>
                        <li>Check your network/firewall settings</li>
                        <li>Ensure your server can reach services.leadconnectorhq.com</li>
                        <li>Verify that outbound HTTPS connections are allowed</li>
                      </>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

