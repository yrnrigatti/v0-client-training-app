"use client"

import type React from "react"

import { useState } from "react"
import { useTraining, type Exercise } from "@/lib/training-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Plus, Edit, Trash2, Dumbbell } from "lucide-react"
import { apiClient } from "@/lib/api-client"

const categories = ["Strength", "Cardio", "Flexibility", "Balance", "Sports"]
const muscleGroups = ["Chest", "Back", "Shoulders", "Arms", "Legs", "Core", "Full Body"]

export function ExerciseManager() {
  const { state, dispatch } = useTraining()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    category: "Strength",
    muscleGroup: "Chest",
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("")
  const [filterMuscleGroup, setFilterMuscleGroup] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const filteredExercises = state.exercises.filter((exercise) => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !filterCategory || exercise.category === filterCategory
    const matchesMuscleGroup = !filterMuscleGroup || exercise.muscleGroup === filterMuscleGroup
    return matchesSearch && matchesCategory && matchesMuscleGroup
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.category || !formData.muscleGroup) return

    setIsLoading(true)
    try {
      if (editingExercise) {
        console.log("Updating exercise:", editingExercise.id, formData)
        const updatedExercise = await apiClient.updateExercise(editingExercise.id, formData)
        dispatch({ type: "UPDATE_EXERCISE", payload: updatedExercise })
      } else {
        console.log("Creating exercise:", formData)
        const newExercise = await apiClient.createExercise(formData)
        dispatch({ type: "ADD_EXERCISE", payload: newExercise })
      }

      setFormData({ name: "", category: "Strength", muscleGroup: "Chest" })
      setEditingExercise(null)
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Failed to save exercise:", error)
      // Show user-friendly error message
      alert(`Failed to save exercise: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (exercise: Exercise) => {
    console.log("Editing exercise:", exercise)
    setEditingExercise(exercise)
    setFormData({
      name: exercise.name,
      category: exercise.category,
      muscleGroup: exercise.muscleGroup,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this exercise?")) return

    try {
      console.log("Deleting exercise:", id)
      await apiClient.deleteExercise(id)
      dispatch({ type: "DELETE_EXERCISE", payload: id })
    } catch (error) {
      console.error("Failed to delete exercise:", error)
      alert(`Failed to delete exercise: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  const resetForm = () => {
    setFormData({ name: "", category: "Strength", muscleGroup: "Chest" })
    setEditingExercise(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Exercise Library</h2>
          <p className="text-muted-foreground">Manage your exercise database</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Exercise
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingExercise ? "Edit Exercise" : "Add New Exercise"}</DialogTitle>
              <DialogDescription>
                {editingExercise ? "Update the exercise details." : "Create a new exercise for your library."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Exercise Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Push-ups"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                    required
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="muscleGroup">Muscle Group</Label>
                  <Select
                    value={formData.muscleGroup}
                    onValueChange={(value) => setFormData({ ...formData, muscleGroup: value })}
                    required
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select muscle group" />
                    </SelectTrigger>
                    <SelectContent>
                      {muscleGroups.map((group) => (
                        <SelectItem key={group} value={group}>
                          {group}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : editingExercise ? "Update Exercise" : "Add Exercise"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search exercises..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="sm:max-w-xs">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterMuscleGroup} onValueChange={setFilterMuscleGroup}>
          <SelectTrigger className="sm:max-w-xs">
            <SelectValue placeholder="Filter by muscle group" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Muscle Groups</SelectItem>
            {muscleGroups.map((group) => (
              <SelectItem key={group} value={group}>
                {group}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredExercises.map((exercise) => (
          <Card key={exercise.id}>
            <CardHeader>
              <CardTitle className="text-lg">{exercise.name}</CardTitle>
              <CardDescription className="flex gap-2">
                <Badge variant="secondary">{exercise.category}</Badge>
                <Badge variant="outline">{exercise.muscleGroup}</Badge>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(exercise)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(exercise.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredExercises.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Dumbbell className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No exercises found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {state.exercises.length === 0
                ? "Start building your exercise library by adding your first exercise."
                : "Try adjusting your search or filter criteria."}
            </p>
            {state.exercises.length === 0 && (
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Exercise
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
