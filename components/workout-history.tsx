"use client"

import { useState } from "react"
import { useTraining } from "@/lib/training-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, Dumbbell } from "lucide-react"

export function WorkoutHistory() {
  const { state } = useTraining()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterExercise, setFilterExercise] = useState("all") // Updated default value
  const [sortBy, setSortBy] = useState("date-desc")

  const filteredSessions = state.sessions
    .filter((session) => {
      const plan = session.planId ? state.plans.find((p) => p.id === session.planId) : null
      const planName = plan ? plan.name.toLowerCase() : "custom workout"
      const matchesSearch = planName.includes(searchTerm.toLowerCase())

      if (filterExercise === "all") return matchesSearch

      const hasExercise = session.entries.some((entry) => entry.exerciseId === filterExercise)
      return matchesSearch && hasExercise
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        case "date-asc":
          return new Date(a.date).getTime() - new Date(b.date).getTime()
        default:
          return 0
      }
    })

  const getSessionStats = (session: any) => {
    const uniqueExercises = new Set(session.entries.map((entry: any) => entry.exerciseId)).size
    const totalSets = session.entries.length
    const totalVolume = session.entries.reduce((sum: number, entry: any) => sum + entry.weight * entry.reps, 0)

    return { uniqueExercises, totalSets, totalVolume }
  }

  const getExerciseHistory = (exerciseId: string) => {
    return state.sessions
      .flatMap((session) =>
        session.entries
          .filter((entry) => entry.exerciseId === exerciseId)
          .map((entry) => ({ ...entry, sessionDate: session.date })),
      )
      .sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime())
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Workout History</h2>
        <p className="text-muted-foreground">Track your progress and review past workouts</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search workouts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select value={filterExercise} onValueChange={setFilterExercise}>
          <SelectTrigger className="sm:max-w-xs">
            <SelectValue placeholder="Filter by exercise" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Exercises</SelectItem> {/* Updated value prop */}
            {state.exercises.map((exercise) => (
              <SelectItem key={exercise.id} value={exercise.id}>
                {exercise.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="sm:max-w-xs">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-desc">Newest First</SelectItem>
            <SelectItem value="date-asc">Oldest First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredSessions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Dumbbell className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No workout sessions found</h3>
            <p className="text-muted-foreground text-center">
              {state.sessions.length === 0
                ? "Start your first workout to see your history here."
                : "Try adjusting your search or filter criteria."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredSessions.map((session) => {
            const plan = session.planId ? state.plans.find((p) => p.id === session.planId) : null
            const stats = getSessionStats(session)

            return (
              <Card key={session.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{plan ? plan.name : "Custom Workout"}</CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(session.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {new Date(session.date).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="secondary">{stats.uniqueExercises} exercises</Badge>
                      <Badge variant="outline">{stats.totalSets} sets</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Total Volume:</span>
                        <div className="font-medium">{stats.totalVolume.toLocaleString()} lbs</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Exercises:</span>
                        <div className="font-medium">{stats.uniqueExercises}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total Sets:</span>
                        <div className="font-medium">{stats.totalSets}</div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      {Array.from(new Set(session.entries.map((entry) => entry.exerciseId))).map((exerciseId) => {
                        const exercise = state.exercises.find((ex) => ex.id === exerciseId)
                        const exerciseSets = session.entries.filter((entry) => entry.exerciseId === exerciseId)

                        if (!exercise) return null

                        return (
                          <div key={exerciseId}>
                            <div className="font-medium text-sm mb-2">{exercise.name}</div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                              {exerciseSets.map((entry, index) => (
                                <div key={index} className="text-xs bg-muted p-2 rounded">
                                  <div className="font-medium">Set {entry.setIndex}</div>
                                  <div>
                                    {entry.weight} × {entry.reps}
                                  </div>
                                  {entry.notes && (
                                    <div className="text-muted-foreground mt-1 truncate">{entry.notes}</div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
