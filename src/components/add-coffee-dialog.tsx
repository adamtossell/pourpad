"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon, Loader2, Upload, X } from "lucide-react"
import type { UseFormReturn } from "react-hook-form"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { roastLevels, processTypes, type CoffeeCreateFormValues } from "@/lib/validators/coffee"

type AddCoffeeDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onClose: () => void
  form: UseFormReturn<CoffeeCreateFormValues>
  onSubmit: (values: CoffeeCreateFormValues, image: File | null) => void | Promise<void>
  isSubmitting: boolean
}

const ROAST_LEVEL_LABELS: Record<(typeof roastLevels)[number], string> = {
  light: "Light",
  medium: "Medium",
  "medium-dark": "Medium-Dark",
  dark: "Dark",
}

const PROCESS_TYPE_LABELS: Record<(typeof processTypes)[number], string> = {
  washed: "Washed",
  natural: "Natural",
  honey: "Honey",
  anaerobic: "Anaerobic",
  "wet-hulled": "Wet Hulled",
  other: "Other",
}

export function AddCoffeeDialog({
  open,
  onOpenChange,
  onClose,
  form,
  onSubmit,
  isSubmitting,
}: AddCoffeeDialogProps) {
  const [imageFile, setImageFile] = React.useState<File | null>(null)
  const [imagePreview, setImagePreview] = React.useState<string | null>(null)
  const [tasteInput, setTasteInput] = React.useState("")
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const watchedTasteProfile = form.watch("tasteProfile")
  const tasteProfile = React.useMemo(
    () => watchedTasteProfile ?? [],
    [watchedTasteProfile]
  )

  React.useEffect(() => {
    if (!open) {
      setImageFile(null)
      setImagePreview(null)
      setTasteInput("")
    }
  }, [open])

  const handleImageChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setImageFile(file)
      const url = URL.createObjectURL(file)
      setImagePreview(url)
    }
  }, [])

  const handleImageRemove = React.useCallback(() => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [])

  const handleTasteKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter" || event.key === ",") {
        event.preventDefault()
        const value = tasteInput.trim()
        if (value && tasteProfile.length < 10 && !tasteProfile.includes(value)) {
          form.setValue("tasteProfile", [...tasteProfile, value])
          setTasteInput("")
        }
      }
    },
    [tasteInput, tasteProfile, form],
  )

  const handleTasteRemove = React.useCallback(
    (index: number) => {
      const updated = tasteProfile.filter((_, i) => i !== index)
      form.setValue("tasteProfile", updated.length > 0 ? updated : undefined)
    },
    [tasteProfile, form],
  )

  const handleDialogSubmit = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.stopPropagation()
      form.handleSubmit((values) => onSubmit(values, imageFile))(event)
    },
    [form, onSubmit, imageFile],
  )

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-medium tracking-tight">
            Add coffee
          </AlertDialogTitle>
          <AlertDialogDescription>
            Save details about your coffee for easy reference in future recipes.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Form {...form}>
          <form className="space-y-4 py-2" onSubmit={handleDialogSubmit}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Name<span aria-hidden="true">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Ethiopian Yirgacheffe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="roaster"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Roaster</FormLabel>
                    <FormControl>
                      <Input placeholder="Counter Culture" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="origin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Origin</FormLabel>
                    <FormControl>
                      <Input placeholder="Ethiopia" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="roastLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Roast level</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? ""}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select roast level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roastLevels.map((level) => (
                          <SelectItem key={level} value={level}>
                            {ROAST_LEVEL_LABELS[level]}
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
                name="processType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Process type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? ""}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select process type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {processTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {PROCESS_TYPE_LABELS[type]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="roastedDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Roasted date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(new Date(field.value), "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => {
                          field.onChange(date ? format(date, "yyyy-MM-dd") : undefined)
                        }}
                        disabled={(date) => date > new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Taste profile</FormLabel>
              <Input
                placeholder="Type and press Enter (e.g., chocolate, citrus)"
                value={tasteInput}
                onChange={(e) => setTasteInput(e.target.value)}
                onKeyDown={handleTasteKeyDown}
                disabled={tasteProfile.length >= 10}
              />
              {tasteProfile.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {tasteProfile.map((taste, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-medium"
                    >
                      {taste}
                      <button
                        type="button"
                        onClick={() => handleTasteRemove(index)}
                        className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                      >
                        <X className="h-3 w-3" />
                        <span className="sr-only">Remove {taste}</span>
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                {tasteProfile.length}/10 notes added
              </p>
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional notes about this coffee"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Image</FormLabel>
              <div
                className="relative flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-accent/30 p-4 transition hover:border-foreground/30 hover:bg-accent/50"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleImageChange}
                />
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Coffee preview"
                      className="max-h-32 rounded-md object-contain"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleImageRemove()
                      }}
                      className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground shadow-sm hover:bg-destructive/90"
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove image</span>
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload an image
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPEG, or WebP (max 5MB)
                    </p>
                  </>
                )}
              </div>
            </div>

            <AlertDialogFooter className="gap-2 sm:gap-0">
              <AlertDialogCancel type="button" onClick={onClose}>
                Close
              </AlertDialogCancel>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                    Saving
                  </>
                ) : (
                  "Save coffee"
                )}
              </Button>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
