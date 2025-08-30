"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ComplianceChecker } from "@/lib/audit-logger"
import { Shield, CheckCircle, XCircle, AlertTriangle, Download, Eye } from "lucide-react"

interface ComplianceRequirement {
  id: string
  requirement: string
  status: "pending" | "satisfied" | "failed"
  evidence?: string[]
  timestamp?: string
}

interface ComplianceDashboardProps {
  sessionId: string
  auditEvents: any[]
}

export function ComplianceDashboard({ sessionId, auditEvents }: ComplianceDashboardProps) {
  const [requirements, setRequirements] = useState<ComplianceRequirement[]>([])
  const [complianceScore, setComplianceScore] = useState(0)

  useEffect(() => {
    const checkedRequirements = ComplianceChecker.checkCompliance(sessionId, auditEvents)
    setRequirements(checkedRequirements)

    const satisfied = checkedRequirements.filter((req) => req.status === "satisfied").length
    const total = checkedRequirements.length
    setComplianceScore((satisfied / total) * 100)
  }, [sessionId, auditEvents])

  const getStatusIcon = (status: ComplianceRequirement["status"]) => {
    switch (status) {
      case "satisfied":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "failed":
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
    }
  }

  const getStatusBadge = (status: ComplianceRequirement["status"]) => {
    switch (status) {
      case "satisfied":
        return <Badge className="bg-green-100 text-green-800">Satisfied</Badge>
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="secondary">Pending</Badge>
    }
  }

  const exportComplianceReport = () => {
    const report = {
      sessionId,
      generatedAt: new Date().toISOString(),
      complianceScore: `${complianceScore.toFixed(1)}%`,
      requirements: requirements.map((req) => ({
        requirement: req.requirement,
        status: req.status,
        timestamp: req.timestamp,
        evidenceCount: req.evidence?.length || 0,
      })),
      auditEventsSummary: {
        totalEvents: auditEvents.length,
        eventTypes: [...new Set(auditEvents.map((e) => e.eventType))],
      },
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `compliance-report-${sessionId}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Compliance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Texas RON Compliance Status
          </CardTitle>
          <CardDescription>
            Session {sessionId} compliance with Texas Remote Online Notarization requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Compliance Score</span>
              <span className="text-2xl font-bold text-[#A52A2A]">{complianceScore.toFixed(1)}%</span>
            </div>
            <Progress value={complianceScore} className="h-3" />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {requirements.filter((r) => r.status === "satisfied").length}
                </div>
                <div className="text-sm text-gray-600">Satisfied</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {requirements.filter((r) => r.status === "pending").length}
                </div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {requirements.filter((r) => r.status === "failed").length}
                </div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Requirements</CardTitle>
          <CardDescription>Detailed status of each Texas RON requirement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {requirements.map((requirement) => (
              <div key={requirement.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-3 flex-1">
                    {getStatusIcon(requirement.status)}
                    <div>
                      <p className="font-medium text-gray-900">{requirement.requirement}</p>
                      {requirement.timestamp && (
                        <p className="text-sm text-gray-600">
                          Completed: {new Date(requirement.timestamp).toLocaleString()}
                        </p>
                      )}
                      {requirement.evidence && requirement.evidence.length > 0 && (
                        <p className="text-xs text-gray-500">Evidence: {requirement.evidence.length} audit event(s)</p>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(requirement.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Audit Trail Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Trail Summary</CardTitle>
          <CardDescription>Overview of recorded session activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#002147]">{auditEvents.length}</div>
              <div className="text-sm text-gray-600">Total Events</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#002147]">
                {[...new Set(auditEvents.map((e) => e.userId))].length}
              </div>
              <div className="text-sm text-gray-600">Participants</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#002147]">
                {auditEvents.filter((e) => e.eventType === "signature_capture").length}
              </div>
              <div className="text-sm text-gray-600">Signatures</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#002147]">{auditEvents.filter((e) => e.location).length}</div>
              <div className="text-sm text-gray-600">Geo-Located</div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2 bg-transparent">
              <Eye className="h-4 w-4" />
              View Full Audit Log
            </Button>
            <Button
              onClick={exportComplianceReport}
              className="flex items-center gap-2 bg-[#A52A2A] hover:bg-[#8B1A1A]"
            >
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Legal Certification */}
      {complianceScore === 100 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-full">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-900">Compliance Certified</h3>
                <p className="text-sm text-green-800">
                  This RON session meets all Texas Remote Online Notarization requirements
                </p>
              </div>
            </div>
            <div className="text-xs text-green-700 bg-green-100 p-3 rounded-lg">
              <strong>Legal Certification:</strong> This remote online notarization session has been conducted in full
              compliance with Texas Government Code Chapter 406, Subchapter D, and Texas Administrative Code Title 1,
              Part 4, Chapter 87. All required identity verification, audio/video recording, electronic signature
              capture, and audit trail requirements have been satisfied.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
