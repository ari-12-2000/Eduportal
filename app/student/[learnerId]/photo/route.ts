import { LearnerController } from "@/controllers/learnerController";
import { NextRequest } from "next/server";

export async function PUT(req:NextRequest,{params}:{params:Promise<{learnerId:string}>}){
   return LearnerController.updateProfilePhoto(req,{params})
}

export async function DELETE(req:NextRequest,{params}:{params:Promise<{learnerId:string}>}){
    return LearnerController.deleteProfilePhoto({params})
}