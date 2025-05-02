import { notFound } from "next/navigation"
import { revalidatePath } from "next/cache"
import Link from "next/link"
import FileUploader from "@/components/FileUploader"

async function getAssignment(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/portal/assignments/${id}`, {
    cache: "no-store",
  })
  if (!res.ok) {
    if (res.status === 404) return null
    throw new Error("Failed to load assignment")
  }
  return res.json()
}

export default async function AssignmentPage({ params }: { params: { id: string } }) {
  const assignment = await getAssignment(params.id)
  if (!assignment) notFound()

  return (
    <div className="space-y-6">
      <div className="border p-4 rounded bg-white shadow-sm">
        <h2 className="text-xl font-semibold mb-2">{assignment.title}</h2>
        <p>Status: <span className="font-medium">{assignment.status}</span></p>
        {assignment.propertyAddress && <p>Address: {assignment.propertyAddress}</p>}
        {assignment.closingDate && <p>Closing: {new Date(assignment.closingDate).toLocaleString()}</p>}
      </div>

      {/* Documents */}
      <div className="border p-4 rounded bg-white shadow-sm">
        <h3 className="font-semibold mb-2">Documents</h3>
        <FileUploader assignmentId={assignment.id} onUploaded={() => revalidatePath(`/portal/${assignment.id}`)} />
        {assignment.documents.length === 0 && <p>No documents uploaded.</p>}
        {assignment.documents.length > 0 && (
          <ul className="list-disc list-inside">
            {assignment.documents.map((d: any) => (
              <li key={d.id}>
                <Link href={`/api/portal/docs/${d.id}`} className="text-blue-600 hover:underline">
                  {d.filename}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Status History */}
      <div className="border p-4 rounded bg-white shadow-sm">
        <h3 className="font-semibold mb-2">Status History</h3>
        {/* Update form */}
        <form
          className="mb-4 flex gap-2 items-end"
          action={async (formData: FormData) => {
            'use server'
            const status = formData.get('status') as string | null
            const note = formData.get('note') as string | null
            await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/portal/assignments/${assignment.id}/status`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status, note }),
              cache: 'no-store',
            })
            revalidatePath(`/portal/${assignment.id}`)
          }}
        >
          <select name="status" defaultValue={assignment.status} className="border p-1 rounded">
            {['REQUESTED','SCHEDULED','IN_PROGRESS','SIGNED','RETURNED_TO_TITLE','COMPLETED','ARCHIVED'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <input name="note" placeholder="Optional note" className="border p-1 rounded flex-1" />
          <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded">Save</button>
        </form>
        <ul className="space-y-1">
          {assignment.history.map((h: any) => (
            <li key={h.id}>
              <span className="font-medium">{h.status}</span> – {new Date(h.changedAt).toLocaleString()}
              {h.note && ` – ${h.note}`}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export const dynamic = "force-dynamic"
