import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
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

    const formData = await request.formData()
    const file = formData.get("file") as File
    const bookingId = formData.get("bookingId") as string | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file
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
      return NextResponse.json({ error: "File size exceeds 10MB limit" }, { status: 400 })
    }

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "File type not supported" }, { status: 400 })
    }

    // Generate unique storage key
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2)
    const fileExtension = file.name.split(".").pop()
    const storageKey = `ron-documents/${user.id}/${timestamp}-${randomId}.${fileExtension}`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage.from("documents").upload(storageKey, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (uploadError) {
      console.error("Storage upload error:", uploadError)
      return NextResponse.json({ error: "Upload failed" }, { status: 500 })
    }

    // Save metadata to database
    const { data: dbData, error: dbError } = await supabase
      .from("BookingUploadedDocument")
      .insert({
        filename: file.name,
        contentType: file.type,
        sizeBytes: file.size,
        s3Key: uploadData.path, // Using s3Key field from existing schema
        bookingId: bookingId,
        uploadedAt: new Date().toISOString(),
      })
      .select()
      .single()

    if (dbError) {
      console.error("Database insert error:", dbError)
      // Clean up uploaded file
      await supabase.storage.from("documents").remove([uploadData.path])
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    return NextResponse.json({
      id: dbData.id,
      filename: dbData.filename,
      contentType: dbData.contentType,
      sizeBytes: dbData.sizeBytes,
      storageKey: dbData.s3Key,
      uploadedAt: dbData.uploadedAt,
    })
  } catch (error) {
    console.error("Upload API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
