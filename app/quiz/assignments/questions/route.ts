import { QuizController } from "@/controllers/quizController";
import { NextRequest } from "next/server";

export async function POST(req:NextRequest){
   return QuizController.addAssignmentQuestion(req);
}

export async function DELETE(req:NextRequest){
    return QuizController.deleteAssignmentQuestion(req)
}