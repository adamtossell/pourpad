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

const profileSchema = z.object({
  displayName: z.string().trim().min(2, "Display name must be at least 2 characters"),
  avatarUrl: z
    .string()
    .trim()
    .url("Enter a valid URL")
    .optional()
    .or(z.literal(""))
    .transform((value) => (value === "" ? undefined : value)),
})

type ProfileFormValues = z.infer<typeof profileSchema>

type AccountDisplayFormProps = {
  initialDisplayName: string
  initialAvatarUrl?: string | null
}

export function AccountDisplayForm({ initialDisplayName, initialAvatarUrl }: AccountDisplayFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: initialDisplayName,
      avatarUrl: initialAvatarUrl ?? "",
    },
  })

  const onSubmit = async (values: ProfileFormValues) => {
    setIsSubmitting(true)
    try {
      console.log("Profile submit", values)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold tracking-tight">Profile details</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display name*</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="avatarUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Avatar URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://…" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                Save changes
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
