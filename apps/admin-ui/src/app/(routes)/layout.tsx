"use client";

import Loading from "@/components/ui/loading";
import { useCurrentUser } from "@/hooks/useAdmin";
import { useAuth } from "@/hooks/useAuth";
import {
  Bell,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Columns3,
  CreditCard,
  Inbox,
  LayoutDashboard,
  List,
  LogOut,
  Menu,
  Package,
  Search,
  Settings,
  ShoppingBag,
  User,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useRef, useState } from "react";

interface SellerLayoutProps {
  children: ReactNode;
}

const sidebarSections: any = [
  {
    title: "",
    items: [{ name: "Dashboard", href: "/", icon: LayoutDashboard }],
  },
  {
    title: "Main Menu",
    items: [
      { name: "Orders", href: "/orders", icon: Package },
      { name: "Payments", href: "/payments", icon: CreditCard },
      { name: "Products", href: "/products", icon: List },
      { name: "Events", href: "/events", icon: Calendar },
      { name: "Users", href: "/users", icon: Users },
      { name: "Sellers", href: "/users", icon: ShoppingBag },
    ],
  },
  {
    title: "Controllers",
    items: [
      { name: "Loggers", href: "/logs", icon: Inbox },
      { name: "Managements", href: "/managements", icon: Settings },
      { name: "Notifications", href: "/notifications", icon: Bell },
    ],
  },
  {
    title: "Customization",
    items: [
      {
        name: "All Customization",
        href: "/customizations",
        icon: Columns3,
      },
    ],
  },
  {
    title: "Extras",
    items: [{ name: "Logout", href: "#", icon: LogOut, isDestructive: true }],
  },
];

// Define notification type
interface Notification {
  id: number;
  message: string;
  time: string;
  isRead: boolean;
}

// Sample notifications
const sampleNotifications: Notification[] = [
  {
    id: 1,
    message: "New order received #ORD-5289",
    time: "2 minutes ago",
    isRead: false,
  },
  {
    id: 2,
    message: "Payment confirmed for order #ORD-5288",
    time: "1 hour ago",
    isRead: false,
  },
  {
    id: 3,
    message: "Product inventory low: 'Premium Headphones'",
    time: "3 hours ago",
    isRead: false,
  },
];

export default function SellerLayout({ children }: SellerLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] =
    useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifications, setNotifications] =
    useState<Notification[]>(sampleNotifications);

  const notificationRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const { isLoading, user } = useCurrentUser();
  const { logoutAdmin } = useAuth();

  const handleLogout = () => {
    logoutAdmin();
  };

  const handleReadNotification = (id: number) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setNotificationDropdownOpen(false);
      }
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // useEffect(() => {
  //   console.log("layout:", user);
  //   if (!isLoading && !user) {
  //     window.location.href = "/login";
  //   }
  // }, [isLoading, user]);

  console.log("isLoading || !user", isLoading, user);

  if (isLoading || !user) {
    // Show a loading state or redirect to login if user is not authenticated
    return <Loading fullScreen size="lg" />;
  }

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
                src={user?.avatar?.url || "/images/avatar-placeholder.png"}
                alt="Logo"
              />
              <div>
                <div className="text-xl font-bold text-white">{user?.name}</div>
                <div className="text-xs text-gray-400">{user?.email}</div>
              </div>
            </div>
            <nav className="mt-8 px-2 space-y-1">
              {sidebarSections.map((sec: any) => (
                <div key={sec.title}>
                  <div className="px-4 text-xs font-semibold text-gray-400 uppercase">
                    {sec.title}
                  </div>
                  {sec.items.map((item: any) =>
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
                  src={user?.avatar?.url || "/images/avatar-placeholder.png"}
                  alt="Logo"
                />
                <div>
                  <div className="text-xl font-bold text-white">
                    {user?.name}
                  </div>
                  <div className="text-xs text-gray-400">{user?.email}</div>
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
            {sidebarSections.map((sec: any) => (
              <div key={sec.title}>
                {!isCollapsed && (
                  <div className="px-4 text-xs font-semibold text-gray-400 uppercase">
                    {sec.title}
                  </div>
                )}
                {sec.items.map((item: any) =>
                  item.isDestructive ? (
                    <button
                      key={item.name}
                      onClick={handleLogout}
                      className={`group flex items-center w-full px-4 py-3 text-sm font-medium rounded-md text-red-400 hover:text-red-300 hover:bg-gray-700 transition-all duration-200 ${
                        isCollapsed ? "justify-center" : ""
                      }`}
                    >
                      <item.icon className="h-5 w-5" />{" "}
                      {!isCollapsed && (
                        <span className="ml-3">{item.name}</span>
                      )}
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
              {/* Notification Dropdown */}
              <div className="relative" ref={notificationRef}>
                <button
                  className="relative p-1 text-gray-400 hover:text-gray-500 focus:outline-none"
                  onClick={() => {
                    setNotificationDropdownOpen(!notificationDropdownOpen);
                    setUserDropdownOpen(false);
                  }}
                >
                  <Bell className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 h-5 w-5 flex items-center justify-center rounded-full text-xs font-medium text-white bg-red-500 -mt-1 -mr-1">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown Menu */}
                {notificationDropdownOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <h3 className="text-sm font-medium text-gray-900">
                          Notifications
                        </h3>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`px-4 py-3 hover:bg-gray-100 ${
                                !notification.isRead ? "bg-blue-50" : ""
                              }`}
                              onClick={() =>
                                handleReadNotification(notification.id)
                              }
                            >
                              <div className="flex justify-between">
                                <p className="text-sm font-medium text-gray-900">
                                  {notification.message}
                                </p>
                                {!notification.isRead && (
                                  <span className="h-2 w-2 bg-blue-500 rounded-full"></span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {notification.time}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-sm text-gray-500">
                            No notifications
                          </div>
                        )}
                      </div>
                      <div className="border-t border-gray-200">
                        <Link
                          href="/notifications"
                          className="block px-4 py-2 text-sm text-center text-blue-600 hover:text-blue-800"
                        >
                          View all notifications
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile Dropdown */}
              <div className="relative" ref={userDropdownRef}>
                <button
                  onClick={() => {
                    setUserDropdownOpen(!userDropdownOpen);
                    setNotificationDropdownOpen(false);
                  }}
                  className="flex items-center focus:outline-none"
                >
                  <img
                    className="h-8 w-8 rounded-full"
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    alt="User avatar"
                  />
                </button>

                {/* User Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">
                          {user?.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user?.email}
                        </p>
                      </div>
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          Your Profile
                        </div>
                      </Link>
                      <Link
                        href="/settings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <div className="flex items-center">
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </div>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        <div className="flex items-center">
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign out
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
