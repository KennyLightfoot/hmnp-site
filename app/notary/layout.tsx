import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Car, Video, BookOpen, BarChart3, Settings, LogOut } from 'lucide-react';
import { Role } from '@prisma/client';

export const metadata: Metadata = {
  title: 'Notary Portal | Houston Mobile Notary Pros',
  description: 'Manage your mobile and RON notarization sessions',
  robots: {
    index: false,
    follow: false,
  },
};

interface NotaryLayoutProps {
  children: React.ReactNode;
}

export default async function NotaryLayout({ children }: NotaryLayoutProps) {
  const session = await getServerSession(authOptions);

  // Check if user is authenticated and has notary role
  if (!session?.user) {
    redirect('/login?callbackUrl=/notary');
  }

  const userRole = (session.user as any).role;
  if (userRole !== Role.NOTARY && userRole !== Role.ADMIN) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-[#002147]">
                Notary Portal
              </h1>
              <Badge variant="secondary" className="bg-[#A52A2A] text-white">
                {userRole === Role.ADMIN ? 'Admin' : 'Notary'}
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {session.user.name || session.user.email}
              </span>
              <Link href="/api/auth/signout">
                <Button variant="ghost" size="sm">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="bg-white rounded-lg shadow-sm p-4 space-y-2">
              <Link
                href="/notary/mobile"
                className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-[#A52A2A] transition-colors"
              >
                <Car className="h-4 w-4 mr-3" />
                Mobile Route Board
              </Link>
              <Link
                href="/notary/ron"
                className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-[#A52A2A] transition-colors"
              >
                <Video className="h-4 w-4 mr-3" />
                RON Sessions
              </Link>
              <Link
                href="/notary/journal"
                className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-[#A52A2A] transition-colors"
              >
                <BookOpen className="h-4 w-4 mr-3" />
                Journal & Audit
              </Link>
              <div className="border-t border-gray-200 my-4"></div>
              <Link
                href="/notary/analytics"
                className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-[#A52A2A] transition-colors"
              >
                <BarChart3 className="h-4 w-4 mr-3" />
                Analytics
              </Link>
              <Link
                href="/notary/settings"
                className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-[#A52A2A] transition-colors"
              >
                <Settings className="h-4 w-4 mr-3" />
                Settings
              </Link>
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
} 