"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useDropzone } from "react-dropzone"
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { uploadDocuments, validateFile, type UploadedDocument, type UploadProgress } from "@/lib/document-storage"

interface DocumentUploadProps {
  documents: File[]
  onDocumentsChange: (documents: File[]) => void
  onNext: () => void
  onBack: () => void
  bookingId?: string
}

export function DocumentUpload({ documents, onDocumentsChange, onNext, onBack, bookingId }: DocumentUploadProps) {
  const [uploadErrors, setUploadErrors] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([])
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([])

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setUploadErrors([])

      // Handle rejected files
      if (rejectedFiles.length > 0) {
        const errors = rejectedFiles.map((file) => `${file.file.name}: ${file.errors[0]?.message || "Invalid file"}`)
        setUploadErrors(errors)
      }

      // Validate accepted files
      const validFiles: File[] = []
      const validationErrors: string[] = []

      acceptedFiles.forEach((file) => {
        const validation = validateFile(file)
        if (validation.valid) {
          validFiles.push(file)
        } else {
          validationErrors.push(`${file.name}: ${validation.error}`)
        }
      })

      if (validationErrors.length > 0) {
        setUploadErrors((prev) => [...prev, ...validationErrors])
      }

      // Add valid files to documents
      if (validFiles.length > 0) {
        onDocumentsChange([...documents, ...validFiles])
      }
    },
    [documents, onDocumentsChange],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".png", ".jpg", ".jpeg"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 10,
    disabled: isUploading,
  })

  const removeDocument = (index: number) => {
    const newDocuments = documents.filter((_, i) => i !== index)
    onDocumentsChange(newDocuments)
  }

  const handleUploadToStorage = async () => {
    if (documents.length === 0) return

    setIsUploading(true)
    setUploadErrors([])

    try {
      const uploaded = await uploadDocuments(documents, bookingId, setUploadProgress)

      setUploadedDocuments(uploaded)

      // Check if all uploads were successful
      const failedUploads = uploadProgress.filter((p) => p.status === "error")
      if (failedUploads.length > 0) {
        setUploadErrors(failedUploads.map((p) => `${p.filename}: ${p.error}`))
      }
    } catch (error) {
      console.error("Upload error:", error)
      setUploadErrors(["Upload failed. Please try again."])
    } finally {
      setIsUploading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const allUploadsComplete = uploadedDocuments.length === documents.length && documents.length > 0

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Your Documents</h2>
        <p className="text-gray-600">Upload the documents you need notarized. We support PDF, Word, and image files.</p>
      </div>

      {/* Upload Area */}
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-[#A52A2A] bg-red-50"
                : isUploading
                  ? "border-gray-200 bg-gray-50 cursor-not-allowed"
                  : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className={`w-12 h-12 mx-auto mb-4 ${isUploading ? "text-gray-300" : "text-gray-400"}`} />
            {isDragActive ? (
              <p className="text-[#A52A2A] font-medium">Drop your documents here...</p>
            ) : isUploading ? (
              <p className="text-gray-500">Upload in progress...</p>
            ) : (
              <div>
                <p className="text-gray-600 mb-2">Drag and drop your documents here, or click to browse</p>
                <p className="text-sm text-gray-500">Supports PDF, Word, and image files up to 10MB each</p>
              </div>
            )}
          </div>

          {/* Upload Errors */}
          {uploadErrors.length > 0 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
              <div className="flex items-center mb-2">
                <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
                <span className="text-sm font-medium text-red-800">Upload Errors:</span>
              </div>
              <ul className="text-sm text-red-700 space-y-1">
                {uploadErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Uploaded Documents */}
      {documents.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Documents ({documents.length})
              </h3>
              {!allUploadsComplete && (
                <Button
                  onClick={handleUploadToStorage}
                  disabled={isUploading}
                  className="bg-[#A52A2A] hover:bg-[#8B1A1A]"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Upload to Storage"
                  )}
                </Button>
              )}
            </div>

            <div className="space-y-3">
              {documents.map((file, index) => {
                const progress = uploadProgress.find((p) => p.filename === file.name)
                const uploaded = uploadedDocuments.find((d) => d.filename === file.name)

                return (
                  <div key={index} className="p-3 bg-gray-50 rounded border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        {uploaded ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : progress?.status === "error" ? (
                          <AlertCircle className="w-5 h-5 text-red-600" />
                        ) : isUploading ? (
                          <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                        ) : (
                          <FileText className="w-5 h-5 text-gray-400" />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{file.name}</p>
                          <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {uploaded && <Badge className="bg-green-100 text-green-800 border-green-200">Uploaded</Badge>}
                        {!isUploading && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDocument(index)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Progress bar */}
                    {progress && progress.status === "uploading" && (
                      <Progress value={progress.progress} className="w-full" />
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Document Requirements */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Requirements</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ul className="space-y-2">
              <li className="flex items-center text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 mr-2 text-blue-500" />
                Documents must be unsigned
              </li>
              <li className="flex items-center text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 mr-2 text-blue-500" />
                Clear, readable text and images
              </li>
            </ul>
            <ul className="space-y-2">
              <li className="flex items-center text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 mr-2 text-blue-500" />
                Maximum 10MB per file
              </li>
              <li className="flex items-center text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 mr-2 text-blue-500" />
                PDF format preferred
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={isUploading}>
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={documents.length === 0 || !allUploadsComplete}
          className="bg-[#A52A2A] hover:bg-[#8B1A1A]"
        >
          Continue to Identity Verification
        </Button>
      </div>
    </div>
  )
}
