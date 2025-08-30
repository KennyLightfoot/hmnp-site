import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const documentId = params.id

    // Get document metadata
    const { data: document, error: fetchError } = await supabase
      .from("BookingUploadedDocument")
      .select("*")
      .eq("id", documentId)
      .single()

    if (fetchError || !document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    // Create signed URL for download
    const { data: urlData, error: urlError } = await supabase.storage
      .from("documents")
      .createSignedUrl(document.s3Key, 3600) // 1 hour expiry

    if (urlError || !urlData) {
      console.error("Error creating signed URL:", urlError)
      return NextResponse.json({ error: "Failed to generate download URL" }, { status: 500 })
    }

    return NextResponse.json({
      downloadUrl: urlData.signedUrl,
      filename: document.filename,
      contentType: document.contentType,
      sizeBytes: document.sizeBytes,
    })
  } catch (error) {
    console.error("Download API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
