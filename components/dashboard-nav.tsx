"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { UserType } from "@/lib/types"
import {
  BarChart3,
  Home,
  Users,
  Database,
  Download,
  PlusCircle,
  FileSpreadsheet,
  Gift,
  BookOpen,
  FileDiffIcon as FileMerge,
} from "lucide-react"
import { exportToExcel } from "@/lib/export-utils"
import { useToast } from "@/hooks/use-toast"

interface DashboardNavProps {
  user: UserType
}

export function DashboardNav({ user }: DashboardNavProps) {
  const { toast } = useToast()
  const [isExporting, setIsExporting] = useState(false)
  // أضف هذا المتغير مع متغيرات الحالة الأخرى في بداية المكون
  const [activeTab, setActiveTab] = useState("")

  // أضف هذا بعد تعريف المتغيرات
  useEffect(() => {
    // تحديد التبويب النشط من URL أو من localStorage
    const currentPath = window.location.pathname
    let currentTab = "overview"

    if (currentPath.includes("data-management")) currentTab = "data-management"
    if (currentPath.includes("add-entry")) currentTab = "add-entry"
    if (currentPath.includes("user-management")) currentTab = "user-management"
    if (currentPath.includes("data-generator")) currentTab = "data-generator"
    if (currentPath.includes("donation-tracking")) currentTab = "donation-tracking"
    if (currentPath.includes("projects")) currentTab = "projects"
    if (currentPath.includes("data-merger")) currentTab = "data-merger"

    setActiveTab(currentTab)
  }, [])

  const handleExportData = async () => {
    setIsExporting(true)
    try {
      // Get data from localStorage
      const storedData = localStorage.getItem("populationData")
      const data = storedData ? JSON.parse(storedData) : []

      // Filter data if user is a representative
      const filteredData =
        user.role === "admin" ? data : data.filter((item: any) => item.familyName === user.familyName)

      if (filteredData.length === 0) {
        toast({
          title: "لا توجد بيانات للتصدير",
          description: "الرجاء إضافة بعض البيانات أولاً.",
          variant: "destructive",
        })
        setIsExporting(false)
        return
      }

      await exportToExcel(filteredData, `ghardaia-population-${new Date().toISOString().split("T")[0]}`)

      toast({
        title: "تم التصدير بنجاح",
        description: "تم تصدير البيانات إلى Excel بنجاح.",
      })
    } catch (error) {
      console.error("Export failed:", error)
      toast({
        title: "فشل التصدير",
        description: "حدث خطأ أثناء تصدير البيانات.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  // تحديث وظيفة التنقل بين الأقسام لتعمل بشكل صحيح
  const handleTabClick = (tabName: string) => {
    // استخدام طريقة أكثر موثوقية للتنقل بين الأقسام
    const tabTrigger = document.querySelector(`[value="${tabName}"]`) as HTMLElement
    if (tabTrigger) {
      // استخدام نهج مباشر للنقر
      tabTrigger.click()

      // تأكد من أن التبويب تم تحديده فعلاً
      if (activeTab !== tabName) {
        setActiveTab(tabName)
      }
    }
  }

  return (
    <Card className="p-4 bg-white border-teal-200 shadow-md">
      <div className="space-y-2 rtl">
        <h2 className="font-semibold text-teal-800 mb-4 text-lg">لوحة التحكم</h2>

        <Button
          variant="ghost"
          className="w-full justify-start text-gray-600 hover:text-teal-800 hover:bg-teal-50"
          onClick={() => handleTabClick("overview")}
        >
          <Home className="ml-2 h-4 w-4" />
          الرئيسية
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start text-gray-600 hover:text-teal-800 hover:bg-teal-50"
          onClick={() => handleTabClick("data-management")}
        >
          <Database className="ml-2 h-4 w-4" />
          إدارة البيانات
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start text-gray-600 hover:text-teal-800 hover:bg-teal-50"
          onClick={() => handleTabClick("add-entry")}
        >
          <PlusCircle className="ml-2 h-4 w-4" />
          إضافة سجل جديد
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start text-gray-600 hover:text-teal-800 hover:bg-teal-50"
          onClick={() => handleTabClick("overview")}
        >
          <BarChart3 className="ml-2 h-4 w-4" />
          الإحصائيات
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start text-gray-600 hover:text-amber-800 hover:bg-amber-50"
          onClick={() => handleTabClick("donation-tracking")}
        >
          <Gift className="ml-2 h-4 w-4 text-[#e7a854]" />
          تتبع التبرعات
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start text-gray-600 hover:text-amber-800 hover:bg-amber-50"
          onClick={() => handleTabClick("projects")}
        >
          <BookOpen className="ml-2 h-4 w-4 text-[#e7a854]" />
          مشاريع الطلاب
        </Button>

        {user.role === "admin" && (
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-600 hover:text-teal-800 hover:bg-teal-50"
            onClick={() => handleTabClick("user-management")}
          >
            <Users className="ml-2 h-4 w-4" />
            إدارة المستخدمين
          </Button>
        )}

        {user.role === "admin" && (
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-600 hover:text-teal-800 hover:bg-teal-50"
            onClick={() => handleTabClick("data-generator")}
          >
            <FileSpreadsheet className="ml-2 h-4 w-4" />
            توليد البيانات
          </Button>
        )}

        {user.role === "admin" && (
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-600 hover:text-green-800 hover:bg-green-50"
            onClick={() => handleTabClick("data-merger")}
          >
            <FileMerge className="ml-2 h-4 w-4 text-green-600" />
            دمج البيانات
          </Button>
        )}

        <Button
          variant="outline"
          className="w-full justify-start mt-6 border-teal-300 hover:bg-teal-50 hover:text-teal-800"
          onClick={handleExportData}
          disabled={isExporting}
        >
          {isExporting ? (
            <>
              <div className="h-4 w-4 border-2 border-t-teal-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin ml-2"></div>
              جاري التصدير...
            </>
          ) : (
            <>
              <Download className="ml-2 h-4 w-4" />
              تصدير إلى Excel
            </>
          )}
        </Button>
      </div>
    </Card>
  )
}

