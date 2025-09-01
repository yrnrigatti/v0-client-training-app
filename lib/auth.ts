import type { NextAuthOptions } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { sql } from "@/lib/db"

// Simple password hashing using Web Crypto API
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + "salt") // Add a simple salt
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
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
          // Ensure users table exists
          await sql`
            CREATE TABLE IF NOT EXISTS users (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              email TEXT UNIQUE NOT NULL,
              name TEXT NOT NULL,
              password TEXT NOT NULL,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
          `

          if (credentials.isSignUp === "true") {
            // Sign up flow
            const existingUsers = await sql`
              SELECT id FROM users WHERE email = ${credentials.email}
            `

            if (existingUsers.length > 0) {
              return null // User already exists
            }

            const hashedPassword = await hashPassword(credentials.password)
            const newUsers = await sql`
              INSERT INTO users (email, name, password)
              VALUES (${credentials.email}, ${credentials.name || "User"}, ${hashedPassword})
              RETURNING id, email, name
            `

            if (newUsers.length > 0) {
              return {
                id: newUsers[0].id,
                email: newUsers[0].email,
                name: newUsers[0].name,
              }
            }
          } else {
            // Sign in flow
            const users = await sql`
              SELECT id, email, name, password FROM users WHERE email = ${credentials.email}
            `

            if (users.length > 0) {
              const user = users[0]
              const hashedPassword = await hashPassword(credentials.password)

              if (hashedPassword === user.password) {
                return {
                  id: user.id,
                  email: user.email,
                  name: user.name,
                }
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
