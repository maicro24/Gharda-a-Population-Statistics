"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if we have population data already
    const storedData = localStorage.getItem("populationData")
    if (!storedData) {
      // Initialize with empty array if no data exists
      localStorage.setItem("populationData", JSON.stringify([]))
    }

    // Check if we have user preferences
    const karimbahaPref = localStorage.getItem("userPrefs_karimbaha@gmail.com")
    const boucerbakarimPref = localStorage.getItem("userPrefs_boucerbakarim@gmail.com")

    // Initialize default preferences for admin
    if (!karimbahaPref) {
      localStorage.setItem(
        "userPrefs_karimbaha@gmail.com",
        JSON.stringify({
          lastVisited: new Date().toISOString(),
          theme: "light",
          dashboardView: "overview",
        }),
      )
    }

    // Initialize default preferences for representative
    if (!boucerbakarimPref) {
      localStorage.setItem(
        "userPrefs_boucerbakarim@gmail.com",
        JSON.stringify({
          lastVisited: new Date().toISOString(),
          theme: "light",
          dashboardView: "data-management",
        }),
      )
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // In a real app, this would be an API call to authenticate
      // For demo purposes, we'll use hardcoded credentials
      const accounts = [
        { email: "karimbaha@gmail.com", password: "datastat", role: "admin", familyName: "", tribeName: "" },
        {
          email: "boucerbakarim@gmail.com",
          password: "karim123",
          role: "representative",
          familyName: "بوسربة",
          tribeName: "انشاشبة",
        },
        {
          email: "abdellahrep@gmail.com",
          password: "family123",
          role: "representative",
          familyName: "ابن عبد الله",
          tribeName: "انشاشبة",
        },
        {
          email: "aboubakr@gmail.com",
          password: "family123",
          role: "representative",
          familyName: "ابو الصديق",
          tribeName: "انشاشبة",
        },
        {
          email: "ashqabqab@gmail.com",
          password: "family123",
          role: "representative",
          familyName: "اشقبقب",
          tribeName: "انشاشبة",
        },
        {
          email: "babasidi@gmail.com",
          password: "family123",
          role: "representative",
          familyName: "بابا سيدي",
          tribeName: "انشاشبة",
        },
      ]

      const account = accounts.find((acc) => acc.email === email && acc.password === password)

      if (account) {
        // Update last login time for these specific accounts
        if (account.email === "karimbaha@gmail.com" || account.email === "boucerbakarim@gmail.com") {
          const userPrefsKey = `userPrefs_${account.email}`
          const currentPrefs = JSON.parse(localStorage.getItem(userPrefsKey) || "{}")
          localStorage.setItem(
            userPrefsKey,
            JSON.stringify({
              ...currentPrefs,
              lastVisited: new Date().toISOString(),
            }),
          )
        }

        // Store user info in localStorage (in a real app, use secure cookies or tokens)
        localStorage.setItem(
          "user",
          JSON.stringify({
            email: account.email,
            role: account.role,
            familyName: account.familyName,
            tribeName: account.tribeName,
          }),
        )

        // Redirect to dashboard
        router.push("/dashboard")
      } else {
        setError("Invalid email or password")
      }
    } catch (err) {
      setError("An error occurred during login")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="shadow-lg border-teal-700 bg-white/90 backdrop-blur-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-teal-800 text-center">تسجيل الدخول</CardTitle>
        <CardDescription className="text-center">
          أدخل بيانات الاعتماد الخاصة بك للوصول إلى نظام إدارة بيانات العائلة
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-teal-200 focus:border-teal-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">كلمة المرور</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border-teal-200 focus:border-teal-500"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-teal-600 hover:bg-teal-700 relative overflow-hidden transform transition-all duration-200 
            shadow-[0_6px_0_rgb(13,148,136)] hover:shadow-[0_4px_0px_rgb(13,148,136)] 
            ease-out hover:translate-y-1 active:translate-y-2 active:shadow-[0_0px_0px_rgb(13,148,136)]"
            disabled={isLoading}
          >
            {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <div className="text-sm text-center w-full text-gray-500">
          <p className="mb-1">معلومات المسؤول:</p>
          <ul className="list-disc inline-block text-right">
            <li className="mx-auto text-center">البريد الإلكتروني: karimbaha@gmail.com</li>
          </ul>
        </div>
      </CardFooter>
    </Card>
  )
}

