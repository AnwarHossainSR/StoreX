"use client";

import { useAlert } from "@/hooks/useAlert";
import { useProduct } from "@/hooks/useProduct";
import { Product } from "@/services/productService";
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

  console.log("products", products);

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {productsStatus === "pending" ? (
          <p>Loading products...</p>
        ) : products.length === 0 ? (
          <p>No products available</p>
        ) : (
          products.map((product: Product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
            >
              <div className="relative">
                <div className="h-60 overflow-hidden">
                  <Image
                    src={
                      product.images[0]?.url ??
                      "https://via.placeholder.com/400"
                    }
                    alt={product.title}
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
                {product.sale_price < product.regular_price && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
                    {Math.round(
                      (1 - product.sale_price / product.regular_price) * 100
                    )}
                    % OFF
                  </div>
                )}
              </div>
              <div className="p-4">
                <Link href={`/product/${product.slug}`} className="block">
                  <h3 className="text-gray-800 font-medium mb-1 hover:text-blue-500 transition-colors">
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
                          ? "text-yellow-400"
                          : i < product.ratings
                          ? "text-yellow-300"
                          : "text-gray-300"
                      }`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3 .921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784 .57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81 .588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="text-xs text-gray-500 ml-1">
                    ({product.totalSales})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold text-gray-800">
                      ${product.sale_price}
                    </span>
                    {product.sale_price < product.regular_price && (
                      <span className="text-sm text-gray-500 line-through ml-2">
                        ${product.regular_price}
                      </span>
                    )}
                  </div>
                  <button className="text-sm text-blue-500 hover:text-blue-600 font-medium">
                    Add to cart
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-8 space-x-4">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className={`p-2 rounded-full ${
              currentPage === 1
                ? "bg-gray-200 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-full ${
              currentPage === totalPages
                ? "bg-gray-200 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
