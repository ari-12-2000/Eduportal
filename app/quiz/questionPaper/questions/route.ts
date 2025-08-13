import { QuizController } from "@/controllers/quizController";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    return QuizController.addQuestionToPaper(req);
}