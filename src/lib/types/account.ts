export type AccountProfile = {
  id: string
  email: string
  displayName: string
  avatarUrl: string | null
  joinedAt: string
  pendingEmail: string | null
}

export type AccountProfileResponse = {
  profile: AccountProfile
}

export type AccountProfileUpdateResponse = AccountProfileResponse

export type AccountEmailUpdateResponse = {
  success: true
  confirmationRequired: boolean
  pendingEmail: string | null
  message?: string
}

export type AccountPasswordUpdateResponse = {
  success: true
  message?: string
}
