'use client';

import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CalendarSettings from '../../../components/admin/CalendarSettings';

export default function AdminCalendarSettingsPage() {
  return (
    <div className="container mx-auto py-5">
      <div className="flex gap-2 mb-5 text-sm">
        <Link href="/admin" className="text-blue-600 hover:underline">Admin</Link>
        <span>/</span>
        <span className="text-gray-500">Calendar Settings</span>
      </div>
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Admin Calendar Settings</h1>
      </div>
      
      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="general">General Settings</TabsTrigger>
          <TabsTrigger value="service">Service Restrictions</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <CalendarSettings />
        </TabsContent>
        <TabsContent value="service">
          <div className="pt-5">
            <h2 className="text-2xl font-bold mb-4">Service-Specific Settings</h2>
            <div className="bg-gray-100 p-6 rounded-md text-center">
              Service restrictions coming soon
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
