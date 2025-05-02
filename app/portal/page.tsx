"use client"

import useSWR from "swr"
import Link from "next/link"

async function fetcher(url: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to load")
  return res.json()
}

export default function PortalHome() {
  const { data, error, isLoading } = useSWR<{
    id: string
    title: string
    status: string
    closingDate: string | null
    updatedAt: string
  }[]>("/api/portal/assignments", fetcher)

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Assignments</h2>
      {isLoading && <p>Loading…</p>}
      {error && <p className="text-red-500">Error loading assignments</p>}
      {data && data.length === 0 && <p>No assignments yet.</p>}
      {data && data.length > 0 && (
        <table className="min-w-full border">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left">Title</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Closing</th>
              <th className="px-3 py-2 text-left">Updated</th>
            </tr>
          </thead>
          <tbody>
            {data.map((a) => (
              <tr key={a.id} className="border-t hover:bg-gray-50">
                <td className="px-3 py-2">
                  <Link href={`/portal/${a.id}`} className="text-blue-600 hover:underline">
                    {a.title}
                  </Link>
                </td>
                <td className="px-3 py-2">{a.status}</td>
                <td className="px-3 py-2">{a.closingDate ? new Date(a.closingDate).toLocaleDateString() : "-"}</td>
                <td className="px-3 py-2">{new Date(a.updatedAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
