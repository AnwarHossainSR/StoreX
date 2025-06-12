"use client";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useOrder, UseOrderReturn } from "@/hooks/useOrder";
import { useCartStore } from "@/stores/cartStore";
import { loadStripe, StripeElements } from "@stripe/stripe-js";
import { ChevronRight, Lock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { shippingAddress, user } = useCurrentUser({
    enabled: true,
    refetchOnMount: true,
  });
  const defaultShippingAddress = shippingAddress?.find(
    (addr) => addr.isDefault
  );

  const {
    sessionId,
    isLoading,
    error,
    createSession,
    createPaymentIntent,
    verifySession,
    placeOrder,
    formData,
    setFormData,
    couponCode,
    setCouponCode,
    discount,
    couponError,
    setCouponError,
    total,
    validateCoupon,
  } = useOrder();

  const [elements, setElements] = useState<StripeElements | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (defaultShippingAddress) {
      setFormData({
        email: formData.email || user?.email || "",
        name: defaultShippingAddress.name || formData.name,
        address: defaultShippingAddress.address || formData.address,
        apartment: formData.apartment,
        city: defaultShippingAddress.city || formData.city,
        country: defaultShippingAddress.country || formData.country,
        state: defaultShippingAddress.state || formData.state,
        zipCode: defaultShippingAddress.postalCode || formData.zipCode,
        phone: defaultShippingAddress.phone || formData.phone,
        cardNumber: formData.cardNumber,
        cardName: formData.cardName,
        expiryDate: formData.expiryDate,
        cvv: formData.cvv,
      });
    }
  }, [defaultShippingAddress, user, setFormData]);

  // Initialize Stripe Elements only once
  useEffect(() => {
    let mounted = true;

    const initializeStripe = async () => {
      const stripe = await stripePromise;
      if (stripe && mounted && !elements) {
        const newElements = stripe.elements({
          appearance: {
            theme: "stripe",
            variables: {
              colorPrimary: "#2563eb",
            },
          },
        });
        setElements(newElements);
      }
    };

    initializeStripe();

    return () => {
      mounted = false;
    };
  }, [elements]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(
      (prev) =>
        ({
          ...prev,
          [name]: value,
        } as UseOrderReturn["formData"])
    );
  };

  const handleCouponChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCouponCode(e.target.value);
    setCouponError(""); // Clear error on input change
  };

  const applyCoupon = useCallback(async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    try {
      await validateCoupon(couponCode);
    } catch (err) {
      // Error is handled in the mutation's onError
    }
  }, [validateCoupon, couponCode]);

  // Fixed handleSubmit function for multi-vendor payments
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (isProcessingPayment) return;

      if (!defaultShippingAddress) {
        toast.error("Please set a default shipping address");
        return;
      }

      if (!elements) {
        toast.error("Payment system not initialized. Please refresh the page.");
        return;
      }

      setIsProcessingPayment(true);

      try {
        // Step 1: Create session if not exists
        let activeSessionId = sessionId;
        if (!activeSessionId) {
          await createSession(
            defaultShippingAddress.id,
            couponCode ? { code: couponCode } : undefined
          );
          activeSessionId = sessionId; // This should be updated by createSession
        }

        if (!activeSessionId) {
          throw new Error("Failed to create payment session");
        }

        setCurrentSessionId(activeSessionId);

        // Step 2: Verify session and get seller information
        const sessionData = await verifySession();
        if (!sessionData?.success) {
          throw new Error("Session verification failed");
        }

        const stripe = await stripePromise;
        if (!stripe) {
          throw new Error("Stripe not initialized");
        }

        // Step 3: Process payments for each seller sequentially
        // Note: In a real multi-vendor scenario, you might want to use separate payment forms
        // or a different approach. This is a simplified version.

        const sellers = sessionData.session.sellers;
        let completedPayments = 0;

        for (const seller of sellers) {
          try {
            // Calculate the amount for this specific seller
            const sellerItems = sessionData.session.cart.filter(
              (item: any) => item.shopId === seller.shopId
            );

            if (sellerItems.length === 0) continue;

            const sellerAmount = sellerItems.reduce(
              (sum: number, item: any) => sum + item.quantity * item.sale_price,
              0
            );

            if (!seller.stripeAccountId) {
              throw new Error(
                `Seller ${seller.shopId} doesn't have Stripe account configured`
              );
            }

            // Create payment intent for this seller
            const paymentIntentData = await createPaymentIntent(
              seller.stripeAccountId,
              sellerAmount
            );

            if (!paymentIntentData?.clientSecret) {
              throw new Error(
                `Failed to create payment intent for seller ${seller.shopId}`
              );
            }

            // For the first seller, use the main payment element
            // For subsequent sellers, you might need a different approach
            // This is a simplified implementation
            if (completedPayments === 0) {
              // Create payment element for the first seller
              const paymentElement = elements.create("payment");
              await paymentElement.mount("#payment-element");

              const { error } = await stripe.confirmPayment({
                elements,
                clientSecret: paymentIntentData.clientSecret,
                confirmParams: {
                  payment_method_data: {
                    billing_details: {
                      name: formData.cardName || formData.name,
                      email: formData.email,
                      address: {
                        line1: formData.address,
                        line2: formData.apartment || undefined,
                        city: formData.city,
                        state: formData.state,
                        postal_code: formData.zipCode,
                        country: formData.country,
                      },
                      phone: formData.phone,
                    },
                  },
                  return_url: `${window.location.origin}/order-confirmation?session_id=${activeSessionId}`,
                },
                redirect: "if_required",
              });

              if (error) {
                if (
                  error.type === "card_error" ||
                  error.type === "validation_error"
                ) {
                  throw new Error(error.message);
                } else {
                  throw new Error("An unexpected error occurred.");
                }
              }
            } else {
              // For subsequent sellers, use the same payment method
              // This is a simplified approach - in reality, you might need to handle this differently
              const { error } = await stripe.confirmPayment({
                clientSecret: paymentIntentData.clientSecret,
                confirmParams: {
                  payment_method_data: {
                    billing_details: {
                      name: formData.cardName || formData.name,
                      email: formData.email,
                      address: {
                        line1: formData.address,
                        line2: formData.apartment || undefined,
                        city: formData.city,
                        state: formData.state,
                        postal_code: formData.zipCode,
                        country: formData.country,
                      },
                      phone: formData.phone,
                    },
                  },
                  return_url: `${window.location.origin}/order-confirmation?session_id=${activeSessionId}`,
                },
                redirect: "if_required",
              });

              if (error) {
                throw new Error(
                  `Payment failed for seller ${seller.shopId}: ${error.message}`
                );
              }
            }

            completedPayments++;
            toast.success(
              `Payment ${completedPayments}/${sellers.length} completed`
            );
          } catch (sellerError: any) {
            console.error(
              `Payment failed for seller ${seller.shopId}:`,
              sellerError
            );
            throw new Error(
              `Payment failed for one of the sellers: ${sellerError.message}`
            );
          }
        }

        // All payments successful
        toast.success("All payments processed successfully!");

        // Clear cart and reset form
        clearCart(null, null);
        placeOrder();

        // Redirect to confirmation page
        window.location.href = `/order-confirmation?session_id=${activeSessionId}`;
      } catch (err) {
        console.error("Payment error:", err);
        toast.error("Payment Error", {
          description:
            err instanceof Error ? err.message : "An unexpected error occurred",
        });
      } finally {
        setIsProcessingPayment(false);
      }
    },
    [
      isProcessingPayment,
      defaultShippingAddress,
      elements,
      sessionId,
      createSession,
      verifySession,
      createPaymentIntent,
      placeOrder,
      clearCart,
      formData,
      couponCode,
    ]
  );

  const subtotal = getTotalPrice();
  const shipping =
    subtotal > 100 || (couponCode.toUpperCase() === "FREESHIP" && !couponError)
      ? 0
      : 10;

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
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
    );
  }

  return (
    <div className="bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-blue-500 transition-colors">
            Home
          </Link>
          <ChevronRight size={16} className="mx-2" />
          <Link href="/cart" className="hover:text-blue-500 transition-colors">
            Cart
          </Link>
          <ChevronRight size={16} className="mx-2" />
          <span className="text-gray-800">Checkout</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Checkout Form */}
            <div className="flex-grow">
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">
                  Contact Information
                </h2>
                <div className="mb-4">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled
                  />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">
                  Shipping Address
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label
                      htmlFor="address"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Address
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label
                      htmlFor="apartment"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Apartment, suite, etc. (optional)
                    </label>
                    <input
                      type="text"
                      id="apartment"
                      name="apartment"
                      value={formData.apartment}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="city"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="country"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Country
                    </label>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="state"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      State / Province
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="zipCode"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      ZIP / Postal code
                    </label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Phone number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">
                  Payment Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Card details
                    </label>
                    <div
                      id="payment-element"
                      className="w-full border border-gray-300 rounded-md p-2 min-h-[40px]"
                    ></div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>
                      💡 Note: This will process separate payments for each
                      vendor in your cart.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:w-96">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-6">
                  Order Summary
                </h2>

                {/* Cart Items */}
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div
                      key={`${item.id}-${item.color}-${item.size}`}
                      className="flex items-center"
                    >
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                        <Image
                          src={
                            item.product.images[0]?.url ||
                            "/placeholder-image.jpg"
                          }
                          alt={item.product.title}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute -top-0 -right-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">
                          {item.quantity}
                        </div>
                      </div>
                      <div className="ml-4 flex-grow">
                        <h4 className="text-sm font-medium text-gray-800">
                          {item.product.title}
                        </h4>
                        <p className="text-sm text-gray-500">
                          ${item.product.sale_price.toFixed(2)}
                        </p>
                        {item.color && (
                          <p className="text-sm text-gray-500">
                            Color: {item.color}
                          </p>
                        )}
                        {item.size && (
                          <p className="text-sm text-gray-500">
                            Size: {item.size}
                          </p>
                        )}
                      </div>
                      <div className="text-sm font-medium text-gray-800">
                        ${(item.product.sale_price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupon Input */}
                <div className="mb-6">
                  <label
                    htmlFor="couponCode"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Coupon Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="couponCode"
                      value={couponCode}
                      onChange={handleCouponChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter coupon code"
                    />
                    <button
                      type="button"
                      onClick={applyCoupon}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                      disabled={isLoading}
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && (
                    <p className="mt-2 text-sm text-red-600">{couponError}</p>
                  )}
                </div>

                {/* Totals */}
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
                  {discount > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Discount</span>
                      <span className="text-green-600">
                        -${discount.toFixed(2)}
                      </span>
                    </div>
                  )}
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

                {/* Place Order Button */}
                <button
                  type="submit"
                  disabled={isLoading || isProcessingPayment || !elements}
                  className="mt-6 w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                >
                  <Lock size={20} className="mr-2" />
                  {isProcessingPayment
                    ? "Processing Payment..."
                    : isLoading
                    ? "Loading..."
                    : "Place Order"}
                </button>

                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

                {/* Security Notice */}
                <p className="mt-4 text-xs text-center text-gray-500">
                  Your payment information is encrypted and secure. We never
                  store your credit card details.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
