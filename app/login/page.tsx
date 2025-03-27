"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Droplets, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Check if user is already logged in
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isAuthenticated") === "true"
    if (isLoggedIn) {
      router.push("/home")
    }
  }, [router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Check credentials
    if (email === "biclove@gmail.com" && password === "biclove@tech0") {
      // Set authentication in localStorage
      localStorage.setItem("isAuthenticated", "true")

      // Redirect to home page
      router.push("/home")
    } else {
      setError("Invalid email or password")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Droplets size={32} className="text-blue" />
            <h1 className="text-3xl font-bold text-navy">Flowledge</h1>
          </div>
          <p className="text-navy/70">Sign in to access your knowledge hub</p>
        </div>

        <Card className="border-blue/20">
          <CardHeader>
            <CardTitle className="text-navy">Sign In</CardTitle>
            <CardDescription>Enter your credentials to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-navy">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-blue/20"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-navy">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-blue/20 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-navy/50 hover:text-navy"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <Button type="submit" className="w-full bg-blue hover:bg-blue/90" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-navy/70 text-center">
              <a href="#" className="text-blue hover:underline">
                Forgot your password?
              </a>
            </div>
            <div className="border-t border-blue/10 pt-4 w-full text-center">
              <p className="text-sm text-navy/70">
                Don't have an account?{" "}
                <a href="#" className="text-blue hover:underline">
                  Contact your administrator
                </a>
              </p>
            </div>
          </CardFooter>
        </Card>

        <div className="mt-8 text-center text-sm text-navy/60">
          <p>© 2025 Flowledge. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}

