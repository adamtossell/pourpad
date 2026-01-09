import { NextResponse } from "next/server"
import { z } from "zod"

import { createRouteHandlerSupabaseClient } from "@/lib/supabase"
import { recipeUpdateSchema } from "@/lib/validators/recipe"
import type { ApiErrorResponse, RecipeUpdateResponse } from "@/lib/types/recipes"

type RouteParams = {
  params: Promise<{ id: string }>
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id: recipeId } = await params
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
      { error: "You must be logged in to update a recipe" },
      { status: 401 }
    )
  }

  const { data: existingRecipe, error: fetchError } = await supabase
    .from("recipes")
    .select("id, user_id")
    .eq("id", recipeId)
    .single()

  if (fetchError || !existingRecipe) {
    return NextResponse.json<ApiErrorResponse>(
      { error: "Recipe not found" },
      { status: 404 }
    )
  }

  if (existingRecipe.user_id !== user.id) {
    return NextResponse.json<ApiErrorResponse>(
      { error: "You do not have permission to update this recipe" },
      { status: 403 }
    )
  }

  let payload: z.infer<typeof recipeUpdateSchema>

  try {
    const body = await request.json()
    payload = recipeUpdateSchema.parse(body)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Recipe update validation failed", error.flatten().fieldErrors)
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

  let grinderId: string | null = null
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

  const recipeUpdate = {
    title: payload.title ?? existingRecipe.id,
    description: payload.description ?? null,
    brewer_type: payload.brewerType,
    coffee_weight: payload.coffeeWeight ?? null,
    grind_size: payload.grindSize ?? null,
    grinder_id: grinderId,
    water_temp: payload.waterTemp ?? null,
    total_brew_time: payload.totalBrewTime ?? null,
  }

  const { error: updateError } = await supabase
    .from("recipes")
    .update(recipeUpdate)
    .eq("id", recipeId)

  if (updateError) {
    console.error("Failed to update recipe", updateError)
    return NextResponse.json<ApiErrorResponse>(
      { error: "Failed to update recipe" },
      { status: 500 }
    )
  }

  const { error: deletePoursError } = await supabase
    .from("recipe_pours")
    .delete()
    .eq("recipe_id", recipeId)

  if (deletePoursError) {
    console.error("Failed to delete existing pours", deletePoursError)
    return NextResponse.json<ApiErrorResponse>(
      { error: "Failed to update recipe pours" },
      { status: 500 }
    )
  }

  const poursToInsert = payload.pours.map((pour) => ({
    recipe_id: recipeId,
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
      return NextResponse.json<ApiErrorResponse>(
        { error: "Failed to update recipe pours" },
        { status: 500 }
      )
    }
  }

  return NextResponse.json<RecipeUpdateResponse>(
    { recipeId },
    { status: 200 }
  )
}
