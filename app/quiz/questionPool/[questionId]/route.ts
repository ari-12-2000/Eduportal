import { QuizController } from "@/controllers/quizController"
import { NextRequest } from "next/server"

export async function PUT(req:NextRequest, {params}:{params:Promise<{questionId:string}>}){
   return QuizController.updateQuestion(req,{params}) 
}

export async function DELETE(req:NextRequest, {params}:{params:Promise<{questionId:string}>}){
   return QuizController.deleteQuestion(req,{params}) 
}