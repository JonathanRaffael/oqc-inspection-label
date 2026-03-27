"use client"

import type React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronRight, Home, Package2, Bell, Settings, User } from 'lucide-react'
import Link from "next/link"

interface DashboardHeaderProps {
  heading: string
  text?: string
  children?: React.ReactNode
  icon?: React.ComponentType<{ className?: string }>
  badge?: {
    text: string
    variant?: "default" | "secondary" | "outline" | "destructive"
    count?: number
  }
  showTime?: boolean
}

// Utility function for Indonesian time
function getCurrentTimeIndonesia() {
  return new Date().toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// Simple Header Component (matching login page style)
export function DashboardHeader({
  heading,
  text,
  children,
  icon: Icon = Package2,
  badge,
  showTime = true,
}: DashboardHeaderProps) {
  const currentTime = getCurrentTimeIndonesia()

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-600 rounded-lg">
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{heading}</h1>
              {badge && (
                <Badge
                  className={
                    badge.variant === "destructive"
                      ? "bg-red-100 text-red-700 border-red-200"
                      : "bg-emerald-100 text-emerald-700 border-emerald-200"
                  }
                >
                  {badge.text}
                  {badge.count !== undefined && ` (${badge.count})`}
                </Badge>
              )}
            </div>
            {text && <p className="text-gray-600">{text}</p>}
            {showTime && (
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  System Online
                </div>
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  Active User
                </div>
                <div className="hidden sm:block">{currentTime}</div>
              </div>
            )}
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
          <Button
            variant="outline"
            size="sm"
            className="border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            <Settings className="h-4 w-4" />
          </Button>
          {children}
        </div>
      </div>
    </div>
  )
}

// Simple Compact Version
export function DashboardHeaderCompact({
  heading,
  text,
  children,
  icon: Icon = Package2,
}: Omit<DashboardHeaderProps, "icon" | "badge" | "showTime"> & {
  icon?: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4 border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-600 rounded-lg">
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">{heading}</h1>
            {text && <p className="text-gray-600 text-sm">{text}</p>}
          </div>
        </div>
        {children && <div className="flex gap-2">{children}</div>}
      </div>
    </div>
  )
}

// Simple Breadcrumb Header
export function DashboardHeaderWithBreadcrumb({
  heading,
  text,
  children,
  breadcrumbs,
  icon: Icon = Package2,
  badge,
}: DashboardHeaderProps & {
  breadcrumbs?: Array<{ label: string; href?: string }>
}) {
  return (
    <div className="space-y-4 mb-6">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 rounded-t-lg">
            <nav className="flex items-center gap-2 text-sm">
              <Link href="/dashboard" className="text-emerald-600 hover:text-emerald-700 transition-colors">
                <div className="p-1 rounded hover:bg-gray-100">
                  <Home className="h-4 w-4" />
                </div>
              </Link>
              <ChevronRight className="h-3 w-3 text-gray-400" />
              {breadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center gap-2">
                  {index > 0 && <ChevronRight className="h-3 w-3 text-gray-400" />}
                  {crumb.href ? (
                    <Link
                      href={crumb.href}
                      className="text-emerald-600 hover:text-emerald-700 transition-colors px-2 py-1 rounded hover:bg-gray-100"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-gray-900 font-medium px-2 py-1 bg-white rounded border border-gray-200">
                      {crumb.label}
                    </span>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}

      <DashboardHeader heading={heading} text={text} icon={Icon} badge={badge}>
        {children}
      </DashboardHeader>
    </div>
  )
}

// Simple Status Header
export function DashboardHeaderWithStatus({
  heading,
  text,
  children,
  icon: Icon = Package2,
  badge,
  systemStatus = "normal",
}: DashboardHeaderProps & {
  systemStatus?: "normal" | "maintenance" | "warning"
}) {
  const statusConfig = {
    normal: {
      text: "Sistem Berjalan Normal",
      color: "text-emerald-700",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      icon: "bg-emerald-500",
    },
    maintenance: {
      text: "Sistem Dalam Maintenance",
      color: "text-amber-700",
      bg: "bg-amber-50",
      border: "border-amber-200",
      icon: "bg-amber-500",
    },
    warning: {
      text: "Peringatan Sistem",
      color: "text-red-700",
      bg: "bg-red-50",
      border: "border-red-200",
      icon: "bg-red-500",
    },
  }

  const status = statusConfig[systemStatus]

  return (
    <div className="space-y-4 mb-6">
      <div className={`${status.bg} ${status.border} border rounded-lg p-4 shadow-md`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 ${status.icon} rounded-full`} />
            <span className={`font-medium ${status.color}`}>{status.text}</span>
            <Badge className={`${status.bg} ${status.color} border-0 text-xs`}>
              Live Status
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Last Updated:</span>
            <span className="font-medium">{new Date().toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta" })}</span>
          </div>
        </div>
      </div>

      <DashboardHeader heading={heading} text={text} icon={Icon} badge={badge} showTime={true}>
        {children}
      </DashboardHeader>
    </div>
  )
}

// Simple Page Header for internal pages
export function PageHeader({
  title,
  description,
  children,
  icon: Icon,
}: {
  title: string
  description?: string
  children?: React.ReactNode
  icon?: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {Icon && (
            <div className="p-3 bg-emerald-600 rounded-lg">
              <Icon className="h-6 w-6 text-white" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {description && <p className="text-gray-600 mt-1">{description}</p>}
          </div>
        </div>
        {children && <div className="flex items-center gap-3">{children}</div>}
      </div>
    </div>
  )
}
