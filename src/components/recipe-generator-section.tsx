import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function RecipeGeneratorSection() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-medium tracking-tight">Recipe generator</h2>
        <p className="mt-2 text-muted-foreground">Create and share your perfect coffee recipe</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="font-medium tracking-tight">New recipe</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title" className="font-medium tracking-tight">Recipe title</Label>
              <Input id="title" placeholder="Enter recipe name" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="brewer" className="font-medium tracking-tight">Brewer type</Label>
              <Select>
                <SelectTrigger id="brewer">
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
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="font-medium tracking-tight">Description</Label>
            <Textarea 
              id="description" 
              placeholder="Describe your recipe and brewing notes"
              rows={3}
            />
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
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
          
          <div className="space-y-2">
            <Label htmlFor="total-brew-time" className="font-medium tracking-tight">Total brew time (seconds)</Label>
            <Input id="total-brew-time" type="number" placeholder="180" />
          </div>
          
          <Accordion type="single" collapsible className="border rounded-lg px-4">
            <AccordionItem value="pours" className="border-0">
              <AccordionTrigger className="font-medium tracking-tight hover:no-underline">
                Pours
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="pour-1-start" className="font-medium tracking-tight">Start time (s)</Label>
                        <Input id="pour-1-start" type="number" placeholder="0" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pour-1-end" className="font-medium tracking-tight">End time (s)</Label>
                        <Input id="pour-1-end" type="number" placeholder="45" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pour-1-water" className="font-medium tracking-tight">Water amount (g)</Label>
                        <Input id="pour-1-water" type="number" placeholder="60" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="pour-2-start" className="font-medium tracking-tight">Start time (s)</Label>
                        <Input id="pour-2-start" type="number" placeholder="45" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pour-2-end" className="font-medium tracking-tight">End time (s)</Label>
                        <Input id="pour-2-end" type="number" placeholder="90" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pour-2-water" className="font-medium tracking-tight">Water amount (g)</Label>
                        <Input id="pour-2-water" type="number" placeholder="120" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Button disabled className="w-full font-medium tracking-tight">
                  Add pour
                </Button>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
        <CardFooter className="flex gap-3">
          <Button variant="outline" disabled className="flex-1 font-medium tracking-tight">
            Save as private
          </Button>
          <Button disabled className="flex-1 font-medium tracking-tight">
            Save & publish
          </Button>
        </CardFooter>
      </Card>
    </section>
  )
}
