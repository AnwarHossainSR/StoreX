interface DiscountCode {
  id: string;
  public_name: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  discountCode: string;
  createdAt: string;
}
export const DiscountCodeSelector: React.FC<{
  discountCodes: DiscountCode[];
  selectedCodes: string[];
  onChange: (selected: string[]) => void;
  disabled?: boolean;
}> = ({ discountCodes = [], selectedCodes, onChange, disabled = false }) => {
  const handleToggle = (codeId: string) => {
    if (disabled) return;
    if (selectedCodes.includes(codeId)) {
      onChange(selectedCodes.filter((id) => id !== codeId));
    } else {
      onChange([...selectedCodes, codeId]);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Discount Codes
      </label>
      <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2">
        {discountCodes.length === 0 ? (
          <span className="inline-block px-3 py-1 text-sm text-gray-500 bg-gray-100 rounded-full">
            No discount codes available
          </span>
        ) : (
          discountCodes.map((code) => (
            <span
              key={code.id}
              className={`inline-block px-3 py-1 text-sm font-medium rounded-full cursor-pointer transition-colors ${
                selectedCodes.includes(code.id)
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={() => handleToggle(code.id)}
            >
              {code.public_name} (
              {code.discountType === "percentage"
                ? `${code.discountValue}%`
                : `$${code.discountValue}`}
              )
            </span>
          ))
        )}
      </div>
    </div>
  );
};
