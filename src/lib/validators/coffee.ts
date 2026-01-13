import { z } from "zod"

export const roastLevels = ["light", "medium", "medium-dark", "dark"] as const
export const processTypes = ["washed", "natural", "honey", "anaerobic", "wet-hulled", "other"] as const

export const roastLevelSchema = z.enum(roastLevels)
export const processTypeSchema = z.enum(processTypes)

export const coffeeCreateSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(120, "Name is too long")
    .transform((value) => value.trim()),
  roaster: z
    .string()
    .max(120, "Roaster name is too long")
    .optional()
    .transform((value) => value?.trim() || undefined),
  origin: z
    .string()
    .max(120, "Origin is too long")
    .optional()
    .transform((value) => value?.trim() || undefined),
  roastLevel: roastLevelSchema.optional(),
  processType: processTypeSchema.optional(),
  roastedDate: z.string().optional().transform((value) => value?.trim() || undefined),
  tasteProfile: z
    .array(z.string().max(50, "Taste note is too long"))
    .max(10, "Maximum 10 taste notes")
    .optional()
    .transform((value) => value?.filter((v) => v.trim().length > 0) || undefined),
  notes: z
    .string()
    .max(500, "Notes must be 500 characters or fewer")
    .optional()
    .transform((value) => value?.trim() || undefined),
})

export type CoffeeCreateSchema = typeof coffeeCreateSchema
export type CoffeeCreateFormValues = z.input<typeof coffeeCreateSchema>
