import * as XLSX from "xlsx"
import type { PersonData } from "./types"

export const exportToExcel = async (data: PersonData[], filename: string) => {
  // Create a new workbook
  const workbook = XLSX.utils.book_new()

  // Convert data to worksheet format
  const worksheetData = data.map((person) => {
    let statusDetails = ""

    switch (person.employmentStatus) {
      case "student":
        statusDetails = `طالب في ${person.placeDetails || "غير محدد"}`
        break
      case "employed":
        statusDetails = `يعمل في ${person.placeDetails || "غير محدد"}`
        break
      case "retired":
        statusDetails = "متقاعد"
        break
      case "unemployed":
      default:
        statusDetails = "غير موظف"
        break
    }

    return {
      "الاسم الأول": person.firstName,
      "اسم العائلة": person.familyName,
      "اسم العشيرة": person.tribeName,
      "اسم الأب": person.fatherName,
      "اسم الأم": person.motherName || "غير متوفر",
      العمر: person.age,
      "الحالة الوظيفية": statusDetails,
      "حي السكن": person.residentialArea || "غير متوفر",
      "المؤسسة التقليدية": person.traditionalInstitution || "لا يوجد",
      "خاتم (حافظ للقرآن)": person.isHafiz ? "نعم" : "لا",
      "مستظهر (حافظ لأجزاء من القرآن)": person.isReciter ? "نعم" : "لا",
      "تاريخ الختم": person.hafizDate || "غير متوفر",
      "تاريخ الاستظهار": person.reciterDate || "غير متوفر",
      "معلومات الاتصال": person.contact || "غير متوفر",
    }
  })

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(worksheetData)

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, "بيانات السكان")

  // Generate Excel file
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })

  // Create Blob and download
  const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })

  // Create download link
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `${filename}.xlsx`

  // Trigger download
  document.body.appendChild(link)
  link.click()

  // Clean up
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

