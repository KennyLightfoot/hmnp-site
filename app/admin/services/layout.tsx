import AdminLayout from '@/components/admin/AdminLayout';

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
} 