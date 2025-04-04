"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DonationForm } from "@/components/donation-form"
import { DonationsTable } from "@/components/donations-table"
import { DonorSearch } from "@/components/donor-search"

export function DonationTracking() {
  const [activeTab, setActiveTab] = useState("donations-table")

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white border border-amber-200 p-1">
          <TabsTrigger
            value="donations-table"
            className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900"
          >
            قائمة التبرعات
          </TabsTrigger>
          <TabsTrigger
            value="add-donation"
            className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900"
          >
            إضافة تبرع جديد
          </TabsTrigger>
          <TabsTrigger
            value="donor-search"
            className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900"
          >
            البحث عن تبرعات المتبرع
          </TabsTrigger>
        </TabsList>

        <TabsContent value="donations-table">
          <DonationsTable />
        </TabsContent>

        <TabsContent value="add-donation">
          <DonationForm />
        </TabsContent>

        <TabsContent value="donor-search">
          <DonorSearch />
        </TabsContent>
      </Tabs>
    </div>
  )
}

