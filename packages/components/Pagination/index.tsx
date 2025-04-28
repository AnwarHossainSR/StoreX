import { FC } from "react";

interface PaginationProps {
  totalEntries: number;
  currentPage: number;
  entriesPerPage: number;
  onPageChange: (page: number) => void;
}

export const Pagination: FC<PaginationProps> = ({
  totalEntries,
  currentPage,
  entriesPerPage,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const startEntry = (currentPage - 1) * entriesPerPage + 1;
  const endEntry = Math.min(currentPage * entriesPerPage, totalEntries);

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="px-6 py-4 border-t border-gray-200">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing {startEntry} to {endEntry} of {totalEntries} entries
        </div>
        <div className="flex items-center space-x-2">
          <button
            className={`px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 ${
              currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={handlePrevious}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <button
            className={`px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 ${
              currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={handleNext}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
