export type GrinderScaleType = "text" | "numeric" | "stepped"

export type UserGrinder = {
  id: string
  model: string
  brand?: string | null
  scaleType: GrinderScaleType
  defaultNotation?: string | null
  notes?: string | null
  createdAt: string
}

export type DefaultGrinder = {
  id: string
  model: string
  brand?: string | null
  scaleType: GrinderScaleType
  defaultNotation?: string | null
  metadata?: Record<string, unknown> | null
  createdAt: string
}

export type GrinderListResponse = {
  grinders: UserGrinder[]
  recentGrinds: string[]
}

export type DefaultGrinderListResponse = {
  grinders: DefaultGrinder[]
}

export type GrinderCreateResponse = {
  grinder: UserGrinder
}

export type GrinderCreatePayload = {
  model: string
  brand?: string
  scaleType: GrinderScaleType
  defaultNotation?: string
  notes?: string
}

export type GrinderImportPayload = {
  defaultGrinderId: string
}
