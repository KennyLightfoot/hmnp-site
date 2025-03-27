// Form fallback mechanism for offline submissions
import { kv } from "@vercel/kv"

// Define the structure of a pending submission
export interface PendingSubmission {
  id: string
  type: "contact" | "booking" | "call"
  data: any
  createdAt: number
  attempts: number
}

// Save a pending submission to KV store or localStorage
export async function savePendingSubmission(submission: Omit<PendingSubmission, "id" | "createdAt" | "attempts">) {
  const id = `pending_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  const fullSubmission: PendingSubmission = {
    ...submission,
    id,
    createdAt: Date.now(),
    attempts: 0,
  }

  try {
    // Try to use KV store first
    if (typeof kv !== "undefined") {
      await kv.set(`submission:${id}`, JSON.stringify(fullSubmission))
      return id
    }
  } catch (error) {
    console.error("Failed to save to KV store:", error)
  }

  // Fallback to localStorage if in browser
  if (typeof window !== "undefined") {
    try {
      const pendingSubmissions = JSON.parse(localStorage.getItem("pendingSubmissions") || "[]")
      pendingSubmissions.push(fullSubmission)
      localStorage.setItem("pendingSubmissions", JSON.stringify(pendingSubmissions))
      return id
    } catch (error) {
      console.error("Failed to save to localStorage:", error)
    }
  }

  throw new Error("Failed to save pending submission")
}

// Get a specific pending submission
export async function getPendingSubmission(id: string): Promise<PendingSubmission | null> {
  try {
    // Try to use KV store first
    if (typeof kv !== "undefined") {
      const submission = await kv.get(`submission:${id}`)
      return submission ? JSON.parse(submission as string) : null
    }
  } catch (error) {
    console.error("Failed to get from KV store:", error)
  }

  // Fallback to localStorage if in browser
  if (typeof window !== "undefined") {
    try {
      const pendingSubmissions = JSON.parse(localStorage.getItem("pendingSubmissions") || "[]")
      return pendingSubmissions.find((s: PendingSubmission) => s.id === id) || null
    } catch (error) {
      console.error("Failed to get from localStorage:", error)
    }
  }

  return null
}

// Get all pending submissions
export async function getPendingSubmissions(): Promise<PendingSubmission[]> {
  try {
    // Try to use KV store first
    if (typeof kv !== "undefined") {
      const keys = await kv.keys("submission:*")
      if (keys.length === 0) return []

      const submissions = await Promise.all(
        keys.map(async (key) => {
          const submission = await kv.get(key)
          return submission ? JSON.parse(submission as string) : null
        }),
      )

      return submissions.filter(Boolean) as PendingSubmission[]
    }
  } catch (error) {
    console.error("Failed to get from KV store:", error)
  }

  // Fallback to localStorage if in browser
  if (typeof window !== "undefined") {
    try {
      return JSON.parse(localStorage.getItem("pendingSubmissions") || "[]")
    } catch (error) {
      console.error("Failed to get from localStorage:", error)
    }
  }

  return []
}

// Delete a pending submission
export async function deletePendingSubmission(id: string): Promise<boolean> {
  try {
    // Try to use KV store first
    if (typeof kv !== "undefined") {
      await kv.del(`submission:${id}`)
      return true
    }
  } catch (error) {
    console.error("Failed to delete from KV store:", error)
  }

  // Fallback to localStorage if in browser
  if (typeof window !== "undefined") {
    try {
      const pendingSubmissions = JSON.parse(localStorage.getItem("pendingSubmissions") || "[]")
      const filteredSubmissions = pendingSubmissions.filter((s: PendingSubmission) => s.id !== id)
      localStorage.setItem("pendingSubmissions", JSON.stringify(filteredSubmissions))
      return true
    } catch (error) {
      console.error("Failed to delete from localStorage:", error)
    }
  }

  return false
}

// Update a pending submission
export async function updatePendingSubmission(id: string, updates: Partial<PendingSubmission>): Promise<boolean> {
  try {
    // Try to use KV store first
    if (typeof kv !== "undefined") {
      const submission = await kv.get(`submission:${id}`)
      if (!submission) return false

      const updatedSubmission = {
        ...JSON.parse(submission as string),
        ...updates,
      }

      await kv.set(`submission:${id}`, JSON.stringify(updatedSubmission))
      return true
    }
  } catch (error) {
    console.error("Failed to update in KV store:", error)
  }

  // Fallback to localStorage if in browser
  if (typeof window !== "undefined") {
    try {
      const pendingSubmissions = JSON.parse(localStorage.getItem("pendingSubmissions") || "[]")
      const index = pendingSubmissions.findIndex((s: PendingSubmission) => s.id === id)

      if (index === -1) return false

      pendingSubmissions[index] = {
        ...pendingSubmissions[index],
        ...updates,
      }

      localStorage.setItem("pendingSubmissions", JSON.stringify(pendingSubmissions))
      return true
    } catch (error) {
      console.error("Failed to update in localStorage:", error)
    }
  }

  return false
}

// Retry all pending submissions
export async function retryPendingSubmissions(): Promise<{
  success: number
  failed: number
  remaining: number
}> {
  const submissions = await getPendingSubmissions()
  let success = 0
  let failed = 0

  // Import necessary functions dynamically to avoid circular dependencies
  const { createContact, triggerWorkflow } = await import("./gohighlevel")

  for (const submission of submissions) {
    try {
      // Increment attempt count
      await updatePendingSubmission(submission.id, {
        attempts: submission.attempts + 1,
      })

      // Process based on submission type
      if (submission.type === "contact") {
        const contact = await createContact(submission.data)

        // If there's a workflow ID, trigger it
        if (submission.data.workflowId && contact.id) {
          await triggerWorkflow(submission.data.workflowId, contact.id, submission.data.workflowData)
        }

        // Delete the submission after successful processing
        await deletePendingSubmission(submission.id)
        success++
      } else if (submission.type === "booking" || submission.type === "call") {
        // Handle other submission types
        // For now, just mark as failed
        failed++
      }
    } catch (error) {
      console.error(`Failed to process submission ${submission.id}:`, error)
      failed++

      // If too many attempts, mark for manual review
      if (submission.attempts >= 5) {
        await updatePendingSubmission(submission.id, {
          needsManualReview: true,
        })
      }
    }
  }

  // Get remaining submissions
  const remaining = (await getPendingSubmissions()).length

  return { success, failed, remaining }
}

