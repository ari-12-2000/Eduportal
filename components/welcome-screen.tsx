"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, Clock, Users } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface WelcomeScreenProps {
  name: string
  welcomeData: {
    greeting: string
    text: string
    welcome_button: string
  }

  onStart: () => void
}

export default function WelcomeScreen({ name, welcomeData, onStart }: WelcomeScreenProps) {
  const pathname = usePathname();
  const courseId = pathname.split("/")[2];

  return (
    <>
      <Link
        href={`/courses/${courseId}`}
        className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-50 via-white to-blue-50 px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-200 transition-all duration-300 hover:shadow-md hover:scale-105 hover:bg-gradient-to-r hover:from-indigo-100 hover:to-blue-100 absolute top-4 left-4"
      >
        <span className="flex items-center justify-center rounded-full bg-white p-1.5 shadow-sm transition-colors group-hover:bg-gray-50">
          <ArrowLeft className="h-4 w-4 text-gray-600" />
        </span>
        Back to course
      </Link>
      <div className="min-h-screen bg-white flex flex-col lg:flex-row">
        {/* Mobile Image - Shows on top for mobile/tablet */}
        <div className="lg:hidden h-64 sm:h-80">
          <div
            className="h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('/images/quiz.png')",
            }}
          />
        </div>

        {/* Left Side - Content */}
        <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
          <div className="max-w-lg w-full space-y-8">
            {/* Icon */}
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto lg:mx-0">
              <Users className="w-10 h-10 text-white" />
            </div>

            {/* Heading */}
            <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-center lg:text-left">
              {welcomeData.greeting}
            </h1>

            {/* Description */}
            <div
              className="text-lg lg:text-xl text-gray-700 leading-relaxed text-center lg:text-left font-medium"
            ><p>{name}</p></div>

            {/* Info Items */}
            <div className="flex items-center justify-center lg:justify-start gap-8 text-gray-600">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span className="font-medium">5-10 minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span className="font-medium">Anonymous</span>
              </div>
            </div>

            {/* Button */}
            <div className="flex justify-center lg:justify-start pt-4">
              <Button
                onClick={onStart}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                {welcomeData.welcome_button}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Right Side - Image (Desktop only) */}
        <div className="hidden lg:block flex-1">
          <div
            className="h-full bg-cover bg-right bg-no-repeat"
            style={{
              backgroundImage: "url('/images/quiz.png')",
            }}
          />
        </div>
      </div>
    </>
  )
}
