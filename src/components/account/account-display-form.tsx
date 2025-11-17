"use client"

import type { ChangeEvent } from "react"
import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

const profileSchema = z.object({
  displayName: z.string().trim().min(2, "Display name must be at least 2 characters"),
})

const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"] as const
const MAX_FILE_BYTES = 5 * 1024 * 1024

type ProfileFormValues = z.infer<typeof profileSchema>

type AccountDisplayFormProps = {
  initialDisplayName: string
  initialAvatarUrl?: string | null
  email: string
  userId: string
  onProfileUpdated?: (profile: { displayName: string; avatarUrl: string | null }) => void
}

export function AccountDisplayForm({
  initialDisplayName,
  initialAvatarUrl,
  email,
  userId,
  onProfileUpdated,
}: AccountDisplayFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(initialAvatarUrl ?? null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialAvatarUrl ?? null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: initialDisplayName,
    },
  })

  const displayNameValue = form.watch("displayName")

  useEffect(() => {
    form.reset({ displayName: initialDisplayName })
  }, [form, initialDisplayName])

  useEffect(() => {
    if (selectedFile) return
    setCurrentAvatarUrl(initialAvatarUrl ?? null)
    setPreviewUrl(initialAvatarUrl ?? null)
  }, [initialAvatarUrl, selectedFile])

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const onSubmit = async (values: ProfileFormValues) => {
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.set("displayName", values.displayName)
      if (selectedFile) {
        formData.set("avatar", selectedFile)
      }

      const response = await fetch("/api/account/profile", {
        method: "PUT",
        body: formData,
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        if (response.status === 422 && payload?.details) {
          const details = payload.details as Record<string, string[]>
          if (details.displayName?.length) {
            form.setError("displayName", { message: details.displayName[0] })
          }
        }

        const message = payload?.error ?? "Failed to update profile"
        toast.error(message)
        return
      }

      const payload = (await response.json()) as { profile: { displayName: string; avatarUrl: string | null } }

      form.reset({ displayName: payload.profile.displayName })
      setCurrentAvatarUrl(payload.profile.avatarUrl)
      setPreviewUrl(payload.profile.avatarUrl)
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      notifyProfileUpdated({
        displayName: payload.profile.displayName,
        avatarUrl: payload.profile.avatarUrl,
        email,
        userId,
      })
      onProfileUpdated?.({
        displayName: payload.profile.displayName,
        avatarUrl: payload.profile.avatarUrl,
      })
      toast.success("Profile updated")
    } catch (error) {
      console.error("Profile update failed", error)
      toast.error("Failed to update profile")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type as typeof ALLOWED_IMAGE_TYPES[number])) {
      toast.error("Unsupported image type")
      return
    }

    if (file.size > MAX_FILE_BYTES) {
      toast.error("Image must be 5MB or smaller")
      return
    }

    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl)
    }

    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleResetSelection = () => {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl)
    }
    setSelectedFile(null)
    setPreviewUrl(currentAvatarUrl)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
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
                    <input
                      className="border-input focus-visible:ring-ring flex h-10 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                      placeholder="Your name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  {previewUrl ? <AvatarImage src={previewUrl} alt="Profile preview" /> : null}
                  <AvatarFallback>{(displayNameValue || initialDisplayName).slice(0, 1).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSubmitting}
                  >
                    Upload image
                  </Button>
                  {selectedFile ? (
                    <Button type="button" variant="ghost" onClick={handleResetSelection} disabled={isSubmitting}>
                      Cancel selection
                    </Button>
                  ) : null}
                </div>
              </div>
              {selectedFile ? (
                <p className="text-xs text-muted-foreground">
                  {selectedFile.name} · {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              ) : null}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

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

export type ProfileBroadcastPayload = {
  displayName: string
  avatarUrl: string | null
  email: string
  userId: string
}

export type ProfileBroadcastEventDetail = ProfileBroadcastPayload | null

const PROFILE_STORAGE_KEY = "pourpad:lastProfile"
const PROFILE_EVENT_NAME = "pourpad:profile-updated"

function notifyProfileUpdated(payload: ProfileBroadcastPayload) {
  if (typeof window === "undefined") return

  try {
    window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // Ignore storage quota or privacy mode errors
  }

  try {
    const event = new CustomEvent<ProfileBroadcastEventDetail>(PROFILE_EVENT_NAME, { detail: payload })
    window.dispatchEvent(event)
  } catch {
    // CustomEvent may throw in older browsers; swallow silently
  }
}

function clearProfileBroadcast() {
  if (typeof window === "undefined") return

  try {
    window.localStorage.removeItem(PROFILE_STORAGE_KEY)
  } catch {
    // ignore storage access issues
  }

  try {
    const event = new CustomEvent<ProfileBroadcastEventDetail>(PROFILE_EVENT_NAME, { detail: null })
    window.dispatchEvent(event)
  } catch {
    // ignore
  }
}

export { PROFILE_EVENT_NAME, PROFILE_STORAGE_KEY, clearProfileBroadcast, notifyProfileUpdated }
