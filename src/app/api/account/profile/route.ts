import { NextResponse } from "next/server"
import { randomUUID } from "crypto"

import { z } from "zod"

import { createRouteHandlerSupabaseClient } from "@/lib/supabase"
import type {
  AccountProfile,
  AccountProfileResponse,
  AccountProfileUpdateResponse,
} from "@/lib/types/account"
import type { ApiErrorResponse } from "@/lib/types/recipes"

const profileSchema = z.object({
  displayName: z.string().trim().min(2, "Display name must be at least 2 characters"),
})

const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"] as const
const MAX_FILE_BYTES = 5 * 1024 * 1024

export async function GET() {
  const supabase = await createRouteHandlerSupabaseClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError) {
    console.error("Failed to fetch session", authError)
    return NextResponse.json<ApiErrorResponse>({ error: "Unable to validate session" }, { status: 500 })
  }

  if (!user) {
    return NextResponse.json<ApiErrorResponse>({ error: "You must be logged in" }, { status: 401 })
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("display_name, avatar_url, created_at")
    .eq("id", user.id)
    .maybeSingle()

  if (error) {
    console.error("Failed to load profile", error)
    return NextResponse.json<ApiErrorResponse>({ error: "Failed to load profile" }, { status: 500 })
  }

  const pendingEmail = extractPendingEmail(user)

  const accountProfile = await buildAccountProfile(supabase, {
    id: user.id,
    email: user.email ?? "",
    displayName: profile?.display_name ?? deriveNameFromEmail(user.email ?? ""),
    avatarPath: profile?.avatar_url ?? null,
    joinedAt: profile?.created_at ?? user.created_at ?? new Date().toISOString(),
    pendingEmail,
  })

  return NextResponse.json<AccountProfileResponse>({ profile: accountProfile })
}

export async function PUT(request: Request) {
  const supabase = await createRouteHandlerSupabaseClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError) {
    console.error("Failed to fetch session", authError)
    return NextResponse.json<ApiErrorResponse>({ error: "Unable to validate session" }, { status: 500 })
  }

  if (!user) {
    return NextResponse.json<ApiErrorResponse>({ error: "You must be logged in" }, { status: 401 })
  }

  const formData = await request.formData()
  const displayNameValue = formData.get("displayName")
  const avatarValue = formData.get("avatar")

  if (typeof displayNameValue !== "string") {
    return NextResponse.json<ApiErrorResponse>({ error: "Display name is required" }, { status: 422 })
  }

  const parsed = profileSchema.safeParse({ displayName: displayNameValue })
  if (!parsed.success) {
    return NextResponse.json<ApiErrorResponse>(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 422 },
    )
  }

  let avatarPath: string | null = null
  let uploadErrorMessage: string | null = null

  if (avatarValue instanceof File) {
    const validation = validateAvatarFile(avatarValue)
    if (!validation.valid) {
      return NextResponse.json<ApiErrorResponse>({ error: validation.message }, { status: 422 })
    }

    const { data: currentProfile, error: currentProfileError } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", user.id)
      .maybeSingle()

    if (currentProfileError) {
      console.error("Failed to load current avatar", currentProfileError)
    }

    const uploadResult = await uploadAvatar(supabase, user.id, avatarValue, currentProfile?.avatar_url ?? null)
    if (!uploadResult.success) {
      uploadErrorMessage = uploadResult.message ?? "Failed to upload avatar"
    } else {
      avatarPath = uploadResult.path
    }
  }

  if (uploadErrorMessage) {
    return NextResponse.json<ApiErrorResponse>({ error: uploadErrorMessage }, { status: 500 })
  }

  const updatePayload: Record<string, unknown> = {
    display_name: parsed.data.displayName,
  }

  if (avatarPath !== null) {
    updatePayload.avatar_url = avatarPath
  }

  const { data: profile, error: updateError } = await supabase
    .from("profiles")
    .update(updatePayload)
    .eq("id", user.id)
    .select("display_name, avatar_url, created_at")
    .single()

  if (updateError || !profile) {
    console.error("Failed to update profile", updateError)
    return NextResponse.json<ApiErrorResponse>({ error: "Failed to update profile" }, { status: 500 })
  }

  const pendingEmail = extractPendingEmail(user)

  const accountProfile = await buildAccountProfile(supabase, {
    id: user.id,
    email: user.email ?? "",
    displayName: profile.display_name ?? parsed.data.displayName,
    avatarPath: profile.avatar_url ?? null,
    joinedAt: profile.created_at ?? user.created_at ?? new Date().toISOString(),
    pendingEmail,
  })

  return NextResponse.json<AccountProfileUpdateResponse>({ profile: accountProfile })
}

function deriveNameFromEmail(email: string): string {
  if (!email.includes("@")) return "User"
  return email.split("@")[0]
}

async function buildAccountProfile(
  supabase: Awaited<ReturnType<typeof createRouteHandlerSupabaseClient>>,
  params: {
    id: string
    email: string
    displayName: string
    avatarPath: string | null
    joinedAt: string
    pendingEmail: string | null
  },
): Promise<AccountProfile> {
  const avatarUrl = params.avatarPath ? await signAvatarUrl(supabase, params.avatarPath) : null

  return {
    id: params.id,
    email: params.email,
    displayName: params.displayName,
    avatarUrl,
    joinedAt: params.joinedAt,
    pendingEmail: params.pendingEmail,
  }
}

async function signAvatarUrl(
  supabase: Awaited<ReturnType<typeof createRouteHandlerSupabaseClient>>,
  path: string,
): Promise<string | null> {
  const { data, error } = await supabase.storage.from("avatars").createSignedUrl(path, 60 * 60)
  if (error) {
    console.error("Failed to sign avatar URL", error)
    return null
  }
  return data?.signedUrl ?? null
}

function validateAvatarFile(file: File): { valid: true } | { valid: false; message: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as typeof ALLOWED_IMAGE_TYPES[number])) {
    return { valid: false, message: "Unsupported image type" }
  }

  if (file.size > MAX_FILE_BYTES) {
    return { valid: false, message: "Image must be 5MB or smaller" }
  }

  return { valid: true }
}

function extractPendingEmail(user: { [key: string]: unknown } | null): string | null {
  if (!user) return null
  const newEmail = (user as { new_email?: string | null }).new_email ?? null
  return newEmail ?? null
}

async function uploadAvatar(
  supabase: Awaited<ReturnType<typeof createRouteHandlerSupabaseClient>>,
  userId: string,
  file: File,
  previousPath: string | null,
): Promise<{ success: true; path: string } | { success: false; message?: string }> {
  const extension = extractExtension(file.name, file.type)
  const key = `${userId}/${randomUUID()}${extension ? `.${extension}` : ""}`
  const arrayBuffer = await file.arrayBuffer()
  const upload = await supabase.storage
    .from("avatars")
    .upload(key, arrayBuffer, {
      upsert: true,
      contentType: file.type || "application/octet-stream",
    })

  if (upload.error) {
    console.error("Failed to upload avatar", upload.error)
    return { success: false, message: "Failed to upload avatar" }
  }

  if (previousPath && previousPath !== key) {
    void supabase.storage.from("avatars").remove([previousPath])
  }

  return { success: true, path: key }
}

function extractExtension(filename: string | undefined, mime: string | undefined): string | null {
  if (filename && filename.includes(".")) {
    const ext = filename.split(".").pop()
    return ext ? ext.toLowerCase() : null
  }

  if (!mime) return null

  switch (mime) {
    case "image/png":
      return "png"
    case "image/jpeg":
      return "jpg"
    case "image/webp":
      return "webp"
    default:
      return null
  }
}
