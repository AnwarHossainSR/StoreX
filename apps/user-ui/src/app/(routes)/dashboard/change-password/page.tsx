"use client";
import { useAuth } from "@/hooks/useAuth";
import { Eye, Lock } from "lucide-react";

export default function ChangePasswordPage() {
  const { changePassword, isChangingPassword } = useAuth();
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Password change submitted", event);
    changePassword({
      oldPassword: (event.target as any).elements["current-password"].value,
      newPassword: (event.target as any).elements["new-password"].value,
      confirmPassword: (event.target as any).elements["confirm-password"].value,
    });
  };
  return (
    <>
      {/* Change Password Form */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 p-2 rounded-full">
              <Lock size={24} className="text-blue-500" />
            </div>
            <h2 className="text-xl font-semibold">Update Your Password</h2>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="current-password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Current Password
              </label>
              <div className="relative">
                <input
                  id="current-password"
                  type="password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your current password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <Eye size={20} />
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="new-password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  type="password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your new password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <Eye size={20} />
                </button>
              </div>
              <div className="mt-2">
                <p className="text-xs text-gray-500">
                  Password must be at least 8 characters long with a mix of
                  letters, numbers and symbols.
                </p>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type="password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirm your new password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <Eye size={20} />
                </button>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full px-6 py-3 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 transition-colors"
                disabled={isChangingPassword}
              >
                {isChangingPassword ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
