"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DigitalSignaturePad } from "./digital-signature-pad"
import { SignatureVerification } from "./signature-verification"
import { Video, Mic, FileText, Users, Clock, Shield } from "lucide-react"

interface Signer {
  id: string
  name: string
  email: string
  verified: boolean
  signatureRequired: boolean
  signatureCompleted: boolean
}

interface Document {
  id: string
  name: string
  type: string
  pages: number
  requiresSignature: boolean
}

interface RONSessionInterfaceProps {
  sessionId: string
  documents: Document[]
  signers: Signer[]
  notaryName: string
}

export function RONSessionInterface({ sessionId, documents, signers, notaryName }: RONSessionInterfaceProps) {
  const [currentStep, setCurrentStep] = useState<"identity" | "documents" | "signatures" | "verification" | "complete">(
    "identity",
  )
  const [sessionStarted, setSessionStarted] = useState(false)
  const [signatures, setSignatures] = useState<any[]>([])

  const handleSignatureCapture = (signatureData: string, signerId: string, documentId: string) => {
    const newSignature = {
      id: `sig_${Date.now()}`,
      signerName: signers.find((s) => s.id === signerId)?.name || "Unknown",
      signatureImage: signatureData,
      timestamp: new Date().toISOString(),
      ipAddress: "192.168.1.100", // Would be actual IP in production
      documentHash: `hash_${documentId}`,
      verified: false,
    }
    setSignatures((prev) => [...prev, newSignature])
  }

  const handleVerifySignature = (signatureId: string, verified: boolean) => {
    setSignatures((prev) => prev.map((sig) => (sig.id === signatureId ? { ...sig, verified } : sig)))
  }

  const startSession = () => {
    setSessionStarted(true)
    setCurrentStep("documents")
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Session Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                RON Session: {sessionId}
              </CardTitle>
              <CardDescription>Remote Online Notarization Session with {notaryName}</CardDescription>
            </div>
            <Badge variant={sessionStarted ? "default" : "secondary"}>
              {sessionStarted ? "Active" : "Waiting to Start"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{signers.length} Signer(s)</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{documents.length} Document(s)</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm">Started: {new Date().toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4 text-gray-500" />
              <span className="text-sm">Recording Active</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Video Conference Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Video Conference
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                <div className="text-center text-white">
                  <Video className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Video conference would be integrated here</p>
                  <p className="text-sm opacity-75">Using WebRTC or third-party service</p>
                </div>
              </div>
              <div className="flex justify-center gap-2 mt-4">
                <Button size="sm" variant="outline">
                  <Mic className="h-4 w-4 mr-1" />
                  Mute
                </Button>
                <Button size="sm" variant="outline">
                  <Video className="h-4 w-4 mr-1" />
                  Camera
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Participants Panel */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Participants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{notaryName}</p>
                    <p className="text-xs text-gray-600">Notary Public</p>
                  </div>
                  <Badge>Host</Badge>
                </div>
                {signers.map((signer) => (
                  <div key={signer.id} className="flex items-center justify-between p-2 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{signer.name}</p>
                      <p className="text-xs text-gray-600">Signer</p>
                    </div>
                    <Badge variant={signer.verified ? "default" : "secondary"}>
                      {signer.verified ? "Verified" : "Pending"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Session Content */}
      {currentStep === "signatures" && (
        <div className="space-y-6">
          {documents
            .filter((doc) => doc.requiresSignature)
            .map((document) => (
              <div key={document.id}>
                <h3 className="text-lg font-semibold mb-4">Signatures Required for: {document.name}</h3>
                {signers
                  .filter((signer) => signer.signatureRequired)
                  .map((signer) => (
                    <div key={`${document.id}-${signer.id}`} className="mb-6">
                      <DigitalSignaturePad
                        signerName={signer.name}
                        documentTitle={document.name}
                        onSignatureCapture={(sig) => handleSignatureCapture(sig, signer.id, document.id)}
                      />
                    </div>
                  ))}
              </div>
            ))}
        </div>
      )}

      {currentStep === "verification" && (
        <SignatureVerification
          signatures={signatures}
          onVerifySignature={handleVerifySignature}
          notaryName={notaryName}
        />
      )}

      {/* Session Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {!sessionStarted && (
                <Button onClick={startSession} className="bg-[#A52A2A] hover:bg-[#8B1A1A]">
                  Start Session
                </Button>
              )}
              {currentStep === "documents" && (
                <Button onClick={() => setCurrentStep("signatures")}>Begin Signatures</Button>
              )}
              {currentStep === "signatures" && signatures.length > 0 && (
                <Button onClick={() => setCurrentStep("verification")}>Verify Signatures</Button>
              )}
            </div>
            <Button variant="destructive">End Session</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
