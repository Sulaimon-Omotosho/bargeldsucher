export interface TodaySnapshotData {
  todayIncome: number
  todaySpent: number
  todayTransactionsCount: number
  remainingCash: number
}

export interface Activity {
  id: string
  title: string
  amount: number
  vendor?: string | null
  errandId: string
  errandTitle: string
  date: Date | string
  category: 'TRANSPORT' | 'FOOD' | 'OFFICE' | 'UTILITIES' | 'SHOPPING' | 'OTHER'
}

export interface TodaySnapshotData {
  todayIncome: number
  todaySpent: number
  todayTransactionsCount: number
  remainingCash: number
  dailyMetrics: {
    dailyLimit: number
    todaySpent: number
    remaining: number
    percentageSpent: number
  }
}

export interface InsightsMetricsData {
  healthScore: number
  healthStatus: string
  reasons: string[]
  upcomingSpending: Array<{
    id: string
    title: string
    totalAllocated: number
    amountRemaining: number
    expenseCount: number
    createdAt: string
  }>
}

export interface DashboardMasterData {
  stats: {
    currentBalance: number
    totalExpensesLogged: number
    safeBufferPercentage: number
  }
}
