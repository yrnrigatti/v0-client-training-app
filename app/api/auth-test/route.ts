import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-simple"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    return NextResponse.json({
      success: true,
      session: session,
      message: "Auth test successful",
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
