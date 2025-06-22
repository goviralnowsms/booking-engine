"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Search } from "lucide-react"
import { format } from "date-fns"
import type { SearchCriteria } from "@/app/page"

interface SearchFormProps {
  onSearch: (criteria: SearchCriteria) => void
}

const countries = ["South Africa", "Kenya", "Tanzania", "Uganda", "Rwanda", "Botswana", "Namibia", "Zimbabwe", "Zambia"]

const destinations = {
  "South Africa": ["Cape Town", "Johannesburg", "Kruger National Park", "Garden Route"],
  Kenya: ["Nairobi", "Masai Mara", "Amboseli", "Tsavo"],
  Tanzania: ["Arusha", "Serengeti", "Ngorongoro", "Zanzibar"],
  Uganda: ["Kampala", "Bwindi", "Queen Elizabeth NP", "Murchison Falls"],
  Rwanda: ["Kigali", "Volcanoes National Park", "Nyungwe Forest"],
  Botswana: ["Gaborone", "Okavango Delta", "Chobe", "Kalahari"],
  Namibia: ["Windhoek", "Sossusvlei", "Etosha", "Swakopmund"],
  Zimbabwe: ["Harare", "Victoria Falls", "Hwange", "Mana Pools"],
  Zambia: ["Lusaka", "South Luangwa", "Lower Zambezi", "Victoria Falls"],
}

const tourLevels = [
  { value: "basic", label: "Basic - Budget Friendly" },
  { value: "standard", label: "Standard - Comfortable" },
  { value: "luxury", label: "Luxury - Premium Experience" },
]

export function SearchForm({ onSearch }: SearchFormProps) {
  const [country, setCountry] = useState("")
  const [destination, setDestination] = useState("")
  const [tourLevel, setTourLevel] = useState("")
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // All fields are now optional, so we don't need to validate them
    onSearch({
      country,
      destination,
      tourLevel,
      // Only format dates if they are selected, otherwise use empty strings
      startDate: startDate ? format(startDate, "yyyy-MM-dd") : "",
      endDate: endDate ? format(endDate, "yyyy-MM-dd") : "",
      adults,
      children,
    })
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Discover Your African Adventure</h1>
        <p className="text-xl text-gray-600">
          Search and book authentic African tours - leave fields blank to see all available tours
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search Tours
          </CardTitle>
          <CardDescription>Find the perfect African adventure - all fields are optional</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select
                  value={country}
                  onValueChange={(value) => {
                    setCountry(value)
                    setDestination("")
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="destination">Destination</Label>
                <Select value={destination} onValueChange={setDestination} disabled={!country}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any destination" />
                  </SelectTrigger>
                  <SelectContent>
                    {country &&
                      destinations[country as keyof typeof destinations]?.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tourLevel">Tour Level</Label>
              <Select value={tourLevel} onValueChange={setTourLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Any tour level" />
                </SelectTrigger>
                <SelectContent>
                  {tourLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Any start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Any end date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      disabled={(date) => date < (startDate || new Date())}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="adults">Adults</Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={adults}
                  onChange={(e) => setAdults(Number.parseInt(e.target.value) || 1)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="children">Children</Label>
                <Input
                  type="number"
                  min="0"
                  max="10"
                  value={children}
                  onChange={(e) => setChildren(Number.parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg">
              <Search className="w-4 h-4 mr-2" />
              Search Tours
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
