import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ChangePasswordForm from '@/components/portal/ChangePasswordForm'

export const dynamic = 'force-dynamic'

export default async function SecurityPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect('/login')
  }

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-semibold">Security Settings</h2>
      <ChangePasswordForm />
    </div>
  )
} 