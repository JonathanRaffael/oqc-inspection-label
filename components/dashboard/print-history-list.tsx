"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { ClipboardCheck, Container, FileText, Calendar, User, Package, ChevronLeft, ChevronRight, Search, Filter, Clock, Hash, Package2, MapPin, RefreshCw, Layers, TrendingUp, Crown, CheckCircle2, Info, ArrowUpDown, CalendarIcon, Timer, Activity } from 'lucide-react'
import { useState, useEffect, useMemo } from "react"
import type { PrintHistory } from "@prisma/client"
import { ExportDropdown } from "./export-dropdown"

interface PrintHistoryListProps {
  userId: string
}

interface PrintHistoryResponse {
  printHistory: PrintHistory[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// Simple Loading Component (matching login page style)
function EnhancedLoading() {
  return (
    <div className="space-y-6 p-6">
      {/* Search and Filter Skeleton */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          <Skeleton className="h-10 flex-1 bg-gray-200" />
          <div className="flex gap-3">
            <Skeleton className="h-10 w-40 bg-gray-200" />
            <Skeleton className="h-10 w-40 bg-gray-200" />
          </div>
        </div>
        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-200">
          <Skeleton className="h-4 w-32 bg-gray-200" />
          <Skeleton className="h-4 w-32 bg-gray-200" />
          <Skeleton className="h-4 w-32 bg-gray-200" />
        </div>
      </div>

      {/* Date Groups Skeleton */}
      {Array.from({ length: 2 }).map((_, groupIndex) => (
        <div key={groupIndex} className="space-y-4">
          <div className="bg-emerald-600 text-white p-4 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="h-5 w-5 bg-white/20 rounded" />
                <div className="space-y-1">
                  <Skeleton className="h-5 w-32 bg-white/20" />
                  <Skeleton className="h-4 w-24 bg-white/10" />
                </div>
              </div>
              <div className="flex gap-3">
                <Skeleton className="h-6 w-16 bg-white/20 rounded-full" />
                <Skeleton className="h-6 w-16 bg-white/20 rounded-full" />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, itemIndex) => (
              <Card key={itemIndex} className="border border-gray-200 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-6 w-24 bg-gray-200 rounded-full" />
                        <Skeleton className="h-6 w-20 bg-gray-200 rounded-full" />
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <Skeleton className="h-3 w-16 bg-gray-200 mb-2" />
                            <Skeleton className="h-4 w-24 bg-gray-200" />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-16 bg-gray-200" />
                      <Skeleton className="h-4 w-20 bg-gray-200" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// Simple Empty State Component (matching login page style)
function EnhancedEmptyState({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div className="p-12 text-center">
      <div className="relative mx-auto w-16 h-16 mb-6">
        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
          <ClipboardCheck className="h-8 w-8 text-gray-400" />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">Tidak Ada Data Ditemukan</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Belum ada history print label atau hasil pencarian tidak ditemukan. Coba ubah filter atau buat label baru.
        </p>
      </div>

      <div className="flex justify-center mt-6">
        <Button
          onClick={onRefresh}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Data
        </Button>
      </div>
    </div>
  )
}

export function PrintHistoryList({ userId }: PrintHistoryListProps) {
  const [data, setData] = useState<PrintHistoryResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("newest")
  const limit = 8

  // Keep the original fetchPrintHistory function
  const fetchPrintHistory = async (page: number) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search: searchTerm.trim(),
        type: filterType,
        sort: sortBy,
      })

      console.log("Fetching with params:", params.toString())
      console.log("Search term:", searchTerm)
      console.log("Filter type:", filterType)
      console.log("Sort by:", sortBy)

      const response = await fetch(`/api/print-history?${params}`)
      if (response.ok) {
        const result = await response.json()
        console.log("API Response:", result)
        setData(result)
      } else {
        console.error("Failed to fetch print history:", response.status, response.statusText)
      }
    } catch (error) {
      console.error("Error fetching print history:", error)
    } finally {
      setLoading(false)
    }
  }

  // Keep all original useEffect hooks
  useEffect(() => {
    console.log("Search/Filter changed:", { searchTerm, filterType, sortBy })

    const debounceTimer = setTimeout(() => {
      setCurrentPage(1)
      fetchPrintHistory(1)
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchTerm, filterType, sortBy])

  useEffect(() => {
    if (currentPage > 1) {
      fetchPrintHistory(currentPage)
    }
  }, [currentPage])

  useEffect(() => {
    fetchPrintHistory(1)
  }, [])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleRefresh = () => {
    setSearchTerm("")
    setFilterType("all")
    setSortBy("newest")
    setCurrentPage(1)
    fetchPrintHistory(1)
  }

  const getLabelTypeIcon = (type: string) => {
    switch (type) {
      case "bin":
        return <Container className="h-4 w-4" />
      case "palet":
        return <FileText className="h-4 w-4" />
      case "pack":
        return <ClipboardCheck className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const getLabelTypeConfig = (type: string) => {
    switch (type) {
      case "bin":
        return {
          badgeClass: "bg-purple-100 text-purple-800 border-purple-200",
        }
      case "palet":
        return {
          badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
        }
      case "pack":
        return {
          badgeClass: "bg-blue-100 text-blue-800 border-blue-200",
        }
      default:
        return {
          badgeClass: "bg-gray-100 text-gray-800 border-gray-200",
        }
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDateGroup = (date: string) => {
    const dateObj = new Date(date)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (dateObj.toDateString() === today.toDateString()) {
      return "Hari Ini"
    } else if (dateObj.toDateString() === yesterday.toDateString()) {
      return "Kemarin"
    } else {
      return dateObj.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    }
  }

  // Keep original grouping logic
  const groupedHistory = useMemo(() => {
    if (!data?.printHistory) return {}

    return data.printHistory.reduce(
      (groups, item) => {
        const date = new Date(item.printedAt).toDateString()
        if (!groups[date]) {
          groups[date] = []
        }
        groups[date].push(item)
        return groups
      },
      {} as Record<string, PrintHistory[]>,
    )
  }, [data?.printHistory])

  if (loading) {
    return <EnhancedLoading />
  }

  if (!data || data.printHistory.length === 0) {
    return <EnhancedEmptyState onRefresh={handleRefresh} />
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls with Export (simple style) */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari berdasarkan part number, description, lot, atau inspector..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
            />
          </div>

          {/* Filter Controls and Export */}
          <div className="flex gap-3">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40 border-gray-300">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Type</SelectItem>
                <SelectItem value="bin">Bin Labels</SelectItem>
                <SelectItem value="palet">Palet Labels</SelectItem>
                <SelectItem value="pack">Pack Labels</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40 border-gray-300">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Terbaru</SelectItem>
                <SelectItem value="oldest">Terlama</SelectItem>
                <SelectItem value="type">Berdasarkan Type</SelectItem>
                <SelectItem value="quantity">Berdasarkan Qty</SelectItem>
              </SelectContent>
            </Select>

            <ExportDropdown 
              searchTerm={searchTerm}
              filterType={filterType}
              sortBy={sortBy}
            />
          </div>
        </div>

        {/* Quick Stats with Filter Info */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Activity className="h-4 w-4 text-emerald-500" />
              <span className="font-medium">{data.pagination.total}</span>
              <span>Total Records</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Timer className="h-4 w-4 text-emerald-500" />
              <span className="font-medium">{Object.keys(groupedHistory).length}</span>
              <span>Days Active</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <span className="font-medium">{data.printHistory.reduce((sum, item) => sum + item.labelCount, 0)}</span>
              <span>Labels Printed</span>
            </div>
          </div>
          
          {/* Active Filters Indicator */}
          {(searchTerm.trim() || (filterType && filterType !== "all")) && (
            <div className="flex items-center gap-2 text-sm text-emerald-600">
              <Filter className="h-4 w-4" />
              <span>Filter aktif</span>
              <Button
                onClick={handleRefresh}
                variant="ghost"
                size="sm"
                className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 h-6 px-2"
              >
                Clear
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* History List */}
      <div className="space-y-6">
        {Object.entries(groupedHistory).map(([date, items]) => {
          const totalLabels = items.reduce((sum, item) => sum + item.labelCount, 0)
          const uniqueTypes = [...new Set(items.map((item) => item.labelType))].length

          return (
            <div key={date} className="space-y-4">
              {/* Date Header (simple style) */}
              <div className="bg-emerald-600 text-white p-4 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white/10 rounded-lg">
                      <CalendarIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{formatDateGroup(date)}</h3>
                      <p className="text-emerald-100 text-sm">
                        {items.length} print session{items.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge className="bg-white/20 text-white border-white/30">
                      <Layers className="h-3 w-3 mr-1" />
                      {totalLabels} labels
                    </Badge>
                    <Badge className="bg-white/20 text-white border-white/30">
                      <Package2 className="h-3 w-3 mr-1" />
                      {uniqueTypes} type{uniqueTypes !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* History Items */}
              <div className="grid gap-4">
                {items.map((item) => {
                  const typeConfig = getLabelTypeConfig(item.labelType)

                  return (
                    <Card
                      key={item.id}
                      className="border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-200"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-6">
                          <div className="flex-1 min-w-0 space-y-4">
                            {/* Header with badges */}
                            <div className="flex items-center gap-3 flex-wrap">
                              <Badge className={`${typeConfig.badgeClass} border font-medium px-3 py-1`}>
                                {getLabelTypeIcon(item.labelType)}
                                <span className="ml-2 capitalize">{item.labelType} Label</span>
                              </Badge>

                              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 font-medium px-3 py-1">
                                <Hash className="h-3 w-3 mr-1" />
                                {item.labelCount} label{item.labelCount !== 1 ? "s" : ""}
                              </Badge>

                              {item.labelCount > 10 && (
                                <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 font-medium px-2 py-1">
                                  <Crown className="h-3 w-3 mr-1" />
                                  High Volume
                                </Badge>
                              )}
                            </div>

                            {/* Details Grid (simple style) */}
                            <div className="grid gap-3 md:grid-cols-2">
                              {item.partNo && (
                                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                  <div className="p-1.5 bg-gray-100 rounded-md">
                                    <Package className="h-3 w-3 text-gray-600" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                      Part Number
                                    </div>
                                    <div className="font-semibold text-gray-900 truncate">{item.partNo}</div>
                                  </div>
                                </div>
                              )}

                              {item.partDescription && (
                                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                  <div className="p-1.5 bg-gray-100 rounded-md">
                                    <Info className="h-3 w-3 text-gray-600" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                      Description
                                    </div>
                                    <div className="font-semibold text-gray-900 truncate" title={item.partDescription}>
                                      {item.partDescription}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {item.productName && (
                                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                  <div className="p-1.5 bg-emerald-100 rounded-md">
                                    <Package2 className="h-3 w-3 text-emerald-600" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                      Product Name
                                    </div>
                                    <div className="font-semibold text-gray-900 truncate">{item.productName}</div>
                                  </div>
                                </div>
                              )}

                              {item.lotNo && (
                                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                  <div className="p-1.5 bg-amber-100 rounded-md">
                                    <MapPin className="h-3 w-3 text-amber-600" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                      Lot Number
                                    </div>
                                    <div className="font-semibold text-gray-900">{item.lotNo}</div>
                                  </div>
                                </div>
                              )}

                              {item.quantity && (
                                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                  <div className="p-1.5 bg-cyan-100 rounded-md">
                                    <Hash className="h-3 w-3 text-cyan-600" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                      Quantity
                                    </div>
                                    <div className="font-semibold text-gray-900">{item.quantity}</div>
                                  </div>
                                </div>
                              )}

                              {item.date && (
                                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                  <div className="p-1.5 bg-indigo-100 rounded-md">
                                    <Calendar className="h-3 w-3 text-indigo-600" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                      Production Date
                                    </div>
                                    <div className="font-semibold text-gray-900">
                                      {new Date(item.date).toLocaleDateString("id-ID")}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {item.inspector && (
                                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 md:col-span-2">
                                  <div className="p-1.5 bg-rose-100 rounded-md">
                                    <User className="h-3 w-3 text-rose-600" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                      Inspector
                                    </div>
                                    <div className="font-semibold text-gray-900 flex items-center gap-2">
                                      {item.inspector}
                                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">
                                        <CheckCircle2 className="h-2 w-2 mr-1" />
                                        Verified
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Timestamp */}
                          <div className="text-right min-w-0">
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                              Printed At
                            </div>
                            <div className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                              <Clock className="h-3 w-3 text-gray-400" />
                              {formatDate(item.printedAt)}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Pagination (simple style) */}
      {data.pagination.pages > 1 && (
        <Card className="border border-gray-200 shadow-md bg-white">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600 flex items-center gap-2">
                <Info className="h-4 w-4 text-gray-400" />
                <span>
                  Showing{" "}
                  <span className="font-semibold">{(data.pagination.page - 1) * data.pagination.limit + 1}</span> to{" "}
                  <span className="font-semibold">
                    {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)}
                  </span>{" "}
                  of <span className="font-semibold">{data.pagination.total}</span> results
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="border-gray-300 hover:bg-gray-50"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, data.pagination.pages) }, (_, i) => {
                    let pageNum
                    if (data.pagination.pages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= data.pagination.pages - 2) {
                      pageNum = data.pagination.pages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 p-0 ${
                          currentPage === pageNum
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                            : "border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === data.pagination.pages}
                  className="border-gray-300 hover:bg-gray-50"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
