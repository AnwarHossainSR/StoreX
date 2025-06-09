"use client";

import { cn } from "@/lib/utils";
import {
  ChevronRight,
  Heart,
  Home,
  LogOut,
  Package,
  ShoppingCart,
  Store,
  Tag,
  User,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface MobileMenuProps {
  onClose: () => void;
}

export default function MobileMenu({ onClose }: MobileMenuProps) {
  const pathname = usePathname();

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="absolute top-0 left-0 w-3/4 h-full bg-white overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 bg-blue-500 text-white">
          <div className="flex items-center space-x-2">
            <User size={24} />
            <div>
              <p className="font-semibold">Hello, Shahriar</p>
              <p className="text-sm opacity-80">Welcome back!</p>
            </div>
          </div>
        </div>

        <div className="p-4 border-b">
          <p className="font-medium text-gray-500 mb-2">Navigation</p>
          <ul className="space-y-2">
            <li>
              <Link
                href="/"
                className={cn(
                  "flex items-center px-2 py-2 rounded",
                  pathname === "/"
                    ? "bg-blue-50 text-blue-500"
                    : "hover:bg-gray-100"
                )}
                onClick={onClose}
              >
                <Home size={20} className="mr-3 text-gray-500" />
                <span>Home</span>
              </Link>
            </li>
            <li>
              <Link
                href="/products"
                className={cn(
                  "flex items-center px-2 py-2 rounded",
                  pathname === "/products"
                    ? "bg-blue-50 text-blue-500"
                    : "hover:bg-gray-100"
                )}
                onClick={onClose}
              >
                <Package size={20} className="mr-3 text-gray-500" />
                <span>Products</span>
              </Link>
            </li>
            <li>
              <Link
                href="/shops"
                className={cn(
                  "flex items-center px-2 py-2 rounded",
                  pathname === "/shops"
                    ? "bg-blue-50 text-blue-500"
                    : "hover:bg-gray-100"
                )}
                onClick={onClose}
              >
                <Store size={20} className="mr-3 text-gray-500" />
                <span>Shops</span>
              </Link>
            </li>
            <li>
              <Link
                href="/offers"
                className={cn(
                  "flex items-center px-2 py-2 rounded",
                  pathname === "/offers"
                    ? "bg-blue-50 text-blue-500"
                    : "hover:bg-gray-100"
                )}
                onClick={onClose}
              >
                <Tag size={20} className="mr-3 text-gray-500" />
                <span>Offers</span>
              </Link>
            </li>
            <li>
              <Link
                href={`${process.env.NEXT_PUBLIC_SELLER_URI}/register`}
                className={cn(
                  "flex items-center px-2 py-2 rounded",
                  pathname === `${process.env.NEXT_PUBLIC_SELLER_URI}/register`
                    ? "bg-blue-50 text-blue-500"
                    : "hover:bg-gray-100"
                )}
                onClick={onClose}
                target="_blank"
              >
                <UserPlus size={20} className="mr-3 text-gray-500" />
                <span>Become A Seller</span>
              </Link>
            </li>
          </ul>
        </div>

        <div className="p-4 border-b">
          <p className="font-medium text-gray-500 mb-2">Categories</p>
          <ul className="space-y-2">
            {[
              "Electronics",
              "Fashion",
              "Home & Kitchen",
              "Sports & Fitness",
              "Beauty",
              "Toys",
              "Books",
            ].map((category, index) => (
              <li key={index}>
                <Link
                  href={`/category/${category
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                  className={cn(
                    "flex items-center justify-between px-2 py-2 rounded",
                    pathname ===
                      `/category/${category.toLowerCase().replace(/\s+/g, "-")}`
                      ? "bg-blue-50 text-blue-500"
                      : "hover:bg-gray-100"
                  )}
                  onClick={onClose}
                >
                  <span>{category}</span>
                  <ChevronRight size={16} className="text-gray-400" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-4">
          <p className="font-medium text-gray-500 mb-2">Account</p>
          <ul className="space-y-2">
            <li>
              <Link
                href="/account"
                className={cn(
                  "flex items-center px-2 py-2 rounded",
                  pathname === "/account"
                    ? "bg-blue-50 text-blue-500"
                    : "hover:bg-gray-100"
                )}
                onClick={onClose}
              >
                <User size={20} className="mr-3 text-gray-500" />
                <span>My Account</span>
              </Link>
            </li>
            <li>
              <Link
                href="/wishlist"
                className={cn(
                  "flex items-center px-2 py-2 rounded",
                  pathname === "/wishlist"
                    ? "bg-blue-50 text-blue-500"
                    : "hover:bg-gray-100"
                )}
                onClick={onClose}
              >
                <Heart size={20} className="mr-3 text-gray-500" />
                <span>Wishlist</span>
              </Link>
            </li>
            <li>
              <Link
                href="/cart"
                className={cn(
                  "flex items-center px-2 py-2 rounded",
                  pathname === "/cart"
                    ? "bg-blue-50 text-blue-500"
                    : "hover:bg-gray-100"
                )}
                onClick={onClose}
              >
                <ShoppingCart size={20} className="mr-3 text-gray-500" />
                <span>Cart</span>
              </Link>
            </li>
            <li>
              <button
                className="flex items-center w-full text-left px-2 py-2 rounded hover:bg-gray-100"
                onClick={onClose}
              >
                <LogOut size={20} className="mr-3 text-gray-500" />
                <span>Logout</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
