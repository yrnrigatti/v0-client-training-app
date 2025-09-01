import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { z } from "zod"

const exerciseUpdateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  category: z.string().min(1).max(100).optional(),
  muscleGroup: z.string().min(1).max(100).optional(),
})

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const [exercise] = await sql`
      SELECT 
        id,
        name,
        category,
        muscle_group as "muscleGroup",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM exercises 
      WHERE id = ${params.id}
    `

    if (!exercise) {
      return NextResponse.json({ success: false, message: "Exercise not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: exercise,
    })
  } catch (error) {
    console.error("Failed to fetch exercise:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch exercise" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const validatedData = exerciseUpdateSchema.parse(body)

    console.log("Updating exercise:", params.id, validatedData)

    // Check if exercise exists first
    const [existingExercise] = await sql`
      SELECT id, name, category, muscle_group as "muscleGroup" FROM exercises WHERE id = ${params.id}
    `

    if (!existingExercise) {
      console.log("Exercise not found:", params.id)
      return NextResponse.json({ success: false, message: "Exercise not found" }, { status: 404 })
    }

    console.log("Existing exercise:", existingExercise)

    // Prepare the data to update, using existing values as defaults
    const updateData = {
      name: validatedData.name ?? existingExercise.name,
      category: validatedData.category ?? existingExercise.category,
      muscleGroup: validatedData.muscleGroup ?? existingExercise.muscleGroup,
    }

    console.log("Update data:", updateData)

    // Perform the update using a simple, reliable query
    const [updatedExercise] = await sql`
      UPDATE exercises 
      SET 
        name = ${updateData.name},
        category = ${updateData.category},
        muscle_group = ${updateData.muscleGroup},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${params.id}
      RETURNING 
        id,
        name,
        category,
        muscle_group as "muscleGroup",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `

    console.log("Updated exercise result:", updatedExercise)

    if (!updatedExercise) {
      console.error("No exercise returned from update query")
      return NextResponse.json({ success: false, message: "Failed to update exercise" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: updatedExercise,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: "Invalid input", errors: error.errors }, { status: 400 })
    }

    console.error("Failed to update exercise:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update exercise",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const [deletedExercise] = await sql`
      DELETE FROM exercises 
      WHERE id = ${params.id}
      RETURNING id
    `

    if (!deletedExercise) {
      return NextResponse.json({ success: false, message: "Exercise not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Exercise deleted successfully",
    })
  } catch (error) {
    console.error("Failed to delete exercise:", error)
    return NextResponse.json({ success: false, message: "Failed to delete exercise" }, { status: 500 })
  }
}
