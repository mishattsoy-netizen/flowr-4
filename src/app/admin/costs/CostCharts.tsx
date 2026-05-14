'use client'

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip,
} from 'recharts'

function formatCurrency(n: number): string {
  if (n >= 1) return `$${n.toFixed(2)}`
  if (n >= 0.01) return `$${n.toFixed(4)}`
  return `$${n.toFixed(6)}`
}

export function CostSeriesChart({ data }: { data: { period: string; cost: number; tokens: number }[] }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-[11px] text-bone-70 opacity-40 italic">
        No cost data for this period
      </div>
    )
  }
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--bone-10)" />
        <XAxis
          dataKey="period"
          tick={{ fontSize: 10, fill: 'var(--bone-30)' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: string) => {
            const d = new Date(v + 'T00:00:00')
            return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
          }}
        />
        <YAxis
          tick={{ fontSize: 10, fill: 'var(--bone-30)' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => formatCurrency(v)}
          width={60}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--color-panel)',
            border: '1px solid var(--bone-12)',
            borderRadius: '12px',
            fontSize: '11px',
            fontFamily: 'monospace',
          }}
          labelFormatter={(label: any) => new Date(String(label) + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          formatter={(value: any) => [formatCurrency(Number(value)), 'Cost']}
        />
        <Area type="monotone" dataKey="cost" stroke="#f59e0b" strokeWidth={2} fill="url(#costGradient)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
