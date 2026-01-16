import { NextResponse } from "next/server"

import { z } from "zod"

import { createRouteHandlerSupabaseClient } from "@/lib/supabase"
import { recipeCreateSchema } from "@/lib/validators/recipe"
import type { ApiErrorResponse, RecipeCreateResponse } from "@/lib/types/recipes"

export async function POST(request: Request) {
  const supabase = await createRouteHandlerSupabaseClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError) {
    console.error("Failed to retrieve user session", authError)
    return NextResponse.json<ApiErrorResponse>(
      { error: "Unable to determine user session" },
      { status: 500 }
    )
  }

  if (!user) {
    return NextResponse.json<ApiErrorResponse>(
      { error: "You must be logged in to save a recipe" },
      { status: 401 }
    )
  }

  let payload: z.infer<typeof recipeCreateSchema>

  try {
    const body = await request.json()
    payload = recipeCreateSchema.parse(body)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Recipe create validation failed", error.flatten().fieldErrors)
      return NextResponse.json<ApiErrorResponse>(
        { error: "Validation failed", details: error.flatten().fieldErrors },
        { status: 422 }
      )
    }

    console.error("Failed to parse recipe payload", error)
    return NextResponse.json<ApiErrorResponse>(
      { error: "Invalid request payload" },
      { status: 400 }
    )
  }

  let grinderId: string | undefined
  if (payload.grinderId) {
    const { data: grinder, error: grinderError } = await supabase
      .from("user_grinders")
      .select("id")
      .eq("id", payload.grinderId)
      .eq("user_id", user.id)
      .single()

    if (grinderError || !grinder) {
      return NextResponse.json<ApiErrorResponse>(
        { error: "Invalid grinder selection" },
        { status: 400 }
      )
    }

    grinderId = grinder.id
  }

  let coffeeId: string | undefined
  if (payload.coffeeId) {
    const { data: coffee, error: coffeeError } = await supabase
      .from("user_coffees")
      .select("id")
      .eq("id", payload.coffeeId)
      .eq("user_id", user.id)
      .single()

    if (coffeeError || !coffee) {
      return NextResponse.json<ApiErrorResponse>(
        { error: "Invalid coffee selection" },
        { status: 400 }
      )
    }

    coffeeId = coffee.id
  }

  let coffeeFilterId: string | undefined
  if (payload.coffeeFilterId) {
    const { data: coffeeFilter, error: coffeeFilterError } = await supabase
      .from("user_coffee_filters")
      .select("id")
      .eq("id", payload.coffeeFilterId)
      .eq("user_id", user.id)
      .single()

    if (coffeeFilterError || !coffeeFilter) {
      return NextResponse.json<ApiErrorResponse>(
        { error: "Invalid coffee filter selection" },
        { status: 400 }
      )
    }

    coffeeFilterId = coffeeFilter.id
  }

  const recipeInsert = {
    user_id: user.id,
    title: payload.title ?? generateDefaultRecipeTitle(),
    description: payload.description ?? null,
    brewer_type: payload.brewerType,
    coffee_weight: payload.coffeeWeight ?? null,
    grind_size: payload.grindSize ?? null,
    grinder_id: grinderId ?? null,
    coffee_id: coffeeId ?? null,
    coffee_filter_id: coffeeFilterId ?? null,
    water_temp: payload.waterTemp ?? null,
    total_brew_time: payload.totalBrewTime ?? null,
    is_public: false,
  }

  const {
    data: recipeData,
    error: recipeError,
  } = await supabase
    .from("recipes")
    .insert(recipeInsert)
    .select("id")
    .single()

  if (recipeError || !recipeData) {
    console.error("Failed to insert recipe", recipeError)
    return NextResponse.json<ApiErrorResponse>(
      { error: "Failed to save recipe" },
      { status: 500 }
    )
  }

  const poursToInsert = payload.pours.map((pour) => ({
    recipe_id: recipeData.id,
    start_time: pour.startTime,
    end_time: pour.endTime,
    water_g: pour.water,
    order_index: pour.orderIndex,
  }))

  if (poursToInsert.length > 0) {
    const { error: poursError } = await supabase
      .from("recipe_pours")
      .insert(poursToInsert)

    if (poursError) {
      console.error("Failed to insert recipe pours", poursError)

      const { error: cleanupError } = await supabase
        .from("recipes")
        .delete()
        .eq("id", recipeData.id)

      if (cleanupError) {
        console.error("Failed to roll back recipe after pour insert failure", cleanupError)
      }

      return NextResponse.json<ApiErrorResponse>(
        { error: "Failed to save recipe pours" },
        { status: 500 }
      )
    }
  }

  return NextResponse.json<RecipeCreateResponse>(
    { recipeId: recipeData.id },
    { status: 201 }
  )
}

function generateDefaultRecipeTitle() {
  const now = new Date()

  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  return formatter.format(now)
}
