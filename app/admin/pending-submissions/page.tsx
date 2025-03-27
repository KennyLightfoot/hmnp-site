"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getPendingSubmissions, retryPendingSubmissions } from "@/lib/form-fallback"

interface PendingSubmission {
  id: string
  endpoint: string
  data: any
  createdAt: number
  retryCount: number
  lastRetry: number | null
  status: "pending" | "processing" | "failed" | "completed"
  error?: string
}

export default function PendingSubmissionsPage() {
  const [submissions, setSubmissions] = useState<PendingSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [retrying, setRetrying] = useState(false)
  const [retryResults, setRetryResults] = useState<{
    total: number
    succeeded: number
    failed: number
  } | null>(null)

  useEffect(() => {
    loadSubmissions()
  }, [])

  async function loadSubmissions() {
    setLoading(true)
    try {
      const data = await getPendingSubmissions()
      setSubmissions(data)
    } catch (error) {
      console.error("Failed to load submissions:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleRetryAll() {
    setRetrying(true)
    try {
      const results = await retryPendingSubmissions()
      setRetryResults(results)
      await loadSubmissions()
    } catch (error) {
      console.error("Failed to retry submissions:", error)
    } finally {
      setRetrying(false)
    }
  }

  function formatDate(timestamp: number) {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Pending Submissions</h1>
        <div className="flex gap-4">
          <Button onClick={loadSubmissions} variant="outline" disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </Button>
          <Button onClick={handleRetryAll} disabled={retrying || submissions.length === 0}>
            {retrying ? "Retrying..." : "Retry All"}
          </Button>
        </div>
      </div>

      {retryResults && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Retry Results</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Total: {retryResults.total}</p>
            <p className="text-green-600">Succeeded: {retryResults.succeeded}</p>
            <p className="text-red-600">Failed: {retryResults.failed}</p>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <p>Loading submissions...</p>
      ) : submissions.length === 0 ? (
        <p>No pending submissions found.</p>
      ) : (
        <div className="grid gap-4">
          {submissions.map((submission) => (
            <Card key={submission.id}>
              <CardHeader>
                <CardTitle>
                  {submission.endpoint} - {submission.status}
                </CardTitle>
                <CardDescription>ID: {submission.id}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold">Created:</p>
                    <p>{formatDate(submission.createdAt)}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Last Retry:</p>
                    <p>{submission.lastRetry ? formatDate(submission.lastRetry) : "Never"}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Retry Count:</p>
                    <p>{submission.retryCount}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Status:</p>
                    <p
                      className={
                        submission.status === "completed"
                          ? "text-green-600"
                          : submission.status === "failed"
                            ? "text-red-600"
                            : "text-blue-600"
                      }
                    >
                      {submission.status}
                    </p>
                  </div>
                </div>

                {submission.error && (
                  <div className="mt-4">
                    <p className="font-semibold">Error:</p>
                    <p className="text-red-600">{submission.error}</p>
                  </div>
                )}

                <div className="mt-4">
                  <p className="font-semibold">Data:</p>
                  <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">
                    {JSON.stringify(submission.data, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

