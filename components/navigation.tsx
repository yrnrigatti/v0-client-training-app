"use client"

import { useTraining } from "@/lib/training-context"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Home, Dumbbell, Calendar, Play, History, LogOut, User } from "lucide-react"

export function Navigation() {
  const { state, dispatch } = useTraining()
  const { data: session } = useSession()

  const navItems = [
    { id: "dashboard" as const, label: "Dashboard", icon: Home },
    { id: "exercises" as const, label: "Exercises", icon: Dumbbell },
    { id: "plans" as const, label: "Plans", icon: Calendar },
    { id: "workout" as const, label: "Workout", icon: Play },
    { id: "history" as const, label: "History", icon: History },
  ]

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" })
  }

  const getUserInitials = () => {
    if (!session?.user?.name) return "U"
    return session.user.name
      .split(" ")
      .map((name) => name[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <h1 className="text-xl font-bold">Training Tracker</h1>
          <div className="flex items-center space-x-4">
            <div className="flex space-x-1">
              {navItems.map(({ id, label, icon: Icon }) => (
                <Button
                  key={id}
                  variant={state.currentView === id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => dispatch({ type: "SET_VIEW", payload: id })}
                  className="flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{label}</span>
                </Button>
              ))}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{session?.user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{session?.user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  )
}
