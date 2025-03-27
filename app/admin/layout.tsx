import type React from "react"
import Link from "next/link"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-gray-100 border-r border-gray-200">
        <div className="p-4">
          <h1 className="text-lg font-semibold">Admin Panel</h1>
        </div>
        <nav>
          <Link href="/admin" className="block px-4 py-2 hover:bg-gray-100">
            Dashboard
          </Link>
          <Link href="/admin/settings" className="block px-4 py-2 hover:bg-gray-100">
            Settings
          </Link>
          <Link href="/admin/header-test" className="block px-4 py-2 hover:bg-gray-100">
            Header Test
          </Link>
          <Link href="/admin/ghl-enhanced-diagnostic" className="block px-4 py-2 hover:bg-gray-100">
            Enhanced GHL Diagnostic
          </Link>
          {/* Add more links here */}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4">{children}</div>
    </div>
  )
}

