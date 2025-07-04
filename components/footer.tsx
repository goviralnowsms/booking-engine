import Link from "next/link"
import Image from "next/image"

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/TIA-NEW3-300x196-removebg-preview-2LFeoo3QTCARHfSJeCeCsF8E6cFdVx.png"
              alt="This is Africa - Travel with Experience"
              width={150}
              height={98}
              className="h-12 w-auto mb-4"
            />
            <p className="text-gray-300 text-sm mb-4">Specializing in tailor-made and package tours to Africa.</p>

            {/* Add the gorilla image */}
            <div className="mb-4">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Lowland-Gorilla-Africa-1_cropped-150x150-DJng5WcXpT0jpeala8F0ociDxZeR5e.jpeg"
                alt="African Lowland Gorilla"
                width={150}
                height={150}
                className="rounded-lg"
              />
            </div>

            <div className="flex space-x-2">
              <Image src="/placeholder.svg?height=40&width=80" alt="CATC" width={80} height={40} />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-gray-300 hover:text-orange-400">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-orange-400">
                  About
                </Link>
              </li>
              <li>
                <Link href="/visas" className="text-gray-300 hover:text-orange-400">
                  Visas
                </Link>
              </li>
              <li>
                <Link href="/insurance" className="text-gray-300 hover:text-orange-400">
                  Insurance
                </Link>
              </li>
              <li>
                <Link href="/packages" className="text-gray-300 hover:text-orange-400">
                  Packages
                </Link>
              </li>
            </ul>
          </div>

          {/* Latest News */}
          <div>
            <h3 className="font-bold text-lg mb-4">Latest News</h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-gray-300">Follow This is Africa on social media for latest news</p>
                <p className="text-gray-400 text-xs">March 15, 2024</p>
              </div>
              <div>
                <p className="text-gray-300">This is Africa launches new website with enhanced booking</p>
                <p className="text-gray-400 text-xs">March 10, 2024</p>
              </div>
            </div>
          </div>

          {/* Contact Us */}
          <div>
            <h3 className="font-bold text-lg mb-4">Contact Us</h3>
            <div className="text-sm text-gray-300 space-y-2">
              <p>This is Africa</p>
              <p>Level 1, Suite 15</p>
              <p>189 Queen Street</p>
              <p>Melbourne VIC 3000</p>
              <p>Web: thisisafrica.com.au</p>
              <p>Email: info@thisisafrica.com.au</p>
              <p>Phone: 03 9642 4187</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2024 This is Africa. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
