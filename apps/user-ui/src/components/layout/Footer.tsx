import {
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Twitter,
  Youtube,
} from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-200">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <div className="text-2xl font-bold mb-4">
              <span className="text-white">Store</span>
              <span className="text-red-400">X</span>
            </div>
            <p className="mb-4 text-gray-400">
              StoreX is your one-stop destination for all your shopping needs.
              We offer a wide range of products at competitive prices with
              excellent customer service.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Facebook size={20} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Twitter size={20} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Instagram size={20} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">
              Categories
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/category/electronics"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Electronics
                </Link>
              </li>
              <li>
                <Link
                  href="/category/fashion"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Fashion
                </Link>
              </li>
              <li>
                <Link
                  href="/category/home-kitchen"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Home & Kitchen
                </Link>
              </li>
              <li>
                <Link
                  href="/category/sports-fitness"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Sports & Fitness
                </Link>
              </li>
              <li>
                <Link
                  href="/category/beauty"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Beauty
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin
                  size={20}
                  className="mr-2 text-gray-400 mt-1 flex-shrink-0"
                />
                <span className="text-gray-400">
                  123 E-commerce Street, Digital City, 10001
                </span>
              </li>
              <li className="flex items-center">
                <Phone size={20} className="mr-2 text-gray-400 flex-shrink-0" />
                <span className="text-gray-400">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center">
                <Mail size={20} className="mr-2 text-gray-400 flex-shrink-0" />
                <span className="text-gray-400">support@storeX.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} StoreX. All rights reserved.
          </p>
          <div className="flex space-x-4">
            <img
              src="https://cdn-icons-png.flaticon.com/512/196/196578.png"
              alt="Visa"
              className="h-8 w-auto"
            />
            <img
              src="https://cdn-icons-png.flaticon.com/512/196/196561.png"
              alt="Mastercard"
              className="h-8 w-auto"
            />
            <img
              src="https://cdn-icons-png.flaticon.com/512/196/196566.png"
              alt="PayPal"
              className="h-8 w-auto"
            />
            <img
              src="https://cdn-icons-png.flaticon.com/512/5968/5968220.png"
              alt="Apple Pay"
              className="h-8 w-auto"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
