"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Edit, Trash2, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Donation, DonationPurpose } from "@/lib/types"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import { cn } from "@/lib/utils"

export function DonationsTable() {
  const { toast } = useToast()
  const [data, setData] = useState<Donation[]>([])
  const [filteredData, setFilteredData] = useState<Donation[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPurpose, setSelectedPurpose] = useState<string>("")
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
  const [editingDonation, setEditingDonation] = useState<Donation | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  // تحميل البيانات من localStorage
  useEffect(() => {
    const storedData = localStorage.getItem("donationsData")
    if (storedData) {
      const parsedData = JSON.parse(storedData)
      setData(parsedData)
      setFilteredData(parsedData)
    }
  }, [])

  // تصفية البيانات بناءً على مصطلح البحث والغرض والتاريخ
  useEffect(() => {
    let filtered = [...data]

    // تطبيق تصفية الغرض
    if (selectedPurpose && selectedPurpose !== "all") {
      filtered = filtered.filter((item) => item.purpose === selectedPurpose)
    }

    // تطبيق تصفية نطاق التاريخ
    if (dateRange.from) {
      const fromDate = new Date(dateRange.from)
      fromDate.setHours(0, 0, 0, 0)
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.date)
        return itemDate >= fromDate
      })
    }

    if (dateRange.to) {
      const toDate = new Date(dateRange.to)
      toDate.setHours(23, 59, 59, 999)
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.date)
        return itemDate <= toDate
      })
    }

    // تطبيق تصفية مصطلح البحث
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          item.donorName.toLowerCase().includes(term) ||
          item.verifiedBy.toLowerCase().includes(term) ||
          (item.donorContact && item.donorContact.toLowerCase().includes(term)),
      )
    }

    setFilteredData(filtered)
  }, [searchTerm, selectedPurpose, dateRange, data])

  const handleEdit = (donation: Donation) => {
    setEditingDonation(donation)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id)
  }

  const confirmDelete = () => {
    if (!deleteConfirmId) return

    try {
      // الحصول على جميع البيانات من localStorage
      const storedData = localStorage.getItem("donationsData")
      if (storedData) {
        const allData = JSON.parse(storedData)
        // تصفية العنصر المراد حذفه
        const updatedData = allData.filter((item: Donation) => item.id !== deleteConfirmId)
        // حفظ مرة أخرى في localStorage
        localStorage.setItem("donationsData", JSON.stringify(updatedData))

        // تحديث الحالة المحلية
        const newData = data.filter((item) => item.id !== deleteConfirmId)
        setData(newData)

        toast({
          title: "تم حذف التبرع",
          description: "تم حذف التبرع بنجاح.",
        })
      }
    } catch (error) {
      console.error("Delete failed:", error)
      toast({
        title: "فشل الحذف",
        description: "حدث خطأ أثناء حذف التبرع.",
        variant: "destructive",
      })
    } finally {
      setDeleteConfirmId(null)
    }
  }

  const handleSaveEdit = (updatedDonation: Donation) => {
    try {
      // الحصول على جميع البيانات من localStorage
      const storedData = localStorage.getItem("donationsData")
      if (storedData) {
        const allData = JSON.parse(storedData)
        // البحث عن العنصر وتحديثه
        const updatedData = allData.map((item: Donation) => (item.id === updatedDonation.id ? updatedDonation : item))
        // حفظ مرة أخرى في localStorage
        localStorage.setItem("donationsData", JSON.stringify(updatedData))

        // تحديث الحالة المحلية
        const newData = data.map((item) => (item.id === updatedDonation.id ? updatedDonation : item))
        setData(newData)

        toast({
          title: "تم تحديث التبرع",
          description: "تم تحديث التبرع بنجاح.",
        })
      }
    } catch (error) {
      console.error("Update failed:", error)
      toast({
        title: "فشل التحديث",
        description: "حدث خطأ أثناء تحديث التبرع.",
        variant: "destructive",
      })
    } finally {
      setEditingDonation(null)
      setIsDialogOpen(false)
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

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedPurpose("")
    setDateRange({ from: undefined, to: undefined })
  }

  return (
    <Card className="border-amber-200 shadow-md">
      <CardHeader className="bg-amber-50 border-b border-amber-100">
        <CardTitle className="text-amber-800 text-xl">إدارة التبرعات</CardTitle>
        <CardDescription>عرض وبحث وإدارة جميع سجلات التبرعات</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4 rtl">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="بحث باسم المتبرع أو معلومات الاتصال..."
                className="pr-8 border-amber-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={selectedPurpose} onValueChange={setSelectedPurpose}>
              <SelectTrigger className="w-full md:w-[180px] border-amber-200">
                <SelectValue placeholder="جميع الأغراض" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأغراض</SelectItem>
                <SelectItem value="mosque_renovation">ترميم المسجد</SelectItem>
                <SelectItem value="cemetery_maintenance">صيانة المقبرة</SelectItem>
                <SelectItem value="school_equipment">تجهيزات المدرسة</SelectItem>
                <SelectItem value="helping_families">مساعدة العائلات</SelectItem>
                <SelectItem value="other">أخرى</SelectItem>
              </SelectContent>
            </Select>

            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full md:w-[240px] justify-start text-right font-normal border-amber-200",
                    !dateRange.from && !dateRange.to && "text-muted-foreground",
                  )}
                >
                  <Calendar className="ml-2 h-4 w-4" />
                  {dateRange.from || dateRange.to ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from as Date, "PPP", { locale: ar })} -{" "}
                        {format(dateRange.to as Date, "PPP", { locale: ar })}
                      </>
                    ) : (
                      format(dateRange.from as Date, "PPP", { locale: ar })
                    )
                  ) : (
                    "اختر نطاق تاريخ"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
                <div className="flex justify-end gap-2 p-3 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDateRange({ from: undefined, to: undefined })
                      setIsCalendarOpen(false)
                    }}
                  >
                    إلغاء
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setIsCalendarOpen(false)}
                    className="bg-[#e7a854] hover:bg-amber-600"
                  >
                    تطبيق
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            <Button variant="outline" className="border-amber-200 hover:bg-amber-50" onClick={clearFilters}>
              مسح التصفية
            </Button>
          </div>

          <div className="rounded-md border border-amber-200 overflow-hidden">
            <Table>
              <TableHeader className="bg-amber-50">
                <TableRow>
                  <TableHead>اسم المتبرع</TableHead>
                  <TableHead>المبلغ</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>الغرض</TableHead>
                  <TableHead>حالة الاستخدام</TableHead>
                  <TableHead>تم التحقق بواسطة</TableHead>
                  <TableHead className="text-left">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length > 0 ? (
                  filteredData.map((donation) => (
                    <TableRow key={donation.id}>
                      <TableCell className="font-medium">{donation.donorName}</TableCell>
                      <TableCell className="font-mono">{formatAmount(donation.amount)}</TableCell>
                      <TableCell>{formatDate(donation.date)}</TableCell>
                      <TableCell>{getPurposeBadge(donation.purpose)}</TableCell>
                      <TableCell>
                        <div className="max-w-[200px] truncate" title={donation.usageStatus}>
                          {donation.usageStatus}
                        </div>
                      </TableCell>
                      <TableCell>{donation.verifiedBy}</TableCell>
                      <TableCell className="text-left">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(donation)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(donation.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      لا توجد تبرعات مطابقة للبحث
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>

      {/* مربع حوار تعديل التبرع */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>تعديل بيانات التبرع</DialogTitle>
            <DialogDescription>قم بتحديث معلومات هذا التبرع. انقر على حفظ عند الانتهاء.</DialogDescription>
          </DialogHeader>
          {editingDonation && (
            <div className="grid gap-4 py-4 rtl">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="donorName" className="text-right">
                  اسم المتبرع
                </Label>
                <Input
                  id="donorName"
                  value={editingDonation.donorName}
                  onChange={(e) => setEditingDonation({ ...editingDonation, donorName: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  المبلغ (دج)
                </Label>
                <Input
                  id="amount"
                  type="number"
                  value={editingDonation.amount}
                  onChange={(e) =>
                    setEditingDonation({
                      ...editingDonation,
                      amount: Number.parseFloat(e.target.value),
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                  التاريخ
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={editingDonation.date}
                  onChange={(e) => setEditingDonation({ ...editingDonation, date: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="purpose" className="text-right">
                  الغرض
                </Label>
                <Select
                  value={editingDonation.purpose}
                  onValueChange={(value) =>
                    setEditingDonation({ ...editingDonation, purpose: value as DonationPurpose })
                  }
                >
                  <SelectTrigger id="edit-purpose" className="col-span-3">
                    <SelectValue placeholder="اختر الغرض من التبرع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mosque_renovation">ترميم المسجد</SelectItem>
                    <SelectItem value="cemetery_maintenance">صيانة المقبرة</SelectItem>
                    <SelectItem value="school_equipment">تجهيزات المدرسة</SelectItem>
                    <SelectItem value="helping_families">مساعدة العائلات</SelectItem>
                    <SelectItem value="other">أخرى</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="donorContact" className="text-right">
                  معلومات الاتصال
                </Label>
                <Input
                  id="donorContact"
                  value={editingDonation.donorContact || ""}
                  onChange={(e) => setEditingDonation({ ...editingDonation, donorContact: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="verifiedBy" className="text-right">
                  تم التحقق بواسطة
                </Label>
                <Input
                  id="verifiedBy"
                  value={editingDonation.verifiedBy}
                  onChange={(e) => setEditingDonation({ ...editingDonation, verifiedBy: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="usageStatus" className="text-right pt-2">
                  حالة الاستخدام
                </Label>
                <Textarea
                  id="usageStatus"
                  value={editingDonation.usageStatus}
                  onChange={(e) => setEditingDonation({ ...editingDonation, usageStatus: e.target.value })}
                  className="col-span-3 min-h-[100px]"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              إلغاء
            </Button>
            <Button
              className="bg-[#e7a854] hover:bg-amber-600"
              onClick={() => editingDonation && handleSaveEdit(editingDonation)}
            >
              حفظ التغييرات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* مربع حوار تأكيد الحذف */}
      <Dialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
            <DialogDescription>هل أنت متأكد أنك تريد حذف هذا التبرع؟ لا يمكن التراجع عن هذا الإجراء.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              إلغاء
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

