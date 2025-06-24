"use client"
import { ProtectedRoute } from '@/components/protected-route'
import { Footer } from '@/components/student/footer'
import { Header } from '@/components/student/header'
import { Sidebar } from '@/components/student/sidebar'
import { GlobalVariables } from '@/globalVariables'


import {ReactNode, useEffect, useState} from 'react'

const layout = ({children}:{children:ReactNode}) => {

    const isLargeScreen = typeof window !== "undefined" ? window.innerWidth >= 1024 : false
      const [sidebarOpen, setSidebarOpen] = useState(isLargeScreen)
    
      // Update sidebar state based on screen size
      useEffect(() => {
        const handleResize = () => {
          setSidebarOpen(window.innerWidth >= 1024)
        }
    
        window.addEventListener("resize", handleResize)
        handleResize()
    
        return () => {
          window.removeEventListener("resize", handleResize)
        }
      }, [])
    
      const toggleSidebar = () => {
        setSidebarOpen(prev => !prev);
      }
  return (
    <ProtectedRoute requiredRole={GlobalVariables.non_admin.role1}> 
       <div className="flex h-screen bg-gray-50">
          <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header toggleSidebar={toggleSidebar} />
            <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
            <Footer/>
          </div>
        </div>
    </ProtectedRoute>
  )
}

export default layout
