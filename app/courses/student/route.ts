import { LearnerController } from "@/controllers/learnerController";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    return LearnerController.enrolInCourses(req);
}

export async function GET(req: NextRequest) {
    const programId= req.nextUrl.searchParams.get("programId");
    return LearnerController.checkEnrollment(Number(programId));
}