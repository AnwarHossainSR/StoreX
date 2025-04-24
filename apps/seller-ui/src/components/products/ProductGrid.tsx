'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Eye, ShoppingCart, Grid, List, ChevronLeft, ChevronRight } from 'lucide-react';

// Sample products data
const products = [
  {
    id: 1,
    name: 'iPhone 14 Pro Max',
    image: 'https://images.pexels.com/photos/10885666/pexels-photo-10885666.jpeg',
    price: 1099,
    discountPrice: 999,
    rating: 4.9,
    sold: 214,
    description: 'The latest Apple iPhone with A16 Bionic chip, 48MP camera, and Dynamic Island.',
    category: 'Electronics',
  },
  {
    id: 2,
    name: 'Blue Rose Gift Box',
    image: 'https://images.pexels.com/photos/2072152/pexels-photo-2072152.jpeg',
    price: 89,
    discountPrice: 49,
    rating: 4.8,
    sold: 167,
    description: '50 roses arranged in a luxurious velvet flower box. Perfect for special occasions.',
    category: 'Gifts',
  },
  {
    id: 3,
    name: 'Smart Watch Series 7',
    image: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg',
    price: 399,
    discountPrice: 349,
    rating: 4.7,
    sold: 98,
    description: 'Track your fitness, receive notifications, and more with this premium smartwatch.',
    category: 'Electronics',
  },
  {
    id: 4,
    name: 'Noise Cancelling Headphones',
    image: 'https://images.pexels.com/photos/3945667/pexels-photo-3945667.jpeg',
    price: 299,
    discountPrice: 249,
    rating: 4.6,
    sold: 76,
    description: 'Premium wireless headphones with active noise cancellation for immersive sound.',
    category: 'Electronics',
  },
  {
    id: 5,
    name: 'Stylish Leather Backpack',
    image: 'https://images.pexels.com/photos/934673/pexels-photo-934673.jpeg',
    price: 129,
    discountPrice: 99,
    rating: 4.5,
    sold: 53,
    description: 'Handcrafted genuine leather backpack with ample storage for your daily essentials.',
    category: 'Fashion',
  },
  {
    id: 6,
    name: 'Professional DSLR Camera',
    image: 'https://images.pexels.com/photos/51383/photo-camera-subject-photographer-51383.jpeg',
    price: 1299,
    discountPrice: 1099,
    rating: 4.8,
    sold: 42,
    description: 'Capture stunning photos and videos with this high-end DSLR camera.',
    category: 'Electronics',
  },
  {
    id: 7,
    name: 'Wireless Gaming Mouse',
    image: 'https://images.pexels.com/photos/5082566/pexels-photo-5082566.jpeg',
    price: 79,
    discountPrice: 59,
    rating: 4.7,
    sold: 143,
    description: 'High-precision wireless gaming mouse with customizable RGB lighting.',
    category: 'Electronics',
  },
  {
    id: 8,
    name: 'Men\'s Leather Wallet',
    image: 'https://images.pexels.com/photos/2442893/pexels-photo-2442893.jpeg',
    price: 49,
    discountPrice: 39,
    rating: 4.4,
    sold: 216,
    description: 'Genuine leather wallet with multiple card slots and RFID protection.',
    category: 'Accessories',
  },
];

export default function ProductGrid() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('featured');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 6;

  // Calculate total pages
  const totalPages = Math.ceil(products.length / productsPerPage);
  
  // Get current products
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Sort products based on selected option
  const sortProducts = (products: typeof currentProducts) => {
    switch (sortBy) {
      case 'price-low-high':
        return [...products].sort((a, b) => a.discountPrice - b.discountPrice);
      case 'price-high-low':
        return [...products].sort((a, b) => b.discountPrice - a.discountPrice);
      case 'best-selling':
        return [...products].sort((a, b) => b.sold - a.sold);
      case 'highest-rated':
        return [...products].sort((a, b) => b.rating - a.rating);
      case 'newest':
        return [...products]; // Assuming the array is already sorted by newest
      default:
        return products; // 'featured' or default sorting
    }
  };

  const sortedProducts = sortProducts(currentProducts);

  return (
    <div>
      {/* Toolbar */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-col sm:flex-row justify-between items-center">
        <div className="flex items-center mb-4 sm:mb-0">
          <button 
            className={`p-2 rounded-l-md ${view === 'grid' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setView('grid')}
          >
            <Grid size={18} />
          </button>
          <button 
            className={`p-2 rounded-r-md ${view === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setView('list')}
          >
            <List size={18} />
          </button>
          <span className="ml-4 text-gray-500 text-sm">
            Showing <span className="font-semibold">{indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, products.length)}</span> of <span className="font-semibold">{products.length}</span> results
          </span>
        </div>

        <div className="flex items-center w-full sm:w-auto">
          <label htmlFor="sort" className="mr-2 text-gray-700">Sort By:</label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 bg-white w-full sm:w-auto"
          >
            <option value="featured">Featured</option>
            <option value="best-selling">Best Selling</option>
            <option value="highest-rated">Highest Rated</option>
            <option value="price-low-high">Price: Low to High</option>
            <option value="price-high-low">Price: High to Low</option>
            <option value="newest">Newest Arrivals</option>
          </select>
        </div>
      </div>

      {/* Products */}
      {view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
              <div className="relative">
                <div className="h-60 overflow-hidden">
                  <Image 
                    src={product.image} 
                    alt={product.name} 
                    width={400} 
                    height={300}
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="absolute top-2 right-2 flex flex-col gap-2">
                  <button className="w-9 h-9 rounded-full bg-white shadow hover:bg-gray-100 flex items-center justify-center transition-colors">
                    <Heart size={18} className="text-gray-600" />
                  </button>
                  <button className="w-9 h-9 rounded-full bg-white shadow hover:bg-gray-100 flex items-center justify-center transition-colors">
                    <Eye size={18} className="text-gray-600" />
                  </button>
                  <button className="w-9 h-9 rounded-full bg-white shadow hover:bg-gray-100 flex items-center justify-center transition-colors">
                    <ShoppingCart size={18} className="text-gray-600" />
                  </button>
                </div>
                {product.discountPrice < product.price && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
                    {Math.round((1 - product.discountPrice / product.price) * 100)}% OFF
                  </div>
                )}
              </div>
              <div className="p-4">
                <Link href={`/product/${product.id}`} className="block">
                  <h3 className="text-gray-800 font-medium mb-1 hover:text-blue-500 transition-colors">
                    {product.name}
                  </h3>
                </Link>
                <p className="text-xs text-gray-500 mb-2">{product.category}</p>
                <div className="flex items-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-4 w-4 ${
                        i < Math.floor(product.rating)
                          ? 'text-yellow-400'
                          : i < product.rating
                          ? 'text-yellow-300'
                          : 'text-gray-300'
                      }`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                      />
                    </svg>
                  ))}
                  <span className="text-xs text-gray-500 ml-1">({product.sold})</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold text-gray-800">${product.discountPrice}</span>
                    {product.discountPrice < product.price && (
                      <span className="text-sm text-gray-500 line-through ml-2">${product.price}</span>
                    )}
                  </div>
                  <button className="text-sm text-blue-500 hover:text-blue-600 font-medium">
                    Add to cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {sortedProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 flex flex-col md:flex-row">
              <div className="relative md:w-1/3">
                <div className="h-60 md:h-full overflow-hidden">
                  <Image 
                    src={product.image} 
                    alt={product.name} 
                    width={400} 
                    height={300}
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                  />
                </div>
                {product.discountPrice < product.price && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
                    {Math.round((1 - product.discountPrice / product.price) * 100)}% OFF
                  </div>
                )}
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="mb-2">
                  <Link href={`/product/${product.id}`} className="block">
                    <h3 className="text-xl text-gray-800 font-medium mb-1 hover:text-blue-500 transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-gray-500">{product.category}</p>
                </div>
                
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating)
                          ? 'text-yellow-400'
                          : i < product.rating
                          ? 'text-yellow-300'
                          : 'text-gray-300'
                      }`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                      />
                    </svg>
                  ))}
                  <span className="text-gray-500 ml-2">{product.rating} ({product.sold} sold)</span>
                </div>
                
                <p className="text-gray-600 mb-4">{product.description}</p>
                
                <div className="mt-auto flex flex-wrap items-center justify-between">
                  <div className="mb-3 md:mb-0">
                    <span className="text-2xl font-bold text-gray-800">${product.discountPrice}</span>
                    {product.discountPrice < product.price && (
                      <span className="text-lg text-gray-500 line-through ml-2">${product.price}</span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                      <Heart size={20} className="text-gray-600" />
                    </button>
                    <button className="p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                      <Eye size={20} className="text-gray-600" />
                    </button>
                    <button className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                      <ShoppingCart size={18} className="mr-2" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="mt-8 flex justify-center">
        <nav className="flex items-center">
          <button
            onClick={() => paginate(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={`h-10 w-10 flex items-center justify-center rounded-l-md border ${
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <ChevronLeft size={16} />
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
            <button
              key={number}
              onClick={() => paginate(number)}
              className={`h-10 w-10 flex items-center justify-center border-t border-b ${
                currentPage === number
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {number}
            </button>
          ))}
          
          <button
            onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className={`h-10 w-10 flex items-center justify-center rounded-r-md border ${
              currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <ChevronRight size={16} />
          </button>
        </nav>
      </div>
    </div>
  );
}