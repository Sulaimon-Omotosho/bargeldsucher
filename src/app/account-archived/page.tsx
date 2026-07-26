import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import AccountArchivedClient from './account-archived-client'

export default async function AccountArchivedPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  if (!session.user.isArchived) {
    redirect('/dashboard')
  }

  return <AccountArchivedClient />
}
