"use client";

import OtpInput from "@/components/Otp/OtpInput";
import AccountSetupStep from "@/components/Seller/AccountSetupStep";
import PaymentSetupStep from "@/components/Seller/PaymentSetupStep";
import ShopSetupStep from "@/components/Seller/ShopSetupStep";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAlert } from "@/hooks/useAlert";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function SellerSignupPage() {
  // Initialize state from localStorage
  const [currentStep, setCurrentStep] = useState(() => {
    if (typeof window !== "undefined") {
      const savedStep = localStorage.getItem("sellerSignupStep");
      return savedStep ? parseInt(savedStep, 10) : 1;
    }
    return 1;
  });
  const [showOtp, setShowOtp] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sellerSignupShowOtp") === "true";
    }
    return false;
  });
  const [formData, setFormData] = useState({
    // Account Information
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    country: "",
    // Shop Information
    shopName: "",
    shopDescription: "",
    shopCategory: "",
    shopLocation: "",
    // Payment Information
    accountType: "individual",
    currency: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [agreeTerms, setAgreeTerms] = useState(false);
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
  } = useAuth();
  const { alert, setSuccess, setError, setInfo, clearAlert } = useAlert();
  const router = useRouter();

  // Persist currentStep and showOtp to localStorage
  useEffect(() => {
    localStorage.setItem("sellerSignupStep", currentStep.toString());
    localStorage.setItem("sellerSignupShowOtp", showOtp.toString());
  }, [currentStep, showOtp]);

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

    if (verifySellerOtpStatus === "success") {
      console.log("OTP verification successful, transitioning to shop setup");
      setSuccess("Email verified! Continuing with shop setup...", {
        autoDismiss: 3000,
      });
      setTimeout(() => {
        console.log("Setting showOtp to false and currentStep to 2");
        setShowOtp(false);
        setCurrentStep(2);
        resetSellerRegister();
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
    setSuccess,
    setError,
    resetSellerRegister,
  ]);

  // Clear localStorage on signup completion
  // @ts-ignore
  useEffect(() => {
    if (currentStep === 3 && !showOtp) {
      // Clear localStorage when payment step is reached and submitted
      const handleCompletion = () => {
        localStorage.removeItem("sellerSignupStep");
        localStorage.removeItem("sellerSignupShowOtp");
      };
      window.addEventListener("beforeunload", handleCompletion);
      return () => window.removeEventListener("beforeunload", handleCompletion);
    }
  }, [currentStep, showOtp]);

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
    []
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
  }, [formData, agreeTerms, setError, clearAlert]);

  const validateShopForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (!formData.shopName.trim()) {
      newErrors.shopName = "Please enter your shop name";
      isValid = false;
    }

    if (!formData.shopDescription.trim()) {
      newErrors.shopDescription = "Please enter your shop description";
      isValid = false;
    }

    if (!formData.shopCategory) {
      newErrors.shopCategory = "Please select a category for your shop";
      isValid = false;
    }

    if (!formData.shopLocation.trim()) {
      newErrors.shopLocation = "Please enter your shop location";
      isValid = false;
    }

    setErrors(newErrors);
    if (!isValid) {
      setError("Please correct the following errors:", { details: newErrors });
    } else {
      clearAlert();
    }
    return isValid;
  }, [formData, setError, clearAlert]);

  const validatePaymentForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (!formData.country) {
      newErrors.country = "Please select your country";
      isValid = false;
    }

    if (!formData.currency) {
      newErrors.currency = "Please select your currency";
      isValid = false;
    }

    setErrors(newErrors);
    if (!isValid) {
      setError("Please correct the following errors:", { details: newErrors });
    } else {
      clearAlert();
    }
    return isValid;
  }, [formData, setError, clearAlert]);

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

      if (validateShopForm()) {
        setSuccess("Shop information saved successfully!", {
          autoDismiss: 3000,
        });
        setCurrentStep(3);
      }
    },
    [validateShopForm, setSuccess]
  );

  const handlePaymentSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (validatePaymentForm()) {
        setSuccess("Account setup completed! Redirecting to dashboard...", {
          autoDismiss: 3000,
        });

        setTimeout(() => {
          // Clear localStorage on completion
          localStorage.removeItem("sellerSignupStep");
          localStorage.removeItem("sellerSignupShowOtp");
          router.push("/seller/dashboard");
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
                    formData={formData}
                    handleChange={handleChange}
                    errors={errors}
                    handleSubmit={handlePaymentSubmit}
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
