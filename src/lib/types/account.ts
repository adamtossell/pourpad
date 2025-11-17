export type AccountProfile = {
  id: string
  email: string
  displayName: string
  avatarUrl: string | null
  joinedAt: string
}

export type AccountProfileResponse = {
  profile: AccountProfile
}

export type AccountProfileUpdateResponse = AccountProfileResponse

export type AccountEmailUpdateResponse = {
  success: true
  message?: string
}

export type AccountPasswordUpdateResponse = {
  success: true
  message?: string
}
