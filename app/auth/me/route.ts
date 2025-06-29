import { AuthController } from "@/controllers/authController";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    return AuthController.refreshUser(req);
}