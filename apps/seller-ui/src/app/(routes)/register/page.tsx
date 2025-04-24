"use client";

import OtpInput from "@/components/Otp/OtpInput";
import AccountSetupStep from "@/components/Seller/AccountSetupStep";
import PaymentSetupStep from "@/components/Seller/PaymentSetupStep";
import ShopSetupStep from "@/components/Seller/ShopSetupStep";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAlert } from "@/hooks/useAlert";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SellerSignupPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showOtp, setShowOtp] = useState(false);
  const [formData, setFormData] = useState({
    // Account Information
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    // Shop Information
    shopName: "",
    shopDescription: "",
    shopCategory: "",
    shopLocation: "",
    // Payment Information
    accountType: "individual",
    country: "",
    currency: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [agreeTerms, setAgreeTerms] = useState(false);
  const { alert, setSuccess, setError, setInfo, clearAlert } = useAlert();
  const router = useRouter();

  // Mock auth states
  const [registerStatus, setRegisterStatus] = useState("idle");
  // @ts-ignore
  const [registerError, setRegisterError] = useState("");
  const [verifyOtpStatus, setVerifyOtpStatus] = useState("idle");
  const [verifyOtpError, setVerifyOtpError] = useState("");

  useEffect(() => {
    if (registerStatus === "success" && !showOtp) {
      setSuccess("Account created! Please verify your email.", {
        autoDismiss: 3000,
      });
      setShowOtp(true);
      setInfo(
        `A 6-digit code has been sent to ${formData.email}. Enter it below to verify your account.`
      );
    } else if (registerError) {
      setError(registerError, {
        details: { general: registerError },
        isBackendError: true,
      });
    }
  }, [
    registerStatus,
    registerError,
    showOtp,
    formData.email,
    setSuccess,
    setError,
    setInfo,
  ]);

  useEffect(() => {
    if (verifyOtpStatus === "success") {
      console.log("otp verified");
      setSuccess("Email verified! Continuing with shop setup...", {
        autoDismiss: 3000,
      });
      setRegisterStatus("idle");
      setShowOtp(false);
      setCurrentStep(2);
    } else if (verifyOtpError) {
      console.log("otp error", verifyOtpError);
      setError(verifyOtpError, {
        details: { otp: verifyOtpError },
        isBackendError: true,
      });
    }
  }, [verifyOtpStatus, verifyOtpError, setSuccess, setError]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  console.log("current step", currentStep);
  console.log("show otp", showOtp);

  const validateAccountForm = () => {
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

    if (!formData.password) {
      newErrors.password = "Please enter a password";
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
      isValid = false;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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
  };

  const validateShopForm = () => {
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
  };

  const validatePaymentForm = () => {
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
  };

  const handleAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateAccountForm()) {
      // Mock API call
      setRegisterStatus("pending");

      // Simulate API response
      setTimeout(() => {
        setRegisterStatus("success");
      }, 1500);
    }
  };

  const handleShopSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateShopForm()) {
      setSuccess("Shop information saved successfully!", { autoDismiss: 3000 });
      setCurrentStep(3);
    }
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validatePaymentForm()) {
      setSuccess("Account setup completed! Redirecting to dashboard...", {
        autoDismiss: 3000,
      });

      // Simulate redirect to dashboard
      setTimeout(() => {
        router.push("/seller/dashboard");
      }, 3000);
    }
  };

  const handleOtpSubmit = (otp: string) => {
    setVerifyOtpStatus("pending");

    // Simulate OTP verification
    setTimeout(() => {
      if (otp === "123456") {
        // For demo purposes
        setVerifyOtpStatus("success");
      } else {
        setVerifyOtpError("Invalid verification code. Please try again.");
        setVerifyOtpStatus("error");
      }
    }, 1500);
  };

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
              href="/"
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
                    isPending={registerStatus === "pending"}
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
                  type="register"
                  name={`${formData.firstName} ${formData.lastName}`}
                  password={formData.password}
                  onSubmit={handleOtpSubmit}
                  isVerifyOtpPending={verifyOtpStatus === "pending"}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
