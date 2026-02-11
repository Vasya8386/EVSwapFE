"use client"

import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Zap } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false)
  
  const { login } = useAuth()
  const router = useRouter()

  const isFormValid = email.trim() && password.trim()

 // Phần xử lý sau khi login thành công - EMAIL LOGIN
const handleEmailSignIn = async (e: React.FormEvent) => {
  e.preventDefault()

  try {
    const response = await fetch("http://localhost:8080/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        email.includes("@")
          ? { email: email, password: password }
          : { userName: email, password: password }
      ),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Login failed: ${errorText}`)
    }

    const data = await response.json()
    
    console.log("✅ Login response:", data)
    console.log("📍 All keys in response:", Object.keys(data))
    console.log("📍 data.userId:", data.userId)
    console.log("📍 data.userID:", data.userID) // Java thường dùng userID thay vì userId
    console.log("📍 data.id:", data.id)
    console.log("📍 data.user_id:", data.user_id)

    // ✅ Lấy userId từ response - THỬ TẤT CẢ VARIANTS
    const userIdFromResponse = data.userId || data.userID || data.id || data.user_id
    
    console.log("🎯 Final userId extracted:", userIdFromResponse)
    
    // ✅ Tạo user object hoàn chỉnh
    const user = {
      userId: userIdFromResponse,
      fullName: data.fullName,
      email: data.email,
      userName: data.username,
      role: data.role,
      token: data.token,
    }

    console.log("📦 User object to save:", user)

    // ✅ Lưu TOÀN BỘ user object vào localStorage
    localStorage.setItem("user", JSON.stringify(user))
    
    // ✅ Lưu userId riêng để dễ truy cập
    if (userIdFromResponse) {
      localStorage.setItem("userId", userIdFromResponse.toString())
      console.log("✅ UserId saved to localStorage:", userIdFromResponse)
    } else {
      console.error("❌ No userId found in response!")
    }

    // Lưu các thông tin khác
    localStorage.setItem("token", data.token)
    localStorage.setItem("role", data.role)
    localStorage.setItem("username", data.username)

    // Gọi login từ auth hook
    login(user)

    // Redirect theo role
    if (user.role === "DRIVER") router.push("/")
    else if (user.role === "STAFF") router.push("/staff/inventory")
    else if (user.role === "ADMIN") router.push("/admin/batteries")
    else router.push("/")
  } catch (error) {
    console.error("Login error:", error)
    alert("Invalid username or password")
  }
}

// Phần xử lý sau khi login thành công - GOOGLE LOGIN
const handleGoogleSignIn = useCallback(async (response: any) => {
  console.log("🔐 Google Sign-In Response:", response)
  setIsGoogleLoading(true)

  try {
    const googleToken = response.credential

    console.log("📤 Sending token to backend...")
    const res = await fetch("http://localhost:8080/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: googleToken }),
    })

    const data = await res.json()
    console.log("📥 Backend response:", data)
    console.log("📍 All keys in response:", Object.keys(data))
    console.log("📍 data.userId:", data.userId)
    console.log("📍 data.userID:", data.userID)
    console.log("📍 data.id:", data.id)

    if (res.ok) {
      // ✅ Lấy userId từ response - THỬ TẤT CẢ VARIANTS
      const userIdFromResponse = data.userId || data.userID || data.id || data.user_id
      
      console.log("🎯 Final userId extracted:", userIdFromResponse)
      
      // ✅ Tạo user object hoàn chỉnh
      const user = {
        userId: userIdFromResponse,
        fullName: data.fullName,
        email: data.email,
        userName: data.username,
        role: data.role,
        token: data.token,
      }

      console.log("📦 User object to save:", user)

      // ✅ Lưu TOÀN BỘ user object vào localStorage
      localStorage.setItem("user", JSON.stringify(user))
      
      // ✅ Lưu userId riêng
      if (userIdFromResponse) {
        localStorage.setItem("userId", userIdFromResponse.toString())
        console.log("✅ UserId saved to localStorage:", userIdFromResponse)
      } else {
        console.error("❌ No userId found in response!")
      }

      // Lưu token và thông tin khác
      if (data.token) {
        localStorage.setItem("token", data.token)
        localStorage.setItem("role", data.role)
        localStorage.setItem("username", data.username)
        localStorage.setItem("authToken", data.token)
        localStorage.setItem("userRole", data.role)
        localStorage.setItem("userName", data.username)
        localStorage.setItem("userEmail", data.email)
      }

      login(user)

      alert("🎉 Đăng nhập Google thành công!")
      
      // Redirect theo role
      if (data.role === "DRIVER") router.push("/")
      else if (data.role === "STAFF") router.push("/staff/queue")
      else if (data.role === "ADMIN") router.push("/admin")
      else window.location.href = "/"
    } else {
      alert("❌ Google login failed: " + (data.message || data || "Unknown error"))
    }
  } catch (err) {
    console.error("❌ Google login error:", err)
    alert("❌ Error: " + err)
  } finally {
    setIsGoogleLoading(false)
  }
}, [login, router])
  // Load Google Script
  useEffect(() => {
    if (window.google?.accounts?.id) {
      setGoogleScriptLoaded(true)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true

    script.onload = () => {
      console.log("✅ Google script loaded")
      setGoogleScriptLoaded(true)
    }

    script.onerror = () => {
      console.error("❌ Failed to load Google script")
    }

    document.body.appendChild(script)

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  // Initialize Google Button
  useEffect(() => {
    if (!googleScriptLoaded || !window.google) {
      console.log("⏳ Waiting for Google script...")
      return
    }

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

    if (!clientId || clientId === "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com") {
      console.error("❌ Google Client ID not configured!")
      return
    }

    try {
      console.log("🔧 Initializing Google Sign-In...")

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleSignIn,
        auto_select: false,
        cancel_on_tap_outside: true,
      })

      const buttonDiv = document.getElementById("googleSignInButton")
      if (buttonDiv) {
        window.google.accounts.id.renderButton(
          buttonDiv,
          {
            theme: "outline",
            size: "large",
            width: 400,
            text: "signin_with",
            shape: "rectangular",
          }
        )
        console.log("✅ Google button rendered")
      } else {
        console.error("❌ Button div not found")
      }
    } catch (error) {
      console.error("❌ Error initializing Google Sign-In:", error)
    }
  }, [googleScriptLoaded, handleGoogleSignIn])

  return (
    <div className="min-h-screen bg-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#A2F200]">
            <Zap className="w-10 h-10 text-black" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">EVSwap</h1>
          <p className="text-gray-600">Battery Swap Station Management</p>
        </div>

        {/* Sign In Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600">Sign in to access your EVSwap account</p>
          </div>

          {/* Google Sign-In Button */}
          <div className="mb-4">
            <div
              id="googleSignInButton"
              className="flex justify-center items-center min-h-[44px]"
              style={{
                opacity: isGoogleLoading ? 0.5 : 1,
                pointerEvents: isGoogleLoading ? 'none' : 'auto'
              }}
            />
            {!googleScriptLoaded && (
              <div className="text-center text-sm text-gray-500">
                Loading Google Sign-In...
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 uppercase">Or continue with email</span>
            </div>
          </div>

          {/* Email Sign In Form */}
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                Email or User Name
              </label>
              <Input
                id="email"
                type="text"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <label htmlFor="remember" className="text-sm text-gray-700 cursor-pointer">
                  Remember me
                </label>
              </div>
              <Link href="/forgot-password" className="text-sm text-purple-600 hover:text-purple-700">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className={`w-full h-12 text-base ${
                isFormValid
                  ? "bg-purple-600 hover:bg-purple-700 text-white"
                  : "bg-gray-400 cursor-not-allowed text-white"
              }`}
              disabled={!isFormValid}
            >
              Sign In
            </Button>
          </form>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Don't have an account?{" "}
            <Link href="/signup" className="text-purple-600 hover:text-purple-700 font-medium">
              Sign Up here
            </Link>
          </p>
        </div>

        {/* Back to Home */}
        <Link
          href="/"
          className="flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 mt-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  )
}

// TypeScript types
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void
          renderButton: (element: HTMLElement | null, config: any) => void
          prompt: () => void
        }
      }
    }
  }
}
