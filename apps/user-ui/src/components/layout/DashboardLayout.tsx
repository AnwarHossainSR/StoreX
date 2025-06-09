"use client";

import { useAuth } from "@/hooks/useAuth";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { cn } from "@/lib/utils";
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
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
};

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Profile", icon: User },
  { href: "/dashboard/orders", label: "My Orders", icon: ShoppingBag },
  { href: "/dashboard/inbox", label: "Inbox", icon: Inbox },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/shipping", label: "Shipping Address", icon: MapPin },
  { href: "/dashboard/change-password", label: "Change Password", icon: Lock },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { logout } = useAuth();
  const { user } = useCurrentUser();
  const pathname = usePathname();

  const isActivePath = (path: string) => {
    if (path === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(path);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center">
            Welcome back, <span className="text-blue-500">{user?.name}</span> 👋
          </h1>
        </div>

        {/* Order Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard label="Total Orders" value="3" icon={Clock} />
          <StatCard label="Processing Orders" value="3" icon={Truck} />
          <StatCard label="Completed Orders" value="0" icon={CheckCircle} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation (Desktop) */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-20">
              <nav>
                <ul className="space-y-1">
                  {navItems.map(({ href, label, icon: Icon }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-md hover:bg-gray-50 text-gray-700",
                          isActivePath(href) && "bg-blue-50"
                        )}
                      >
                        <Icon size={20} />
                        <span>{label}</span>
                      </Link>
                    </li>
                  ))}
                  <li>
                    <button
                      onClick={() => logout()}
                      className="flex w-full items-center gap-3 px-4 py-3 rounded-md text-red-500 hover:bg-red-50"
                    >
                      <LogOut size={20} />
                      <span>Logout</span>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="lg:hidden mb-6">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-hide">
                {navItems.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex flex-col items-center gap-1 min-w-16 px-4 py-2 rounded-md hover:bg-gray-50 text-gray-700",
                      isActivePath(href) && "bg-blue-50"
                    )}
                  >
                    <Icon size={20} />
                    <span className="text-xs">{label}</span>
                  </Link>
                ))}
                <button
                  onClick={() => logout()}
                  className="flex flex-col items-center gap-1 min-w-16 px-4 py-2 rounded-md text-red-500 hover:bg-red-50"
                >
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

// Helper component for stats
function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm flex justify-between items-center">
      <div>
        <p className="text-gray-600">{label}</p>
        <h2 className="text-3xl font-bold">{value}</h2>
      </div>
      <div className="text-blue-500">
        <Icon size={32} />
      </div>
    </div>
  );
}
