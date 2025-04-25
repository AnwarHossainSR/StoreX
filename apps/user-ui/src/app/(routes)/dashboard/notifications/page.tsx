// app/dashboard/notifications/page.tsx
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Bell,
  CheckCircle,
  Info,
  ShoppingBag,
  Tag,
  TruckIcon,
} from "lucide-react";

export default function NotificationsPage() {
  // Sample notifications - in a real app you'd fetch this from an API
  const notifications = [
    {
      id: 1,
      type: "order",
      title: "Order Received",
      message:
        "Your order #ORD-12345 has been received and is being processed.",
      date: "2025-04-22",
      read: false,
      icon: <ShoppingBag size={18} className="text-blue-500" />,
    },
    {
      id: 2,
      type: "promotion",
      title: "Flash Sale!",
      message:
        "Don't miss our 24-hour flash sale. Get up to 50% off on selected items.",
      date: "2025-04-20",
      read: true,
      icon: <Tag size={18} className="text-green-500" />,
    },
    {
      id: 3,
      type: "shipping",
      title: "Order Shipped",
      message:
        "Your order #ORD-12346 has been shipped. Estimated delivery: April 25, 2025.",
      date: "2025-04-18",
      read: false,
      icon: <TruckIcon size={18} className="text-orange-500" />,
    },
    {
      id: 4,
      type: "account",
      title: "Security Alert",
      message:
        "Your password was recently changed. If this wasn't you, please contact support.",
      date: "2025-04-15",
      read: true,
      icon: <Info size={18} className="text-red-500" />,
    },
    {
      id: 5,
      type: "success",
      title: "Review Submitted",
      message:
        "Thank you! Your review for Blue Running Shoes has been published.",
      date: "2025-04-10",
      read: true,
      icon: <CheckCircle size={18} className="text-green-500" />,
    },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount} unread
            </span>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="flex overflow-x-auto border-b">
          <button className="px-6 py-3 font-medium text-blue-500 border-b-2 border-blue-500">
            All
          </button>
          <button className="px-6 py-3 font-medium text-gray-500 hover:text-gray-900">
            Orders
          </button>
          <button className="px-6 py-3 font-medium text-gray-500 hover:text-gray-900">
            Promotions
          </button>
          <button className="px-6 py-3 font-medium text-gray-500 hover:text-gray-900">
            Account
          </button>
        </div>
        <div className="p-4 flex justify-end">
          <button className="text-blue-500 text-sm font-medium hover:underline">
            Mark all as read
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg shadow-sm">
        {notifications.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <li
                key={notification.id}
                className={`p-6 hover:bg-gray-50 ${
                  !notification.read ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex">
                  <div className="flex-shrink-0 mr-4">
                    <div
                      className={`p-2 rounded-full bg-${
                        !notification.read ? "blue" : "gray"
                      }-100`}
                    >
                      {notification.icon}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3
                        className={`font-medium ${
                          !notification.read ? "text-blue-900" : "text-gray-900"
                        }`}
                      >
                        {notification.title}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {notification.date}
                      </span>
                    </div>
                    <p
                      className={`text-sm ${
                        !notification.read ? "text-blue-800" : "text-gray-600"
                      }`}
                    >
                      {notification.message}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="bg-gray-100 p-4 rounded-full mb-4">
              <Bell size={48} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No notifications
            </h3>
            <p className="text-gray-500">
              You don't have any notifications at the moment.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
