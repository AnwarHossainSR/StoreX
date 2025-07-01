import { Mail, MapPin, Phone, Shield, User, UserCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Modal } from "./Modal";

interface Admin {
  id: string;
  name: string;
  email: string;
  role: "superadmin" | "moderator";
  phone: string | null;
  country: string | null;
  avatar: string | null;
  status: "active" | "inactive" | "suspended";
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AdminFormData {
  name: string;
  email: string;
  role: "superadmin" | "moderator";
  phone: string;
  country: string;
  status: "active" | "inactive" | "suspended";
}

interface AdminFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AdminFormData) => void;
  admin?: Admin | null;
  loading?: boolean;
}

const countries = [
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  "Germany",
  "France",
  "Japan",
  "Brazil",
  "India",
  "China",
  "Other",
];

export function AdminFormModal({
  isOpen,
  onClose,
  onSubmit,
  admin,
  loading = false,
}: AdminFormModalProps) {
  const [formData, setFormData] = useState<AdminFormData>({
    name: "",
    email: "",
    role: "moderator",
    phone: "",
    country: "",
    status: "active",
  });

  const [errors, setErrors] = useState<Partial<AdminFormData>>({});

  const isEditing = !!admin;

  // Reset form when modal opens/closes or admin changes
  useEffect(() => {
    if (isOpen && admin) {
      setFormData({
        name: admin.name,
        email: admin.email,
        role: admin.role,
        phone: admin.phone || "",
        country: admin.country || "",
        status: admin.status,
      });
    } else if (isOpen && !admin) {
      setFormData({
        name: "",
        email: "",
        role: "moderator",
        phone: "",
        country: "",
        status: "active",
      });
    }
    setErrors({});
  }, [isOpen, admin]);

  const validateForm = (): boolean => {
    const newErrors: Partial<AdminFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (
      formData.phone &&
      !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ""))
    ) {
      newErrors.phone = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit(formData);
  };

  const handleInputChange = (field: keyof AdminFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Admin: ${admin?.name}` : "Add New Admin"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name Field */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <User size={16} className="mr-2 text-gray-400" />
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter full name"
              disabled={loading}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <Mail size={16} className="mr-2 text-gray-400" />
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter email address"
              disabled={loading}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Phone Field */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <Phone size={16} className="mr-2 text-gray-400" />
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.phone ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="e.g., +1234567890"
              disabled={loading}
            />
            {errors.phone && (
              <p className="text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          {/* Country Field */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <MapPin size={16} className="mr-2 text-gray-400" />
              Country
            </label>
            <select
              value={formData.country}
              onChange={(e) => handleInputChange("country", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              disabled={loading}
            >
              <option value="">Select Country</option>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          {/* Role Field */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <Shield size={16} className="mr-2 text-gray-400" />
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) =>
                handleInputChange(
                  "role",
                  e.target.value as "superadmin" | "moderator"
                )
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              disabled={loading}
            >
              <option value="moderator">Moderator</option>
              <option value="superadmin">Super Admin</option>
            </select>
            <p className="text-xs text-gray-500">
              {formData.role === "superadmin"
                ? "Full access to all system features and settings"
                : "Limited access for content moderation"}
            </p>
          </div>

          {/* Status Field */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <UserCheck size={16} className="mr-2 text-gray-400" />
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                handleInputChange(
                  "status",
                  e.target.value as "active" | "inactive" | "suspended"
                )
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              disabled={loading}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* Role Description */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Role Permissions
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <div className="flex items-center mb-2">
                <Shield size={14} className="mr-2 text-purple-600" />
                <span className="font-medium">Super Admin</span>
              </div>
              <ul className="space-y-1 text-xs">
                <li>• Full system access</li>
                <li>• User management</li>
                <li>• System configuration</li>
                <li>• Reports and analytics</li>
              </ul>
            </div>
            <div>
              <div className="flex items-center mb-2">
                <UserCheck size={14} className="mr-2 text-blue-600" />
                <span className="font-medium">Moderator</span>
              </div>
              <ul className="space-y-1 text-xs">
                <li>• Content moderation</li>
                <li>• User support</li>
                <li>• Basic reporting</li>
                <li>• Limited settings</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            disabled={loading}
          >
            {loading && (
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
            {isEditing ? "Update Admin" : "Create Admin"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
