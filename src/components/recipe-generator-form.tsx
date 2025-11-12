"use client"

import * as React from "react"
import { useForm, useFieldArray, type FieldPath } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus, Minus } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { brewerTypes, recipeCreateSchema, type RecipeCreateInput } from "@/lib/validators/recipe"


const TIME_PATTERN = /^\d{1,2}:\d{2}$/
const preprocessNumeric = (value: unknown) => {
  if (value === null || value === undefined) return undefined
  if (typeof value === "string") {
    const trimmed = value.trim()
    if (trimmed.length === 0) return undefined
    const parsed = Number(trimmed)
    return Number.isFinite(parsed) ? parsed : Number.NaN
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : Number.NaN
  }
  return Number.NaN
}

const optionalPositiveNumberField = (options: {
  invalidMessage: string
  max?: { value: number; message: string }
}) =>
  z.preprocess(
    preprocessNumeric,
    z
      .number({
        invalid_type_error: options.invalidMessage,
        required_error: options.invalidMessage,
      })
      .refine((value) => Number.isFinite(value), {
        message: options.invalidMessage,
      })
      .positive({ message: options.invalidMessage })
      .refine(
        (value) =>
          options.max === undefined || value <= options.max.value,
        {
          message: options.max?.message ?? options.invalidMessage,
        }
      )
      .optional()
  )

const optionalPositiveIntegerField = (options: {
  invalidMessage: string
  max?: { value: number; message: string }
}) =>
  z.preprocess(
    preprocessNumeric,
    z
      .number({
        invalid_type_error: options.invalidMessage,
        required_error: options.invalidMessage,
      })
      .refine((value) => Number.isFinite(value), {
        message: options.invalidMessage,
      })
      .int({ message: options.invalidMessage })
      .positive({ message: options.invalidMessage })
      .refine(
        (value) =>
          options.max === undefined || value <= options.max.value,
        {
          message: options.max?.message ?? options.invalidMessage,
        }
      )
      .optional()
  )

const requiredPositiveIntegerField = (message: string) =>
  z.preprocess(
    preprocessNumeric,
    z
      .number({
        invalid_type_error: message,
        required_error: message,
      })
      .refine((value) => Number.isFinite(value), {
        message,
      })
      .int({ message })
      .positive({ message })
  )

const parseTimeString = (value: string) => {
  const [minutes, seconds] = value.split(":").map(Number)
  return minutes * 60 + seconds
}

const timeStringSchema = z
  .string()
  .trim()
  .min(1, "Enter a time in MM:SS format")
  .refine((value) => TIME_PATTERN.test(value), {
    message: "Use MM:SS format (e.g. 01:30)",
  })
  .refine((value) => Number(value.split(":")[1]) < 60, {
    message: "Seconds must be between 00 and 59",
  })
  .transform((value) => parseTimeString(value))
  .pipe(z.number().int().min(0).max(3600, "Maximum 60 minutes"))

const optionalTimeStringSchema = z
  .string()
  .optional()
  .transform((value) => value?.trim() ?? "")
  .refine((value) => value === "" || TIME_PATTERN.test(value), {
    message: "Use MM:SS format (e.g. 03:00)",
  })
  .refine((value) => value === "" || Number(value.split(":")[1]) < 60, {
    message: "Seconds must be between 00 and 59",
  })
  .transform((value) => (value === "" ? undefined : parseTimeString(value)))
  .pipe(z.number().int().positive().max(3600, "Maximum 60 minutes").optional())

const optionalTitleSchema = z
  .string()
  .optional()
  .transform((value) => value?.trim() ?? "")
  .refine((value) => value.length <= 120, {
    message: "Recipe title must be 120 characters or fewer",
  })
  .transform((value) => (value.length > 0 ? value : undefined))

const optionalDescriptionSchema = z
  .string()
  .optional()
  .transform((value) => value?.trim() ?? "")
  .refine((value) => value.length <= 500, {
    message: "Description must be 500 characters or fewer",
  })
  .transform((value) => (value.length > 0 ? value : undefined))

const optionalGrindSchema = z
  .string()
  .optional()
  .transform((value) => value?.trim() ?? "")
  .refine((value) => value.length <= 120, {
    message: "Grind size must be 120 characters or fewer",
  })
  .transform((value) => (value.length > 0 ? value : undefined))

const recipeFormSchema = z
  .object({
    title: optionalTitleSchema,
    description: optionalDescriptionSchema,
    brewerType: recipeCreateSchema.shape.brewerType.optional(),
    coffeeWeight: optionalPositiveNumberField({
      invalidMessage: "Enter a number",
      max: { value: 1000, message: "Maximum 1000 grams" },
    }),
    grindSize: optionalGrindSchema,
    waterTemp: optionalPositiveIntegerField({
      invalidMessage: "Enter a number",
      max: { value: 150, message: "Maximum 150°C" },
    }),
    totalBrewTime: optionalTimeStringSchema,
    pours: z
      .array(
        z
          .object({
            startTime: timeStringSchema,
            endTime: timeStringSchema,
            water: requiredPositiveIntegerField("Enter a number in grams"),
          })
          .superRefine((pour, ctx) => {
            if (pour.endTime < pour.startTime) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "End time must be after start time",
                path: ["endTime"],
              })
            }
          })
      )
      .min(1, { message: "Add at least one pour" })
      .max(20, { message: "Maximum of 20 pours" }),
  })
  .superRefine((data, ctx) => {
    if (!data.brewerType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select an option",
        path: ["brewerType"],
      })
    }

    if (data.pours.length > 1) {
      for (let i = 1; i < data.pours.length; i += 1) {
        const previous = data.pours[i - 1]
        const current = data.pours[i]
        if (current.startTime < previous.endTime) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Each pour must start after the prior pour ends",
            path: ["pours", i, "startTime"],
          })
        }
      }
    }
  })

type RecipeFormValues = z.input<typeof recipeFormSchema>
type RecipeFormParsedValues = z.output<typeof recipeFormSchema>

const createDefaultValues = (): RecipeFormValues => ({
  title: "",
  description: "",
  brewerType: undefined,
  coffeeWeight: "",
  grindSize: "",
  waterTemp: "",
  totalBrewTime: "",
  pours: [
    {
      startTime: "",
      endTime: "",
      water: "",
    },
  ],
})

type RecipeGeneratorFormProps = {
  userId: string | null
}

export function RecipeGeneratorForm({ userId }: RecipeGeneratorFormProps) {
  const form = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeFormSchema, undefined, { raw: true }),
    defaultValues: createDefaultValues(),
    mode: "onSubmit",
  })

  const {
    fields: pourFields,
    append,
    remove,
  } = useFieldArray({
    control: form.control,
    name: "pours",
  })

  const isSaving = form.formState.isSubmitting

  const handleAddPour = React.useCallback(() => {
    append({
      startTime: "",
      endTime: "",
      water: "",
    })
  }, [append])

  const handleSubmit = form.handleSubmit(async (values) => {
    if (!userId) {
      toast.error("Log in to save a recipe")
      return
    }

    const result = recipeFormSchema.safeParse(values)

    if (!result.success) {
      console.error("Recipe form validation errors", result.error.flatten().fieldErrors)
      result.error.issues.forEach((issue) => {
        if (issue.path.length > 0) {
          const fieldPath = issue.path.join(".") as FieldPath<RecipeFormValues>
          form.setError(fieldPath, {
            type: "manual",
            message: issue.message,
          })
        }
      })

      toast.error("Could not save recipe")
      return
    }

    const parsed: RecipeFormParsedValues = result.data

    const payload: RecipeCreateInput = {
      title: parsed.title,
      description: parsed.description ?? null,
      brewerType: parsed.brewerType,
      coffeeWeight: parsed.coffeeWeight,
      grindSize: parsed.grindSize ?? null,
      waterTemp: parsed.waterTemp,
      totalBrewTime: parsed.totalBrewTime,
      pours: parsed.pours.map((pour, index) => ({
        startTime: pour.startTime,
        endTime: pour.endTime,
        water: pour.water,
        orderIndex: index,
      })),
    }

    try {
      const response = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        let errorBody: { error?: string; details?: Record<string, string[]> } | null = null

        try {
          errorBody = await response.json()
        } catch (parseError) {
          console.error("Failed to parse recipe save error", parseError)
        }

        const detailMessage = errorBody?.details
          ? Object.values(errorBody.details).flat().join(" ")
          : undefined

        const message =
          response.status === 401
            ? "Log in to save a recipe"
            : detailMessage || errorBody?.error || "Could not save recipe"

        toast.error(message)
        return
      }

      toast.success("Recipe saved")
      form.reset(createDefaultValues())
    } catch (error) {
      console.error("Unexpected error while saving recipe", error)
      toast.error("Could not save recipe")
    }
  })

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <CardHeader>
            <CardTitle className="text-lg font-medium tracking-tight">Pour tracker</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipe title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Add a title if you like"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tasting notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your recipe and brewing notes"
                      rows={3}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-4">
              <FormField
                control={form.control}
                name="brewerType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="gap-0">
                      Brewer type<span aria-hidden="true">*</span>
                      <span className="sr-only"> required</span>
                    </FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value)}
                      value={field.value ?? undefined}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select brewer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {brewerTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {formatBrewerLabel(type)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="coffeeWeight"
                render={({ field }) => (
                  <FormItem>
                  <FormLabel>Coffee weight (g)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="20"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="grindSize"
                render={({ field }) => (
                  <FormItem>
                  <FormLabel>Grind size</FormLabel>
                    <FormControl>
                    <Input placeholder="Medium-fine" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="waterTemp"
                render={({ field }) => (
                  <FormItem>
                  <FormLabel>Water temperature (°C)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="93"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-mono text-lg font-medium tracking-tight">Pour schedule</h3>
                <Button
                  type="button"
                  variant="outline"
                  className="font-medium tracking-tight"
                  onClick={handleAddPour}
                  disabled={pourFields.length >= 20}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add pour
                </Button>
              </div>

              <div className="space-y-4">
                {pourFields.map((field, index) => (
                  <div key={field.id} className="flex items-start gap-4">
                    <Label className="mt-2 gap-0 text-sm text-muted-foreground font-medium tracking-tight">
                      Pour {index + 1}
                      <span aria-hidden="true">*</span>
                      <span className="sr-only"> required</span>
                    </Label>
                <div className="grid flex-1 gap-4 md:grid-cols-3">
                      <FormField
                        control={form.control}
                        name={`pours.${index}.startTime` as const}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="sr-only gap-0">
                              Start time (MM:SS) <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*:[0-9]{2}"
                                placeholder="00:00"
                                {...field}
                                value={field.value ?? ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`pours.${index}.endTime` as const}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="sr-only gap-0">
                              End time (MM:SS) <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*:[0-9]{2}"
                                placeholder="00:30"
                                {...field}
                                value={field.value ?? ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`pours.${index}.water` as const}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="sr-only gap-0">
                              Water (g) <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
                                placeholder="Water (g)"
                                {...field}
                                value={field.value ?? ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      className=""
                      onClick={() => remove(index)}
                      disabled={pourFields.length === 1}
                    >
                      <Minus className="h-4 w-4" />
                      <span className="sr-only">Remove pour</span>
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <FormField
              control={form.control}
              name="totalBrewTime"
              render={({ field }) => (
                <FormItem className="max-w-48">
                  <FormLabel>Total brew time</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*:[0-9]{2}"
                      placeholder="03:00"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="flex gap-3">
            <Button variant="outline" disabled className="flex-1 font-medium tracking-tight">
              Publish to the community
            </Button>
            <Button type="submit" className="flex-1 font-medium tracking-tight" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}

function formatBrewerLabel(value: (typeof brewerTypes)[number]) {
  switch (value) {
    case "v60":
      return "Hario V60"
    case "chemex":
      return "Chemex"
    case "aeropress":
      return "Aeropress"
    case "french-press":
      return "French press"
    case "kalita":
      return "Kalita Wave"
    case "clever":
      return "Clever Dripper"
    case "orea":
      return "Orea"
    case "fellow-stagg":
      return "Fellow Stagg"
    case "other":
    default:
      return "Other"
  }
}
