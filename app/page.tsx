"use client"

import { useSession } from "next-auth/react"
import { TrainingProvider } from "@/lib/training-context"
import { TrainingApp } from "@/components/training-app"
import { LandingPage } from "@/components/landing-page"

export default function Home() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-xl">Loading...</div>
      </div>
    )
  }

  if (status === "unauthenticated" || !session) {
    return <LandingPage />
  }

  return (
    <TrainingProvider>
      <TrainingApp />
    </TrainingProvider>
  )
}
