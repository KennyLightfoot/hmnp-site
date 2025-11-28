"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  Clipboard,
  Bell,
  AlertTriangle,
  Settings,
  BarChart4,
  LogOut,
  Menu,
  X,
  FileText,
  GitBranch,
  MapPinned,
  Network,
  CalendarDays,
  CreditCard,
  BarChart3,
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
  userRole?: string;
}

type NavItem = {
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  roles?: string[];
};

export default function AdminLayout({ children, userRole }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  
  const navigation: NavItem[] = [
    // Overview
    { name: "Overview", href: "/admin", icon: BarChart4, roles: ["ADMIN", "STAFF"] },

    // Content & AI
    { name: "Content & AI", href: "/admin/content", icon: FileText, roles: ["ADMIN"] },

    // Operations
    { name: "Operations", href: "/admin/operations", icon: Clipboard, roles: ["ADMIN", "STAFF"] },
    { name: "Bookings", href: "/admin/bookings", icon: CalendarDays, roles: ["ADMIN", "STAFF"] },
    {
      name: "Notary Applications",
      href: "/admin/notary-applications",
      icon: FileText,
      roles: ["ADMIN"],
    },
    { name: "Network Dashboard", href: "/admin/network", icon: Network, roles: ["ADMIN"] },
    { name: "Network Jobs", href: "/admin/network/jobs", icon: GitBranch, roles: ["ADMIN"] },
    { name: "Coverage & Notaries", href: "/admin/network/coverage", icon: MapPinned, roles: ["ADMIN"] },

    // Marketing & analytics
    { name: "Marketing & Analytics", href: "/admin/analytics", icon: BarChart3, roles: ["ADMIN"] },

    // Billing & finance
    { name: "Billing & Payments", href: "/admin/billing", icon: CreditCard, roles: ["ADMIN"] },

    // System & settings
    { name: "Notifications", href: "/admin/notifications", icon: Bell, roles: ["ADMIN"] },
    { name: "System Alerts", href: "/admin/alerts", icon: AlertTriangle, roles: ["ADMIN"] },
    { name: "Users", href: "/admin/users", icon: Users, roles: ["ADMIN"] },
    { name: "Settings", href: "/admin/settings", icon: Settings, roles: ["ADMIN"] },
  ];

  const isActive = (path: string) => {
    if (!pathname) return false;
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const filteredNavigation =
    userRole && userRole.length > 0
      ? navigation.filter((item) => !item.roles || item.roles.includes(userRole))
      : navigation;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar for mobile */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#002147] text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:z-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-blue-800">
          <Link href="/admin" className="flex-shrink-0 flex items-center">
            <span className="text-xl font-bold tracking-tight">HMNP Admin</span>
          </Link>
          <button
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="mt-5 px-2 space-y-1">
          {filteredNavigation.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`${
                  active
                    ? 'bg-blue-800 text-white'
                    : 'text-gray-100 hover:bg-blue-700'
                } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
              >
                <item.icon
                  className={`${
                    active ? 'text-white' : 'text-gray-300'
                  } mr-3 h-5 w-5`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 w-full border-t border-blue-800 p-4">
          <Link
            href="/"
            className="text-gray-100 hover:bg-blue-700 group flex items-center px-2 py-2 text-sm font-medium rounded-md"
          >
            <LogOut className="text-gray-300 mr-3 h-5 w-5" />
            Exit Admin
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top header */}
        <div className="relative z-10 flex h-16 flex-shrink-0 border-b border-gray-200 bg-white shadow-sm">
          <button
            type="button"
            className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex flex-1 justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex flex-1"></div>
            <div className="ml-4 flex items-center md:ml-6">
              {/* Profile dropdown could go here */}
            </div>
          </div>
        </div>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="py-6">
            <div className="mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
