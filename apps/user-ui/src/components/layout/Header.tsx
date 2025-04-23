"use client";

import { Heart, Menu, Search, ShoppingCart, User, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import MobileMenu from "./MobileMenu";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="text-2xl md:text-3xl font-bold">
              <span className="text-gray-700">Store-</span>
              <span className="text-yellow-400">X</span>
            </div>
          </Link>

          {/* Search */}
          <div className="hidden md:flex relative flex-grow max-w-2xl mx-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for products..."
              className="w-full py-2 px-4 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 rounded-r-md transition-colors">
              <Search size={20} />
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/account"
              className="flex items-center hover:text-blue-500 transition-colors"
            >
              <User size={20} className="mr-1" />
              <span>Account</span>
            </Link>
            <Link
              href="/wishlist"
              className="flex items-center hover:text-blue-500 transition-colors relative"
            >
              <Heart size={20} className="mr-1" />
              <span>Wishlist</span>
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                0
              </span>
            </Link>
            <Link
              href="/cart"
              className="flex items-center hover:text-blue-500 transition-colors relative"
            >
              <ShoppingCart size={20} className="mr-1" />
              <span>Cart</span>
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                0
              </span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <Link href="/cart" className="mr-4 relative">
              <ShoppingCart size={24} />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                0
              </span>
            </Link>
            <button onClick={toggleMenu} className="text-gray-700">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Categories Navigation */}
        <nav className="hidden md:block border-t border-gray-100">
          <div className="flex items-center py-3">
            <div className="relative group">
              <button className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-md">
                <Menu size={20} className="mr-2" />
                <span>All Departments</span>
              </button>
              <div className="absolute left-0 top-full w-60 bg-white shadow-lg rounded-b-md hidden group-hover:block border border-gray-200 z-30">
                <ul>
                  {[
                    "Electronics",
                    "Fashion",
                    "Home & Kitchen",
                    "Sports & Fitness",
                    "Beauty",
                    "Toys",
                    "Books",
                  ].map((category, index) => (
                    <li key={index}>
                      <Link
                        href={`/category/${category
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                        className="block px-4 py-2 hover:bg-gray-50 transition-colors"
                      >
                        {category}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <ul className="flex ml-6 space-x-6">
              {["Home", "Products", "Shops", "Offers", "Become A Seller"].map(
                (item, index) => (
                  <li key={index}>
                    <Link
                      href={
                        item === "Home"
                          ? "/"
                          : `/${item.toLowerCase().replace(/\s+/g, "-")}`
                      }
                      className="text-gray-700 hover:text-blue-500 transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>
        </nav>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && <MobileMenu onClose={toggleMenu} />}

      {/* Mobile Search - Displayed only on mobile */}
      <div className="md:hidden px-4 py-2 bg-gray-50">
        <div className="relative flex">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for products..."
            className="w-full py-2 px-4 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 rounded-r-md transition-colors">
            <Search size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
