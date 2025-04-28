"use client";

import { useProduct } from "@/hooks/useProduct";
import { Pagination } from "@/packages/components/Pagination";
import {
  ChevronDown,
  ChevronUp,
  Download,
  Edit,
  Filter,
  Package,
  Plus,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;

  const router = useRouter();
  const { getProducts, categories } = useProduct();
  const { data: productsData, status: productsStatus } = getProducts(
    currentPage,
    entriesPerPage
  );

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };
  console.log("productsData", productsData);

  const filteredProducts = (productsData?.data || [])
    .filter(
      (product) =>
        (selectedStatus === "all" || product.status === selectedStatus) &&
        (selectedCategory === "all" || product.category === selectedCategory) &&
        (product.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.slug.toLowerCase().includes(searchTerm.toLowerCase()))
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

  const totalProducts = productsData?.total || filteredProducts.length;
  const activeProducts = filteredProducts.filter(
    (product) => product.status === "Active"
  ).length;
  const outOfStockProducts = filteredProducts.filter(
    (product) => product.stock === 0
  ).length;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Products</h1>

        <div className="flex items-center space-x-2">
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
            <Filter size={20} className="mr-2" />
            Filter
          </button>
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
            <Download size={20} className="mr-2" />
            Export
          </button>
          <button
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={() => router.push("/products/create")}
          >
            <Plus size={20} className="mr-2" />
            Add Product
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Products
              </p>
              <p className="text-2xl font-bold text-gray-800">
                {totalProducts}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Package size={24} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Active Products
              </p>
              <p className="text-2xl font-bold text-green-600">
                {activeProducts}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Package size={24} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">
                {outOfStockProducts}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <Package size={24} className="text-red-600" />
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
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search
                className="absolute left-3 top-2.5 text-gray-400"
                size={20}
              />
            </div>

            <div className="flex space-x-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("id")}
                >
                  <div className="flex items-center">
                    #
                    <span className="ml-2">
                      {sortField === "id" &&
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
                  Image
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("title")}
                >
                  <div className="flex items-center">
                    Title
                    <span className="ml-2">
                      {sortField === "title" &&
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
                  onClick={() => handleSort("category")}
                >
                  <div className="flex items-center">
                    Category
                    <span className="ml-2">
                      {sortField === "category" &&
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
                  onClick={() => handleSort("subCategory")}
                >
                  <div className="flex items-center">
                    Subcategory
                    <span className="ml-2">
                      {sortField === "subCategory" &&
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
                  onClick={() => handleSort("sale_price")}
                >
                  <div className="flex items-center">
                    Price
                    <span className="ml-2">
                      {sortField === "sale_price" &&
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
                  onClick={() => handleSort("stock")}
                >
                  <div className="flex items-center">
                    Stock
                    <span className="ml-2">
                      {sortField === "stock" &&
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
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("createdAt")}
                >
                  <div className="flex items-center">
                    Created At
                    <span className="ml-2">
                      {sortField === "createdAt" &&
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
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {productsStatus === "pending" ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Loading products...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No products found
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product, index) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product?.images?.length > 0 ? (
                        <img
                          src={product.images[0].url}
                          alt={product.title}
                          className="h-12 w-12 object-cover rounded-md"
                        />
                      ) : (
                        <div className="h-12 w-12 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.subCategory}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${product.sale_price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.stock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          product.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : product.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <button
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() =>
                          router.push(`/seller/products/edit/${product.id}`)
                        }
                      >
                        <Edit size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          totalEntries={totalProducts}
          currentPage={currentPage}
          entriesPerPage={entriesPerPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
