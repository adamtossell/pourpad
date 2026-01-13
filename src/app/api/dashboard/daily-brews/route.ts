import { NextResponse } from "next/server"

import { mapRecipeRowToDailyBrew } from "@/lib/mappers/dashboard"
import { createRouteHandlerSupabaseClient } from "@/lib/supabase"
import type { DailyBrewSummary } from "@/lib/types/dashboard"
import type { ApiErrorResponse } from "@/lib/types/recipes"

type DailyBrewsResponse = {
  dailyBrews: DailyBrewSummary[]
}

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

  const { data, error } = await supabase
    .from("recipes")
    .select(
      `
        id,
        title,
        description,
        brewer_type,
        coffee_weight,
        grind_size,
        grinder_id,
        coffee_id,
        water_temp,
        total_brew_time,
        is_public,
        created_at,
        recipe_pours (
          id,
          order_index,
          start_time,
          end_time,
          water_g
        ),
        user_grinders (
          id,
          model,
          brand
        ),
        user_coffees (
          id,
          name
        )
      `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .order("order_index", { ascending: true, referencedTable: "recipe_pours" })
    .limit(30)

  if (error) {
    console.error("Failed to load daily brews", error)
    return NextResponse.json<ApiErrorResponse>({ error: "Failed to load daily brews" }, { status: 500 })
  }

  const dailyBrews = (data ?? []).map(mapRecipeRowToDailyBrew)

  return NextResponse.json<DailyBrewsResponse>({ dailyBrews })
}
