"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Eye, EyeOff, AlertCircle, User, Lock, LogIn, Package2, CheckCircle } from 'lucide-react'

export default function SimpleLabelLogin() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })

      if (result?.error) {
        setError("Login gagal. Periksa email dan password.")
        setIsLoading(false)
        return
      }

      // Show success feedback
      setShowSuccess(true)
      setIsLoading(false)
      
      // Wait a moment before redirect
      setTimeout(() => {
        router.push("/dashboard")
        router.refresh()
      }, 1500)
    } catch (err) {
      setError("Terjadi kesalahan. Coba lagi.")
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin()
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 rounded-lg mb-4">
            <Package2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Label Creator</h1>
          <p className="text-gray-600">Pack • Bin • Pallet Labels</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-center">
                <AlertCircle className="w-4 h-4 text-red-500 mr-2 flex-shrink-0" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}

            {/* Success Message */}
            {showSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-md p-3 flex items-center">
                <CheckCircle className="w-4 h-4 text-emerald-500 mr-2 flex-shrink-0" />
                <span className="text-sm text-emerald-700">Login berhasil! Mengarahkan ke dashboard...</span>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="admin@internal.local"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Masukkan password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
                    showPassword ? 'text-emerald-600 hover:text-emerald-700' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading || showSuccess}
              className={`w-full font-medium py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${
                showSuccess 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {showSuccess ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Berhasil!
                </>
              ) : isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Masuk...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Masuk
                </>
              )}
            </button>
          </form>

          {/* Quick Info */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-2">Sistem Internal</p>
              <div className="flex justify-center space-x-4 text-xs text-gray-400">
                <span>• Pack Labels</span>
                <span>• Bin Labels</span>
                <span>• Pallet Labels</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            Internal Label System © 2025
          </p>
        </div>
      </div>
    </div>
  )
}
