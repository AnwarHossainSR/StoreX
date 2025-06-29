"use client";

import {
  ChevronDown,
  ChevronUp,
  Download,
  Eye,
  Filter,
  Search,
  Trash2,
} from "lucide-react";
import { useState } from "react";

// Expanded mock events data
const events = [
  {
    id: 1,
    event: "User Login",
    user: "John Doe",
    timestamp: "2024-06-29T08:15:00Z",
    ipAddress: "192.168.1.1",
    status: "Success",
    details: "User logged in successfully",
  },
  {
    id: 2,
    event: "Order Placed",
    user: "Jane Smith",
    timestamp: "2024-06-29T09:20:00Z",
    ipAddress: "192.168.1.2",
    status: "Success",
    details: "Order #12345 placed",
  },
  {
    id: 3,
    event: "Payment Processed",
    user: "Alice Johnson",
    timestamp: "2024-06-29T10:45:00Z",
    ipAddress: "192.168.1.3",
    status: "Success",
    details: "Payment of $150.00 processed",
  },
  {
    id: 4,
    event: "User Logout",
    user: "Bob Brown",
    timestamp: "2024-06-29T11:10:00Z",
    ipAddress: "192.168.1.4",
    status: "Success",
    details: "User logged out",
  },
  {
    id: 5,
    event: "Account Updated",
    user: "Emma Davis",
    timestamp: "2024-06-29T12:30:00Z",
    ipAddress: "192.168.1.5",
    status: "Success",
    details: "User updated profile information",
  },
  {
    id: 6,
    event: "User Login",
    user: "Michael Wilson",
    timestamp: "2024-06-29T13:00:00Z",
    ipAddress: "192.168.1.6",
    status: "Failed",
    details: "Invalid credentials",
  },
  {
    id: 7,
    event: "Order Cancelled",
    user: "Sarah Miller",
    timestamp: "2024-06-29T14:20:00Z",
    ipAddress: "192.168.1.7",
    status: "Success",
    details: "Order #12346 cancelled",
  },
  {
    id: 8,
    event: "Payment Processed",
    user: "David Lee",
    timestamp: "2024-06-29T15:40:00Z",
    ipAddress: "192.168.1.8",
    status: "Failed",
    details: "Payment declined due to insufficient funds",
  },
  {
    id: 9,
    event: "User Registered",
    user: "Laura Adams",
    timestamp: "2024-06-29T16:55:00Z",
    ipAddress: "192.168.1.9",
    status: "Success",
    details: "New user registered",
  },
  {
    id: 10,
    event: "Password Reset",
    user: "Chris Taylor",
    timestamp: "2024-06-29T17:25:00Z",
    ipAddress: "192.168.1.10",
    status: "Success",
    details: "Password reset link sent",
  },
];

export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("timestamp");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedEvent, setSelectedEvent] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredEvents = events
    .filter(
      (event) =>
        (selectedEvent === "all" || event.event === selectedEvent) &&
        (selectedStatus === "all" || event.status === selectedStatus) &&
        (event.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.details.toLowerCase().includes(searchTerm.toLowerCase()))
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Events</h1>

        <div className="flex items-center space-x-2">
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
            <Filter size={20} className="mr-2" />
            Filter
          </button>
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
            <Download size={20} className="mr-2" />
            Export Events
          </button>
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
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search events..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search
                className="absolute left-3 top-2.5 text-gray-400"
                size={20}
              />
            </div>

            <div className="flex space-x-2">
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Events</option>
                <option value="User Login">User Login</option>
                <option value="Order Placed">Order Placed</option>
                <option value="Payment Processed">Payment Processed</option>
                <option value="User Logout">User Logout</option>
                <option value="Account Updated">Account Updated</option>
                <option value="Order Cancelled">Order Cancelled</option>
                <option value="User Registered">User Registered</option>
                <option value="Password Reset">Password Reset</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="Success">Success</option>
                <option value="Failed">Failed</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Events Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("event")}
                >
                  <div className="flex items-center">
                    Event
                    <span className="ml-2">
                      {sortField === "event" &&
                        (sortDirection === "asc" ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        ))}
                    </span>
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("user")}
                >
                  <div className="flex items-center">
                    User
                    <span className="ml-2">
                      {sortField === "user" &&
                        (sortDirection === "asc" ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        ))}
                    </span>
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("timestamp")}
                >
                  <div className="flex items-center">
                    Timestamp
                    <span className="ml-2">
                      {sortField === "timestamp" &&
                        (sortDirection === "asc" ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        ))}
                    </span>
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("ipAddress")}
                >
                  <div className="flex items-center">
                    IP Address
                    <span className="ml-2">
                      {sortField === "ipAddress" &&
                        (sortDirection === "asc" ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        ))}
                    </span>
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center">
                    Status
                    <span className="ml-2">
                      {sortField === "status" &&
                        (sortDirection === "asc" ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        ))}
                    </span>
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Details
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEvents.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        event.event === "User Login"
                          ? "bg-blue-100 text-blue-800"
                          : event.event === "Order Placed"
                          ? "bg-green-100 text-green-800"
                          : event.event === "Payment Processed"
                          ? "bg-purple-100 text-purple-800"
                          : event.event === "User Logout"
                          ? "bg-gray-100 text-gray-800"
                          : event.event === "Account Updated"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {event.event}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {event.user}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(event.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {event.ipAddress}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        event.status === "Success"
                          ? "bg-green-100 text-green-800"
                          : event.status === "Failed"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {event.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {event.details}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">
                      <Eye size={18} />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing 1 to {filteredEvents.length} of {filteredEvents.length}{" "}
              entries
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                Previous
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
