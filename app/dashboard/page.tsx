import { redirect } from "next/navigation"

export default function DashboardPage() {
  // Redirect to home page since we don't have authentication
  redirect("/")

  // This code will never execute due to the redirect
  return (
    <div>
      <h1>Dashboard</h1>
      <p>This page requires authentication.</p>
    </div>
  )
}
