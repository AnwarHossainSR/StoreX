"use client";

import { Pagination } from "@/packages/components/Pagination";
import { Table } from "@/packages/components/Table";
import { CreditCard, Download, Filter, Search } from "lucide-react";
import { useState } from "react";

// Mock payments data (15 entries to trigger pagination)
const payments = [
  {
    id: "PAY-001",
    orderId: "ORD-001",
    customer: "John Doe",
    amount: 250,
    method: "Credit Card",
    status: "Completed",
    date: "2024-03-15",
    cardLast4: "4242",
  },
  {
    id: "PAY-002",
    orderId: "ORD-002",
    customer: "Jane Smith",
    amount: 180,
    method: "PayPal",
    status: "Pending",
    date: "2024-03-14",
    cardLast4: null,
  },
  {
    id: "PAY-003",
    orderId: "ORD-003",
    customer: "Alice Johnson",
    amount: 320,
    method: "Bank Transfer",
    status: "Completed",
    date: "2024-03-13",
    cardLast4: null,
  },
  {
    id: "PAY-004",
    orderId: "ORD-004",
    customer: "Bob Brown",
    amount: 95,
    method: "Credit Card",
    status: "Failed",
    date: "2024-03-12",
    cardLast4: "5555",
  },
  {
    id: "PAY-005",
    orderId: "ORD-005",
    customer: "Emma Wilson",
    amount: 450,
    method: "PayPal",
    status: "Pending",
    date: "2024-03-11",
    cardLast4: null,
  },
  {
    id: "PAY-006",
    orderId: "ORD-006",
    customer: "Michael Lee",
    amount: 200,
    method: "Credit Card",
    status: "Completed",
    date: "2024-03-10",
    cardLast4: "1234",
  },
  {
    id: "PAY-007",
    orderId: "ORD-007",
    customer: "Sarah Davis",
    amount: 175,
    method: "Bank Transfer",
    status: "Completed",
    date: "2024-03-09",
    cardLast4: null,
  },
  {
    id: "PAY-008",
    orderId: "ORD-008",
    customer: "David Clark",
    amount: 300,
    method: "PayPal",
    status: "Pending",
    date: "2024-03-08",
    cardLast4: null,
  },
  {
    id: "PAY-009",
    orderId: "ORD-009",
    customer: "Laura Martinez",
    amount: 260,
    method: "Credit Card",
    status: "Completed",
    date: "2024-03-07",
    cardLast4: "6789",
  },
  {
    id: "PAY-010",
    orderId: "ORD-010",
    customer: "James White",
    amount: 120,
    method: "Bank Transfer",
    status: "Failed",
    date: "2024-03-06",
    cardLast4: null,
  },
  {
    id: "PAY-011",
    orderId: "ORD-011",
    customer: "Olivia Taylor",
    amount: 380,
    method: "Credit Card",
    status: "Completed",
    date: "2024-03-05",
    cardLast4: "9876",
  },
  {
    id: "PAY-012",
    orderId: "ORD-012",
    customer: "William Harris",
    amount: 150,
    method: "PayPal",
    status: "Pending",
    date: "2024-03-04",
    cardLast4: null,
  },
  {
    id: "PAY-013",
    orderId: "ORD-013",
    customer: "Sophia Lewis",
    amount: 270,
    method: "Credit Card",
    status: "Completed",
    date: "2024-03-03",
    cardLast4: "4321",
  },
  {
    id: "PAY-014",
    orderId: "ORD-014",
    customer: "Thomas Walker",
    amount: 210,
    method: "Bank Transfer",
    status: "Completed",
    date: "2024-03-02",
    cardLast4: null,
  },
  {
    id: "PAY-015",
    orderId: "ORD-015",
    customer: "Mia Young",
    amount: 290,
    method: "PayPal",
    status: "Pending",
    date: "2024-03-01",
    cardLast4: null,
  },
];

export default function PaymentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedMethod, setSelectedMethod] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;

  // Reset to page 1 when filters change
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

  // Get status badge styling based on payment status
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

  // Get payment method icon based on method type
  const getPaymentMethodIcon = (method: string) => {
    return <CreditCard size={16} className="mr-2 text-muted-foreground" />;
  };

  const filteredPayments = payments
    .filter(
      (payment) =>
        (selectedStatus === "all" || payment.status === selectedStatus) &&
        (selectedMethod === "all" || payment.method === selectedMethod) &&
        (payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.orderId.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      const aValue = a[sortField as keyof typeof a];
      const bValue = b[sortField as keyof typeof b];

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortDirection === "asc"
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  const totalAmount = filteredPayments.reduce(
    (sum, payment) => sum + payment.amount,
    0
  );
  const completedAmount = filteredPayments
    .filter((payment) => payment.status === "Completed")
    .reduce((sum, payment) => sum + payment.amount, 0);
  const pendingAmount = filteredPayments
    .filter((payment) => payment.status === "Pending")
    .reduce((sum, payment) => sum + payment.amount, 0);

  const columns = [
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
      render: (payment: any) => `$${payment.amount.toFixed(2)}`,
    },
    {
      key: "method",
      header: "Method",
      sortable: true,
      render: (payment: any) => (
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
      render: (payment: any) => (
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
      render: (payment: any) => new Date(payment.date).toLocaleDateString(),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">Payments</h2>

        <div className="flex items-center space-x-2">
          <button className="flex items-center px-4 py-2 border border-border rounded-md hover:bg-secondary/80">
            <Filter size={20} className="mr-2 text-muted-foreground" />
            Filter
          </button>
          <button className="flex items-center px-4 py-2 border border-border rounded-md hover:bg-secondary/80">
            <Download size={20} className="mr-2 text-muted-foreground" />
            Export
          </button>
        </div>
      </div>

      {/* Summary Cards */}
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
        {/* Search and Filter Bar */}
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

        {/* Table */}
        <Table
          columns={columns}
          data={paginatedPayments}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          emptyMessage="No payments found"
        />

        {/* Pagination */}
        {filteredPayments.length > 0 && (
          <Pagination
            totalEntries={filteredPayments.length}
            currentPage={currentPage}
            entriesPerPage={entriesPerPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
}
