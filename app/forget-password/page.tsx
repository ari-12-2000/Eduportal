'use client'
import React, { useState } from 'react'
import validator from "validator";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from 'next/navigation';

const forgetPassword = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState("")
    const [email, setEmail] = useState("")
    const router=useRouter();
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess("")

        if (!email.trim()) {
            setError("Email is required.")
            return
        }

        if (!validator.isEmail(email)) {
            setError("Invalid email format.")
            return
        }
        try {
            const res = await fetch("/api/auth/forget-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Request failed");
            setSuccess(data.message);
            router.push('/login');
        } catch (error) {
            setError((error as Error).message);
        } finally {
            setLoading(false);
        }

    }
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-4">
                    <div className="flex items-center justify-center mb-2">
                        <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                            <span className="text-white font-bold">E</span>
                        </div>
                        <span className="ml-2 text-2xl font-semibold text-gray-900">EduPortal</span>
                    </div>
                    <CardTitle className="text-2xl text-center">Forgot your password</CardTitle>
                    <CardDescription className='text-center'>Please enter the email address you'd like your password reset information sent to</CardDescription>
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

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="email@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Requesting..." : "Request reset link"}
                        </Button>
                    </form>

                </CardContent>
            </Card>
        </div>
    )
}

export default forgetPassword