import ProductPageSkeleton from "@/components/skeletons/ProductPageSkeleton";
import { Product, productService } from "@/services/productService";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import ProductDetailsClient from "./ProductDetailsClient";

async function fetchProduct(slug: string): Promise<{
  product: Product | null;
  error?: { message: string; details?: Record<string, any> };
}> {
  try {
    const response = await productService.getProductBySlug(slug);
    return { product: response.data };
  } catch (error: any) {
    return {
      product: null,
      error: {
        message: error.message || "Failed to fetch product",
        details: error.details || {},
      },
    };
  }
}

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const { product, error } = await fetchProduct(slug);

  if (error) {
    return (
      <div className="bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <p className="text-red-600 text-center">Error: {error.message}</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <p className="text-center">Product not found</p>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<ProductPageSkeleton />}>
      <div className="bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="flex items-center text-sm text-gray-600 mb-6">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              Home
            </Link>
            <ChevronRight size={16} className="mx-2 text-gray-400" />
            <Link
              href={`/categories/${product.category
                .toLowerCase()
                .replace(/\s+/g, "-")}`}
              className="hover:text-blue-600 transition-colors"
            >
              {product.category}
            </Link>
            <ChevronRight size={16} className="mx-2 text-gray-400" />
            <span className="text-gray-800">{product.title}</span>
          </nav>

          <ProductDetailsClient product={product} />
        </div>
      </div>
    </Suspense>
  );
}
