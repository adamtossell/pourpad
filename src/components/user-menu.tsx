"use client"

import { useTransition } from "react"
import Link from "next/link"

import { Bookmark, Coffee, Home, LogOut } from "lucide-react"

import { logoutAction } from "@/app/actions/logout"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type UserMenuProps = {
  user: {
    displayName: string
    email: string
    firstInitial: string
  }
}

export function UserMenu({ user }: UserMenuProps) {
  const [isPending, startTransition] = useTransition()

  const handleLogout = () => {
    startTransition(() => {
      void logoutAction()
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="border-input hover:bg-muted focus-visible:ring-ring flex h-9 w-9 items-center justify-center rounded-full border text-sm font-medium uppercase transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          aria-label="Open user menu"
          data-state={isPending ? "pending" : undefined}
        >
          <Avatar className="h-9 w-9">
            <AvatarFallback>{user.firstInitial}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="truncate text-sm font-semibold">{user.displayName}</span>
          <span className="text-muted-foreground text-xs font-normal truncate">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="gap-2">
          <Link href="/dashboard" className="flex w-full items-center">
            <Home className="h-4 w-4" />
            <span className="ml-2">Dashboard</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="gap-2">
          <Link href="/pours" className="flex w-full items-center">
            <Coffee className="h-4 w-4" />
            <span className="ml-2">Your pours</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="gap-2">
          <Link href="/saved" className="flex w-full items-center">
            <Bookmark className="h-4 w-4" />
            <span className="ml-2">Saved</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault()
            handleLogout()
          }}
          className="text-rose-600 focus:text-rose-600 gap-2"
        >
          <LogOut className="h-4 w-4" />
          <span className="ml-2">Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
