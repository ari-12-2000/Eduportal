import { QuizController } from "@/controllers/quizController"
import { NextRequest } from "next/server"

export async function GET(req:NextRequest, {params}:{params:Promise<{assignmentId:string}>}){
   return QuizController.getAssignmentById({params})
}

export async function PUT(req:NextRequest, {params}:{params:Promise<{assignmentId:string}>}){
   return QuizController.updateAssignment(req,{params}) 
}

export async function DELETE(req:NextRequest, {params}:{params:Promise<{assignmentId:string}>}){
   return QuizController.deleteAssignment(req,{params}) 
}

