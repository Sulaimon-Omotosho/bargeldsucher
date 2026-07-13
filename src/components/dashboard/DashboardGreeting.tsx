import { getDynamicGreeting } from '@/lib/greetings'
import CreateErrand from '@/components/dashboard/CreateErrand'
import { TodaySnapshotData } from '@/types/dashboard'

interface DashboardGreetingProps {
  userName?: string | null
  snapshot?: TodaySnapshotData
}

export default function DashboardGreeting({
  userName,
  snapshot,
}: DashboardGreetingProps) {
  const greeting = getDynamicGreeting(userName)

  return (
    <div className='flex flex-row gap-2 items-center justify-between'>
      <div>
        <h1 className='text-2xl font-bold text-slate-900 md:text-3xl flex items-center gap-2'>
          {greeting.title}{' '}
          <span className='animate-bounce duration-1000'>{greeting.icon}</span>
        </h1>
        <p className='text-sm text-slate-500 mt-1'>
          {snapshot && snapshot.todaySpent > 0
            ? `You've spent ₦${snapshot.todaySpent.toLocaleString()} today.`
            : greeting.subtitle}
        </p>
      </div>

      <div className='flex items-center justify-between'>
        <CreateErrand />
      </div>
    </div>
  )
}
