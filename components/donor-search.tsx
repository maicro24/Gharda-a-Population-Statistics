"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"
import type { Donation, DonationPurpose } from "@/lib/types"

export function DonorSearch() {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<Donation[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [totalDonated, setTotalDonated] = useState(0)

  const handleSearch = () => {
    if (!searchTerm.trim()) return

    // البحث في localStorage عن التبرعات المطابقة
    const storedData = localStorage.getItem("donationsData")
    if (storedData) {
      const allDonations = JSON.parse(storedData) as Donation[]
      const term = searchTerm.toLowerCase()

      // البحث عن التبرعات التي تطابق اسم المتبرع أو معلومات الاتصال
      const results = allDonations.filter(
        (donation) =>
          donation.donorName.toLowerCase().includes(term) ||
          (donation.donorContact && donation.donorContact.toLowerCase().includes(term)),
      )

      setSearchResults(results)

      // حساب إجمالي المبالغ المتبرع بها
      const total = results.reduce((sum, donation) => sum + donation.amount, 0)
      setTotalDonated(total)

      setHasSearched(true)
    }
  }

  const getPurposeBadge = (purpose: DonationPurpose) => {
    switch (purpose) {
      case "mosque_renovation":
        return <Badge className="bg-green-500 hover:bg-green-600">ترميم المسجد</Badge>
      case "cemetery_maintenance":
        return <Badge className="bg-gray-500 hover:bg-gray-600">صيانة المقبرة</Badge>
      case "school_equipment":
        return <Badge className="bg-blue-500 hover:bg-blue-600">تجهيزات المدرسة</Badge>
      case "helping_families":
        return <Badge className="bg-red-500 hover:bg-red-600">مساعدة العائلات</Badge>
      case "other":
        return <Badge className="bg-purple-500 hover:bg-purple-600">أخرى</Badge>
      default:
        return <Badge className="bg-gray-400">غير محدد</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("ar-DZ")
  }

  const formatAmount = (amount: number) => {
    return amount.toLocaleString("ar-DZ") + " دج"
  }

  return (
    <Card className="border-amber-200 shadow-md">
      <CardHeader className="bg-amber-50 border-b border-amber-100">
        <CardTitle className="text-amber-800 text-xl">البحث عن تبرعات المتبرع</CardTitle>
        <CardDescription>ابحث عن تبرعاتك باستخدام اسمك أو معلومات الاتصال الخاصة بك</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6 rtl">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="أدخل اسمك أو رقم هاتفك أو بريدك الإلكتروني..."
                className="pr-8 border-amber-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={handleSearch} className="bg-[#e7a854] hover:bg-amber-600" disabled={!searchTerm.trim()}>
              بحث
            </Button>
          </div>

          {hasSearched && (
            <>
              {searchResults.length > 0 ? (
                <div className="space-y-4">
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <p className="text-amber-800 font-medium">
                      تم العثور على {searchResults.length} تبرع بإجمالي مبلغ{" "}
                      <span className="font-bold">{formatAmount(totalDonated)}</span>
                    </p>
                  </div>

                  <div className="rounded-md border border-amber-200 overflow-hidden">
                    <Table>
                      <TableHeader className="bg-amber-50">
                        <TableRow>
                          <TableHead>المبلغ</TableHead>
                          <TableHead>التاريخ</TableHead>
                          <TableHead>الغرض</TableHead>
                          <TableHead>حالة الاستخدام</TableHead>
                          <TableHead>تم التحقق بواسطة</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {searchResults.map((donation) => (
                          <TableRow key={donation.id}>
                            <TableCell className="font-mono font-medium">{formatAmount(donation.amount)}</TableCell>
                            <TableCell>{formatDate(donation.date)}</TableCell>
                            <TableCell>{getPurposeBadge(donation.purpose)}</TableCell>
                            <TableCell>
                              <div className="max-w-[200px] truncate" title={donation.usageStatus}>
                                {donation.usageStatus}
                              </div>
                            </TableCell>
                            <TableCell>{donation.verifiedBy}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 text-center">
                  <p className="text-amber-800">لم يتم العثور على أي تبرعات مطابقة للبحث.</p>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

