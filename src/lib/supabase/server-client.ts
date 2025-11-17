import { cookies } from "next/headers"

import { createServerClient, type CookieOptions, type CookieOptionsWithName } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase environment variables are missing")
}

type MutableCookieStore = Awaited<ReturnType<typeof cookies>> & {
  set?: (options: { name: string; value: string } & CookieOptions) => void
}

export async function createServerSupabaseClient(cookieOptions?: CookieOptionsWithName) {
  const cookieStore = (await cookies()) as MutableCookieStore

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookieOptions,
    cookies: {
      getAll: async () =>
        cookieStore.getAll().map(({ name, value }) => ({ name, value })),
      setAll: async (cookiesToSet) => {
        if (typeof cookieStore.set !== "function") return

        cookiesToSet.forEach((cookie) => {
          cookieStore.set?.({
            name: cookie.name,
            value: cookie.value,
            ...(cookie.options ?? {}),
          })
        })
      },
    },
  })
}
