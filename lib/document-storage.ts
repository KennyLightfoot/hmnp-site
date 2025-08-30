import { createClient } from "@/lib/supabase/client"
import { createClient as createServerClient } from "@/lib/supabase/server"

export interface UploadedDocument {
  id: string
  filename: string
  contentType: string
  sizeBytes: number
  storageKey: string
  uploadedAt: Date
  bookingId?: string
}

export interface UploadProgress {
  filename: string
  progress: number
  status: "uploading" | "completed" | "error"
  error?: string
}

// Client-side upload function
export async function uploadDocuments(
  files: File[],
  bookingId?: string,
  onProgress?: (progress: UploadProgress[]) => void,
): Promise<UploadedDocument[]> {
  const supabase = createClient()
  const uploadedDocs: UploadedDocument[] = []
  const progressArray: UploadProgress[] = files.map((file) => ({
    filename: file.name,
    progress: 0,
    status: "uploading" as const,
  }))

  // Update progress callback
  const updateProgress = (index: number, updates: Partial<UploadProgress>) => {
    progressArray[index] = { ...progressArray[index], ...updates }
    onProgress?.(progressArray)
  }

  for (let i = 0; i < files.length; i++) {
    const file = files[i]

    try {
      // Generate unique storage key
      const timestamp = Date.now()
      const randomId = Math.random().toString(36).substring(2)
      const fileExtension = file.name.split(".").pop()
      const storageKey = `ron-documents/${timestamp}-${randomId}.${fileExtension}`

      updateProgress(i, { progress: 10 })

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("documents")
        .upload(storageKey, file, {
          cacheControl: "3600",
          upsert: false,
        })

      if (uploadError) {
        throw uploadError
      }

      updateProgress(i, { progress: 70 })

      // Save metadata to database
      const documentData = {
        filename: file.name,
        contentType: file.type,
        sizeBytes: file.size,
        storageKey: uploadData.path,
        bookingId: bookingId || null,
        uploadedAt: new Date().toISOString(),
      }

      const { data: dbData, error: dbError } = await supabase
        .from("BookingUploadedDocument")
        .insert(documentData)
        .select()
        .single()

      if (dbError) {
        // Clean up uploaded file if database insert fails
        await supabase.storage.from("documents").remove([uploadData.path])
        throw dbError
      }

      updateProgress(i, { progress: 100, status: "completed" })

      uploadedDocs.push({
        id: dbData.id,
        filename: dbData.filename,
        contentType: dbData.contentType,
        sizeBytes: dbData.sizeBytes,
        storageKey: dbData.storageKey,
        uploadedAt: new Date(dbData.uploadedAt),
        bookingId: dbData.bookingId,
      })
    } catch (error) {
      console.error(`Upload failed for ${file.name}:`, error)
      updateProgress(i, {
        status: "error",
        error: error instanceof Error ? error.message : "Upload failed",
      })
    }
  }

  return uploadedDocs
}

// Server-side function to get document download URL
export async function getDocumentDownloadUrl(storageKey: string): Promise<string | null> {
  const supabase = await createServerClient()

  const { data, error } = await supabase.storage.from("documents").createSignedUrl(storageKey, 3600) // 1 hour expiry

  if (error) {
    console.error("Error creating signed URL:", error)
    return null
  }

  return data.signedUrl
}

// Server-side function to delete document
export async function deleteDocument(documentId: string): Promise<boolean> {
  const supabase = await createServerClient()

  // Get document metadata
  const { data: document, error: fetchError } = await supabase
    .from("BookingUploadedDocument")
    .select("storageKey")
    .eq("id", documentId)
    .single()

  if (fetchError || !document) {
    console.error("Error fetching document:", fetchError)
    return false
  }

  // Delete from storage
  const { error: storageError } = await supabase.storage.from("documents").remove([document.storageKey])

  if (storageError) {
    console.error("Error deleting from storage:", storageError)
    return false
  }

  // Delete from database
  const { error: dbError } = await supabase.from("BookingUploadedDocument").delete().eq("id", documentId)

  if (dbError) {
    console.error("Error deleting from database:", dbError)
    return false
  }

  return true
}

// Validate file before upload
export function validateFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/jpg",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ]

  if (file.size > maxSize) {
    return { valid: false, error: "File size exceeds 10MB limit" }
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: "File type not supported" }
  }

  return { valid: true }
}
