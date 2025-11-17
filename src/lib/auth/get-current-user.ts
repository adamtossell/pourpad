import { createServerSupabaseClient } from "@/lib/supabase"

type CurrentUser = {
  id: string
  email: string
  displayName: string
  firstInitial: string
  avatarUrl: string | null
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
    .select("display_name, avatar_url")
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
  const avatarUrl = await signAvatarUrl(supabase, profile?.avatar_url ?? null)

  return {
    id: user.id,
    email: user.email,
    displayName,
    firstInitial,
    avatarUrl,
  }
}

export type { CurrentUser }

async function signAvatarUrl(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  path: string | null,
): Promise<string | null> {
  if (!path) return null

  const { data, error } = await supabase.storage.from("avatars").createSignedUrl(path, 60 * 60)
  if (error) {
    console.error("Failed to sign user avatar", error)
    return null
  }
  return data?.signedUrl ?? null
}
