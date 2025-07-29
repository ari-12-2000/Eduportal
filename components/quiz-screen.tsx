"use client"

import { useState, useEffect, useRef, type Dispatch, type SetStateAction } from "react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Clock, AlertTriangle, CheckCircle2, Circle, Send, Menu, ChevronUp, ChevronDown } from "lucide-react"
import type { QuizData, Question } from "@/app/page"

interface QuizScreenProps {
  quizData: QuizData
  answers: any[]
  setAnswers: Dispatch<SetStateAction<any[]>>
  onComplete: () => void
  timeRemaining: number | null
}

export default function QuizScreen({ quizData, answers, setAnswers, onComplete, timeRemaining }: QuizScreenProps) {
  const [timer, setTimer] = useState(0)
  const [activeQuestion, setActiveQuestion] = useState(0)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const questionRefs = useRef<(HTMLDivElement | null)[]>([])

  const questions = [...quizData.questions].sort(
    (a: Question, b: Question) => (a.id || a.question_id || 0) - (b.id || b.question_id || 0),
  )

  // Timer functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Intersection Observer to track active question
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = questionRefs.current.findIndex((ref) => ref === entry.target)
            if (index !== -1) {
              setActiveQuestion(index)
            }
          }
        })
      },
      { threshold: 0.5, rootMargin: "-100px 0px -100px 0px" },
    )

    questionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => observer.disconnect()
  }, [])

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const questionsAttempted = answers.filter((answer) => answer !== null && answer !== "").length

  // Handle answer changes with auto-navigation for single-answer questions
  const handleAnswerChange = (questionIndex: number, value: any) => {
    const newAnswers = [...answers]
    newAnswers[questionIndex] = value
    setAnswers(newAnswers)

    // Auto-advance for single-answer question types
    const question = questions[questionIndex]
    const isSingleAnswerType = question.question_type === "radio" || question.question_type === "slider"

    if (isSingleAnswerType && questionIndex < questions.length - 1) {
      // Add a small delay for better UX
      setTimeout(() => {
        const nextIndex = questionIndex + 1
        setActiveQuestion(nextIndex)
        questionRefs.current[nextIndex]?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }, 800) // 800ms delay
    }
  }

  // Handle multiple choice answers
  const handleMultipleChoiceChange = (questionIndex: number, optionValue: string, checked: boolean) => {
    const currentAnswer = answers[questionIndex] || []
    let newAnswer

    if (checked) {
      newAnswer = [...currentAnswer, optionValue]
    } else {
      newAnswer = currentAnswer.filter((item: string) => item !== optionValue)
    }

    const newAnswers = [...answers]
    newAnswers[questionIndex] = newAnswer
    setAnswers(newAnswers)
  }

  // Scroll to question
  const scrollToQuestion = (index: number) => {
    setActiveQuestion(index)
    setIsSheetOpen(false) // Close mobile sheet
    questionRefs.current[index]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })
  }

  // Navigate to previous/next question
  const navigateQuestion = (direction: "prev" | "next") => {
    const newIndex = direction === "prev" ? activeQuestion - 1 : activeQuestion + 1
    if (newIndex >= 0 && newIndex < questions.length) {
      scrollToQuestion(newIndex)
    }
  }

  // Get question text
  const getQuestionText = (question: Question) => {
    return question.question || question.Statements || ""
  }

  // Get options
  const getOptions = (question: Question) => {
    return question.options || question.Options || []
  }

  // Check if question is answered
  const isQuestionAnswered = (index: number) => {
    const answer = answers[index]
    return answer !== null && answer !== "" && answer !== undefined
  }

  // Render question navigation (used in both sidebar and mobile sheet)
  const renderQuestionNavigation = () => (
    <div className="space-y-2">
      {questions.map((question, index) => (
        <button
          key={index}
          onClick={() => scrollToQuestion(index)}
          className={`w-full text-left p-3 rounded-lg transition-all duration-200 flex items-center gap-3 ${
            activeQuestion === index
              ? "bg-blue-100 border-2 border-blue-300"
              : "hover:bg-gray-50 border-2 border-transparent"
          }`}
        >
          <div className="flex-shrink-0">
            {isQuestionAnswered(index) ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : (
              <Circle className="w-5 h-5 text-gray-300" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">Question {index + 1}</p>
            <p className="text-xs text-gray-500 truncate">{getQuestionText(question).substring(0, 40)}...</p>
          </div>
        </button>
      ))}
    </div>
  )

  // Render question
  const renderQuestion = (question: Question, questionIndex: number) => {
    const questionOptions = getOptions(question)

    switch (question.question_type) {
      case "radio":
        return (
          <RadioGroup
            value={answers[questionIndex] || ""}
            onValueChange={(value) => handleAnswerChange(questionIndex, value)}
            className="space-y-3"
          >
            {questionOptions.map((option, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-4 rounded-xl border-2 border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all duration-200 cursor-pointer"
              >
                <RadioGroupItem
                  value={option.value}
                  id={`q${questionIndex}-option-${index}`}
                  className="text-blue-600"
                />
                <Label
                  htmlFor={`q${questionIndex}-option-${index}`}
                  className="flex-1 cursor-pointer text-gray-700 font-medium"
                >
                  {option.value}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )

      case "checkbox":
        return (
          <div className="space-y-3">
            {questionOptions.map((option, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-4 rounded-xl border-2 border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all duration-200 cursor-pointer"
              >
                <Checkbox
                  id={`q${questionIndex}-option-${index}`}
                  checked={(answers[questionIndex] || []).includes(option.value)}
                  onCheckedChange={(checked) =>
                    handleMultipleChoiceChange(questionIndex, option.value, checked as boolean)
                  }
                  className="text-blue-600"
                />
                <Label
                  htmlFor={`q${questionIndex}-option-${index}`}
                  className="flex-1 cursor-pointer text-gray-700 font-medium"
                >
                  {option.value}
                </Label>
              </div>
            ))}
          </div>
        )

      case "textual":
      case "fill_in_the_blank":
        return (
          <div className="space-y-3">
            <Input
              placeholder="Enter your answer..."
              value={answers[questionIndex] || ""}
              onChange={(e) => handleAnswerChange(questionIndex, e.target.value)}
              className="p-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0"
            />
          </div>
        )

      case "slider":
        const config = question.config
        const minValue = config?.min_value || 0
        const maxValue = config?.max_value || 10
        const defaultValue = config?.default_value || 1
        const stepValue = config?.step_value || 1

        return (
          <div className="space-y-6 p-6 bg-gray-50 rounded-xl">
            <div className="flex justify-between text-sm text-gray-600 font-medium">
              <span>{config?.min_text || `${minValue}`}</span>
              <span>{config?.max_text || `${maxValue}`}</span>
            </div>
            <Slider
              value={[answers[questionIndex] || defaultValue]}
              max={maxValue}
              min={minValue}
              step={stepValue}
              onValueChange={(value) => {
                handleAnswerChange(questionIndex, value[0])
              }}
              className="my-6"
            />
            <div className="text-center">
              <span className="text-2xl font-bold text-blue-600">{answers[questionIndex] || defaultValue}</span>
            </div>
          </div>
        )

      default:
        return (
          <div className="p-4 bg-gray-100 rounded-xl">
            <p className="text-gray-600">Question type "{question.question_type}" not supported</p>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="flex">
        {/* Desktop Sidebar - Hidden on mobile */}
        <div className="hidden md:block w-80 bg-white shadow-xl border-r border-gray-200 min-h-screen sticky top-0">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Trust Index Survey</h2>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{formatTime(timer)}</span>
              </div>
              {timeRemaining !== null && (
                <div className={`flex items-center gap-2 ${timeRemaining < 60 ? "text-red-600" : "text-orange-600"}`}>
                  <AlertTriangle className="w-4 h-4" />
                  <span>{formatTime(timeRemaining)}</span>
                </div>
              )}
            </div>
            <div className="mt-4 bg-gray-100 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(questionsAttempted / questions.length) * 100}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {questionsAttempted} of {questions.length} completed
            </p>
          </div>

          <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">{renderQuestionNavigation()}</div>

          <div className="p-6 border-t border-gray-200">
            <Button
              onClick={onComplete}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Send className="w-4 h-4 mr-2" />
              Submit Survey
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Mobile Header */}
          <div className="md:hidden sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Menu className="w-4 h-4 mr-2" />
                      Questions
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <div className="py-6">
                      <h2 className="text-lg font-bold text-gray-800 mb-4">Survey Progress</h2>
                      <div className="mb-6">
                        <div className="bg-gray-100 rounded-full h-2 mb-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(questionsAttempted / questions.length) * 100}%` }}
                          />
                        </div>
                        <p className="text-sm text-gray-600">
                          {questionsAttempted} of {questions.length} completed
                        </p>
                      </div>
                      <div className="max-h-[60vh] overflow-y-auto">{renderQuestionNavigation()}</div>
                    </div>
                  </SheetContent>
                </Sheet>
                <div className="text-sm text-gray-600">
                  Question {activeQuestion + 1} of {questions.length}
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatTime(timer)}</span>
                </div>
                {timeRemaining !== null && (
                  <div className={`flex items-center gap-1 ${timeRemaining < 60 ? "text-red-600" : "text-orange-600"}`}>
                    <AlertTriangle className="w-4 h-4" />
                    <span>{formatTime(timeRemaining)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Questions Content */}
          <div className="p-4 md:p-8 max-h-screen overflow-y-auto">
            <div className="max-w-4xl mx-auto space-y-8 md:space-y-12">
              {questions.map((question, index) => (
                <div
                  key={index}
                  ref={(el) => (questionRefs.current[index] = el)}
                  className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100"
                >
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium text-gray-500">
                        Question {index + 1} of {questions.length}
                      </span>
                    </div>
                    <h3 className="text-lg md:text-xl font-semibold text-gray-800 leading-relaxed">
                      {getQuestionText(question)}
                    </h3>
                  </div>

                  <div className="space-y-4">{renderQuestion(question, index)}</div>
                </div>
              ))}
            </div>

            {/* Mobile Navigation & Submit */}
            <div className="md:hidden sticky bottom-0 bg-white border-t border-gray-200 p-4 mt-8">
              <div className="flex items-center justify-between gap-4">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateQuestion("prev")}
                    disabled={activeQuestion === 0}
                  >
                    <ChevronUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateQuestion("next")}
                    disabled={activeQuestion === questions.length - 1}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  onClick={onComplete}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 py-2 rounded-lg font-semibold"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Submit
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
