import { createServerSupabaseClient } from "@/lib/supabase"

type CurrentUser = {
  id: string
  email: string
  displayName: string
  firstInitial: string
}

function getInitialFromDisplayName(displayName: string, email: string): string {
  const trimmed = displayName.trim()
  if (trimmed.length > 0) {
    return trimmed[0].toUpperCase()
  }

  const emailChar = email.trim()[0]
  return emailChar ? emailChar.toUpperCase() : "?"
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) {
    console.error("Failed to fetch authenticated user", userError)
  }

  if (!user || !user.email) {
    return null
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle()

  if (error) {
    console.error("Failed to load profile", error)
  }

  const displayName =
    profile?.display_name?.trim() ||
    (user.user_metadata?.display_name as string | undefined) ||
    user.email.split("@")[0] ||
    "User"

  const firstInitial = getInitialFromDisplayName(displayName, user.email)

  return {
    id: user.id,
    email: user.email,
    displayName,
    firstInitial,
  }
}

export type { CurrentUser }
