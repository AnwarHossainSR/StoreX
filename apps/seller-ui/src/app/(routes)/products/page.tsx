"use client";

import { useProduct } from "@/hooks/useProduct";
import ConfirmationModal from "@/packages/components/ConfirmationModal";
import { Pagination } from "@/packages/components/Pagination";
import { Table } from "@/packages/components/Table";
import {
  Download,
  Edit,
  Eye,
  Filter,
  Package,
  Plus,
  Search,
  Trash,
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const entriesPerPage = 10;

  const router = useRouter();
  const { getProducts, categories, deleteProduct } = useProduct();
  const { data: productsData, status: productsStatus } = getProducts(
    currentPage,
    entriesPerPage
  );

  console.log("productsData", productsData);

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

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

  const columns = [
    {
      key: "image",
      header: "Image",
      sortable: false,
      render: (product: any) => (
        <img
          src={
            product?.images?.length > 0
              ? product.images[0].url
              : "/images/fallback-product.svg"
          }
          alt={product.title}
          className="h-12 w-12 object-cover rounded-md"
          onError={(e) => {
            console.log("Image not found", e.currentTarget.src);
            e.currentTarget.src = "/images/fallback-product.svg";
          }}
        />
      ),
    },
    {
      key: "title",
      header: "Title",
      sortable: true,
    },
    {
      key: "sale_price",
      header: "Price",
      sortable: true,
      render: (product: any) => `$${product.sale_price.toFixed(2)}`,
    },
    {
      key: "stock",
      header: "Stock",
      sortable: true,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (product: any) => (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${
            product.status === "Active"
              ? "bg-green-100 text-green-800"
              : product.status === "Pending"
              ? "bg-yellow-100 text-yellow-800"
              : product.status === "Deleted"
              ? "bg-destructive text-white"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {product.status}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      sortable: false,
      render: (product: any) => (
        <div className="flex space-x-2">
          <button
            className="text-blue-600 hover:text-blue-800"
            onClick={() => router.push(`/seller/products/view/${product.id}`)}
            title="View"
          >
            <Eye size={16} />
          </button>
          <button
            className="text-blue-600 hover:text-blue-800"
            onClick={() => router.push(`/seller/products/edit/${product.id}`)}
            title="Edit"
          >
            <Edit size={16} />
          </button>
          <button
            className="text-red-600 hover:text-red-800"
            onClick={() => {
              setProductToDelete({ id: product.id, title: product.title });
              setIsModalOpen(true);
            }}
            title="Delete"
          >
            <Trash size={16} />
          </button>
        </div>
      ),
    },
  ];

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

        {/* Table */}
        <Table
          columns={columns}
          data={filteredProducts}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          isLoading={productsStatus === "pending"}
          emptyMessage="No products found"
        />

        {/* Pagination */}
        <Pagination
          totalEntries={totalProducts}
          currentPage={currentPage}
          entriesPerPage={entriesPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={() => productToDelete && deleteProduct(productToDelete.id)}
        title="Delete Product"
        message={
          productToDelete
            ? `Are you sure you want to delete "${productToDelete.title}"?`
            : undefined
        }
      />
    </div>
  );
}
