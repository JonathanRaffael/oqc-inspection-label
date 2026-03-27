"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import {
  LogOut,
  User,
  Tags,
  Plus,
  BarChart3,
  Menu,
  Package2,
  Boxes   // 🔥 tambah icon
} from "lucide-react"

interface NavProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export function Nav({ user }: NavProps) {
  const pathname = usePathname()

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { href: "/dashboard/labels", label: "Labels", icon: Tags },

    // 🔥 TAMBAHAN
    { href: "/dashboard/items", label: "Items", icon: Boxes },

    { href: "/dashboard/labels/new", label: "New Label", icon: Plus },
  ]

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                <Package2 className="h-6 w-6 text-white" />
              </div>
              <div className="hidden md:block">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg text-gray-900">
                    PT Hang Tong Manufactory
                  </span>
                </div>
                <div className="text-xs text-gray-600 font-medium">
                  Quality Control System
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href))

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-emerald-600 text-white"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">

            {/* Mobile Menu */}
            <div className="lg:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  >
                    <Menu className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="bg-white border-gray-200 shadow-lg">
                  {navItems.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      (item.href !== "/dashboard" && pathname.startsWith(item.href))

                    return (
                      <DropdownMenuItem key={item.href} asChild>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center gap-2 w-full",
                            isActive
                              ? "bg-emerald-50 text-emerald-700 font-medium"
                              : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                          )}
                        >
                          <item.icon className="h-4 w-4" />
                          {item.label}
                          {isActive && (
                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs ml-auto">
                              Active
                            </Badge>
                          )}
                        </Link>
                      </DropdownMenuItem>
                    )
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-10 w-10 rounded-full border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                >
                  {user.image ? (
                    <img
                      src={user.image || "/placeholder.svg"}
                      alt={user.name || "User"}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-64 bg-white border-gray-200 shadow-lg">

                {/* User Info */}
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {user.image ? (
                        <img
                          src={user.image || "/placeholder.svg"}
                          alt={user.name || "User"}
                          className="h-10 w-10 rounded-full object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-emerald-600 flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
                    </div>

                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {user.name || "User"}
                      </p>
                      <p className="text-xs text-gray-600">{user.email}</p>
                    </div>
                  </div>
                </div>

                <DropdownMenuSeparator className="bg-gray-200" />

                {/* Sign Out */}
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-red-600 hover:bg-red-50 m-1 rounded cursor-pointer"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

          </div>
        </div>
      </div>
    </header>
  )
}