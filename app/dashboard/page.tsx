"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardNav } from "@/components/dashboard-nav"
import { StatisticsOverview } from "@/components/statistics-overview"
import { DataTable } from "@/components/data-table"
import { DataEntryForm } from "@/components/data-entry-form"
import { UserManagement } from "@/components/user-management"
import { DataGeneratorTool } from "@/components/data-generator-tool"
import { DonationTracking } from "@/components/donation-tracking"
import { ProjectsManagement } from "@/components/projects-management"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { UserType } from "@/lib/types"
// أضف استيراد مكون دمج البيانات
import { DataMerger } from "@/components/data-merger"

export default function DashboardPage() {
  const [user, setUser] = useState<UserType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("user")
    if (!storedUser) {
      router.push("/")
      return
    }

    try {
      const parsedUser = JSON.parse(storedUser)
      setUser(parsedUser)

      // Load saved preferences for special users
      if (parsedUser.email === "karimbaha@gmail.com" || parsedUser.email === "boucerbakarim@gmail.com") {
        const userPrefsKey = `userPrefs_${parsedUser.email}`
        const savedPrefs = localStorage.getItem(userPrefsKey)

        if (savedPrefs) {
          const prefs = JSON.parse(savedPrefs)
          // Set default tab based on saved preference
          if (
            prefs.dashboardView &&
            [
              "overview",
              "data-management",
              "add-entry",
              "user-management",
              "data-generator",
              "donation-tracking",
              "projects",
            ].includes(prefs.dashboardView)
          ) {
            setActiveTab(prefs.dashboardView)
          }
        }
      }
    } catch (error) {
      console.error("Failed to parse user data:", error)
      localStorage.removeItem("user")
      router.push("/")
    } finally {
      setIsLoading(false)
    }
  }, [router])

  // Save the current tab when it changes
  const handleTabChange = (value: string) => {
    // تعيين التبويب النشط
    setActiveTab(value)

    // حفظ التفضيل إذا كان المستخدم من المستخدمين الخاصين
    if (user && (user.email === "karimbaha@gmail.com" || user.email === "boucerbakarim@gmail.com")) {
      const userPrefsKey = `userPrefs_${user.email}`
      const currentPrefs = JSON.parse(localStorage.getItem(userPrefsKey) || "{}")

      localStorage.setItem(
        userPrefsKey,
        JSON.stringify({
          ...currentPrefs,
          dashboardView: value,
        }),
      )
    }

    // تمرير إلى المحتوى المناسب
    setTimeout(() => {
      const tabContent = document.querySelector(`[data-state="active"][data-value="${value}"]`)
      if (tabContent) {
        tabContent.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    }, 100)
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-teal-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-teal-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg text-teal-800">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Router will redirect
  }

  return (
    <div className="min-h-screen bg-teal-50">
      <DashboardHeader user={user} />
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3">
            <DashboardNav user={user} />
          </div>
          <div className="lg:col-span-9">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
              <TabsList className="bg-white border border-teal-200 p-1 flex flex-wrap">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-teal-100 data-[state=active]:text-teal-900"
                >
                  نظرة عامة
                </TabsTrigger>
                <TabsTrigger
                  value="data-management"
                  className="data-[state=active]:bg-teal-100 data-[state=active]:text-teal-900"
                >
                  إدارة البيانات
                </TabsTrigger>
                <TabsTrigger
                  value="add-entry"
                  className="data-[state=active]:bg-teal-100 data-[state=active]:text-teal-900"
                >
                  إضافة سجل جديد
                </TabsTrigger>
                {user.role === "admin" && (
                  <TabsTrigger
                    value="user-management"
                    className="data-[state=active]:bg-teal-100 data-[state=active]:text-teal-900"
                  >
                    إدارة المستخدمين
                  </TabsTrigger>
                )}
                {user.role === "admin" && (
                  <TabsTrigger
                    value="data-generator"
                    className="data-[state=active]:bg-teal-100 data-[state=active]:text-teal-900"
                  >
                    توليد البيانات
                  </TabsTrigger>
                )}
                <TabsTrigger
                  value="donation-tracking"
                  className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900"
                >
                  تتبع التبرعات
                </TabsTrigger>
                <TabsTrigger
                  value="projects"
                  className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900"
                >
                  مشاريع الطلاب
                </TabsTrigger>
                {user.role === "admin" && (
                  <TabsTrigger
                    value="data-merger"
                    className="data-[state=active]:bg-green-100 data-[state=active]:text-green-900"
                  >
                    دمج البيانات
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <StatisticsOverview user={user} />
              </TabsContent>

              <TabsContent value="data-management">
                <DataTable user={user} />
              </TabsContent>

              <TabsContent value="add-entry">
                <DataEntryForm user={user} />
              </TabsContent>

              {user.role === "admin" && (
                <TabsContent value="user-management">
                  <UserManagement user={user} />
                </TabsContent>
              )}

              {user.role === "admin" && (
                <TabsContent value="data-generator">
                  <DataGeneratorTool />
                </TabsContent>
              )}

              {user.role === "admin" && (
                <TabsContent value="data-merger">
                  <DataMerger />
                </TabsContent>
              )}

              <TabsContent value="donation-tracking">
                <DonationTracking />
              </TabsContent>

              <TabsContent value="projects">
                <ProjectsManagement user={user} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}

