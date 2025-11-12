export type RecipeCreateResponse = {
  recipeId: string
}

export type ApiErrorResponse = {
  error: string
  details?: Record<string, string[]>
}
