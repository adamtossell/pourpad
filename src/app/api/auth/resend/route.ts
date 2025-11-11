import { NextResponse } from "next/server"

import { z } from "zod"

import { createRouteHandlerSupabaseClient } from "@/lib/supabase"

const resendSchema = z.object({
  email: z.string().email("Enter a valid email"),
})

export async function POST(request: Request) {
  const supabase = await createRouteHandlerSupabaseClient()

  try {
    const body = await request.json()
    const { email } = resendSchema.parse(body)

    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status ?? 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Confirmation email sent. Please check your inbox.",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.flatten().fieldErrors },
        { status: 422 }
      )
    }

    console.error("Resend confirmation error", error)
    return NextResponse.json(
      { error: "Unable to send confirmation email" },
      { status: 500 }
    )
  }
}
