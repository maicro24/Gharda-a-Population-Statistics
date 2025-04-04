"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import type { UserType, PersonData, EmploymentStatus, TraditionalInstitution } from "@/lib/types"
import { Search, Edit, Trash2, Check, X } from "lucide-react"
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { residentialAreas, traditionalInstitutions } from "@/lib/data"

interface DataTableProps {
  user: UserType
}

export function DataTable({ user }: DataTableProps) {
  const { toast } = useToast()
  const [data, setData] = useState<PersonData[]>([])
  const [filteredData, setFilteredData] = useState<PersonData[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTribe, setSelectedTribe] = useState<string>("")
  const [selectedFamily, setSelectedFamily] = useState<string>("")
  const [selectedArea, setSelectedArea] = useState<string>("")
  const [tribes, setTribes] = useState<string[]>([])
  const [families, setFamilies] = useState<string[]>([])
  const [editingPerson, setEditingPerson] = useState<PersonData | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // Load data from localStorage
  useEffect(() => {
    const storedData = localStorage.getItem("populationData")
    if (storedData) {
      const parsedData = JSON.parse(storedData)

      // Filter data if user is a representative
      const filteredData =
        user.role === "admin"
          ? parsedData
          : parsedData.filter((item: PersonData) => item.familyName === user.familyName)

      setData(filteredData)
      setFilteredData(filteredData)

      // Extract unique tribes and families
      if (user.role === "admin") {
        const uniqueTribes = Array.from(new Set(parsedData.map((item: PersonData) => item.tribeName)))
        setTribes(uniqueTribes as string[])
      } else {
        setSelectedTribe(user.tribeName || "")
        setSelectedFamily(user.familyName || "")
      }
    }
  }, [user])

  // Update families when tribe changes
  useEffect(() => {
    if (selectedTribe) {
      const tribeData = data.filter((item) => item.tribeName === selectedTribe)
      const uniqueFamilies = Array.from(new Set(tribeData.map((item) => item.familyName)))
      setFamilies(uniqueFamilies as string[])
    } else {
      setFamilies([])
    }
  }, [selectedTribe, data])

  // Filter data based on search term, tribe, family and area
  useEffect(() => {
    let filtered = [...data]

    // Apply tribe filter
    if (selectedTribe && selectedTribe !== "all") {
      filtered = filtered.filter((item) => item.tribeName === selectedTribe)
    }

    // Apply family filter
    if (selectedFamily && selectedFamily !== "all") {
      filtered = filtered.filter((item) => item.familyName === selectedFamily)
    }

    // Apply residential area filter
    if (selectedArea && selectedArea !== "all") {
      filtered = filtered.filter((item) => item.residentialArea === selectedArea)
    }

    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          item.firstName.toLowerCase().includes(term) ||
          item.familyName.toLowerCase().includes(term) ||
          item.fatherName.toLowerCase().includes(term) ||
          item.motherName.toLowerCase().includes(term),
      )
    }

    setFilteredData(filtered)
  }, [searchTerm, selectedTribe, selectedFamily, selectedArea, data])

  const handleEdit = (person: PersonData) => {
    setEditingPerson(person)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id)
  }

  const confirmDelete = () => {
    if (!deleteConfirmId) return

    try {
      // Get all data from localStorage
      const storedData = localStorage.getItem("populationData")
      if (storedData) {
        const allData = JSON.parse(storedData)
        // Filter out the item to delete
        const updatedData = allData.filter((item: PersonData) => item.id !== deleteConfirmId)
        // Save back to localStorage
        localStorage.setItem("populationData", JSON.stringify(updatedData))

        // Update local state
        const newData = data.filter((item) => item.id !== deleteConfirmId)
        setData(newData)

        toast({
          title: "تم حذف السجل",
          description: "تم حذف السجل بنجاح.",
        })
      }
    } catch (error) {
      console.error("Delete failed:", error)
      toast({
        title: "فشل الحذف",
        description: "حدث خطأ أثناء حذف السجل.",
        variant: "destructive",
      })
    } finally {
      setDeleteConfirmId(null)
    }
  }

  const handleSaveEdit = (updatedPerson: PersonData) => {
    try {
      // Get all data from localStorage
      const storedData = localStorage.getItem("populationData")
      if (storedData) {
        const allData = JSON.parse(storedData)
        // Find and update the item
        const updatedData = allData.map((item: PersonData) => (item.id === updatedPerson.id ? updatedPerson : item))
        // Save back to localStorage
        localStorage.setItem("populationData", JSON.stringify(updatedData))

        // Update local state
        const newData = data.map((item) => (item.id === updatedPerson.id ? updatedPerson : item))
        setData(newData)

        toast({
          title: "تم تحديث السجل",
          description: "تم تحديث السجل بنجاح.",
        })
      }
    } catch (error) {
      console.error("Update failed:", error)
      toast({
        title: "فشل التحديث",
        description: "حدث خطأ أثناء تحديث السجل.",
        variant: "destructive",
      })
    } finally {
      setEditingPerson(null)
      setIsDialogOpen(false)
    }
  }

  const getStatusDisplay = (person: PersonData) => {
    switch (person.employmentStatus) {
      case "student":
        return `طالب في ${person.placeDetails || "غير محدد"}`
      case "employed":
        return `يعمل في ${person.placeDetails || "غير محدد"}`
      case "retired":
        return "متقاعد"
      case "unemployed":
      default:
        return "غير موظف"
    }
  }

  return (
    <Card className="border-teal-200 shadow-md">
      <CardHeader className="bg-teal-50 border-b border-teal-100">
        <CardTitle className="text-teal-800 text-xl">إدارة بيانات السكان</CardTitle>
        <CardDescription>
          {user.role === "admin" ? "عرض وبحث وإدارة جميع سجلات السكان" : `إدارة سجلات عائلة ${user.familyName}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4 rtl">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="بحث بالاسم..."
                className="pr-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {user.role === "admin" && (
              <>
                <Select value={selectedTribe} onValueChange={setSelectedTribe}>
                  <SelectTrigger className="w-full md:w-[180px] border-teal-200">
                    <SelectValue placeholder="جميع العشائر" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع العشائر</SelectItem>
                    {tribes.map((tribe) => (
                      <SelectItem key={tribe} value={tribe}>
                        {tribe}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={selectedFamily}
                  onValueChange={setSelectedFamily}
                  disabled={!selectedTribe || selectedTribe === "all"}
                >
                  <SelectTrigger className="w-full md:w-[180px] border-teal-200">
                    <SelectValue placeholder="جميع العائلات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع العائلات</SelectItem>
                    {families.map((family) => (
                      <SelectItem key={family} value={family}>
                        {family}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}

            <Select value={selectedArea} onValueChange={setSelectedArea}>
              <SelectTrigger className="w-full md:w-[180px] border-teal-200">
                <SelectValue placeholder="جميع الأحياء" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأحياء</SelectItem>
                {residentialAreas.map((area) => (
                  <SelectItem key={area} value={area}>
                    {area}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border border-teal-200 overflow-hidden">
            <Table>
              <TableHeader className="bg-teal-50">
                <TableRow>
                  <TableHead>الاسم الكامل</TableHead>
                  <TableHead>اسم العشيرة</TableHead>
                  <TableHead>اسم الأب</TableHead>
                  <TableHead>العمر</TableHead>
                  <TableHead>حي السكن</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>حافظ القرآن</TableHead>
                  <TableHead className="text-left">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length > 0 ? (
                  filteredData.map((person) => (
                    <TableRow key={person.id}>
                      <TableCell className="font-medium">
                        {person.firstName} {person.familyName}
                      </TableCell>
                      <TableCell>{person.tribeName}</TableCell>
                      <TableCell>{person.fatherName}</TableCell>
                      <TableCell>{person.age}</TableCell>
                      <TableCell>{person.residentialArea}</TableCell>
                      <TableCell>{getStatusDisplay(person)}</TableCell>
                      <TableCell>
                        {person.isHafiz ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                      </TableCell>
                      <TableCell className="text-left">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(person)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(person.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      لا توجد سجلات
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>تعديل بيانات الشخص</DialogTitle>
            <DialogDescription>قم بتحديث معلومات هذا الشخص. انقر على حفظ عند الانتهاء.</DialogDescription>
          </DialogHeader>
          {editingPerson && (
            <div className="grid gap-4 py-4 rtl">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="firstName" className="text-right">
                  الاسم الأول
                </Label>
                <Input
                  id="firstName"
                  value={editingPerson.firstName}
                  onChange={(e) => setEditingPerson({ ...editingPerson, firstName: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="fatherName" className="text-right">
                  اسم الأب
                </Label>
                <Input
                  id="fatherName"
                  value={editingPerson.fatherName}
                  onChange={(e) => setEditingPerson({ ...editingPerson, fatherName: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="motherName" className="text-right">
                  اسم الأم
                </Label>
                <Input
                  id="motherName"
                  value={editingPerson.motherName}
                  onChange={(e) => setEditingPerson({ ...editingPerson, motherName: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="age" className="text-right">
                  العمر
                </Label>
                <Input
                  id="age"
                  type="number"
                  value={editingPerson.age}
                  onChange={(e) => setEditingPerson({ ...editingPerson, age: e.target.value })}
                  className="col-span-3"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="residentialArea" className="text-right">
                  حي السكن
                </Label>
                <Select
                  value={editingPerson.residentialArea}
                  onValueChange={(value) => setEditingPerson({ ...editingPerson, residentialArea: value })}
                >
                  <SelectTrigger id="edit-residentialArea" className="col-span-3">
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

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="traditionalInstitution" className="text-right">
                  المؤسسة التقليدية
                </Label>
                <Select
                  value={editingPerson.traditionalInstitution}
                  onValueChange={(value) =>
                    setEditingPerson({ ...editingPerson, traditionalInstitution: value as TraditionalInstitution })
                  }
                >
                  <SelectTrigger id="edit-traditionalInstitution" className="col-span-3">
                    <SelectValue placeholder="اختر المؤسسة التقليدية" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">لا يوجد</SelectItem>
                    {traditionalInstitutions.map((institution) => (
                      <SelectItem key={institution} value={institution}>
                        {institution}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {editingPerson.traditionalInstitution && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="isHafiz" className="text-right">
                      حافظ للقرآن
                    </Label>
                    <div className="col-span-3">
                      <Checkbox
                        id="edit-isHafiz"
                        checked={editingPerson.isHafiz}
                        onCheckedChange={(checked) =>
                          setEditingPerson({ ...editingPerson, isHafiz: checked as boolean })
                        }
                      />
                      <Label htmlFor="edit-isHafiz" className="mr-2">
                        خاتم (حافظ للقرآن الكريم)
                      </Label>
                    </div>
                  </div>

                  {editingPerson.isHafiz && (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="hafizDate" className="text-right">
                        تاريخ الختم
                      </Label>
                      <Input
                        id="edit-hafizDate"
                        type="date"
                        value={editingPerson.hafizDate || ""}
                        onChange={(e) => setEditingPerson({ ...editingPerson, hafizDate: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="isReciter" className="text-right">
                      مستظهر للقرآن
                    </Label>
                    <div className="col-span-3">
                      <Checkbox
                        id="edit-isReciter"
                        checked={editingPerson.isReciter || false}
                        onCheckedChange={(checked) =>
                          setEditingPerson({ ...editingPerson, isReciter: checked as boolean })
                        }
                      />
                      <Label htmlFor="edit-isReciter" className="mr-2">
                        مستظهر (حافظ لأجزاء من القرآن)
                      </Label>
                    </div>
                  </div>

                  {editingPerson.isReciter && (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="reciterDate" className="text-right">
                        تاريخ الاستظهار
                      </Label>
                      <Input
                        id="edit-reciterDate"
                        type="date"
                        value={editingPerson.reciterDate || ""}
                        onChange={(e) => setEditingPerson({ ...editingPerson, reciterDate: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                  )}
                </>
              )}

              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-2">الحالة الوظيفية</Label>
                <div className="col-span-3">
                  <RadioGroup
                    value={editingPerson.employmentStatus}
                    onValueChange={(value) =>
                      setEditingPerson({ ...editingPerson, employmentStatus: value as EmploymentStatus })
                    }
                    className="flex flex-col space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="student" id="edit-student" />
                      <Label htmlFor="edit-student" className="mr-2">
                        طالب
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="employed" id="edit-employed" />
                      <Label htmlFor="edit-employed" className="mr-2">
                        موظف
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="unemployed" id="edit-unemployed" />
                      <Label htmlFor="edit-unemployed" className="mr-2">
                        غير موظف
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="retired" id="edit-retired" />
                      <Label htmlFor="edit-retired" className="mr-2">
                        متقاعد
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              {(editingPerson.employmentStatus === "student" || editingPerson.employmentStatus === "employed") && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="placeDetails" className="text-right">
                    {editingPerson.employmentStatus === "student" ? "مكان الدراسة" : "مكان العمل"}
                  </Label>
                  <Input
                    id="placeDetails"
                    value={editingPerson.placeDetails}
                    onChange={(e) => setEditingPerson({ ...editingPerson, placeDetails: e.target.value })}
                    className="col-span-3"
                    placeholder={
                      editingPerson.employmentStatus === "student"
                        ? "أدخل مكان الدراسة أو الجامعة"
                        : "أدخل مكان العمل ونوعه"
                    }
                  />
                </div>
              )}

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="contact" className="text-right">
                  الاتصال
                </Label>
                <Input
                  id="contact"
                  value={editingPerson.contact}
                  onChange={(e) => setEditingPerson({ ...editingPerson, contact: e.target.value })}
                  className="col-span-3"
                  placeholder="رقم الهاتف أو البريد الإلكتروني"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              إلغاء
            </Button>
            <Button
              className="bg-teal-600 hover:bg-teal-700"
              onClick={() => editingPerson && handleSaveEdit(editingPerson)}
            >
              حفظ التغييرات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
            <DialogDescription>هل أنت متأكد أنك تريد حذف هذا السجل؟ لا يمكن التراجع عن هذا الإجراء.</DialogDescription>
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

