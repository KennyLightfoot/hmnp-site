"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DownloadIcon, Loader2 } from "lucide-react";
import { getPresignedDownloadUrl } from "@/app/portal/_actions/documents";
import { useToast } from "@/hooks/use-toast";
// Assuming you have a toast notification system like sonner or react-hot-toast
// import { toast } from "sonner";

type DownloadDocumentButtonProps = {
  documentId: string;
  filename: string; // For user feedback
};

export function DownloadDocumentButton({ documentId, filename }: DownloadDocumentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      const result = await getPresignedDownloadUrl(documentId);

      if (result.error) {
        console.error("Download error:", result.error);
        toast({
          variant: "destructive",
          title: `Download Failed`,
          description: result.error || `Could not get download link for ${filename}.`,
        });
      } else if (result.url) {
        // Trigger the download by navigating to the pre-signed URL
        // This is generally safe as it's a GET request
        window.location.href = result.url;
        // Optionally add success toast
        // toast.success(`Downloading ${filename}...`);
      } else {
        // Handle unexpected case where there's no error but no URL
        console.error("Download error: No URL returned");
        toast({
          variant: "destructive",
          title: `Download Failed`,
          description: `An unknown error occurred while downloading ${filename}.`,
        });
      }
    } catch (error: any) {
      console.error("Download exception:", error);
      toast({
        variant: "destructive",
        title: `Download Failed`,
        description: `An unknown error occurred while downloading ${filename}.`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDownload}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <DownloadIcon className="mr-2 h-4 w-4" />
      )}
      Download
    </Button>
  );
} 