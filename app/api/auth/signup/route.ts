import { AuthController } from "@/controllers/authController"
import { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  return AuthController.signup(req)
}
