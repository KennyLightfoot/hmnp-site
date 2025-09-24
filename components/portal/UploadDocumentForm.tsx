"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, UploadCloudIcon } from "lucide-react";
import { getPresignedUploadUrl, registerUploadedDocument } from "@/app/portal/_actions/documents";
import { useRouter } from 'next/navigation'; // To refresh data
// import { toast } from "sonner";

type UploadDocumentFormProps = {
  assignmentId: string;
};

export function UploadDocumentForm({ assignmentId }: UploadDocumentFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); // Optional progress tracking
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Basic validation (optional)
      const MAX_FILE_SIZE_MB = 10;
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setError(`File is too large (max ${MAX_FILE_SIZE_MB}MB).`);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // 1. Get pre-signed URL from server action
      const presignedResult = await getPresignedUploadUrl(
        assignmentId,
        selectedFile.name,
        selectedFile.type
      );

      if (presignedResult.error || !presignedResult.url || !presignedResult.fields || !presignedResult.key) {
        throw new Error(presignedResult.error || "Failed to get upload credentials.");
      }

      // 2. Upload file directly to S3 using FormData
      const formData = new FormData();
      Object.entries(presignedResult.fields).forEach(([key, value]) => {
        formData.append(key, value);
      });
      formData.append("Content-Type", selectedFile.type); // Ensure Content-Type is included
      formData.append("file", selectedFile); // The file has to be the last field

      const s3UploadUrl = presignedResult.url;
      const s3Key = presignedResult.key;

      // Use XMLHttpRequest for progress tracking (fetch doesn't support it well)
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", s3UploadUrl, true);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded * 100) / event.total);
            setUploadProgress(percentComplete);
          }
        };

        xhr.onload = () => {
          // S3 returns 204 No Content on success for POST uploads
          if (xhr.status === 204) {
             setUploadProgress(100); // Ensure progress hits 100
             resolve();
          } else {
             // Try to parse error from S3 response (XML)
             let errorMsg = `S3 Upload Error: Status ${xhr.status}`;
             try {
                const xmlDoc = new DOMParser().parseFromString(xhr.responseText, "text/xml");
                const message = xmlDoc.getElementsByTagName("Message")?.[0]?.textContent;
                if (message) errorMsg += `: ${message}`;
             } catch (parseError) { /* Ignore parsing errors */ }
            reject(new Error(errorMsg));
          }
        };

        xhr.onerror = () => {
          reject(new Error("Network error during upload."));
        };

        xhr.send(formData);
      });


      // 3. Register the uploaded document in our database
      const registrationResult = await registerUploadedDocument(
        assignmentId,
        selectedFile.name,
        s3Key,
        selectedFile.type
      );

      if (registrationResult.error) {
        // TODO: Handle orphaned S3 object? Maybe log for manual cleanup.
        throw new Error(registrationResult.error);
      }

      // Success
      // toast.success(`${selectedFile.name} uploaded successfully!`);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
      router.refresh(); // Refresh page data to show the new document

    } catch (err: any) {
      console.error("Upload failed:", err);
      setError(err.message || "An unexpected error occurred during upload.");
      // toast.error(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/40">
       <h4 className="text-md font-semibold">Upload New Document</h4>
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="document-upload">Select File</Label>
        <Input
          id="document-upload"
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </div>

      {selectedFile && !isUploading && (
         <p className="text-sm text-muted-foreground">
           Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
         </p>
      )}

      {isUploading && (
        <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <p className="text-sm text-muted-foreground">
                Uploading {selectedFile?.name}... {uploadProgress}%
            </p>
            {/* Optional: Add a progress bar component here */}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600">Error: {error}</p>
      )}

      <Button
        onClick={handleUpload}
        disabled={!selectedFile || isUploading}
      >
        <UploadCloudIcon className="mr-2 h-4 w-4" />
        {isUploading ? "Uploading..." : "Upload Document"}
      </Button>
    </div>
  );
} 