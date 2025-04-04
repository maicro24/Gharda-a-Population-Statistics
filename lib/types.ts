export interface UserType {
  email: string
  role: "admin" | "representative"
  familyName?: string
  tribeName?: string
}

export type EmploymentStatus = "student" | "employed" | "unemployed" | "retired"

export type TraditionalInstitution =
  | "مدرسة الفتح"
  | "مدرسة كاف حمودة"
  | "مدرسة الشيخ عامر"
  | "مدرسة تقديمة"
  | "الجمعيات الخيرية"
  | ""

export interface PersonData {
  id: string
  firstName: string
  familyName: string
  tribeName: string
  fatherName: string
  motherName: string
  age: string
  employmentStatus: EmploymentStatus
  placeDetails: string // For student: university/place of study, For employed: workplace/type of work
  residentialArea: string // حي السكن
  traditionalInstitution: TraditionalInstitution
  isHafiz: boolean // Has memorized the Quran (خاتم)
  isReciter: boolean // Has memorized parts of the Quran (مستظهر)
  hafizDate?: string // Date when completed Quran memorization
  reciterDate?: string // Date when completed partial Quran memorization
  contact: string
}

export interface FamilyRepresentative {
  id: string
  email: string
  password: string
  name: string
  familyName: string
  tribeName: string
  contact?: string
}

// أنواع التبرعات
export type DonationPurpose =
  | "mosque_renovation"
  | "cemetery_maintenance"
  | "school_equipment"
  | "helping_families"
  | "other"

export interface Donation {
  id: string
  donorName: string
  amount: number
  date: string
  purpose: DonationPurpose
  usageStatus: string
  verifiedBy: string
  donorContact?: string
}

export type ProjectStatus = "planning" | "in_progress" | "completed" | "cancelled"

export interface ProjectMember {
  id: string
  personId: string
  name: string
  familyName: string
  tribeName: string
  role: "leader" | "member"
  contact: string
  joinDate: string
}

export interface Project {
  id: string
  title: string
  description: string
  objective: string
  startDate: string
  endDate?: string
  status: ProjectStatus
  tribe: string
  members: ProjectMember[]
  workshops: Workshop[]
  createdBy: string
  createdAt: string
}

export interface Workshop {
  id: string
  projectId: string
  title: string
  description: string
  date: string
  location: string
  duration: number // بالساعات
  attendees: string[] // قائمة معرفات الأعضاء الحاضرين
  notes: string
}

