"use client";

import ProductCardSkeleton from "@/components/skeletons/ProductCardSkeleton";
import { useAlert } from "@/hooks/useAlert";
import { useProduct } from "@/hooks/useProduct";
import { Product } from "@/services/productService";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Heart,
  ShoppingCart,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function ProductSlider() {
  const {
    topProducts,
    topProductsStatus,
    topProductsError,
    topProductsErrorDetails,
  } = useProduct();
  const { setError, clearAlert } = useAlert();
  const {
    addItem: addToWishlist,
    removeItem: removeFromWishlist,
    isInWishlist,
  } = useWishlistStore();
  const { addItem: addToCart } = useCartStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  useEffect(() => {
    if (topProductsStatus === "error" && topProductsError) {
      setError(topProductsError, {
        details: topProductsErrorDetails,
        isBackendError: true,
      });
    } else {
      clearAlert();
    }
  }, [
    topProductsStatus,
    topProductsError,
    topProductsErrorDetails,
    setError,
    clearAlert,
  ]);

  const nextSlide = () => {
    if (sliderRef.current) {
      const containerWidth = sliderRef.current.offsetWidth;
      sliderRef.current.scrollBy({ left: containerWidth, behavior: "smooth" });
    }
  };

  const prevSlide = () => {
    if (sliderRef.current) {
      const containerWidth = sliderRef.current.offsetWidth;
      sliderRef.current.scrollBy({ left: -containerWidth, behavior: "smooth" });
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
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
        const itemWidth = containerWidth / 3;
        const newIndex = Math.round(sliderRef.current.scrollLeft / itemWidth);
        setCurrentIndex(newIndex);
      }
    };

    const handleScroll = () => {
      if (sliderRef.current) {
        const containerWidth = sliderRef.current.offsetWidth;
        const itemWidth = containerWidth / 3;
        const newIndex = Math.round(sliderRef.current.scrollLeft / itemWidth);
        setCurrentIndex(newIndex);
      }
    };

    const sliderElement = sliderRef.current;
    if (sliderElement) {
      sliderElement.addEventListener("scroll", handleScroll);
      window.addEventListener("resize", handleResize);
    }

    return () => {
      if (sliderElement) {
        sliderElement.removeEventListener("scroll", handleScroll);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleToggleWishlist = (product: Product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleAddToCart = (product: Product) => {
    const defaultColor = product.colors[0] || "N/A";
    const defaultSize = product.sizes[0] || "N/A";
    addToCart(product, 1, defaultColor, defaultSize);
  };

  return (
    <div className="relative">
      <div
        ref={sliderRef}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
      >
        {topProductsStatus === "pending" ? (
          <div className="flex">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="w-[350px] sm:min-w-[300px] md:min-w-[320px] snap-start px-4 flex-shrink-0 py-3"
              >
                <ProductCardSkeleton />
              </div>
            ))}
          </div>
        ) : topProducts.length === 0 ? (
          <p className="text-center w-full py-6 text-gray-500">
            No products available
          </p>
        ) : (
          <ul className="flex">
            {topProducts.map((product: Product) => (
              <li
                key={product.id}
                className="w-[350px] sm:min-w-[300px] md:min-w-[320px] snap-start px-4 flex-shrink-0 py-3"
              >
                <div className="flex flex-col bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
                  <div className="relative group">
                    <div className="relative h-60 overflow-hidden">
                      <Link href={`/products/${product.slug}`}>
                        <Image
                          src={
                            product.images[0]?.url ||
                            "https://via.placeholder.com/400"
                          }
                          alt={product.title}
                          width={350}
                          height={240}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 rounded-t-xl"
                        />
                      </Link>
                    </div>
                    <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => handleToggleWishlist(product)}
                        className={`w-[2.5rem] h-[2.25rem] rounded-lg bg-white/80 shadow-md hover:bg-gray-100 flex items-center justify-center transition-colors focus:outline-none ${
                          isInWishlist(product.id)
                            ? "text-red-500"
                            : "text-gray-600"
                        }`}
                        aria-label={
                          isInWishlist(product.id)
                            ? "Remove from wishlist"
                            : "Add to wishlist"
                        }
                      >
                        <Heart
                          size={18}
                          className={
                            isInWishlist(product.id) ? "fill-current" : ""
                          }
                        />
                      </button>
                      <Link
                        href={`/products/${product.slug}`}
                        className="w-[2.5rem] h-[2.25rem] rounded-lg bg-white/80 shadow-md hover:bg-gray-100 flex items-center justify-center transition-colors"
                        aria-label="View product"
                      >
                        <Eye size={18} className="text-gray-600" />
                      </Link>
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                        className="w-[2.5rem] h-[2.25rem] rounded-lg bg-white/80 shadow-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors focus:outline-none"
                        aria-label="Add to cart"
                      >
                        <ShoppingCart size={18} className="text-gray-600" />
                      </button>
                    </div>
                    {product.sale_price < product.regular_price && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
                        {Math.round(
                          (1 - product.sale_price / product.regular_price) * 100
                        )}
                        % OFF
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <Link href={`/products/${product.slug}`} className="block">
                      <h3 className="text-gray-800 font-medium text-base mb-1 hover:text-blue-600 transition-colors line-clamp-2">
                        {product.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-gray-500 mb-2">
                      {product.category}
                    </p>
                    <div className="flex items-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          xmlns="http://www.w3.org/2000/svg"
                          className={`h-4 w-4 ${
                            i < Math.floor(product.ratings)
                              ? "text-yellow-400 fill-current"
                              : i < product.ratings
                              ? "text-yellow-300 fill-current"
                              : "text-gray-300"
                          }`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3 .921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784 .57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81 .588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="text-xs text-gray-500 ml-1">
                        ({product.totalSales})
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-semibold text-gray-900">
                          ${product.sale_price.toFixed(2)}
                        </span>
                        {product.sale_price < product.regular_price && (
                          <span className="text-sm text-gray-500 line-through">
                            ${product.regular_price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        onClick={prevSlide}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center z-10 hover:bg-gray-100 transition-colors focus:outline-none"
        aria-label="Previous slide"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center z-10 hover:bg-gray-100 transition-colors focus:outline-none"
        aria-label="Next slide"
      >
        <ChevronRight size={20} />
      </button>

      <div className="flex justify-center mt-4">
        {Array.from({ length: Math.ceil(topProducts.length / 3) }).map(
          (_, i) => (
            <button
              key={i}
              className={`h-2 w-2 rounded-full mx-1 transition-all ${
                i === currentIndex ? "bg-blue-600 w-4" : "bg-gray-300"
              }`}
              onClick={() => {
                if (sliderRef.current) {
                  const containerWidth = sliderRef.current.offsetWidth;
                  sliderRef.current.scrollTo({
                    left: containerWidth * i,
                    behavior: "smooth",
                  });
                }
              }}
              aria-label={`Go to slide ${i + 1}`}
            />
          )
        )}
      </div>
    </div>
  );
}
