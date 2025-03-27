"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { DataExporter } from "@/components/admin/data-exporter"
import { Button } from "@/components/ui/button"

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  // Check if already authenticated
  useEffect(() => {
    const adminStatus = localStorage.getItem("isAdmin") === "true"
    setIsAdmin(adminStatus)
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()

    // Simple password check - in a real app, use proper authentication
    // This is just a basic protection since you want to keep everything in GHL
    if (password === "HMNPadmin2023") {
      localStorage.setItem("isAdmin", "true")
      setIsAdmin(true)
      setError("")
    } else {
      setError("Invalid password")
    }
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-md mx-auto p-6 border rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-6">Admin Access</h1>

          {error && <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md">{error}</div>}

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <DataExporter />

        <div className="p-6 border rounded-lg bg-card">
          <h3 className="text-lg font-medium mb-4">API Status</h3>
          <p className="text-sm text-muted-foreground mb-4">
            The API health monitor is available in the bottom right corner of any page when logged in as admin.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              localStorage.removeItem("isAdmin")
              setIsAdmin(false)
            }}
            className="w-full"
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  )
}

