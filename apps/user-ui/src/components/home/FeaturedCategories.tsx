"use client";

import CategoryCardSkeleton from "@/components/skeletons/CategoryCardSkeleton";
import { useAlert } from "@/hooks/useAlert";
import { useProduct } from "@/hooks/useProduct";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

const placeholderImages = [
  "https://images.pexels.com/photos/1841841/pexels-photo-1841841.jpeg",
  "https://images.pexels.com/photos/934070/pexels-photo-934070.jpeg",
  "https://images.pexels.com/photos/1358900/pexels-photo-1358900.jpeg",
  "https://images.pexels.com/photos/2261482/pexels-photo-2261482.jpeg",
  "https://images.pexels.com/photos/3373739/pexels-photo-3373739.jpeg",
  "https://images.pexels.com/photos/163036/mario-luigi-yoschi-figures-163036.jpeg",
];

interface DisplayCategory {
  id: string;
  name: string;
  image: string;
}

export default function FeaturedCategories() {
  const {
    categories,
    categoriesStatus,
    categoriesError,
    categoriesErrorDetails,
  } = useProduct();
  const { setError, clearAlert } = useAlert();

  useEffect(() => {
    if (categoriesStatus === "error" && categoriesError) {
      setError(categoriesError, {
        details: categoriesErrorDetails,
        isBackendError: true,
      });
    } else {
      clearAlert();
    }
  }, [
    categoriesStatus,
    categoriesError,
    categoriesErrorDetails,
    setError,
    clearAlert,
  ]);

  const dynamicCategories: DisplayCategory[] = categories.map(
    (name, index) => ({
      id: `cat-${index + 1}`,
      name,
      image: placeholderImages[index % placeholderImages.length],
    })
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {categoriesStatus === "pending" ? (
        <>
          {[...Array(6)].map((_, i) => (
            <CategoryCardSkeleton key={i} />
          ))}
        </>
      ) : categories.length === 0 ? (
        <p>No categories available</p>
      ) : (
        dynamicCategories.map((category) => (
          <Link
            href={`/category/${category.name
              .toLowerCase()
              .replace(/\s+/g, "-")}`}
            key={category.id}
            className="group"
          >
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="h-40 overflow-hidden">
                <Image
                  src={category.image}
                  alt={category.name}
                  width={300}
                  height={200}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4 bg-white text-center">
                <h3 className="text-lg font-medium text-gray-800 mb-1">
                  {category.name}
                </h3>
              </div>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}
