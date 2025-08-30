"use client"

import type React from "react"
import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PenTool, RotateCcw, Check } from "lucide-react"

interface DigitalSignaturePadProps {
  onSignatureCapture: (signature: string) => void
  signerName: string
  documentTitle: string
  required?: boolean
}

export function DigitalSignaturePad({
  onSignatureCapture,
  signerName,
  documentTitle,
  required = true,
}: DigitalSignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)
  const [signatureData, setSignatureData] = useState<string>("")

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    // Set drawing styles
    ctx.strokeStyle = "#000000"
    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
  }, [])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let x, y
    if ("touches" in e) {
      x = e.touches[0].clientX - rect.left
      y = e.touches[0].clientY - rect.top
    } else {
      x = e.clientX - rect.left
      y = e.clientY - rect.top
    }

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let x, y
    if ("touches" in e) {
      e.preventDefault()
      x = e.touches[0].clientX - rect.left
      y = e.touches[0].clientY - rect.top
    } else {
      x = e.clientX - rect.left
      y = e.clientY - rect.top
    }

    ctx.lineTo(x, y)
    ctx.stroke()
    setHasSignature(true)
  }

  const stopDrawing = () => {
    setIsDrawing(false)
    if (hasSignature && canvasRef.current) {
      const dataURL = canvasRef.current.toDataURL("image/png")
      setSignatureData(dataURL)
    }
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
    setSignatureData("")
  }

  const acceptSignature = () => {
    if (signatureData) {
      onSignatureCapture(signatureData)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PenTool className="h-5 w-5" />
          Digital Signature Required
          {required && <Badge variant="destructive">Required</Badge>}
        </CardTitle>
        <CardDescription>
          <strong>{signerName}</strong>, please sign below to authorize the notarization of{" "}
          <strong>{documentTitle}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Signature Canvas */}
        <div className="relative border-2 border-dashed border-gray-300 rounded-lg bg-white">
          <canvas
            ref={canvasRef}
            className="w-full h-48 cursor-crosshair touch-none"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
          {!hasSignature && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center text-gray-400">
                <PenTool className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">Sign here using your mouse, finger, or stylus</p>
              </div>
            </div>
          )}
        </div>

        {/* Signature Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={clearSignature}
            disabled={!hasSignature}
            className="flex items-center gap-2 bg-transparent"
          >
            <RotateCcw className="h-4 w-4" />
            Clear
          </Button>
          <Button
            onClick={acceptSignature}
            disabled={!hasSignature}
            className="flex items-center gap-2 bg-[#A52A2A] hover:bg-[#8B1A1A] flex-1"
          >
            <Check className="h-4 w-4" />
            Accept Signature
          </Button>
        </div>

        {/* Legal Notice */}
        <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
          <strong>Legal Notice:</strong> By signing above, you acknowledge that:
          <ul className="mt-1 space-y-1 list-disc list-inside">
            <li>This signature is legally binding and equivalent to your handwritten signature</li>
            <li>You are signing this document voluntarily and understand its contents</li>
            <li>This signature will be recorded and stored as part of the notarization record</li>
            <li>You have verified your identity to the notary public</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
