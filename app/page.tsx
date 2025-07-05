import { SearchForm } from "@/components/search-form"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Star } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">This is Africa</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-700 hover:text-orange-600">
                Tours
              </a>
              <a href="#" className="text-gray-700 hover:text-orange-600">
                About
              </a>
              <a href="#" className="text-gray-700 hover:text-orange-600">
                Contact
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Discover the Magic of <span className="text-orange-600">Africa</span>
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Experience breathtaking safaris, vibrant cultures, and unforgettable adventures across the most beautiful
            continent on Earth.
          </p>

          {/* Search Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
            <SearchForm />
          </div>
        </div>
      </section>

      {/* Featured Tours */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">Featured African Adventures</h3>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Serengeti Safari",
                location: "Tanzania",
                price: "$2,499",
                rating: 4.9,
                image: "/placeholder.svg?height=300&width=400",
              },
              {
                title: "Victoria Falls",
                location: "Zambia/Zimbabwe",
                price: "$1,899",
                rating: 4.8,
                image: "/placeholder.svg?height=300&width=400",
              },
              {
                title: "Cape Town Explorer",
                location: "South Africa",
                price: "$1,599",
                rating: 4.7,
                image: "/placeholder.svg?height=300&width=400",
              },
            ].map((tour, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gray-200 relative">
                  <img src={tour.image || "/placeholder.svg"} alt={tour.title} className="w-full h-full object-cover" />
                  <div className="absolute top-4 right-4 bg-white px-2 py-1 rounded-full flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">{tour.rating}</span>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">{tour.title}</h4>
                  <p className="text-gray-600 mb-4 flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {tour.location}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-orange-600">{tour.price}</span>
                    <Button className="bg-orange-600 hover:bg-orange-700">Book Now</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold">This is Africa</h3>
              </div>
              <p className="text-gray-400">
                Your gateway to authentic African adventures and unforgettable experiences.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Tours
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Destinations</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Kenya
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Tanzania
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    South Africa
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Botswana
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact Info</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Email: info@thisisafrica.com</li>
                <li>Phone: +1 (555) 123-4567</li>
                <li>Address: 123 Safari Street</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 This is Africa. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
