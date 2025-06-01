"use client";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import useDeviceInfo from "@/hooks/useDeviceInfo";
import useUserTracking from "@/hooks/useUserTracking";
import { useCartStore } from "@/stores/cartStore";
import { ChevronRight, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, getTotalItems } =
    useCartStore();
  const { userData, isLoading, error } = useUserTracking(10); // 10-day cache
  const deviceData = useDeviceInfo();
  const { user } = useCurrentUser();

  const subtotal = items.reduce(
    (total, item) => total + item.product.sale_price * item.quantity,
    0
  );
  const shipping = subtotal > 100 ? 0 : 10;
  const total = subtotal + shipping;

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    updateQuantity(id, newQuantity, userData, deviceData);
  };

  const handleRemoveItem = (id: string) => {
    removeItem(id, userData, deviceData, user);
  };

  const handleClearCart = () => {
    clearCart(userData, deviceData);
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
          <span className="text-gray-800 font-medium">Shopping Cart</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="flex-grow">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">
                  Shopping Cart
                </h1>
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
                        <div className="flex items-center">
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
                          Unit Price: ${item.product.sale_price.toFixed(2)}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          Color: {item.color || "N/A"}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          Size: {item.size || "N/A"}
                        </p>
                      </div>
                      <div className="flex items-center ml-6">
                        <div className="flex items-center border border-gray-300 rounded-md">
                          <button
                            onClick={() =>
                              handleUpdateQuantity(item.id, item.quantity - 1)
                            }
                            className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50"
                            disabled={item.quantity <= 1}
                            aria-label="Decrease quantity"
                          >
                            <Minus size={16} className="text-gray-600" />
                          </button>
                          <span className="px-4 py-2 border-x border-gray-300 text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleUpdateQuantity(item.id, item.quantity + 1)
                            }
                            className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50"
                            disabled={item.quantity >= item.product.stock}
                            aria-label="Increase quantity"
                          >
                            <Plus size={16} className="text-gray-600" />
                          </button>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="ml-6 text-gray-400 hover:text-red-500 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                      <div className="ml-6 text-right">
                        <p className="text-lg font-medium text-gray-800">
                          $
                          {(item.product.sale_price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ShoppingCart
                    size={48}
                    className="mx-auto text-gray-400 mb-4"
                  />
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    Your cart is empty
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Looks like you haven't added anything to your cart yet.
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
                  onClick={handleClearCart}
                  className="text-red-600 hover:text-red-700 font-medium text-sm"
                >
                  Clear Cart
                </button>
              </div>
            )}
          </div>

          {/* Order Summary */}
          {items.length > 0 && (
            <div className="lg:w-96">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-6">
                  Order Summary
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm">Subtotal</span>
                    <span className="text-gray-800 text-sm">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm">Shipping</span>
                    <span className="text-gray-800 text-sm">
                      {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-semibold text-gray-800">
                        Total
                      </span>
                      <span className="text-base font-semibold text-gray-800">
                        ${total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                <Link
                  href="/checkout"
                  className="mt-6 w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
