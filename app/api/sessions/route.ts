import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { z } from "zod"

const entrySchema = z.object({
  exerciseId: z.string().uuid(),
  setIndex: z.number().int().positive(),
  weight: z.number().positive(),
  reps: z.number().int().positive(),
  notes: z.string().optional(),
})

const sessionSchema = z.object({
  date: z.string().datetime(),
  planId: z.string().uuid().optional(),
  entries: z.array(entrySchema),
})

export async function GET() {
  try {
    const sessions = await sql`
      SELECT 
        ws.id,
        ws.date,
        ws.plan_id as "planId",
        COALESCE(
          json_agg(
            json_build_object(
              'exerciseId', se.exercise_id,
              'setIndex', se.set_index,
              'weight', se.weight,
              'reps', se.reps,
              'notes', se.notes
            ) ORDER BY se.set_index
          ) FILTER (WHERE se.id IS NOT NULL),
          '[]'::json
        ) as entries
      FROM workout_sessions ws
      LEFT JOIN session_entries se ON ws.id = se.session_id
      GROUP BY ws.id, ws.date, ws.plan_id
      ORDER BY ws.date DESC
    `

    return NextResponse.json({
      success: true,
      data: sessions,
    })
  } catch (error: any) {
    console.error("Failed to fetch sessions:", error)

    // If table doesn't exist, return empty array instead of error
    if (error.message?.includes('relation "workout_sessions" does not exist')) {
      return NextResponse.json({
        success: true,
        data: [],
        message: "Database not initialized",
      })
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch sessions",
        error: error.message,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = sessionSchema.parse(body)

    console.log("Creating session:", validatedData)

    // Create the workout session first
    const [session] = await sql`
      INSERT INTO workout_sessions (date, plan_id)
      VALUES (${validatedData.date}, ${validatedData.planId || null})
      RETURNING id, date, plan_id as "planId"
    `

    console.log("Created session:", session)

    // Insert session entries one by one to avoid bulk insert issues
    const entries = []
    for (const entry of validatedData.entries) {
      const [insertedEntry] = await sql`
        INSERT INTO session_entries (session_id, exercise_id, set_index, weight, reps, notes)
        VALUES (
          ${session.id}, 
          ${entry.exerciseId}, 
          ${entry.setIndex}, 
          ${entry.weight}, 
          ${entry.reps}, 
          ${entry.notes || null}
        )
        RETURNING 
          exercise_id as "exerciseId",
          set_index as "setIndex",
          weight,
          reps,
          notes
      `
      entries.push(insertedEntry)
    }

    console.log("Created entries:", entries)

    // Return the complete session with entries
    const completeSession = {
      id: session.id,
      date: session.date,
      planId: session.planId,
      entries: entries,
    }

    console.log("Complete session:", completeSession)

    return NextResponse.json(
      {
        success: true,
        data: completeSession,
      },
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: "Invalid input", errors: error.errors }, { status: 400 })
    }

    console.error("Failed to create session:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create session",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
