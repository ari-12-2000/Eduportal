"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Clock, Users } from "lucide-react"

interface WelcomeScreenProps {
  welcomeData: {
    greeting: string
    text: string
    welcome_button: string
  }
  onStart: () => void
}

export default function WelcomeScreen({ welcomeData, onStart }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row">
      {/* Mobile Image - Shows on top for mobile/tablet */}
      <div className="lg:hidden h-64 sm:h-80">
        <div
          className="h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/images/team-collaboration.png')",
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
            dangerouslySetInnerHTML={{ __html: welcomeData.text }}
          />

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
          className="h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/images/team-collaboration.png')",
          }}
        />
      </div>
    </div>
  )
}
