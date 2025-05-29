const CategoryCardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-md animate-pulse">
      <div className="h-40 bg-gray-200 overflow-hidden"></div>
      <div className="p-4 bg-white text-center">
        <div className="h-5 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
        <div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    </div>
  );
};

export default CategoryCardSkeleton;
