"use client"

import { GlobalVariables } from "@/globalVariables"
import { createContext, useContext, useState, useEffect, type ReactNode, SetStateAction, Dispatch } from "react"

export interface User {
  id: string
  first_name: string
  last_name: string
  email: string
  role: string
  avatar?: string
  adminType?: string
  // qsnAttempts?: Record<number, { answer: string; isCorrect: boolean }>
  // quizId?:number,
  // score?: number
  //  enrolledCourses: Course[],
  enrolledCourseIDs: { [key: number]:boolean}
  completedTopics: { [key: number]:boolean}
  completedModules: { [key: number]:boolean}
  completedPrograms: { [key: number]:boolean}
  completedResources: { [key: number]:boolean}
  completedQuizzes: { [key: number]:number}
  attemptedQuizzes: { [key: number]: {start:Date, score:number} }
}

interface AuthContextType {
  user: User | null
  setUser: Dispatch<SetStateAction<User | null>>
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>
  signup: (
    first_name: string, last_name: string, email: string, password: string,
    role?: string,
  ) => Promise<{ success: boolean; message?: string }>
  logout: () => void
  isLoading: boolean
  //refreshUser: () => Promise<User| null>
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
        dataProcessing(data)
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
        dataProcessing(data)
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

  function dataProcessing(data: any) {

     localStorage.setItem("eduportal-user", JSON.stringify(data.user))
     localStorage.setItem("eduportal-token", data.token)
     setUser(data.user)
  }

  // const refreshUser = async (): Promise<User | null> => {
  //   if (isRefreshing) {
  //     console.warn("Skipping duplicate refreshUser call");
  //     return null;
  //   }

  //   isRefreshing = true;

  //   const token = localStorage.getItem("eduportal-token");
  //   console.log(token);
  //   if (!token || token === "null" || token === "undefined" || token.trim() === "") {
  //     isRefreshing = false;
  //     logout();
  //     return null;
  //   }

  //   try {
  //     const response = await fetch("/auth/me", {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });

  //     if (response.ok) {
  //       const data = await response.json();
  //       setUser(data.user);
  //       localStorage.setItem("eduportal-user", JSON.stringify(data.user));
  //       return data.user;
  //     } else {
  //       const errorText = await response.text();
  //       console.error("refreshUser failed:", errorText);
  //     }
  //   } catch (error) {
  //     console.error("Failed to refresh user data:", error);
  //   } finally {
  //     isRefreshing = false;
  //   }

  //   return null;
  // };

  const logout = () => {
    setUser(null)
    localStorage.removeItem("eduportal-user")
    localStorage.removeItem("eduportal-token")
  }

  return <AuthContext.Provider value={{ user, setUser, login, signup, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
