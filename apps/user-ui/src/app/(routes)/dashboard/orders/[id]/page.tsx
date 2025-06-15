"use client";

import Loading from "@/components/ui/loading";
import { orderService } from "@/services/orderService";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function OrderDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const {
    data: order,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["order", id],
    queryFn: () => orderService.getSingleOrder(id as string),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading size="md" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-16 text-red-500">
        Error loading order: {(error as Error)?.message || "Order not found"}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link
        href="/dashboard/orders"
        className="flex items-center text-blue-500 hover:underline mb-6"
      >
        <ArrowLeft size={20} className="mr-2" />
        Back to Orders
      </Link>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Order #{order.id}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Order Summary */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Order Summary
            </h2>
            <div className="space-y-2">
              <p>
                <span className="text-gray-500">Date: </span>
                {order.date}
              </p>
              <p>
                <span className="text-gray-500">Status: </span>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    order.status === "Paid"
                      ? "bg-green-100 text-green-800"
                      : order.status === "Pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : order.status === "Shipped"
                      ? "bg-blue-100 text-blue-800"
                      : order.status === "Delivered"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {order.status}
                </span>
              </p>
              <p>
                <span className="text-gray-500">Total: </span>$
                {order.total.toFixed(2)}
              </p>
              {order.couponCode && (
                <p>
                  <span className="text-gray-500">Coupon: </span>
                  {order.couponCode} (-${order.discountAmount.toFixed(2)})
                </p>
              )}
              <p>
                <span className="text-gray-500">Shop: </span>
                {order.shop.name}
              </p>
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Shipping Address
              </h2>
              <div className="space-y-2">
                <p>{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.address}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                  {order.shippingAddress.postalCode}
                </p>
                <p>{order.shippingAddress.country}</p>
                {order.shippingAddress.phone && (
                  <p>
                    <span className="text-gray-500">Phone: </span>
                    {order.shippingAddress.phone}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Order Items */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Order Items
          </h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div
                key={item.productId}
                className="flex items-center gap-4 border-b pb-4"
              >
                <img
                  src={item.image || "/placeholder-image.jpg"}
                  alt={item.title}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-500">
                    Quantity: {item.quantity}
                  </p>
                  <p className="text-sm text-gray-500">
                    Price: ${item.price.toFixed(2)}
                  </p>
                  {item.selectedOptions &&
                    Object.keys(item.selectedOptions).length > 0 && (
                      <p className="text-sm text-gray-500">
                        Options:{" "}
                        {Object.entries(item.selectedOptions)
                          .map(([key, value]) => `${key}: ${value}`)
                          .join(", ")}
                      </p>
                    )}
                </div>
                <p className="font-medium text-gray-900">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
