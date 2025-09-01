import type { Exercise, Plan, Session } from "./training-context"

const API_BASE = "/api"

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}${endpoint}`
    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    }

    console.log("API Request:", url, config)

    const response = await fetch(url, config)

    if (!response.ok) {
      // If we get a database error, try to initialize the database
      if (response.status === 500 && endpoint !== "/init") {
        try {
          await fetch("/api/init", { method: "POST" })
          // Retry the original request after initialization
          const retryResponse = await fetch(url, config)
          if (retryResponse.ok) {
            const retryData = await retryResponse.json()
            console.log("Retry response:", retryData)
            return retryData
          }
        } catch (initError) {
          console.error("Failed to initialize database:", initError)
        }
      }

      const error = await response.json().catch(() => ({ message: "Network error" }))
      console.error("API Error:", error)
      throw new Error(error.message || `HTTP ${response.status}`)
    }

    const data = await response.json()
    console.log("API Response:", data)
    return data
  }

  // Add initialization method
  async initializeDatabase(): Promise<void> {
    await this.request("/init", { method: "POST" })
  }

  // Exercise API methods
  async getExercises(): Promise<Exercise[]> {
    const response = await this.request<{ data: Exercise[] }>("/exercises")
    return response.data
  }

  async createExercise(exercise: Omit<Exercise, "id">): Promise<Exercise> {
    const response = await this.request<{ data: Exercise }>("/exercises", {
      method: "POST",
      body: JSON.stringify(exercise),
    })
    return response.data
  }

  async updateExercise(id: string, exercise: Partial<Exercise>): Promise<Exercise> {
    console.log("API Client - Updating exercise:", id, exercise)
    const response = await this.request<{ data: Exercise }>(`/exercises/${id}`, {
      method: "PUT",
      body: JSON.stringify(exercise),
    })
    return response.data
  }

  async deleteExercise(id: string): Promise<void> {
    await this.request(`/exercises/${id}`, {
      method: "DELETE",
    })
  }

  // Workout Plans API methods
  async getPlans(): Promise<Plan[]> {
    const response = await this.request<{ data: Plan[] }>("/plans")
    return response.data
  }

  async createPlan(plan: Omit<Plan, "id">): Promise<Plan> {
    const response = await this.request<{ data: Plan }>("/plans", {
      method: "POST",
      body: JSON.stringify(plan),
    })
    return response.data
  }

  async updatePlan(id: string, plan: Partial<Plan>): Promise<Plan> {
    const response = await this.request<{ data: Plan }>(`/plans/${id}`, {
      method: "PUT",
      body: JSON.stringify(plan),
    })
    return response.data
  }

  async deletePlan(id: string): Promise<void> {
    await this.request(`/plans/${id}`, {
      method: "DELETE",
    })
  }

  // Sessions API methods
  async getSessions(): Promise<Session[]> {
    const response = await this.request<{ data: Session[] }>("/sessions")
    return response.data
  }

  async createSession(session: Omit<Session, "id">): Promise<Session> {
    const response = await this.request<{ data: Session }>("/sessions", {
      method: "POST",
      body: JSON.stringify(session),
    })
    return response.data
  }
}

export const apiClient = new ApiClient()
