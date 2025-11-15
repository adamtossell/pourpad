import { z } from "zod"

export const grinderScaleTypes = ["text", "numeric", "stepped"] as const

export const grinderScaleTypeSchema = z.enum(grinderScaleTypes)

export const grinderCreateSchema = z.object({
  brand: z
    .string()
    .max(120, "Brand is too long")
    .optional()
    .transform((value) => value?.trim() || undefined),
  model: z
    .string()
    .min(1, "Model is required")
    .max(120, "Model is too long")
    .transform((value) => value.trim()),
  scaleType: grinderScaleTypeSchema,
  defaultNotation: z
    .string()
    .max(120, "Notation is too long")
    .optional()
    .transform((value) => value?.trim() || undefined),
  notes: z
    .string()
    .max(500, "Notes must be 500 characters or fewer")
    .optional()
    .transform((value) => value?.trim() || undefined),
})

export type GrinderCreateSchema = typeof grinderCreateSchema
export type GrinderCreateFormValues = z.input<typeof grinderCreateSchema>
