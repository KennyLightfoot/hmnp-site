"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Eye, Shield, Clock } from "lucide-react"

interface SignatureRecord {
  id: string
  signerName: string
  signatureImage: string
  timestamp: string
  ipAddress: string
  documentHash: string
  verified: boolean
}

interface SignatureVerificationProps {
  signatures: SignatureRecord[]
  onVerifySignature: (signatureId: string, verified: boolean) => void
  notaryName: string
}

export function SignatureVerification({ signatures, onVerifySignature, notaryName }: SignatureVerificationProps) {
  const [selectedSignature, setSelectedSignature] = useState<string | null>(null)

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Signature Verification
          </CardTitle>
          <CardDescription>
            As the notary public, verify each signature before completing the notarization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {signatures.map((signature) => (
              <div key={signature.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{signature.signerName}</h4>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTimestamp(signature.timestamp)}
                    </p>
                  </div>
                  <Badge
                    variant={signature.verified ? "default" : "secondary"}
                    className={signature.verified ? "bg-green-100 text-green-800" : ""}
                  >
                    {signature.verified ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </>
                    ) : (
                      "Pending Verification"
                    )}
                  </Badge>
                </div>

                {/* Signature Preview */}
                <div className="mb-3">
                  <div className="border rounded-lg p-2 bg-gray-50 max-w-md">
                    <img
                      src={signature.signatureImage || "/placeholder.svg"}
                      alt={`${signature.signerName}'s signature`}
                      className="max-h-20 w-auto"
                    />
                  </div>
                </div>

                {/* Signature Details */}
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                  <div>
                    <span className="font-medium">IP Address:</span> {signature.ipAddress}
                  </div>
                  <div>
                    <span className="font-medium">Document Hash:</span>
                    <code className="ml-1 text-xs">{signature.documentHash.substring(0, 16)}...</code>
                  </div>
                </div>

                {/* Verification Actions */}
                {!signature.verified && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => setSelectedSignature(signature.id)}
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      Review
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => onVerifySignature(signature.id, true)}
                      className="bg-green-600 hover:bg-green-700 flex items-center gap-1"
                    >
                      <CheckCircle className="h-3 w-3" />
                      Verify
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onVerifySignature(signature.id, false)}
                      className="flex items-center gap-1"
                    >
                      <XCircle className="h-3 w-3" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Notary Certification */}
          {signatures.every((sig) => sig.verified) && signatures.length > 0 && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h4 className="font-medium text-green-900">All Signatures Verified</h4>
              </div>
              <p className="text-sm text-green-800 mb-3">
                I, <strong>{notaryName}</strong>, a Notary Public in and for the State of Texas, hereby certify that all
                signatures have been verified and the signers have been properly identified in accordance with Texas
                notary law.
              </p>
              <div className="text-xs text-green-700">
                <strong>Verification completed:</strong> {formatTimestamp(new Date().toISOString())}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
