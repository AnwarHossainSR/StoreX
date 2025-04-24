'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Eye, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';

const featuredProducts = [
  {
    id: 1,
    name: 'iPhone 14 Pro Max',
    image: 'https://images.pexels.com/photos/10885666/pexels-photo-10885666.jpeg',
    price: 1099,
    discountPrice: 999,
    rating: 4.9,
    sold: 214,
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
    category: 'Electronics',
  },
];

export default function ProductSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const nextSlide = () => {
    if (sliderRef.current) {
      const containerWidth = sliderRef.current.offsetWidth;
      sliderRef.current.scrollBy({ left: containerWidth, behavior: 'smooth' });
    }
  };

  const prevSlide = () => {
    if (sliderRef.current) {
      const containerWidth = sliderRef.current.offsetWidth;
      sliderRef.current.scrollBy({ left: -containerWidth, behavior: 'smooth' });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (sliderRef.current) {
      setIsMouseDown(true);
      setStartX(e.pageX - sliderRef.current.offsetLeft);
      setScrollLeft(sliderRef.current.scrollLeft);
    }
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  const handleMouseLeave = () => {
    setIsMouseDown(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown) return;
    e.preventDefault();
    if (sliderRef.current) {
      const x = e.pageX - sliderRef.current.offsetLeft;
      const walk = (x - startX) * 2;
      sliderRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (sliderRef.current) {
        const containerWidth = sliderRef.current.offsetWidth;
        const itemWidth = containerWidth / 3; // Assuming 3 items visible
        const maxScrollPosition = sliderRef.current.scrollWidth - containerWidth;
        const newIndex = Math.round(sliderRef.current.scrollLeft / itemWidth);
        setCurrentIndex(newIndex);
      }
    };

    const handleScroll = () => {
      if (sliderRef.current) {
        const containerWidth = sliderRef.current.offsetWidth;
        const itemWidth = containerWidth / 3; // Assuming 3 items visible
        const newIndex = Math.round(sliderRef.current.scrollLeft / itemWidth);
        setCurrentIndex(newIndex);
      }
    };

    const sliderElement = sliderRef.current;
    if (sliderElement) {
      sliderElement.addEventListener('scroll', handleScroll);
      window.addEventListener('resize', handleResize);
    }

    return () => {
      if (sliderElement) {
        sliderElement.removeEventListener('scroll', handleScroll);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="relative">
      <div 
        ref={sliderRef}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
      >
        {featuredProducts.map((product) => (
          <div 
            key={product.id}
            className="min-w-[280px] sm:min-w-[300px] md:min-w-[320px] snap-start px-3 flex-shrink-0"
          >
            <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
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
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center z-10 hover:bg-gray-100 transition-colors focus:outline-none"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center z-10 hover:bg-gray-100 transition-colors focus:outline-none"
      >
        <ChevronRight size={20} />
      </button>

      {/* Dots */}
      <div className="flex justify-center mt-4">
        {Array.from({ length: Math.ceil(featuredProducts.length / 3) }).map((_, i) => (
          <button
            key={i}
            className={`h-2 w-2 rounded-full mx-1 transition-all ${
              i === currentIndex ? 'bg-blue-500 w-4' : 'bg-gray-300'
            }`}
            onClick={() => {
              if (sliderRef.current) {
                const containerWidth = sliderRef.current.offsetWidth;
                sliderRef.current.scrollTo({
                  left: containerWidth * i,
                  behavior: 'smooth',
                });
              }
            }}
          />
        ))}
      </div>
    </div>
  );
}