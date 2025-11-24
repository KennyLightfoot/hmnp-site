import type { ReactNode } from "react"
import AdminLayout from "@/components/admin/AdminLayout"

type AdminShellLayoutProps = {
  children: ReactNode
}

export default function AdminShellLayout({ children }: AdminShellLayoutProps) {
  return <AdminLayout>{children}</AdminLayout>
}

