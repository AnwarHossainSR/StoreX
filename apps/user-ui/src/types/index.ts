export interface Product {
  id: string;
  title: string;
  slug: string;
  category: string;
  subCategory: string;
  short_description: string;
  detailed_description: string;
  images: { id: string; url: string }[];
  video_url?: string;
  tags: string[];
  brand?: string;
  colors: string[];
  sizes: string[];
  stock: number;
  sale_price: number;
  regular_price: number;
  totalSales: number;
  ratings: number;
  warranty?: string;
  custom_specifications?: Record<string, string>;
  custom_properties: {
    [key: string]: string[];
  };
  cashOnDelivery?: boolean;
  discount_codes: string[];
  status: "Active" | "Pending" | "Draft" | "Deleted";
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  shopId: string;
  sellerId: string;
  Shop: { id: string; name: string };
}
