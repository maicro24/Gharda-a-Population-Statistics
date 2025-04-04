"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Search, Edit, Trash2, Plus, Calendar, BookOpen } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { UserType, PersonData, Project, ProjectMember, ProjectStatus, Workshop } from "@/lib/types"
import { tribes } from "@/lib/data"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface ProjectsManagementProps {
  user: UserType
}

export function ProjectsManagement({ user }: ProjectsManagementProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("projects-list")
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTribe, setSelectedTribe] = useState<string>("")
  const [selectedStatus, setSelectedStatus] = useState<string>("")
  const [isAddProjectDialogOpen, setIsAddProjectDialogOpen] = useState(false)
  const [isEditProjectDialogOpen, setIsEditProjectDialogOpen] = useState(false)
  const [isDeleteProjectDialogOpen, setIsDeleteProjectDialogOpen] = useState(false)
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null)
  const [availableMembers, setAvailableMembers] = useState<PersonData[]>([])
  const [selectedMembers, setSelectedMembers] = useState<ProjectMember[]>([])
  const [startDate, setStartDate] = useState<Date | undefined>(new Date())
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [isAddWorkshopDialogOpen, setIsAddWorkshopDialogOpen] = useState(false)
  const [currentWorkshop, setCurrentWorkshop] = useState<Workshop | null>(null)
  const [workshopDate, setWorkshopDate] = useState<Date | undefined>(new Date())
  const [selectedProjectForWorkshop, setSelectedProjectForWorkshop] = useState<string | null>(null)
  // إضافة خاصية البحث عن الأعضاء
  // أضف هذا المتغير مع متغيرات الحالة الأخرى في بداية المكون
  const [memberSearchTerm, setMemberSearchTerm] = useState("")
  const [filteredAvailableMembers, setFilteredAvailableMembers] = useState<PersonData[]>([])

  // نموذج إضافة مشروع جديد
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    objective: "",
    status: "planning" as ProjectStatus,
    tribe: user.role === "representative" ? user.tribeName || "" : "",
  })

  // نموذج إضافة ورشة عمل جديدة
  const [newWorkshop, setNewWorkshop] = useState({
    title: "",
    description: "",
    location: "",
    duration: 2,
    notes: "",
    attendees: [] as string[],
  })

  // تحميل البيانات من localStorage
  useEffect(() => {
    // تحميل المشاريع
    const storedProjects = localStorage.getItem("projectsData")
    if (storedProjects) {
      const parsedProjects = JSON.parse(storedProjects)

      // تصفية المشاريع حسب دور المستخدم
      const userProjects =
        user.role === "admin"
          ? parsedProjects
          : parsedProjects.filter((project: Project) => project.tribe === user.tribeName)

      setProjects(userProjects)
      setFilteredProjects(userProjects)
    } else {
      // إنشاء مصفوفة فارغة إذا لم تكن موجودة
      localStorage.setItem("projectsData", JSON.stringify([]))
    }

    // تحميل بيانات الأشخاص للاختيار منهم كأعضاء
    const storedPersons = localStorage.getItem("populationData")
    if (storedPersons) {
      const parsedPersons = JSON.parse(storedPersons)

      // تصفية الأشخاص حسب دور المستخدم
      const availablePersons =
        user.role === "admin"
          ? parsedPersons
          : parsedPersons.filter((person: PersonData) => person.tribeName === user.tribeName)

      // تصفية الطلاب فقط
      const students = availablePersons.filter((person: PersonData) => person.employmentStatus === "student")

      setAvailableMembers(students)
    }
  }, [user])

  // تصفية المشاريع بناءً على مصطلح البحث والعشيرة والحالة
  useEffect(() => {
    let filtered = [...projects]

    // تطبيق تصفية العشيرة
    if (selectedTribe && selectedTribe !== "all") {
      filtered = filtered.filter((project) => project.tribe === selectedTribe)
    }

    // تطبيق تصفية الحالة
    if (selectedStatus && selectedStatus !== "all") {
      filtered = filtered.filter((project) => project.status === selectedStatus)
    }

    // تطبيق تصفية مصطلح البحث
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (project) =>
          project.title.toLowerCase().includes(term) ||
          project.description.toLowerCase().includes(term) ||
          project.objective.toLowerCase().includes(term),
      )
    }

    setFilteredProjects(filtered)
  }, [searchTerm, selectedTribe, selectedStatus, projects])

  // أضف هذا التأثير الجانبي بعد التأثيرات الجانبية الأخرى
  useEffect(() => {
    if (memberSearchTerm.trim() === "") {
      setFilteredAvailableMembers(availableMembers)
    } else {
      const searchTermLower = memberSearchTerm.toLowerCase()
      const filtered = availableMembers.filter(
        (person) =>
          person.firstName.toLowerCase().includes(searchTermLower) ||
          person.familyName.toLowerCase().includes(searchTermLower) ||
          person.tribeName.toLowerCase().includes(searchTermLower),
      )
      setFilteredAvailableMembers(filtered)
    }
  }, [memberSearchTerm, availableMembers])

  // إضافة مشروع جديد
  const handleAddProject = () => {
    if (!newProject.title || !newProject.description || !newProject.objective || !newProject.tribe || !startDate) {
      toast({
        title: "معلومات ناقصة",
        description: "يرجى ملء جميع الحقول المطلوبة.",
        variant: "destructive",
      })
      return
    }

    try {
      // إنشاء كائن مشروع جديد
      const projectId = `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      const newProjectData: Project = {
        id: projectId,
        title: newProject.title,
        description: newProject.description,
        objective: newProject.objective,
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate ? endDate.toISOString().split("T")[0] : undefined,
        status: newProject.status,
        tribe: newProject.tribe,
        members: selectedMembers.map((member) => ({
          ...member,
          id: `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          joinDate: new Date().toISOString().split("T")[0],
        })),
        workshops: [],
        createdBy: user.email,
        createdAt: new Date().toISOString(),
      }

      // الحصول على المشاريع الحالية من localStorage
      const storedProjects = localStorage.getItem("projectsData")
      const allProjects = storedProjects ? JSON.parse(storedProjects) : []

      // إضافة المشروع الجديد
      allProjects.push(newProjectData)

      // حفظ في localStorage
      localStorage.setItem("projectsData", JSON.stringify(allProjects))

      // تحديث حالة المشاريع
      const userProjects =
        user.role === "admin" ? allProjects : allProjects.filter((project: Project) => project.tribe === user.tribeName)

      setProjects(userProjects)

      // إعادة تعيين النموذج
      setNewProject({
        title: "",
        description: "",
        objective: "",
        status: "planning",
        tribe: user.role === "representative" ? user.tribeName || "" : "",
      })
      setStartDate(new Date())
      setEndDate(undefined)
      setSelectedMembers([])

      // إغلاق مربع الحوار
      setIsAddProjectDialogOpen(false)

      toast({
        title: "تمت الإضافة",
        description: "تم إضافة المشروع الجديد بنجاح.",
      })
    } catch (error) {
      console.error("Error adding project:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة المشروع.",
        variant: "destructive",
      })
    }
  }

  // تعديل مشروع
  const handleEditProject = () => {
    if (!currentProject) return

    try {
      // الحصول على المشاريع الحالية من localStorage
      const storedProjects = localStorage.getItem("projectsData")
      if (storedProjects) {
        const allProjects = JSON.parse(storedProjects)

        // تحديث المشروع
        const updatedProjects = allProjects.map((project: Project) =>
          project.id === currentProject.id ? currentProject : project,
        )

        // حفظ في localStorage
        localStorage.setItem("projectsData", JSON.stringify(updatedProjects))

        // تحديث حالة المشاريع
        const userProjects =
          user.role === "admin"
            ? updatedProjects
            : updatedProjects.filter((project: Project) => project.tribe === user.tribeName)

        setProjects(userProjects)

        toast({
          title: "تم التحديث",
          description: "تم تحديث المشروع بنجاح.",
        })
      }
    } catch (error) {
      console.error("Error updating project:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث المشروع.",
        variant: "destructive",
      })
    } finally {
      setCurrentProject(null)
      setIsEditProjectDialogOpen(false)
    }
  }

  // حذف مشروع
  const handleDeleteProject = () => {
    if (!deleteProjectId) return

    try {
      // الحصول على المشاريع الحالية من localStorage
      const storedProjects = localStorage.getItem("projectsData")
      if (storedProjects) {
        const allProjects = JSON.parse(storedProjects)

        // حذف المشروع
        const updatedProjects = allProjects.filter((project: Project) => project.id !== deleteProjectId)

        // حفظ في localStorage
        localStorage.setItem("projectsData", JSON.stringify(updatedProjects))

        // تحديث حالة المشاريع
        const userProjects =
          user.role === "admin"
            ? updatedProjects
            : updatedProjects.filter((project: Project) => project.tribe === user.tribeName)

        setProjects(userProjects)

        toast({
          title: "تم الحذف",
          description: "تم حذف المشروع بنجاح.",
        })
      }
    } catch (error) {
      console.error("Error deleting project:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف المشروع.",
        variant: "destructive",
      })
    } finally {
      setDeleteProjectId(null)
      setIsDeleteProjectDialogOpen(false)
    }
  }

  // إضافة ورشة عمل جديدة
  const handleAddWorkshop = () => {
    if (!selectedProjectForWorkshop || !newWorkshop.title || !newWorkshop.location || !workshopDate) {
      toast({
        title: "معلومات ناقصة",
        description: "يرجى ملء جميع الحقول المطلوبة.",
        variant: "destructive",
      })
      return
    }

    try {
      // إنشاء كائن ورشة عمل جديدة
      const workshopId = `workshop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      const newWorkshopData: Workshop = {
        id: workshopId,
        projectId: selectedProjectForWorkshop,
        title: newWorkshop.title,
        description: newWorkshop.description,
        date: workshopDate.toISOString().split("T")[0],
        location: newWorkshop.location,
        duration: newWorkshop.duration,
        attendees: newWorkshop.attendees,
        notes: newWorkshop.notes,
      }

      // الحصول على المشاريع الحالية من localStorage
      const storedProjects = localStorage.getItem("projectsData")
      if (storedProjects) {
        const allProjects = JSON.parse(storedProjects)

        // إضافة ورشة العمل إلى المشروع المحدد
        const updatedProjects = allProjects.map((project: Project) => {
          if (project.id === selectedProjectForWorkshop) {
            return {
              ...project,
              workshops: [...project.workshops, newWorkshopData],
            }
          }
          return project
        })

        // حفظ في localStorage
        localStorage.setItem("projectsData", JSON.stringify(updatedProjects))

        // تحديث حالة المشاريع
        const userProjects =
          user.role === "admin"
            ? updatedProjects
            : updatedProjects.filter((project: Project) => project.tribe === user.tribeName)

        setProjects(userProjects)

        // إعادة تعيين النموذج
        setNewWorkshop({
          title: "",
          description: "",
          location: "",
          duration: 2,
          notes: "",
          attendees: [],
        })
        setWorkshopDate(new Date())

        // إغلاق مربع الحوار
        setIsAddWorkshopDialogOpen(false)

        toast({
          title: "تمت الإضافة",
          description: "تم إضافة ورشة العمل الجديدة بنجاح.",
        })
      }
    } catch (error) {
      console.error("Error adding workshop:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة ورشة العمل.",
        variant: "destructive",
      })
    }
  }

  // إضافة عضو إلى المشروع
  const handleAddMember = (person: PersonData, role: "leader" | "member" = "member") => {
    // التحقق مما إذا كان العضو موجودًا بالفعل
    const isMemberExists = selectedMembers.some((member) => member.personId === person.id)

    if (isMemberExists) {
      toast({
        title: "العضو موجود بالفعل",
        description: "هذا الشخص موجود بالفعل في قائمة الأعضاء.",
        variant: "destructive",
      })
      return
    }

    // إنشاء عضو جديد
    const newMember: ProjectMember = {
      id: `temp_member_${Date.now()}`,
      personId: person.id,
      name: person.firstName,
      familyName: person.familyName,
      tribeName: person.tribeName,
      role: role,
      contact: person.contact,
      joinDate: new Date().toISOString().split("T")[0],
    }

    // إضافة العضو إلى القائمة
    setSelectedMembers([...selectedMembers, newMember])
  }

  // إزالة عضو من المشروع
  const handleRemoveMember = (memberId: string) => {
    setSelectedMembers(selectedMembers.filter((member) => member.id !== memberId))
  }

  // الحصول على شارة حالة المشروع
  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case "planning":
        return <Badge className="bg-blue-500 hover:bg-blue-600">قيد التخطيط</Badge>
      case "in_progress":
        return <Badge className="bg-amber-500 hover:bg-amber-600">قيد التنفيذ</Badge>
      case "completed":
        return <Badge className="bg-green-500 hover:bg-green-600">مكتمل</Badge>
      case "cancelled":
        return <Badge className="bg-red-500 hover:bg-red-600">ملغي</Badge>
      default:
        return <Badge className="bg-gray-400">غير محدد</Badge>
    }
  }

  // تنسيق التاريخ
  const formatDate = (dateString?: string) => {
    if (!dateString) return "غير محدد"
    const date = new Date(dateString)
    return date.toLocaleDateString("ar-DZ")
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white border border-amber-200 p-1">
          <TabsTrigger
            value="projects-list"
            className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900"
          >
            قائمة المشاريع
          </TabsTrigger>
          <TabsTrigger
            value="workshops"
            className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900"
          >
            ورش العمل
          </TabsTrigger>
        </TabsList>

        <TabsContent value="projects-list">
          <Card className="border-amber-200 shadow-md">
            <CardHeader className="bg-amber-50 border-b border-amber-100">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-amber-800 text-xl">إدارة مشاريع الطلاب</CardTitle>
                  <CardDescription>
                    إنشاء وإدارة مشاريع ومجموعات الطلاب للعمل على حل المشكلات وتطوير النماذج
                  </CardDescription>
                </div>
                <Button onClick={() => setIsAddProjectDialogOpen(true)} className="bg-[#e7a854] hover:bg-amber-600">
                  <Plus className="h-4 w-4 ml-2" />
                  إنشاء مشروع جديد
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4 rtl">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="بحث في المشاريع..."
                      className="pr-8 border-amber-200"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  {user.role === "admin" && (
                    <Select value={selectedTribe} onValueChange={setSelectedTribe}>
                      <SelectTrigger className="w-full md:w-[180px] border-amber-200">
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
                  )}

                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-full md:w-[180px] border-amber-200">
                      <SelectValue placeholder="جميع الحالات" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الحالات</SelectItem>
                      <SelectItem value="planning">قيد التخطيط</SelectItem>
                      <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                      <SelectItem value="completed">مكتمل</SelectItem>
                      <SelectItem value="cancelled">ملغي</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    className="border-amber-200 hover:bg-amber-50"
                    onClick={() => {
                      setSearchTerm("")
                      setSelectedTribe("")
                      setSelectedStatus("")
                    }}
                  >
                    مسح التصفية
                  </Button>
                </div>

                <div className="rounded-md border border-amber-200 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-amber-50">
                      <TableRow>
                        <TableHead>عنوان المشروع</TableHead>
                        <TableHead>الهدف</TableHead>
                        <TableHead>العشيرة</TableHead>
                        <TableHead>تاريخ البدء</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead>عدد الأعضاء</TableHead>
                        <TableHead className="text-left">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProjects.length > 0 ? (
                        filteredProjects.map((project) => (
                          <TableRow key={project.id}>
                            <TableCell className="font-medium">{project.title}</TableCell>
                            <TableCell>
                              <div className="max-w-[200px] truncate" title={project.objective}>
                                {project.objective}
                              </div>
                            </TableCell>
                            <TableCell>{project.tribe}</TableCell>
                            <TableCell>{formatDate(project.startDate)}</TableCell>
                            <TableCell>{getStatusBadge(project.status)}</TableCell>
                            <TableCell>{project.members.length}</TableCell>
                            <TableCell className="text-left">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setSelectedProjectForWorkshop(project.id)
                                    setIsAddWorkshopDialogOpen(true)
                                  }}
                                  title="إضافة ورشة عمل"
                                >
                                  <Calendar className="h-4 w-4 text-amber-600" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setCurrentProject(project)
                                    setIsEditProjectDialogOpen(true)
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setDeleteProjectId(project.id)
                                    setIsDeleteProjectDialogOpen(true)
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
                          <TableCell colSpan={7} className="h-24 text-center">
                            لا توجد مشاريع مطابقة للبحث
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workshops">
          <Card className="border-amber-200 shadow-md">
            <CardHeader className="bg-amber-50 border-b border-amber-100">
              <CardTitle className="text-amber-800 text-xl">ورش العمل والأنشطة</CardTitle>
              <CardDescription>عرض وإدارة ورش العمل والأنشطة المرتبطة بالمشاريع</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6 rtl">
                {projects.length > 0 ? (
                  projects.map((project) => (
                    <div key={project.id} className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium text-amber-800 flex items-center">
                          <BookOpen className="h-5 w-5 ml-2 text-amber-600" />
                          {project.title} - {project.tribe}
                          <span className="mx-2">{getStatusBadge(project.status)}</span>
                        </h3>
                        <Button
                          size="sm"
                          className="bg-[#e7a854] hover:bg-amber-600"
                          onClick={() => {
                            setSelectedProjectForWorkshop(project.id)
                            setIsAddWorkshopDialogOpen(true)
                          }}
                        >
                          <Plus className="h-4 w-4 ml-1" />
                          إضافة ورشة
                        </Button>
                      </div>

                      {project.workshops && project.workshops.length > 0 ? (
                        <div className="rounded-md border border-amber-200 overflow-hidden">
                          <Table>
                            <TableHeader className="bg-amber-50">
                              <TableRow>
                                <TableHead>عنوان الورشة</TableHead>
                                <TableHead>التاريخ</TableHead>
                                <TableHead>المكان</TableHead>
                                <TableHead>المدة (ساعات)</TableHead>
                                <TableHead>عدد الحضور</TableHead>
                                <TableHead>ملاحظات</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {project.workshops.map((workshop) => (
                                <TableRow key={workshop.id}>
                                  <TableCell className="font-medium">{workshop.title}</TableCell>
                                  <TableCell>{formatDate(workshop.date)}</TableCell>
                                  <TableCell>{workshop.location}</TableCell>
                                  <TableCell>{workshop.duration}</TableCell>
                                  <TableCell>{workshop.attendees.length}</TableCell>
                                  <TableCell>
                                    <div className="max-w-[200px] truncate" title={workshop.notes}>
                                      {workshop.notes || "لا توجد ملاحظات"}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <div className="text-center p-4 bg-gray-50 rounded-md border border-gray-200">
                          <p className="text-gray-500">لا توجد ورش عمل لهذا المشروع بعد</p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center p-8 bg-gray-50 rounded-md border border-gray-200">
                    <p className="text-gray-500 mb-2">لا توجد مشاريع بعد</p>
                    <Button onClick={() => setIsAddProjectDialogOpen(true)} className="bg-[#e7a854] hover:bg-amber-600">
                      <Plus className="h-4 w-4 ml-2" />
                      إنشاء مشروع جديد
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* مربع حوار إضافة مشروع جديد */}
      <Dialog open={isAddProjectDialogOpen} onOpenChange={setIsAddProjectDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>إنشاء مشروع جديد</DialogTitle>
            <DialogDescription>أدخل تفاصيل المشروع الجديد وأضف أعضاء الفريق.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 rtl">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                عنوان المشروع <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={newProject.title}
                onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                className="col-span-3"
                placeholder="أدخل عنوان المشروع"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">
                وصف المشروع <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                className="col-span-3 min-h-[80px]"
                placeholder="اشرح تفاصيل المشروع"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="objective" className="text-right pt-2">
                هدف المشروع <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="objective"
                value={newProject.objective}
                onChange={(e) => setNewProject({ ...newProject, objective: e.target.value })}
                className="col-span-3 min-h-[80px]"
                placeholder="ما هو الهدف الرئيسي للمشروع؟"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startDate" className="text-right">
                تاريخ البدء <span className="text-red-500">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-right font-normal col-span-3",
                      !startDate && "text-muted-foreground",
                    )}
                  >
                    <Calendar className="ml-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP", { locale: ar }) : "اختر تاريخًا"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endDate" className="text-right">
                تاريخ الانتهاء المتوقع
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-right font-normal col-span-3",
                      !endDate && "text-muted-foreground",
                    )}
                  >
                    <Calendar className="ml-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP", { locale: ar }) : "اختر تاريخًا (اختياري)"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    disabled={(date) => date < (startDate || new Date())}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                حالة المشروع <span className="text-red-500">*</span>
              </Label>
              <Select
                value={newProject.status}
                onValueChange={(value) => setNewProject({ ...newProject, status: value as ProjectStatus })}
              >
                <SelectTrigger id="status" className="col-span-3">
                  <SelectValue placeholder="اختر حالة المشروع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">قيد التخطيط</SelectItem>
                  <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                  <SelectItem value="completed">مكتمل</SelectItem>
                  <SelectItem value="cancelled">ملغي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {user.role === "admin" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tribe" className="text-right">
                  العشيرة <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={newProject.tribe}
                  onValueChange={(value) => setNewProject({ ...newProject, tribe: value })}
                >
                  <SelectTrigger id="tribe" className="col-span-3">
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
            )}

            <div className="grid grid-cols-4 items-start gap-4 mt-4">
              <Label className="text-right pt-2">أعضاء المشروع</Label>
              <div className="col-span-3 space-y-4">
                {selectedMembers.length > 0 ? (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">الأعضاء المختارون:</h4>
                    <div className="rounded-md border border-amber-200 overflow-hidden">
                      <Table>
                        <TableHeader className="bg-amber-50">
                          <TableRow>
                            <TableHead>الاسم</TableHead>
                            <TableHead>العائلة</TableHead>
                            <TableHead>الدور</TableHead>
                            <TableHead className="text-left">إزالة</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedMembers.map((member) => (
                            <TableRow key={member.id}>
                              <TableCell>{member.name}</TableCell>
                              <TableCell>{member.familyName}</TableCell>
                              <TableCell>
                                <Select
                                  value={member.role}
                                  onValueChange={(value) => {
                                    const updatedMembers = selectedMembers.map((m) =>
                                      m.id === member.id ? { ...m, role: value as "leader" | "member" } : m,
                                    )
                                    setSelectedMembers(updatedMembers)
                                  }}
                                >
                                  <SelectTrigger className="h-8 w-[120px]">
                                    <SelectValue placeholder="اختر الدور" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="leader">قائد</SelectItem>
                                    <SelectItem value="member">عضو</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell className="text-left">
                                <Button variant="ghost" size="icon" onClick={() => handleRemoveMember(member.id)}>
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-4 bg-gray-50 rounded-md border border-gray-200">
                    <p className="text-gray-500">لم يتم إضافة أعضاء بعد</p>
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">إضافة أعضاء من الطلاب:</h4>
                  <div className="relative mb-2">
                    <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="بحث عن طالب..."
                      className="pr-8 border-amber-200"
                      value={memberSearchTerm}
                      onChange={(e) => setMemberSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="max-h-[200px] overflow-y-auto border rounded-md p-2">
                    {filteredAvailableMembers.length > 0 ? (
                      filteredAvailableMembers.map((person) => (
                        <div
                          key={person.id}
                          className="flex justify-between items-center p-2 hover:bg-amber-50 rounded-md"
                        >
                          <div>
                            <span className="font-medium">
                              {person.firstName} {person.familyName}
                            </span>
                            <span className="text-sm text-gray-500 mr-2">({person.tribeName})</span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-amber-200 hover:bg-amber-100"
                            onClick={() => handleAddMember(person)}
                          >
                            <Plus className="h-3 w-3 ml-1" />
                            إضافة
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-500 p-2">
                        {memberSearchTerm ? "لا توجد نتائج مطابقة للبحث" : "لا يوجد طلاب متاحين"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddProjectDialogOpen(false)}>
              إلغاء
            </Button>
            <Button className="bg-[#e7a854] hover:bg-amber-600" onClick={handleAddProject}>
              إنشاء المشروع
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* مربع حوار إضافة ورشة عمل */}
      <Dialog open={isAddWorkshopDialogOpen} onOpenChange={setIsAddWorkshopDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>إضافة ورشة عمل جديدة</DialogTitle>
            <DialogDescription>أدخل تفاصيل ورشة العمل الجديدة.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 rtl">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="workshopTitle" className="text-right">
                عنوان الورشة <span className="text-red-500">*</span>
              </Label>
              <Input
                id="workshopTitle"
                value={newWorkshop.title}
                onChange={(e) => setNewWorkshop({ ...newWorkshop, title: e.target.value })}
                className="col-span-3"
                placeholder="أدخل عنوان ورشة العمل"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="workshopDescription" className="text-right pt-2">
                وصف الورشة
              </Label>
              <Textarea
                id="workshopDescription"
                value={newWorkshop.description}
                onChange={(e) => setNewWorkshop({ ...newWorkshop, description: e.target.value })}
                className="col-span-3 min-h-[80px]"
                placeholder="اشرح تفاصيل ورشة العمل"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="workshopDate" className="text-right">
                تاريخ الورشة <span className="text-red-500">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-right font-normal col-span-3",
                      !workshopDate && "text-muted-foreground",
                    )}
                  >
                    <Calendar className="ml-2 h-4 w-4" />
                    {workshopDate ? format(workshopDate, "PPP", { locale: ar }) : "اختر تاريخًا"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={workshopDate} onSelect={setWorkshopDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="workshopLocation" className="text-right">
                مكان الورشة <span className="text-red-500">*</span>
              </Label>
              <Input
                id="workshopLocation"
                value={newWorkshop.location}
                onChange={(e) => setNewWorkshop({ ...newWorkshop, location: e.target.value })}
                className="col-span-3"
                placeholder="أدخل مكان إقامة الورشة"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="workshopDuration" className="text-right">
                المدة (ساعات) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="workshopDuration"
                type="number"
                min="1"
                max="24"
                value={newWorkshop.duration}
                onChange={(e) => setNewWorkshop({ ...newWorkshop, duration: Number.parseInt(e.target.value) || 2 })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="workshopNotes" className="text-right pt-2">
                ملاحظات
              </Label>
              <Textarea
                id="workshopNotes"
                value={newWorkshop.notes}
                onChange={(e) => setNewWorkshop({ ...newWorkshop, notes: e.target.value })}
                className="col-span-3 min-h-[80px]"
                placeholder="أي ملاحظات إضافية حول الورشة"
              />
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">الحضور</Label>
              <div className="col-span-3 space-y-2">
                {selectedProjectForWorkshop && (
                  <div className="max-h-[150px] overflow-y-auto border rounded-md p-2">
                    {projects
                      .find((p) => p.id === selectedProjectForWorkshop)
                      ?.members.map((member) => (
                        <div key={member.id} className="flex items-center space-x-2 p-1">
                          <input
                            type="checkbox"
                            id={`member-${member.id}`}
                            checked={newWorkshop.attendees.includes(member.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewWorkshop({
                                  ...newWorkshop,
                                  attendees: [...newWorkshop.attendees, member.id],
                                })
                              } else {
                                setNewWorkshop({
                                  ...newWorkshop,
                                  attendees: newWorkshop.attendees.filter((id) => id !== member.id),
                                })
                              }
                            }}
                            className="ml-2"
                          />
                          <label htmlFor={`member-${member.id}`} className="text-sm">
                            {member.name} {member.familyName} ({member.role === "leader" ? "قائد" : "عضو"})
                          </label>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddWorkshopDialogOpen(false)}>
              إلغاء
            </Button>
            <Button className="bg-[#e7a854] hover:bg-amber-600" onClick={handleAddWorkshop}>
              إضافة ورشة العمل
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* مربع حوار تعديل المشروع */}
      <Dialog open={isEditProjectDialogOpen} onOpenChange={setIsEditProjectDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>تعديل المشروع</DialogTitle>
            <DialogDescription>قم بتحديث تفاصيل المشروع.</DialogDescription>
          </DialogHeader>
          {currentProject && (
            <div className="grid gap-4 py-4 rtl">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-title" className="text-right">
                  عنوان المشروع
                </Label>
                <Input
                  id="edit-title"
                  value={currentProject.title}
                  onChange={(e) => setCurrentProject({ ...currentProject, title: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="edit-description" className="text-right pt-2">
                  وصف المشروع
                </Label>
                <Textarea
                  id="edit-description"
                  value={currentProject.description}
                  onChange={(e) => setCurrentProject({ ...currentProject, description: e.target.value })}
                  className="col-span-3 min-h-[80px]"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="edit-objective" className="text-right pt-2">
                  هدف المشروع
                </Label>
                <Textarea
                  id="edit-objective"
                  value={currentProject.objective}
                  onChange={(e) => setCurrentProject({ ...currentProject, objective: e.target.value })}
                  className="col-span-3 min-h-[80px]"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-status" className="text-right">
                  حالة المشروع
                </Label>
                <Select
                  value={currentProject.status}
                  onValueChange={(value) => setCurrentProject({ ...currentProject, status: value as ProjectStatus })}
                >
                  <SelectTrigger id="edit-status" className="col-span-3">
                    <SelectValue placeholder="اختر حالة المشروع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">قيد التخطيط</SelectItem>
                    <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                    <SelectItem value="completed">مكتمل</SelectItem>
                    <SelectItem value="cancelled">ملغي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditProjectDialogOpen(false)}>
              إلغاء
            </Button>
            <Button className="bg-[#e7a854] hover:bg-amber-600" onClick={handleEditProject}>
              حفظ التغييرات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* مربع حوار تأكيد حذف المشروع */}
      <Dialog open={isDeleteProjectDialogOpen} onOpenChange={setIsDeleteProjectDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
            <DialogDescription>
              هل أنت متأكد أنك تريد حذف هذا المشروع؟ لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteProjectDialogOpen(false)}>
              إلغاء
            </Button>
            <Button variant="destructive" onClick={handleDeleteProject}>
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

