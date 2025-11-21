'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Calculator, Loader2, DollarSign } from 'lucide-react'

interface QuoteResponse {
  total?: number
  breakdown?: {
    base?: number
    travel?: number
    surcharges?: number
    discounts?: number
    [key: string]: any
  }
  lineItems?: Array<{
    description: string
    amount: number
  }>
  [key: string]: any
}

export default function QuoteHelperPage() {
  const [jobDescription, setJobDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [quote, setQuote] = useState<QuoteResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!jobDescription.trim()) {
      setError('Please enter a job description')
      return
    }

    setLoading(true)
    setError(null)
    setQuote(null)

    try {
      const response = await fetch('http://localhost:4001/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: jobDescription,
          enqueue: false,
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      setQuote(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get quote')
      console.error('Quote error:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quote Helper</h1>
          <p className="text-gray-600">
            Quick tool to get pricing quotes from agents. Describe the job and get instant pricing breakdown.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Job Description
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="job-description">Describe the job</Label>
                <Textarea
                  id="job-description"
                  placeholder="e.g., 10 mile trip, 3 documents, rush order in Webster"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={4}
                  className="mt-2"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Getting Quote...
                  </>
                ) : (
                  <>
                    <Calculator className="h-4 w-4 mr-2" />
                    Get Quote
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {error && (
          <Card className="mt-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-800">{error}</p>
            </CardContent>
          </Card>
        )}

        {quote && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Quote Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Line Items */}
              {quote.lineItems && quote.lineItems.length > 0 && (
                <div className="space-y-2">
                  {quote.lineItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-700">{item.description}</span>
                      <span className="font-medium">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Breakdown Object */}
              {quote.breakdown && (
                <div className="space-y-2">
                  {quote.breakdown.base !== undefined && (
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-700">Base Service</span>
                      <span className="font-medium">{formatCurrency(quote.breakdown.base)}</span>
                    </div>
                  )}
                  {quote.breakdown.travel !== undefined && quote.breakdown.travel > 0 && (
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-700">Travel Fee</span>
                      <span className="font-medium">{formatCurrency(quote.breakdown.travel)}</span>
                    </div>
                  )}
                  {quote.breakdown.surcharges !== undefined && quote.breakdown.surcharges > 0 && (
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-700">Surcharges</span>
                      <span className="font-medium">{formatCurrency(quote.breakdown.surcharges)}</span>
                    </div>
                  )}
                  {quote.breakdown.discounts !== undefined && quote.breakdown.discounts > 0 && (
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-700">Discounts</span>
                      <span className="font-medium text-green-600">-{formatCurrency(quote.breakdown.discounts)}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Total */}
              {quote.total !== undefined && (
                <div className="pt-4 border-t-2 border-gray-300">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-2xl font-bold text-[#A52A2A]">
                      {formatCurrency(quote.total)}
                    </span>
                  </div>
                </div>
              )}

              {/* Raw JSON for debugging */}
              <details className="mt-4">
                <summary className="text-sm text-gray-500 cursor-pointer">View Raw Response</summary>
                <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto">
                  {JSON.stringify(quote, null, 2)}
                </pre>
              </details>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}



