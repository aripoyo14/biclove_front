"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  // Check authentication on component mount
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true"
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [router])

  return <>{children}</>
}

