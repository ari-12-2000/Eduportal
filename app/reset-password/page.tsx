'use client'

import React, { useEffect, useState } from 'react'
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useRouter, useSearchParams } from 'next/navigation'


const ResetPassword = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const rawToken = searchParams.get("token") ?? "";

    const [showPassword, setShowPassword] = useState(false)
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!rawToken) return setError("Invalid reset link.");
        setLoading(true);
        setError(null);

        if (!password.trim()) {
            setError("Password is required.")
            return
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/
        if (!passwordRegex.test(password)) {
            setError("Password must be at least 8 characters long and include uppercase, lowercase, and a special character.")
            return
        }

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: rawToken, newPassword: password }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Reset failed");

            setSuccess(data.message);
            router.push("/login");
        } catch (err: any) {
            setError(err);
            console.log(err);
        } finally {
            setLoading(false);
        }
    };
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
                    <CardTitle className="text-2xl text-center">Reset your password</CardTitle>
                </CardHeader>
                <CardContent>
                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    {success && (
                        <Alert className="mb-4 border-green-100 bg-green-50 text-green-800">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            <AlertDescription className="font-medium">{success}</AlertDescription>
                        </Alert>
                    )}

                    <form className='space-y-4' onSubmit={handleSubmit}>
                        <div className="space-y-2 relative">
                            <Label htmlFor="password">Password</Label>
                            <p className="text-xs text-muted-foreground mb-1">
                                i) At least 8 characters<br />
                                ii) Include uppercase, lowercase, and a special character
                            </p>
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className='relative'
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-[4.7rem] text-gray-500 hover:text-gray-800"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Resetting..." : "Reset password"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>

    )
}

export default ResetPassword