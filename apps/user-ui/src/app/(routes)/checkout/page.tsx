"use client";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useOrder } from "@/hooks/useOrder";
import { useCartStore } from "@/stores/cartStore";
import { loadStripe } from "@stripe/stripe-js";
import { ChevronRight, CreditCard, Lock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect } from "react";
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
    setDiscount,
    couponError,
    setCouponError,
    total,
  } = useOrder();

  // Update formData when defaultShippingAddress changes
  useEffect(() => {
    if (defaultShippingAddress) {
      setFormData({
        email: user?.email || formData.email || "",
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
  }, [defaultShippingAddress, setFormData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleCouponChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCouponCode(e.target.value);
    setCouponError(""); // Clear error on input change
  };

  const applyCoupon = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/coupons/validate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: couponCode }),
        }
      );
      const data = await response.json();
      if (!data.success) throw new Error(data.message);

      const subtotal = getTotalPrice();
      let newDiscount = 0;
      if (data.discountType === "fixed") {
        newDiscount = data.discountValue;
      } else if (data.discountType === "percentage") {
        newDiscount = (subtotal * data.discountValue) / 100;
      }
      setDiscount(newDiscount);
      setCouponError("");
      toast.success("Coupon Applied", {
        description: `Coupon ${couponCode} applied successfully!`,
      });
    } catch (err) {
      setCouponError("Invalid coupon code");
      setDiscount(0);
      toast.error("Invalid Coupon", { description: (err as Error).message });
    }
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!defaultShippingAddress) {
        toast.error("Please set a default shipping address");
        return;
      }

      try {
        await createSession(defaultShippingAddress.id, { code: couponCode });
        if (!sessionId) throw new Error("Session creation failed");

        const sessionData = await verifySession();
        if (!sessionData?.success)
          throw new Error("Session verification failed");

        const stripe = await stripePromise;
        if (!stripe) throw new Error("Stripe.js not loaded");

        // Handle multivendor payments
        for (const seller of sessionData.session.sellers) {
          const clientSecret = await createPaymentIntent(
            seller.stripeAccountId,
            total
          );
          const { error } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
              card: {
                number: formData.cardNumber,
                exp_month: parseInt(formData.expiryDate.split("/")[0]),
                exp_year: parseInt(`20${formData.expiryDate.split("/")[1]}`),
                cvc: formData.cvv,
              },
              billing_details: {
                name: formData.cardName,
                email: formData.email,
                address: {
                  line1: formData.address,
                  city: formData.city,
                  state: formData.state,
                  postal_code: formData.zipCode,
                  country: formData.country,
                },
              },
            },
          });

          if (error) throw error;
        }

        placeOrder();
      } catch (err) {
        toast.error("Payment Error", { description: (err as Error).message });
      }
    },
    [
      defaultShippingAddress,
      sessionId,
      createSession,
      verifySession,
      createPaymentIntent,
      placeOrder,
      formData,
      couponCode,
      total,
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
                  <label
                    htmlFor="cardNumber"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Card number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="cardNumber"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <CreditCard
                      className="absolute right-3 top-2.5 text-gray-400"
                      size={20}
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="cardName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Name on card
                  </label>
                  <input
                    type="text"
                    id="cardName"
                    name="cardName"
                    value={formData.cardName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="expiryDate"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Expiry date
                    </label>
                    <input
                      type="text"
                      id="expiryDate"
                      name="expiryDate"
                      placeholder="MM/YY"
                      value={formData.expiryDate}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="cvv"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      CVV
                    </label>
                    <input
                      type="text"
                      id="cvv"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
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
                  <div key={item.id} className="flex items-center">
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
                      <p className="text-sm text-gray-500">
                        Color: {item.color || "N/A"}
                      </p>
                      <p className="text-sm text-gray-500">
                        Size: {item.size || "N/A"}
                      </p>
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
                    onClick={applyCoupon}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
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
                onClick={handleSubmit}
                disabled={
                  isLoading ||
                  !formData.cardNumber ||
                  !formData.cardName ||
                  !formData.expiryDate ||
                  !formData.cvv
                }
                className="mt-6 w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              >
                <Lock size={20} className="mr-2" />
                {isLoading ? "Processing..." : "Place Order"}
              </button>

              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

              {/* Security Notice */}
              <p className="mt-4 text-xs text-center text-gray-500">
                Your payment information is encrypted and secure. We never store
                your credit card details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
