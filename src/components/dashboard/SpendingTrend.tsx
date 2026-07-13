'use client'

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

interface TrendItem {
  month: string
  amount: number
}

interface SpendingTrendProps {
  trendData?: TrendItem[]
  isLoading: boolean
}

const chartConfig = {
  amount: {
    label: 'Spent',
    color: 'hsl(var(--chart-1))',
  },
}

export default function SpendingTrend({
  trendData = [],
  isLoading,
}: SpendingTrendProps) {
  if (isLoading) {
    return (
      <div className='h-[300px] animate-pulse rounded-2xl bg-slate-100 border' />
    )
  }

  return (
    <Card className='rounded-2xl border border-slate-200/60 bg-white shadow-sm flex flex-col justify-between h-full'>
      <CardHeader className='pb-2'>
        <CardTitle className='text-sm font-bold uppercase tracking-wider text-slate-400'>
          Monthly Spending Trend
        </CardTitle>
        <CardDescription className='text-[11px] text-slate-400 mt-0.5'>
          Month-over-month cash outflow vector
        </CardDescription>
      </CardHeader>

      <CardContent className='flex-1 pb-4 pt-2'>
        <ChartContainer
          config={chartConfig}
          className='aspect-auto h-[180px] w-full'
        >
          <LineChart
            data={trendData}
            margin={{
              top: 5,
              left: -10,
              right: 10,
              bottom: 0,
            }}
          >
            <CartesianGrid
              vertical={false}
              className='stroke-slate-100'
              strokeDasharray='3 3'
            />
            <XAxis
              dataKey='month'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className='text-[10px] font-medium text-slate-400'
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className='text-[10px] font-medium text-slate-400'
              tickFormatter={(val: any) => `₦${(val / 1000).toFixed(0)}k`}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Line
              dataKey='amount'
              type='monotone'
              stroke='rgb(16, 185, 129)' // Emerald brand flavor line
              strokeWidth={2.5}
              dot={{
                fill: 'rgb(16, 185, 129)',
                r: 3,
              }}
              activeDot={{
                r: 5,
                strokeWidth: 0,
              }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
