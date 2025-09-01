import type { NextAuthOptions } from "next-auth"
import Credentials from "next-auth/providers/credentials"

// Temporary in-memory user store for testing
const users: Array<{ id: string; email: string; name: string; password: string }> = []

// Simple password hashing
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + "simple-salt")
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-development",
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" },
        isSignUp: { label: "Is Sign Up", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          if (credentials.isSignUp === "true") {
            // Sign up flow
            const existingUser = users.find((user) => user.email === credentials.email)
            if (existingUser) {
              return null // User already exists
            }

            const hashedPassword = await hashPassword(credentials.password)
            const newUser = {
              id: Date.now().toString(),
              email: credentials.email,
              name: credentials.name || "User",
              password: hashedPassword,
            }

            users.push(newUser)
            return {
              id: newUser.id,
              email: newUser.email,
              name: newUser.name,
            }
          } else {
            // Sign in flow
            const user = users.find((u) => u.email === credentials.email)
            if (!user) {
              return null
            }

            const hashedPassword = await hashPassword(credentials.password)
            if (hashedPassword === user.password) {
              return {
                id: user.id,
                email: user.email,
                name: user.name,
              }
            }
          }

          return null
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
}
