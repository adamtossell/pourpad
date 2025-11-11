import { NextResponse } from "next/server"

import { z } from "zod"

import { createRouteHandlerSupabaseClient } from "@/lib/supabase"

const signupSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(100, "Name is too long"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Password confirmation is required"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export async function POST(request: Request) {
  const supabase = await createRouteHandlerSupabaseClient()

  try {
    const body = await request.json()
    const { name, email, password } = signupSchema.parse(body)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: name,
        },
      },
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status ?? 400 }
      )
    }

    if (!data.session) {
      return NextResponse.json(
        {
          success: true,
          requiresEmailConfirmation: true,
          message:
            "Check your email to confirm your account before signing in.",
        },
        { status: 200 }
      )
    }

    return NextResponse.json({ success: true, redirect: "/" })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.flatten().fieldErrors },
        { status: 422 }
      )
    }

    console.error("Signup error", error)
    return NextResponse.json(
      { error: "Unable to create account" },
      { status: 500 }
    )
  }
}
