import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { z } from "zod"

const planUpdateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  exerciseIds: z.array(z.string().uuid()).optional(),
})

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const [plan] = await sql`
      SELECT 
        id,
        name,
        exercise_ids as "exerciseIds",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM workout_plans 
      WHERE id = ${params.id}
    `

    if (!plan) {
      return NextResponse.json({ success: false, message: "Plan not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: plan,
    })
  } catch (error) {
    console.error("Failed to fetch plan:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch plan" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const validatedData = planUpdateSchema.parse(body)

    console.log("Updating plan:", params.id, validatedData)

    // Check if plan exists first
    const [existingPlan] = await sql`
      SELECT id, name, exercise_ids as "exerciseIds" FROM workout_plans WHERE id = ${params.id}
    `

    if (!existingPlan) {
      console.log("Plan not found:", params.id)
      return NextResponse.json({ success: false, message: "Plan not found" }, { status: 404 })
    }

    console.log("Existing plan:", existingPlan)

    // Prepare the data to update, using existing values as defaults
    const updateData = {
      name: validatedData.name ?? existingPlan.name,
      exerciseIds: validatedData.exerciseIds ?? existingPlan.exerciseIds,
    }

    console.log("Update data:", updateData)

    // Perform the update using a simple, reliable query
    const [updatedPlan] = await sql`
      UPDATE workout_plans 
      SET 
        name = ${updateData.name},
        exercise_ids = ${updateData.exerciseIds},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${params.id}
      RETURNING 
        id,
        name,
        exercise_ids as "exerciseIds",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `

    console.log("Updated plan result:", updatedPlan)

    if (!updatedPlan) {
      console.error("No plan returned from update query")
      return NextResponse.json({ success: false, message: "Failed to update plan" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: updatedPlan,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: "Invalid input", errors: error.errors }, { status: 400 })
    }

    console.error("Failed to update plan:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update plan",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const [deletedPlan] = await sql`
      DELETE FROM workout_plans 
      WHERE id = ${params.id}
      RETURNING id
    `

    if (!deletedPlan) {
      return NextResponse.json({ success: false, message: "Plan not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Plan deleted successfully",
    })
  } catch (error) {
    console.error("Failed to delete plan:", error)
    return NextResponse.json({ success: false, message: "Failed to delete plan" }, { status: 500 })
  }
}
