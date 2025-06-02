import ProductPageSkeleton from "@/components/skeletons/ProductPageSkeleton";
import { Product, productService } from "@/services/productService";
import { ChevronRight } from "lucide-react";
import { Metadata } from "next";
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

// Generate dynamic metadata
export async function generateMetadata(props: {
  params: { slug: string };
}): Promise<Metadata> {
  const { slug } = await props.params;
  const { product } = await fetchProduct(slug);

  if (!product) {
    return {
      title: "Product Not Found",
      description: "The requested product could not be found.",
    };
  }

  // Calculate discount percentage
  const discountPercentage =
    product.regular_price > product.sale_price
      ? Math.round(
          ((product.regular_price - product.sale_price) /
            product.regular_price) *
            100
        )
      : 0;

  // Create structured description
  const description = `${product.short_description} | ${
    product.brand ? `${product.brand} | ` : ""
  }${discountPercentage > 0 ? `${discountPercentage}% OFF | ` : ""}৳${
    product.sale_price
  }${
    product.regular_price > product.sale_price
      ? ` (was ৳${product.regular_price})`
      : ""
  } | ${
    product.stock > 0 ? "In Stock" : "Out of Stock"
  } | Free Delivery Available`;

  // Get the primary image
  const primaryImage = product.images?.[0]?.url;

  return {
    title: `${product.title} | ${
      product.brand || product.category
    } | Best Price in Bangladesh`,
    description:
      description.length > 160
        ? description.substring(0, 157) + "..."
        : description,
    keywords: [
      product.title,
      product.brand,
      product.category,
      product.subCategory,
      ...product.tags,
      ...product.colors,
      "Bangladesh",
      "Online Shopping",
      "Best Price",
      product.cashOnDelivery ? "Cash on Delivery" : "",
    ]
      .filter(Boolean)
      .join(", "),

    // Open Graph metadata for social sharing
    openGraph: {
      title: `${product.title} - ${
        discountPercentage > 0 ? `${discountPercentage}% OFF` : "Best Price"
      }`,
      description: product.short_description,
      type: "website",
      url: `/products/${slug}`,
      images: primaryImage
        ? [
            {
              url: primaryImage,
              width: 800,
              height: 800,
              alt: product.title,
            },
          ]
        : [],
      siteName: process.env.NEXT_PUBLIC_SITE_NAME, // Replace with your actual site name
    },

    // Twitter Card metadata
    twitter: {
      card: "summary_large_image",
      title: `${product.title} - ${
        discountPercentage > 0 ? `${discountPercentage}% OFF` : "Best Price"
      }`,
      description: product.short_description,
      images: primaryImage ? [primaryImage] : [],
    },

    // Product-specific structured data
    other: {
      "product:price:amount": product.sale_price.toString(),
      "product:price:currency": "BDT",
      "product:availability": product.stock > 0 ? "in stock" : "out of stock",
      "product:condition": "new",
      "product:brand": product.brand || "",
      "product:category": product.category,
    },

    // Additional metadata
    robots: {
      index: product.status === "Active" && !product.isDeleted,
      follow: true,
      googleBot: {
        index: product.status === "Active" && !product.isDeleted,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },

    // Canonical URL to prevent duplicate content
    alternates: {
      canonical: `/products/${slug}`,
    },
  };
}

export default async function ProductPage(props: { params: { slug: string } }) {
  const { slug } = await props.params;
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
