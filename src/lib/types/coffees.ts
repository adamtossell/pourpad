export type RoastLevel = "light" | "medium" | "medium-dark" | "dark"

export type ProcessType = "washed" | "natural" | "honey" | "anaerobic" | "wet-hulled" | "other"

export type UserCoffee = {
  id: string
  name: string
  roaster?: string | null
  origin?: string | null
  roastLevel?: RoastLevel | null
  processType?: ProcessType | null
  roastedDate?: string | null
  tasteProfile?: string[] | null
  notes?: string | null
  imageUrl?: string | null
  createdAt: string
}

export type CoffeeListResponse = {
  coffees: UserCoffee[]
}

export type CoffeeCreateResponse = {
  coffee: UserCoffee
}
