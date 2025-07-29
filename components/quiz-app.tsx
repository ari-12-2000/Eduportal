"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import WelcomeScreen from "./welcome-screen"
import QuizScreen from "./quiz-screen"
import ThankYouScreen from "./thank-you-screen"
import type { QuizData } from "@/app/page"

type ScreenType = "welcome" | "quiz" | "thank_you"

interface QuizAppProps {
  quizData: QuizData | null
  loading: boolean
  error: string | null
}

export default function QuizApp({ quizData, loading, error }: QuizAppProps) {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>("welcome")
  const [answers, setAnswers] = useState<any[]>([])
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)

  // Initialize answers array when quiz data loads
  useEffect(() => {
    if (quizData) {
      setAnswers(Array(quizData.questions.length).fill(null))

      // Set up time limit if specified
      if (quizData.settings.time_limit_seconds > 0) {
        setTimeRemaining(quizData.settings.time_limit_seconds)
      }

      // Determine initial screen based on enable_screens
      const enabledScreens = quizData.settings.enable_screens
      if (enabledScreens.includes("welcome")) {
        setCurrentScreen("welcome")
      } else {
        setCurrentScreen("quiz")
      }
    }
  }, [quizData])

  // Timer countdown
  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0 && currentScreen === "quiz") {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev !== null && prev <= 1) {
            handleQuizComplete()
            return 0
          }
          return prev !== null ? prev - 1 : null
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [timeRemaining, currentScreen])

  const handleStartQuiz = () => {
    setCurrentScreen("quiz")
  }

  const handleQuizComplete = () => {
    const enabledScreens = quizData?.settings.enable_screens || []
    if (enabledScreens.includes("thank_you")) {
      setCurrentScreen("thank_you")
    } else {
      alert(quizData?.messages.success_text || "Quiz completed!")
    }
  }

  const handleRestart = () => {
    if (quizData) {
      setAnswers(Array(quizData.questions.length).fill(null))
      setTimeRemaining(quizData.settings.time_limit_seconds > 0 ? quizData.settings.time_limit_seconds : null)

      const enabledScreens = quizData.settings.enable_screens
      if (enabledScreens.includes("welcome")) {
        setCurrentScreen("welcome")
      } else {
        setCurrentScreen("quiz")
      }
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg text-gray-700">Loading your survey...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !quizData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <p className="text-red-600 mb-4 text-lg">{error || quizData?.messages.error_text || "No quiz data found"}</p>
          <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  // Render appropriate screen
  switch (currentScreen) {
    case "welcome":
      return <WelcomeScreen welcomeData={quizData.initial_screens.welcome} onStart={handleStartQuiz} />

    case "quiz":
      return (
        <QuizScreen
          quizData={quizData}
          answers={answers}
          setAnswers={setAnswers}
          onComplete={handleQuizComplete}
          timeRemaining={timeRemaining}
        />
      )

    case "thank_you":
      return (
        <ThankYouScreen
          messages={quizData.messages}
          onRestart={handleRestart}
          answers={answers}
          totalQuestions={quizData.questions.length}
        />
      )

    default:
      return null
  }
}
