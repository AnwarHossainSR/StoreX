"use client";

import { useOrder } from "@/hooks/useOrder";
import { Order } from "@/services/orderService";
import { Filter, Search, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function OrdersPage() {
  const { getAllOrders, isLoading, error } = useOrder();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const fetchedOrders = await getAllOrders();
        setOrders(fetchedOrders);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      }
    };

    fetchOrders();
  }, [getAllOrders]);

  const filteredOrders = orders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (statusFilter === "" || order.status === statusFilter)
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 text-red-500">
        Error loading orders: {error}
        <button
          onClick={async () => await getAllOrders()}
          className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search
              size={20}
              className="absolute left-3 top-2.5 text-gray-400"
            />
          </div>
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2">
              <Filter size={18} />
              <span>Filter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-lg shadow-sm">
        {filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                    Order ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                    Items
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                    Total
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {order.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {order.date}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {order.items}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {order.total}
                    </td>
                    <td className="px-6 py-4">
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
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Link
                        href={`/dashboard/orders/${order.id}`}
                        className="text-blue-500 hover:underline"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="bg-gray-100 p-4 rounded-full mb-4">
              <ShoppingBag size={48} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No orders yet
            </h3>
            <p className="text-gray-500 mb-6">
              You haven't placed any orders yet.
            </p>
            <Link
              href="/products"
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
