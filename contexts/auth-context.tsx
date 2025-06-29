"use client"

import { GlobalVariables } from "@/globalVariables"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"



interface User {
  id: string
  first_name: string,
  last_name: string,
  email: string
  role: string
  avatar?: string
  adminType?: string
  enrolledCourses: []
  enrolledCourseIDs?: number[]
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>
  signup: (
    first_name: string, last_name: string, email: string, password: string,
    role?: string,
  ) => Promise<{ success: boolean; message?: string }>
  logout: () => void
  isLoading: boolean
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("eduportal-user")
    const storedToken = localStorage.getItem("eduportal-token")
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)

    try {
      const response = await fetch("/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (data.success) {
        setUser(data.user)
        localStorage.setItem("eduportal-user", JSON.stringify(data.user))
        localStorage.setItem("eduportal-token", data.token)
        setIsLoading(false)
        return { success: true }
      } else {
        setIsLoading(false)
        return { success: false, message: data.error }
      }
    } catch (error) {
      setIsLoading(false)
      return { success: false, message: "Network error occurred" }
    }
  }

  const signup = async (first_name: string, last_name: string, email: string, password: string, role = `${GlobalVariables.non_admin.role1}`) => {
    setIsLoading(true)

    try {
      const response = await fetch("/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ first_name, last_name, email, password, role }),
      })

      const data = await response.json()

      if (data.success) {
        setUser(data.user)
        localStorage.setItem("eduportal-user", JSON.stringify(data.user))
        localStorage.setItem("eduportal-token", data.token)
        setIsLoading(false)
        return { success: true, message: data.message }
      } else {
        setIsLoading(false)
        return { success: false, message: data.error }
      }
    } catch (error) {
      setIsLoading(false)
      return { success: false, message: "Network error occurred" }
    }
  }

  const refreshUser = async () => {
    const token = localStorage.getItem("eduportal-token")
    console.log("Refreshing user data with token:", token)
    if (!token) return

    try {
      const response = await fetch("/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log(data);
        setUser(data.user)
      }
    } catch (error) {
      console.error("Failed to refresh user data:", error)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("eduportal-user")
    localStorage.removeItem("eduportal-token")
  }

  return <AuthContext.Provider value={{ user, login, signup, logout, isLoading , refreshUser}}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
