"use client";

import { useOrder } from "@/hooks/useOrder";
import ConfirmationModal from "@/packages/components/ConfirmationModal";
import { Pagination } from "@/packages/components/Pagination";
import { Table } from "@/packages/components/Table";
import { Download, Edit, Eye, Filter, Package, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderToUpdate, setOrderToUpdate] = useState<{
    id: string;
    customer: string;
  } | null>(null);
  const entriesPerPage = 10;

  const router = useRouter();
  const { getOrders, updateOrderStatus, exportOrders } = useOrder();
  const { data: ordersData, status: ordersStatus } = getOrders(
    currentPage,
    entriesPerPage,
    searchTerm,
    selectedStatus !== "all" ? selectedStatus : undefined,
    sortField,
    sortDirection
  );

  // Debug renders
  useEffect(() => {
    console.log("OrdersPage rendered", {
      currentPage,
      searchTerm,
      selectedStatus,
      sortField,
      sortDirection,
      ordersStatus,
    });
  });

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  const handleStatusToggle = async (orderId: string, currentStatus: string) => {
    setOrderToUpdate({
      id: orderId,
      customer: ordersData?.data.find((o) => o.id === orderId)?.customer || "",
    });
    setIsModalOpen(true);
  };

  const filteredOrders = ordersData?.data || [];
  const totalOrders = ordersData?.total || filteredOrders.length;
  const paidOrders = filteredOrders.filter(
    (order) => order.status === "Paid"
  ).length;
  const pendingOrders = filteredOrders.filter(
    (order) => order.status === "Pending"
  ).length;

  const columns = [
    {
      key: "image",
      header: "Image",
      sortable: false,
      render: (order: any) => (
        <img
          src={order.items?.[0]?.image}
          alt={order.items?.[0]?.title || "Order"}
          className="h-12 w-12 object-cover rounded-md"
        />
      ),
    },
    {
      key: "orderId",
      header: "Order ID",
      sortable: true,
      render: (order: any) => (
        <div className="text-sm font-medium text-gray-900">
          #{order.orderId}
        </div>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      sortable: true,
      render: (order: any) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {order.customer}
          </div>
          <div className="text-sm text-gray-500">{order.email}</div>
        </div>
      ),
    },
    {
      key: "date",
      header: "Date",
      sortable: true,
      render: (order: any) => new Date(order.date).toLocaleDateString(),
    },
    {
      key: "total",
      header: "Total",
      sortable: true,
      render: (order: any) => `$${parseFloat(order.total).toFixed(2)}`,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (order: any) => (
        <div className="flex items-center space-x-2">
          <span
            className={`px-2 py-1 text-xs font-semibold rounded-full ${
              order.status === "Paid"
                ? "bg-green-100 text-green-800"
                : order.status === "Pending"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {order.status}
          </span>
          <button
            onClick={() => handleStatusToggle(order.id, order.status)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              order.status === "Paid"
                ? "bg-green-600"
                : order.status === "Pending"
                ? "bg-yellow-500"
                : "bg-red-400"
            }`}
            title={`Toggle status (Current: ${order.status})`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                order.status === "Paid"
                  ? "translate-x-6"
                  : order.status === "Pending"
                  ? "translate-x-3"
                  : "translate-x-1"
              }`}
            />
          </button>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      sortable: false,
      render: (order: any) => (
        <div className="flex space-x-2">
          <button
            className="text-blue-600 hover:text-blue-800"
            onClick={() => router.push(`/seller/orders/view/${order.id}`)}
            title="View"
          >
            <Eye size={16} />
          </button>
          <button
            className="text-blue-600 hover:text-blue-800"
            onClick={() => router.push(`/seller/orders/edit/${order.id}`)}
            title="Edit"
          >
            <Edit size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Orders</h1>

        <div className="flex items-center space-x-2">
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
            <Filter size={20} className="mr-2" />
            Filter
          </button>
          <button
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            onClick={() =>
              exportOrders({
                search: searchTerm,
                status: selectedStatus !== "all" ? selectedStatus : undefined,
              })
            }
          >
            <Download size={20} className="mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold text-gray-800">{totalOrders}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Package size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Paid Orders</p>
              <p className="text-2xl font-bold text-green-600">{paidOrders}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Package size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Pending Orders
              </p>
              <p className="text-2xl font-bold text-yellow-600">
                {pendingOrders}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Package size={24} className="text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        {/* Search and Filter Bar */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-grow max-w-md">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search orders..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search
                className="absolute left-3 top-2.5 text-gray-400"
                size={20}
              />
            </div>

            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          data={filteredOrders}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          isLoading={ordersStatus === "pending"}
          emptyMessage="No orders found"
        />

        {/* Pagination */}
        <Pagination
          totalEntries={totalOrders}
          currentPage={currentPage}
          entriesPerPage={entriesPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={() => {
          if (orderToUpdate) {
            let newStatus: string;
            const currentStatus = filteredOrders.find(
              (o) => o.id === orderToUpdate.id
            )?.status;
            if (currentStatus === "Paid") {
              newStatus = "Pending";
            } else if (currentStatus === "Pending") {
              newStatus = "Cancelled";
            } else {
              newStatus = "Paid";
            }
            updateOrderStatus({ id: orderToUpdate.id, status: newStatus });
          }
          setIsModalOpen(false);
        }}
        title="Update Order Status"
        message={
          orderToUpdate
            ? `Are you sure you want to update the status of order for "${orderToUpdate.customer}"?`
            : undefined
        }
      />
    </div>
  );
}
