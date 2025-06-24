import AdminLayout from '@/components/admin/AdminLayout';

export default function ServiceAreasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
} 