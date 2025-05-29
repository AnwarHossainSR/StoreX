export default function ProductPageSkeleton() {
  return (
    <div className="bg-gray-50 py-8 animate-pulse">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 mb-8">
          <div className="h-4 bg-gray-200 rounded w-20"></div>
          <div className="mx-2 h-4 w-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
          <div className="mx-2 h-4 w-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Product Images */}
            <div>
              <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
              <div className="grid grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square bg-gray-200 rounded-lg"
                  ></div>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div>
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="flex items-center mb-4">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-5 w-5 bg-gray-200 rounded"></div>
                  ))}
                </div>
                <div className="h-4 bg-gray-200 rounded w-20 ml-2"></div>
              </div>
              <div className="flex items-center mb-6">
                <div className="h-8 bg-gray-200 rounded w-24"></div>
                <div className="h-6 bg-gray-200 rounded w-20 ml-2"></div>
                <div className="h-4 bg-gray-200 rounded w-16 ml-2"></div>
              </div>
              <div className="h-20 bg-gray-200 rounded mb-6"></div>
              <div className="mb-6">
                <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="h-4 bg-gray-200 rounded w-full"
                    ></div>
                  ))}
                </div>
              </div>
              <div className="border-t border-gray-200 py-4 mb-6">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between mb-2"
                  >
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </div>
                ))}
              </div>
              <div className="flex items-center mb-6">
                <div className="flex items-center border border-gray-300 rounded-md">
                  <div className="p-2 h-10 w-10 bg-gray-200"></div>
                  <div className="px-4 py-2 h-10 w-12 bg-gray-200 border-x"></div>
                  <div className="p-2 h-10 w-10 bg-gray-200"></div>
                </div>
                <div className="ml-4 h-10 w-10 bg-gray-200 rounded-md"></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-12 bg-gray-200 rounded-md"></div>
                <div className="h-12 bg-gray-200 rounded-md"></div>
              </div>
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="h-5 w-5 bg-gray-200 rounded mr-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-48"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2 border-b border-gray-200"
              >
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
