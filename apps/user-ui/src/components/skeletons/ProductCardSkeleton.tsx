export default function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md animate-pulse">
      <div className="relative">
        <div className="h-60 bg-gray-200"></div>
        <div className="absolute top-2 right-2 flex flex-col gap-2">
          <div className="w-9 h-9 rounded-full bg-gray-300"></div>
          <div className="w-9 h-9 rounded-full bg-gray-300"></div>
          <div className="w-9 h-9 rounded-full bg-gray-300"></div>
        </div>
        <div className="absolute top-2 left-2 bg-gray-300 text-transparent text-xs font-semibold px-2 py-1 rounded">
          XX% OFF
        </div>
      </div>
      <div className="p-4">
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="flex items-center mb-2">
          <div className="flex space-x-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 w-4 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-4 bg-gray-200 rounded w-6 ml-2"></div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <div className="h-5 bg-gray-200 rounded w-12"></div>
            <div className="h-5 bg-gray-200 rounded w-12"></div>
          </div>
          <div className="h-5 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
    </div>
  );
}
