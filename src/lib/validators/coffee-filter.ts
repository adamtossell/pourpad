import { z } from "zod"

export const coffeeFilterCreateSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(120, "Name is too long")
    .transform((value) => value.trim()),
  brand: z
    .string()
    .max(120, "Brand name is too long")
    .optional()
    .transform((value) => value?.trim() || undefined),
  notes: z
    .string()
    .max(500, "Notes must be 500 characters or fewer")
    .optional()
    .transform((value) => value?.trim() || undefined),
})

export type CoffeeFilterCreateSchema = typeof coffeeFilterCreateSchema
export type CoffeeFilterCreateFormValues = z.input<typeof coffeeFilterCreateSchema>
