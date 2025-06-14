"use client";

import Loading from "@/components/ui/loading";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useOrder } from "@/hooks/useOrder";
import { VerifySessionResponse } from "@/services/orderService";
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
  const {
    sessionId,
    isLoading,
    error,
    createSession,
    createPaymentIntent,
    verifySession,
    placeOrder,
    formData,
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
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );

  const [isStripeLoading, setIsStripeLoading] = useState(true);
  const [stripeError, setStripeError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const initializeStripe = async () => {
      setIsStripeLoading(true);
      setStripeError(null);
      try {
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
          console.log("Stripe Elements initialized successfully");
          setElements(newElements);
        }
      } catch (error: any) {
        console.error("Failed to initialize Stripe Elements:", error);
        setStripeError("Failed to load payment form. Please refresh the page.");
      } finally {
        setIsStripeLoading(false);
      }
    };

    initializeStripe();

    return () => {
      mounted = false;
    };
  }, [elements]);

  useEffect(() => {
    if (stripeError && !isStripeLoading) {
      toast.error(stripeError, {
        duration: 5000, // Show for 5 seconds to avoid spamming
      });
    }
  }, [stripeError, isStripeLoading]);

  useEffect(() => {
    if (stripeError && !isStripeLoading) {
      toast.error(stripeError, {
        duration: 5000, // Show for 5 seconds to avoid spamming
      });
    }
  }, [stripeError, isStripeLoading]);

  useEffect(() => {
    if (stripeError && !isStripeLoading) {
      toast.error(stripeError, {
        duration: 5000, // Show for 5 seconds to avoid spamming
      });
    }
  }, [stripeError, isStripeLoading]);

  // Set default address as selected on mount
  useEffect(() => {
    if (shippingAddress?.length && !selectedAddressId) {
      const defaultAddress = shippingAddress.find((addr) => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      } else {
        setSelectedAddressId(shippingAddress[0].id);
      }
    }
  }, [shippingAddress, selectedAddressId]);

  // Sort addresses to show default first
  const sortedAddresses = shippingAddress
    ? [...shippingAddress].sort((a, b) =>
        a.isDefault ? -1 : b.isDefault ? 1 : 0
      )
    : [];

  // Log sessionId for debugging
  useEffect(() => {
    console.log("CheckoutPage sessionId:", sessionId);
    console.log("CheckoutPage currentSessionId:", currentSessionId);
  }, [sessionId, currentSessionId]);

  const handleCouponChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCouponCode(e.target.value);
    setCouponError("");
  };

  const applyCoupon = useCallback(async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    try {
      await validateCoupon(couponCode);
    } catch (err) {
      console.error("Coupon validation failed:", err);
    }
  }, [validateCoupon, couponCode]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (isProcessingPayment) return;

      if (!selectedAddressId) {
        toast.error("Please select a shipping address");
        return;
      }

      if (!elements || isStripeLoading) {
        toast.error(
          stripeError ||
            "Payment system not initialized. Please refresh the page."
        );
        return;
      }

      setIsProcessingPayment(true);

      try {
        let activeSessionId = sessionId;
        if (!activeSessionId) {
          activeSessionId = await createSession(
            selectedAddressId,
            couponCode ? { code: couponCode } : undefined
          );
          console.log("Created session in handleSubmit:", activeSessionId);
          setCurrentSessionId(activeSessionId);
        }

        const maxRetries = 2;
        let sessionData: VerifySessionResponse | null = null;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            sessionData = await verifySession(activeSessionId);
            if (!sessionData?.success) {
              console.warn(
                "Session verification failed:",
                sessionData?.message
              );
              toast.error("Session verification failed", {
                description:
                  sessionData?.message ||
                  "Please try again or contact support.",
              });
              throw new Error(
                sessionData?.message || "Session verification failed"
              );
            }
            break;
          } catch (error: any) {
            console.warn(
              `Session verification attempt ${attempt} failed:`,
              error.message
            );
            if (attempt === maxRetries) {
              throw new Error("Session verification failed after retries");
            }
            activeSessionId = await createSession(
              selectedAddressId,
              couponCode ? { code: couponCode } : undefined
            );
            console.log(
              `Recreated session on attempt ${attempt}:`,
              activeSessionId
            );
            setCurrentSessionId(activeSessionId);
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        }

        if (!sessionData) {
          throw new Error("No session data after retries");
        }

        if (sessionData.session.userId !== user?.id) {
          throw new Error("Session belongs to a different user");
        }

        const stripe = await stripePromise;
        if (!stripe) {
          throw new Error("Stripe not initialized");
        }

        const sellers = sessionData.session.sellers;
        let completedPayments = 0;

        for (const seller of sellers) {
          try {
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

            const paymentIntentData = await createPaymentIntent(
              seller.stripeAccountId,
              sellerAmount
            );

            if (!paymentIntentData?.clientSecret) {
              throw new Error(
                `Failed to create payment intent for seller ${seller.shopId}`
              );
            }

            // Create and mount payment element with clientSecret and amount
            const paymentElement = elements.create("payment", {
              clientSecret: paymentIntentData.clientSecret,
              amount: Math.round(sellerAmount * 100), // Amount in cents
            });
            paymentElement.mount("#payment-element");

            const { error } = await stripe.confirmPayment({
              elements,
              clientSecret: paymentIntentData.clientSecret,
              confirmParams: {
                payment_method_data: {
                  billing_details: {
                    name: user?.name || "Customer",
                    email:
                      user?.email || formData.email || "unknown@example.com",
                  },
                },
                return_url: `${window.location.origin}/order-confirmation?session_id=${activeSessionId}`,
              },
              redirect: "if_required",
            });

            if (error) {
              throw new Error(error.message);
            }

            completedPayments++;
            toast.success(
              `Payment for vendor ${completedPayments}/${sellers.length} completed`
            );
          } catch (sellerError: any) {
            console.error(
              `Payment failed for seller ${seller.shopId}:`,
              sellerError
            );
            throw new Error(
              `Payment failed for vendor ${seller.shopId}: ${sellerError.message}`
            );
          }
        }

        toast.success("All payments processed successfully!");
        clearCart(null, null);
        placeOrder();
        window.location.href = `/order-confirmation?session_id=${activeSessionId}`;
      } catch (err) {
        console.error("Payment error:", err);
        toast.error("Payment Error", {
          description:
            err instanceof Error
              ? err.message
              : "An unexpected error occurred. Please try again or contact support.",
        });
      } finally {
        setIsProcessingPayment(false);
      }
    },
    [
      isProcessingPayment,
      selectedAddressId,
      elements,
      isStripeLoading,
      stripeError,
      sessionId,
      createSession,
      verifySession,
      createPaymentIntent,
      placeOrder,
      clearCart,
      couponCode,
      user,
      formData.email,
    ]
  );
  const subtotal = getTotalPrice();
  const shipping =
    subtotal > 100 || (couponCode.toUpperCase() === "FREESHIP" && !couponError)
      ? 0
      : 10;

  if (isLoading)
    return (
      <Loading
        size="lg"
        className="h-screen flex items-center justify-center"
      />
    );

  if (!isLoading && items.length === 0) {
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
                    value={formData.email || user?.email || ""}
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
                <div className="space-y-4">
                  {sortedAddresses.length ? (
                    sortedAddresses.map((addr) => (
                      <label
                        key={addr.id}
                        className="flex items-center p-4 border rounded-md cursor-pointer hover:bg-gray-50"
                      >
                        <input
                          type="radio"
                          name="shippingAddress"
                          value={addr.id}
                          checked={selectedAddressId === addr.id}
                          onChange={() => setSelectedAddressId(addr.id)}
                          className="mr-4"
                          required
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {addr.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {addr.address}, {addr.city}, {addr.state}{" "}
                            {addr.postalCode}, {addr.country}
                          </p>
                          <p className="text-sm text-gray-600">{addr.phone}</p>
                          {addr.isDefault && (
                            <span className="text-xs text-green-600">
                              Default
                            </span>
                          )}
                        </div>
                      </label>
                    ))
                  ) : (
                    <p className="text-sm text-gray-600">
                      No shipping addresses found. Please add one in your
                      account settings.
                    </p>
                  )}
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
                    {isStripeLoading ? (
                      <div className="w-full border border-gray-300 rounded-md p-2 min-h-[160px] flex items-center justify-center">
                        Loading payment form...
                      </div>
                    ) : stripeError ? (
                      <div
                        id="payment-element"
                        className="w-full border border-gray-300 rounded-md p-2 min-h-[160px] flex items-center justify-center text-red-600"
                      >
                        {stripeError}
                      </div>
                    ) : (
                      <div
                        id="payment-element"
                        className="w-full border border-gray-300 rounded-md p-2 min-h-[160px]"
                      ></div>
                    )}
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

            <div className="lg:w-96">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-6">
                  Order Summary
                </h2>

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

                  {error && (
                    <p className="mt-2 text-sm text-red-600">{error}</p>
                  )}

                  <p className="mt-4 text-xs text-center text-gray-500">
                    Your payment information is encrypted and secure. We never
                    store your credit card details.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
