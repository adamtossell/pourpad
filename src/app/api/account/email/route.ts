import { NextResponse } from "next/server"

import { z } from "zod"

import { createRouteHandlerSupabaseClient } from "@/lib/supabase"
import type { AccountEmailUpdateResponse } from "@/lib/types/account"
import type { ApiErrorResponse } from "@/lib/types/recipes"

const emailSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password is required"),
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

  let payload: z.infer<typeof emailSchema>
  try {
    const body = await request.json()
    payload = emailSchema.parse(body)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json<ApiErrorResponse>(
        { error: "Validation failed", details: error.flatten().fieldErrors },
        { status: 422 },
      )
    }

    console.error("Invalid email update payload", error)
    return NextResponse.json<ApiErrorResponse>({ error: "Invalid request payload" }, { status: 400 })
  }

  if (payload.email === user.email) {
    return NextResponse.json<AccountEmailUpdateResponse>({ success: true, message: "Email unchanged" })
  }

  const reauth = await supabase.auth.signInWithPassword({ email: user.email, password: payload.password })
  if (reauth.error) {
    console.error("Failed to reauthenticate for email update", reauth.error)
    return NextResponse.json<ApiErrorResponse>({ error: "Incorrect password" }, { status: 401 })
  }

  const update = await supabase.auth.updateUser({ email: payload.email })
  if (update.error) {
    console.error("Failed to update email", update.error)
    return NextResponse.json<ApiErrorResponse>({ error: update.error.message || "Failed to update email" }, { status: 400 })
  }

  return NextResponse.json<AccountEmailUpdateResponse>({ success: true, message: "Email updated" })
}
