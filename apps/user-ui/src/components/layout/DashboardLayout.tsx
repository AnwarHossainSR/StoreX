// app/dashboard/layout.tsx (continued)
import {
  Bell,
  CheckCircle,
  Clock,
  Inbox,
  Lock,
  LogOut,
  MapPin,
  ShoppingBag,
  Truck,
  User,
} from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center">
            Welcome back, <span className="text-blue-500">Shahriar Sajeeb</span>{" "}
            👋
          </h1>
        </div>

        {/* Order Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm flex justify-between items-center">
            <div>
              <p className="text-gray-600">Total Orders</p>
              <h2 className="text-3xl font-bold">3</h2>
            </div>
            <div className="text-blue-500">
              <Clock size={32} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm flex justify-between items-center">
            <div>
              <p className="text-gray-600">Processing Orders</p>
              <h2 className="text-3xl font-bold">3</h2>
            </div>
            <div className="text-blue-500">
              <Truck size={32} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm flex justify-between items-center">
            <div>
              <p className="text-gray-600">Completed Orders</p>
              <h2 className="text-3xl font-bold">0</h2>
            </div>
            <div className="text-blue-500">
              <CheckCircle size={32} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation - Shown on larger screens */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-20">
              <nav>
                <ul className="space-y-1">
                  <li>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-gray-50 text-gray-700 bg-blue-50"
                    >
                      <User size={20} />
                      <span>Profile</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/dashboard/orders"
                      className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-gray-50 text-gray-700"
                    >
                      <ShoppingBag size={20} />
                      <span>My Orders</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/dashboard/inbox"
                      className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-gray-50 text-gray-700"
                    >
                      <Inbox size={20} />
                      <span>Inbox</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/dashboard/notifications"
                      className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-gray-50 text-gray-700"
                    >
                      <Bell size={20} />
                      <span>Notifications</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/dashboard/shipping"
                      className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-gray-50 text-gray-700"
                    >
                      <MapPin size={20} />
                      <span>Shipping Address</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/dashboard/change-password"
                      className="flex items-center gap-3 px-4 py-3 rounded-md hover:bg-gray-50 text-gray-700"
                    >
                      <Lock size={20} />
                      <span>Change Password</span>
                    </Link>
                  </li>
                  <li>
                    <button className="flex w-full items-center gap-3 px-4 py-3 rounded-md text-red-500 hover:bg-red-50">
                      <LogOut size={20} />
                      <span>Logout</span>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>

          {/* Mobile Navigation - Shown only on smaller screens */}
          <div className="lg:hidden mb-6">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-hide">
                <Link
                  href="/dashboard"
                  className="flex flex-col items-center gap-1 min-w-16 px-4 py-2 rounded-md hover:bg-gray-50 text-gray-700"
                >
                  <User size={20} />
                  <span className="text-xs">Profile</span>
                </Link>
                <Link
                  href="/dashboard/orders"
                  className="flex flex-col items-center gap-1 min-w-16 px-4 py-2 rounded-md hover:bg-gray-50 text-gray-700"
                >
                  <ShoppingBag size={20} />
                  <span className="text-xs">Orders</span>
                </Link>
                <Link
                  href="/dashboard/inbox"
                  className="flex flex-col items-center gap-1 min-w-16 px-4 py-2 rounded-md hover:bg-gray-50 text-gray-700"
                >
                  <Inbox size={20} />
                  <span className="text-xs">Inbox</span>
                </Link>
                <Link
                  href="/dashboard/notifications"
                  className="flex flex-col items-center gap-1 min-w-16 px-4 py-2 rounded-md hover:bg-gray-50 text-gray-700"
                >
                  <Bell size={20} />
                  <span className="text-xs">Notifications</span>
                </Link>
                <Link
                  href="/dashboard/shipping"
                  className="flex flex-col items-center gap-1 min-w-16 px-4 py-2 rounded-md hover:bg-gray-50 text-gray-700"
                >
                  <MapPin size={20} />
                  <span className="text-xs">Address</span>
                </Link>
                <Link
                  href="/dashboard/change-password"
                  className="flex flex-col items-center gap-1 min-w-16 px-4 py-2 rounded-md hover:bg-gray-50 text-gray-700"
                >
                  <Lock size={20} />
                  <span className="text-xs">Password</span>
                </Link>
                <button className="flex flex-col items-center gap-1 min-w-16 px-4 py-2 rounded-md text-red-500 hover:bg-red-50">
                  <LogOut size={20} />
                  <span className="text-xs">Logout</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">{children}</div>
        </div>
      </div>
    </div>
  );
}
