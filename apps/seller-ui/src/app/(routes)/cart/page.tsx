"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";

// Mock cart data - In a real app, this would come from a state management solution
const initialCartItems = [
  {
    id: 1,
    name: "iPhone 14 Pro Max",
    image: "https://images.pexels.com/photos/5750001/pexels-photo-5750001.jpeg",
    price: 999,
    quantity: 1,
  },
  {
    id: 2,
    name: "Blue Rose Gift Box",
    image: "https://images.pexels.com/photos/2072152/pexels-photo-2072152.jpeg",
    price: 49,
    quantity: 2,
  },
];

export default function CartPage() {
  const [cartItems, setCartItems] = useState(initialCartItems);

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCartItems(
      cartItems.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id: number) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const shipping = subtotal > 100 ? 0 : 10;
  const total = subtotal + shipping;

  return (
    <div className="bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-blue-500 transition-colors">
            Home
          </Link>
          <ChevronRight size={16} className="mx-2" />
          <span className="text-gray-800">Shopping Cart</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="flex-grow">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                  Shopping Cart
                </h1>
                <span className="text-gray-600">{cartItems.length} items</span>
              </div>

              {cartItems.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {cartItems.map((item) => (
                    <div key={item.id} className="py-6 flex items-center">
                      <div className="flex-shrink-0 w-24 h-24 relative rounded-lg overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="ml-6 flex-grow">
                        <h3 className="text-lg font-medium text-gray-800">
                          <Link
                            href={`/product/${item.id}`}
                            className="hover:text-blue-500"
                          >
                            {item.name}
                          </Link>
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Unit Price: ${item.price}
                        </p>
                      </div>
                      <div className="flex items-center ml-6">
                        <div className="flex items-center border border-gray-300 rounded-md">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="p-2 hover:bg-gray-100 transition-colors"
                          >
                            <Minus size={16} className="text-gray-600" />
                          </button>
                          <span className="px-4 py-2 border-x border-gray-300">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="p-2 hover:bg-gray-100 transition-colors"
                          >
                            <Plus size={16} className="text-gray-600" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="ml-6 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                      <div className="ml-6 text-right">
                        <p className="text-lg font-medium text-gray-800">
                          ${(item.price * item.quantity).toFixed(2)}
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
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Continue Shopping
                  </Link>
                </div>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-6">
                <Link
                  href="/products"
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Continue Shopping
                </Link>
                <button
                  onClick={() => setCartItems([])}
                  className="text-red-600 hover:text-red-500 font-medium"
                >
                  Clear Cart
                </button>
              </div>
            )}
          </div>

          {/* Order Summary */}
          {cartItems.length > 0 && (
            <div className="lg:w-96">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-6">
                  Order Summary
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-800">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-800">
                      {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-800">
                        Total
                      </span>
                      <span className="text-lg font-bold text-gray-800">
                        ${total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                <Link
                  href="/checkout"
                  className="mt-6 w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
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
