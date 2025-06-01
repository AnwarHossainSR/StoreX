"use client";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import useDeviceInfo from "@/hooks/useDeviceInfo";
import useUserTracking from "@/hooks/useUserTracking";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { ChevronRight, Heart, ShoppingCart, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

export default function WishlistPage() {
  const { items, removeItem, clearWishlist, getTotalItems } =
    useWishlistStore();
  const { addItem } = useCartStore();
  const { userData, isLoading, error } = useUserTracking(10); // 10-day cache
  const deviceData = useDeviceInfo();
  const { user } = useCurrentUser();

  const handleRemoveItem = (id: string) => {
    console.log(
      "Remove Wishlist Item - User Info:",
      userData,
      "Device Info:",
      deviceData
    );
    removeItem(id, userData, deviceData, user);
  };

  const handleClearWishlist = () => {
    clearWishlist(userData, deviceData);
  };

  const handleMoveToCart = (item: any) => {
    addItem(item.product, 1, "Default", "Default", userData, deviceData, user);
    removeItem(item.id, userData, deviceData, user);
    toast.success("Moved to Cart", {
      description: `${item.product.title} has been added to your cart.`,
      action: {
        label: "View Cart",
        onClick: () => (window.location.href = "/cart"),
      },
    });
  };

  return (
    <div className="bg-gray-50 py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <ChevronRight size={16} className="mx-2 text-gray-600" />
          <span className="text-gray-800 font-medium">Wishlist</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Wishlist Items */}
          <div className="flex-grow">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">
                  Wishlist
                </h2>
                <span className="text-gray-600 text-sm font-medium">
                  {getTotalItems()} items
                </span>
              </div>

              {isLoading ? (
                <div className="text-center py-12">
                  <p className="text-lg font-medium text-gray-800">
                    Loading user data...
                  </p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-lg font-medium text-red-600">
                    Error: {error}
                  </p>
                </div>
              ) : items.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {items.map((item: any) => (
                    <div key={item.id} className="py-6 flex items-center">
                      <div className="flex-shrink-0 w-24 h-24 relative rounded-lg overflow-hidden">
                        <Image
                          src={
                            item.product.images[0]?.url ||
                            "/placeholder-image.jpg"
                          }
                          alt={item.product.title}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                      <div className="ml-6 flex-grow">
                        <h3 className="text-lg font-medium text-gray-800">
                          <Link
                            href={`/product/${item.product.id}`}
                            className="hover:text-blue-600 transition-colors"
                          >
                            {item.product.title}
                          </Link>
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Price: ${item.product.sale_price.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center ml-6">
                        <button
                          onClick={() => handleMoveToCart(item)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                          aria-label="Move to cart"
                        >
                          <ShoppingCart size={16} className="inline mr-2" />
                          Move to Cart
                        </button>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="ml-4 text-gray-400 hover:text-red-500 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Heart size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    Your wishlist is empty
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Looks like you haven't added anything to your wishlist yet.
                  </p>
                  <Link
                    href="/products"
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Continue Shopping
                  </Link>
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-6">
                <Link
                  href="/products"
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  Continue Shopping
                </Link>
                <button
                  onClick={handleClearWishlist}
                  className="text-red-600 hover:text-red-700 font-medium text-sm"
                >
                  Clear Wishlist
                </button>
              </div>
            )}
          </div>

          {/* Sidebar (Placeholder for Future Use) */}
          {items.length > 0 && (
            <div className="lg:w-96">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-6">
                  Wishlist Summary
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm">Total Items</span>
                    <span className="text-gray-800 text-sm">
                      {getTotalItems()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm">Total Value</span>
                    <span className="text-gray-800 text-sm">
                      $
                      {items
                        .reduce(
                          (total, item) => total + item.product.sale_price,
                          0
                        )
                        .toFixed(2)}
                    </span>
                  </div>
                </div>
                <Link
                  href="/cart"
                  className="mt-6 w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  View Cart
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
