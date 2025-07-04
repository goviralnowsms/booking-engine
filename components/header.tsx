import Link from "next/link"
import { Facebook, Instagram, Twitter, Phone } from "lucide-react"
import Image from "next/image"

export default function Header() {
  return (
    <>
      {/* Top bar */}
      <div className="bg-black text-white py-2">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex space-x-4">
            <Link href="#" className="text-white hover:text-orange-400">
              <Facebook className="w-5 h-5" />
            </Link>
            <Link href="#" className="text-white hover:text-orange-400">
              <Instagram className="w-5 h-5" />
            </Link>
            <Link href="#" className="text-white hover:text-orange-400">
              <Twitter className="w-5 h-5" />
            </Link>
          </div>
          <div className="flex items-center space-x-2">
            <Phone className="w-4 h-4" />
            <span className="text-sm">Need help? +61 (0) 2 96649187</span>
          </div>
        </div>
      </div>

      {/* Main header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/TIA-NEW3-300x196-removebg-preview-2LFeoo3QTCARHfSJeCeCsF8E6cFdVx.png"
              alt="This is Africa - Travel with Experience"
              width={200}
              height={130}
              className="h-16 w-auto"
              priority
            />
          </Link>

          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-700 hover:text-orange-500">
              Home
            </Link>
            <Link href="/visas" className="text-gray-700 hover:text-orange-500">
              Visas
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-orange-500">
              About
            </Link>
            <Link href="/insurance" className="text-gray-700 hover:text-orange-500">
              Insurance
            </Link>
            <Link href="/brochure" className="text-gray-700 hover:text-orange-500">
              Brochure
            </Link>
            <Link href="/terms" className="text-gray-700 hover:text-orange-500">
              Terms & Conditions
            </Link>
          </nav>
        </div>
      </header>
    </>
  )
}
