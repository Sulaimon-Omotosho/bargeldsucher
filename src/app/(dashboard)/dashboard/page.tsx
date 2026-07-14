'use client'

import { getDashboardDataAction } from '@/app/actions/dashboard'
import CashHealthScore from '@/components/dashboard/CashHealthScore'
// import CreateExpense from '@/components/dashboard/CreateExpense'
import DashboardGreeting from '@/components/dashboard/DashboardGreeting'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import MonthlyBudgetProgress from '@/components/dashboard/MonthlyBudgetProgress'
import MonthlySnapshot from '@/components/dashboard/MonthlySnapshot'
import RecentErrands from '@/components/dashboard/RecentErrands'
import SavingsOpportunityCard from '@/components/dashboard/SavingsOpportunityCard'
import SpendingBreakdown from '@/components/dashboard/SpendingBreakdown'
import SpendingTrend from '@/components/dashboard/SpendingTrend'
import SystemInsights from '@/components/dashboard/SystemInsights'
import TodaySnapshot from '@/components/dashboard/TodaySnapshot'
import TopCategoryCard from '@/components/dashboard/TopCategoryCard'
import UpcomingSpending from '@/components/dashboard/UpcomingSpending'
import CreateExpense from '@/components/expenses/CreateExpenses'
import DashboardSkeleton from '@/components/skeletons/DashboardSkeleton'
import {
  useDashboardData,
  useInsightsMetrics,
  useTodaySnapshot,
} from '@/hooks/useDashboardData'
import { TodaySnapshotData } from '@/types/dashboard'
import { useQuery } from '@tanstack/react-query'
import { AlertCircle } from 'lucide-react'
import { useSession } from 'next-auth/react'

export default function DashboardPage() {
  const { data: session } = useSession()

  const { data, isLoading, isError } = useDashboardData()
  const { data: snapshot, isLoading: snapLoading } = useTodaySnapshot()
  const { data: insightsMetrics, isLoading: insightsLoading } =
    useInsightsMetrics()

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (isError) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[400px] text-center p-6 bg-slate-50 rounded-2xl border border-slate-200/60 m-4'>
        <AlertCircle className='h-10 w-10 text-rose-500 mb-3' />
        <h3 className='text-base font-semibold text-slate-900'>
          Failed to load dashboard data
        </h3>
        <p className='text-sm text-slate-500 max-w-xs mt-1'>
          Please verify your connection or database synchronization parameters
          and try again.
        </p>
      </div>
    )
  }

  return (
    <div className='space-y-8 animate-in fade-in duration-300'>
      {/* Welcome Top Row Headers */}
      <DashboardHeader
        userName={session?.user?.name}
        dailyMetrics={data?.dailyMetrics}
        isLoading={isLoading}
      />

      {/* --- KPI Financial Summary Grid --- */}
      <TodaySnapshot snapshot={snapshot} isLoading={isLoading || snapLoading} />

      <hr className='border-slate-200/60' />

      {/* New Insights and Forecast Layers */}
      <div className='grid gap-6 md:grid-cols-2'>
        <CashHealthScore
          score={insightsMetrics?.healthScore ?? 100}
          status={insightsMetrics?.healthStatus ?? 'Excellent'}
          reasons={insightsMetrics?.reasons ?? []}
          isLoading={insightsLoading}
        />
        <UpcomingSpending
          items={insightsMetrics?.upcomingSpending ?? []}
          isLoading={insightsLoading}
        />
      </div>

      {/* --- Mid-Tier Intelligent Strategy Row --- */}
      <div className='grid gap-6 md:grid-cols-3'>
        <TopCategoryCard
          categoryName={data?.topCategory?.name}
          amount={data?.topCategory?.amount}
          percentage={data?.topCategory?.percentage}
          isLoading={isLoading}
        />

        <MonthlyBudgetProgress
          allocated={data?.overallBudget?.allocated}
          spent={data?.overallBudget?.spent}
          remaining={data?.overallBudget?.remaining}
          percentageSpent={data?.overallBudget?.percentageSpent}
          isLoading={isLoading}
        />

        <SavingsOpportunityCard
          insightText={data?.savingsOpportunity?.text}
          potentialSavings={data?.savingsOpportunity?.potentialSavings}
          isLoading={isLoading}
        />
      </div>

      <hr className='border-slate-200/60' />

      {/* --- Monthly Stats Layout --- */}
      <MonthlySnapshot stats={data?.stats} />

      {/* --- Lower Master Workspace Area --- */}
      <div className='grid gap-6 lg:grid-cols-3 items-stretch'>
        {/* Left Section: Rich, Contextual Transaction Feeds */}
        <div className='lg:col-span-2'>
          <RecentErrands recentActivities={data?.recentActivities} />
        </div>

        {/* Right Section: Dual-Stack High-Density Analytics */}
        <div className='lg:col-span-1 '>
          <SpendingBreakdown
            breakdownData={data?.breakdown}
            isLoading={isLoading}
          />
        </div>
      </div>
      <div className='w-full pt-2'>
        <SpendingTrend trendData={data?.trend} isLoading={isLoading} />
      </div>

      {/* Floating Action Trigger */}
      <div className='fixed bottom-6 right-6 z-40 md:bottom-8 md:right-8 filter drop-shadow-xl transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]'>
        <CreateExpense />
      </div>
    </div>
  )
}
