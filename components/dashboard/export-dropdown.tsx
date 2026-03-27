"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Download, Calendar, Clock, CalendarDays, CalendarRange, Database, FileText } from 'lucide-react'
import { toast } from "@/components/ui/use-toast"

interface ExportDropdownProps {
  searchTerm?: string
  filterType?: string
  sortBy?: string
}

export function ExportDropdown({ searchTerm = "", filterType = "all", sortBy = "newest" }: ExportDropdownProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async (period: string) => {
    setIsExporting(true)

    try {
      const params = new URLSearchParams()
      let label = ""

      // Include current filters in export
      if (searchTerm.trim()) {
        params.append("search", searchTerm.trim())
      }
      if (filterType && filterType !== "all") {
        params.append("type", filterType)
      }
      params.append("sort", sortBy)

      // Perbaiki logika periode export dengan timezone yang benar
      const now = new Date()

      switch (period) {
        case "daily":
          // Hari ini dari jam 00:00:00 sampai 23:59:59
          const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
          const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
          params.append("startDate", todayStart.toISOString())
          params.append("endDate", todayEnd.toISOString())
          params.append("period", "today")
          label = "Hari Ini"
          break
        case "weekly":
          // Minggu ini dari hari Minggu
          const weekStart = new Date(now)
          weekStart.setDate(now.getDate() - now.getDay())
          weekStart.setHours(0, 0, 0, 0)
          params.append("startDate", weekStart.toISOString())
          params.append("period", "week")
          label = "Minggu Ini"
          break
        case "monthly":
          // Bulan ini dari tanggal 1
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
          params.append("startDate", monthStart.toISOString())
          params.append("period", "month")
          label = "Bulan Ini"
          break
        case "yearly":
          // Tahun ini dari 1 Januari
          const yearStart = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0)
          params.append("startDate", yearStart.toISOString())
          params.append("period", "year")
          label = "Tahun Ini"
          break
        default:
          params.append("period", "all")
          label = "Semua Data"
          break
      }

      console.log("Export request:", params.toString()) // Debug log

      const response = await fetch(`/api/print-history/export?${params.toString()}`)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Export failed:", errorText)
        throw new Error("Export failed")
      }

      // Create download link
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url

      // Generate filename with period and date
      const dateStr = new Date().toISOString().split("T")[0]
      const periodStr =
        period === "all"
          ? "semua"
          : period === "daily"
            ? "harian"
            : period === "weekly"
              ? "mingguan"
              : period === "monthly"
                ? "bulanan"
                : period === "yearly"
                  ? "tahunan"
                  : period

      // Add filter info to filename if filters are applied
      let filterSuffix = ""
      if (searchTerm.trim()) {
        filterSuffix += "-filtered"
      }
      if (filterType && filterType !== "all") {
        filterSuffix += `-${filterType}`
      }

      a.download = `print-history-${periodStr}${filterSuffix}-${dateStr}.csv`

      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      const filterInfo = searchTerm.trim() || (filterType && filterType !== "all") 
        ? " (dengan filter yang diterapkan)" 
        : ""

      toast({
        title: "Export berhasil",
        description: `Data print history ${label.toLowerCase()}${filterInfo} berhasil didownload.`,
      })
    } catch (error) {
      console.error("Export error:", error)
      toast({
        title: "Export gagal",
        description: "Terjadi kesalahan saat mengexport data.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-gray-300 hover:bg-gray-50 text-gray-700"
          disabled={isExporting}
        >
          <Download className="mr-2 h-4 w-4" />
          {isExporting ? "Exporting..." : "Export"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-white border-gray-200 shadow-lg">
        <DropdownMenuLabel className="flex items-center gap-2 text-gray-700">
          <FileText className="h-4 w-4" />
          Export Data
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-200" />

        <DropdownMenuItem onClick={() => handleExport("daily")} className="cursor-pointer hover:bg-gray-50">
          <Clock className="mr-2 h-4 w-4" />
          Hari Ini
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleExport("weekly")} className="cursor-pointer hover:bg-gray-50">
          <Calendar className="mr-2 h-4 w-4" />
          Minggu Ini
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleExport("monthly")} className="cursor-pointer hover:bg-gray-50">
          <CalendarDays className="mr-2 h-4 w-4" />
          Bulan Ini
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleExport("yearly")} className="cursor-pointer hover:bg-gray-50">
          <CalendarRange className="mr-2 h-4 w-4" />
          Tahun Ini
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-gray-200" />

        <DropdownMenuItem onClick={() => handleExport("all")} className="cursor-pointer hover:bg-gray-50">
          <Database className="mr-2 h-4 w-4" />
          Semua Data
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
