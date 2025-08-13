import { LearnerController } from "@/controllers/learnerController";
import { NextRequest} from "next/server";

export async function POST(req:NextRequest, {params}:{params:Promise<{assignmentId:string, learnerId:string}>}) {
    return LearnerController.saveQuizAttempt(req, {params})
}