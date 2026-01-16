export type RecipePourInfo = {
  id: string
  order: number
  startTimeSeconds: number | null
  endTimeSeconds: number | null
  waterGrams: number | null
}

export type RecipeMetadata = {
  brewerType: string
  description?: string | null
  coffeeWeight?: number | null
  grindSize?: string | null
  grinderId?: string | null
  grinderName?: string | null
  coffeeId?: string | null
  coffeeName?: string | null
  coffeeFilterId?: string | null
  coffeeFilterName?: string | null
  waterTemp?: number | null
  totalBrewTimeSeconds?: number | null
}

export type RecipeAuthor = {
  id: string
  displayName: string
  avatarUrl?: string | null
}

export type RecipeDetail = {
  id: string
  title: string
  createdAt: string
  metadata: RecipeMetadata
  pours: RecipePourInfo[]
  author: RecipeAuthor
}

export type DailyBrewSummary = {
  id: string
  title: string
  createdAt: string
  description?: string | null
  brewerType: string
  isPublic: boolean
  metadata: Omit<RecipeMetadata, "description"> & { description?: string | null }
  pours: RecipePourInfo[]
}

export type SavedRecipeSummary = {
  id: string
  title: string
  createdAt: string
  description?: string | null
  brewerType: string
  author: RecipeAuthor
  metadata: RecipeMetadata
  pours?: RecipePourInfo[]
}

export type DashboardData = {
  generator: {
    userId: string
  }
  dailyBrews: DailyBrewSummary[]
  savedRecipes: SavedRecipeSummary[]
}
