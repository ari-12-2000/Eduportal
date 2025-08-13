import QuizClientWrapper from "@/components/quiz-client-wrapper"
import {QuizAssignmentUI} from "@/types/quiz"

export default async function QuizPage({ params }: { params: Promise<{ assignmentId: string }> }) {
  const { assignmentId } = await params
  let quizData: QuizAssignmentUI | null = null


  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/quiz/assignments/${assignmentId}`, {
      cache: "no-store" // for SSR
    })
    let data = await res.json()
    if (!res.ok) {
      throw new Error(data.error)
    }
    quizData = data?.data;

  } catch (err) {
    console.error("Error fetching quiz data:", err)
  }

  return (
    <QuizClientWrapper
      quizData={quizData}
    />
  )
}
