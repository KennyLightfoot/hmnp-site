import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import AdminLayout from "@/components/admin/AdminLayout";
import { authOptions } from "@/lib/auth";
import { Role } from "@/lib/prisma-types";

type AdminShellLayoutProps = {
  children: ReactNode;
};

export default async function AdminShellLayout({ children }: AdminShellLayoutProps) {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role as Role | undefined;

  if (!session?.user || userRole !== Role.ADMIN) {
    redirect("/portal");
  }

  return <AdminLayout userRole={userRole}>{children}</AdminLayout>;
}

