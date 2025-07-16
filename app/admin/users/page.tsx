import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from 'next/navigation';
import { User, Role } from "@prisma/client";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
// We will create this component later for role changes
// import { UserRoleSelect } from "@/components/admin/UserRoleSelect"; 
import { UserRoleSelect } from "@/components/admin/UserRoleSelect";
import { InviteUserDialog } from "@/components/admin/InviteUserDialog";
import { SetPasswordDialog } from "@/components/admin/SetPasswordDialog";
import ImpersonateButton from "@/components/admin/ImpersonateButton";
import ResetTwoFactorButton from "@/components/admin/ResetTwoFactorButton";

// Helper function to format dates (can move to utils)
const formatDateTime = (date: Date | string | null | undefined) => {
  if (!date) return "-";
  return new Date(date).toLocaleString();
};

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);

  // 1. Authorization Check: Only Admins allowed
  if (!session?.user || session.user.role !== Role.ADMIN) {
    // Redirect non-admins or unauthenticated users
    redirect('/portal'); // Or '/unauthorized', or '/login'
  }

  // 2. Fetch Users
  let users: User[] = [];
  try {
    users = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc', // Show newest users first
      },
    });
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return <p className="text-red-500">Error loading users. Please try again later.</p>;
  }

  // 3. Display Users
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">User Management</h1>
        <InviteUserDialog />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableCaption>List of all portal users.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No users found.
                </TableCell>
              </TableRow>
            )}
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name || "-"}</TableCell>
                <TableCell>{user.email || "-"}</TableCell>
                <TableCell>
                  <UserRoleSelect userId={user.id} currentRole={user.role} />
                </TableCell>
                <TableCell>{formatDateTime(user.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <SetPasswordDialog userId={user.id} userEmail={user.email}>
                      <Button variant="outline" size="sm">Set Password</Button>
                    </SetPasswordDialog>
                    <ImpersonateButton userId={user.id} userEmail={user.email} />
                    <ResetTwoFactorButton userId={user.id} userEmail={user.email} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 