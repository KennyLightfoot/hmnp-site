import { ReactNode } from "react"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

interface PortalLayoutProps {
  children: ReactNode
}

export default async function PortalLayout({ children }: PortalLayoutProps) {
  const session = await getServerSession(authOptions)
  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-900">
      <aside className="w-64 bg-white shadow-md hidden md:block">
        <div className="p-4 text-xl font-semibold border-b">HMNP Portal</div>
        <nav className="p-4 space-y-2">
          <Link href="/portal" className="block px-3 py-2 rounded hover:bg-gray-200">
            Assignments
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-6">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Welcome, {session?.user?.email}</h1>
          <Link href="/api/auth/signout?callbackUrl=/login" className="px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700">Sign out</Link>
        </header>
        {children}
      </main>
    </div>
  )
}
