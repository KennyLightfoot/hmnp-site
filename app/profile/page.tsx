import { redirect } from "next/navigation"

export default function ProfilePage() {
  // Redirect to home page since we don't have authentication
  redirect("/")

  // This code will never execute due to the redirect
  return (
    <div>
      <h1>Profile</h1>
      <p>This page requires authentication.</p>
    </div>
  )
}
