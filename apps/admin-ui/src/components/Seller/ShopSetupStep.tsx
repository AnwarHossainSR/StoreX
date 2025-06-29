interface ShopSetupStepProps {
  formData: {
    name: string;
    bio: string;
    address: string;
    opening_hour: string;
    website: string;
    category: string;
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
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Shop Name
        </label>
        <div className="mt-1">
          <input
            id="name"
            name="name"
            type="text"
            required
            value={formData.name}
            onChange={handleChange}
            className={`appearance-none block w-full px-3 py-2 border ${
              errors.name ? "border-red-300" : "border-gray-300"
            } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="bio"
          className="block text-sm font-medium text-gray-700"
        >
          Shop Bio
        </label>
        <div className="mt-1">
          <textarea
            id="bio"
            name="bio"
            rows={2}
            required
            value={formData.bio}
            onChange={handleChange}
            className={`appearance-none block w-full px-3 py-2 border ${
              errors.bio ? "border-red-300" : "border-gray-300"
            } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            aria-invalid={!!errors.bio}
            aria-describedby={errors.bio ? "bio-error" : undefined}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="address"
          className="block text-sm font-medium text-gray-700"
        >
          Shop Address
        </label>
        <div className="mt-1">
          <input
            id="address"
            name="address"
            type="text"
            required
            value={formData.address}
            onChange={handleChange}
            className={`appearance-none block w-full px-3 py-2 border ${
              errors.address ? "border-red-300" : "border-gray-300"
            } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            aria-invalid={!!errors.address}
            aria-describedby={errors.address ? "address-error" : undefined}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="opening_hour"
          className="block text-sm font-medium text-gray-700"
        >
          Opening Hours
        </label>
        <div className="mt-1">
          <input
            id="opening_hour"
            name="opening_hour"
            type="text"
            required
            value={formData.opening_hour}
            onChange={handleChange}
            className={`appearance-none block w-full px-3 py-2 border ${
              errors.opening_hour ? "border-red-300" : "border-gray-300"
            } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            aria-invalid={!!errors.opening_hour}
            aria-describedby={
              errors.opening_hour ? "opening_hour-error" : undefined
            }
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="website"
          className="block text-sm font-medium text-gray-700"
        >
          Website (Optional)
        </label>
        <div className="mt-1">
          <input
            id="website"
            name="website"
            type="url"
            value={formData.website}
            onChange={handleChange}
            className={`appearance-none block w-full px-3 py-2 border ${
              errors.website ? "border-red-300" : "border-gray-300"
            } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            aria-invalid={!!errors.website}
            aria-describedby={errors.website ? "website-error" : undefined}
          />
          <p className="mt-1 text-sm text-gray-500">
            e.g., https://yourshop.com
          </p>
        </div>
      </div>

      <div>
        <label
          htmlFor="category"
          className="block text-sm font-medium text-gray-700"
        >
          Shop Category
        </label>
        <div className="mt-1">
          <select
            id="category"
            name="category"
            required
            value={formData.category}
            onChange={handleChange}
            className={`appearance-none block w-full px-3 py-2 border ${
              errors.category ? "border-red-300" : "border-gray-300"
            } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            aria-invalid={!!errors.category}
            aria-describedby={errors.category ? "category-error" : undefined}
          >
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
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
