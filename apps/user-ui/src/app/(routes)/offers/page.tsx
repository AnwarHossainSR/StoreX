"use client";

import { ChevronRight, Clock, Tag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const offers = [
  {
    id: 1,
    title: "Summer Sale - Up to 70% Off",
    image: "https://images.pexels.com/photos/3965557/pexels-photo-3965557.jpeg",
    discount: 70,
    category: "Fashion",
    validUntil: "2025-08-31",
    description:
      "Get amazing discounts on summer collection including t-shirts, shorts, and accessories.",
    terms: [
      "Valid on selected items only",
      "Cannot be combined with other offers",
      "While stocks last",
    ],
    featured: true,
  },
  {
    id: 2,
    title: "Tech Week Special Deals",
    image: "https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg",
    discount: 30,
    category: "Electronics",
    validUntil: "2025-07-15",
    description:
      "Save big on laptops, smartphones, and accessories during our Tech Week event.",
    terms: [
      "Minimum purchase of $500",
      "One coupon per customer",
      "Online only",
    ],
    featured: true,
  },
  {
    id: 3,
    title: "Home Decor Clearance",
    image: "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg",
    discount: 50,
    category: "Home & Living",
    validUntil: "2025-07-31",
    description:
      "Transform your space with our home decor items at unbeatable prices.",
    terms: [
      "In-store and online",
      "Limited stock available",
      "Excludes new arrivals",
    ],
    featured: false,
  },
  {
    id: 4,
    title: "Sports Equipment Sale",
    image: "https://images.pexels.com/photos/4753928/pexels-photo-4753928.jpeg",
    discount: 40,
    category: "Sports",
    validUntil: "2025-08-15",
    description:
      "Get fit for less with discounts on sports equipment and activewear.",
    terms: [
      "Valid on regular-priced items",
      "Member exclusive offer",
      "Cannot be combined with other promotions",
    ],
    featured: false,
  },
];

export default function OffersPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("discount");

  const filteredOffers = offers
    .filter(
      (offer) =>
        selectedCategory === "all" || offer.category === selectedCategory
    )
    .sort((a, b) => {
      if (sortBy === "discount") {
        return b.discount - a.discount;
      }
      // Add more sorting options if needed
      return 0;
    });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-blue-500 transition-colors">
            Home
          </Link>
          <ChevronRight size={16} className="mx-2" />
          <span className="text-gray-800">Special Offers</span>
        </div>

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-8 mb-8 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">
              Exclusive Offers & Deals
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Discover amazing discounts and save big on your favorite products
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 rounded-md border-2 border-white bg-transparent text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-white"
              >
                <option value="all" className="text-gray-800">
                  All Categories
                </option>
                <option value="Fashion" className="text-gray-800">
                  Fashion
                </option>
                <option value="Electronics" className="text-gray-800">
                  Electronics
                </option>
                <option value="Home & Living" className="text-gray-800">
                  Home & Living
                </option>
                <option value="Sports" className="text-gray-800">
                  Sports
                </option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 rounded-md border-2 border-white bg-transparent text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-white"
              >
                <option value="discount" className="text-gray-800">
                  Highest Discount
                </option>
                <option value="ending-soon" className="text-gray-800">
                  Ending Soon
                </option>
                <option value="newest" className="text-gray-800">
                  Newest First
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Featured Offers */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Featured Offers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredOffers
              .filter((offer) => offer.featured)
              .map((offer) => (
                <div
                  key={offer.id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="relative w-full md:w-2/5 h-48 md:h-auto">
                      <Image
                        src={offer.image}
                        alt={offer.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-4 left-4 bg-red-500 text-white text-lg font-bold px-3 py-1 rounded-full">
                        {offer.discount}% OFF
                      </div>
                    </div>
                    <div className="p-6 flex-1">
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <Tag size={16} className="mr-2" />
                        {offer.category}
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        {offer.title}
                      </h3>
                      <p className="text-gray-600 mb-4">{offer.description}</p>
                      <div className="flex items-center text-sm text-gray-500 mb-4">
                        <Clock size={16} className="mr-2" />
                        Valid until{" "}
                        {new Date(offer.validUntil).toLocaleDateString()}
                      </div>
                      <button className="w-full px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                        Get Offer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* All Offers */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">All Offers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOffers
              .filter((offer) => !offer.featured)
              .map((offer) => (
                <div
                  key={offer.id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="relative h-48">
                    <Image
                      src={offer.image}
                      alt={offer.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-4 left-4 bg-red-500 text-white text-lg font-bold px-3 py-1 rounded-full">
                      {offer.discount}% OFF
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <Tag size={16} className="mr-2" />
                      {offer.category}
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                      {offer.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {offer.description}
                    </p>
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <Clock size={16} className="mr-2" />
                      Valid until{" "}
                      {new Date(offer.validUntil).toLocaleDateString()}
                    </div>
                    <div className="space-y-2 mb-4">
                      {offer.terms.map((term, index) => (
                        <div
                          key={index}
                          className="flex items-center text-xs text-gray-500"
                        >
                          <span className="mr-2">•</span>
                          {term}
                        </div>
                      ))}
                    </div>
                    <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                      Get Offer
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* No Results */}
        {filteredOffers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No offers found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
