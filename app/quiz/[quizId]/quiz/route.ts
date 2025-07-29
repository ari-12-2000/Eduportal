import { NextResponse } from "next/server"
import quizData from "../json/quiz.json"

export async function GET() {
  try {
    return NextResponse.json(quizData)
  } catch (error) {
    console.error("Error loading quiz data:", error)
    return NextResponse.json({ error: "Failed to load quiz data" }, { status: 500 })
  }
}
