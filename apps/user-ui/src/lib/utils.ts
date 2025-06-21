import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isDevelopment =
  process.env.NODE_ENV === "development" ||
  process.env.NEXT_PUBLIC_VERCEL_ENV === "development" ||
  (typeof window !== "undefined" && window.location.hostname === "localhost") ||
  (typeof window !== "undefined" &&
    window.location.hostname.includes("localhost")) ||
  (typeof window !== "undefined" &&
    window.location.hostname.includes("127.0.0.1")) ||
  process.env.NEXT_PUBLIC_APP_ENV === "development";

export const TEST_CARDS = {
  visa: {
    number: "4242424242424242",
    expiry: "12/34",
    cvc: "123",
    name: "Test User",
    description: "Visa - Success",
  },
  visaDebit: {
    number: "4000056655665556",
    expiry: "12/34",
    cvc: "123",
    name: "Test User",
    description: "Visa Debit - Success",
  },
  mastercard: {
    number: "5555555555554444",
    expiry: "12/34",
    cvc: "123",
    name: "Test User",
    description: "Mastercard - Success",
  },
  amex: {
    number: "378282246310005",
    expiry: "12/34",
    cvc: "1234",
    name: "Test User",
    description: "American Express - Success",
  },
  declined: {
    number: "4000000000000002",
    expiry: "12/34",
    cvc: "123",
    name: "Test User",
    description: "Visa - Declined",
  },
  insufficientFunds: {
    number: "4000000000009995",
    expiry: "12/34",
    cvc: "123",
    name: "Test User",
    description: "Visa - Insufficient Funds",
  },
  requiresAuth: {
    number: "4000002500003155",
    expiry: "12/34",
    cvc: "123",
    name: "Test User",
    description: "Visa - Requires Authentication",
  },
} as const;
