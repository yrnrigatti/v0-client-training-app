"use client"

import { useTraining } from "@/lib/training-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dumbbell, Calendar, History, TrendingUp } from "lucide-react"

export function Dashboard() {
  const { state, dispatch } = useTraining()

  const recentSessions = state.sessions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3)

  const stats = {
    totalExercises: state.exercises.length,
    totalPlans: state.plans.length,
    totalSessions: state.sessions.length,
    thisWeekSessions: state.sessions.filter((session) => {
      const sessionDate = new Date(session.date)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return sessionDate >= weekAgo
    }).length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Welcome back! Here's your training overview.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Exercises</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalExercises}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workout Plans</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPlans}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSessions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisWeekSessions}</div>
            <p className="text-xs text-muted-foreground">sessions completed</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with your training</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              className="w-full justify-start bg-transparent"
              variant="outline"
              onClick={() => dispatch({ type: "SET_VIEW", payload: "workout" })}
            >
              Start New Workout
            </Button>
            <Button
              className="w-full justify-start bg-transparent"
              variant="outline"
              onClick={() => dispatch({ type: "SET_VIEW", payload: "exercises" })}
            >
              Manage Exercises
            </Button>
            <Button
              className="w-full justify-start bg-transparent"
              variant="outline"
              onClick={() => dispatch({ type: "SET_VIEW", payload: "plans" })}
            >
              Create Workout Plan
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
            <CardDescription>Your latest workout activity</CardDescription>
          </CardHeader>
          <CardContent>
            {recentSessions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sessions yet. Start your first workout!</p>
            ) : (
              <div className="space-y-2">
                {recentSessions.map((session) => {
                  const plan = session.planId ? state.plans.find((p) => p.id === session.planId) : null
                  return (
                    <div key={session.id} className="flex justify-between items-center text-sm">
                      <div>
                        <p className="font-medium">{plan ? plan.name : "Custom Workout"}</p>
                        <p className="text-muted-foreground">{session.entries.length} exercises</p>
                      </div>
                      <p className="text-muted-foreground">{new Date(session.date).toLocaleDateString()}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
