'use client'

import { Cell, Pie, PieChart } from 'recharts'
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
import { CATEGORY_MAP } from '@/lib/categories'

interface BreakdownItem {
  category: string
  amount: number
  percentage: number
}

interface SpendingBreakdownProps {
  breakdownData?: BreakdownItem[]
  isLoading: boolean
}

const chartConfig = {
  amount: { label: 'Total Spent' },
  food: { label: 'Food', color: 'hsl(var(--chart-1))' },
  transport: { label: 'Transport', color: 'hsl(var(--chart-2))' },
  office: { label: 'Office', color: 'hsl(var(--chart-3))' },
  utilities: { label: 'Utilities', color: 'hsl(var(--chart-4))' },
  shopping: { label: 'Shopping', color: 'hsl(var(--chart-5))' },
  other: { label: 'Other', color: 'hsl(var(--chart-6))' },
}

export default function SpendingBreakdown({
  breakdownData = [],
  isLoading,
}: SpendingBreakdownProps) {
  if (isLoading) {
    return (
      <div className='h-[350px] animate-pulse rounded-2xl bg-slate-100 border' />
    )
  }

  const formattedChartData = breakdownData.map((item) => ({
    name: CATEGORY_MAP[item.category]?.label || item.category,
    amount: item.amount,
    fill: CATEGORY_MAP[item.category]?.fill || 'var(--color-other)',
  }))

  return (
    <Card className='rounded-2xl border border-slate-200/60 bg-white shadow-sm flex flex-col justify-between'>
      <CardHeader className='pb-0'>
        <CardTitle className='text-sm font-bold uppercase tracking-wider text-slate-400'>
          Spending Breakdown
        </CardTitle>
        <CardDescription className='text-[11px] text-slate-400 mt-0.5'>
          Intraday distribution by asset groups
        </CardDescription>
      </CardHeader>

      <CardContent className='flex-1 pb-4 flex flex-col justify-center items-center sm:flex-row gap-4'>
        <ChartContainer
          config={chartConfig}
          className='mx-auto aspect-square max-h-[180px] w-[180px]'
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={formattedChartData}
              dataKey='amount'
              nameKey='name'
              innerRadius={50}
              outerRadius={75}
              strokeWidth={3}
            >
              {breakdownData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CATEGORY_MAP[entry.category]?.fill || '#94a3b8'}
                />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>

        {/* Dynamic List Ledger Component Side Pane */}
        <div className='flex flex-col gap-2 w-full sm:w-auto flex-1 justify-center'>
          {breakdownData.map((item) => {
            const details = CATEGORY_MAP[item.category] || CATEGORY_MAP.OTHER
            const Icon = details.icon
            return (
              <div
                key={item.category}
                className='flex items-center justify-between text-xs border-b border-slate-50 pb-1.5 last:border-none'
              >
                <div className='flex items-center gap-2'>
                  <span className={`p-1 rounded bg-slate-50 ${details.color}`}>
                    <Icon className='h-3 w-3' />
                  </span>
                  <span className='font-medium text-slate-600'>
                    {details.label}
                  </span>
                </div>
                <div className='text-right font-semibold text-slate-900'>
                  <span>{item.percentage.toFixed(0)}%</span>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
