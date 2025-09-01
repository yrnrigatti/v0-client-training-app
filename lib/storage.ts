import type { Exercise, Plan, Session } from "./training-context"

class StorageService {
  private getItem<T>(key: string, defaultValue: T): T {
    if (typeof window === "undefined") return defaultValue
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch {
      return defaultValue
    }
  }

  private setItem<T>(key: string, value: T): void {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error("Failed to save to localStorage:", error)
    }
  }

  async getExercises(): Promise<Exercise[]> {
    return this.getItem("training-exercises", [])
  }

  async saveExercises(exercises: Exercise[]): Promise<void> {
    this.setItem("training-exercises", exercises)
  }

  async getPlans(): Promise<Plan[]> {
    return this.getItem("training-plans", [])
  }

  async savePlans(plans: Plan[]): Promise<void> {
    this.setItem("training-plans", plans)
  }

  async getSessions(): Promise<Session[]> {
    return this.getItem("training-sessions", [])
  }

  async saveSessions(sessions: Session[]): Promise<void> {
    this.setItem("training-sessions", sessions)
  }
}

export const storageService = new StorageService()
