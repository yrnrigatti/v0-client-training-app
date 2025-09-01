"use client"

import { useState } from "react"
import { useTraining, type Session, type Entry } from "@/lib/training-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Play, Square, Plus } from "lucide-react"
import { apiClient } from "@/lib/api-client"

export function WorkoutSession() {
  const { state, dispatch } = useTraining()
  const [selectedPlanId, setSelectedPlanId] = useState<string>("")
  const [sessionStarted, setSessionStarted] = useState(false)
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [currentSet, setCurrentSet] = useState(1)
  const [weight, setWeight] = useState("")
  const [reps, setReps] = useState("")
  const [notes, setNotes] = useState("")
  const [sessionEntries, setSessionEntries] = useState<Entry[]>([])
  const [isFinishing, setIsFinishing] = useState(false)

  const currentPlan = selectedPlanId ? state.plans.find((p) => p.id === selectedPlanId) : null
  const currentExercises = currentPlan
    ? currentPlan.exerciseIds.map((id) => state.exercises.find((ex) => ex.id === id)).filter(Boolean)
    : []
  const currentExercise = currentExercises[currentExerciseIndex]

  const startSession = () => {
    if (!selectedPlanId && currentExercises.length === 0) return

    const session: Session = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      planId: selectedPlanId || undefined,
      entries: [],
    }

    dispatch({ type: "START_SESSION", payload: session })
    setSessionStarted(true)
    setCurrentExerciseIndex(0)
    setCurrentSet(1)
    setSessionEntries([])
  }

  const addSet = () => {
    if (!currentExercise || !weight || !reps) return

    const entry: Entry = {
      exerciseId: currentExercise.id,
      setIndex: currentSet,
      weight: Number.parseFloat(weight),
      reps: Number.parseInt(reps),
      notes: notes || undefined,
    }

    setSessionEntries((prev) => [...prev, entry])
    setCurrentSet((prev) => prev + 1)
    setWeight("")
    setReps("")
    setNotes("")
  }

  const nextExercise = () => {
    if (currentExerciseIndex < currentExercises.length - 1) {
      setCurrentExerciseIndex((prev) => prev + 1)
      setCurrentSet(1)
    }
  }

  const previousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex((prev) => prev - 1)
      setCurrentSet(1)
    }
  }

  const finishSession = async () => {
    if (!state.activeSession) return

    setIsFinishing(true)
    try {
      console.log("Finishing session with entries:", sessionEntries)

      const sessionData = {
        date: state.activeSession.date,
        planId: state.activeSession.planId,
        entries: sessionEntries,
      }

      console.log("Session data to save:", sessionData)

      const savedSession = await apiClient.createSession(sessionData)
      console.log("Saved session:", savedSession)

      dispatch({ type: "ADD_SESSION", payload: savedSession })
      dispatch({ type: "END_SESSION" })

      setSessionStarted(false)
      setSelectedPlanId("")
      setCurrentExerciseIndex(0)
      setCurrentSet(1)
      setSessionEntries([])
      setWeight("")
      setReps("")
      setNotes("")
    } catch (error) {
      console.error("Failed to save session:", error)
      alert(`Failed to save session: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsFinishing(false)
    }
  }

  const getCurrentExerciseSets = () => {
    return sessionEntries.filter((entry) => entry.exerciseId === currentExercise?.id)
  }

  if (!sessionStarted) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Start Workout</h2>
          <p className="text-muted-foreground">Choose a workout plan or create a custom session</p>
        </div>

        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Select Workout Plan</CardTitle>
            <CardDescription>Choose from your saved workout plans</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {state.plans.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  No workout plans available. Create a plan first or start a custom workout.
                </p>
                <Button variant="outline" onClick={() => dispatch({ type: "SET_VIEW", payload: "plans" })}>
                  Create Workout Plan
                </Button>
              </div>
            ) : (
              <>
                <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a workout plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {state.plans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name} ({plan.exerciseIds.length} exercises)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedPlanId && (
                  <div className="space-y-2">
                    <Label>Exercises in this plan:</Label>
                    <div className="space-y-1">
                      {currentExercises.map((exercise, index) => (
                        <div key={exercise?.id} className="text-sm text-muted-foreground">
                          {index + 1}. {exercise?.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button onClick={startSession} disabled={!selectedPlanId} className="w-full">
                  <Play className="h-4 w-4 mr-2" />
                  Start Workout
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Active Workout</h2>
          <p className="text-muted-foreground">{currentPlan ? currentPlan.name : "Custom Workout"}</p>
        </div>
        <Button variant="destructive" onClick={finishSession} disabled={isFinishing}>
          <Square className="h-4 w-4 mr-2" />
          {isFinishing ? "Saving..." : "Finish Workout"}
        </Button>
      </div>

      {currentExercise && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{currentExercise.name}</CardTitle>
                  <CardDescription>
                    Exercise {currentExerciseIndex + 1} of {currentExercises.length}
                  </CardDescription>
                </div>
                <div className="flex gap-1">
                  <Badge variant="secondary">{currentExercise.category}</Badge>
                  <Badge variant="outline">{currentExercise.muscleGroup}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="weight">Weight (lbs/kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="reps">Reps</Label>
                  <Input
                    id="reps"
                    type="number"
                    value={reps}
                    onChange={(e) => setReps(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="How did this set feel?"
                  rows={2}
                />
              </div>

              <Button onClick={addSet} disabled={!weight || !reps} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Set {currentSet}
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={previousExercise}
                  disabled={currentExerciseIndex === 0}
                  className="flex-1 bg-transparent"
                >
                  Previous Exercise
                </Button>
                <Button
                  variant="outline"
                  onClick={nextExercise}
                  disabled={currentExerciseIndex === currentExercises.length - 1}
                  className="flex-1 bg-transparent"
                >
                  Next Exercise
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Exercise Sets</CardTitle>
              <CardDescription>Sets completed for {currentExercise.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {getCurrentExerciseSets().map((entry, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="font-medium">Set {entry.setIndex}</span>
                    <span>
                      {entry.weight} × {entry.reps}
                    </span>
                  </div>
                ))}
                {getCurrentExerciseSets().length === 0 && (
                  <p className="text-muted-foreground text-center py-4">No sets recorded yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Session Summary</CardTitle>
          <CardDescription>All exercises and sets in this workout</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentExercises.map((exercise, index) => {
              const exerciseSets = sessionEntries.filter((entry) => entry.exerciseId === exercise?.id)
              return (
                <div key={exercise?.id}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">{exercise?.name}</span>
                    {index === currentExerciseIndex && <Badge variant="default">Current</Badge>}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 ml-4">
                    {exerciseSets.map((entry, setIndex) => (
                      <div key={setIndex} className="text-sm bg-muted p-2 rounded">
                        Set {entry.setIndex}: {entry.weight} × {entry.reps}
                      </div>
                    ))}
                    {exerciseSets.length === 0 && <div className="text-sm text-muted-foreground">No sets yet</div>}
                  </div>
                  {index < currentExercises.length - 1 && <Separator className="mt-4" />}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
