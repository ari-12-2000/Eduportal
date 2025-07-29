"use client"

import { useEffect, useState } from "react"
import QuizApp from "@/components/quiz-app"

export interface QuizData {
  settings: {
    exam_models: string
    enable_screens: string[]
    time_mode: string
    wrong_question: string
    result_mode: string
    time_limit_seconds: number
    question_per_screen: number
  }
  messages: {
    thanks: string
    sorry: string
    success_text: string
    error_text: string
    exists_text: string
  }
  initial_screens: {
    welcome: {
      greeting: string
      text: string
      welcome_button: string
    }
  }
  questions: Question[]
}

export interface Question {
  question_id?: number
  id?: number
  question?: string
  Statements?: string
  question_type: string
  answer: number | string
  options?: Option[] | null
  Options?: Option[] | null
  config?: {
    min_text?: string
    max_text?: string
    max_value?: number
    min_value?: number
    default_value?: number
    step_value?: number
  } | null
}

export interface Option {
  option_id: string | number
  value: string
}

export default function Home() {
  const [quizData, setQuizData] = useState<QuizData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const res = await fetch("/quiz")
        if (!res.ok) {
          throw new Error("Failed to fetch quiz data")
        }
        const data = await res.json()
        setQuizData(data)
      } catch (err) {
        console.error("Error fetching quiz data:", err)
        setError("Failed to load quiz data")
      } finally {
        setLoading(false)
      }
    }
    fetchQuizData()
  }, [])

  return <QuizApp quizData={quizData} loading={loading} error={error} />
}
