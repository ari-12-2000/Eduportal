import { LearnerController } from "@/controllers/learnerController";
import { NextRequest} from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ assignmentId: string , learnerId:string, timeLimit:string}> }) {
    return LearnerController.getQuizAttempt({params});
}
