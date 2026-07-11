import { AppSidebar } from '@/components/dashboard/AppSidebar'
import TopNavbar from '@/components/dashboard/TopNavbar'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Suspense } from 'react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className='flex h-screen w-screen overflow-hidden bg-slate-50/50 text-slate-900'>
        <Suspense fallback={null}>
          <AppSidebar />
        </Suspense>

        {/* Main App Display Window - Right */}
        <div className='relative flex flex-1 flex-col overflow-hidden'>
          <TopNavbar />

          {/* Route Pages Content Area */}
          <main className='flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50'>
            <div className='max-w-7xl mx-auto space-y-6'>{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
