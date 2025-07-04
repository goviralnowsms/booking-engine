import Image from "next/image"
import SearchBar from "@/components/search-bar"
import CategoryGrid from "@/components/category-grid"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Star } from "lucide-react"

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/02.jpg-7zbFi97PZ5cHic8l0Pwl4688VLEF2j.jpeg"
          alt="Majestic African Lion"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        <div className="relative z-10 text-center text-white max-w-4xl px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">TRAVEL WITH EXPERIENCE</h1>
          <p className="text-xl md:text-2xl mb-8">
            This is Africa is a rapidly growing wholesale and retail travel company which specialises in selling
            tailor-made and package tours to Africa.
          </p>
        </div>
      </section>

      {/* Search Section - Homepage search redirects to booking engine */}
      <section className="bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <SearchBar category="homepage" redirectToBooking={true} />
        </div>
      </section>

      {/* Special Deals Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="w-16 h-1 bg-orange-500 mx-auto mb-4"></div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">SPECIAL DEALS</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              The ultimate overland adventure tours by countries, each with individual time groups, traditions,
              dialects, landscapes and wildlife species. It is these characteristics which make each overland tour so
              exciting, interesting and unique destination.
            </p>
          </div>

          <div className="relative h-96 rounded-lg overflow-hidden mb-8">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Victoria.Falls_.1000x400.jpg-LWwuF4QaRsvuU51Qi3HESEuBpSgPUa.jpeg"
              alt="Victoria Falls with Rainbow"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <CategoryGrid />
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="relative py-20">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/back-ground.jpg-so7bfsYcG23pbcozX5LvwVre4EmWDN.jpeg"
          alt="Travel Journey"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-60" />
        <div className="relative z-10 container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Why Choose Us</h2>
            <div className="w-16 h-1 bg-orange-500 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-8 text-center shadow-lg">
              <div className="bg-orange-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Star className="w-8 h-8 text-white fill-current" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">RESPONSIBLE PRICING</h3>
              <p className="text-gray-600">
                Our product team strives to deliver the best available prices from trusted and responsible local
                operators. We consider current exchange rates and the season of your travel to provide competitive
                pricing.
              </p>
            </div>

            <div className="bg-white rounded-lg p-8 text-center shadow-lg">
              <div className="bg-orange-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Star className="w-8 h-8 text-white fill-current" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">PERSONALISED SERVICE</h3>
              <p className="text-gray-600">
                Our expert consultants are travel professionals. They will use their extensive knowledge of Africa,
                travel industry experience and passion for travelling to create your dream African holiday.
              </p>
            </div>

            <div className="bg-white rounded-lg p-8 text-center shadow-lg">
              <div className="bg-orange-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Star className="w-8 h-8 text-white fill-current" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">CUSTOMISED ITINERARIES</h3>
              <p className="text-gray-600">
                Whether you choose a popular pre-prepared itinerary, or prefer a tailormade itinerary which suits your
                interests, dates, timeframe and budget; our consultants will personalise every aspect of your journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-gray-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="w-16 h-1 bg-orange-500 mx-auto mb-8"></div>
          <h2 className="text-2xl font-bold mb-8">Stay In Touch and Sign Up For Newsletter</h2>
          <div className="max-w-md mx-auto flex gap-2">
            <Input type="email" placeholder="Enter your email" className="bg-white text-black" />
            <Button className="bg-orange-500 hover:bg-orange-600 px-8">Subscribe</Button>
          </div>
        </div>
      </section>
    </>
  )
}
