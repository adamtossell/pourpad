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

const emailSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password is required"),
})

type EmailFormValues = z.infer<typeof emailSchema>

type AccountEmailFormProps = {
  initialEmail: string
}

export function AccountEmailForm({ initialEmail }: AccountEmailFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: initialEmail,
      password: "",
    },
  })

  const onSubmit = async (values: EmailFormValues) => {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/account/email", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        if (response.status === 422 && payload?.details) {
          const details = payload.details as Record<string, string[]>
          if (details.email?.length) {
            form.setError("email", { message: details.email[0] })
          }
          if (details.password?.length) {
            form.setError("password", { message: details.password[0] })
          }
        }

        const message = payload?.error ?? "Failed to update email"
        if (response.status === 401) {
          form.setError("password", { message })
        }
        toast.error(message)
        return
      }

      form.reset({ email: values.email, password: "" })
      toast.success("Email updated")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold tracking-tight">Email</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New email*</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password*</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                Update email
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
