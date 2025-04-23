import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Heart, Search, Menu } from 'lucide-react';
import ProductSlider from '@/components/home/ProductSlider';
import FeaturedCategories from '@/components/home/FeaturedCategories';
import PopularProducts from '@/components/home/PopularProducts';
import NewsletterSignup from '@/components/home/NewsletterSignup';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-50 to-blue-100">
        <div className="container mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-gray-800">
              Shop Smart, <span className="text-blue-500">Shop Easy</span>
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Discover thousands of products at unbeatable prices with fast delivery and excellent customer service.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link 
                href="/products" 
                className="px-6 py-3 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-600 transition-colors"
              >
                Shop Now
              </Link>
              <Link 
                href="/become-seller" 
                className="px-6 py-3 border border-blue-500 text-blue-500 rounded-full font-medium hover:bg-blue-50 transition-colors"
              >
                Become a Seller
              </Link>
            </div>
          </div>
          <div className="md:w-1/2">
            <Image 
              src="https://images.pexels.com/photos/1005638/pexels-photo-1005638.jpeg" 
              alt="Shopping Experience" 
              width={600} 
              height={400} 
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Product Slider */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Featured Products</h2>
            <Link href="/products" className="text-blue-500 hover:underline">
              View All
            </Link>
          </div>
          <ProductSlider />
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8">Shop by Category</h2>
          <FeaturedCategories />
        </div>
      </section>

      {/* Popular Products */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Popular Right Now</h2>
            <Link href="/products" className="text-blue-500 hover:underline">
              View All
            </Link>
          </div>
          <PopularProducts />
        </div>
      </section>

      {/* Newsletter Signup */}
      <NewsletterSignup />
    </main>
  );
}