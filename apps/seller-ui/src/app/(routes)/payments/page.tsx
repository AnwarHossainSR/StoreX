"use client";

import { Pagination } from "@/packages/components/Pagination";
import { Table } from "@/packages/components/Table";
import { paymentDistributionService } from "@/services/paymentDistributionService";
import { CreditCard, Download, Search } from "lucide-react";
import { useEffect, useState } from "react";

interface PaymentDistribution {
  id: string;
  orderId: string;
  customer: string;
  amount: number;
  method: string;
  status: string;
  date: string;
  cardLast4: string | null;
}

export default function PaymentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedMethod, setSelectedMethod] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [payments, setPayments] = useState<PaymentDistribution[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const entriesPerPage = 10;

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await paymentDistributionService.getPayments(
          currentPage,
          entriesPerPage,
          searchTerm,
          selectedStatus === "all" ? undefined : selectedStatus,
          selectedMethod === "all" ? undefined : selectedMethod,
          sortField,
          sortDirection
        );
        setPayments(response.data);
        setTotal(response.total);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [
    currentPage,
    searchTerm,
    selectedStatus,
    selectedMethod,
    sortField,
    sortDirection,
  ]);

  const handleFilterChange = (newStatus: string) => {
    setSelectedStatus(newStatus);
    setCurrentPage(1);
  };

  const handleMethodChange = (newMethod: string) => {
    setSelectedMethod(newMethod);
    setCurrentPage(1);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getStatusBadgeClasses = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    return <CreditCard size={16} className="mr-2 text-muted-foreground" />;
  };

  const totalAmount = payments.reduce(
    (sum, payment) => sum + payment.amount,
    0
  );
  const completedAmount = payments
    .filter((payment) => payment.status === "Completed")
    .reduce((sum, payment) => sum + payment.amount, 0);
  const pendingAmount = payments
    .filter((payment) => payment.status === "Pending")
    .reduce((sum, payment) => sum + payment.amount, 0);

  const columns = [
    {
      key: "id",
      header: "Payment ID",
      sortable: true,
    },
    {
      key: "orderId",
      header: "Order ID",
      sortable: true,
    },
    {
      key: "customer",
      header: "Customer",
      sortable: true,
    },
    {
      key: "amount",
      header: "Amount",
      sortable: true,
      render: (payment: PaymentDistribution) => `$${payment.amount.toFixed(2)}`,
    },
    {
      key: "method",
      header: "Method",
      sortable: true,
      render: (payment: PaymentDistribution) => (
        <div className="flex items-center">
          {getPaymentMethodIcon(payment.method)}
          {payment.method}
          {payment.cardLast4 && (
            <span className="ml-1 text-muted-foreground">
              (**** {payment.cardLast4})
            </span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (payment: PaymentDistribution) => (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClasses(
            payment.status
          )}`}
        >
          {payment.status}
        </span>
      ),
    },
    {
      key: "date",
      header: "Date",
      sortable: true,
      render: (payment: PaymentDistribution) =>
        new Date(payment.date).toLocaleDateString(),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">Payments</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() =>
              paymentDistributionService.exportPayments(
                searchTerm,
                selectedStatus === "all" ? undefined : selectedStatus,
                selectedMethod === "all" ? undefined : selectedMethod
              )
            }
            className="flex items-center px-4 py-2 border border-border rounded-md hover:bg-secondary/80"
          >
            <Download size={20} className="mr-2 text-muted-foreground" />
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-card rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Payments
              </p>
              <p className="text-2xl font-bold text-foreground">
                ${totalAmount.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-primary/10 rounded-full">
              <CreditCard size={24} className="text-primary" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Completed Payments
              </p>
              <p className="text-2xl font-bold text-green-600">
                ${completedAmount.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CreditCard size={24} className="text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Pending Payments
              </p>
              <p className="text-2xl font-bold text-yellow-600">
                ${pendingAmount.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <CreditCard size={24} className="text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow-sm">
        <div className="p-4 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-grow max-w-md">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search payments..."
                className="w-full pl-10 pr-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Search
                className="absolute left-3 top-2.5 text-muted-foreground"
                size={20}
              />
            </div>
            <div className="flex space-x-2">
              <select
                value={selectedMethod}
                onChange={(e) => handleMethodChange(e.target.value)}
                className="px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">All Methods</option>
                <option value="Credit Card">Credit Card</option>
                <option value="PayPal">PayPal</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">All Status</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
              </select>
            </div>
          </div>
        </div>

        {loading && <p className="p-4 text-center">Loading...</p>}
        {error && <p className="p-4 text-center text-red-600">{error}</p>}
        {!loading && !error && (
          <Table
            columns={columns}
            data={payments}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
            emptyMessage="No payments found"
          />
        )}

        {total > 0 && (
          <Pagination
            totalEntries={total}
            currentPage={currentPage}
            entriesPerPage={entriesPerPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
}
