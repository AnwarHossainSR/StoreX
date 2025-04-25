// app/dashboard/inbox/page.tsx
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Filter, Inbox as InboxIcon, Search, Send, User } from "lucide-react";

export default function InboxPage() {
  // Sample messages - in a real app you'd fetch this from an API
  const messages = [
    {
      id: 1,
      from: "StoreX Support",
      subject: "Your Recent Order Inquiry",
      message:
        "Thank you for contacting us about your recent order. We've looked into the issue and...",
      date: "2025-04-22 14:30",
      read: false,
    },
    {
      id: 2,
      from: "Shipping Department",
      subject: "Shipping Delay Notification",
      message:
        "We wanted to inform you that there might be a slight delay in shipping your order due to...",
      date: "2025-04-20 09:15",
      read: true,
    },
    {
      id: 3,
      from: "Customer Service",
      subject: "Feedback Request",
      message:
        "We hope you're enjoying your recent purchase! We'd love to hear your thoughts on...",
      date: "2025-04-15 16:45",
      read: true,
    },
  ];

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Inbox</h1>
          {unreadCount > 0 && (
            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount} unread
            </span>
          )}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search messages..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search
              size={20}
              className="absolute left-3 top-2.5 text-gray-400"
            />
          </div>
          <div className="flex gap-4">
            <select className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Messages</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
            <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2">
              <Filter size={18} />
              <span>Filter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="bg-white rounded-lg shadow-sm">
        {messages.length > 0 ? (
          <div>
            <ul className="divide-y divide-gray-200">
              {messages.map((message) => (
                <li
                  key={message.id}
                  className={`p-6 hover:bg-gray-50 cursor-pointer ${
                    !message.read ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-start">
                    <div className="mr-4">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <User size={20} className="text-gray-500" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <h3
                          className={`font-medium ${
                            !message.read ? "text-blue-900" : "text-gray-900"
                          }`}
                        >
                          {message.from}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {message.date}
                        </span>
                      </div>
                      <p
                        className={`text-sm font-medium mb-1 ${
                          !message.read ? "text-blue-800" : "text-gray-800"
                        }`}
                      >
                        {message.subject}
                      </p>
                      <p
                        className={`text-sm truncate ${
                          !message.read ? "text-blue-600" : "text-gray-600"
                        }`}
                      >
                        {message.message}
                      </p>
                    </div>
                    {!message.read && (
                      <div className="ml-2 flex-shrink-0">
                        <span className="w-2 h-2 bg-blue-500 rounded-full inline-block"></span>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {/* Compose Message Box */}
            <div className="border-t border-gray-200 p-6">
              <h3 className="font-medium mb-4">Send a Message</h3>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Subject
                  </label>
                  <input
                    id="subject"
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter message subject"
                  />
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Type your message here..."
                  ></textarea>
                </div>
                <div className="flex justify-end">
                  <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2">
                    <Send size={18} />
                    <span>Send Message</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="bg-gray-100 p-4 rounded-full mb-4">
              <InboxIcon size={48} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Your inbox is empty
            </h3>
            <p className="text-gray-500 mb-6">
              You don't have any messages at the moment.
            </p>
            <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
              <Send size={18} />
              <span>Send a Message</span>
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
