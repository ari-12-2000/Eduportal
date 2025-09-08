import { NextRequest } from "next/server"
import { AuthController } from "@/controllers/authController"

export async function GET(req: NextRequest) {
  const rawEmail = req.nextUrl.searchParams.get("email") || ""
  const email = decodeURIComponent(rawEmail)   // %40 → @
  return AuthController.getUserData( email )
}