import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ProductGrid from "../../components/products/ProductGrid";
import FilterSidebar from "../../components/products/FilterSidebar";

export default function ProductsPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="bg-white py-8 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            All Products
          </h1>

          {/* Breadcrumb */}
          <div className="flex items-center text-sm text-gray-500">
            <Link href="/" className="hover:text-blue-500 transition-colors">
              Home
            </Link>
            <ChevronRight size={16} className="mx-2" />
            <span className="text-gray-800">All Products</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="w-full md:w-1/4">
            <FilterSidebar />
          </div>

          {/* Product Listing */}
          <div className="w-full md:w-3/4">
            <ProductGrid />
          </div>
        </div>
      </div>
    </div>
  );
}
