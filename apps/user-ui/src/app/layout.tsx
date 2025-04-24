import { Providers } from "@/providers/QueryProvider";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "StoreX | Your One-Stop Shopping Destination",
  description:
    "Shop for electronics, fashion, home goods, and more. Great deals, fast shipping.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <div className="flex-grow">
          {" "}
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
