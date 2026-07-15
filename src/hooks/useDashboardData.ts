'use client'

import { InsightsMetricsData, TodaySnapshotData } from '@/types/dashboard'
import { useQuery } from '@tanstack/react-query'

export function useDashboardData() {
  return useQuery({
    queryKey: ['dashboard', 'master-data'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard')
      if (!res.ok) {
        throw new Error('Failed to fetch dashboard intelligence matrix')
      }
      return res.json()
    },
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60 * 2,
  })
}

export function useTodaySnapshot() {
  return useQuery<TodaySnapshotData>({
    queryKey: ['dashboard', 'today-snapshot'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/today')
      if (!res.ok) throw new Error('Failed to stream daily metrics')
      return res.json()
    },
    refetchInterval: 10000,
  })
}

export function useInsightsMetrics() {
  return useQuery<InsightsMetricsData>({
    queryKey: ['dashboard', 'health-upcoming'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/insights')
      if (!res.ok) throw new Error('Failed to stream analytical insights')
      return res.json()
    },
    refetchInterval: 15000,
  })
}
