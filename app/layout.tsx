import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "@/components/ui/toaster"
import { CourseProvider } from "@/contexts/course-context"
const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Edu Portal",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <CourseProvider>
            {children}
          </CourseProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  )
}
