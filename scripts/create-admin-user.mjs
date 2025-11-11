import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  console.error("NEXT_PUBLIC_SUPABASE_URL is not set")
  process.exit(1)
}

if (!serviceRoleKey) {
  console.error("SUPABASE_SERVICE_ROLE_KEY is not set")
  process.exit(1)
}

const args = process.argv.slice(2)

function getFlagValue(flag) {
  const index = args.indexOf(flag)

  if (index === -1 || index === args.length - 1) {
    console.error(`Missing value for ${flag}`)
    process.exit(1)
  }

  return args[index + 1]
}

const email = getFlagValue("--email")
const password = getFlagValue("--password")
const displayName = getFlagValue("--display-name")

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

try {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      display_name: displayName,
    },
  })

  if (error) {
    console.error("Failed to create user:", error.message)
    process.exit(1)
  }

  const userId = data.user?.id

  if (!userId) {
    console.error("User ID missing from response")
    process.exit(1)
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({
      id: userId,
      display_name: displayName,
      role: "admin",
    })

  if (profileError) {
    console.error("Failed to promote admin profile:", profileError.message)
    process.exit(1)
  }

  console.log("Admin user created successfully")
  console.log(`User ID: ${userId}`)
} catch (error) {
  console.error("Unexpected error:", error instanceof Error ? error.message : error)
  process.exit(1)
}
