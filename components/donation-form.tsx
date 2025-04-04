"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import type { Donation, DonationPurpose } from "@/lib/types"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export function DonationForm() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [formData, setFormData] = useState({
    donorName: "",
    amount: "",
    purpose: "" as DonationPurpose,
    usageStatus: "",
    verifiedBy: "",
    donorContact: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // التحقق من صحة النموذج
      if (!formData.donorName || !formData.amount || !formData.purpose || !date) {
        toast({
          title: "معلومات ناقصة",
          description: "يرجى ملء جميع الحقول المطلوبة.",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // إنشاء كائن تبرع جديد مع معرف
      const newDonation: Donation = {
        ...formData,
        id: `donation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        amount: Number.parseFloat(formData.amount),
        date: date.toISOString().split("T")[0],
      }

      // الحصول على البيانات الموجودة من localStorage
      const existingData = localStorage.getItem("donationsData")
      const allData = existingData ? JSON.parse(existingData) : []

      // إضافة التبرع الجديد إلى البيانات
      allData.push(newDonation)

      // حفظ في localStorage
      localStorage.setItem("donationsData", JSON.stringify(allData))

      // إعادة تعيين النموذج
      setFormData({
        donorName: "",
        amount: "",
        purpose: "" as DonationPurpose,
        usageStatus: "",
        verifiedBy: "",
        donorContact: "",
      })
      setDate(new Date())

      toast({
        title: "تمت الإضافة",
        description: "تمت إضافة التبرع الجديد بنجاح.",
      })
    } catch (error) {
      console.error("Error adding donation:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة التبرع.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="border-amber-200 shadow-md">
      <CardHeader className="bg-amber-50 border-b border-amber-100">
        <CardTitle className="text-amber-800 text-xl">إضافة تبرع جديد</CardTitle>
        <CardDescription>أدخل تفاصيل التبرع الجديد لإضافته إلى قاعدة البيانات</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 rtl">
            <div className="space-y-2">
              <Label htmlFor="donorName">
                اسم المتبرع <span className="text-red-500">*</span>
              </Label>
              <Input
                id="donorName"
                name="donorName"
                placeholder="أدخل اسم المتبرع"
                value={formData.donorName}
                onChange={handleChange}
                required
                className="border-amber-200 focus:border-amber-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">
                مبلغ التبرع (دج) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                placeholder="أدخل مبلغ التبرع"
                value={formData.amount}
                onChange={handleChange}
                required
                min="1"
                className="border-amber-200 focus:border-amber-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">
                تاريخ التبرع <span className="text-red-500">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-right font-normal border-amber-200 hover:bg-amber-50",
                      !date && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="ml-2 h-4 w-4" />
                    {date ? format(date, "PPP", { locale: ar }) : "اختر تاريخًا"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">
                الغرض من التبرع <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.purpose} onValueChange={(value) => handleSelectChange("purpose", value)} required>
                <SelectTrigger id="purpose" className="border-amber-200 focus:border-amber-500">
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

            <div className="space-y-2">
              <Label htmlFor="donorContact">معلومات الاتصال بالمتبرع</Label>
              <Input
                id="donorContact"
                name="donorContact"
                placeholder="رقم الهاتف أو البريد الإلكتروني"
                value={formData.donorContact}
                onChange={handleChange}
                className="border-amber-200 focus:border-amber-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="verifiedBy">
                تم التحقق بواسطة <span className="text-red-500">*</span>
              </Label>
              <Input
                id="verifiedBy"
                name="verifiedBy"
                placeholder="أدخل اسم الشخص الذي تحقق من التبرع"
                value={formData.verifiedBy}
                onChange={handleChange}
                required
                className="border-amber-200 focus:border-amber-500"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="usageStatus">
                حالة الاستخدام <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="usageStatus"
                name="usageStatus"
                placeholder="اشرح كيف تم أو سيتم استخدام المال"
                value={formData.usageStatus}
                onChange={handleChange}
                required
                className="min-h-[100px] border-amber-200 focus:border-amber-500"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 border-t border-amber-100">
          <Button type="submit" className="w-full bg-[#e7a854] hover:bg-amber-600" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 border-2 border-t-white border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin ml-2"></div>
                جاري الإرسال...
              </>
            ) : (
              "إضافة تبرع"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

