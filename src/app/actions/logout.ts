"use server"

import { redirect } from "next/navigation"

import { createServerSupabaseClient } from "@/lib/supabase"

export async function logoutAction() {
  const supabase = await createServerSupabaseClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error("Failed to sign out", error)
  }

  redirect("/")
}
