import { z } from "zod"

export const brewerTypes = [
  "v60",
  "chemex",
  "aeropress",
  "french-press",
  "kalita",
  "clever",
  "orea",
  "fellow-stagg",
  "other",
] as const

const optionalTrimmedString = z
  .union([z.string(), z.undefined(), z.null()])
  .transform((value) => {
    if (value === undefined || value === null) return undefined
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : undefined
  })

const nullableTrimmedString = optionalTrimmedString.transform(
  (value) => (value && value.length > 0 ? value : null)
)

const optionalTitleString = z
  .string()
  .optional()
  .transform((value) => value?.trim() ?? "")
  .refine((value) => value.length <= 120, {
    message: "Recipe title must be 120 characters or fewer",
  })
  .transform((value) => (value.length > 0 ? value : undefined))

export const recipePourSchema = z.object({
  startTime: z.number().int().min(0),
  endTime: z.number().int().min(0),
  water: z.number().int().min(0),
  orderIndex: z.number().int().min(0),
})

export const recipeCreateSchema = z.object({
  title: optionalTitleString,
  description: nullableTrimmedString,
  brewerType: z.enum(brewerTypes, {
    errorMap: () => ({ message: "Select a brewer type" }),
  }),
  coffeeWeight: z.number().positive().max(1000).optional(),
  grindSize: nullableTrimmedString,
  grinderId: optionalTrimmedString,
  coffeeId: optionalTrimmedString,
  waterTemp: z.number().int().positive().max(150).optional(),
  totalBrewTime: z.number().int().positive().max(3600).optional(),
  pours: z
    .array(recipePourSchema)
    .min(1, "At least one pour is required")
    .max(20, "Maximum of 20 pours"),
})

export const recipeUpdateSchema = z.object({
  title: optionalTitleString,
  description: nullableTrimmedString,
  brewerType: z.enum(brewerTypes, {
    errorMap: () => ({ message: "Select a brewer type" }),
  }),
  coffeeWeight: z.number().positive().max(1000).optional(),
  grindSize: nullableTrimmedString,
  grinderId: optionalTrimmedString,
  coffeeId: optionalTrimmedString,
  waterTemp: z.number().int().positive().max(150).optional(),
  totalBrewTime: z.number().int().positive().max(3600).optional(),
  pours: z
    .array(recipePourSchema)
    .min(1, "At least one pour is required")
    .max(20, "Maximum of 20 pours"),
})

export type RecipeCreateInput = z.infer<typeof recipeCreateSchema>
export type RecipeUpdateInput = z.infer<typeof recipeUpdateSchema>
export type RecipePourInput = z.infer<typeof recipePourSchema>
