import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type AccountOverviewCardProps = {
  displayName: string
  email: string
  joinedAt?: string
  avatarInitial: string
  avatarUrl?: string | null
}

export function AccountOverviewCard({ displayName, email, joinedAt, avatarInitial, avatarUrl }: AccountOverviewCardProps) {
  return (
    <Card className="border">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-12 w-12 text-base">
          {avatarUrl ? <AvatarImage src={avatarUrl} alt={`${displayName}'s avatar`} /> : null}
          <AvatarFallback>{avatarInitial}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <CardTitle className="text-xl font-semibold tracking-tight">{displayName}</CardTitle>
          <span className="text-sm text-muted-foreground">{email}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-wide text-muted-foreground">
          <Badge variant="secondary" className="rounded-full px-3 py-1 text-[11px]">
            Account
          </Badge>
          {joinedAt ? <span>Member since {formatDate(joinedAt)}</span> : null}
        </div>
        <p className="text-sm text-muted-foreground">
          Manage your profile details, secure your account, and control your data.
        </p>
      </CardContent>
    </Card>
  )
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(iso))
}
