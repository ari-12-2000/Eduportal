"use client"

import { useState, useEffect, useRef } from "react"
import WelcomeScreen from "./welcome-screen"
import QuizScreen from "./quiz-screen"
import ThankYouScreen from "./thank-you-screen"
import { QuizAssignmentUI } from "@/types/quiz"
import NotFound from "./not-found"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "./ui/use-toast"
import Loading from "@/app/quiz/loading"


type ScreenType = "welcome" | "quiz" | "thank_you"

interface QuizAppProps {
  quizData: QuizAssignmentUI | null
}

export default function QuizClientWrapper({ quizData }: QuizAppProps) {

  const [currentScreen, setCurrentScreen] = useState<ScreenType>("welcome")
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const { user, setUser } = useAuth()
  const numberOfQsns = quizData?.questionPaper.questions.length || 0 // Initialize answers array when quiz data loads
  const totalScore = useRef<number>(0)
  const [userAttempt, setUserAttempt] = useState<{ quizId: number;qsnAttempts: Record<number, { answer: string; isCorrect: boolean }> } | null | undefined>(null)
  const [loading, setLoading] = useState<boolean>(false)

  let rules: any = quizData?.rules
  useEffect(() => {
    if (quizData) {

      // Set up time limit if specified
      if (rules.settings.time_limit_seconds > 0) {
        setTimeRemaining(rules.settings.time_limit_seconds)
      }

      // Determine initial screen based on enable_screens
      const enabledScreens = rules.settings.enable_screens
      if (enabledScreens.includes("welcome")) {
        setCurrentScreen("welcome")
      } else {
        setCurrentScreen("quiz")
      }

    }

  }, [])

  // Timer countdown
  useEffect(() => {

    if (timeRemaining !== null && timeRemaining > 0 && currentScreen === "quiz") {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev !== null && prev <= 1) {
            handleQuizComplete(numberOfQsns)
            return 0
          }
          return prev !== null ? prev - 1 : null
        })
      }, 1000)

      return () => clearInterval(timer)
    }

  }, [timeRemaining, currentScreen])

  async function fetchQuizAttempt() {
    setLoading(true);
    try {
      let res = await fetch(`/quiz/${quizData!.id}/${user!.id}/${rules.settings.time_limit_seconds}/attempt`)
      let data = await res.json()
      if (res.status == 404) {
        res = await fetch(`/quiz/${quizData!.id}/${user!.id}/attempt`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: "In progress" })
        })
        localStorage.removeItem("userAttempt") // Clear previous attempt if not found
        data = await res.json()
        if (res.ok) {
          const updatedUser={ ...user!, attemptedQuizzes: { ...user!.attemptedQuizzes, [quizData!.id]: { start: data.startedAt, score: 0 } } }
          setUser(updatedUser)
          localStorage.setItem("eduportal-user",JSON.stringify(updatedUser))
        }
      }//quiz is not attempted yet

      if (!res.ok) {
        throw new Error(data.error)
      }
      const attempts: Record<number, { answer: string; isCorrect: boolean }> = data?.data.attempts || {}
      const isPresent = localStorage.getItem("userAttempt")

      if (isPresent && JSON.parse(isPresent).quizId === quizData!.id)
        setUserAttempt(JSON.parse(isPresent))
      else {
        const newdata = {
          quizId: quizData!.id,
          qsnAttempts: attempts,
        }
        setUserAttempt(newdata)
        localStorage.setItem("userAttempt", JSON.stringify(newdata))
      }
    } catch (err) {
      console.error("Error fetching quiz attempt:", err)
      setUserAttempt(undefined)
    } finally {
      setLoading(false)
    }
  }

  const handleStartQuiz = () => {
    fetchQuizAttempt()
    setCurrentScreen("quiz")
  }

  const handleQuizComplete = async (totalQsns: number) => {
    const enabledScreens = rules.settings.enable_screens || []
    if (enabledScreens.includes("thank_you")) {
      setCurrentScreen("thank_you")
    } else {
      alert(rules.messages.success_text || "Quiz completed!")
    }
    try {
      let computed=user!.attemptedQuizzes[quizData!.id].score;
      let data = {
        score: computed,
        questionAttempts: userAttempt!.qsnAttempts,
        status:  "Completed",
        passed: computed >= 0.7,
      }
      const res = await fetch(`/quiz/${quizData!.id}/${user!.id}/submit`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });
      const res2 = await res.json()
      if (!res.ok) {
        throw new Error(res2.error || "Failed to save quiz attempt");
      }
      const updatedUser={ ...user!, completedQuizzes: { ...user!.completedQuizzes, [quizData!.id]: computed } }
      setUser(updatedUser);
      localStorage.setItem('eduportal-user',JSON.stringify(updatedUser))

    } catch (err) {
      console.error("Error saving quiz attempt:", err)
      toast({
        title: "Failed",
        description: "Something went wrong, answer couldn't be saved.",
        variant: "destructive",
      });
    }

  }

  const handleRestart = () => {
    if (quizData) {
      setTimeRemaining(rules.settings.time_limit_seconds > 0 ? rules.settings.time_limit_seconds : null)

      const enabledScreens = rules.settings.enable_screens || []
      if (enabledScreens.includes("welcome")) {
        setCurrentScreen("welcome")
      } else {
        setCurrentScreen("quiz")
      }
    }
  }

  if (loading) {
    return <Loading />
  }
  // Error state
  if (!quizData || userAttempt === undefined) {
    return (
      <NotFound resource="Quiz" />
    )
  }
  // Render appropriate screen
  switch (currentScreen) {
    case "welcome":
      return <WelcomeScreen name={quizData.title} welcomeData={rules.initial_screens.welcome} onStart={handleStartQuiz} />

    case "quiz":
      return (
        <QuizScreen
          quizData={quizData}
          onComplete={handleQuizComplete}
          timeRemaining={timeRemaining}
          totalPoints={totalScore}
          setUserAttempt={setUserAttempt}
          userAttempt={userAttempt}
        />
      )

    case "thank_you":
      return (
        <ThankYouScreen
          messages={rules.messages}
          onRestart={handleRestart}
          totalQuestions={numberOfQsns}
          attemptedQsns={Object.keys(userAttempt!.qsnAttempts).length}
        />
      )

    default:
      return null
  }
}
