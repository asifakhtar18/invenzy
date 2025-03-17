"use client"

import { Line, LineChart, CartesianGrid, XAxis, YAxis, Legend } from "recharts"

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"



export function UsageChart({ timeRange }: { timeRange: string }) {

  return (
    <ChartContainer
      config={{
        usage: {
          label: "Usage",
          color: "hsl(var(--chart-1))",
        },
        stock: {
          label: "Stock Level",
          color: "hsl(var(--chart-2))",
        },
      }}
      className="h-full"
    >
      <LineChart
        data={[]}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Legend />
        <Line type="monotone" dataKey="usage" stroke="var(--color-usage)" activeDot={{ r: 8 }} strokeWidth={2} />
        <Line type="monotone" dataKey="stock" stroke="var(--color-stock)" strokeWidth={2} />
      </LineChart>
    </ChartContainer>
  )
}

