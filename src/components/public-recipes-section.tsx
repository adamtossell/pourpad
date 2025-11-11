import { Coffee } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export function PublicRecipesSection() {

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-medium tracking-tight">Browse recipes shared by the community</h2>
      
      <div>
        <div className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1 space-y-2 md:min-w-120">
              <Label htmlFor="search" className="font-medium tracking-tight">Search recipes</Label>
              <Input 
                id="search" 
                placeholder="Search by title or description" 
                className="w-full"
              />
            </div>
          
            
            <div className="space-y-2 flex-1">
              <Label htmlFor="brewer-filter" className="font-medium tracking-tight">Brewer type</Label>
              <Select>
                <SelectTrigger id="brewer-filter" className="w-full">
                  <SelectValue placeholder="All brewers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All brewers</SelectItem>
                  <SelectItem value="v60">Hario V60</SelectItem>
                  <SelectItem value="chemex">Chemex</SelectItem>
                  <SelectItem value="aeropress">Aeropress</SelectItem>
                  <SelectItem value="french-press">French press</SelectItem>
                  <SelectItem value="kalita">Kalita Wave</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            
            <div className="space-y-2 flex-1">
              <Label htmlFor="sort" className="font-medium tracking-tight">Sort by</Label>
              <Select>
                <SelectTrigger id="sort" className="w-full">
                  <SelectValue placeholder="Most recent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most recent</SelectItem>
                  <SelectItem value="popular">Most popular</SelectItem>
                  <SelectItem value="upvoted">Most upvoted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button variant="ghost" className="font-medium tracking-tight md:w-auto">
              Clear filters
            </Button>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-white border border-border shadow-xs p-3 mb-4">
              <Coffee className="h-4 w-4 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium tracking-tight">No recipes yet</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm">
              Be the first to share your coffee recipe with the community
            </p>
          </div>
        </div>
        
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" className="font-medium tracking-tight" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive className="font-medium tracking-tight">
                  1
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" className="font-medium tracking-tight">
                  2
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" className="font-medium tracking-tight">
                  3
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" className="font-medium tracking-tight">
                  10
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" className="font-medium tracking-tight" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </section>
  )
}