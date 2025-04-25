interface ShopSetupStepProps {
  formData: {
    shopName: string;
    shopDescription: string;
    shopCategory: string;
    shopLocation: string;
  };
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  errors: Record<string, string>;
  handleSubmit: (e: React.FormEvent) => void;
}

export default function ShopSetupStep({
  formData,
  handleChange,
  errors,
  handleSubmit,
}: ShopSetupStepProps) {
  const categoryOptions = [
    { value: "", label: "Select a category" },
    { value: "electronics", label: "Electronics" },
    { value: "clothing", label: "Clothing" },
    { value: "home", label: "Home & Garden" },
    { value: "beauty", label: "Beauty & Personal Care" },
    { value: "sports", label: "Sports & Outdoors" },
    { value: "toys", label: "Toys & Games" },
    { value: "books", label: "Books & Media" },
    { value: "food", label: "Food & Grocery" },
    { value: "other", label: "Other" },
  ];

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <label
          htmlFor="shopName"
          className="block text-sm font-medium text-gray-700"
        >
          Shop Name
        </label>
        <div className="mt-1">
          <input
            id="shopName"
            name="shopName"
            type="text"
            required
            value={formData.shopName}
            onChange={handleChange}
            className={`appearance-none block w-full px-3 py-2 border ${
              errors.shopName ? "border-red-300" : "border-gray-300"
            } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            aria-invalid={!!errors.shopName}
            aria-describedby={errors.shopName ? "shopName-error" : undefined}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="shopDescription"
          className="block text-sm font-medium text-gray-700"
        >
          Shop Description
        </label>
        <div className="mt-1">
          <textarea
            id="shopDescription"
            name="shopDescription"
            rows={3}
            required
            value={formData.shopDescription}
            onChange={handleChange}
            className={`appearance-none block w-full px-3 py-2 border ${
              errors.shopDescription ? "border-red-300" : "border-gray-300"
            } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            aria-invalid={!!errors.shopDescription}
            aria-describedby={
              errors.shopDescription ? "shopDescription-error" : undefined
            }
          />
          <p className="mt-1 text-sm text-gray-500">
            Brief description of your shop and what you sell
          </p>
        </div>
      </div>

      <div>
        <label
          htmlFor="shopCategory"
          className="block text-sm font-medium text-gray-700"
        >
          Shop Category
        </label>
        <div className="mt-1">
          <select
            id="shopCategory"
            name="shopCategory"
            required
            value={formData.shopCategory}
            onChange={handleChange}
            className={`appearance-none block w-full px-3 py-2 border ${
              errors.shopCategory ? "border-red-300" : "border-gray-300"
            } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            aria-invalid={!!errors.shopCategory}
            aria-describedby={
              errors.shopCategory ? "shopCategory-error" : undefined
            }
          >
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label
          htmlFor="shopLocation"
          className="block text-sm font-medium text-gray-700"
        >
          Shop Location
        </label>
        <div className="mt-1">
          <input
            id="shopLocation"
            name="shopLocation"
            type="text"
            required
            value={formData.shopLocation}
            onChange={handleChange}
            className={`appearance-none block w-full px-3 py-2 border ${
              errors.shopLocation ? "border-red-300" : "border-gray-300"
            } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            aria-invalid={!!errors.shopLocation}
            aria-describedby={
              errors.shopLocation ? "shopLocation-error" : undefined
            }
          />
          <p className="mt-1 text-sm text-gray-500">City, Country or Region</p>
        </div>
      </div>

      <div className="py-3">
        <div className="flex items-center justify-end">
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Continue to Payment Setup
          </button>
        </div>
      </div>
    </form>
  );
}
