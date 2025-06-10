"use client"

import { useState, FormEvent } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  // State for Credentials Sign In
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoadingCredentials, setIsLoadingCredentials] = useState(false)

  // State for Email Link Sign In
  const [emailForLink, setEmailForLink] = useState("")
  const [messageEmailLink, setMessageEmailLink] = useState("")
  const [errorEmailLink, setErrorEmailLink] = useState("")
  const [isLoadingEmailLink, setIsLoadingEmailLink] = useState(false)

  const router = useRouter()


  // Handler for Credentials Sign In
  async function handleCredentialsSubmit(e: FormEvent) {
    e.preventDefault()
    setError("")
    setIsLoadingCredentials(true)

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (res?.error) {
        setError(res.error === "CredentialsSignin" ? "Invalid email or password." : res.error);
      } else if (res?.ok) {
        router.push('/portal')
      } else {
        setError("An unknown error occurred during sign in.")
      }
    } catch (err) {
      console.error("Sign in error:", err)
      setError("An unexpected error occurred.")
    } finally {
      setIsLoadingCredentials(false)
    }
  }

  // Handler for Email Link Sign In
  async function handleEmailLinkSubmit(e: FormEvent) {
    e.preventDefault()
    setErrorEmailLink("")
    setMessageEmailLink("")
    setIsLoadingEmailLink(true)

    try {
      const res = await signIn("email", {
        email: emailForLink,
        redirect: false, // Handle success/error messages on this page
        callbackUrl: `${window.location.origin}/portal`, // Redirect to portal on success from email link
      })

      if (res?.error) {
        setErrorEmailLink(res.error === "EmailSignin" ? "Failed to send email. Please try again." : res.error);
      } else if (res?.ok) {
        setMessageEmailLink("Check your email for a sign-in link!")
      } else {
        setErrorEmailLink("An unknown error occurred. Please try again.")
      }
    } catch (err) {
      console.error("Email sign in error:", err)
      setErrorEmailLink("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoadingEmailLink(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow p-8">
        <>
          <h1 className="text-2xl font-semibold text-center">Sign in to HMNP Portal</h1>
          
          {/* Credentials Sign In Form */}
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
                disabled={isLoadingCredentials}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
                disabled={isLoadingCredentials}
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              className="w-full py-2 font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={isLoadingCredentials || isLoadingEmailLink}
            >
              {isLoadingCredentials ? 'Signing in...' : 'Sign In with Password'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t dark:border-gray-600"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">Or</span>
            </div>
          </div>

          {/* Email Link Sign In Form */}
          <form onSubmit={handleEmailLinkSubmit} className="space-y-4">
            <div>
              <label htmlFor="emailForLink" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sign in or Sign up with Email Link</label>
              <input
                id="emailForLink"
                name="emailForLink"
                type="email"
                required
                value={emailForLink}
                onChange={(e) => setEmailForLink(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:border-green-500 dark:bg-gray-700 dark:border-gray-600"
                disabled={isLoadingEmailLink || isLoadingCredentials}
              />
            </div>

            {errorEmailLink && <p className="text-sm text-red-500">{errorEmailLink}</p>}
            {messageEmailLink && <p className="text-sm text-green-500">{messageEmailLink}</p>}

            <button
              type="submit"
              className="w-full py-2 font-medium text-white bg-green-600 rounded hover:bg-green-700 disabled:opacity-50"
              disabled={isLoadingEmailLink || isLoadingCredentials}
            >
              {isLoadingEmailLink ? 'Sending link...' : 'Send Magic Link'}
            </button>
          </form>
        </>
      </div>
    </div>
  )
}
