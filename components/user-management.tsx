"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Edit, Trash2, UserPlus } from "lucide-react"
import type { UserType, FamilyRepresentative } from "@/lib/types"
import { tribes, familyNames } from "@/lib/data"

interface UserManagementProps {
  user: UserType
}

export function UserManagement({ user }: UserManagementProps) {
  const { toast } = useToast()
  const [representatives, setRepresentatives] = useState<FamilyRepresentative[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentRepresentative, setCurrentRepresentative] = useState<FamilyRepresentative | null>(null)
  const [newRepresentative, setNewRepresentative] = useState({
    email: "",
    password: "",
    name: "",
    familyName: "",
    tribeName: "",
    contact: "",
  })
  const [selectedTribe, setSelectedTribe] = useState("")
  const [availableFamilies, setAvailableFamilies] = useState<string[]>([])

  // Load representatives data
  useEffect(() => {
    const storedRepresentatives = localStorage.getItem("representatives")
    if (storedRepresentatives) {
      setRepresentatives(JSON.parse(storedRepresentatives))
    } else {
      // Initialize with default representatives if none exist
      const defaultRepresentatives: FamilyRepresentative[] = [
        {
          id: "rep_1",
          email: "boucerbakarim@gmail.com",
          password: "karim123",
          name: "كريم بوسربة",
          familyName: "بوسربة",
          tribeName: "انشاشبة",
          contact: "+213 555 123 456",
        },
        {
          id: "rep_2",
          email: "abdellahrep@gmail.com",
          password: "family123",
          name: "عبد الله بن عبد الله",
          familyName: "ابن عبد الله",
          tribeName: "انشاشبة",
          contact: "+213 555 789 012",
        },
        {
          id: "rep_3",
          email: "aboubakr@gmail.com",
          password: "family123",
          name: "أبو بكر الصديق",
          familyName: "ابو الصديق",
          tribeName: "انشاشبة",
          contact: "+213 555 345 678",
        },
      ]
      setRepresentatives(defaultRepresentatives)
      localStorage.setItem("representatives", JSON.stringify(defaultRepresentatives))
    }
  }, [])

  // Update available families when tribe changes
  useEffect(() => {
    if (selectedTribe === "انشاشبة") {
      setAvailableFamilies(familyNames)
    } else {
      setAvailableFamilies([])
    }
  }, [selectedTribe])

  const handleAddRepresentative = () => {
    // Validate form
    if (
      !newRepresentative.email ||
      !newRepresentative.password ||
      !newRepresentative.name ||
      !newRepresentative.familyName ||
      !newRepresentative.tribeName
    ) {
      toast({
        title: "معلومات ناقصة",
        description: "يرجى ملء جميع الحقول المطلوبة.",
        variant: "destructive",
      })
      return
    }

    // Check if email already exists
    if (representatives.some((rep) => rep.email === newRepresentative.email)) {
      toast({
        title: "البريد الإلكتروني موجود بالفعل",
        description: "يرجى استخدام بريد إلكتروني آخر.",
        variant: "destructive",
      })
      return
    }

    // Create new representative
    const newRep: FamilyRepresentative = {
      ...newRepresentative,
      id: `rep_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    }

    // Add to list and save
    const updatedRepresentatives = [...representatives, newRep]
    setRepresentatives(updatedRepresentatives)
    localStorage.setItem("representatives", JSON.stringify(updatedRepresentatives))

    // Reset form and close dialog
    setNewRepresentative({
      email: "",
      password: "",
      name: "",
      familyName: "",
      tribeName: "",
      contact: "",
    })
    setIsAddDialogOpen(false)

    toast({
      title: "تمت الإضافة بنجاح",
      description: "تمت إضافة ممثل العائلة الجديد بنجاح.",
    })
  }

  const handleEditRepresentative = () => {
    if (!currentRepresentative) return

    // Validate form
    if (
      !currentRepresentative.email ||
      !currentRepresentative.name ||
      !currentRepresentative.familyName ||
      !currentRepresentative.tribeName
    ) {
      toast({
        title: "معلومات ناقصة",
        description: "يرجى ملء جميع الحقول المطلوبة.",
        variant: "destructive",
      })
      return
    }

    // Check if email already exists (except for the current representative)
    if (
      representatives.some((rep) => rep.email === currentRepresentative.email && rep.id !== currentRepresentative.id)
    ) {
      toast({
        title: "البريد الإلكتروني موجود بالفعل",
        description: "يرجى استخدام بريد إلكتروني آخر.",
        variant: "destructive",
      })
      return
    }

    // Update representative
    const updatedRepresentatives = representatives.map((rep) =>
      rep.id === currentRepresentative.id ? currentRepresentative : rep,
    )
    setRepresentatives(updatedRepresentatives)
    localStorage.setItem("representatives", JSON.stringify(updatedRepresentatives))

    // Close dialog
    setIsEditDialogOpen(false)
    setCurrentRepresentative(null)

    toast({
      title: "تم التحديث بنجاح",
      description: "تم تحديث بيانات ممثل العائلة بنجاح.",
    })
  }

  const handleDeleteRepresentative = () => {
    if (!currentRepresentative) return

    // Remove representative
    const updatedRepresentatives = representatives.filter((rep) => rep.id !== currentRepresentative.id)
    setRepresentatives(updatedRepresentatives)
    localStorage.setItem("representatives", JSON.stringify(updatedRepresentatives))

    // Close dialog
    setIsDeleteDialogOpen(false)
    setCurrentRepresentative(null)

    toast({
      title: "تم الحذف بنجاح",
      description: "تم حذف ممثل العائلة بنجاح.",
    })
  }

  return (
    <Card className="border-teal-200 shadow-md">
      <CardHeader className="bg-teal-50 border-b border-teal-100">
        <CardTitle className="text-teal-800 text-xl">إدارة ممثلي العائلات</CardTitle>
        <CardDescription>إضافة وتعديل وحذف ممثلي العائلات المسؤولين عن إدخال البيانات</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4 rtl">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-teal-800">قائمة ممثلي العائلات</h3>
            <Button onClick={() => setIsAddDialogOpen(true)} className="bg-teal-600 hover:bg-teal-700">
              <UserPlus className="h-4 w-4 ml-2" />
              إضافة ممثل جديد
            </Button>
          </div>

          <div className="rounded-md border border-teal-200 overflow-hidden">
            <Table>
              <TableHeader className="bg-teal-50">
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>البريد الإلكتروني</TableHead>
                  <TableHead>العشيرة</TableHead>
                  <TableHead>العائلة</TableHead>
                  <TableHead>معلومات الاتصال</TableHead>
                  <TableHead className="text-left">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {representatives.length > 0 ? (
                  representatives.map((rep) => (
                    <TableRow key={rep.id} className={rep.email === "boucerbakarim@gmail.com" ? "bg-teal-50/50" : ""}>
                      <TableCell className="font-medium">{rep.name}</TableCell>
                      <TableCell>{rep.email}</TableCell>
                      <TableCell>{rep.tribeName}</TableCell>
                      <TableCell>{rep.familyName}</TableCell>
                      <TableCell>{rep.contact || "غير متوفر"}</TableCell>
                      <TableCell className="text-left">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setCurrentRepresentative(rep)
                              setIsEditDialogOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setCurrentRepresentative(rep)
                              setIsDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      لا يوجد ممثلين للعائلات
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>

      {/* Add Representative Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>إضافة ممثل عائلة جديد</DialogTitle>
            <DialogDescription>أدخل معلومات ممثل العائلة الجديد. انقر على إضافة عند الانتهاء.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 rtl">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                الاسم الكامل <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={newRepresentative.name}
                onChange={(e) => setNewRepresentative({ ...newRepresentative, name: e.target.value })}
                className="col-span-3"
                placeholder="أدخل الاسم الكامل"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                البريد الإلكتروني <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={newRepresentative.email}
                onChange={(e) => setNewRepresentative({ ...newRepresentative, email: e.target.value })}
                className="col-span-3"
                placeholder="example@email.com"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                كلمة المرور <span className="text-red-500">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                value={newRepresentative.password}
                onChange={(e) => setNewRepresentative({ ...newRepresentative, password: e.target.value })}
                className="col-span-3"
                placeholder="أدخل كلمة المرور"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tribeName" className="text-right">
                العشيرة <span className="text-red-500">*</span>
              </Label>
              <Select
                value={newRepresentative.tribeName}
                onValueChange={(value) => {
                  setSelectedTribe(value)
                  setNewRepresentative({ ...newRepresentative, tribeName: value, familyName: "" })
                }}
              >
                <SelectTrigger id="tribeName" className="col-span-3">
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="familyName" className="text-right">
                العائلة <span className="text-red-500">*</span>
              </Label>
              {newRepresentative.tribeName === "انشاشبة" ? (
                <Select
                  value={newRepresentative.familyName}
                  onValueChange={(value) => setNewRepresentative({ ...newRepresentative, familyName: value })}
                  disabled={!newRepresentative.tribeName}
                >
                  <SelectTrigger id="familyName" className="col-span-3">
                    <SelectValue placeholder="اختر العائلة" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableFamilies.map((family) => (
                      <SelectItem key={family} value={family}>
                        {family}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="familyName"
                  value={newRepresentative.familyName}
                  onChange={(e) => setNewRepresentative({ ...newRepresentative, familyName: e.target.value })}
                  className="col-span-3"
                  placeholder="أدخل اسم العائلة"
                  disabled={!newRepresentative.tribeName}
                />
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contact" className="text-right">
                معلومات الاتصال
              </Label>
              <Input
                id="contact"
                value={newRepresentative.contact}
                onChange={(e) => setNewRepresentative({ ...newRepresentative, contact: e.target.value })}
                className="col-span-3"
                placeholder="رقم الهاتف أو معلومات الاتصال الأخرى"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              إلغاء
            </Button>
            <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleAddRepresentative}>
              إضافة ممثل
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Representative Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>تعديل بيانات ممثل العائلة</DialogTitle>
            <DialogDescription>قم بتحديث معلومات ممثل العائلة. انقر على حفظ عند الانتهاء.</DialogDescription>
          </DialogHeader>
          {currentRepresentative && (
            <div className="grid gap-4 py-4 rtl">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  الاسم الكامل
                </Label>
                <Input
                  id="edit-name"
                  value={currentRepresentative.name}
                  onChange={(e) => setCurrentRepresentative({ ...currentRepresentative, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-email" className="text-right">
                  البريد الإلكتروني
                </Label>
                <Input
                  id="edit-email"
                  value={currentRepresentative.email}
                  onChange={(e) => setCurrentRepresentative({ ...currentRepresentative, email: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-password" className="text-right">
                  كلمة المرور
                </Label>
                <Input
                  id="edit-password"
                  type="password"
                  value={currentRepresentative.password}
                  onChange={(e) => setCurrentRepresentative({ ...currentRepresentative, password: e.target.value })}
                  className="col-span-3"
                  placeholder="اترك فارغًا للاحتفاظ بكلمة المرور الحالية"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-tribeName" className="text-right">
                  العشيرة
                </Label>
                <Select
                  value={currentRepresentative.tribeName}
                  onValueChange={(value) => {
                    setSelectedTribe(value)
                    setCurrentRepresentative({ ...currentRepresentative, tribeName: value })
                  }}
                >
                  <SelectTrigger id="edit-tribeName" className="col-span-3">
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
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-familyName" className="text-right">
                  العائلة
                </Label>
                {currentRepresentative.tribeName === "انشاشبة" ? (
                  <Select
                    value={currentRepresentative.familyName}
                    onValueChange={(value) => setCurrentRepresentative({ ...currentRepresentative, familyName: value })}
                  >
                    <SelectTrigger id="edit-familyName" className="col-span-3">
                      <SelectValue placeholder="اختر العائلة" />
                    </SelectTrigger>
                    <SelectContent>
                      {familyNames.map((family) => (
                        <SelectItem key={family} value={family}>
                          {family}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="edit-familyName"
                    value={currentRepresentative.familyName}
                    onChange={(e) => setCurrentRepresentative({ ...currentRepresentative, familyName: e.target.value })}
                    className="col-span-3"
                  />
                )}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-contact" className="text-right">
                  معلومات الاتصال
                </Label>
                <Input
                  id="edit-contact"
                  value={currentRepresentative.contact || ""}
                  onChange={(e) => setCurrentRepresentative({ ...currentRepresentative, contact: e.target.value })}
                  className="col-span-3"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              إلغاء
            </Button>
            <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleEditRepresentative}>
              حفظ التغييرات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
            <DialogDescription>
              هل أنت متأكد أنك تريد حذف ممثل العائلة {currentRepresentative?.name}؟ لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              إلغاء
            </Button>
            <Button variant="destructive" onClick={handleDeleteRepresentative}>
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

