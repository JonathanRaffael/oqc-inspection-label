"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Package2, TrendingUp, Activity, Calendar, Target, Zap, Bell, Plus, Users, TrendingDown, RefreshCw } from 'lucide-react'
import Link from "next/link"
import { PrintHistoryList } from "../../components/dashboard/print-history-list"

// Simple Loading Component (matching login page style)
function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <Skeleton className="h-8 w-80 bg-gray-200" />
            <Skeleton className="h-4 w-60 bg-gray-200" />
          </div>
          <Skeleton className="h-10 w-40 bg-gray-200 rounded-md" />
        </div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid gap-6 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-4 w-24 bg-gray-200" />
              <Skeleton className="h-8 w-8 bg-gray-200 rounded-md" />
            </div>
            <Skeleton className="h-8 w-16 bg-gray-200 mb-2" />
            <Skeleton className="h-3 w-32 bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  )
}

// Updated Statistics Component with real API data (same functionality, simple styling)
function PrintHistoryStats() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    week: 0,
    month: 0,
    todayTrend: 0,
    sessions: {
      total: 0,
      today: 0,
      week: 0,
      month: 0,
    },
    lastUpdated: null as string | null,
  })

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/stats", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
      setError("Failed to load statistics")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()

    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return <DashboardLoading />
  }

  if (error) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="md:col-span-2 lg:col-span-4 border-red-200 bg-red-50 shadow-md">
          <CardContent className="p-6 text-center">
            <div className="text-red-600 mb-2 flex items-center justify-center">
              <Activity className="w-4 h-4 mr-2" />
              Error Loading Statistics
            </div>
            <p className="text-red-500 text-sm mb-4">{error}</p>
            <Button 
              onClick={fetchStats} 
              className="bg-emerald-600 hover:bg-emerald-700 text-white" 
              size="sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statsData = [
    {
      title: "Total Prints",
      value: stats.total,
      description: "Semua label dicetak",
      icon: Target,
      trend: null,
      sessions: stats.sessions.total,
    },
    {
      title: "Today's Prints",
      value: stats.today,
      description: "Label hari ini",
      icon: Zap,
      trend: stats.todayTrend,
      sessions: stats.sessions.today,
    },
    {
      title: "This Week",
      value: stats.week,
      description: "Label minggu ini",
      icon: Calendar,
      trend: null,
      sessions: stats.sessions.week,
    },
    {
      title: "This Month",
      value: stats.month,
      description: "Label bulan ini",
      icon: Activity,
      trend: null,
      sessions: stats.sessions.month,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Last Updated Info */}
      {stats.lastUpdated && (
        <div className="flex items-center justify-between text-sm text-gray-500 bg-white rounded-lg shadow-md p-4">
          <span>Last updated: {new Date(stats.lastUpdated).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })}</span>
          <Button
            onClick={fetchStats}
            variant="outline"
            size="sm"
            className="text-emerald-600 border-emerald-300 hover:bg-emerald-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat, index) => (
          <Card
            key={index}
            className="bg-white border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-200"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
              <div className="p-2 bg-emerald-100 rounded-md">
                <stat.icon className="h-4 w-4 text-emerald-600" />
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="space-y-4">
                <div className="flex items-end justify-between">
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      {stat.value.toLocaleString()}
                      {stat.trend !== null && (
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full flex items-center ${
                            stat.trend >= 0 ? "text-emerald-700 bg-emerald-100" : "text-red-700 bg-red-100"
                          }`}
                        >
                          {stat.trend >= 0 ? (
                            <TrendingUp className="h-3 w-3 mr-0.5" />
                          ) : (
                            <TrendingDown className="h-3 w-3 mr-0.5" />
                          )}
                          {Math.abs(stat.trend)}%
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{stat.description}</p>
                    <p className="text-xs text-gray-400">{stat.sessions} sessions</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Progress</span>
                    <span>{Math.min(100, Math.round((stat.value / Math.max(stats.total, 1)) * 100))}%</span>
                  </div>
                  <Progress
                    value={Math.min(100, Math.round((stat.value / Math.max(stats.total, 1)) * 100))}
                    className="h-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const currentTime = new Date().toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    dateStyle: "full",
    timeStyle: "short",
  })

  return (
    <div className="min-h-screen bg-gray-100 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Simple Header (matching login page style) */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-600 rounded-lg">
                <Package2 className="h-6 w-6 text-white" />
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-gray-900">Sistem OQC PT Hang Tong</h1>
                <p className="text-gray-600">Dashboard Print History - {currentTime}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    System Online
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Active User
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                <Bell className="h-4 w-4" />
              </Button>
              <Link href="/dashboard/labels/new">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium">
                  <Plus className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Label Baru</span>
                  <span className="sm:hidden">Baru</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Statistics (same functionality, simple styling) */}
        <PrintHistoryStats />

        {/* Print History Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <Activity className="h-5 w-5 text-emerald-600" />
              History Print Terbaru
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Live Data</Badge>
            </h2>
          </div>

          <Card className="bg-white border border-gray-200 shadow-md">
            <CardContent className="p-0">
              <PrintHistoryList userId="user-id-kamu" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
