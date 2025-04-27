"use client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAlert } from "@/hooks/useAlert";
import { InputField } from "@/packages/components/InputField";
import { SelectField } from "@/packages/components/SelectField";
import { Plus, Search, Trash2 } from "lucide-react";
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
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([]);
  const [publicName, setPublicName] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">(
    "percentage"
  );
  const [discountValue, setDiscountValue] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [errors, setErrors] = useState<{
    publicName?: string;
    discountValue?: string;
    discountCode?: string;
    discountType?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  const { alert, setSuccess, setError, clearAlert } = useAlert();

  const fetchDiscountCodes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/discount-codes");
      const data = await response.json();
      setDiscountCodes(data);
    } catch (error: any) {
      setError("Failed to fetch discount codes", {
        isBackendError: true,
        details: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createDiscountCode = async () => {
    try {
      const response = await fetch("/api/discount-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          public_name: publicName,
          discountType,
          discountValue: Number(discountValue),
          discountCode,
          sellerId: "SELLER_ID",
        }),
      });
      if (!response.ok) throw new Error("Failed to create discount code");
      return await response.json();
    } catch (error) {
      throw error;
    }
  };

  const deleteDiscountCode = async (id: string) => {
    try {
      const response = await fetch(`/api/discount-codes/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete discount code");
      return true;
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    fetchDiscountCodes();
  }, []);

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
      setIsLoading(true);
      try {
        const newCode = await createDiscountCode();
        setDiscountCodes([...discountCodes, newCode]);
        setSuccess("Discount code created successfully!", {
          autoDismiss: 3000,
        });
        setPublicName("");
        setDiscountType("percentage");
        setDiscountValue("");
        setDiscountCode("");
      } catch (error: any) {
        setError("Failed to create discount code", {
          isBackendError: true,
          details: error.message,
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDelete = async (id: string) => {
    setIsLoading(true);
    try {
      await deleteDiscountCode(id);
      setDiscountCodes(discountCodes.filter((code) => code.id !== id));
      setSuccess("Discount code deleted successfully!", { autoDismiss: 3000 });
    } catch (error: any) {
      setError("Failed to delete discount code", {
        isBackendError: true,
        details: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCodes = discountCodes.filter(
    (code) =>
      code.public_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.discountCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-6 border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-gray-900">
              Manage Discount Codes
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Create and manage discount codes for your products
            </p>
          </div>

          {alert && (
            <div className="px-6 py-4">
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

          <div className="p-6 space-y-8">
            {/* Create Discount Code Form */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Create New Discount Code
              </h2>
              <form
                onSubmit={handleCreate}
                className="grid grid-cols-1 md:grid-cols-4 gap-4"
              >
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
                <div className="md:col-span-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 flex items-center ${
                      isLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Discount Code
                  </button>
                </div>
              </form>
            </div>

            {/* Discount Codes Table */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">
                  Discount Codes
                </h2>
                <div className="relative w-full max-w-xs">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search discount codes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all duration-200"
                  />
                </div>
              </div>
              {isLoading ? (
                <div className="text-center py-6 text-gray-500">Loading...</div>
              ) : filteredCodes.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  No discount codes found
                </div>
              ) : (
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Public Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Value
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Code
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredCodes.map((code) => (
                        <tr
                          key={code.id}
                          className="hover:bg-gray-50 transition-colors duration-150"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {code.public_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {code.discountType.charAt(0).toUpperCase() +
                              code.discountType.slice(1)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {code.discountType === "percentage"
                              ? `${code.discountValue}%`
                              : `$${code.discountValue}`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {code.discountCode}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(code.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => handleDelete(code.id)}
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
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
