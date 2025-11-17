import type { DailyBrewSummary, RecipePourInfo, SavedRecipeSummary } from "@/lib/types/dashboard"

type NumericLike = number | string | null

type RecipePourRow = {
  id: string
  order_index: number | null
  start_time: number | null
  end_time: number | null
  water_g: number | null
}

type RecipeRow = {
  id: string
  title: string
  description: string | null
  brewer_type: string
  coffee_weight: NumericLike
  grind_size: string | null
  water_temp: NumericLike
  total_brew_time: NumericLike
  is_public: boolean
  created_at: string
  recipe_pours: RecipePourRow[] | null
}

type RecipeAuthorRow = {
  id: string
  display_name: string | null
  avatar_url: string | null
}

type SavedRecipeRow = {
  created_at: string
  recipe: (RecipeRow & {
    user_id: string
    owner: RecipeAuthorRow | null
  }) | null
}

export function mapRecipeRowToDailyBrew(row: RecipeRow): DailyBrewSummary {
  return {
    id: row.id,
    title: row.title,
    createdAt: row.created_at,
    description: row.description,
    brewerType: row.brewer_type,
    isPublic: Boolean(row.is_public),
    metadata: {
      brewerType: row.brewer_type,
      description: row.description,
      coffeeWeight: toNumber(row.coffee_weight),
      grindSize: row.grind_size,
      waterTemp: toNumber(row.water_temp),
      totalBrewTimeSeconds: toNumber(row.total_brew_time),
    },
    pours: (row.recipe_pours ?? []).map(mapPourRow),
  }
}

export function mapSavedRecipeRow(row: SavedRecipeRow): SavedRecipeSummary | null {
  if (!row.recipe) return null

  const pours = (row.recipe.recipe_pours ?? []).map(mapPourRow)
  const owner = row.recipe.owner

  return {
    id: row.recipe.id,
    title: row.recipe.title,
    createdAt: row.recipe.created_at,
    description: row.recipe.description,
    brewerType: row.recipe.brewer_type,
    author: {
      id: owner?.id ?? row.recipe.user_id,
      displayName: owner?.display_name?.trim() || "Unknown brewer",
      avatarUrl: owner?.avatar_url ?? null,
    },
    metadata: {
      brewerType: row.recipe.brewer_type,
      description: row.recipe.description,
      coffeeWeight: toNumber(row.recipe.coffee_weight),
      grindSize: row.recipe.grind_size,
      waterTemp: toNumber(row.recipe.water_temp),
      totalBrewTimeSeconds: toNumber(row.recipe.total_brew_time),
    },
    pours: pours.length > 0 ? pours : undefined,
  }
}

function mapPourRow(row: RecipePourRow): RecipePourInfo {
  return {
    id: row.id,
    order: row.order_index ?? 0,
    startTimeSeconds: row.start_time,
    endTimeSeconds: row.end_time,
    waterGrams: row.water_g,
  }
}

function toNumber(value: NumericLike): number | null {
  if (value == null) return null
  if (typeof value === "number") return Number.isFinite(value) ? value : null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}
