"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { FileUp, Download, FileX, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import * as XLSX from "xlsx"

export function DataMerger() {
  const { toast } = useToast()
  const [files, setFiles] = useState<File[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [mergedFile, setMergedFile] = useState<string | null>(null)
  const [mergedFileName, setMergedFileName] = useState("merged_data.xlsx")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileList = Array.from(e.target.files)
      // فلترة الملفات للتأكد من أنها ملفات Excel فقط
      const excelFiles = fileList.filter(
        (file) =>
          file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
          file.type === "application/vnd.ms-excel",
      )

      if (excelFiles.length !== fileList.length) {
        toast({
          title: "تم تجاهل بعض الملفات",
          description: "تم قبول ملفات Excel فقط (.xlsx, .xls)",
          variant: "destructive",
        })
      }

      setFiles((prevFiles) => [...prevFiles, ...excelFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index))
  }

  const clearFiles = () => {
    setFiles([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const mergeFiles = async () => {
    if (files.length === 0) {
      toast({
        title: "لا توجد ملفات",
        description: "الرجاء تحميل ملفات Excel أولاً",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    setMergedFile(null)

    try {
      // إنشاء مصنف جديد
      const mergedWorkbook = XLSX.utils.book_new()
      const allData: any[] = []
      let headers: any[] = []
      let hasHeaders = false

      // قراءة جميع الملفات
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const data = await file.arrayBuffer()
        const workbook = XLSX.read(data)

        // استخراج البيانات من الورقة الأولى
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

        if (jsonData.length > 0) {
          // إذا كانت هذه هي الملف الأول أو لم نجد عناوين بعد
          if (!hasHeaders && jsonData[0] && Array.isArray(jsonData[0]) && jsonData[0].length > 0) {
            headers = jsonData[0] as any[]
            hasHeaders = true
            allData.push(...jsonData.slice(1)) // إضافة البيانات باستثناء الصف الأول (العناوين)
          } else {
            // بالنسبة للملفات الأخرى، نتجاهل الصف الأول (العناوين) ونضيف فقط البيانات
            allData.push(...jsonData.slice(1))
          }
        }
      }

      // إنشاء ورقة عمل جديدة مع البيانات المدمجة
      if (hasHeaders) {
        // إضافة صف العناوين في البداية
        allData.unshift(headers)
      }

      const mergedWorksheet = XLSX.utils.aoa_to_sheet(allData)
      XLSX.utils.book_append_sheet(mergedWorkbook, mergedWorksheet, "Merged Data")

      // تحويل المصنف إلى ملف
      const excelBuffer = XLSX.write(mergedWorkbook, { bookType: "xlsx", type: "array" })
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })

      // إنشاء رابط للتنزيل
      const url = URL.createObjectURL(blob)
      setMergedFile(url)

      toast({
        title: "تم دمج الملفات بنجاح",
        description: `تم دمج ${files.length} ملفات في ملف واحد`,
      })
    } catch (error) {
      console.error("Error merging files:", error)
      toast({
        title: "حدث خطأ أثناء دمج الملفات",
        description: "يرجى التحقق من الملفات والمحاولة مرة أخرى",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadMergedFile = () => {
    if (mergedFile) {
      const a = document.createElement("a")
      a.href = mergedFile
      a.download = mergedFileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  return (
    <Card className="border-green-200 shadow-md">
      <CardHeader className="bg-green-50 border-b border-green-100">
        <CardTitle className="text-green-800 text-xl">دمج البيانات</CardTitle>
        <CardDescription>قم بتحميل ملفات Excel متعددة لدمجها في ملف واحد</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6 rtl">
          <Alert className="bg-green-50 border-green-200 text-green-800">
            <AlertCircle className="h-4 w-4 text-green-600" />
            <AlertTitle>ميزة جديدة</AlertTitle>
            <AlertDescription>
              يتم دمج جميع البيانات في ورقة عمل واحدة مع الاحتفاظ بصف العناوين مرة واحدة فقط في الأعلى.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="file-upload">تحميل ملفات Excel</Label>
              <div className="flex gap-2">
                <Input
                  ref={fileInputRef}
                  id="file-upload"
                  type="file"
                  multiple
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="border-green-200 focus:border-green-500"
                />
                <Button
                  variant="outline"
                  className="border-green-200 hover:bg-green-50 text-green-700"
                  onClick={clearFiles}
                >
                  مسح
                </Button>
              </div>
            </div>

            {files.length > 0 && (
              <div className="space-y-2">
                <Label>الملفات المحددة ({files.length})</Label>
                <div className="max-h-[200px] overflow-y-auto border rounded-md p-2 border-green-200">
                  {files.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="flex justify-between items-center p-2 hover:bg-green-50 rounded-md"
                    >
                      <span className="truncate max-w-[300px]">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <FileX className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="merged-filename">اسم الملف المدمج</Label>
              <Input
                id="merged-filename"
                value={mergedFileName}
                onChange={(e) => setMergedFileName(e.target.value)}
                className="border-green-200 focus:border-green-500"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={mergeFiles}
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={isProcessing || files.length === 0}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    جاري الدمج...
                  </>
                ) : (
                  <>
                    <FileUp className="h-4 w-4 mr-2" />
                    دمج الملفات
                  </>
                )}
              </Button>

              {mergedFile && (
                <Button onClick={downloadMergedFile} className="bg-green-700 hover:bg-green-800 text-white">
                  <Download className="h-4 w-4 mr-2" />
                  تنزيل الملف المدمج
                </Button>
              )}
            </div>
          </div>

          {mergedFile && (
            <Alert className="bg-green-100 border-green-300">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle>تم الدمج بنجاح!</AlertTitle>
              <AlertDescription>
                تم دمج جميع البيانات في ورقة عمل واحدة. انقر على زر التنزيل للحصول على الملف المدمج.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 border-t border-green-100 rtl">
        <div className="text-sm text-gray-600">
          ملاحظة: يتم دمج البيانات في ورقة عمل واحدة مع الاحتفاظ بصف العناوين مرة واحدة فقط.
        </div>
      </CardFooter>
    </Card>
  )
}

