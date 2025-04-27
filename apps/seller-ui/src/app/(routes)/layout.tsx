"use client";

import { useAuth } from "@/hooks/useAuth";
import { useCurrentUser } from "@/hooks/useSeller";
import {
  Bell,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Inbox,
  LayoutDashboard,
  List,
  LogOut,
  Menu,
  Package,
  Plus,
  Search,
  Settings,
  Tag,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

interface SellerLayoutProps {
  children: ReactNode;
}

const sidebarSections = [
  {
    title: "Main Menu",
    items: [
      { name: "Dashboard", href: "/", icon: LayoutDashboard },
      { name: "Orders", href: "/orders", icon: Package },
      { name: "Payments", href: "/payments", icon: CreditCard },
    ],
  },
  {
    title: "Products",
    items: [
      { name: "Create Product", href: "/products/create", icon: Plus },
      { name: "All Products", href: "/products", icon: List },
    ],
  },
  {
    title: "Events",
    items: [
      { name: "Create Event", href: "/events/create", icon: Plus },
      { name: "All Events", href: "/events", icon: Calendar },
    ],
  },
  {
    title: "Controllers",
    items: [
      { name: "Inbox", href: "/inbox", icon: Inbox },
      { name: "Settings", href: "/settings", icon: Settings },
      { name: "Notifications", href: "/notifications", icon: Bell },
    ],
  },
  {
    title: "Extras",
    items: [
      { name: "Discount Codes", href: "/discount-codes", icon: Tag },
      { name: "Logout", href: "#", icon: LogOut, isDestructive: true },
    ],
  },
];

export default function SellerLayout({ children }: SellerLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { isLoading, user } = useCurrentUser();
  const { logoutSeller } = useAuth();

  const handleLogout = () => {
    logoutSeller();
  };

  useEffect(() => {
    console.log("layout:", user);
    if (!isLoading && !user) alert("You are not logged in");
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-900">
      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-40 lg:hidden ${
          sidebarOpen ? "block" : "hidden"
        }`}
      >
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-gradient-to-b from-gray-900 to-gray-800">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="pt-5 pb-4 overflow-y-auto">
            {/* Header */}
            <div className="px-4 flex items-center">
              <img
                className="h-10 w-10 rounded-full mr-3"
                src="/storex-logo.png"
                alt="Logo"
              />
              <div>
                <div className="text-2xl font-bold text-white">Becodemy</div>
                <div className="text-sm text-gray-400">653 Banani, Dhaka</div>
              </div>
            </div>
            <nav className="mt-8 px-2 space-y-1">
              {sidebarSections.map((sec) => (
                <div key={sec.title}>
                  <div className="px-4 text-xs font-semibold text-gray-400 uppercase">
                    {sec.title}
                  </div>
                  {sec.items.map((item) =>
                    item.isDestructive ? (
                      <button
                        key={item.name}
                        onClick={handleLogout}
                        className="group flex items-center w-full px-4 py-3 text-base font-medium rounded-md text-red-400 hover:text-red-300 hover:bg-gray-700 transition-all duration-200"
                      >
                        <item.icon className="mr-3 h-6 w-6" />
                        {item.name}
                      </button>
                    ) : (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`group flex items-center px-4 py-3 text-base font-medium rounded-md transition-all duration-200 ${
                          pathname === item.href
                            ? "bg-gray-700 text-white border-l-4 border-yellow-400"
                            : "text-gray-300 hover:bg-gray-700 hover:text-white"
                        }`}
                      >
                        <item.icon className="mr-3 h-6 w-6" />
                        {item.name}
                      </Link>
                    )
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>
        <div className="flex-shrink-0 w-14" />
      </div>

      {/* Desktop sidebar */}
      <div
        className={`hidden lg:flex lg:flex-shrink-0 transition-all duration-300 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        <div className="flex flex-col w-full bg-gradient-to-b from-gray-900 to-gray-800">
          <div className="flex items-center justify-between px-4 pt-5 pb-4">
            {!isCollapsed && (
              <div className="flex items-center">
                <img
                  className="h-10 w-10 rounded-full mr-3"
                  src="/storex-logo.png"
                  alt="Logo"
                />
                <div>
                  <div className="text-2xl font-bold text-white">Becodemy</div>
                  <div className="text-sm text-gray-400">653 Banani, Dhaka</div>
                </div>
              </div>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 text-gray-400 hover:text-white focus:outline-none"
            >
              {isCollapsed ? (
                <ChevronRight className="h-6 w-6" />
              ) : (
                <ChevronLeft className="h-6 w-6" />
              )}
            </button>
          </div>
          <nav className="flex-1 px-2 space-y-1 overflow-y-auto">
            {sidebarSections.map((sec) => (
              <div key={sec.title}>
                {!isCollapsed && (
                  <div className="px-4 text-xs font-semibold text-gray-400 uppercase">
                    {sec.title}
                  </div>
                )}
                {sec.items.map((item) =>
                  item.isDestructive ? (
                    <button
                      key={item.name}
                      onClick={handleLogout}
                      className={`group flex items-center w-full px-4 py-3 text-sm font-medium rounded-md text-red-400 hover:text-red-300 hover:bg-gray-700 transition-all duration-200 ${
                        isCollapsed ? "justify-center" : ""
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                    </button>
                  ) : (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
                        pathname === item.href
                          ? "bg-gray-700 text-white border-l-4 border-yellow-400"
                          : "text-gray-300 hover:bg-gray-700 hover:text-white"
                      } ${isCollapsed ? "justify-center" : ""}`}
                    >
                      <item.icon className="h-5 w-5" />
                      {!isCollapsed && (
                        <span className="ml-3">{item.name}</span>
                      )}
                    </Link>
                  )
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Top bar */}
        <div className="relative z-10 flex h-16 bg-white shadow">
          <button
            type="button"
            className="px-4 text-gray-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 px-4 flex justify-between">
            <div className="relative w-full text-gray-400 focus-within:text-gray-600">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5" />
              </div>
              <input
                id="search-field"
                className="block w-full h-full pl-10 pr-3 py-2 border-transparent placeholder-gray-500 focus:outline-none focus:ring-0 sm:text-sm text-gray-900"
                placeholder="Search"
                type="search"
              />
            </div>
            <div className="ml-4 flex items-center space-x-4">
              <button className="relative p-1 text-gray-400 hover:text-gray-500">
                <Bell className="h-6 w-6" />
                <span className="absolute top-0 right-0 h-5 w-5 flex items-center justify-center rounded-full text-xs font-medium text-white bg-red-500 -mt-1 -mr-1">
                  3
                </span>
              </button>
              <img
                className="h-8 w-8 rounded-full"
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt="User avatar"
              />
            </div>
          </div>
        </div>
        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto bg-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
}
