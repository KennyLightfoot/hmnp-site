"use client"

import { useState, FormEvent } from "react"
import { signIn } from "next-auth/react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError("")
    const callbackUrl = `${window.location.origin}/portal`
    const res = await signIn("email", { email, redirect: false, callbackUrl })
    if (res?.error) {
      setError(res.error)
    } else {
      setSent(true)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow p-8">
        {sent ? (
          <>
            <h1 className="text-2xl font-semibold text-center">Check your email</h1>
            <p className="text-center text-gray-600 dark:text-gray-400">
              We've sent a secure sign-in link to <span className="font-medium">{email}</span>.
              <br />It may take a minute to arrive.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold text-center">Sign in to HMNP Portal</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button
                type="submit"
                className="w-full py-2 font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                Send magic link
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
