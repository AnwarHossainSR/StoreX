"use client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAlert } from "@/hooks/useAlert";
import { useProduct } from "@/hooks/useProduct";
import { ConfirmDeleteModal } from "@/packages/components/ConfirmDeleteModal";
import { InputField } from "@/packages/components/InputField";
import { SelectField } from "@/packages/components/SelectField";
import { useQueryClient } from "@tanstack/react-query"; // Import React Query's queryClient
import {
  ChevronDown,
  ChevronUp,
  Percent,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import React, { useEffect, useState } from "react";

interface DiscountCode {
  id: string;
  public_name: string;
  discountType: string;
  discountValue: number;
  discountCode: string;
  createdAt: string;
}

export default function DiscountCodesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof DiscountCode>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedType, setSelectedType] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [publicName, setPublicName] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">(
    "percentage"
  );
  const [discountValue, setDiscountValue] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [errors, setErrors] = useState<{
    publicName?: string;
    discountValue?: string;
    discountCode?: string;
    discountType?: string;
  }>({});

  const queryClient = useQueryClient();
  const {
    discountCodes,
    discountCodesStatus,
    discountCodesError,
    discountCodesErrorDetails,
    createDiscountCode,
    createDiscountCodeStatus,
    createDiscountCodeError,
    createDiscountCodeErrorDetails,
    deleteDiscountCode,
    deleteDiscountCodeStatus,
    deleteDiscountCodeError,
    deleteDiscountCodeErrorDetails,
  } = useProduct();
  const { alert, setSuccess, setError, clearAlert } = useAlert();

  const handleSort = (field: keyof DiscountCode) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};
    let isValid = true;

    if (!publicName) {
      newErrors.publicName = "Public name is required";
      isValid = false;
    }
    if (!discountType) {
      newErrors.discountType = "Discount type is required";
      isValid = false;
    }
    if (!discountValue) {
      newErrors.discountValue = "Discount value is required";
      isValid = false;
    } else if (isNaN(Number(discountValue)) || Number(discountValue) <= 0) {
      newErrors.discountValue = "Discount value must be a positive number";
      isValid = false;
    } else if (discountType === "percentage" && Number(discountValue) > 100) {
      newErrors.discountValue = "Percentage discount cannot exceed 100";
      isValid = false;
    }
    if (!discountCode) {
      newErrors.discountCode = "Discount code is required";
      isValid = false;
    } else if (!/^[A-Z0-9-]{4,20}$/.test(discountCode)) {
      newErrors.discountCode =
        "Code must be 4-20 characters, uppercase letters, numbers, or hyphens";
      isValid = false;
    }

    setErrors(newErrors);
    if (!isValid) {
      setError("Please correct the form errors", { details: newErrors });
    } else {
      clearAlert();
    }
    return isValid;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      createDiscountCode({
        public_name: publicName,
        discountType,
        discountValue: Number(discountValue),
        discountCode,
      });
    }
  };

  const handleInitiateDelete = (id: string, name: string) => {
    setDeleteItem({ id, name });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deleteItem) {
      deleteDiscountCode(deleteItem.id);
      setIsDeleteModalOpen(false);
      setDeleteItem(null);
    }
  };

  useEffect(() => {
    if (createDiscountCodeStatus === "success") {
      setSuccess("Discount code created successfully!", { autoDismiss: 3000 });
      setPublicName("");
      setDiscountType("percentage");
      setDiscountValue("");
      setDiscountCode("");
      setIsCreateModalOpen(false);
      // Invalidate discount codes query to refetch after creation
      queryClient.invalidateQueries({ queryKey: ["discountCodes"] });
    } else if (createDiscountCodeError) {
      setError(createDiscountCodeError, {
        isBackendError: true,
        details: createDiscountCodeErrorDetails,
      });
    }
  }, [
    createDiscountCodeStatus,
    createDiscountCodeError,
    createDiscountCodeErrorDetails,
    setSuccess,
    setError,
    queryClient,
  ]);

  useEffect(() => {
    if (deleteDiscountCodeStatus === "success") {
      setSuccess("Discount code deleted successfully!", { autoDismiss: 3000 });
      // Invalidate discount codes query to refetch after deletion
      queryClient.invalidateQueries({ queryKey: ["discountCodes"] });
    } else if (deleteDiscountCodeError) {
      setError(deleteDiscountCodeError, {
        isBackendError: true,
        details: deleteDiscountCodeErrorDetails,
      });
    }
  }, [
    deleteDiscountCodeStatus,
    deleteDiscountCodeError,
    deleteDiscountCodeErrorDetails,
    setSuccess,
    setError,
    queryClient,
  ]);

  useEffect(() => {
    if (discountCodesError) {
      setError(discountCodesError, {
        isBackendError: true,
        details: discountCodesErrorDetails,
      });
    }
  }, [discountCodesError, discountCodesErrorDetails, setError]);

  const filteredCodes = discountCodes
    .filter(
      (code) =>
        (selectedType === "all" || code.discountType === selectedType) &&
        (code.public_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          code.discountCode.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortDirection === "asc"
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

  const totalCodes = filteredCodes.length;
  const percentageCodes = filteredCodes.filter(
    (code: any) => code.discountType === "percentage"
  ).length;
  const fixedCodes = filteredCodes.filter(
    (code: any) => code.discountType === "fixed"
  ).length;

  const isLoading =
    discountCodesStatus === "pending" ||
    createDiscountCodeStatus === "pending" ||
    deleteDiscountCodeStatus === "pending";

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Discount Codes</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <Plus size={20} className="mr-2" />
          Create Discount Code
        </button>
      </div>

      {alert && (
        <div className="mb-6">
          <Alert
            variant={alert.variant}
            className="rounded-lg"
            autoDismiss={alert.autoDismiss}
            onDismiss={clearAlert}
            details={alert.details}
          >
            <AlertTitle>{alert.title}</AlertTitle>
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Discount Codes
              </p>
              <p className="text-2xl font-bold text-gray-800">{totalCodes}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Percent size={24} className="text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Percentage Discounts
              </p>
              <p className="text-2xl font-bold text-green-600">
                {percentageCodes}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Percent size={24} className="text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Fixed Discounts
              </p>
              <p className="text-2xl font-bold text-yellow-600">{fixedCodes}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Percent size={24} className="text-yellow-600" />
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
                placeholder="Search discount codes..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search
                className="absolute left-3 top-2.5 text-gray-400"
                size={20}
              />
            </div>
            <div className="flex space-x-2">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Discount Codes Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("public_name")}
                >
                  <div className="flex items-center">
                    Public Name
                    <span className="ml-2">
                      {sortField === "public_name" &&
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
                  onClick={() => handleSort("discountType")}
                >
                  <div className="flex items-center">
                    Type
                    <span className="ml-2">
                      {sortField === "discountType" &&
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
                  onClick={() => handleSort("discountValue")}
                >
                  <div className="flex items-center">
                    Value
                    <span className="ml-2">
                      {sortField === "discountValue" &&
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
                  onClick={() => handleSort("discountCode")}
                >
                  <div className="flex items-center">
                    Code
                    <span className="ml-2">
                      {sortField === "discountCode" &&
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
                    Created
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
              {filteredCodes.map((code: any) => (
                <tr key={code.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    {code.public_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        code.discountType === "percentage"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {code.discountType.charAt(0).toUpperCase() +
                        code.discountType.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {code.discountType === "percentage"
                      ? `${code.discountValue}%`
                      : `$${code.discountValue}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {code.discountCode}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(code.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() =>
                        handleInitiateDelete(code.id, code.public_name)
                      }
                      className="text-red-600 hover:text-red-800 transition-colors duration-200"
                      disabled={isLoading}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Placeholder */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing 1 to {filteredCodes.length} of {filteredCodes.length}{" "}
              entries
            </div>
            <div className="flex items-center space-x-2">
              <button
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                disabled
              >
                Previous
              </button>
              <button
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                disabled
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Create Discount Code Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                Create New Discount Code
              </h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <InputField
                label="Public Name"
                required
                placeholder="e.g., Summer Sale"
                value={publicName}
                onChange={setPublicName}
                error={errors.publicName}
                helpText="Name visible to customers"
                className="transition-all duration-200 focus:ring-2 focus:ring-indigo-500"
              />
              <SelectField
                label="Discount Type"
                required
                value={discountType}
                onChange={setDiscountType}
                error={errors.discountType}
                helpText="Choose discount calculation method"
                className="transition-all duration-200"
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </SelectField>
              <InputField
                label="Discount Value"
                required
                type="number"
                placeholder={
                  discountType === "percentage" ? "e.g., 20" : "e.g., 10"
                }
                value={discountValue}
                onChange={setDiscountValue}
                error={errors.discountValue}
                helpText={
                  discountType === "percentage"
                    ? "Percentage (0-100)"
                    : "Fixed amount in USD"
                }
                className="transition-all duration-200 focus:ring-2 focus:ring-indigo-500"
              />
              <InputField
                label="Discount Code"
                required
                placeholder="e.g., SUMMER2025"
                value={discountCode}
                onChange={setDiscountCode}
                error={errors.discountCode}
                helpText="Unique code, e.g., SUMMER2025"
                className="transition-all duration-200 focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 flex items-center ${
                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={deleteItem?.name || ""}
        itemType="Discount Code"
        isLoading={isLoading}
      />
    </div>
  );
}
