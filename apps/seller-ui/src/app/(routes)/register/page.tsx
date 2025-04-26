"use client";

import OtpInput from "@/components/Otp/OtpInput";
import AccountSetupStep from "@/components/Seller/AccountSetupStep";
import PaymentSetupStep from "@/components/Seller/PaymentSetupStep";
import ShopSetupStep from "@/components/Seller/ShopSetupStep";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAlert } from "@/hooks/useAlert";
import { useAuth } from "@/hooks/useAuth";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";

export default function SellerSignupPage() {
  // Use custom localStorage hook
  const [currentStep, setCurrentStep] = useLocalStorage<number>(
    "sellerSignup_step",
    1
  );
  const [showOtp, setShowOtp] = useLocalStorage<boolean>(
    "sellerSignup_showOtp",
    false
  );
  const [sellerId, setSellerId] = useLocalStorage<string | null>(
    "sellerSignup_sellerId",
    null
  );
  const [formData, setFormData] = useLocalStorage<{
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
    country: string;
    name: string;
    bio: string;
    address: string;
    opening_hour: string;
    website: string;
    category: string;
    accountType: string;
    currency: string;
  }>("sellerSignup_formData", {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    country: "",
    name: "",
    bio: "",
    address: "",
    opening_hour: "",
    website: "",
    category: "",
    accountType: "individual",
    currency: "",
  });

  const [errors, setErrors] = useLocalStorage<Record<string, string>>(
    "sellerSignup_errors",
    {}
  );
  const [agreeTerms, setAgreeTerms] = useLocalStorage<boolean>(
    "sellerSignup_agreeTerms",
    false
  );
  const {
    sellerRegister,
    sellerRegisterStatus,
    sellerRegisterError,
    sellerRegisterErrorDetails,
    verifySellerOtp,
    verifySellerOtpStatus,
    verifySellerOtpError,
    verifySellerOtpErrorDetails,
    resetSellerRegister,
    createShop,
    createShopStatus,
    createShopError,
    createShopErrorDetails,
    sellerId: authSellerId,
    seller: authSeller,
    createStripeConnectAccount,
    createStripeConnectAccountStatus,
    createStripeConnectAccountError,
    createStripeConnectAccountErrorDetails,
  } = useAuth();
  const { alert, setSuccess, setError, setInfo, clearAlert } = useAlert();
  const router = useRouter();

  // Debug localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      console.log("localStorage on mount:", {
        step: localStorage.getItem("sellerSignup_step"),
        showOtp: localStorage.getItem("sellerSignup_showOtp"),
        sellerId: localStorage.getItem("sellerSignup_sellerId"),
        formData: localStorage.getItem("sellerSignup_formData"),
        agreeTerms: localStorage.getItem("sellerSignup_agreeTerms"),
        errors: localStorage.getItem("sellerSignup_errors"),
      });
      console.log("Current state:", {
        currentStep,
        showOtp,
        sellerId,
        formData,
        agreeTerms,
        errors,
      });
    }
  }, []);

  // Handle seller registration status
  useEffect(() => {
    console.log("sellerRegisterStatus:", sellerRegisterStatus);
    console.log("sellerRegisterError:", sellerRegisterError);
    console.log("showOtp:", showOtp);
    console.log("currentStep:", currentStep);

    if (sellerRegisterStatus === "success" && !showOtp && currentStep === 1) {
      console.log("Triggering OTP screen");
      setSuccess("Account created! Please verify your email.", {
        autoDismiss: 3000,
      });
      setShowOtp(true);
      setInfo(
        `A 6-digit code has been sent to ${formData.email}. Enter it below to verify your account.`
      );
    } else if (sellerRegisterError) {
      setError(sellerRegisterError, {
        details: sellerRegisterErrorDetails,
        isBackendError: true,
      });
    }
  }, [
    sellerRegisterStatus,
    sellerRegisterError,
    sellerRegisterErrorDetails,
    showOtp,
    currentStep,
    formData.email,
    setSuccess,
    setError,
    setInfo,
  ]);

  // Handle OTP verification status
  useEffect(() => {
    console.log("verifySellerOtpStatus:", verifySellerOtpStatus);
    console.log("verifySellerOtpError:", verifySellerOtpError);
    console.log("authSellerId:", authSellerId);
    console.log("authSeller:", authSeller);

    if (verifySellerOtpStatus === "success") {
      console.log("OTP verification successful, transitioning to shop setup");
      setSuccess("Email verified! Continuing with shop setup...", {
        autoDismiss: 3000,
      });
      // Store sellerId from verifySellerOtp response
      if (authSellerId) {
        setSellerId(authSellerId);
      } else {
        console.error("No sellerId received from verifySellerOtp");
        setError("Failed to retrieve seller ID. Please try again.");
      }
      // Pre-fill formData with seller details if available
      if (authSeller) {
        setFormData((prev) => ({
          ...prev,
          firstName: authSeller.name.split(" ")[0] || prev.firstName,
          lastName:
            authSeller.name.split(" ").slice(1).join(" ") || prev.lastName,
          email: authSeller.email || prev.email,
          phone: authSeller.phone_number || prev.phone,
          country: authSeller.country || prev.country,
        }));
      }
      setTimeout(() => {
        console.log("Setting showOtp to false and currentStep to 2");
        setShowOtp(false);
        setCurrentStep(2);
      }, 3000);
    } else if (verifySellerOtpError) {
      setError(verifySellerOtpError, {
        details: verifySellerOtpErrorDetails,
        isBackendError: true,
      });
    }
  }, [
    verifySellerOtpStatus,
    verifySellerOtpError,
    verifySellerOtpErrorDetails,
    authSellerId,
    authSeller,
    setSuccess,
    setError,
    setSellerId,
    setShowOtp,
    setCurrentStep,
    setFormData,
  ]);

  // Handle shop creation status
  useEffect(() => {
    console.log("createShopStatus:", createShopStatus);
    console.log("createShopError:", createShopError);

    if (createShopStatus === "success") {
      console.log("Shop created successfully, transitioning to payment setup");
      setSuccess("Shop created successfully!", {
        autoDismiss: 3000,
      });
      setTimeout(() => {
        setCurrentStep(3);
      }, 3000);
    } else if (createShopError) {
      setError(createShopError, {
        details: createShopErrorDetails,
        isBackendError: true,
      });
    }
  }, [
    createShopStatus,
    createShopError,
    createShopErrorDetails,
    setSuccess,
    setError,
    setCurrentStep,
  ]);

  // Handle Stripe Connect errors
  useEffect(() => {
    if (createStripeConnectAccountError) {
      setError(createStripeConnectAccountError, {
        details: createStripeConnectAccountErrorDetails,
        isBackendError: true,
      });
    }
  }, [
    createStripeConnectAccountError,
    createStripeConnectAccountErrorDetails,
    setError,
  ]);

  const handleChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    [setFormData]
  );

  const validateAccountForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (!formData.firstName.trim()) {
      newErrors.firstName = "Please enter your first name";
      isValid = false;
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Please enter your last name";
      isValid = false;
    }

    if (!formData.email) {
      newErrors.email = "Please enter your email address";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (!formData.phone) {
      newErrors.phone = "Please enter your phone number";
      isValid = false;
    } else if (
      !/^\+?[0-9]{10,15}$/.test(formData.phone.replace(/[\s()-]/g, ""))
    ) {
      newErrors.phone = "Please enter a valid phone number";
      isValid = false;
    }

    if (!formData.country) {
      newErrors.country = "Please select your country";
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = "Please enter a password";
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
      isValid = false;
    }

    if (!agreeTerms) {
      newErrors.terms = "You must agree to the seller terms and conditions";
      isValid = false;
    }

    setErrors(newErrors);
    if (!isValid) {
      setError("Please correct the following errors:", { details: newErrors });
    } else {
      clearAlert();
    }
    return isValid;
  }, [formData, agreeTerms, setError, clearAlert, setErrors]);

  const validateShopForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = "Please enter your shop name";
      isValid = false;
    }

    if (!formData.bio.trim()) {
      newErrors.bio = "Please enter your shop bio";
      isValid = false;
    }

    if (!formData.address.trim()) {
      newErrors.address = "Please enter your shop address";
      isValid = false;
    }

    if (!formData.opening_hour.trim()) {
      newErrors.opening_hour = "Please enter your shop opening hours";
      isValid = false;
    }

    if (
      formData.website &&
      !/^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/.*)?$/.test(formData.website)
    ) {
      newErrors.website = "Please enter a valid website URL";
      isValid = false;
    }

    if (!formData.category) {
      newErrors.category = "Please select a category for your shop";
      isValid = false;
    }

    if (!sellerId) {
      newErrors.sellerId = "Seller ID is missing";
      isValid = false;
    }

    setErrors(newErrors);
    if (!isValid) {
      setError("Please correct the following errors:", { details: newErrors });
    } else {
      clearAlert();
    }
    return isValid;
  }, [formData, sellerId, setError, clearAlert, setErrors]);

  const validatePaymentForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    setErrors(newErrors);
    if (!isValid) {
      setError("Please correct the following errors:", { details: newErrors });
    } else {
      clearAlert();
    }
    return isValid;
  }, [formData, setError, clearAlert, setErrors]);

  const handleAccountSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (validateAccountForm()) {
        console.log("Submitting seller registration:", {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          password: formData.password,
          phone_number: formData.phone,
          country: formData.country,
        });
        sellerRegister({
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          password: formData.password,
          phone_number: formData.phone,
          country: formData.country,
        });
      }
    },
    [formData, validateAccountForm, sellerRegister]
  );

  const handleShopSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (validateShopForm() && sellerId) {
        console.log("Submitting shop creation:", {
          sellerId,
          name: formData.name,
          bio: formData.bio,
          address: formData.address,
          opening_hour: formData.opening_hour,
          website: formData.website,
          category: formData.category,
        });
        createShop({
          sellerId,
          name: formData.name,
          bio: formData.bio,
          address: formData.address,
          opening_hour: formData.opening_hour,
          website: formData.website || undefined,
          category: formData.category,
        });
      }
    },
    [formData, validateShopForm, createShop, sellerId]
  );

  const handlePaymentSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (validatePaymentForm()) {
        setSuccess("Account setup completed! Redirecting to login...", {
          autoDismiss: 3000,
        });

        setTimeout(() => {
          // Clear all localStorage keys
          localStorage.removeItem("sellerSignup_step");
          localStorage.removeItem("sellerSignup_showOtp");
          localStorage.removeItem("sellerSignup_sellerId");
          localStorage.removeItem("sellerSignup_formData");
          localStorage.removeItem("sellerSignup_agreeTerms");
          localStorage.removeItem("sellerSignup_errors");
          router.push("/");
        }, 3000);
      }
    },
    [validatePaymentForm, setSuccess, router]
  );

  const handleOtpSubmit = useCallback(
    (otp: string) => {
      console.log("Submitting OTP:", otp);
      verifySellerOtp({
        email: formData.email,
        otp,
        password: formData.password,
        name: `${formData.firstName} ${formData.lastName}`,
        phone_number: formData.phone,
        country: formData.country,
      });
    },
    [formData, verifySellerOtp]
  );

  return (
    <div className="h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="mt-1 text-center text-3xl font-bold tracking-tight text-gray-900">
            {showOtp
              ? "Verify Your Email"
              : currentStep === 1
              ? "Create Seller Account"
              : currentStep === 2
              ? "Set Up Your Shop"
              : "Connect Payment Method"}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have a seller account?{" "}
            <Link
              href="/auth/seller/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign in
            </Link>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {alert && (
              <Alert
                variant={alert.variant}
                className="mb-4"
                autoDismiss={alert.autoDismiss}
                onDismiss={clearAlert}
                details={alert.details}
              >
                <AlertTitle>{alert.title}</AlertTitle>
                <AlertDescription>{alert.message}</AlertDescription>
              </Alert>
            )}

            {!showOtp ? (
              <>
                {/* Progress indicator */}
                <div className="mb-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${
                          currentStep >= 1 ? "bg-blue-600" : "bg-gray-300"
                        } text-white`}
                      >
                        {currentStep > 1 ? "✓" : "1"}
                      </div>
                      <div
                        className={`ml-2 text-sm ${
                          currentStep === 1
                            ? "font-medium text-gray-900"
                            : "text-gray-500"
                        }`}
                      >
                        Account
                      </div>
                    </div>
                    <div
                      className={`flex-1 border-t border-gray-300 mx-4`}
                    ></div>
                    <div className="flex items-center">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${
                          currentStep >= 2 ? "bg-blue-600" : "bg-gray-300"
                        } text-white`}
                      >
                        {currentStep > 2 ? "✓" : "2"}
                      </div>
                      <div
                        className={`ml-2 text-sm ${
                          currentStep === 2
                            ? "font-medium text-gray-900"
                            : "text-gray-500"
                        }`}
                      >
                        Shop
                      </div>
                    </div>
                    <div
                      className={`flex-1 border-t border-gray-300 mx-4`}
                    ></div>
                    <div className="flex items-center">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${
                          currentStep >= 3 ? "bg-blue-600" : "bg-gray-300"
                        } text-white`}
                      >
                        3
                      </div>
                      <div
                        className={`ml-2 text-sm ${
                          currentStep === 3
                            ? "font-medium text-gray-900"
                            : "text-gray-500"
                        }`}
                      >
                        Payment
                      </div>
                    </div>
                  </div>
                </div>

                {currentStep === 1 && (
                  <AccountSetupStep
                    formData={formData}
                    handleChange={handleChange}
                    errors={errors}
                    agreeTerms={agreeTerms}
                    setAgreeTerms={setAgreeTerms}
                    handleSubmit={handleAccountSubmit}
                    isPending={sellerRegisterStatus === "pending"}
                  />
                )}

                {currentStep === 2 && (
                  <ShopSetupStep
                    formData={formData}
                    handleChange={handleChange}
                    errors={errors}
                    handleSubmit={handleShopSubmit}
                  />
                )}

                {currentStep === 3 && (
                  <PaymentSetupStep
                    setErrors={setErrors}
                    handleSubmit={handlePaymentSubmit}
                    sellerId={sellerId}
                    createStripeConnectAccount={createStripeConnectAccount}
                    createStripeConnectAccountStatus={
                      createStripeConnectAccountStatus
                    }
                    createStripeConnectAccountError={
                      createStripeConnectAccountError
                    }
                  />
                )}
              </>
            ) : (
              <div className="space-y-6">
                <OtpInput
                  email={formData.email}
                  type="seller-register"
                  name={`${formData.firstName} ${formData.lastName}`}
                  password={formData.password}
                  phone_number={formData.phone}
                  country={formData.country}
                  onSubmit={handleOtpSubmit}
                  isVerifyOtpPending={verifySellerOtpStatus === "pending"}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
