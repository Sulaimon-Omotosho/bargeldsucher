import Sidebar from '@/components/dashboard/Sidebar'
import TopNavbar from '@/components/dashboard/TopNavbar'
import QueryProvider from '@/providers/QueryProvider'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <QueryProvider>
      <div className='flex h-screen w-screen overflow-hidden bg-slate-50/50 text-slate-900'>
        {/* Sidebar - Fixed Left */}
        <Sidebar />

        {/* Main App Display Window - Right */}
        <div className='relative flex flex-1 flex-col overflow-hidden'>
          {/* Navigation Bar */}
          <TopNavbar />

          {/* Route Pages Content Area */}
          <main className='flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50'>
            <div className='max-w-7xl mx-auto space-y-6'>{children}</div>
          </main>
        </div>
      </div>
    </QueryProvider>
  )
}
