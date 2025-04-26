import { UseMutateFunction } from "@tanstack/react-query";
import { CreditCard, Loader2 } from "lucide-react";
import { ChangeEvent } from "react";

// Define ApiResponse type (adjust based on your backend response)
interface ApiResponse<T> {
  message: string;
  data?: T;
  accountLink?: string;
}

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
  setErrors: (errors: Record<string, string>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  sellerId: string | null;
  createStripeConnectAccount: UseMutateFunction<
    ApiResponse<never>,
    Error,
    { sellerId: string; country: string; currency: string },
    unknown
  >;
  createStripeConnectAccountStatus: "idle" | "pending" | "success" | "error";
  createStripeConnectAccountError: string | undefined;
}

export default function PaymentSetupStep({
  formData,
  handleChange,
  errors,
  setErrors,
  handleSubmit,
  sellerId,
  createStripeConnectAccount,
  createStripeConnectAccountStatus,
  createStripeConnectAccountError,
}: PaymentSetupStepProps) {
  const handleStripeConnect = () => {
    const newErrors: Record<string, string> = {};
    if (!sellerId) {
      newErrors.sellerId = "Seller ID is required.";
      setErrors(newErrors);
      window.alert("Seller ID is missing. Please restart the signup process.");
      return;
    }
    if (!formData.country) {
      newErrors.country = "Please select your country";
      setErrors(newErrors);
      return;
    }
    if (!formData.currency) {
      newErrors.currency = "Please select your currency";
      setErrors(newErrors);
      return;
    }
    console.log(
      "Initiating Stripe Connect for sellerId:",
      sellerId,
      "with country:",
      formData.country,
      "and currency:",
      formData.currency
    );
    createStripeConnectAccount({
      sellerId,
      country: formData.country,
      currency: formData.currency,
    });
  };

  // Debug onChange to confirm it's called
  const onChangeHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    console.log(
      `PaymentSetupStep: onChange for ${e.target.name} with value ${e.target.value}`
    );
    handleChange(e);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          Payment Information
        </h3>
        <p className="mt-1 text-sm text-gray-600">
          Connect your Stripe account to receive payments securely. Select your
          country and preferred currency below.
        </p>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Country Dropdown */}
        <div>
          <label
            htmlFor="country"
            className="block text-sm font-medium text-gray-700"
          >
            Country
          </label>
          <select
            id="country"
            name="country"
            value={formData.country}
            onChange={onChangeHandler}
            className={`mt-1 block w-full rounded-md border ${
              errors.country ? "border-red-500" : "border-gray-300"
            } bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm`}
          >
            <option value="">Select a country</option>
            <option value="US">United States</option>
            <option value="GB">United Kingdom</option>
            <option value="CA">Canada</option>
            <option value="AU">Australia</option>
            <option value="FR">France</option>
            <option value="DE">Germany</option>
            {/* Add more countries as needed */}
          </select>
          {errors.country && (
            <p className="mt-1 text-sm text-red-600">{errors.country}</p>
          )}
        </div>

        {/* Currency Dropdown */}
        <div>
          <label
            htmlFor="currency"
            className="block text-sm font-medium text-gray-700"
          >
            Currency
          </label>
          <select
            id="currency"
            name="currency"
            value={formData.currency}
            onChange={onChangeHandler}
            className={`mt-1 block w-full rounded-md border ${
              errors.currency ? "border-red-500" : "border-gray-300"
            } bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm`}
          >
            <option value="">Select a currency</option>
            <option value="USD">USD - US Dollar</option>
            <option value="GBP">GBP - British Pound</option>
            <option value="CAD">CAD - Canadian Dollar</option>
            <option value="AUD">AUD - Australian Dollar</option>
            <option value="EUR">EUR - Euro</option>
            {/* Add more currencies as needed */}
          </select>
          {errors.currency && (
            <p className="mt-1 text-sm text-red-600">{errors.currency}</p>
          )}
        </div>
      </div>

      {/* Stripe Connect Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <CreditCard className="h-5 w-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Connect with Stripe
            </h3>
            <p className="mt-2 text-sm text-blue-700">
              Securely connect your account with Stripe to receive payments
              directly to your bank account. You'll be redirected to Stripe to
              complete the setup.
            </p>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="space-y-4">
        {/* Connect with Stripe Button */}
        <button
          type="button"
          onClick={handleStripeConnect}
          disabled={createStripeConnectAccountStatus === "pending"}
          className={`w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200`}
        >
          {createStripeConnectAccountStatus === "pending" ? (
            <>
              <Loader2 className="animate-spin h-5 w-5 mr-2" />
              Connecting...
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5 mr-2"
                viewBox="0 0 468 222.5"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
              >
                <path d="M414 113.4c0-25.6-12.4-45.8-36.1-45.8-23.8 0-38.2 20.2-38.2 45.6 0 30.1 17 45.3 41.4 45.3 11.9 0 20.9-2.7 27.7-6.5v-20c-6.8 3.4-14.6 5.5-24.5 5.5-9.7 0-18.3-3.4-19.4-15.2h48.9c0-1.3.2-6.5.2-8.9zm-49.4-9.5c0-11.3 6.9-16 13.2-16 6.1 0 12.6 4.7 12.6 16h-25.8zM301.1 67.6c-9.8 0-16.1 4.6-19.6 7.8l-1.3-6.2h-22v116.6l25-5.3.1-28.3c3.6 2.6 8.9 6.3 17.7 6.3 17.9 0 34.2-14.4 34.2-46.1-.1-29-16.6-44.8-34.1-44.8zm-6 68.9c-5.9 0-9.4-2.1-11.8-4.7l-.1-37.1c2.6-2.9 6.2-4.9 11.9-4.9 9.1 0 15.4 10.2 15.4 23.3 0 13.4-6.2 23.4-15.4 23.4zM223.8 61.7l25.1-5.4V36l-25.1 5.3zM223.8 69.3h25.1v87.5h-25.1zM196.9 76.7l-1.6-7.4h-21.6v87.5h25V97.5c5.9-7.7 15.9-6.3 19-5.2v-23c-3.2-1.2-14.9-3.4-20.8 7.4zM146.9 47.6l-24.4 5.2-.1 80.1c0 14.8 11.1 25.7 25.9 25.7 8.2 0 14.2-1.5 17.5-3.3V135c-3.2 1.3-19 5.9-19-8.9V90.6h19V69.3h-19l.1-21.7zM79.3 94.7c0-3.9 3.2-5.4 8.5-5.4 7.6 0 17.2 2.3 24.8 6.4V72.2c-8.3-3.3-16.5-4.6-24.8-4.6C67.5 67.6 54 78.2 54 95.9c0 27.6 38 23.2 38 35.1 0 4.6-4 6.1-9.6 6.1-8.3 0-18.9-3.4-27.3-8v23.8c9.3 4 18.7 5.7 27.3 5.7 20.8 0 35.1-10.3 35.1-28.2-.1-29.8-38.2-24.5-38.2-35.7z" />
              </svg>
              Connect with Stripe
            </>
          )}
        </button>

        {/* Complete Setup Button */}
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
          Complete Setup
        </button>
      </div>
    </form>
  );
}
