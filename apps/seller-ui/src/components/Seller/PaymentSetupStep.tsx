import { CreditCard } from "lucide-react";

interface PaymentSetupStepProps {
  formData: {
    accountType: string;
    country: string;
    currency: string;
  };
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  errors: Record<string, string>;
  handleSubmit: (e: React.FormEvent) => void;
}

export default function PaymentSetupStep({
  formData,
  handleChange,
  errors,
  handleSubmit,
}: PaymentSetupStepProps) {
  const countryOptions = [
    { value: "", label: "Select a country" },
    { value: "us", label: "United States" },
    { value: "ca", label: "Canada" },
    { value: "gb", label: "United Kingdom" },
    { value: "au", label: "Australia" },
    { value: "de", label: "Germany" },
    { value: "fr", label: "France" },
    { value: "jp", label: "Japan" },
    { value: "in", label: "India" },
    { value: "br", label: "Brazil" },
  ];

  const currencyOptions = [
    { value: "", label: "Select a currency" },
    { value: "usd", label: "USD - US Dollar" },
    { value: "cad", label: "CAD - Canadian Dollar" },
    { value: "gbp", label: "GBP - British Pound" },
    { value: "eur", label: "EUR - Euro" },
    { value: "aud", label: "AUD - Australian Dollar" },
    { value: "jpy", label: "JPY - Japanese Yen" },
    { value: "inr", label: "INR - Indian Rupee" },
    { value: "brl", label: "BRL - Brazilian Real" },
  ];

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <CreditCard className="h-5 w-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Connect with Stripe
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                To receive payments, you'll need to connect your account with
                Stripe. This secure process allows you to receive payments
                directly to your bank account.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Account Type
        </label>
        <div className="mt-2 space-y-2">
          <div className="flex items-center">
            <input
              id="accountType-individual"
              name="accountType"
              type="radio"
              value="individual"
              checked={formData.accountType === "individual"}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <label
              htmlFor="accountType-individual"
              className="ml-3 block text-sm font-medium text-gray-700"
            >
              Individual
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="accountType-business"
              name="accountType"
              type="radio"
              value="business"
              checked={formData.accountType === "business"}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <label
              htmlFor="accountType-business"
              className="ml-3 block text-sm font-medium text-gray-700"
            >
              Business
            </label>
          </div>
        </div>
      </div>

      <div>
        <label
          htmlFor="country"
          className="block text-sm font-medium text-gray-700"
        >
          Country
        </label>
        <div className="mt-1">
          <select
            id="country"
            name="country"
            required
            value={formData.country}
            onChange={handleChange}
            className={`appearance-none block w-full px-3 py-2 border ${
              errors.country ? "border-red-300" : "border-gray-300"
            } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            aria-invalid={!!errors.country}
            aria-describedby={errors.country ? "country-error" : undefined}
          >
            {countryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label
          htmlFor="currency"
          className="block text-sm font-medium text-gray-700"
        >
          Currency
        </label>
        <div className="mt-1">
          <select
            id="currency"
            name="currency"
            required
            value={formData.currency}
            onChange={handleChange}
            className={`appearance-none block w-full px-3 py-2 border ${
              errors.currency ? "border-red-300" : "border-gray-300"
            } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            aria-invalid={!!errors.currency}
            aria-describedby={errors.currency ? "currency-error" : undefined}
          >
            {currencyOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 border-t border-gray-200 pt-6">
        <div className="text-center">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            onClick={() =>
              window.alert("This would redirect to Stripe Connect")
            }
          >
            <svg
              className="w-5 h-5 mr-2"
              viewBox="0 0 468 222.5"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
            >
              <path d="M414 113.4c0-25.6-12.4-45.8-36.1-45.8-23.8 0-38.2 20.2-38.2 45.6 0 30.1 17 45.3 41.4 45.3 11.9 0 20.9-2.7 27.7-6.5v-20c-6.8 3.4-14.6 5.5-24.5 5.5-9.7 0-18.3-3.4-19.4-15.2h48.9c0-1.3.2-6.5.2-8.9zm-49.4-9.5c0-11.3 6.9-16 13.2-16 6.1 0 12.6 4.7 12.6 16h-25.8zM301.1 67.6c-9.8 0-16.1 4.6-19.6 7.8l-1.3-6.2h-22v116.6l25-5.3.1-28.3c3.6 2.6 8.9 6.3 17.7 6.3 17.9 0 34.2-14.4 34.2-46.1-.1-29-16.6-44.8-34.1-44.8zm-6 68.9c-5.9 0-9.4-2.1-11.8-4.7l-.1-37.1c2.6-2.9 6.2-4.9 11.9-4.9 9.1 0 15.4 10.2 15.4 23.3 0 13.4-6.2 23.4-15.4 23.4zM223.8 61.7l25.1-5.4V36l-25.1 5.3zM223.8 69.3h25.1v87.5h-25.1zM196.9 76.7l-1.6-7.4h-21.6v87.5h25V97.5c5.9-7.7 15.9-6.3 19-5.2v-23c-3.2-1.2-14.9-3.4-20.8 7.4zM146.9 47.6l-24.4 5.2-.1 80.1c0 14.8 11.1 25.7 25.9 25.7 8.2 0 14.2-1.5 17.5-3.3V135c-3.2 1.3-19 5.9-19-8.9V90.6h19V69.3h-19l.1-21.7zM79.3 94.7c0-3.9 3.2-5.4 8.5-5.4 7.6 0 17.2 2.3 24.8 6.4V72.2c-8.3-3.3-16.5-4.6-24.8-4.6C67.5 67.6 54 78.2 54 95.9c0 27.6 38 23.2 38 35.1 0 4.6-4 6.1-9.6 6.1-8.3 0-18.9-3.4-27.3-8v23.8c9.3 4 18.7 5.7 27.3 5.7 20.8 0 35.1-10.3 35.1-28.2-.1-29.8-38.2-24.5-38.2-35.7z" />
            </svg>
            Connect with Stripe
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-500 text-center">
          You'll be redirected to Stripe to complete the connection process
        </p>
      </div>

      <div className="border-t border-gray-200 pt-6 mt-6">
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Complete Setup
        </button>
      </div>
    </form>
  );
}
