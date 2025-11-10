import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

export function PublicFiltersSection() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-medium tracking-tight">Public recipes</h2>
        <p className="mt-2 text-muted-foreground">Browse recipes shared by the community</p>
      </div>
      
      <Card className="p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="search" className="font-medium tracking-tight">Search recipes</Label>
            <Input 
              id="search" 
              placeholder="Search by title or description" 
              className="w-full"
            />
          </div>
          
          <Separator orientation="vertical" className="hidden h-10 md:block" />
          
          <div className="space-y-2 md:w-48">
            <Label htmlFor="brewer-filter" className="font-medium tracking-tight">Brewer type</Label>
            <Select>
              <SelectTrigger id="brewer-filter">
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
          
          <Separator orientation="vertical" className="hidden h-10 md:block" />
          
          <div className="space-y-2 md:w-48">
            <Label htmlFor="sort" className="font-medium tracking-tight">Sort by</Label>
            <Select>
              <SelectTrigger id="sort">
                <SelectValue placeholder="Most recent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most recent</SelectItem>
                <SelectItem value="popular">Most popular</SelectItem>
                <SelectItem value="upvoted">Most upvoted</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button variant="outline" className="font-medium tracking-tight md:w-auto">
            Clear filters
          </Button>
        </div>
      </Card>
    </section>
  )
}
