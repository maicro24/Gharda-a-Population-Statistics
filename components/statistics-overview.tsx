"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { UserType, PersonData } from "@/lib/types"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts"

interface StatisticsOverviewProps {
  user: UserType
}

export function StatisticsOverview({ user }: StatisticsOverviewProps) {
  const [data, setData] = useState<PersonData[]>([])
  const [ageDistribution, setAgeDistribution] = useState<any[]>([])
  const [tribeDistribution, setTribeDistribution] = useState<any[]>([])
  const [employmentStats, setEmploymentStats] = useState<any[]>([])
  const [residentialAreaStats, setResidentialAreaStats] = useState<any[]>([])
  const [traditionalInstitutionStats, setTraditionalInstitutionStats] = useState<any[]>([])

  // Enhanced color palettes
  const TRIBE_COLORS = [
    "#0d9488",
    "#14b8a6",
    "#2dd4bf",
    "#5eead4",
    "#99f6e4",
    "#ccfbf1",
    "#0369a1",
    "#0284c7",
    "#0ea5e9",
    "#38bdf8",
    "#7dd3fc",
    "#bae6fd",
    "#7c3aed",
    "#8b5cf6",
    "#a78bfa",
    "#c4b5fd",
    "#ddd6fe",
    "#ede9fe",
    "#c026d3",
    "#d946ef",
    "#e879f9",
    "#f0abfc",
    "#f5d0fe",
    "#fae8ff",
    "#ea580c",
    "#f97316",
    "#fb923c",
    "#fdba74",
    "#fed7aa",
    "#ffedd5",
  ]

  const AGE_COLORS = [
    "#0d9488", // teal-600
    "#0891b2", // cyan-600
    "#0284c7", // sky-600
    "#2563eb", // blue-600
    "#4f46e5", // indigo-600
  ]

  const EMPLOYMENT_COLORS = [
    "#0d9488", // teal-600 - طالب
    "#0284c7", // sky-600 - موظف
    "#f97316", // orange-500 - غير موظف
    "#8b5cf6", // violet-500 - متقاعد
  ]

  const AREA_COLORS = [
    "#0d9488",
    "#14b8a6",
    "#2dd4bf",
    "#5eead4",
    "#99f6e4",
    "#0369a1",
    "#0284c7",
    "#0ea5e9",
    "#38bdf8",
    "#7dd3fc",
    "#7c3aed",
    "#8b5cf6",
    "#a78bfa",
    "#c4b5fd",
    "#ddd6fe",
    "#c026d3",
    "#d946ef",
    "#e879f9",
    "#f0abfc",
    "#f5d0fe",
    "#fae8ff",
  ]

  const INSTITUTION_COLORS = [
    "#0d9488", // teal-600
    "#0284c7", // sky-600
    "#8b5cf6", // violet-500
    "#f97316", // orange-500
    "#ec4899", // pink-500
    "#64748b", // slate-500
  ]

  useEffect(() => {
    // Load data from localStorage
    const storedData = localStorage.getItem("populationData")
    if (storedData) {
      const parsedData = JSON.parse(storedData)

      // Filter data if user is a representative
      const filteredData =
        user.role === "admin"
          ? parsedData
          : parsedData.filter((item: PersonData) => item.familyName === user.familyName)

      setData(filteredData)

      // Calculate age distribution
      const ageGroups = {
        "0-18": 0,
        "19-30": 0,
        "31-45": 0,
        "46-60": 0,
        "60+": 0,
      }

      filteredData.forEach((person: PersonData) => {
        const age = Number.parseInt(person.age)
        if (age <= 18) ageGroups["0-18"]++
        else if (age <= 30) ageGroups["19-30"]++
        else if (age <= 45) ageGroups["31-45"]++
        else if (age <= 60) ageGroups["46-60"]++
        else ageGroups["60+"]++
      })

      setAgeDistribution(Object.entries(ageGroups).map(([name, value]) => ({ name, value })))

      // Calculate tribe distribution (for admin only)
      if (user.role === "admin") {
        const tribes: Record<string, number> = {}
        filteredData.forEach((person: PersonData) => {
          tribes[person.tribeName] = (tribes[person.tribeName] || 0) + 1
        })
        setTribeDistribution(Object.entries(tribes).map(([name, value]) => ({ name, value })))
      }

      // Calculate employment stats
      const employmentStatus = {
        طالب: 0,
        موظف: 0,
        "غير موظف": 0,
        متقاعد: 0,
      }

      filteredData.forEach((person: PersonData) => {
        switch (person.employmentStatus) {
          case "student":
            employmentStatus["طالب"]++
            break
          case "employed":
            employmentStatus["موظف"]++
            break
          case "retired":
            employmentStatus["متقاعد"]++
            break
          case "unemployed":
          default:
            employmentStatus["غير موظف"]++
            break
        }
      })

      setEmploymentStats(Object.entries(employmentStatus).map(([name, value]) => ({ name, value })))

      // Calculate residential area stats
      const residentialAreas: Record<string, number> = {}
      filteredData.forEach((person: PersonData) => {
        if (person.residentialArea) {
          residentialAreas[person.residentialArea] = (residentialAreas[person.residentialArea] || 0) + 1
        }
      })
      setResidentialAreaStats(
        Object.entries(residentialAreas)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 10),
      )

      // Calculate traditional institution stats
      const traditionalInstitutions: Record<string, number> = {
        "لا يوجد": 0,
      }
      filteredData.forEach((person: PersonData) => {
        if (!person.traditionalInstitution) {
          traditionalInstitutions["لا يوجد"]++
        } else {
          traditionalInstitutions[person.traditionalInstitution] =
            (traditionalInstitutions[person.traditionalInstitution] || 0) + 1
        }
      })
      setTraditionalInstitutionStats(Object.entries(traditionalInstitutions).map(([name, value]) => ({ name, value })))
    }
  }, [user])

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-md rounded-md">
          <p className="font-bold">{label || payload[0].name}</p>
          <p className="text-teal-600">{`العدد: ${payload[0].value}`}</p>
          {payload[0].payload && payload[0].payload.percentage && (
            <p className="text-teal-600">{`النسبة: ${payload[0].payload.percentage.toFixed(1)}%`}</p>
          )}
        </div>
      )
    }
    return null
  }

  // Calculate percentages for pie charts
  const calculatePercentages = (data: any[]) => {
    const total = data.reduce((sum, item) => sum + item.value, 0)
    return data.map((item) => ({
      ...item,
      percentage: (item.value / total) * 100,
    }))
  }

  const ageDistributionWithPercentage = calculatePercentages(ageDistribution)
  const employmentStatsWithPercentage = calculatePercentages(employmentStats)
  const tribeDistributionWithPercentage = calculatePercentages(tribeDistribution)
  const traditionalInstitutionStatsWithPercentage = calculatePercentages(traditionalInstitutionStats)

  return (
    <div className="space-y-6 rtl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-teal-200 shadow-md">
          <CardHeader className="pb-2 bg-teal-50 border-b border-teal-100">
            <CardTitle className="text-teal-800">إجمالي السجلات</CardTitle>
            <CardDescription>عدد الأفراد المسجلين</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold text-teal-600">{data.length}</div>
          </CardContent>
        </Card>

        <Card className="border-teal-200 shadow-md">
          <CardHeader className="pb-2 bg-teal-50 border-b border-teal-100">
            <CardTitle className="text-teal-800">
              {user.role === "admin" ? "إجمالي العشائر" : "أفراد العائلة"}
            </CardTitle>
            <CardDescription>
              {user.role === "admin" ? "عدد العشائر التي لديها بيانات" : `الأعضاء في عائلة ${user.familyName}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold text-teal-600">
              {user.role === "admin" ? new Set(data.map((person) => person.tribeName)).size : data.length}
            </div>
          </CardContent>
        </Card>

        <Card className="border-teal-200 shadow-md">
          <CardHeader className="pb-2 bg-teal-50 border-b border-teal-100">
            <CardTitle className="text-teal-800">{user.role === "admin" ? "إجمالي العائلات" : "متوسط العمر"}</CardTitle>
            <CardDescription>
              {user.role === "admin" ? "عدد العائلات التي لديها بيانات" : "متوسط عمر أفراد العائلة"}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold text-teal-600">
              {user.role === "admin"
                ? new Set(data.map((person) => person.familyName)).size
                : data.length > 0
                  ? Math.round(data.reduce((sum, person) => sum + Number.parseInt(person.age), 0) / data.length)
                  : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-teal-200 shadow-md">
          <CardHeader className="bg-teal-50 border-b border-teal-100">
            <CardTitle className="text-teal-800">توزيع الأعمار</CardTitle>
            <CardDescription>تقسيم السكان حسب الفئات العمرية</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] pt-4">
            {ageDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageDistributionWithPercentage}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="value" name="العدد">
                    {ageDistributionWithPercentage.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={AGE_COLORS[index % AGE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">لا توجد بيانات متاحة</div>
            )}
          </CardContent>
        </Card>

        <Card className="border-teal-200 shadow-md">
          <CardHeader className="bg-teal-50 border-b border-teal-100">
            <CardTitle className="text-teal-800">
              {user.role === "admin" ? "توزيع العشائر" : "الحالة الوظيفية"}
            </CardTitle>
            <CardDescription>
              {user.role === "admin" ? "نسبة كل عشيرة من إجمالي السكان" : "الحالة الوظيفية لأفراد العائلة"}
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] pt-4">
            {(user.role === "admin" ? tribeDistribution : employmentStats).length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={user.role === "admin" ? tribeDistributionWithPercentage : employmentStatsWithPercentage}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {(user.role === "admin" ? tribeDistributionWithPercentage : employmentStatsWithPercentage).map(
                      (entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            user.role === "admin"
                              ? TRIBE_COLORS[index % TRIBE_COLORS.length]
                              : EMPLOYMENT_COLORS[index % EMPLOYMENT_COLORS.length]
                          }
                        />
                      ),
                    )}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">لا توجد بيانات متاحة</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-teal-200 shadow-md">
          <CardHeader className="bg-teal-50 border-b border-teal-100">
            <CardTitle className="text-teal-800">توزيع الأحياء السكنية</CardTitle>
            <CardDescription>توزيع السكان حسب أحياء السكن</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] pt-4">
            {residentialAreaStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={residentialAreaStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="value"
                    name="العدد"
                    stroke="#0d9488"
                    fill="#0d9488"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">لا توجد بيانات متاحة</div>
            )}
          </CardContent>
        </Card>

        <Card className="border-teal-200 shadow-md">
          <CardHeader className="bg-teal-50 border-b border-teal-100">
            <CardTitle className="text-teal-800">المؤسسات التقليدية</CardTitle>
            <CardDescription>توزيع الأفراد على المؤسسات</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] pt-4">
            {traditionalInstitutionStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={traditionalInstitutionStatsWithPercentage}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {traditionalInstitutionStatsWithPercentage.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={INSTITUTION_COLORS[index % INSTITUTION_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">لا توجد بيانات متاحة</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

