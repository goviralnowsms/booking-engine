"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CalendarIcon, Search, MapPin, Users, Star, Filter, X } from "lucide-react"
import { format } from "date-fns"
import type { SearchCriteria } from "@/app/page"

interface EnhancedSearchFormProps {
  onSearch: (criteria: SearchCriteria) => void
}

const countries = [
  "South Africa",
  "Kenya",
  "Tanzania",
  "Uganda",
  "Rwanda",
  "Botswana",
  "Namibia",
  "Zimbabwe",
  "Zambia",
  "Ethiopia",
  "Madagascar",
  "Mozambique",
  "Ghana",
  "Morocco",
]

const destinations = {
  "South Africa": ["Cape Town", "Johannesburg", "Kruger National Park", "Garden Route", "Drakensberg", "Hermanus"],
  Kenya: ["Nairobi", "Masai Mara", "Amboseli", "Tsavo", "Lake Nakuru", "Samburu"],
  Tanzania: ["Arusha", "Serengeti", "Ngorongoro", "Zanzibar", "Kilimanjaro", "Tarangire"],
  Uganda: ["Kampala", "Bwindi", "Queen Elizabeth NP", "Murchison Falls", "Lake Bunyonyi"],
  Rwanda: ["Kigali", "Volcanoes National Park", "Nyungwe Forest", "Lake Kivu"],
  Botswana: ["Gaborone", "Okavango Delta", "Chobe", "Kalahari", "Moremi"],
  Namibia: ["Windhoek", "Sossusvlei", "Etosha", "Swakopmund", "Damaraland"],
  Zimbabwe: ["Harare", "Victoria Falls", "Hwange", "Mana Pools", "Great Zimbabwe"],
  Zambia: ["Lusaka", "South Luangwa", "Lower Zambezi", "Victoria Falls", "Kafue"],
}

const tourTypes = [
  { value: "safari", label: "Safari & Wildlife", icon: "🦁" },
  { value: "cultural", label: "Cultural Tours", icon: "🏛️" },
  { value: "adventure", label: "Adventure & Hiking", icon: "🏔️" },
  { value: "beach", label: "Beach & Islands", icon: "🏖️" },
  { value: "photography", label: "Photography Tours", icon: "📸" },
  { value: "luxury", label: "Luxury Experiences", icon: "✨" },
  { value: "family", label: "Family Friendly", icon: "👨‍👩‍👧‍👦" },
  { value: "honeymoon", label: "Romantic Getaways", icon: "💕" },
]

const tourLevels = [
  { value: "basic", label: "Basic", description: "Budget-friendly options", color: "bg-blue-100 text-blue-800" },
  {
    value: "standard",
    label: "Standard",
    description: "Comfortable experiences",
    color: "bg-green-100 text-green-800",
  },
  { value: "luxury", label: "Luxury", description: "Premium experiences", color: "bg-purple-100 text-purple-800" },
]

const durations = [
  { value: "1-3", label: "1-3 days" },
  { value: "4-7", label: "4-7 days" },
  { value: "8-14", label: "1-2 weeks" },
  { value: "15+", label: "2+ weeks" },
]

const budgetRanges = [
  { value: "0-1000", label: "Under $1,000" },
  { value: "1000-2500", label: "$1,000 - $2,500" },
  { value: "2500-5000", label: "$2,500 - $5,000" },
  { value: "5000+", label: "$5,000+" },
]

export function EnhancedSearchForm({ onSearch }: EnhancedSearchFormProps) {
  const [country, setCountry] = useState("")
  const [destination, setDestination] = useState("")
  const [tourLevel, setTourLevel] = useState("")
  const [tourType, setTourType] = useState("")
  const [duration, setDuration] = useState("")
  const [budget, setBudget] = useState("")
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const criteria: SearchCriteria = {
      country: country || undefined,
      destination: destination || undefined,
      tourLevel: tourLevel || undefined,
      tourType: tourType || undefined,
      duration: duration || undefined,
      budget: budget || undefined,
      startDate: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
      endDate: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
      adults: adults || 2,
      children: children || 0,
    }

    onSearch(criteria)
  }

  const clearFilters = () => {
    setCountry("")
    setDestination("")
    setTourLevel("")
    setTourType("")
    setDuration("")
    setBudget("")
    setStartDate(undefined)
    setEndDate(undefined)
    setAdults(2)
    setChildren(0)
  }

  const activeFiltersCount = [country, destination, tourLevel, tourType, duration, budget, startDate, endDate].filter(
    Boolean,
  ).length

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Discover Your <span className="text-orange-500">African Adventure</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          From thrilling safaris to cultural immersions, find the perfect African experience tailored to your dreams.
          All search fields are optional - explore everything or narrow down your perfect trip.
        </p>
      </div>

      {/* Quick Tour Types */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-center">Popular Tour Types</h3>
        <div className="flex flex-wrap justify-center gap-3">
          {tourTypes.map((type) => (
            <Button
              key={type.value}
              variant={tourType === type.value ? "default" : "outline"}
              onClick={() => setTourType(tourType === type.value ? "" : type.value)}
              className="flex items-center gap-2"
            >
              <span>{type.icon}</span>
              {type.label}
            </Button>
          ))}
        </div>
      </div>

      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Search className="w-6 h-6 text-orange-500" />
                Find Your Perfect Tour
              </CardTitle>
              <CardDescription className="text-base">
                Customize your search or leave fields blank to see all available tours
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Filter className="w-3 h-3" />
                  {activeFiltersCount} filters
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4 mr-1" />
                Clear All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Main Search Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Country
                </Label>
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

              <div className="space-y-2">
                <Label htmlFor="tourLevel" className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Tour Level
                </Label>
                <Select value={tourLevel} onValueChange={setTourLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any level" />
                  </SelectTrigger>
                  <SelectContent>
                    {tourLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        <div className="flex items-center gap-2">
                          <Badge className={level.color} variant="secondary">
                            {level.label}
                          </Badge>
                          <span className="text-sm text-gray-600">{level.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Departure Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Any departure date"}
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
                <Label>Return Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Any return date"}
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

            {/* Travelers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="adults" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Adults
                </Label>
                <Select value={adults.toString()} onValueChange={(value) => setAdults(Number.parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? "Adult" : "Adults"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="children">Children</Label>
                <Select value={children.toString()} onValueChange={(value) => setChildren(Number.parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[0, 1, 2, 3, 4, 5, 6].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? "Child" : "Children"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Advanced Filters Toggle */}
            <div className="flex justify-center">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                {showAdvanced ? "Hide" : "Show"} Advanced Filters
              </Button>
            </div>

            {/* Advanced Filters */}
            {showAdvanced && (
              <>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Select value={duration} onValueChange={setDuration}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any duration" />
                      </SelectTrigger>
                      <SelectContent>
                        {durations.map((d) => (
                          <SelectItem key={d.value} value={d.value}>
                            {d.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget Range</Label>
                    <Select value={budget} onValueChange={setBudget}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any budget" />
                      </SelectTrigger>
                      <SelectContent>
                        {budgetRanges.map((b) => (
                          <SelectItem key={b.value} value={b.value}>
                            {b.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}

            {/* Search Button */}
            <div className="flex justify-center pt-4">
              <Button type="submit" size="lg" className="px-12 py-3 text-lg">
                <Search className="w-5 h-5 mr-2" />
                Search African Tours
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Popular Destinations Preview */}
      <div className="mt-12 text-center">
        <h3 className="text-2xl font-semibold mb-6">Popular African Destinations</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {["Kruger", "Serengeti", "Masai Mara", "Victoria Falls", "Cape Town", "Zanzibar"].map((dest) => (
            <Card key={dest} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <div className="w-full h-24 bg-gradient-to-br from-orange-200 to-orange-400 rounded-lg mb-2 flex items-center justify-center">
                  <span className="text-2xl">🌍</span>
                </div>
                <p className="font-medium text-sm">{dest}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
