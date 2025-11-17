import { NextResponse } from "next/server"

import { z } from "zod"

import { createRouteHandlerSupabaseClient } from "@/lib/supabase"
import type { AccountPasswordUpdateResponse } from "@/lib/types/account"
import type { ApiErrorResponse } from "@/lib/types/recipes"

const passwordSchema = z.object({
  currentPassword: z.string().min(6, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
})

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

  if (!user || !user.email) {
    return NextResponse.json<ApiErrorResponse>({ error: "You must be logged in" }, { status: 401 })
  }

  let payload: z.infer<typeof passwordSchema>
  try {
    const body = await request.json()
    payload = passwordSchema.parse(body)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json<ApiErrorResponse>(
        { error: "Validation failed", details: error.flatten().fieldErrors },
        { status: 422 },
      )
    }

    console.error("Invalid password update payload", error)
    return NextResponse.json<ApiErrorResponse>({ error: "Invalid request payload" }, { status: 400 })
  }

  const reauth = await supabase.auth.signInWithPassword({ email: user.email, password: payload.currentPassword })
  if (reauth.error) {
    console.error("Failed to reauthenticate for password update", reauth.error)
    return NextResponse.json<ApiErrorResponse>({ error: "Incorrect current password" }, { status: 401 })
  }

  const update = await supabase.auth.updateUser({ password: payload.newPassword })
  if (update.error) {
    console.error("Failed to update password", update.error)
    return NextResponse.json<ApiErrorResponse>({ error: update.error.message || "Failed to update password" }, { status: 400 })
  }

  return NextResponse.json<AccountPasswordUpdateResponse>({ success: true, message: "Password updated" })
}
