"use client"

import { useSession } from "next-auth/react"
import { useState } from "react"

export default function AuthDebugPage() {
  const { data: session, status } = useSession()
  const [testResult, setTestResult] = useState<any>(null)

  const testAuth = async () => {
    try {
      const response = await fetch("/api/auth-test")
      const data = await response.json()
      setTestResult(data)
    } catch (error) {
      setTestResult({ error: "Failed to test auth" })
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Auth Debug Page</h1>

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Session Status: {status}</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">{JSON.stringify(session, null, 2)}</pre>
        </div>

        <button onClick={testAuth} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Test Auth API
        </button>

        {testResult && (
          <div>
            <h2 className="text-lg font-semibold">API Test Result:</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">{JSON.stringify(testResult, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
