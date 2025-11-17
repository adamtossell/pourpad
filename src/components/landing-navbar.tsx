import { getCurrentUser } from "@/lib/auth/get-current-user"
import { LandingNavbarClient } from "@/components/landing-navbar-client"

export async function LandingNavbar() {
  const user = await getCurrentUser()

  return <LandingNavbarClient initialUser={user} />
}