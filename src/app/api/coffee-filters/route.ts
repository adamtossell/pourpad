import { NextResponse } from "next/server"

import { z } from "zod"

import { createRouteHandlerSupabaseClient } from "@/lib/supabase"
import type { ApiErrorResponse } from "@/lib/types/recipes"
import type { CoffeeFilterListResponse, CoffeeFilterCreateResponse, UserCoffeeFilter } from "@/lib/types/coffee-filters"
import { coffeeFilterCreateSchema } from "@/lib/validators/coffee-filter"

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
    .from("user_coffee_filters")
    .select("id, name, brand, notes, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Failed to load coffee filters", error)
    return NextResponse.json<ApiErrorResponse>(
      { error: "Failed to load coffee filters" },
      { status: 500 },
    )
  }

  const coffeeFilters: UserCoffeeFilter[] = (data ?? []).map((filter) => ({
    id: filter.id,
    name: filter.name,
    brand: filter.brand,
    notes: filter.notes,
    createdAt: filter.created_at,
  }))

  return NextResponse.json<CoffeeFilterListResponse>({ coffeeFilters })
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

  let payload: z.infer<typeof coffeeFilterCreateSchema>

  try {
    const body = await request.json()
    payload = coffeeFilterCreateSchema.parse(body)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json<ApiErrorResponse>(
        { error: "Validation failed", details: error.flatten().fieldErrors },
        { status: 422 },
      )
    }

    console.error("Failed to parse coffee filter payload", error)
    return NextResponse.json<ApiErrorResponse>(
      { error: "Invalid request payload" },
      { status: 400 },
    )
  }

  const insert = {
    user_id: user.id,
    name: payload.name,
    brand: payload.brand ?? null,
    notes: payload.notes ?? null,
  }

  const { data, error } = await supabase
    .from("user_coffee_filters")
    .insert(insert)
    .select("id, name, brand, notes, created_at")
    .single()

  if (error || !data) {
    console.error("Failed to create coffee filter", error)
    return NextResponse.json<ApiErrorResponse>(
      { error: "Failed to save coffee filter" },
      { status: 500 },
    )
  }

  return NextResponse.json<CoffeeFilterCreateResponse>(
    {
      coffeeFilter: {
        id: data.id,
        name: data.name,
        brand: data.brand,
        notes: data.notes,
        createdAt: data.created_at,
      },
    },
    { status: 201 },
  )
}
