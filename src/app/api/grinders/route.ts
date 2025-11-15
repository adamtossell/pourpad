import { NextResponse } from "next/server"

import { z } from "zod"

import { createRouteHandlerSupabaseClient } from "@/lib/supabase"
import type { ApiErrorResponse } from "@/lib/types/recipes"
import type { GrinderListResponse, GrinderCreateResponse } from "@/lib/types/grinders"
import { grinderCreateSchema } from "@/lib/validators/grinder"

export async function GET() {
  const supabase = await createRouteHandlerSupabaseClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError) {
    console.error("Failed to fetch session", authError)
    return NextResponse.json<ApiErrorResponse>(
      { error: "Unable to validate session" },
      { status: 500 },
    )
  }

  if (!user) {
    return NextResponse.json<ApiErrorResponse>(
      { error: "You must be logged in" },
      { status: 401 },
    )
  }

  const { data, error } = await supabase
    .from("user_grinders")
    .select("id, model, brand, scale_type, default_notation, notes, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Failed to load grinders", error)
    return NextResponse.json<ApiErrorResponse>(
      { error: "Failed to load grinders" },
      { status: 500 },
    )
  }

  const grinders =
    data?.map((grinder) => ({
      id: grinder.id,
      model: grinder.model,
      brand: grinder.brand,
      scaleType: grinder.scale_type,
      defaultNotation: grinder.default_notation,
      notes: grinder.notes,
      createdAt: grinder.created_at,
    })) ?? []

  const recentResponse = await supabase
    .from("recipes")
    .select("grind_size")
    .eq("user_id", user.id)
    .not("grind_size", "is", null)
    .order("created_at", { ascending: false })
    .limit(5)

  const recentGrinds = recentResponse.data
    ?.map((row) => row.grind_size)
    .filter((value): value is string => !!value)
    .filter((value, index, array) => array.indexOf(value) === index)
    .slice(0, 3) ?? []

  return NextResponse.json<GrinderListResponse>({ grinders, recentGrinds })
}

export async function POST(request: Request) {
  const supabase = await createRouteHandlerSupabaseClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError) {
    console.error("Failed to fetch session", authError)
    return NextResponse.json<ApiErrorResponse>(
      { error: "Unable to validate session" },
      { status: 500 },
    )
  }

  if (!user) {
    return NextResponse.json<ApiErrorResponse>(
      { error: "You must be logged in" },
      { status: 401 },
    )
  }

  let payload: z.infer<typeof grinderCreateSchema>

  try {
    const body = await request.json()
    payload = grinderCreateSchema.parse(body)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json<ApiErrorResponse>(
        { error: "Validation failed", details: error.flatten().fieldErrors },
        { status: 422 },
      )
    }

    console.error("Failed to parse grinder payload", error)
    return NextResponse.json<ApiErrorResponse>(
      { error: "Invalid request payload" },
      { status: 400 },
    )
  }

  const insert = {
    user_id: user.id,
    model: payload.model,
    brand: payload.brand ?? null,
    scale_type: payload.scaleType,
    default_notation: payload.defaultNotation ?? null,
    notes: payload.notes ?? null,
  }

  const { data, error } = await supabase
    .from("user_grinders")
    .insert(insert)
    .select("id, model, brand, scale_type, default_notation, notes, created_at")
    .single()

  if (error || !data) {
    console.error("Failed to create grinder", error)
    return NextResponse.json<ApiErrorResponse>(
      { error: "Failed to save grinder" },
      { status: 500 },
    )
  }

  return NextResponse.json<GrinderCreateResponse>(
    {
      grinder: {
        id: data.id,
        model: data.model,
        brand: data.brand,
        scaleType: data.scale_type,
        defaultNotation: data.default_notation,
        notes: data.notes,
        createdAt: data.created_at,
      },
    },
    { status: 201 },
  )
}
