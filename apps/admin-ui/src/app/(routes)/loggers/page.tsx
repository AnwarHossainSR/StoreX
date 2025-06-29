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

// Expanded mock logs data
const logs = [
  {
    id: 1,
    level: "Error",
    message: "Database connection timeout",
    timestamp: "2024-06-29T08:15:00Z",
    source: "DatabaseService",
  },
  {
    id: 2,
    level: "Info",
    message: "User authentication successful",
    timestamp: "2024-06-29T09:20:00Z",
    source: "AuthService",
  },
  {
    id: 3,
    level: "Warning",
    message: "High memory usage detected",
    timestamp: "2024-06-29T10:45:00Z",
    source: "ServerMonitor",
  },
  {
    id: 4,
    level: "Debug",
    message: "Cache cleared successfully",
    timestamp: "2024-06-29T11:10:00Z",
    source: "CacheService",
  },
  {
    id: 5,
    level: "Error",
    message: "API rate limit exceeded",
    timestamp: "2024-06-29T12:30:00Z",
    source: "APIService",
  },
  {
    id: 6,
    level: "Info",
    message: "Scheduled job completed",
    timestamp: "2024-06-29T13:00:00Z",
    source: "CronJob",
  },
  {
    id: 7,
    level: "Warning",
    message: "Disk space running low",
    timestamp: "2024-06-29T14:20:00Z",
    source: "StorageMonitor",
  },
  {
    id: 8,
    level: "Error",
    message: "Payment gateway failure",
    timestamp: "2024-06-29T15:40:00Z",
    source: "PaymentService",
  },
  {
    id: 9,
    level: "Info",
    message: "User session expired",
    timestamp: "2024-06-29T16:55:00Z",
    source: "SessionManager",
  },
  {
    id: 10,
    level: "Debug",
    message: "Configuration updated",
    timestamp: "2024-06-29T17:25:00Z",
    source: "ConfigService",
  },
];

export default function LoggersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("timestamp");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedLevel, setSelectedLevel] = useState("all");

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredLogs = logs
    .filter(
      (log) =>
        (selectedLevel === "all" || log.level === selectedLevel) &&
        log.message.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h1 className="text-2xl font-bold text-gray-800">Loggers</h1>

        <div className="flex items-center space-x-2">
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
            <Filter size={20} className="mr-2" />
            Filter
          </button>
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
            <Download size={20} className="mr-2" />
            Export Logs
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
                placeholder="Search logs..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search
                className="absolute left-3 top-2.5 text-gray-400"
                size={20}
              />
            </div>

            <div className="flex space-x-2">
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Levels</option>
                <option value="Error">Error</option>
                <option value="Info">Info</option>
                <option value="Warning">Warning</option>
                <option value="Debug">Debug</option>
              </select>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("level")}
                >
                  <div className="flex items-center">
                    Level
                    <span className="ml-2">
                      {sortField === "level" &&
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
                  onClick={() => handleSort("message")}
                >
                  <div className="flex items-center">
                    Message
                    <span className="ml-2">
                      {sortField === "message" &&
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
                  onClick={() => handleSort("source")}
                >
                  <div className="flex items-center">
                    Source
                    <span className="ml-2">
                      {sortField === "source" &&
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
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        log.level === "Error"
                          ? "bg-red-100 text-red-800"
                          : log.level === "Info"
                          ? "bg-blue-100 text-blue-800"
                          : log.level === "Warning"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {log.level}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.message}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.source}
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
              Showing 1 to {filteredLogs.length} of {filteredLogs.length}{" "}
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
