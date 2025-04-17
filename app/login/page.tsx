import { redirect } from "next/navigation"

export default function LoginPage() {
  // Redirect to home page since we don't have authentication
  redirect("/")

  // This code will never execute due to the redirect
  return (
    <div>
      <h1>Login</h1>
      <p>This page is not implemented.</p>
    </div>
  )
}
