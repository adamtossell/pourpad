import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function RecipeGeneratorSection() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium tracking-tight">Create, save & share your daily pours</h1>
        <p className="mt-2 text-muted-foreground">Create and share your perfect coffee recipe</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium tracking-tight">Pour tracker</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="font-medium tracking-tight">Recipe title</Label>
            <Input id="title" placeholder="Enter recipe name" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="font-medium tracking-tight">Tasting notes</Label>
            <Textarea 
              id="description" 
              placeholder="Describe your recipe and brewing notes"
              rows={3}
            />
          </div>
          
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="brewer" className="font-medium tracking-tight">Brewer type</Label>
              <Select>
                <SelectTrigger id="brewer" className="w-full">
                  <SelectValue placeholder="Select brewer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="v60">Hario V60</SelectItem>
                  <SelectItem value="chemex">Chemex</SelectItem>
                  <SelectItem value="aeropress">Aeropress</SelectItem>
                  <SelectItem value="french-press">French press</SelectItem>
                  <SelectItem value="kalita">Kalita Wave</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="coffee-weight" className="font-medium tracking-tight">Coffee weight (g)</Label>
              <Input id="coffee-weight" type="number" placeholder="20" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="grind-size" className="font-medium tracking-tight">Grind size</Label>
              <Input id="grind-size" placeholder="Medium-fine" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="water-temp" className="font-medium tracking-tight">Water temperature (°C)</Label>
              <Input id="water-temp" type="number" placeholder="93" />
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium tracking-tight">Pour schedule</h3>
              <Button variant="outline" disabled className="font-medium tracking-tight">
                <Plus className="h-4 w-4 mr-2" />
                Add pour
              </Button>
            </div>
            
            <div className="flex items-start gap-4">
              <span className="mt-2 text-sm text-muted-foreground font-medium tracking-tight">Pour 1</span>
              <div className="grid flex-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Input type="text" placeholder="Start (0:00)" />
                </div>
                <div className="space-y-2">
                  <Input type="text" placeholder="End (0:30)" />
                </div>
                <div className="space-y-2">
                  <Input type="text" placeholder="Water (g)" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="total-brew-time" className="font-medium tracking-tight">Total brew time (seconds)</Label>
            <Input id="total-brew-time" type="number" placeholder="3:00" className="max-w-48" />
          </div>
        </CardContent>
        <CardFooter className="flex gap-3">
          <Button variant="outline" disabled className="flex-1 font-medium tracking-tight">
            Publish to the community
          </Button>
          <Button disabled className="flex-1 font-medium tracking-tight">
            Save
          </Button>
        </CardFooter>
      </Card>
    </section>
  )
}
