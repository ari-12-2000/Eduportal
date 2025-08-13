"use client"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { CheckCircle, RotateCcw, Award } from "lucide-react"

interface ThankYouScreenProps {
  messages: {
    thanks: string
    success_text: string
  }
  onRestart: () => void
  totalQuestions: number
  attemptedQsns:number
}

export default function ThankYouScreen({ messages, onRestart, totalQuestions, attemptedQsns }: ThankYouScreenProps) {
   const { user} = useAuth()
  const completionRate = Math.round((attemptedQsns / totalQuestions) * 100)

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-white rounded-3xl shadow-2xl p-12 backdrop-blur-sm bg-opacity-95">
          <div className="mb-8">
            <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
              {messages.thanks}
            </h1>
          </div>

          <p className="text-lg text-gray-600 mb-8 leading-relaxed">{messages.success_text}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6">
              <Award className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-blue-700">{attemptedQsns}</div>
              <div className="text-sm text-blue-600">Questions Answered</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-green-700">{completionRate}%</div>
              <div className="text-sm text-green-600">Completion Rate</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6">
              <Award className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-purple-700">{totalQuestions}</div>
              <div className="text-sm text-purple-600">Total Questions</div>
            </div>
          </div>

          <Button
            onClick={onRestart}
            variant="outline"
            className="px-8 py-4 rounded-full text-lg font-semibold border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300"
          >
            <RotateCcw className="mr-2 w-5 h-5" />
            Take Quiz Again
          </Button>
        </div>
      </div>
    </div>
  )
}
