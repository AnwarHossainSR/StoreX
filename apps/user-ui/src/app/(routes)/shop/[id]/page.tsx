"use client";

import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Facebook,
  Globe,
  Grid,
  Heart,
  Instagram,
  List,
  MapPin,
  Share2,
  Star,
  Twitter,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

// Types based on your Prisma schema
interface Shop {
  id: string;
  name: string;
  bio?: string;
  category: string;
  avatar?: string;
  coverBanner?: string;
  address: string;
  opening_hour: string;
  website?: string;
  social_links: Array<{ platform: string; url: string }>;
  ratings: number;
  reviews: ShopReview[];
  createdAt: string;
  products: Product[];
}

interface ShopReview {
  id: string;
  rating: number;
  review?: string;
  user: {
    name: string;
    avatar?: string;
  };
  createdAt: string;
}

interface Product {
  id: string;
  title: string;
  slug: string;
  category: string;
  subCategory: string;
  short_description: string;
  images: Array<{ url: string }>;
  sale_price: number;
  regular_price: number;
  ratings: number;
  totalSales: number;
  stock: number;
  status: "Active" | "Pending" | "Draft" | "Deleted";
  createdAt?: string;
}

// Static data - replace with API calls
const staticShop: Shop = {
  id: "1",
  name: "TechTrend Innovations",
  bio: "Your one-stop destination for cutting-edge electronics and gadgets. We bring you the latest technology trends with unbeatable quality and service.",
  category: "Electronics",
  avatar: "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg",
  coverBanner:
    "https://images.pexels.com/photos/1632790/pexels-photo-1632790.jpeg",
  address: "123 Tech Street, Silicon Valley, CA 94000",
  opening_hour: "Mon-Fri: 9:00 AM - 8:00 PM, Sat-Sun: 10:00 AM - 6:00 PM",
  website: "https://techtrend.com",
  social_links: [
    { platform: "facebook", url: "https://facebook.com/techtrend" },
    { platform: "twitter", url: "https://twitter.com/techtrend" },
    { platform: "instagram", url: "https://instagram.com/techtrend" },
  ],
  ratings: 4.5,
  reviews: [
    {
      id: "1",
      rating: 5,
      review: "Excellent service and quality products! Fast shipping too.",
      user: {
        name: "John Doe",
        avatar:
          "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg",
      },
      createdAt: "2025-05-28T10:00:00Z",
    },
    {
      id: "2",
      rating: 4,
      review: "Great selection of electronics. Customer support is responsive.",
      user: { name: "Jane Smith" },
      createdAt: "2025-05-25T14:30:00Z",
    },
    {
      id: "3",
      rating: 5,
      review: "Love shopping here! Always get genuine products.",
      user: {
        name: "Mike Johnson",
        avatar:
          "https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg",
      },
      createdAt: "2025-05-20T16:45:00Z",
    },
  ],
  createdAt: "2024-01-15T00:00:00Z",
  products: [
    {
      id: "1",
      title: "Wireless Bluetooth Headphones",
      slug: "wireless-bluetooth-headphones",
      category: "Electronics",
      subCategory: "Audio",
      short_description:
        "Premium quality wireless headphones with noise cancellation",
      images: [
        {
          url: "https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg",
        },
      ],
      sale_price: 79.99,
      regular_price: 99.99,
      ratings: 4.7,
      totalSales: 156,
      stock: 25,
      status: "Active",
      createdAt: "2024-01-15T00:00:00Z",
    },
    {
      id: "2",
      title: "Smart Watch Series X",
      slug: "smart-watch-series-x",
      category: "Electronics",
      subCategory: "Wearables",
      short_description: "Advanced smartwatch with health monitoring features",
      images: [
        {
          url: "https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg",
        },
      ],
      sale_price: 199.99,
      regular_price: 249.99,
      ratings: 4.5,
      totalSales: 89,
      stock: 12,
      status: "Active",
      createdAt: "2024-01-15T00:00:00Z",
    },
    {
      id: "3",
      title: "Portable Charger 20000mAh",
      slug: "portable-charger-20000mah",
      category: "Electronics",
      subCategory: "Accessories",
      short_description:
        "High-capacity power bank with fast charging technology",
      images: [
        {
          url: "https://images.pexels.com/photos/4968634/pexels-photo-4968634.jpeg",
        },
      ],
      sale_price: 29.99,
      regular_price: 39.99,
      ratings: 4.3,
      totalSales: 234,
      stock: 45,
      status: "Active",
      createdAt: "2024-01-15T00:00:00Z",
    },
    {
      id: "4",
      title: "4K Webcam Pro",
      slug: "4k-webcam-pro",
      category: "Electronics",
      subCategory: "Computer Accessories",
      short_description:
        "Ultra HD webcam perfect for streaming and video calls",
      images: [
        {
          url: "https://images.pexels.com/photos/4792509/pexels-photo-4792509.jpeg",
        },
      ],
      sale_price: 119.99,
      regular_price: 149.99,
      ratings: 4.6,
      totalSales: 67,
      stock: 18,
      status: "Active",
      createdAt: "2024-01-15T00:00:00Z",
    },
  ],
};

interface SingleShopPageProps {
  shopId: string;
}

export default function SingleShopPage({ shopId }: SingleShopPageProps) {
  const [shop, setShop] = useState<Shop | null>(null);
  const [activeTab, setActiveTab] = useState<"products" | "about" | "reviews">(
    "products"
  );
  const [productsView, setProductsView] = useState<"grid" | "list">("grid");
  const [productFilters, setProductFilters] = useState({
    category: "",
    sortBy: "featured" as
      | "featured"
      | "price-low"
      | "price-high"
      | "newest"
      | "best-selling",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  // Simulate API call
  useEffect(() => {
    setTimeout(() => {
      setShop(staticShop);
      setIsLoading(false);
    }, 1000);
  }, [shopId]);

  if (isLoading) {
    return <ShopPageSkeleton />;
  }

  if (!shop) {
    return <ShopNotFound />;
  }

  const filteredProducts = shop.products
    .filter(
      (product) =>
        productFilters.category === "" ||
        product.subCategory === productFilters.category
    )
    .sort((a, b) => {
      switch (productFilters.sortBy) {
        case "price-low":
          return a.sale_price - b.sale_price;
        case "price-high":
          return b.sale_price - a.sale_price;
        case "best-selling":
          return b.totalSales - a.totalSales;
        case "newest":
          return (
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
          );
        default:
          return 0;
      }
    });

  const productsPerPage = 8;
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  const renderStars = (rating: number, size: "sm" | "md" | "lg" = "sm") => {
    const sizeClass =
      size === "sm" ? "h-4 w-4" : size === "md" ? "h-5 w-5" : "h-6 w-6";

    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`${sizeClass} ${
          i < Math.floor(rating)
            ? "text-yellow-400 fill-current"
            : i < rating
            ? "text-yellow-300 fill-current"
            : "text-gray-300"
        }`}
      />
    ));
  };

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case "facebook":
        return <Facebook size={20} />;
      case "twitter":
        return <Twitter size={20} />;
      case "instagram":
        return <Instagram size={20} />;
      default:
        return <Globe size={20} />;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white py-4 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center text-sm text-gray-500">
            <Link href="/" className="hover:text-blue-500 transition-colors">
              Home
            </Link>
            <ChevronRight size={16} className="mx-2" />
            <Link
              href="/shops"
              className="hover:text-blue-500 transition-colors"
            >
              Shops
            </Link>
            <ChevronRight size={16} className="mx-2" />
            <span className="text-gray-800">{shop.name}</span>
          </div>
        </div>
      </div>

      {/* Shop Header */}
      <div className="relative">
        {/* Cover Banner */}
        <div className="h-64 md:h-80 relative overflow-hidden">
          <Image
            src={shop.coverBanner || "/fallback-banner.jpg"}
            alt={`${shop.name} cover`}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        </div>

        {/* Shop Info Overlay */}
        <div className="container mx-auto px-4">
          <div className="relative -mt-20 bg-white rounded-lg shadow-lg p-6 mx-4 md:mx-0">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white shadow-lg flex-shrink-0">
                <Image
                  src={shop.avatar || "/fallback-avatar.jpg"}
                  alt={`${shop.name} logo`}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Shop Details */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                      {shop.name}
                    </h1>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                        {shop.category}
                      </span>
                      <div className="flex items-center gap-1">
                        {renderStars(shop.ratings, "sm")}
                        <span className="ml-1">
                          {shop.ratings} ({shop.reviews.length} reviews)
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <MapPin size={16} className="mr-2 flex-shrink-0" />
                      <span>{shop.address}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsFollowing(!isFollowing)}
                      className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                        isFollowing
                          ? "bg-green-500 text-white hover:bg-green-600"
                          : "bg-blue-500 text-white hover:bg-blue-600"
                      }`}
                    >
                      <Heart
                        size={16}
                        className={`inline mr-2 ${
                          isFollowing ? "fill-current" : ""
                        }`}
                      />
                      {isFollowing ? "Following" : "Follow"}
                    </button>
                    <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <Share2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="container mx-auto px-4 mt-8">
        <div className="bg-white rounded-lg shadow-sm">
          <nav className="flex border-b border-gray-200">
            {[
              {
                key: "products",
                label: "Products",
                count: shop.products.length,
              },
              { key: "about", label: "About" },
              { key: "reviews", label: "Reviews", count: shop.reviews.length },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-800"
                }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "products" && (
              <div>
                {/* Products Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <button
                      className={`p-2 rounded-lg ${
                        productsView === "grid"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                      onClick={() => setProductsView("grid")}
                    >
                      <Grid size={18} />
                    </button>
                    <button
                      className={`p-2 rounded-lg ${
                        productsView === "list"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                      onClick={() => setProductsView("list")}
                    >
                      <List size={18} />
                    </button>
                    <span className="text-gray-600 text-sm">
                      {filteredProducts.length} products
                    </span>
                  </div>

                  <div className="flex gap-4">
                    <select
                      value={productFilters.category}
                      onChange={(e) =>
                        setProductFilters((prev) => ({
                          ...prev,
                          category: e.target.value,
                        }))
                      }
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Categories</option>
                      <option value="Audio">Audio</option>
                      <option value="Wearables">Wearables</option>
                      <option value="Accessories">Accessories</option>
                      <option value="Computer Accessories">
                        Computer Accessories
                      </option>
                    </select>
                    <select
                      value={productFilters.sortBy}
                      onChange={(e) =>
                        setProductFilters((prev) => ({
                          ...prev,
                          sortBy: e.target.value as any,
                        }))
                      }
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="featured">Featured</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="newest">Newest</option>
                      <option value="best-selling">Best Selling</option>
                    </select>
                  </div>
                </div>

                {/* Products Grid/List */}
                {productsView === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {paginatedProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paginatedProducts.map((product) => (
                      <ProductListItem key={product.id} product={product} />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <nav className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setCurrentPage(Math.max(1, currentPage - 1))
                        }
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`px-3 py-2 rounded-lg ${
                            currentPage === i + 1
                              ? "bg-blue-500 text-white"
                              : "border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button
                        onClick={() =>
                          setCurrentPage(Math.min(totalPages, currentPage + 1))
                        }
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </nav>
                  </div>
                )}
              </div>
            )}

            {activeTab === "about" && (
              <div className="max-w-4xl">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      About Us
                    </h3>
                    <p className="text-gray-600 leading-relaxed mb-6">
                      {shop.bio}
                    </p>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Clock
                          size={20}
                          className="text-gray-400 mt-1 flex-shrink-0"
                        />
                        <div>
                          <h4 className="font-medium text-gray-900">
                            Opening Hours
                          </h4>
                          <p className="text-gray-600 text-sm">
                            {shop.opening_hour}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <MapPin
                          size={20}
                          className="text-gray-400 mt-1 flex-shrink-0"
                        />
                        <div>
                          <h4 className="font-medium text-gray-900">Address</h4>
                          <p className="text-gray-600 text-sm">
                            {shop.address}
                          </p>
                        </div>
                      </div>

                      {shop.website && (
                        <div className="flex items-start gap-3">
                          <Globe
                            size={20}
                            className="text-gray-400 mt-1 flex-shrink-0"
                          />
                          <div>
                            <h4 className="font-medium text-gray-900">
                              Website
                            </h4>
                            <a
                              href={shop.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-600 text-sm"
                            >
                              {shop.website}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Connect With Us
                    </h3>
                    <div className="space-y-3">
                      {shop.social_links.map((link, index) => (
                        <a
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          {getSocialIcon(link.platform)}
                          <span className="capitalize font-medium">
                            {link.platform}
                          </span>
                        </a>
                      ))}
                    </div>

                    <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-4">
                        Shop Statistics
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {shop.products.length}
                          </div>
                          <div className="text-sm text-gray-600">Products</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {shop.reviews.length}
                          </div>
                          <div className="text-sm text-gray-600">Reviews</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-600">
                            {shop.ratings}
                          </div>
                          <div className="text-sm text-gray-600">Rating</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {new Date().getFullYear() -
                              new Date(shop.createdAt).getFullYear()}
                            +
                          </div>
                          <div className="text-sm text-gray-600">Years</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="max-w-4xl">
                <div className="mb-8">
                  <div className="flex items-center gap-6 mb-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-gray-900 mb-1">
                        {shop.ratings}
                      </div>
                      <div className="flex justify-center mb-1">
                        {renderStars(shop.ratings, "md")}
                      </div>
                      <div className="text-sm text-gray-600">
                        {shop.reviews.length} reviews
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {shop.reviews.map((review) => (
                    <div
                      key={review.id}
                      className="border-b border-gray-200 pb-6 last:border-b-0"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                          {review.user.avatar ? (
                            <Image
                              src={review.user.avatar}
                              alt={review.user.name}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                              {review.user.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-gray-900">
                              {review.user.name}
                            </h4>
                            <div className="flex items-center gap-1">
                              {renderStars(review.rating, "sm")}
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {review.review && (
                            <p className="text-gray-600 leading-relaxed">
                              {review.review}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Product Card Component
function ProductCard({ product }: { product: Product }) {
  const discountPercentage =
    product.regular_price > product.sale_price
      ? Math.round(
          ((product.regular_price - product.sale_price) /
            product.regular_price) *
            100
        )
      : 0;

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-200">
      <Link href={`/products/${product.slug}`}>
        <div className="relative h-48 overflow-hidden">
          <Image
            src={product.images[0]?.url || "/fallback-product.jpg"}
            alt={product.title}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
          />
          {discountPercentage > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
              -{discountPercentage}%
            </div>
          )}
          {product.stock < 10 && product.stock > 0 && (
            <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded text-xs">
              Only {product.stock} left
            </div>
          )}
        </div>
      </Link>
      <div className="p-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
            {product.title}
          </h3>
        </Link>
        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
          {product.short_description}
        </p>
        <div className="flex items-center gap-1 mb-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < Math.floor(product.ratings)
                    ? "text-yellow-400 fill-current"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">({product.totalSales})</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">
              ${product.sale_price}
            </span>
            {product.regular_price > product.sale_price && (
              <span className="text-sm text-gray-500 line-through">
                ${product.regular_price}
              </span>
            )}
          </div>
          <span className="text-xs text-gray-500">
            {product.totalSales} sold
          </span>
        </div>
      </div>
    </div>
  );
}

// Product List Item Component
function ProductListItem({ product }: { product: Product }) {
  const discountPercentage =
    product.regular_price > product.sale_price
      ? Math.round(
          ((product.regular_price - product.sale_price) /
            product.regular_price) *
            100
        )
      : 0;

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-200">
      <div className="flex gap-4 p-4">
        <Link href={`/products/${product.slug}`} className="flex-shrink-0">
          <div className="relative w-24 h-24 overflow-hidden rounded-lg">
            <Image
              src={product.images[0]?.url || "/fallback-product.jpg"}
              alt={product.title}
              fill
              className="object-cover hover:scale-105 transition-transform duration-300"
            />
            {discountPercentage > 0 && (
              <div className="absolute top-1 left-1 bg-red-500 text-white px-1 py-0.5 rounded text-xs font-semibold">
                -{discountPercentage}%
              </div>
            )}
          </div>
        </Link>

        <div className="flex-1 min-w-0">
          <Link href={`/products/${product.slug}`}>
            <h3 className="font-medium text-gray-900 mb-1 hover:text-blue-600 transition-colors">
              {product.title}
            </h3>
          </Link>
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {product.short_description}
          </p>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.floor(product.ratings)
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">
              ({product.totalSales} sold)
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">
                ${product.sale_price}
              </span>
              {product.regular_price > product.sale_price && (
                <span className="text-sm text-gray-500 line-through">
                  ${product.regular_price}
                </span>
              )}
            </div>
            {product.stock < 10 && product.stock > 0 && (
              <span className="text-xs text-orange-600 font-medium">
                Only {product.stock} left
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Shop Page Skeleton Component
function ShopPageSkeleton() {
  return (
    <div className="bg-gray-50 min-h-screen animate-pulse">
      {/* Breadcrumb Skeleton */}
      <div className="bg-white py-4 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
      </div>

      {/* Cover Banner Skeleton */}
      <div className="h-64 md:h-80 bg-gray-300"></div>

      {/* Shop Info Skeleton */}
      <div className="container mx-auto px-4">
        <div className="relative -mt-20 bg-white rounded-lg shadow-lg p-6 mx-4 md:mx-0">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gray-300"></div>
            <div className="flex-1">
              <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-96"></div>
            </div>
            <div className="flex gap-3">
              <div className="h-10 bg-gray-200 rounded w-24"></div>
              <div className="h-10 w-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="container mx-auto px-4 mt-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex border-b border-gray-200">
            {[1, 2, 3].map((i) => (
              <div key={i} className="px-6 py-4">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-lg">
                  <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Shop Not Found Component
function ShopNotFound() {
  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-64 h-64 mx-auto mb-8 bg-gray-200 rounded-lg flex items-center justify-center">
          <div className="text-gray-400 text-6xl">🏪</div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Shop Not Found
        </h1>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Sorry, we couldn't find the shop you're looking for. It may have been
          moved or doesn't exist.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/shops"
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Browse All Shops
          </Link>
          <Link
            href="/"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
