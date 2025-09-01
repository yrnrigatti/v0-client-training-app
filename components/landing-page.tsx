"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Dumbbell, Calendar, TrendingUp, History } from "lucide-react"

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Dumbbell className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold">Training Tracker</span>
          </div>
          <div className="space-x-2">
            <Link href="/auth/signin">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Track Your Fitness Journey</h1>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Build custom workout plans, log your sessions, and monitor your progress with our comprehensive training
              tracker.
            </p>
            <div className="flex justify-center space-x-4">
              <Link href="/auth/signup">
                <Button size="lg">Get Started</Button>
              </Link>
              <Link href="/auth/signin">
                <Button variant="outline" size="lg">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="bg-blue-50 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Dumbbell className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Exercise Library</h3>
                <p className="text-gray-600">Create and manage your custom exercise database.</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-50 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Workout Plans</h3>
                <p className="text-gray-600">Build personalized workout routines for your goals.</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-50 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Progress Tracking</h3>
                <p className="text-gray-600">Monitor your improvements with detailed analytics.</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-50 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <History className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Workout History</h3>
                <p className="text-gray-600">Review past sessions and analyze your performance.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} Training Tracker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
