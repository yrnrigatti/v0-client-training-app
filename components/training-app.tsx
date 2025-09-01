"use client"

import { useTraining } from "@/lib/training-context"
import { Navigation } from "./navigation"
import { Dashboard } from "./dashboard"
import { ExerciseManager } from "./exercise-manager"
import { PlanManager } from "./plan-manager"
import { WorkoutSession } from "./workout-session"
import { WorkoutHistory } from "./workout-history"

export function TrainingApp() {
  const { state } = useTraining()

  const renderCurrentView = () => {
    switch (state.currentView) {
      case "dashboard":
        return <Dashboard />
      case "exercises":
        return <ExerciseManager />
      case "plans":
        return <PlanManager />
      case "workout":
        return <WorkoutSession />
      case "history":
        return <WorkoutHistory />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-6">{renderCurrentView()}</main>
    </div>
  )
}
