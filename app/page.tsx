"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true"

    // Redirect based on authentication status
    if (isAuthenticated) {
      router.push("/home")
    } else {
      router.push("/login")
    }
  }, [router])

  // Show loading state while checking authentication
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <div className="w-12 h-12 border-4 border-blue border-t-transparent rounded-full animate-spin"></div>
    </div>
  )
}

