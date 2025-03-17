"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, Legend, XAxis, YAxis } from "recharts"
import { motion } from "framer-motion"

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { showToast } from "@/lib/toast"
import { Badge } from "./ui/badge"

interface ChartData {
  name: string
  usage: number
  stock: number
}

export function Overview() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<ChartData[]>([])

  useEffect(() => {
    async function fetchChartData() {
      try {
        setLoading(true)
        const response = await fetch("/api/analytics/overview")

        if (!response.ok) {
          throw new Error("Failed to fetch overview data")
        }

        const result = await response.json()
        setData(result.data)
      } catch (error) {
        console.error("Error fetching overview data:", error)
        showToast.error("Failed to load chart data. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchChartData()
  }, [])

  if (loading) {
    return (
      <div className="h-[300px] w-full">
        <Skeleton className="h-full w-full" />
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium">No data available</p>
          <p className="text-sm text-muted-foreground">There is no inventory data to display for this period.</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* <ChartContainer
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
        className="h-[300px]"
      >
        <BarChart
          data={[]}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Legend />
          <Bar dataKey="usage" fill="var(--color-usage)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="stock" fill="var(--color-stock)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartContainer> */}
      <div className="h-[300px] flex items-center justify-center">
        <p className="text-lg font-medium">Coming Soon</p>
      </div>
    </motion.div>
  )
}

