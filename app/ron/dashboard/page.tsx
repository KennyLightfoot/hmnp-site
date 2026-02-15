import React from 'react';
import RONDashboard from '@/components/ron/RONDashboard';

// Define Base URL for metadata
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://houstonmobilenotarypros.com';

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: "RON Dashboard | Houston Mobile Notary Pros",
  description:
    "Create and manage your Remote Online Notarization sessions securely with BlueNotary integration.",
  alternates: {
    canonical: `${BASE_URL}/ron/dashboard`,
  },
}

export default function RONDashboardPage() {
  return <RONDashboard />;
}