"use client"

import * as React from "react"
import { Loader2, Info } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { DefaultGrinder } from "@/lib/types/grinders"
import { formatScaleTypeLabel, GRINDER_SCALE_META } from "@/lib/constants/grinders"
import { cn } from "@/lib/utils"
import {
  grinderScaleTypes,
  type GrinderCreateFormValues,
} from "@/lib/validators/grinder"

type ManageGrindersDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onClose: () => void
  presets: DefaultGrinder[]
  onPresetSelect: (preset: DefaultGrinder) => void
  form: UseFormReturn<GrinderCreateFormValues>
  onSubmit: (values: GrinderCreateFormValues) => void | Promise<void>
  isSubmitting: boolean
}

const SCALE_TYPE_ITEMS = grinderScaleTypes.map((type) => ({
  value: type,
  label: formatScaleTypeLabel(type),
  description: GRINDER_SCALE_META[type].description,
}))

export function ManageGrindersDialog({
  open,
  onOpenChange,
  onClose,
  presets,
  onPresetSelect,
  form,
  onSubmit,
  isSubmitting,
}: ManageGrindersDialogProps) {
  const [activePresetId, setActivePresetId] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!open) {
      setActivePresetId(null)
    }
  }, [open])

  const handleDialogSubmit = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.stopPropagation()
      form.handleSubmit(onSubmit)(event)
    },
    [form, onSubmit],
  )

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-medium tracking-tight">
            Manage grinders
          </AlertDialogTitle>
          <AlertDialogDescription>
            Save grinders you reach for often or browse platform presets for quick reference.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-6 py-2">
          <section className="space-y-3">
            <h4 className="text-sm font-mono font-semibold uppercase tracking-tight text-muted-foreground">
              Platform presets
            </h4>
            <div className="max-h-64 overflow-y-auto p-2 rounded-xl bg-accent/50">
              <div className="grid gap-2 sm:grid-cols-2">
                {presets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    className={cn(
                      "flex flex-col items-start rounded-lg border border-border bg-accent/50 p-3 text-left transition hover:bg-accent hover:border-foreground/10",
                      activePresetId === preset.id &&
                        "border-primary bg-white hover:border-primary hover:bg-white",
                    )}
                    onClick={() => {
                      setActivePresetId(preset.id)
                      onPresetSelect(preset)
                    }}
                  >
                    <span className="text-sm font-semibold tracking-tight">
                      {preset.brand ? `${preset.brand} ` : ""}
                      {preset.model}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatScaleTypeLabel(preset.scaleType)}
                    </span>
                    {preset.defaultNotation ? (
                      <Badge variant="outline" className="mt-2 text-[11px]">
                        Suggested: {preset.defaultNotation}
                      </Badge>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="space-y-1">
              <h4 className="text-sm font-mono font-semibold uppercase tracking-tight text-muted-foreground">
                Add a grinder
              </h4>
              <p className="text-sm text-muted-foreground">
                Capture burr info, detents, or calibration notes for future recipes.
              </p>
            </div>

            <Form {...form}>
              <form className="space-y-3" onSubmit={handleDialogSubmit}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="brand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand</FormLabel>
                        <FormControl>
                          <Input placeholder="Fellow" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Model</FormLabel>
                        <FormControl>
                          <Input placeholder="Ode Gen 2" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="scaleType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notation style</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select notation style" />
                            </SelectTrigger>
                          </FormControl>
                          <TooltipProvider delayDuration={200} disableHoverableContent>
                            <SelectContent>
                              {SCALE_TYPE_ITEMS.map((item) => (
                                <SelectItem key={item.value} value={item.value}>
                                  <div className="flex w-full items-center gap-3 pr-6">
                                    <span className="flex-1 truncate font-medium">{item.label}</span>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span
                                          tabIndex={0}
                                          role="button"
                                          onPointerDown={(event) => event.preventDefault()}
                                          className="ml-auto flex h-6 w-6 items-center justify-center rounded-md border border-border/70 bg-muted text-muted-foreground ring-offset-background transition hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2"
                                        >
                                          <Info className="h-3.5 w-3.5" aria-hidden="true" />
                                          <span className="sr-only">About {item.label.toLowerCase()}</span>
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent side="right" align="center" className="max-w-[18rem]">
                                        <p>{item.description}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </TooltipProvider>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="defaultNotation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default notation</FormLabel>
                        <FormControl>
                          <Input placeholder="24 clicks" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Burr set, zero point, or other references"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                      "Save grinder"
                    )}
                  </Button>
                </AlertDialogFooter>
              </form>
            </Form>
          </section>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}