"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GlobalVariables } from "@/globalVariables"
import { Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const [loginData, setLoginData] = useState({ email: "", password: "" })
  const [signupData, setSignupData] = useState({ first_name: "", last_name: "", email: "", password: "", role: `${GlobalVariables.non_admin.role1}` })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const { login, signup, isLoading } = useAuth()
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    const result = await login(loginData.email, loginData.password)
    if (result.success) {
      const storedUser = localStorage.getItem("eduportal-user")
   
      if (storedUser) {
        const user = JSON.parse(storedUser)
        if (user.role === "admin") {
          router.push("/admin")
        } else {
          router.push("/")
        }
      }
    } else {
      setError(result.message || "Login failed")
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    const { first_name, last_name, email, password, role } = signupData

    if (
      !first_name.trim() ||
      !last_name.trim() ||
      !email.trim() 
    ) {
      setError("All fields are required.")
      return
    }
    
    if(!password.trim() && role===`${GlobalVariables.non_admin.role1}`){
      setError("Password is required.")
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/
    if (!passwordRegex.test(password)) {
      setError("Password must be at least 8 characters long and include uppercase, lowercase, and a special character.")
      return
    }

    const result = await signup(
      first_name.trim(),
      last_name.trim(),
      email.trim(),
      password.trim(),
      signupData.role
    )
    if (result.success) {
      setSuccess(result.message || "Account created successfully")
      // Redirect based on role
      if (signupData.role === `${GlobalVariables.non_admin.role2}`) {
        router.push("/guest")
      } else {
        router.push("/")
      }
    } else {
      setError(result.message || "Signup failed")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-2">
            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold">E</span>
            </div>
            <span className="ml-2 text-2xl font-semibold text-gray-900">EduPortal</span>
          </div>
          <CardTitle className="text-2xl text-center">Welcome</CardTitle>
          <CardDescription className="text-center">Sign in to your account or create a new one</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="mb-4 border-green-200 bg-green-50">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="email@example.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2 relative">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-9 text-gray-500 hover:text-gray-800"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-first_name">First Name</Label>
                  <Input
                    id="signup-first_name"
                    type="text"
                    placeholder="John"
                    value={signupData.first_name}
                    onChange={(e) => setSignupData({ ...signupData, first_name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-last_name">Last Name</Label>
                  <Input
                    id="signup-last_name"
                    type="text"
                    placeholder="Doe"
                    value={signupData.last_name}
                    onChange={(e) => setSignupData({ ...signupData, last_name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="email@example.com"
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    required
                  />
                </div>

                {signupData.role === `${GlobalVariables.non_admin.role1}` &&
                  (<div className="space-y-2 relative">
                    <Label htmlFor="signup-password">Password</Label>
                    <p className="text-xs text-muted-foreground mb-1">
                      i) At least 8 characters<br />
                      ii) Include uppercase, lowercase, and a special character
                    </p>
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-[4.7rem] text-gray-500 hover:text-gray-800"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>)}
                <div className="space-y-2">
                  <Label htmlFor="signup-role">Account Type</Label>
                  <Select
                    value={signupData.role}
                    onValueChange={(value) => setSignupData({ ...signupData, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={GlobalVariables.non_admin.role1}>{GlobalVariables.non_admin.role1}</SelectItem>
                      <SelectItem value={GlobalVariables.non_admin.role2}>{GlobalVariables.non_admin.role2}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
