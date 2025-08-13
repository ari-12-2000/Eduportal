'use client'
import React from 'react'
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import Loading from "@/app/loading"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string
  id:string
}

const PaymentProtectedRoute = ({ children, requiredRole, id }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth()
    const router = useRouter()
  
    useEffect(() => {
    if (isLoading) return;
  
    const unauthorized = !user || (requiredRole && user.role !== requiredRole);
    if (unauthorized) {
      router.push("/login");
    }else if(!user.enrolledCourseIDs[Number(id)]){
       router.push(`/payment/${id}`)
    }
   }, [user, isLoading, router, requiredRole]);
  
    if (isLoading) {
      return (
        <Loading/>
      )
    }
  
    if (!user) {
      return null
    }
  
    if(!user.enrolledCourseIDs[Number(id)]){
        return null
    }
    if (requiredRole && user.role !== requiredRole) {
      return null
    }
  
    return <>{children}</>
}

export default PaymentProtectedRoute