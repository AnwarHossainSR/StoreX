"use client";

import ProductCardSkeleton from "@/components/skeletons/ProductCardSkeleton";
import { useAlert } from "@/hooks/useAlert";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import useDeviceInfo from "@/hooks/useDeviceInfo";
import { useProduct } from "@/hooks/useProduct";
import useUserTracking from "@/hooks/useUserTracking";
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
import { useEffect } from "react";

export default function PopularProducts() {
  const {
    products,
    productsStatus,
    productsError,
    productsErrorDetails,
    currentPage,
    totalPages,
    setPage,
  } = useProduct();
  const { setError, clearAlert } = useAlert();
  const {
    addItem: addToWishlist,
    removeItem: removeFromWishlist,
    isInWishlist,
  } = useWishlistStore();
  const { userData } = useUserTracking(10);
  const deviceData = useDeviceInfo();
  const { user } = useCurrentUser();

  const { addItem: addToCart } = useCartStore();

  useEffect(() => {
    if (productsStatus === "error" && productsError) {
      setError(productsError, {
        details: productsErrorDetails,
        isBackendError: true,
      });
    } else {
      clearAlert();
    }
  }, [
    productsStatus,
    productsError,
    productsErrorDetails,
    setError,
    clearAlert,
  ]);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setPage(currentPage + 1);
    }
  };

  const handleToggleWishlist = (product: Product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id, userData, deviceData, user);
    } else {
      addToWishlist(product, userData, deviceData, user);
    }
  };

  const handleAddToCart = (product: Product) => {
    const defaultColor = product.colors[0] || "N/A";
    const defaultSize = product.sizes[0] || "N/A";
    addToCart(
      product,
      1,
      defaultColor,
      defaultSize,
      userData,
      deviceData,
      user
    );
  };

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {productsStatus === "pending" ? (
          <>
            {[...Array(4)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </>
        ) : products.length === 0 ? (
          <p className="col-span-full text-center text-gray-500">
            No products available
          </p>
        ) : (
          products.map((product: Product) => (
            <div
              key={product.id}
              className="flex flex-col bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              <div className="relative">
                <div className="relative h-60 overflow-hidden">
                  <Link href={`/products/${product.slug}`}>
                    <Image
                      src={
                        product.images[0]?.url ||
                        "https://via.placeholder.com/400"
                      }
                      alt={product.title}
                      width={400}
                      height={300}
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
                      className={isInWishlist(product.id) ? "fill-current" : ""}
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
                <p className="text-xs text-gray-500 mb-2">{product.category}</p>
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
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-8 space-x-4">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className={`p-2 rounded-full transition-colors focus:outline-none ${
              currentPage === 1
                ? "bg-gray-200 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
            aria-label="Previous page"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-gray-700 text-sm font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-full transition-colors focus:outline-none ${
              currentPage === totalPages
                ? "bg-gray-200 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
            aria-label="Next page"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
