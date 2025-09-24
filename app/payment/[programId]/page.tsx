"use client"

import { use, useEffect } from "react"
import Script from "next/script"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import type { Course, ProgramModule } from "@/types/course"
import { useCourses } from "@/contexts/course-context"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, FileText, Star, Users, Shield, CreditCard, ArrowLeft, CheckCircle } from "lucide-react"
import Image from "next/image"


const PaymentPage = ({ params }: { params: Promise<{ programId: string }> }) => {
  const { toast } = useToast()
  const { user, setUser } = useAuth()
  const router = useRouter()
  const { programId } = use(params)
  const { courses, loading, setLoading } = useCourses()
  const [isProcessing, setIsProcessing] = useState(false)
  const [isChecking, setIsChecking] = useState(true);

  const handlePayment = async (price: string) => {
    setIsProcessing(true)
    setLoading(true);
    try {
      const res1 = await fetch("/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price }),
      })
      if (!res1.ok) {
        throw new Error("Failed to create purchase")
      }
      const { orderId } = await res1.json()
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_TEST_KEY_ID!,
        amount: Number.parseFloat(price) * 100,
        currency: "INR",
        name: "Edu-Portal",
        description: "Course Payment",
        order_id: orderId,
        prefill: {
          name: user!.first_name + " " + user!.last_name,
          email: user!.email,
        },
        handler: async (response: any) => {
          console.log("Payment successful", response)
          try {
            const res2 = await fetch("/courses/student", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                learnerId: user!.id,
                programId: programId,
              }),
            })
            if (!res2.ok) throw new Error("Enrollment failed")
            const updatedUser = {
              ...user!,
              enrolledCourseIDs: { ...user!.enrolledCourseIDs, [programId]: true },
            };
            setUser(updatedUser);

            router.push(`/courses/${programId}?enrolled=true`)
          } catch (err) {
            toast({
              variant: "destructive",
              title: "Enrollment failed",
              description: "Payment was successful, but enrollment failed. Please contact support.",
            })
            router.push("/courses/search")
            setLoading(false)

          }
        },
        theme: {
          color: "#3b82f6",
        },
      }
      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (err) {
      console.error(err)
      toast({
        variant: "destructive",
        title: "Payment initiation failed",
        description: "Please try again or contact support.",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const course = courses?.find((course: Course) => course.id === Number(programId))

  useEffect(() => {
    if (!course) {
      router.replace("/courses"); // or "/404"
      return;
    }
    setIsChecking(false);
  }, [course, router]);

  console.log(isChecking);
  if (isChecking || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-start space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.back()} className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Complete Your Purchase</h1>
                <p className="text-gray-600">Secure payment powered by Razorpay</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-green-600">
              <Shield className="h-5 w-5" />
              <span className="max-sm:text-xs text-sm font-medium">Secure Payment</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Course Details */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <div
                className="h-64 relative bg-gradient-to-r from-blue-600 to-purple-600"
                style={{
                  backgroundImage: course!.image
                    ? `linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.7)), url(${course!.image})`
                    : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  backgroundSize: 'cover',
                  backgroundBlendMode: 'multiply',
                  backgroundPosition: 'center',
                }}
              >
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute top-6 left-6">
                  <Badge className="bg-yellow-500 text-yellow-900 hover:bg-yellow-500 shadow-lg">
                    ⭐ Featured Course
                  </Badge>
                </div>
                <div className="absolute bottom-6 left-6 right-6">
                  <h2 className="text-3xl font-bold text-white mb-2">{course!.title}</h2>
                  <p className="text-white/90 text-lg">{course!.description}</p>
                </div>
              </div>

              <CardContent className="p-8">
                {/* Instructor Info */}
                <div className="flex relative sm: items-center mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="relative w-12 aspect-square mr-4">
                    <Image
                      src={course!.instructorAvatar || "/placeholder.svg"}
                      alt={course!.instructor}
                      fill
                      className="rounded-full object-cover object-top"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Instructor</p>
                    <p className="text-gray-700 font-medium">{course!.instructor}</p>
                  </div>
                </div>

                {/* Course Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {course!.rating && (
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="flex items-center justify-center mb-2">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      </div>
                      <p className="font-bold text-gray-900">{course!.rating}</p>
                      <p className="text-sm text-gray-600">Rating</p>
                    </div>
                  )}
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Users className="h-5 w-5 mx-auto mb-2 text-blue-600" />
                    <p className="font-bold text-gray-900">{course!.enrollments.length}</p>
                    <p className="text-sm text-gray-600">Students</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <BookOpen className="h-5 w-5 mx-auto mb-2 text-green-600" />
                    <p className="font-bold text-gray-900">{course!.programModules.length}</p>
                    <p className="text-sm text-gray-600">Modules</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <FileText className="h-5 w-5 mx-auto mb-2 text-purple-600" />
                    <p className="font-bold text-gray-900">
                      {course!.programModules.reduce(
                        (acc: number, prop: ProgramModule) => acc + prop.module.moduleTopics.length,
                        0,
                      )}
                    </p>
                    <p className="text-sm text-gray-600">Topics</p>
                  </div>
                </div>

                {/* What You'll Get */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">What you'll get:</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-gray-700">Lifetime access</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-gray-700">Certificate of completion</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-gray-700">Mobile and desktop access</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-gray-700">24/7 support</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Payment Summary</h3>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Course Price</span>
                      <span className="font-semibold">₹{course!.price}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Platform Fee</span>
                      <span className="font-semibold text-green-600">Free</span>
                    </div>
                    <hr className="border-gray-200" />
                    <div className="flex justify-between items-center text-lg">
                      <span className="font-bold text-gray-900">Total</span>
                      <span className="font-bold text-2xl text-blue-600">₹{course!.price}</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => handlePayment(course!.price!)}
                    disabled={isProcessing}
                    className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {isProcessing ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Processing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <CreditCard className="h-5 w-5" />
                        <span>Pay Now</span>
                      </div>
                    )}
                  </Button>

                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-500">
                      Secured by <span className="font-semibold">Razorpay</span>
                    </p>
                  </div>

                  {/* Money Back Guarantee */}
                  <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Shield className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-green-800">30-Day Money Back Guarantee</span>
                    </div>
                    <p className="text-sm text-green-700">Not satisfied? Get a full refund within 30 days.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentPage
