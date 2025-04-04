"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import type { UserType, PersonData, EmploymentStatus, TraditionalInstitution } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { tribes, familyNames, residentialAreas, traditionalInstitutions } from "@/lib/data"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface DataEntryFormProps {
  user: UserType
}

export function DataEntryForm({ user }: DataEntryFormProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [employmentStatus, setEmploymentStatus] = useState<EmploymentStatus>("unemployed")
  const [traditionalInstitution, setTraditionalInstitution] = useState<TraditionalInstitution>("")
  const [isHafiz, setIsHafiz] = useState(false)
  const [isReciter, setIsReciter] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    familyName: user.role === "representative" ? user.familyName || "" : "",
    tribeName: user.role === "representative" ? user.tribeName || "" : "",
    fatherName: "",
    motherName: "",
    age: "",
    placeDetails: "",
    residentialArea: "",
    hafizDate: "",
    reciterDate: "",
    contact: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      // Validate form
      if (
        !formData.firstName ||
        !formData.familyName ||
        !formData.tribeName ||
        !formData.fatherName ||
        !formData.age ||
        !formData.residentialArea
      ) {
        toast({
          title: "معلومات ناقصة",
          description: "يرجى ملء جميع الحقول المطلوبة.",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // Create new person object with ID
      const newPerson: PersonData = {
        ...formData,
        employmentStatus,
        traditionalInstitution,
        isHafiz,
        isReciter,
        id: `person_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      }

      // Get existing data from localStorage
      const existingData = localStorage.getItem("populationData")
      const allData = existingData ? JSON.parse(existingData) : []

      // Add new person to data
      allData.push(newPerson)

      // Save to localStorage
      localStorage.setItem("populationData", JSON.stringify(allData))

      // Reset form
      setFormData({
        firstName: "",
        familyName: user.role === "representative" ? user.familyName || "" : "",
        tribeName: user.role === "representative" ? user.tribeName || "" : "",
        fatherName: "",
        motherName: "",
        age: "",
        placeDetails: "",
        residentialArea: "",
        hafizDate: "",
        reciterDate: "",
        contact: "",
      })
      setEmploymentStatus("unemployed")
      setTraditionalInstitution("")
      setIsHafiz(false)
      setIsReciter(false)

      toast({
        title: "تمت الإضافة",
        description: "تمت إضافة السجل الجديد بنجاح.",
      })
    } catch (error) {
      console.error("Error adding record:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة السجل.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="border-teal-200 shadow-md">
      <CardHeader className="bg-teal-50 border-b border-teal-100">
        <CardTitle className="text-teal-800 text-xl">إضافة شخص جديد</CardTitle>
        <CardDescription>
          أدخل تفاصيل الشخص الجديد لإضافته إلى قاعدة البيانات
          {user.role === "representative" && (
            <p className="mt-1 text-teal-700 font-medium">المسؤول عن جمع وإدخال بيانات أفراد العائلة</p>
          )}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 rtl">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                الاسم الأول <span className="text-red-500">*</span>
              </Label>
              <Input
                id="firstName"
                name="firstName"
                placeholder="أدخل الاسم الأول"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="border-teal-200 focus:border-teal-500"
              />
            </div>

            {user.role === "admin" ? (
              <div className="space-y-2">
                <Label htmlFor="tribeName">
                  اسم العشيرة <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.tribeName}
                  onValueChange={(value) => handleSelectChange("tribeName", value)}
                  required
                >
                  <SelectTrigger id="tribeName" className="border-teal-200 focus:border-teal-500">
                    <SelectValue placeholder="اختر العشيرة" />
                  </SelectTrigger>
                  <SelectContent>
                    {tribes.map((tribe) => (
                      <SelectItem key={tribe} value={tribe}>
                        {tribe}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="tribeName">اسم العشيرة</Label>
                <Input id="tribeName" value={formData.tribeName} disabled className="bg-gray-50" />
              </div>
            )}

            {user.role === "admin" && formData.tribeName === "انشاشبة" ? (
              <div className="space-y-2">
                <Label htmlFor="familyName">
                  اسم العائلة <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.familyName}
                  onValueChange={(value) => handleSelectChange("familyName", value)}
                  required
                >
                  <SelectTrigger id="familyName" className="border-teal-200 focus:border-teal-500">
                    <SelectValue placeholder="اختر اسم العائلة" />
                  </SelectTrigger>
                  <SelectContent>
                    {familyNames.map((family) => (
                      <SelectItem key={family} value={family}>
                        {family}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : user.role === "admin" ? (
              <div className="space-y-2">
                <Label htmlFor="familyName">
                  اسم العائلة <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="familyName"
                  name="familyName"
                  placeholder="أدخل اسم العائلة"
                  value={formData.familyName}
                  onChange={handleChange}
                  required
                  className="border-teal-200 focus:border-teal-500"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="familyName">اسم العائلة</Label>
                <Input id="familyName" value={formData.familyName} disabled className="bg-gray-50" />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="fatherName">
                اسم الأب <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fatherName"
                name="fatherName"
                placeholder="أدخل اسم الأب"
                value={formData.fatherName}
                onChange={handleChange}
                required
                className="border-teal-200 focus:border-teal-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="motherName">اسم الأم</Label>
              <Input
                id="motherName"
                name="motherName"
                placeholder="أدخل اسم الأم"
                value={formData.motherName}
                onChange={handleChange}
                className="border-teal-200 focus:border-teal-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">
                العمر <span className="text-red-500">*</span>
              </Label>
              <Input
                id="age"
                name="age"
                type="number"
                placeholder="أدخل العمر"
                value={formData.age}
                onChange={handleChange}
                required
                min="0"
                max="120"
                className="border-teal-200 focus:border-teal-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="residentialArea">
                حي السكن <span className="text-red-500">*</span>
              </Label>
              <Select
                required
                value={formData.residentialArea}
                onValueChange={(value) => handleSelectChange("residentialArea", value)}
              >
                <SelectTrigger id="residentialArea" className="border-teal-200 focus:border-teal-500">
                  <SelectValue placeholder="اختر حي السكن" />
                </SelectTrigger>
                <SelectContent>
                  {residentialAreas.map((area) => (
                    <SelectItem key={area} value={area}>
                      {area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact">معلومات الاتصال</Label>
              <Input
                id="contact"
                name="contact"
                placeholder="رقم الهاتف أو البريد الإلكتروني"
                value={formData.contact}
                onChange={handleChange}
                className="border-teal-200 focus:border-teal-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="traditionalInstitution">المؤسسات التقليدية</Label>
              <Select
                value={traditionalInstitution}
                onValueChange={(value) => setTraditionalInstitution(value as TraditionalInstitution)}
              >
                <SelectTrigger id="traditionalInstitution" className="border-teal-200 focus:border-teal-500">
                  <SelectValue placeholder="اختر المؤسسة التقليدية (إختياري)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no_institution">لا يوجد</SelectItem>
                  {traditionalInstitutions.map((institution) => (
                    <SelectItem key={institution} value={institution}>
                      {institution}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {traditionalInstitution && (
              <>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isHafiz"
                      checked={isHafiz}
                      onCheckedChange={(checked) => setIsHafiz(checked as boolean)}
                    />
                    <Label htmlFor="isHafiz" className="mr-2">
                      هل الشخص خاتم (حافظ للقرآن)؟
                    </Label>
                  </div>

                  {isHafiz && (
                    <div className="space-y-2">
                      <Label htmlFor="hafizDate">تاريخ الختم</Label>
                      <Input
                        id="hafizDate"
                        name="hafizDate"
                        type="date"
                        value={formData.hafizDate}
                        onChange={handleChange}
                        className="border-teal-200 focus:border-teal-500"
                      />
                    </div>
                  )}

                  <div className="flex items-center space-x-2 mt-2">
                    <Checkbox
                      id="isReciter"
                      checked={isReciter}
                      onCheckedChange={(checked) => setIsReciter(checked as boolean)}
                    />
                    <Label htmlFor="isReciter" className="mr-2">
                      هل الشخص مستظهر (حافظ لأجزاء من القرآن)؟
                    </Label>
                  </div>

                  {isReciter && (
                    <div className="space-y-2">
                      <Label htmlFor="reciterDate">تاريخ الاستظهار</Label>
                      <Input
                        id="reciterDate"
                        name="reciterDate"
                        type="date"
                        value={formData.reciterDate}
                        onChange={handleChange}
                        className="border-teal-200 focus:border-teal-500"
                      />
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="space-y-3 md:col-span-2">
              <Label>
                الحالة الوظيفية <span className="text-red-500">*</span>
              </Label>
              <RadioGroup
                value={employmentStatus}
                onValueChange={(value) => setEmploymentStatus(value as EmploymentStatus)}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="student" id="student" />
                  <Label htmlFor="student" className="mr-2">
                    طالب
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="employed" id="employed" />
                  <Label htmlFor="employed" className="mr-2">
                    موظف
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="unemployed" id="unemployed" />
                  <Label htmlFor="unemployed" className="mr-2">
                    غير موظف
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="retired" id="retired" />
                  <Label htmlFor="retired" className="mr-2">
                    متقاعد
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {(employmentStatus === "student" || employmentStatus === "employed") && (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="placeDetails">
                  {employmentStatus === "student" ? "مكان الدراسة / الجامعة" : "مكان العمل / نوع العمل"}
                </Label>
                <Input
                  id="placeDetails"
                  name="placeDetails"
                  placeholder={
                    employmentStatus === "student" ? "أدخل مكان الدراسة أو الجامعة" : "أدخل مكان العمل ونوعه"
                  }
                  value={formData.placeDetails}
                  onChange={handleChange}
                  className="border-teal-200 focus:border-teal-500"
                />
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 border-t border-teal-100">
          <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 border-2 border-t-white border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin ml-2"></div>
                جاري الإرسال...
              </>
            ) : (
              "إضافة شخص"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

