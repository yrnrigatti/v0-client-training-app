import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required")
}

export const sql = neon(process.env.DATABASE_URL)

// Database initialization
export async function initializeDatabase() {
  try {
    console.log("Initializing database...")

    // Create exercises table
    await sql`
      CREATE TABLE IF NOT EXISTS exercises (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL UNIQUE,
        category VARCHAR(100) NOT NULL,
        muscle_group VARCHAR(100) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create workout plans table
    await sql`
      CREATE TABLE IF NOT EXISTS workout_plans (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        exercise_ids TEXT[] NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create workout sessions table
    await sql`
      CREATE TABLE IF NOT EXISTS workout_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        date TIMESTAMPTZ NOT NULL,
        plan_id UUID REFERENCES workout_plans(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create session entries table
    await sql`
      CREATE TABLE IF NOT EXISTS session_entries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id UUID NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
        exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
        set_index INTEGER NOT NULL,
        weight DECIMAL(6,2) NOT NULL,
        reps INTEGER NOT NULL,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create indexes for better performance
    await sql`CREATE INDEX IF NOT EXISTS idx_exercises_category ON exercises(category)`
    await sql`CREATE INDEX IF NOT EXISTS idx_exercises_muscle_group ON exercises(muscle_group)`
    await sql`CREATE INDEX IF NOT EXISTS idx_sessions_date ON workout_sessions(date)`
    await sql`CREATE INDEX IF NOT EXISTS idx_entries_session_id ON session_entries(session_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_entries_exercise_id ON session_entries(exercise_id)`

    console.log("Database initialized successfully")
    return { success: true, message: "Database initialized successfully" }
  } catch (error) {
    console.error("Failed to initialize database:", error)
    throw new Error(`Database initialization failed: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}
