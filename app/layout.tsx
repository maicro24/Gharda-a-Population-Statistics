import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import type { Metadata } from "next"

// أضف تعليقاً يشير إلى أن مكتبة XLSX مطلوبة

// تأكد من تثبيت مكتبة XLSX: npm install xlsx
// أو yarn add xlsx

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Ghardaïa Population Statistics",
  description: "Statistical tracking for the population of Ghardaïa",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}



import './globals.css'