import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { z } from "zod"

const exerciseSchema = z.object({
  name: z.string().min(1).max(255),
  category: z.string().min(1).max(100),
  muscleGroup: z.string().min(1).max(100),
})

export async function GET() {
  try {
    const exercises = await sql`
      SELECT 
        id,
        name,
        category,
        muscle_group as "muscleGroup",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM exercises 
      ORDER BY created_at DESC
    `

    return NextResponse.json({
      success: true,
      data: exercises,
    })
  } catch (error: any) {
    console.error("Failed to fetch exercises:", error)

    // If table doesn't exist, return empty array instead of error
    if (error.message?.includes('relation "exercises" does not exist')) {
      return NextResponse.json({
        success: true,
        data: [],
        message: "Database not initialized",
      })
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch exercises",
        error: error.message,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = exerciseSchema.parse(body)

    const [exercise] = await sql`
      INSERT INTO exercises (name, category, muscle_group)
      VALUES (${validatedData.name}, ${validatedData.category}, ${validatedData.muscleGroup})
      RETURNING 
        id,
        name,
        category,
        muscle_group as "muscleGroup",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `

    return NextResponse.json(
      {
        success: true,
        data: exercise,
      },
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: "Invalid input", errors: error.errors }, { status: 400 })
    }

    console.error("Failed to create exercise:", error)
    return NextResponse.json({ success: false, message: "Failed to create exercise" }, { status: 500 })
  }
}
