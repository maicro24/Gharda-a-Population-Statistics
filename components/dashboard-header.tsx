"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import type { UserType } from "@/lib/types"
import { LogOut, Menu, X } from "lucide-react"

interface DashboardHeaderProps {
  user: UserType
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()

  const handleLogout = () => {
    // Save user preferences before logout if it's one of our special users
    if (user.email === "karimbaha@gmail.com" || user.email === "boucerbakarim@gmail.com") {
      const userPrefsKey = `userPrefs_${user.email}`
      const currentPrefs = JSON.parse(localStorage.getItem(userPrefsKey) || "{}")

      // Get current tab from URL or default to overview
      const currentPath = window.location.pathname
      let currentView = "overview"
      if (currentPath.includes("data-management")) currentView = "data-management"
      if (currentPath.includes("add-entry")) currentView = "add-entry"

      localStorage.setItem(
        userPrefsKey,
        JSON.stringify({
          ...currentPrefs,
          lastLogout: new Date().toISOString(),
          dashboardView: currentView,
        }),
      )
    }

    localStorage.removeItem("user")
    router.push("/")
  }

  return (
    <header className="bg-teal-800 text-white sticky top-0 z-30 shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative h-10 w-10 md:h-12 md:w-12 overflow-hidden rounded-full border-2 border-teal-300">
              <Image src="/images/ghardaia.jpg" alt="Ghardaïa" fill style={{ objectFit: "cover" }} />
            </div>
            <div className="rtl">
              <h1 className="text-lg md:text-xl font-bold">إحصائيات سكان غرداية</h1>
              <p className="text-xs md:text-sm text-teal-200">
                {user.role === "admin" ? "المسؤول" : `${user.tribeName} - ${user.familyName}`}
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <div className="text-right">
              <p className="font-medium">{user.email}</p>
              <p className="text-sm text-teal-200">{user.role === "admin" ? "صلاحيات المسؤول" : "ممثل العائلة"}</p>
            </div>
            <Button variant="outline" className="border-teal-300 hover:bg-teal-700 text-white" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              تسجيل الخروج
            </Button>
          </div>

          <button className="md:hidden p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-teal-700 mt-3">
            <div className="flex flex-col space-y-3">
              <div className="text-center">
                <p className="font-medium">{user.email}</p>
                <p className="text-sm text-teal-200">{user.role === "admin" ? "صلاحيات المسؤول" : "ممثل العائلة"}</p>
              </div>
              <Button variant="outline" className="border-teal-300 hover:bg-teal-700 text-white" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                تسجيل الخروج
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

