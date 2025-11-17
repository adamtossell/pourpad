"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"

const signupSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z
      .string()
      .min(8, "Password confirmation must be at least 8 characters"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type SignupFormValues = z.infer<typeof signupSchema>

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [confirmationPending, setConfirmationPending] = useState(false)
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(null)
  const [isResending, setIsResending] = useState(false)
  const [isPending, startTransition] = useTransition()

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit = (values: SignupFormValues) => {
    setError(null)
    setInfo(null)
    setConfirmationPending(false)
    setConfirmationEmail(null)

    startTransition(async () => {
      try {
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        })

        const payload = await response.json()

        if (!response.ok) {
          setError(payload.error ?? "Unable to create account")
          return
        }

        if (payload.requiresEmailConfirmation) {
          setConfirmationPending(true)
          setConfirmationEmail(values.email)
          setInfo(null)
          form.reset()
          return
        }

        router.replace(payload.redirect ?? "/")
        router.refresh()
      } catch (submitError) {
        console.error(submitError)
        setError("Something went wrong. Please try again.")
      }
    })
  }

  const {
    formState: { errors },
  } = form

  const handleResendClick = async () => {
    if (!confirmationEmail) return

    setIsResending(true)
    setError(null)
    setInfo(null)

    try {
      const response = await fetch("/api/auth/resend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: confirmationEmail }),
      })

      const payload = await response.json()

      if (!response.ok) {
        setError(payload.error ?? "Unable to send confirmation email")
        return
      }

      setInfo(payload.message ?? "Confirmation email sent. Please check your inbox.")
    } catch (submitError) {
      console.error(submitError)
      setError("Something went wrong. Please try again.")
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          {confirmationPending ? (
            <>
              <CardTitle className="text-xl">Check your inbox</CardTitle>
              <CardDescription className="my-2">
                We have sent a confirmation link to {" "}
                <span className="font-medium text-foreground">{confirmationEmail}</span>. Click the link inside the email to verify your account.
              </CardDescription>
            </>
          ) : (
            <>
              <CardTitle className="text-xl">Create your account</CardTitle>
              <CardDescription>
                Use your email to get started
              </CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent>
          {confirmationPending ? (
            <div className="space-y-4 text-center">
              {info && (
                <p className="text-muted-foreground text-sm">{info}</p>
              )}
              {error && (
                <p className="text-destructive text-sm">{error}</p>
              )}
              <Button onClick={handleResendClick} disabled={isResending} className="w-full">
                {isResending ? "Sending..." : "Send another confirmation email"}
              </Button>
              <FieldDescription className="text-center">
                Already confirmed? <Link href="/login">Log in</Link>
              </FieldDescription>
            </div>
          ) : (
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="name">Full Name</FieldLabel>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    disabled={isPending}
                    {...form.register("name")}
                  />
                  {errors.name && (
                    <p className="text-destructive text-sm">
                      {errors.name.message}
                    </p>
                  )}
                </Field>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@email.com"
                    disabled={isPending}
                    autoComplete="email"
                    {...form.register("email")}
                  />
                  {errors.email && (
                    <p className="text-destructive text-sm">
                      {errors.email.message}
                    </p>
                  )}
                </Field>
                <Field>
                  <Field className="space-y-5">
                    <Field>
                      <FieldLabel htmlFor="password">Password</FieldLabel>
                      <PasswordInput
                        id="password"
                        disabled={isPending}
                        autoComplete="new-password"
                        {...form.register("password")}
                      />
                      {errors.password && (
                        <p className="text-destructive text-sm">
                          {errors.password.message}
                        </p>
                      )}
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="confirm-password">
                        Confirm Password
                      </FieldLabel>
                      <PasswordInput
                        id="confirm-password"
                        disabled={isPending}
                        autoComplete="new-password"
                        {...form.register("confirmPassword")}
                      />
                      {errors.confirmPassword && (
                        <p className="text-destructive text-sm">
                          {errors.confirmPassword.message}
                        </p>
                      )}
                    </Field>
                  </Field>
                  <FieldDescription>
                    Must be at least 8 characters long.
                  </FieldDescription>
                </Field>
                {error && (
                  <Field>
                    <p className="text-destructive text-sm text-center">{error}</p>
                  </Field>
                )}
                {info && (
                  <Field>
                    <p className="text-muted-foreground text-sm text-center">{info}</p>
                  </Field>
                )}
                <Field>
                  <Button type="submit" disabled={isPending} className="w-full">
                    {isPending ? "Creating account..." : "Create account"}
                  </Button>
                  <FieldDescription className="text-center !mt-2">
                    Already have an account?{" "}
                    <Link href="/login">Log in</Link>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          )}
        </CardContent>
      </Card>
      {!confirmationPending && (
        <FieldDescription className="px-6 text-center">
          By clicking continue, you agree to our{" "}
          <Link href="/terms">Terms</Link> and{" "}
          <Link href="/privacy">Privacy policy</Link>.
        </FieldDescription>
      )}
    </div>
  )
}