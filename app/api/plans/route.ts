import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { z } from "zod"

const planSchema = z.object({
  name: z.string().min(1).max(255),
  exerciseIds: z.array(z.string().uuid()),
})

export async function GET() {
  try {
    const plans = await sql`
      SELECT 
        id,
        name,
        exercise_ids as "exerciseIds",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM workout_plans 
      ORDER BY created_at DESC
    `

    return NextResponse.json({
      success: true,
      data: plans,
    })
  } catch (error: any) {
    console.error("Failed to fetch plans:", error)

    // If table doesn't exist, return empty array instead of error
    if (error.message?.includes('relation "workout_plans" does not exist')) {
      return NextResponse.json({
        success: true,
        data: [],
        message: "Database not initialized",
      })
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch plans",
        error: error.message,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = planSchema.parse(body)

    const [plan] = await sql`
      INSERT INTO workout_plans (name, exercise_ids)
      VALUES (${validatedData.name}, ${validatedData.exerciseIds})
      RETURNING 
        id,
        name,
        exercise_ids as "exerciseIds",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `

    return NextResponse.json(
      {
        success: true,
        data: plan,
      },
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: "Invalid input", errors: error.errors }, { status: 400 })
    }

    console.error("Failed to create plan:", error)
    return NextResponse.json({ success: false, message: "Failed to create plan" }, { status: 500 })
  }
}
