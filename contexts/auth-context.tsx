"use client"

import { GlobalVariables } from "@/globalVariables"
import { User } from "@/types/user"
import { createContext, useContext, useState, useEffect, type ReactNode, SetStateAction, Dispatch } from "react"
import { signIn, signOut, useSession } from "next-auth/react"

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
  const { data: session } = useSession()
  // Check for existing session on mount
  useEffect(() => {
    setIsLoading(true)
    if (!session?.user?.email) { setIsLoading(false); return }
    const fetchData = async () => {
      try {
        const res = await fetch(`/auth/userData?email=${session?.user?.email}`)
        const data = await res.json()
        if (!res.ok)
          throw new Error(data.error)
        setUser(data.user)

      } catch (error) {
        console.error("Failed to fetch user data:", error)
      } finally {
        setIsLoading(false)   // ✅ Loading properly reset hobe
      }
    }

    fetchData();
  }, [session?.user?.email])

  const login = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      const response = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      // response er structure
      // { error: string | null, status: number, ok: boolean, url: string | null }

      if (response?.error) {
        let message = ""
        // NextAuth শুধু string দেবে, তাই নিজের map বানাতে হবে
        switch (response.error) {
          case "CredentialsSignin":
            message = "Invalid credentials"
            break
          case "AccessDenied":
            message = "You are not authorized to login"
            break
          case "Configuration":
            message = "Internal Server Error"
            break
          default:
            message = "Unexpected error. Please try again"
        }
        return { success: false, message };
      }
      // success
      return { success: true, message: "Login Successful" };

    } catch (error) {
      setIsLoading(false);
      return { success: false, message: "Network error occurred" };
    }
  };

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
        const response2 = await login(email, password)
        return response2
      } else {
        setIsLoading(false)
        return { success: false, message: data.error }
      }
    } catch (error) {
      setIsLoading(false)
      return { success: false, message: "Network error occurred" }
    }
  }

  const logout = () => {
    signOut({ redirect: false })
    setUser(null)

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
