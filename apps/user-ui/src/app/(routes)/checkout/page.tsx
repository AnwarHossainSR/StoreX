"use client";

import Loading from "@/components/ui/loading";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useOrder } from "@/hooks/useOrder";
import { isDevelopment, TEST_CARDS } from "@/lib/utils";
import { useCartStore } from "@/stores/cartStore";
import { useCheckoutStore } from "@/stores/checkoutStore";
import { loadStripe, StripeElements } from "@stripe/stripe-js";
import {
  AlertCircle,
  CheckCircle,
  ChevronRight,
  CreditCard,
  Lock,
  MapPin,
  Package,
  RefreshCw,
  Tag,
  TestTube,
  Truck,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function CheckoutPage() {
  const { items, getTotalPrice } = useCartStore();
  const { shippingAddress, user } = useCurrentUser({
    enabled: true,
    refetchOnMount: true,
  });
  const {
    sessionId,
    isLoading,
    createSession,
    verifySession,
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
  const { activeTab, setActiveTab, sessionCreated, triggerSessionCreation } =
    useCheckoutStore();

  const [elements, setElements] = useState<StripeElements | null>(null);
  const [stripe, setStripe] = useState<any>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );
  const [showTestCards, setShowTestCards] = useState(false);
  const [isStripeLoading, setIsStripeLoading] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<
    "success" | "failed" | null
  >(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const stripeElementsRef = useRef<HTMLDivElement>(null);
  const paymentElementRef = useRef<any>(null);

  // Set default address as selected on mount
  useEffect(() => {
    if (shippingAddress?.length && !selectedAddressId) {
      const defaultAddress = shippingAddress.find((addr) => addr.isDefault);
      setSelectedAddressId(defaultAddress?.id || shippingAddress[0].id);
    }
  }, [shippingAddress, selectedAddressId]);

  // Initialize Stripe once
  useEffect(() => {
    const initStripe = async () => {
      const stripeInstance = await stripePromise;
      setStripe(stripeInstance);
    };
    initStripe();
  }, []);

  // Initialize Stripe Elements after session creation
  useEffect(() => {
    let isMounted = true;

    const initializeStripeElements = async () => {
      if (!sessionCreated || !selectedAddressId || !stripe || activeTab !== 3) {
        return;
      }

      setIsStripeLoading(true);
      setStripeError(null);

      try {
        let activeSessionId = sessionId || currentSessionId;
        if (!activeSessionId) {
          activeSessionId = await createSession(
            selectedAddressId,
            couponCode ? { code: couponCode } : undefined
          );
          setCurrentSessionId(activeSessionId);
        }

        if (!isMounted) return;

        // Clean up existing elements
        if (paymentElementRef.current) {
          try {
            paymentElementRef.current.destroy();
          } catch (e) {
            console.warn("Error destroying payment element:", e);
          }
          paymentElementRef.current = null;
        }

        // Create new elements
        const newElements = stripe.elements({
          mode: "payment",
          currency: "usd",
          amount: Math.round(total * 100),
          paymentMethodCreation: "manual",
          appearance: {
            theme: "stripe",
            variables: {
              colorPrimary: "#2563eb",
              colorBackground: "#ffffff",
              colorText: "#1f2937",
              colorDanger: "#ef4444",
              fontFamily: "Inter, system-ui, sans-serif",
              spacingUnit: "4px",
              borderRadius: "8px",
            },
          },
        });

        if (isMounted) {
          setElements(newElements);

          // Create and mount payment element
          const paymentElement = newElements.create("payment", {
            layout: "tabs",
            defaultValues: {
              billingDetails: {
                name: user?.name || "",
                email: user?.email || formData.email || "",
              },
            },
          });

          if (stripeElementsRef.current && isMounted) {
            await paymentElement.mount(stripeElementsRef.current);
            paymentElementRef.current = paymentElement;
          }
        }
      } catch (error: any) {
        if (isMounted) {
          console.error("Stripe initialization error:", error);
          setStripeError(
            error.message || "Failed to load payment form. Please try again."
          );
        }
      } finally {
        if (isMounted) {
          setIsStripeLoading(false);
        }
      }
    };

    initializeStripeElements();

    return () => {
      isMounted = false;
      if (paymentElementRef.current) {
        try {
          paymentElementRef.current.destroy();
        } catch (e) {
          console.warn("Cleanup error:", e);
        }
        paymentElementRef.current = null;
      }
    };
  }, [
    sessionCreated,
    selectedAddressId,
    stripe,
    createSession,
    sessionId,
    currentSessionId,
    total,
    activeTab,
    couponCode,
    user,
    formData.email,
  ]);

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
    setCouponLoading(true);
    try {
      await validateCoupon(couponCode);
    } catch (err: any) {
      setCouponError(err.message || "Failed to apply coupon");
    } finally {
      setCouponLoading(false);
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
      if (isProcessingPayment || !stripe || !elements) return;

      setIsProcessingPayment(true);
      setStripeError(null);

      try {
        // Submit the payment form
        const { error: submitError } = await elements.submit();
        if (submitError) {
          throw new Error(submitError.message);
        }

        // Verify session
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

        // Create payment method
        const { error: paymentError, paymentMethod } =
          await stripe.createPaymentMethod({
            elements,
            params: {
              billing_details: {
                name: user?.name || "Customer",
                email: user?.email || formData.email || "unknown@example.com",
              },
            },
          });

        if (paymentError) {
          throw new Error(paymentError.message);
        }

        // Process payment
        await processFullPayment(paymentMethod.id);
        setPaymentStatus("success");
        setActiveTab(4);

        toast.success("Payment successful!", {
          description: "Your order has been placed successfully.",
        });
      } catch (err: any) {
        console.error("Payment error:", err);
        setPaymentStatus("failed");
        setStripeError(err.message || "Payment failed. Please try again.");
        toast.error("Payment Failed", {
          description: err.message || "An unexpected error occurred.",
        });
      } finally {
        setIsProcessingPayment(false);
      }
    },
    [
      isProcessingPayment,
      stripe,
      elements,
      sessionId,
      currentSessionId,
      verifySession,
      user,
      formData.email,
      processFullPayment,
      setActiveTab,
    ]
  );

  const retryPayment = () => {
    setPaymentStatus(null);
    setStripeError(null);
    setActiveTab(3);
  };

  const subtotal = getTotalPrice();
  const shipping =
    subtotal > 100 || (couponCode.toUpperCase() === "FREESHIP" && !couponError)
      ? 0
      : 10;

  const fillTestCard = useCallback(
    async (cardNumber: string, description: string) => {
      if (!isDevelopment) return;

      try {
        await navigator.clipboard.writeText(cardNumber);
        toast.success(`Copied: ${description}`, {
          description: `Card Number: ${cardNumber}`,
          duration: 3000,
        });
      } catch (error) {
        console.error("Error copying to clipboard:", error);
        toast.error("Failed to copy card number");
      }
    },
    [isDevelopment]
  );

  if (isLoading && activeTab === 1)
    return (
      <Loading
        size="lg"
        className="h-screen flex items-center justify-center"
      />
    );

  if (!isLoading && activeTab !== 4 && items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md mx-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Your cart is empty
          </h3>
          <p className="text-gray-600 mb-6">
            Looks like you haven't added anything to your cart yet.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center text-sm text-gray-500">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              Home
            </Link>
            <ChevronRight size={16} className="mx-2 text-gray-400" />
            <Link
              href="/cart"
              className="hover:text-blue-600 transition-colors"
            >
              Cart
            </Link>
            <ChevronRight size={16} className="mx-2 text-gray-400" />
            <span className="text-gray-900 font-medium">Checkout</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[
              { id: 1, name: "Address", icon: MapPin },
              { id: 2, name: "Review", icon: Package },
              { id: 3, name: "Payment", icon: CreditCard },
              { id: 4, name: "Complete", icon: CheckCircle },
            ].map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      activeTab === step.id
                        ? "bg-blue-600 text-white"
                        : activeTab > step.id
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {activeTab > step.id ? (
                      <CheckCircle size={20} />
                    ) : (
                      <step.icon size={20} />
                    )}
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <p
                      className={`text-sm font-medium ${
                        activeTab >= step.id ? "text-gray-900" : "text-gray-500"
                      }`}
                    >
                      {step.name}
                    </p>
                  </div>
                </div>
                {index < 3 && (
                  <div
                    className={`hidden sm:block w-20 h-1 mx-4 rounded-full ${
                      activeTab > step.id ? "bg-green-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Address */}
            {activeTab === 1 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-6">
                  <MapPin className="w-6 h-6 text-blue-600 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    Shipping Information
                  </h2>
                </div>

                {/* Contact Information */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Contact Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Email address
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={formData.email || user?.email || ""}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                        disabled
                      />
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Shipping Address
                  </h3>
                  <div className="space-y-4">
                    {sortedAddresses.length ? (
                      sortedAddresses.map((addr) => (
                        <label
                          key={addr.id}
                          className={`block p-4 border-2 rounded-xl cursor-pointer transition-all hover:bg-gray-50 ${
                            selectedAddressId === addr.id
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200"
                          }`}
                        >
                          <input
                            type="radio"
                            name="shippingAddress"
                            value={addr.id}
                            checked={selectedAddressId === addr.id}
                            onChange={() => setSelectedAddressId(addr.id)}
                            className="sr-only"
                            required
                          />
                          <div className="flex items-start">
                            <div
                              className={`w-5 h-5 rounded-full border-2 mr-4 mt-1 flex-shrink-0 ${
                                selectedAddressId === addr.id
                                  ? "border-blue-500 bg-blue-500"
                                  : "border-gray-300"
                              }`}
                            >
                              {selectedAddressId === addr.id && (
                                <div className="w-full h-full rounded-full bg-white scale-50"></div>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center mb-1">
                                <p className="font-semibold text-gray-900">
                                  {addr.name}
                                </p>
                                {addr.isDefault && (
                                  <span className="ml-2 px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-600 text-sm mb-1">
                                {addr.address}, {addr.city}, {addr.state}{" "}
                                {addr.postalCode}
                              </p>
                              <p className="text-gray-600 text-sm">
                                {addr.country}
                              </p>
                              <p className="text-gray-600 text-sm">
                                {addr.phone}
                              </p>
                            </div>
                          </div>
                        </label>
                      ))
                    ) : (
                      <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl">
                        <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">
                          No shipping addresses found.
                        </p>
                        <Link
                          href="/account/addresses"
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Add shipping address
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab(2)}
                  disabled={!selectedAddressId}
                  className="mt-8 w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Continue to Review Order
                </button>
              </div>
            )}

            {/* Step 2: Order Review */}
            {activeTab === 2 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-6">
                  <Package className="w-6 h-6 text-blue-600 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    Order Review
                  </h2>
                </div>

                {/* Order Items */}
                <div className="space-y-4 mb-8">
                  {items.map((item) => (
                    <div
                      key={`${item.id}-${item.color}-${item.size}`}
                      className="flex items-center p-4 bg-gray-50 rounded-xl"
                    >
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={
                            item.product.images[0]?.url ||
                            "/placeholder-image.jpg"
                          }
                          alt={item.product.title}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {item.quantity}
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {item.product.title}
                        </h4>
                        <div className="flex items-center space-x-4">
                          <p className="text-blue-600 font-bold">
                            ${item.product.sale_price.toFixed(2)}
                          </p>
                          {item.color && (
                            <span className="text-sm text-gray-600">
                              Color: {item.color}
                            </span>
                          )}
                          {item.size && (
                            <span className="text-sm text-gray-600">
                              Size: {item.size}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          $
                          {(item.product.sale_price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupon Section */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 mb-6">
                  <div className="flex items-center mb-4">
                    <Tag className="w-5 h-5 text-green-600 mr-2" />
                    <h3 className="font-semibold text-gray-900">
                      Apply Coupon
                    </h3>
                  </div>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={handleCouponChange}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter coupon code"
                    />
                    <button
                      type="button"
                      onClick={applyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 font-medium flex items-center"
                    >
                      {couponLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        "Apply"
                      )}
                    </button>
                  </div>
                  {couponError && (
                    <div className="mt-3 flex items-center text-red-600">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      <p className="text-sm">{couponError}</p>
                    </div>
                  )}
                  {discount > 0 && (
                    <div className="mt-3 flex items-center text-green-600">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      <p className="text-sm">
                        Coupon applied! You saved ${discount.toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex items-center justify-center"
                >
                  <Lock className="w-5 h-5 mr-2" />
                  Proceed to Payment
                </button>
              </div>
            )}

            {/* Step 3: Payment */}

            {/* Step 3: Payment */}
            {activeTab === 3 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-6">
                  <CreditCard className="w-6 h-6 text-blue-600 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    Payment Information
                  </h2>
                </div>

                {/* Development Test Cards */}
                {isDevelopment && (
                  <div className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <TestTube className="w-5 h-5 text-purple-600 mr-2" />
                        <h3 className="font-semibold text-gray-900">
                          Test Cards (Development Mode)
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowTestCards(!showTestCards)}
                        className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                      >
                        {showTestCards ? "Hide" : "Show"} Test Cards
                      </button>
                    </div>

                    {showTestCards && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                          {Object.entries(TEST_CARDS).map(([key, card]) => (
                            <button
                              key={key}
                              type="button"
                              onClick={() =>
                                fillTestCard(card.number, card.description)
                              }
                              className="p-4 bg-white rounded-lg border-2 border-purple-200 hover:border-purple-400 transition-all duration-200 text-left hover:shadow-md"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-gray-900">
                                  {card.description}
                                </span>
                                {key === "declined" && (
                                  <XCircle className="w-4 h-4 text-red-500" />
                                )}
                                {key === "insufficientFunds" && (
                                  <AlertCircle className="w-4 h-4 text-orange-500" />
                                )}
                                {key === "requiresAuth" && (
                                  <Lock className="w-4 h-4 text-blue-500" />
                                )}
                                {![
                                  "declined",
                                  "insufficientFunds",
                                  "requiresAuth",
                                ].includes(key) && (
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                )}
                              </div>
                              <div className="text-sm text-gray-600 font-mono mb-1">
                                •••• •••• •••• {card.number.slice(-4)}
                              </div>
                              <div className="text-xs text-gray-500">
                                Exp: {card.expiry} • CVC: {card.cvc}
                              </div>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Payment Form */}
                <form onSubmit={handlePaymentSubmit} className="space-y-6">
                  {/* Security Notice */}
                  <div className="flex items-center p-4 bg-green-50 rounded-lg">
                    <Lock className="w-5 h-5 text-green-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-green-800">
                        Secure Payment
                      </p>
                      <p className="text-xs text-green-700">
                        Your payment information is encrypted and secure
                      </p>
                    </div>
                  </div>

                  {/* Stripe Elements Container */}
                  {isStripeLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="flex items-center space-x-3">
                        <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
                        <span className="text-gray-600">
                          Loading payment form...
                        </span>
                      </div>
                    </div>
                  ) : stripeError ? (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center">
                        <XCircle className="w-5 h-5 text-red-600 mr-2" />
                        <p className="text-sm text-red-700">{stripeError}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium"
                      >
                        Retry loading payment form
                      </button>
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div ref={stripeElementsRef} />
                    </div>
                  )}

                  {/* Payment Error */}
                  {paymentStatus === "failed" && stripeError && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <XCircle className="w-5 h-5 text-red-600 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-red-800">
                              Payment Failed
                            </p>
                            <p className="text-sm text-red-700">
                              {stripeError}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={retryPayment}
                          className="ml-4 px-3 py-1 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50"
                        >
                          Retry
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={
                      isProcessingPayment || isStripeLoading || !!stripeError
                    }
                    className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isProcessingPayment ? (
                      <>
                        <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5 mr-2" />
                        Complete Payment • ${total.toFixed(2)}
                      </>
                    )}
                  </button>
                </form>

                {/* Development Payment Info */}
                {isDevelopment && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center mb-2">
                      <TestTube className="w-4 h-4 text-blue-600 mr-2" />
                      <p className="text-sm font-medium text-blue-800">
                        Development Mode
                      </p>
                    </div>
                    <p className="text-xs text-blue-700">
                      You're in development mode. Use the test cards above or
                      enter any email, and use test card numbers for payments.
                      No real charges will be made.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Complete */}
            {activeTab === 4 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
                {paymentStatus === "success" ? (
                  <>
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                      Order Placed Successfully!
                    </h2>
                    <p className="text-gray-600 mb-8 text-lg">
                      Thank you for your order. We've sent a confirmation email
                      with your order details.
                    </p>
                    <div className="space-y-4">
                      <Link
                        href="/dashboard/orders"
                        className="inline-block bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                      >
                        View Order Details
                      </Link>
                      <br />
                      <Link
                        href="/products"
                        className="inline-block text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Continue Shopping
                      </Link>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <XCircle className="w-12 h-12 text-red-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                      Payment Failed
                    </h2>
                    <p className="text-gray-600 mb-8 text-lg">
                      Something went wrong with your payment. Please try again
                      or contact our support team.
                    </p>
                    {stripeError && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                        <p className="text-red-700 text-sm">{stripeError}</p>
                      </div>
                    )}
                    <div className="space-y-4">
                      <button
                        onClick={retryPayment}
                        className="inline-block bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                      >
                        Try Payment Again
                      </button>
                      <br />
                      <Link
                        href="/cart"
                        className="inline-block text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Return to Cart
                      </Link>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Order Summary
              </h3>

              {/* Items Count */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                <span className="text-gray-600">Items ({items.length})</span>
                <span className="font-semibold text-gray-900">
                  ${subtotal.toFixed(2)}
                </span>
              </div>

              {/* Shipping */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Truck className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="text-gray-600">Shipping</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {shipping === 0 ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    `$${shipping.toFixed(2)}`
                  )}
                </span>
              </div>

              {/* Discount */}
              {discount > 0 && (
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Tag className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-gray-600">Discount</span>
                  </div>
                  <span className="font-semibold text-green-600">
                    -${discount.toFixed(2)}
                  </span>
                </div>
              )}

              {/* Total */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-blue-600">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Security Badge */}
              <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-center text-sm text-gray-600">
                  <Lock className="w-4 h-4 mr-2" />
                  <span>Secure SSL encrypted checkout</span>
                </div>
              </div>

              {/* Order Items Preview (show only on payment step) */}
              {activeTab === 3 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Order Items
                  </h4>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {items.map((item) => (
                      <div
                        key={`${item.id}-${item.color}-${item.size}`}
                        className="flex items-center space-x-3"
                      >
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={
                              item.product.images[0]?.url ||
                              "/placeholder-image.jpg"
                            }
                            alt={item.product.title}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {item.quantity}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.product.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            ${item.product.sale_price.toFixed(2)} each
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
