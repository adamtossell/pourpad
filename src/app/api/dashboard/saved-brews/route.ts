import { NextResponse } from "next/server"

import { mapSavedRecipeRow } from "@/lib/mappers/dashboard"
import { createRouteHandlerSupabaseClient } from "@/lib/supabase"
import type { SavedRecipeSummary } from "@/lib/types/dashboard"
import type { ApiErrorResponse } from "@/lib/types/recipes"

type SavedBrewsResponse = {
  savedBrews: SavedRecipeSummary[]
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
    .from("saved_recipes")
    .select(
      `
        created_at,
        recipe:recipes (
          id,
          user_id,
          title,
          description,
          brewer_type,
          coffee_weight,
          grind_size,
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
          owner:profiles!recipes_user_id_fkey (
            id,
            display_name,
            avatar_url
          )
        )
      `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .order("order_index", { ascending: true, referencedTable: "recipes.recipe_pours" })
    .limit(50)

  if (error) {
    console.error("Failed to load saved brews", error)
    return NextResponse.json<ApiErrorResponse>({ error: "Failed to load saved brews" }, { status: 500 })
  }

  const savedRows = (data ?? [])
    .map(mapSavedRecipeRow)
    .filter((recipe): recipe is SavedRecipeSummary => recipe !== null)

  const savedBrews = await attachSignedAvatarUrls(supabase, savedRows)

  return NextResponse.json<SavedBrewsResponse>({ savedBrews })
}

async function attachSignedAvatarUrls(
  supabase: Awaited<ReturnType<typeof createRouteHandlerSupabaseClient>>,
  recipes: SavedRecipeSummary[],
): Promise<SavedRecipeSummary[]> {
  const avatarPaths = Array.from(
    new Set(
      recipes
        .map((recipe) => recipe.author.avatarUrl)
        .filter((value): value is string => Boolean(value)),
    ),
  )

  if (avatarPaths.length === 0) {
    return recipes
  }

  const { data, error } = await supabase.storage.from("avatars").createSignedUrls(avatarPaths, 60 * 60)

  if (error) {
    console.error("Failed to create signed avatar URLs", error)
    return recipes.map((recipe) => ({ ...recipe, author: { ...recipe.author, avatarUrl: null } }))
  }

  const lookup = new Map<string, string>()
  for (const entry of data ?? []) {
    if (entry?.signedUrl && entry?.path) {
      lookup.set(entry.path, entry.signedUrl)
    }
  }

  return recipes.map((recipe) => ({
    ...recipe,
    author: {
      ...recipe.author,
      avatarUrl: recipe.author.avatarUrl ? lookup.get(recipe.author.avatarUrl) ?? null : null,
    },
  }))
}
