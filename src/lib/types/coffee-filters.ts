export type UserCoffeeFilter = {
  id: string
  name: string
  brand?: string | null
  notes?: string | null
  createdAt: string
}

export type CoffeeFilterListResponse = {
  coffeeFilters: UserCoffeeFilter[]
}

export type CoffeeFilterCreateResponse = {
  coffeeFilter: UserCoffeeFilter
}
