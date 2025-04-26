"use client";

import { useAuth } from "@/hooks/useAuth";
import { useCurrentUser } from "@/hooks/useSeller";
import {
  Bell,
  Calendar,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Search,
  Settings,
  Store,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

interface SellerLayoutProps {
  children: ReactNode;
}

export default function SellerLayout({ children }: SellerLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { isLoading, user } = useCurrentUser();
  const { logoutSeller } = useAuth();
  console.log("user", user);

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Orders", href: "/orders", icon: Package },
    { name: "Products", href: "/products", icon: Store },
    { name: "Users", href: "/users", icon: Users },
    { name: "Payments", href: "/payments", icon: CreditCard },
    { name: "Events", href: "/events", icon: Calendar },
  ];

  const secondaryNavigation = [
    { name: "Settings", href: "/settings", icon: Settings },
    { name: "Notifications", href: "/notifications", icon: Bell },
  ];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    // redirect to login page
    logoutSeller();
  };

  useEffect(() => {
    if (!isLoading && !user) {
      window.location.href = "/login";
    }
  }, [user, isLoading]);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-900">
      {/* Sidebar for mobile */}
      <div
        className={`fixed inset-0 z-40 lg:hidden ${
          sidebarOpen ? "block" : "hidden"
        }`}
        onClick={() => setSidebarOpen(false)}
      >
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75"></div>

        <div className="fixed inset-0 flex z-40">
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-gray-900">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <X className="h-6 w-6 text-white" />
              </button>
            </div>

            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                <div className="text-2xl font-bold text-white">
                  <span className="text-yellow-400">{user?.shop?.name}</span>
                  <span>Shop</span>
                </div>
              </div>
              <nav className="mt-8 flex-1 px-2 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-4 py-2 text-base font-medium rounded-md ${
                      pathname === item.href
                        ? "bg-gray-800 text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-6 w-6 ${
                        pathname === item.href
                          ? "text-white"
                          : "text-gray-400 group-hover:text-gray-300"
                      }`}
                    />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex-shrink-0 px-2 py-4 space-y-1">
              {secondaryNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-4 py-2 text-base font-medium rounded-md ${
                    pathname === item.href
                      ? "bg-gray-800 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-6 w-6 ${
                      pathname === item.href
                        ? "text-white"
                        : "text-gray-400 group-hover:text-gray-300"
                    }`}
                  />
                  {item.name}
                </Link>
              ))}

              <div className="pt-4 border-t border-gray-700">
                <button
                  onClick={handleLogout}
                  className="group flex items-center px-4 py-2 text-base font-medium rounded-md text-red-400 hover:text-red-700"
                >
                  <LogOut className="mr-3 h-6 w-6 text-red-400 group-hover:text-red-300" />
                  Logout
                </button>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 w-14"></div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex-1 flex flex-col min-h-0 bg-gray-900">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <div className="text-2xl font-bold text-white">
                  <span className="text-yellow-400">{user?.shop?.name}</span>
                  {/* <span>Shop</span> */}
                </div>
              </div>
              <div className="mt-8 px-4">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {user?.name}
                </div>
                <div className="text-sm text-gray-300">{user?.email}</div>
              </div>
              <nav className="mt-8 flex-1 px-2 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                      pathname === item.href
                        ? "bg-gray-800 text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 ${
                        pathname === item.href
                          ? "text-white"
                          : "text-gray-400 group-hover:text-gray-300"
                      }`}
                    />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex-shrink-0 px-2 py-4 space-y-1">
              {secondaryNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    pathname === item.href
                      ? "bg-gray-800 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${
                      pathname === item.href
                        ? "text-white"
                        : "text-gray-400 group-hover:text-gray-300"
                    }`}
                  />
                  {item.name}
                </Link>
              ))}

              <div className="pt-4 border-t border-gray-700">
                <button
                  onClick={handleLogout}
                  className="group flex items-center px-4 py-2 text-sm font-medium rounded-md text-red-400 hover:text-red-700"
                >
                  <LogOut className="mr-3 h-5 w-5 text-red-400 group-hover:text-red-300" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Top Navigation */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            type="button"
            className="px-4 text-gray-500 lg:hidden"
            onClick={toggleSidebar}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" />
          </button>

          {/* Search */}
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex">
              <div className="w-full flex md:ml-0">
                <label htmlFor="search-field" className="sr-only">
                  Search
                </label>
                <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                    <Search className="h-5 w-5" />
                  </div>
                  <input
                    id="search-field"
                    className="block w-full h-full pl-8 pr-3 py-2 border-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-0 focus:border-transparent sm:text-sm"
                    placeholder="Search"
                    type="search"
                    name="search"
                  />
                </div>
              </div>
            </div>

            <div className="ml-4 flex items-center md:ml-6">
              {/* Notification Icon */}
              <button className="p-1 text-gray-400 hover:text-gray-500 relative">
                <span className="sr-only">View notifications</span>
                <Bell className="h-6 w-6" />
                <span className="absolute top-0 right-0 h-5 w-5 flex items-center justify-center rounded-full text-xs font-medium text-white bg-red-500 -mt-1 -mr-1">
                  3
                </span>
              </button>

              {/* Profile Dropdown */}
              <div className="ml-3 relative">
                <button className="max-w-xs p-1 flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <span className="sr-only">Open user menu</span>
                  <img
                    className="h-8 w-8 rounded-full"
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    alt="User avatar"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
}
