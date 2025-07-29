import { LearnerController } from "@/controllers/learnerController";
import { NextRequest } from "next/server";


export async function POST(req: NextRequest) {
    return LearnerController.createQuizProgress(req);
}