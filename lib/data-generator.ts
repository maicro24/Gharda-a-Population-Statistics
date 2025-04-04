import type { PersonData, EmploymentStatus, TraditionalInstitution } from "@/lib/types"
import { tribes, familyNames, residentialAreas, traditionalInstitutions } from "@/lib/data"

// قائمة بالأسماء الأولى للذكور
const maleFirstNames = [
  "محمد",
  "أحمد",
  "علي",
  "عبد الله",
  "عبد الرحمن",
  "يوسف",
  "خالد",
  "عمر",
  "إبراهيم",
  "مصطفى",
  "سعيد",
  "حسن",
  "حسين",
  "عبد العزيز",
  "عبد الكريم",
  "زكريا",
  "بلال",
  "أنس",
  "ياسين",
  "أيمن",
  "عادل",
  "كريم",
  "رشيد",
  "سليمان",
  "طارق",
  "جمال",
  "نبيل",
  "وليد",
  "هشام",
  "فيصل",
]

// قائمة بالأسماء الأولى للإناث
const femaleFirstNames = [
  "فاطمة",
  "عائشة",
  "مريم",
  "خديجة",
  "أمينة",
  "سارة",
  "نور",
  "هدى",
  "سلمى",
  "ليلى",
  "زينب",
  "سمية",
  "حليمة",
  "نادية",
  "لطيفة",
  "حنان",
  "سعاد",
  "نجاة",
  "رحمة",
  "صفية",
  "جميلة",
  "نعيمة",
  "سهام",
  "إيمان",
  "أسماء",
  "بشرى",
  "منى",
  "هناء",
  "وفاء",
  "ياسمين",
]

// توليد اسم عشوائي
function generateRandomName(isMale: boolean = Math.random() > 0.5): string {
  if (isMale) {
    return maleFirstNames[Math.floor(Math.random() * maleFirstNames.length)]
  } else {
    return femaleFirstNames[Math.floor(Math.random() * femaleFirstNames.length)]
  }
}

// توليد عمر عشوائي ضمن نطاق محدد
function generateRandomAge(min: number, max: number): string {
  return Math.floor(Math.random() * (max - min + 1) + min).toString()
}

// توليد حالة توظيف عشوائية
function generateRandomEmploymentStatus(age: number): EmploymentStatus {
  if (age < 18) {
    return "student"
  } else if (age > 60) {
    return Math.random() > 0.7 ? "retired" : "unemployed"
  } else {
    const rand = Math.random()
    if (rand < 0.6) {
      return "employed"
    } else if (rand < 0.8) {
      return "student"
    } else {
      return "unemployed"
    }
  }
}

// توليد مكان دراسة أو عمل عشوائي
function generatePlaceDetails(employmentStatus: EmploymentStatus): string {
  if (employmentStatus === "student") {
    const educationalPlaces = [
      "جامعة غرداية",
      "المدرسة العليا للأساتذة",
      "معهد العلوم الإسلامية",
      "كلية الطب",
      "كلية الهندسة",
      "كلية العلوم",
      "كلية الآداب",
      "ثانوية الخوارزمي",
      "ثانوية ابن سينا",
      "مدرسة النور الابتدائية",
    ]
    return educationalPlaces[Math.floor(Math.random() * educationalPlaces.length)]
  } else if (employmentStatus === "employed") {
    const workPlaces = [
      "شركة سوناطراك",
      "بلدية غرداية",
      "مستشفى غرداية المركزي",
      "مديرية التربية",
      "مديرية الصحة",
      "البريد المركزي",
      "بنك الجزائر",
      "شركة الكهرباء والغاز",
      "مديرية الضرائب",
      "مديرية التجارة",
      "قطاع خاص",
      "تجارة",
      "حرفي",
    ]
    return workPlaces[Math.floor(Math.random() * workPlaces.length)]
  }
  return ""
}

// توليد رقم هاتف عشوائي
function generateRandomPhoneNumber(): string {
  const prefixes = ["05", "06", "07"]
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
  let number = ""
  for (let i = 0; i < 8; i++) {
    number += Math.floor(Math.random() * 10)
  }
  return prefix + number
}

// توليد مؤسسة تقليدية عشوائية
function generateRandomTraditionalInstitution(): TraditionalInstitution {
  const rand = Math.random()
  if (rand < 0.4) {
    return ""
  } else {
    return traditionalInstitutions[Math.floor(Math.random() * traditionalInstitutions.length)] as TraditionalInstitution
  }
}

// توليد بيانات شخص عشوائي
export function generateRandomPerson(tribeIndex?: number, familyIndex?: number): PersonData {
  // اختيار عشيرة وعائلة عشوائية إذا لم يتم تحديدهما
  const selectedTribeIndex = tribeIndex !== undefined ? tribeIndex : Math.floor(Math.random() * tribes.length)
  const selectedTribe = tribes[selectedTribeIndex]

  let selectedFamily = ""
  if (selectedTribe === "انشاشبة") {
    const selectedFamilyIndex = familyIndex !== undefined ? familyIndex : Math.floor(Math.random() * familyNames.length)
    selectedFamily = familyNames[selectedFamilyIndex]
  } else {
    selectedFamily = selectedTribe + " " + Math.floor(Math.random() * 100)
  }

  // توليد عمر عشوائي
  const ageNum = Number.parseInt(generateRandomAge(1, 80))

  // توليد حالة توظيف عشوائية بناءً على العمر
  const employmentStatus = generateRandomEmploymentStatus(ageNum)

  // توليد مؤسسة تقليدية عشوائية
  const traditionalInstitution = generateRandomTraditionalInstitution()

  // تحديد ما إذا كان الشخص حافظًا للقرآن أو مستظهرًا
  const isHafiz = traditionalInstitution !== "" && Math.random() < 0.3
  const isReciter = traditionalInstitution !== "" && !isHafiz && Math.random() < 0.4

  // توليد تاريخ عشوائي للختم أو الاستظهار
  const currentYear = new Date().getFullYear()
  const hafizDate = isHafiz
    ? `${currentYear - Math.floor(Math.random() * 10)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}`
    : undefined
  const reciterDate = isReciter
    ? `${currentYear - Math.floor(Math.random() * 5)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}`
    : undefined

  // توليد اسم عشوائي
  const isMale = Math.random() > 0.5
  const firstName = generateRandomName(isMale)
  const fatherName = generateRandomName(true)
  const motherName = generateRandomName(false)

  return {
    id: `person_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    firstName,
    familyName: selectedFamily,
    tribeName: selectedTribe,
    fatherName,
    motherName,
    age: ageNum.toString(),
    employmentStatus,
    placeDetails: generatePlaceDetails(employmentStatus),
    residentialArea: residentialAreas[Math.floor(Math.random() * residentialAreas.length)],
    traditionalInstitution,
    isHafiz,
    isReciter,
    hafizDate,
    reciterDate,
    contact: generateRandomPhoneNumber(),
  }
}

// توليد مجموعة من البيانات العشوائية
export function generateRandomData(count: number): PersonData[] {
  const data: PersonData[] = []

  // توزيع البيانات بشكل متوازن بين العشائر والعائلات
  const tribesCount = tribes.length
  const familiesCount = familyNames.length

  for (let i = 0; i < count; i++) {
    // توزيع متوازن بين العشائر
    const tribeIndex = i % tribesCount

    // توزيع متوازن بين العائلات لعشيرة انشاشبة
    const familyIndex = tribes[tribeIndex] === "انشاشبة" ? i % familiesCount : undefined

    data.push(generateRandomPerson(tribeIndex, familyIndex))
  }

  return data
}

// توليد بيانات وحفظها في localStorage
export function generateAndSaveData(count: number): void {
  const data = generateRandomData(count)
  localStorage.setItem("populationData", JSON.stringify(data))
}

