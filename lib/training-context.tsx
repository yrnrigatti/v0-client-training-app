"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"
import { apiClient } from "./api-client"

export interface Exercise {
  id: string
  name: string
  category: string
  muscleGroup: string
}

export interface Plan {
  id: string
  name: string
  exerciseIds: string[]
}

export interface Entry {
  exerciseId: string
  setIndex: number
  weight: number
  reps: number
  notes?: string
}

export interface Session {
  id: string
  date: string
  planId?: string
  entries: Entry[]
}

interface TrainingState {
  exercises: Exercise[]
  plans: Plan[]
  sessions: Session[]
  currentView: "dashboard" | "exercises" | "plans" | "workout" | "history"
  activeSession: Session | null
}

type TrainingAction =
  | { type: "SET_VIEW"; payload: TrainingState["currentView"] }
  | { type: "LOAD_DATA"; payload: { exercises: Exercise[]; plans: Plan[]; sessions: Session[] } }
  | { type: "ADD_EXERCISE"; payload: Exercise }
  | { type: "UPDATE_EXERCISE"; payload: Exercise }
  | { type: "DELETE_EXERCISE"; payload: string }
  | { type: "ADD_PLAN"; payload: Plan }
  | { type: "UPDATE_PLAN"; payload: Plan }
  | { type: "DELETE_PLAN"; payload: string }
  | { type: "START_SESSION"; payload: Session }
  | { type: "UPDATE_SESSION"; payload: Session }
  | { type: "END_SESSION" }
  | { type: "ADD_SESSION"; payload: Session }

const initialState: TrainingState = {
  exercises: [],
  plans: [],
  sessions: [],
  currentView: "dashboard",
  activeSession: null,
}

function trainingReducer(state: TrainingState, action: TrainingAction): TrainingState {
  switch (action.type) {
    case "SET_VIEW":
      return { ...state, currentView: action.payload }
    case "LOAD_DATA":
      return {
        ...state,
        exercises: action.payload.exercises,
        plans: action.payload.plans,
        sessions: action.payload.sessions,
      }
    case "ADD_EXERCISE":
      return { ...state, exercises: [...state.exercises, action.payload] }
    case "UPDATE_EXERCISE":
      return {
        ...state,
        exercises: state.exercises.map((ex) => (ex.id === action.payload.id ? action.payload : ex)),
      }
    case "DELETE_EXERCISE":
      return {
        ...state,
        exercises: state.exercises.filter((ex) => ex.id !== action.payload),
      }
    case "ADD_PLAN":
      return { ...state, plans: [...state.plans, action.payload] }
    case "UPDATE_PLAN":
      return {
        ...state,
        plans: state.plans.map((plan) => (plan.id === action.payload.id ? action.payload : plan)),
      }
    case "DELETE_PLAN":
      return {
        ...state,
        plans: state.plans.filter((plan) => plan.id !== action.payload),
      }
    case "START_SESSION":
      return { ...state, activeSession: action.payload }
    case "UPDATE_SESSION":
      return { ...state, activeSession: action.payload }
    case "END_SESSION":
      return { ...state, activeSession: null }
    case "ADD_SESSION":
      return { ...state, sessions: [...state.sessions, action.payload] }
    default:
      return state
  }
}

const TrainingContext = createContext<{
  state: TrainingState
  dispatch: React.Dispatch<TrainingAction>
} | null>(null)

export function TrainingProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(trainingReducer, initialState)

  useEffect(() => {
    // Initialize database and load data on mount
    const loadData = async () => {
      try {
        // First initialize the database
        await fetch("/api/init", { method: "POST" })

        // Then load the data
        const [exercises, plans, sessions] = await Promise.all([
          apiClient.getExercises(),
          apiClient.getPlans(),
          apiClient.getSessions(),
        ])
        dispatch({ type: "LOAD_DATA", payload: { exercises, plans, sessions } })
      } catch (error) {
        console.error("Failed to load data:", error)
        // If database operations fail, initialize with empty data
        dispatch({ type: "LOAD_DATA", payload: { exercises: [], plans: [], sessions: [] } })
      }
    }
    loadData()
  }, [])

  return <TrainingContext.Provider value={{ state, dispatch }}>{children}</TrainingContext.Provider>
}

export function useTraining() {
  const context = useContext(TrainingContext)
  if (!context) {
    throw new Error("useTraining must be used within a TrainingProvider")
  }
  return context
}
