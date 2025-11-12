"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

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
      console.log("Email submit", values)
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
