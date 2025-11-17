"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm your new password"),
  })
  .superRefine((values, ctx) => {
    if (values.newPassword !== values.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Passwords do not match",
      })
    }
  })

type PasswordFormValues = z.infer<typeof passwordSchema>

export function AccountPasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (values: PasswordFormValues) => {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/account/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        if (response.status === 422 && payload?.details) {
          const details = payload.details as Record<string, string[]>
          if (details.currentPassword?.length) {
            form.setError("currentPassword", { message: details.currentPassword[0] })
          }
          if (details.newPassword?.length) {
            form.setError("newPassword", { message: details.newPassword[0] })
          }
        }

        const message = payload?.error ?? "Failed to update password"
        if (response.status === 401) {
          form.setError("currentPassword", { message })
        }
        toast.error(message)
        return
      }

      form.reset({ currentPassword: "", newPassword: "", confirmPassword: "" })
      toast.success("Password updated")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold tracking-tight">Password</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current password*</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter current password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New password*</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter new password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm password*</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Confirm new password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                Update password
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
