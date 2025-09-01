"use client"

import type React from "react"

import { useState } from "react"
import { useTraining, type Plan } from "@/lib/training-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Edit, Trash2, GripVertical } from "lucide-react"
import { apiClient } from "@/lib/api-client"

export function PlanManager() {
  const { state, dispatch } = useTraining()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [planName, setPlanName] = useState("")
  const [selectedExercises, setSelectedExercises] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const filteredPlans = state.plans.filter((plan) => plan.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!planName || selectedExercises.length === 0) return

    setIsLoading(true)
    try {
      if (editingPlan) {
        console.log("Updating plan:", editingPlan.id, { name: planName, exerciseIds: selectedExercises })
        const updatedPlan = await apiClient.updatePlan(editingPlan.id, {
          name: planName,
          exerciseIds: selectedExercises,
        })
        dispatch({ type: "UPDATE_PLAN", payload: updatedPlan })
      } else {
        console.log("Creating plan:", { name: planName, exerciseIds: selectedExercises })
        const newPlan = await apiClient.createPlan({
          name: planName,
          exerciseIds: selectedExercises,
        })
        dispatch({ type: "ADD_PLAN", payload: newPlan })
      }

      resetForm()
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Failed to save plan:", error)
      alert(`Failed to save plan: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (plan: Plan) => {
    console.log("Editing plan:", plan)
    setEditingPlan(plan)
    setPlanName(plan.name)
    setSelectedExercises([...plan.exerciseIds])
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this plan?")) return

    try {
      console.log("Deleting plan:", id)
      await apiClient.deletePlan(id)
      dispatch({ type: "DELETE_PLAN", payload: id })
    } catch (error) {
      console.error("Failed to delete plan:", error)
      alert(`Failed to delete plan: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const resetForm = () => {
    setPlanName("")
    setSelectedExercises([])
    setEditingPlan(null)
  }

  const toggleExercise = (exerciseId: string) => {
    setSelectedExercises((prev) =>
      prev.includes(exerciseId) ? prev.filter((id) => id !== exerciseId) : [...prev, exerciseId],
    )
  }

  const moveExercise = (fromIndex: number, toIndex: number) => {
    const newOrder = [...selectedExercises]
    const [moved] = newOrder.splice(fromIndex, 1)
    newOrder.splice(toIndex, 0, moved)
    setSelectedExercises(newOrder)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Workout Plans</h2>
          <p className="text-muted-foreground">Create and manage your workout routines</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Create Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPlan ? "Edit Workout Plan" : "Create New Workout Plan"}</DialogTitle>
              <DialogDescription>
                {editingPlan ? "Update your workout plan." : "Build a custom workout routine."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="planName">Plan Name</Label>
                  <Input
                    id="planName"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    placeholder="e.g., Upper Body Strength"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Select Exercises</Label>
                  {state.exercises.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No exercises available. Create some exercises first.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-2">
                      {state.exercises.map((exercise) => (
                        <div key={exercise.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={exercise.id}
                            checked={selectedExercises.includes(exercise.id)}
                            onCheckedChange={() => toggleExercise(exercise.id)}
                            disabled={isLoading}
                          />
                          <Label htmlFor={exercise.id} className="flex-1 cursor-pointer">
                            <div className="flex items-center justify-between">
                              <span>{exercise.name}</span>
                              <div className="flex gap-1">
                                <Badge variant="secondary" className="text-xs">
                                  {exercise.category}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {exercise.muscleGroup}
                                </Badge>
                              </div>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {selectedExercises.length > 0 && (
                  <div className="grid gap-2">
                    <Label>Exercise Order</Label>
                    <div className="space-y-2 border rounded-md p-2">
                      {selectedExercises.map((exerciseId, index) => {
                        const exercise = state.exercises.find((ex) => ex.id === exerciseId)
                        if (!exercise) return null

                        return (
                          <div key={exerciseId} className="flex items-center gap-2 p-2 bg-muted rounded">
                            <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                            <span className="flex-1">{exercise.name}</span>
                            <div className="flex gap-1">
                              {index > 0 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => moveExercise(index, index - 1)}
                                  disabled={isLoading}
                                >
                                  ↑
                                </Button>
                              )}
                              {index < selectedExercises.length - 1 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => moveExercise(index, index + 1)}
                                  disabled={isLoading}
                                >
                                  ↓
                                </Button>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button type="submit" disabled={!planName || selectedExercises.length === 0 || isLoading}>
                  {isLoading ? "Saving..." : editingPlan ? "Update Plan" : "Create Plan"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search plans..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredPlans.map((plan) => (
          <Card key={plan.id}>
            <CardHeader>
              <CardTitle className="text-lg">{plan.name}</CardTitle>
              <CardDescription>
                {plan.exerciseIds.length} exercise{plan.exerciseIds.length !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                {plan.exerciseIds.slice(0, 3).map((exerciseId) => {
                  const exercise = state.exercises.find((ex) => ex.id === exerciseId)
                  return exercise ? (
                    <div key={exerciseId} className="text-sm text-muted-foreground">
                      • {exercise.name}
                    </div>
                  ) : null
                })}
                {plan.exerciseIds.length > 3 && (
                  <div className="text-sm text-muted-foreground">... and {plan.exerciseIds.length - 3} more</div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(plan)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(plan.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPlans.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Plus className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No workout plans found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {state.plans.length === 0
                ? "Create your first workout plan to get started."
                : "Try adjusting your search criteria."}
            </p>
            {state.plans.length === 0 && (
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Plan
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
