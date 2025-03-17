"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

type MetricsData = {
  requestCount: number
  errorCount: number
  responseTimeTotal: number
  responseTimeAvg: number
  statusCodes: Record<number, number>
  endpoints: Record<string, number>
  timestamp: string
}

export default function MonitoringPage() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMetrics = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/monitoring")

      if (!response.ok) {
        throw new Error(`Failed to fetch metrics: ${response.status}`)
      }

      const data = await response.json()
      setMetrics(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()

    // Refresh metrics every 30 seconds
    const interval = setInterval(fetchMetrics, 30000)

    return () => clearInterval(interval)
  }, [])

  // Transform status code data for chart
  const statusCodeData = metrics
    ? Object.entries(metrics.statusCodes).map(([code, count]) => ({
        code,
        count,
      }))
    : []

  // Transform endpoint data for chart
  const endpointData = metrics
    ? Object.entries(metrics.endpoints).map(([path, count]) => ({
        path,
        count,
      }))
    : []

  return (
    <div className="flex flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">System Monitoring</h1>
            <p className="text-muted-foreground">Monitor system performance and API usage</p>
          </div>
          <Button onClick={fetchMetrics} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {error ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-destructive">Error: {error}</div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics?.requestCount || 0}</div>
                  <p className="text-xs text-muted-foreground">Since last reset</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metrics ? ((metrics.errorCount / metrics.requestCount) * 100).toFixed(2) : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">{metrics?.errorCount || 0} errors</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics?.responseTimeAvg.toFixed(2) || 0} ms</div>
                  <p className="text-xs text-muted-foreground">Across all endpoints</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metrics ? new Date(metrics.timestamp).toLocaleTimeString() : "-"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {metrics ? new Date(metrics.timestamp).toLocaleDateString() : "-"}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="status" className="space-y-4">
              <TabsList>
                <TabsTrigger value="status">Status Codes</TabsTrigger>
                <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
              </TabsList>
              <TabsContent value="status" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Status Code Distribution</CardTitle>
                    <CardDescription>Distribution of HTTP status codes across all requests</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[400px]">
                    {statusCodeData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={statusCodeData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="code" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="count" fill="#8884d8" name="Requests" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <p className="text-muted-foreground">No data available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="endpoints" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Endpoint Usage</CardTitle>
                    <CardDescription>Request count by API endpoint</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[400px]">
                    {endpointData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={endpointData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="path" type="category" width={150} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="count" fill="#82ca9d" name="Requests" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <p className="text-muted-foreground">No data available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  )
}

