"use client";

import Loading from "@/components/ui/loading";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useOrder } from "@/hooks/useOrder";
import { useCartStore } from "@/stores/cartStore";
import { useCheckoutStore } from "@/stores/checkoutStore";
import { loadStripe, StripeElements } from "@stripe/stripe-js";
import { ChevronRight, Lock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
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
    createSession,
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
    processFullPayment,
  } = useOrder();
  const {
    activeTab,
    setActiveTab,
    sessionCreated,
    triggerSessionCreation,
    resetCheckout,
  } = useCheckoutStore();

  const [elements, setElements] = useState<StripeElements | null>(null);
  const [paymentElement, setPaymentElement] = useState<any>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );
  const [isStripeLoading, setIsStripeLoading] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<
    "success" | "failed" | null
  >(null);

  const paymentElementMounted = useRef(false);

  // Set default address as selected on mount
  useEffect(() => {
    if (shippingAddress?.length && !selectedAddressId) {
      const defaultAddress = shippingAddress.find((addr) => addr.isDefault);
      setSelectedAddressId(defaultAddress?.id || shippingAddress[0].id);
    }
  }, [shippingAddress, selectedAddressId]);

  // Initialize Stripe Elements after session creation
  useEffect(() => {
    let mounted = true;

    const initializeStripe = async () => {
      if (!sessionCreated || !selectedAddressId) return;

      setIsStripeLoading(true);
      setStripeError(null);
      try {
        const stripe = await stripePromise;
        if (!stripe || !mounted) return;

        let activeSessionId = sessionId || currentSessionId;
        if (!activeSessionId) {
          activeSessionId = await createSession(
            selectedAddressId,
            couponCode ? { code: couponCode } : undefined
          );
          setCurrentSessionId(activeSessionId);
        }

        const newElements = stripe.elements({
          mode: "payment",
          currency: "usd",
          amount: Math.round(total * 100),
          paymentMethodCreation: "manual",
          appearance: {
            theme: "stripe",
            variables: { colorPrimary: "#2563eb" },
          },
        });

        setElements(newElements);
      } catch (error: any) {
        setStripeError("Failed to load payment form. Please try again.");
      } finally {
        if (mounted) setIsStripeLoading(false);
      }
    };

    initializeStripe();

    return () => {
      mounted = false;
    };
  }, [
    sessionCreated,
    selectedAddressId,
    couponCode,
    createSession,
    sessionId,
    currentSessionId,
    total,
  ]);

  // Mount payment element
  useEffect(() => {
    if (
      elements &&
      !paymentElementMounted.current &&
      !isStripeLoading &&
      activeTab === 3
    ) {
      try {
        const newPaymentElement = elements.create("payment", {
          layout: "tabs",
        });
        const paymentElementDiv = document.getElementById("payment-element");
        if (paymentElementDiv) {
          newPaymentElement.mount("#payment-element");
          setPaymentElement(newPaymentElement);
          paymentElementMounted.current = true;
        }
      } catch (error: any) {
        setStripeError("Failed to load payment form");
      }
    }

    return () => {
      if (paymentElement && paymentElementMounted.current) {
        try {
          paymentElement.unmount();
          paymentElementMounted.current = false;
        } catch (error) {
          console.warn("Error unmounting payment element:", error);
        }
      }
    };
  }, [elements, isStripeLoading, activeTab, paymentElement]);

  // Show Stripe error
  useEffect(() => {
    if (stripeError && !isStripeLoading) {
      toast.error(stripeError, { duration: 5000 });
    }
  }, [stripeError, isStripeLoading]);

  const sortedAddresses = shippingAddress
    ? [...shippingAddress].sort((a, b) =>
        a.isDefault ? -1 : b.isDefault ? 1 : 0
      )
    : [];

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
    } catch (err: any) {
      setCouponError(err.message || "Failed to apply coupon");
    }
  }, [couponCode, validateCoupon]);

  const handlePlaceOrder = useCallback(async () => {
    if (!selectedAddressId) {
      toast.error("Please select a shipping address");
      return;
    }
    triggerSessionCreation();
    setActiveTab(3);
  }, [selectedAddressId, triggerSessionCreation, setActiveTab]);

  const handlePaymentSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (isProcessingPayment) return;

      if (!elements || !paymentElement || isStripeLoading) {
        toast.error(stripeError || "Payment system not initialized.");
        return;
      }

      setIsProcessingPayment(true);
      try {
        const stripe = await stripePromise;
        if (!stripe) throw new Error("Stripe not initialized");

        // Submit the payment form data
        const submitResult = await elements.submit();
        if (submitResult.error) {
          throw new Error(submitResult.error.message);
        }

        // Verify session after form submission
        let activeSessionId = sessionId || currentSessionId;
        const sessionData = await verifySession(activeSessionId!);
        if (!sessionData?.success) {
          throw new Error(
            sessionData?.message || "Session verification failed"
          );
        }

        if (sessionData.session.userId !== user?.id) {
          throw new Error("Session belongs to a different user");
        }

        // Create payment method after successful form submission
        const { error, paymentMethod } = await stripe.createPaymentMethod({
          elements,
          params: {
            billing_details: {
              name: user?.name || "Customer",
              email: user?.email || formData.email || "unknown@example.com",
            },
          },
        });

        if (error) {
          throw new Error(error.message);
        }

        processFullPayment(paymentMethod.id);
        setPaymentStatus("success");
        setActiveTab(4);
      } catch (err) {
        console.error("Payment error:", err);
        toast.error("Payment Error", {
          description:
            err instanceof Error
              ? err.message
              : "An unexpected error occurred.",
        });
        setPaymentStatus("failed");
        setActiveTab(4);
      } finally {
        setIsProcessingPayment(false);
      }
    },
    [
      isProcessingPayment,
      elements,
      paymentElement,
      isStripeLoading,
      stripeError,
      sessionId,
      currentSessionId,
      verifySession,
      placeOrder,
      clearCart,
      user,
      formData.email,
      setActiveTab,
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

        <div className="flex border-b border-gray-200 mb-6">
          {[
            { id: 1, name: "Personal & Address" },
            { id: 2, name: "Order Summary" },
            { id: 3, name: "Payment" },
            { id: 4, name: "Complete" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => activeTab >= tab.id && setActiveTab(tab.id)}
              className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${
                activeTab === tab.id
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : activeTab > tab.id
                  ? "text-gray-600 hover:text-blue-600 cursor-pointer"
                  : "text-gray-400 cursor-not-allowed"
              }`}
              disabled={activeTab < tab.id}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {activeTab === 1 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Personal & Address
            </h2>
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Contact Information
              </h3>
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
                  value={formData.email || user?.email || ""}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled
                />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Shipping Address
              </h3>
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
                    No shipping addresses found. Please add one in your account
                    settings.
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => setActiveTab(2)}
              disabled={!selectedAddressId}
              className="mt-6 w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              Continue to Order Summary
            </button>
          </div>
        )}

        {activeTab === 2 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
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
                        item.product.images[0]?.url || "/placeholder-image.jpg"
                      }
                      alt={item.product.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">
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
                      <p className="text-sm text-gray-500">Size: {item.size}</p>
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
                <span className="text-gray-800">${subtotal.toFixed(2)}</span>
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
                  <span className="text-lg font-bold text-gray-800">Total</span>
                  <span className="text-lg font-bold text-gray-800">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>
              <button
                onClick={handlePlaceOrder}
                disabled={isLoading}
                className="mt-6 w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              >
                <Lock size={20} className="mr-2" />
                Place Order
              </button>
            </div>
          </div>
        )}

        {activeTab === 3 && (
          <form onSubmit={handlePaymentSubmit}>
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Payment Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Card details
                  </label>
                  {isStripeLoading ? (
                    <div className="w-full border border-gray-300 rounded-md p-4 min-h-[200px] flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-sm text-gray-600">
                          Loading payment form...
                        </p>
                      </div>
                    </div>
                  ) : stripeError ? (
                    <div className="w-full border border-red-300 rounded-md p-4 min-h-[200px] flex items-center justify-center text-red-600 bg-red-50">
                      <div className="text-center">
                        <p className="text-sm">{stripeError}</p>
                        <button
                          type="button"
                          onClick={() => window.location.reload()}
                          className="mt-2 text-xs text-blue-600 hover:underline"
                        >
                          Refresh page
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      id="payment-element"
                      className="w-full border border-gray-300 rounded-md p-4 min-h-[200px]"
                    ></div>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  <p>
                    💡 Note: You will be charged once for the total amount,
                    which will be distributed to the respective vendors.
                  </p>
                </div>
              </div>
              <button
                type="submit"
                disabled={
                  isLoading ||
                  isProcessingPayment ||
                  !paymentElement ||
                  isStripeLoading
                }
                className="mt-6 w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              >
                <Lock size={20} className="mr-2" />
                {isProcessingPayment
                  ? "Processing Payment..."
                  : "Complete Payment"}
              </button>
            </div>
          </form>
        )}

        {activeTab === 4 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6 text-center">
            {paymentStatus === "success" ? (
              <>
                <h2 className="text-xl font-bold text-green-600 mb-4">
                  Order Placed Successfully!
                </h2>
                <p className="text-gray-600 mb-6">
                  Thank you for your order. You'll receive a confirmation email
                  soon.
                </p>
                <Link
                  href="/products"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Continue Shopping
                </Link>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold text-red-600 mb-4">
                  Payment Failed
                </h2>
                <p className="text-gray-600 mb-6">
                  Something went wrong with your payment. Please try again or
                  contact support.
                </p>
                <button
                  onClick={() => {
                    resetCheckout();
                    setActiveTab(1);
                  }}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Try Again
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
