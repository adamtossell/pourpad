"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { CoffeeFilterCreateFormValues } from "@/lib/validators/coffee-filter"

type AddCoffeeFilterDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onClose: () => void
  form: UseFormReturn<CoffeeFilterCreateFormValues>
  onSubmit: (values: CoffeeFilterCreateFormValues) => void | Promise<void>
  isSubmitting: boolean
}

export function AddCoffeeFilterDialog({
  open,
  onOpenChange,
  onClose,
  form,
  onSubmit,
  isSubmitting,
}: AddCoffeeFilterDialogProps) {
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
            Add coffee filter
          </AlertDialogTitle>
          <AlertDialogDescription>
            Save details about your coffee filter for easy reference in future recipes.
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
                    <Input placeholder="Hario V60 02 White" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand</FormLabel>
                  <FormControl>
                    <Input placeholder="Hario" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional notes about this filter"
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
                  "Save filter"
                )}
              </Button>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
