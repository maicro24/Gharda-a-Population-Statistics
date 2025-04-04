"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { generateAndSaveData } from "@/lib/data-generator"
import { AlertCircle, Database } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function DataGeneratorTool() {
  const { toast } = useToast()
  const [count, setCount] = useState<number>(100)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showWarning, setShowWarning] = useState(false)

  const handleGenerate = () => {
    if (count > 1000) {
      setShowWarning(true)
      return
    }

    setIsGenerating(true)
    try {
      generateAndSaveData(count)
      toast({
        title: "تم توليد البيانات",
        description: `تم توليد ${count} سجل بنجاح.`,
      })
    } catch (error) {
      console.error("Error generating data:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء توليد البيانات.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
      setShowWarning(false)
    }
  }

  const handleConfirmGenerate = () => {
    setIsGenerating(true)
    try {
      generateAndSaveData(count)
      toast({
        title: "تم توليد البيانات",
        description: `تم توليد ${count} سجل بنجاح.`,
      })
    } catch (error) {
      console.error("Error generating data:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء توليد البيانات.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
      setShowWarning(false)
    }
  }

  return (
    <Card className="border-teal-200 shadow-md">
      <CardHeader className="bg-teal-50 border-b border-teal-100">
        <CardTitle className="text-teal-800 text-xl">أداة توليد البيانات</CardTitle>
        <CardDescription>توليد بيانات عشوائية لأغراض الاختبار والعرض</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4 rtl">
          {showWarning && (
            <Alert variant="warning" className="bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                تنبيه: أنت على وشك توليد عدد كبير من السجلات ({count}). قد يستغرق هذا بعض الوقت ويؤثر على أداء المتصفح.
                هل أنت متأكد من المتابعة؟
              </AlertDescription>
              <div className="flex gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowWarning(false)}
                  className="border-amber-300 text-amber-800 hover:bg-amber-100"
                >
                  إلغاء
                </Button>
                <Button size="sm" onClick={handleConfirmGenerate} className="bg-amber-600 hover:bg-amber-700">
                  متابعة
                </Button>
              </div>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="count">عدد السجلات المراد توليدها</Label>
            <div className="flex gap-2">
              <Input
                id="count"
                type="number"
                min="1"
                max="5000"
                value={count}
                onChange={(e) => setCount(Number.parseInt(e.target.value) || 100)}
                className="border-teal-200 focus:border-teal-500"
              />
              <Button
                onClick={handleGenerate}
                className="bg-teal-600 hover:bg-teal-700 min-w-[120px]"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <div className="h-4 w-4 border-2 border-t-white border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin ml-2"></div>
                    جاري التوليد...
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4 ml-2" />
                    توليد البيانات
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="text-sm text-gray-500 mt-4">
            <p>ملاحظات:</p>
            <ul className="list-disc mr-5 space-y-1 mt-1">
              <li>سيتم توليد بيانات عشوائية متوازنة بين العشائر والعائلات.</li>
              <li>سيتم حفظ البيانات في متصفحك وستحل محل أي بيانات موجودة حاليًا.</li>
              <li>يُنصح بتوليد عدد معقول من السجلات (100-500) لتجنب بطء المتصفح.</li>
            </ul>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 border-t border-teal-100 rtl">
        <div className="text-sm text-gray-600">
          تستخدم هذه الأداة لأغراض العرض والاختبار فقط. البيانات المولدة لا تمثل أشخاصًا حقيقيين.
        </div>
      </CardFooter>
    </Card>
  )
}

