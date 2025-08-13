import { QuizController } from "@/controllers/quizController";
import { NextRequest } from "next/server";

export async function POST(req:NextRequest){
   return QuizController.createQuestionPaper(req);
}

export async function DELETE(req:NextRequest){
    return QuizController.deleteQuestionPaper(req)
}