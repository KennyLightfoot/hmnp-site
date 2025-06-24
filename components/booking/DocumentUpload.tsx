"use client";

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, FileText, File, X, Check, AlertCircle, Eye, Download,
  Shield, Camera, FileImage, FileVideo, Archive
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export interface BookingDocument {
  id?: string;
  documentName: string;
  documentType: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  s3Key?: string;
  s3Bucket?: string;
  uploadedAt?: Date;
  isRequired: boolean;
  isVerified: boolean;
  uploadProgress?: number;
  uploadStatus?: 'pending' | 'uploading' | 'completed' | 'error';
  preview?: string;
  notes?: string;
}

interface DocumentUploadProps {
  documents: BookingDocument[];
  onDocumentsChange: (documents: BookingDocument[]) => void;
  bookingId?: string;
  maxFileSize?: number; // in MB
  maxFiles?: number;
  allowedTypes?: string[];
  showPreview?: boolean;
  requiredDocTypes?: string[];
}

const DOCUMENT_TYPES = [
  { value: 'CONTRACT', label: 'Contract/Agreement', icon: FileText, required: true },
  { value: 'ID_DOCUMENT', label: 'Government ID', icon: Shield, required: true },
  { value: 'POWER_OF_ATTORNEY', label: 'Power of Attorney', icon: FileText },
  { value: 'DEED', label: 'Deed/Title', icon: FileText },
  { value: 'WILL_TESTAMENT', label: 'Will/Testament', icon: FileText },
  { value: 'AFFIDAVIT', label: 'Affidavit', icon: FileText },
  { value: 'SUPPORTING_DOC', label: 'Supporting Document', icon: File },
  { value: 'PHOTO_ID_FRONT', label: 'ID Front Photo', icon: Camera },
  { value: 'PHOTO_ID_BACK', label: 'ID Back Photo', icon: Camera },
  { value: 'WITNESS_ID', label: 'Witness ID', icon: Shield },
  { value: 'OTHER', label: 'Other Document', icon: File },
];

const FILE_TYPE_ICONS = {
  'application/pdf': FileText,
  'image/jpeg': FileImage,
  'image/png': FileImage,
  'image/webp': FileImage,
  'video/mp4': FileVideo,
  'application/zip': Archive,
  'default': File,
};

const MAX_FILE_SIZE_MB = 10;
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'video/mp4',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

export default function DocumentUpload({
  documents,
  onDocumentsChange,
  bookingId,
  maxFileSize = MAX_FILE_SIZE_MB,
  maxFiles = 20,
  allowedTypes = ALLOWED_FILE_TYPES,
  showPreview = true,
  requiredDocTypes = ['CONTRACT', 'ID_DOCUMENT']
}: DocumentUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (documents.length + acceptedFiles.length > maxFiles) {
        toast({
          title: "Too many files",
          description: `Maximum ${maxFiles} files allowed`,
          variant: "destructive",
        });
        return;
      }

      const newDocuments: BookingDocument[] = [];

      for (const file of acceptedFiles) {
        // File size validation
        if (file.size > maxFileSize * 1024 * 1024) {
          toast({
            title: "File too large",
            description: `${file.name} exceeds ${maxFileSize}MB limit`,
            variant: "destructive",
          });
          continue;
        }

        // File type validation
        if (!allowedTypes.includes(file.type)) {
          toast({
            title: "Invalid file type",
            description: `${file.name} is not a supported file type`,
            variant: "destructive",
          });
          continue;
        }

        const docId = `temp-${Date.now()}-${Math.random()}`;
        const newDoc: BookingDocument = {
          id: docId,
          documentName: file.name.split('.')[0],
          documentType: 'OTHER', // Default, user can change
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          isRequired: false,
          isVerified: false,
          uploadStatus: 'pending',
          uploadProgress: 0,
        };

        // Generate preview for images
        if (file.type.startsWith('image/') && showPreview) {
          const reader = new FileReader();
          reader.onload = (e) => {
            newDoc.preview = e.target?.result as string;
            onDocumentsChange([...documents, ...newDocuments, newDoc]);
          };
          reader.readAsDataURL(file);
        } else {
          newDocuments.push(newDoc);
        }

        // Start upload
        uploadFile(file, docId);
      }

      if (newDocuments.length > 0) {
        onDocumentsChange([...documents, ...newDocuments]);
      }
    },
    [documents, maxFileSize, maxFiles, allowedTypes, showPreview, onDocumentsChange]
  );

  const uploadFile = async (file: File, docId: string) => {
    setUploadingFiles(prev => new Set(prev).add(docId));
    
    try {
      // Get presigned URL for S3 upload
      const presignedResponse = await fetch('/api/documents/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          bookingId,
        }),
      });

      if (!presignedResponse.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadUrl, s3Key, s3Bucket } = await presignedResponse.json();

      // Update document with upload progress
      updateDocumentField(docId, 'uploadStatus', 'uploading');

      // Upload to S3 with progress tracking
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          updateDocumentField(docId, 'uploadProgress', progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          updateDocumentField(docId, 'uploadStatus', 'completed');
          updateDocumentField(docId, 's3Key', s3Key);
          updateDocumentField(docId, 's3Bucket', s3Bucket);
          updateDocumentField(docId, 'uploadedAt', new Date());
          
          toast({
            title: "Upload successful",
            description: `${file.name} has been uploaded`,
          });
        } else {
          throw new Error('Upload failed');
        }
      });

      xhr.addEventListener('error', () => {
        throw new Error('Upload failed');
      });

      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);

    } catch (error) {
      console.error('Upload error:', error);
      updateDocumentField(docId, 'uploadStatus', 'error');
      toast({
        title: "Upload failed",
        description: `Failed to upload ${file.name}`,
        variant: "destructive",
      });
    } finally {
      setUploadingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(docId);
        return newSet;
      });
    }
  };

  const updateDocumentField = (docId: string, field: keyof BookingDocument, value: any) => {
    const updatedDocs = documents.map(doc =>
      doc.id === docId ? { ...doc, [field]: value } : doc
    );
    onDocumentsChange(updatedDocs);
  };

  const removeDocument = (docId: string) => {
    const updatedDocs = documents.filter(doc => doc.id !== docId);
    onDocumentsChange(updatedDocs);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: allowedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize: maxFileSize * 1024 * 1024,
    multiple: true,
  });

  const getFileIcon = (mimeType: string) => {
    const IconComponent = FILE_TYPE_ICONS[mimeType as keyof typeof FILE_TYPE_ICONS] || FILE_TYPE_ICONS.default;
    return <IconComponent className="h-6 w-6" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const requiredDocs = DOCUMENT_TYPES.filter(type => requiredDocTypes.includes(type.value));
  const uploadedRequiredTypes = new Set(documents.map(doc => doc.documentType));
  const missingRequiredDocs = requiredDocs.filter(type => !uploadedRequiredTypes.has(type.value));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold">Document Upload</h3>
        <p className="text-sm text-muted-foreground">
          Upload documents that need to be notarized and supporting materials
        </p>
      </div>

      {/* Required Documents Alert */}
      {missingRequiredDocs.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Required documents missing: {missingRequiredDocs.map(doc => doc.label).join(', ')}
          </AlertDescription>
        </Alert>
      )}

      {/* Upload Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-medium">Total Documents</p>
              <p className="text-sm text-muted-foreground">{documents.length} of {maxFiles}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium">Verified</p>
              <p className="text-sm text-muted-foreground">
                {documents.filter(d => d.isVerified).length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-600" />
            <div>
              <p className="font-medium">Required</p>
              <p className="text-sm text-muted-foreground">
                {documents.filter(d => d.isRequired).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Upload Zone */}
      <Card
        {...getRootProps()}
        className={`border-2 border-dashed transition-colors cursor-pointer ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <CardContent className="p-8 text-center">
          <input {...getInputProps()} />
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {isDragActive ? 'Drop files here' : 'Upload Documents'}
          </h3>
          <p className="text-gray-600 mb-4">
            Drag & drop files here, or click to select files
          </p>
          <div className="text-sm text-gray-500">
            <p>Supported: PDF, Images, Word documents</p>
            <p>Max file size: {maxFileSize}MB</p>
          </div>
          <Button type="button" variant="outline" className="mt-4">
            Choose Files
          </Button>
        </CardContent>
      </Card>

      {/* Document List */}
      {documents.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium">Uploaded Documents</h4>
          {documents.map((doc) => (
            <Card key={doc.id} className="p-4">
              <div className="flex items-start gap-4">
                {/* File Icon & Preview */}
                <div className="flex-shrink-0">
                  {doc.preview ? (
                    <img
                      src={doc.preview}
                      alt={doc.fileName}
                      className="w-16 h-16 object-cover rounded border"
                    />
                  ) : (
                    <div className="w-16 h-16 flex items-center justify-center border rounded bg-gray-50">
                      {getFileIcon(doc.mimeType)}
                    </div>
                  )}
                </div>

                {/* Document Info */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-medium">{doc.documentName}</h5>
                        {doc.isRequired && <Badge variant="destructive">Required</Badge>}
                        {doc.isVerified && <Badge variant="default">Verified</Badge>}
                      </div>
                      <p className="text-sm text-gray-600">
                        {doc.fileName} • {formatFileSize(doc.fileSize)}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDocument(doc.id!)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Document Type & Name Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor={`doc-name-${doc.id}`} className="text-xs">Document Name</Label>
                      <Input
                        id={`doc-name-${doc.id}`}
                        value={doc.documentName}
                        onChange={(e) => updateDocumentField(doc.id!, 'documentName', e.target.value)}
                        size="sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`doc-type-${doc.id}`} className="text-xs">Document Type</Label>
                      <Select
                        value={doc.documentType}
                        onValueChange={(value) => {
                          updateDocumentField(doc.id!, 'documentType', value);
                          const docType = DOCUMENT_TYPES.find(t => t.value === value);
                          if (docType) {
                            updateDocumentField(doc.id!, 'isRequired', requiredDocTypes.includes(value));
                          }
                        }}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {DOCUMENT_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center gap-2">
                                <type.icon className="h-4 w-4" />
                                {type.label}
                                {requiredDocTypes.includes(type.value) && (
                                  <Badge variant="outline" className="ml-1 text-xs">Required</Badge>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Upload Progress */}
                  {doc.uploadStatus === 'uploading' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Uploading...</span>
                        <span>{doc.uploadProgress || 0}%</span>
                      </div>
                      <Progress value={doc.uploadProgress || 0} className="h-2" />
                    </div>
                  )}

                  {/* Status Indicators */}
                  <div className="flex items-center gap-2 text-sm">
                    {doc.uploadStatus === 'completed' && (
                      <Badge variant="outline" className="text-green-600">
                        <Check className="h-3 w-3 mr-1" />
                        Uploaded
                      </Badge>
                    )}
                    {doc.uploadStatus === 'error' && (
                      <Badge variant="outline" className="text-red-600">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Upload Failed
                      </Badge>
                    )}
                    {showPreview && doc.s3Key && (
                      <Button type="button" variant="ghost" size="sm">
                        <Eye className="h-3 w-3 mr-1" />
                        Preview
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Document Requirements Help */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-blue-800">Document Requirements</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-700">
          <ul className="space-y-1">
            <li>• All signers must provide valid government-issued photo ID</li>
            <li>• Documents to be notarized should be uploaded in PDF format when possible</li>
            <li>• Ensure all pages are clearly visible and legible</li>
            <li>• Do not sign documents before the notarization appointment</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
} 