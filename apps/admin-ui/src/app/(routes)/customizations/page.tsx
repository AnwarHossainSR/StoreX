"use client";

import {
  Camera,
  CreditCard,
  Eye,
  Globe,
  Mail,
  Plus,
  Save,
  Settings,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<any>({
    siteName: "E-Shop",
    siteDescription: "Your one-stop shopping destination",
    adminEmail: "admin@example.com",
    supportEmail: "support@example.com",
    phoneNumber: "+1 234 567 890",
    address: "123 E-commerce Street, Digital City, 10001",
    currency: "USD",
    timezone: "UTC",
  });

  const [appearanceData, setAppearanceData] = useState<any>({
    logo: "https://images.pexels.com/photos/1005638/pexels-photo-1005638.jpeg",
    favicon:
      "https://images.pexels.com/photos/1005638/pexels-photo-1005638.jpeg",
  });

  const [emailData, setEmailData] = useState<any>({
    smtpHost: "smtp.example.com",
    smtpPort: 587,
    smtpUsername: "username@example.com",
    smtpPassword: "",
    smtpEncryption: "TLS",
  });

  const [paymentData, setPaymentData] = useState<any>({
    stripePublicKey: "",
    stripeSecretKey: "",
    webhookSecret: "",
    testMode: false,
  });

  const [categories, setCategories] = useState<any>([
    "Electronics",
    "Fashion",
    "Home & Kitchen",
    "Sports & Fitness",
    "Health & Beauty",
  ]);

  const [subCategories, setSubCategories] = useState<any>({
    Electronics: ["Laptops", "Mobiles", "Tablets"],
    Fashion: ["Mens", "Womens", "Kids"],
    "Home & Kitchen": ["Kitchen", "Dining", "Bedroom"],
    "Sports & Fitness": ["Fitness", "Gym", "Outdoor"],
    "Health & Beauty": ["Skin Care", "Hair Care", "Body Care"],
  });

  const [newCategory, setNewCategory] = useState("");
  const [newSubCategory, setNewSubCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(categories[0] || "");

  const tabs = [
    { id: "general", label: "General", icon: Settings },
    { id: "appearance", label: "Appearance", icon: Eye },
    { id: "email", label: "Email", icon: Mail },
    { id: "payment", label: "Payment", icon: CreditCard },
    { id: "categories", label: "Categories", icon: Globe },
  ];

  const handleChange = (e: any, dataType = "general") => {
    const { name, value, type, checked } = e.target;
    const actualValue = type === "checkbox" ? checked : value;

    switch (dataType) {
      case "general":
        setFormData((prev: any) => ({ ...prev, [name]: actualValue }));
        break;
      case "appearance":
        setAppearanceData((prev: any) => ({ ...prev, [name]: actualValue }));
        break;
      case "email":
        setEmailData((prev: any) => ({ ...prev, [name]: actualValue }));
        break;
      case "payment":
        setPaymentData((prev: any) => ({ ...prev, [name]: actualValue }));
        break;
    }
  };

  const handleCategoryAdd = (e: any) => {
    e.preventDefault();
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      setSubCategories({ ...subCategories, [newCategory]: [] });
      setNewCategory("");
    }
  };

  const handleSubCategoryAdd = (e: any) => {
    e.preventDefault();
    if (
      newSubCategory &&
      selectedCategory &&
      !subCategories[selectedCategory]?.includes(newSubCategory)
    ) {
      setSubCategories({
        ...subCategories,
        [selectedCategory]: [
          ...(subCategories[selectedCategory] || []),
          newSubCategory,
        ],
      });
      setNewSubCategory("");
    }
  };

  const handleCategoryDelete = (category: string) => {
    setCategories(categories.filter((cat: string) => cat !== category));
    const newSubCategories = { ...subCategories };
    delete newSubCategories[category];
    setSubCategories(newSubCategories);
    if (selectedCategory === category) {
      setSelectedCategory(categories[0] || "");
    }
  };

  const handleSubCategoryDelete = (subCategory: string) => {
    setSubCategories({
      ...subCategories,
      [selectedCategory]: subCategories[selectedCategory].filter(
        (sub: string) => sub !== subCategory
      ),
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const configData = {
        general: formData,
        appearance: appearanceData,
        email: emailData,
        payment: paymentData,
        categories: { categories, subCategories },
      };

      console.log("Settings updated:", configData);

      // Show success message (you can implement toast notifications)
      alert("Settings updated successfully!");
    } catch (error) {
      console.error("Error updating settings:", error);
      alert("Error updating settings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (categories.length > 0 && !categories.includes(selectedCategory)) {
      setSelectedCategory(categories[0]);
    }
  }, [categories, selectedCategory]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Platform Customize
              </h1>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">
                  System Online
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Navigation Tabs */}
          <div className="border-b border-gray-200/50 bg-gradient-to-r from-white to-gray-50/50">
            <nav className="flex overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    className={`group relative px-8 py-6 text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                      activeTab === tab.id
                        ? "text-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon
                        size={20}
                        className={`transition-all duration-300 ${
                          activeTab === tab.id
                            ? "text-blue-600 scale-110"
                            : "text-gray-400 group-hover:text-gray-600"
                        }`}
                      />
                      <span>{tab.label}</span>
                    </div>
                    {activeTab === tab.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === "general" && (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                  {[
                    {
                      name: "siteName",
                      label: "Site Name",
                      type: "text",
                      value: formData.siteName,
                    },
                    {
                      name: "siteDescription",
                      label: "Site Description",
                      type: "text",
                      value: formData.siteDescription,
                    },
                    {
                      name: "adminEmail",
                      label: "Admin Email",
                      type: "email",
                      value: formData.adminEmail,
                    },
                    {
                      name: "supportEmail",
                      label: "Support Email",
                      type: "email",
                      value: formData.supportEmail,
                    },
                    {
                      name: "phoneNumber",
                      label: "Phone Number",
                      type: "tel",
                      value: formData.phoneNumber,
                    },
                    {
                      name: "address",
                      label: "Address",
                      type: "text",
                      value: formData.address,
                    },
                  ].map((field) => (
                    <div key={field.name} className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        {field.label}
                      </label>
                      <input
                        type={field.type}
                        name={field.name}
                        value={field.value}
                        onChange={(e) => handleChange(e, "general")}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm group-hover:shadow-md"
                      />
                    </div>
                  ))}

                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Currency
                    </label>
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={(e) => handleChange(e, "general")}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm group-hover:shadow-md"
                    >
                      <option value="USD">🇺🇸 USD - US Dollar</option>
                      <option value="EUR">🇪🇺 EUR - Euro</option>
                      <option value="GBP">🇬🇧 GBP - British Pound</option>
                      <option value="JPY">🇯🇵 JPY - Japanese Yen</option>
                    </select>
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Timezone
                    </label>
                    <select
                      name="timezone"
                      value={formData.timezone}
                      onChange={(e) => handleChange(e, "general")}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm group-hover:shadow-md"
                    >
                      <option value="UTC">🌍 UTC</option>
                      <option value="America/New_York">
                        🗽 America/New_York
                      </option>
                      <option value="Europe/London">🏴󠁧󠁢󠁥󠁮󠁧󠁿 Europe/London</option>
                      <option value="Asia/Tokyo">🗾 Asia/Tokyo</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <Save size={18} className="mr-2" />
                    {isLoading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            )}

            {activeTab === "appearance" && (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-4">
                        Logo
                      </label>
                      <div className="flex items-center space-x-6">
                        <div className="relative h-24 w-24 rounded-2xl overflow-hidden shadow-lg group">
                          <img
                            src={appearanceData.logo}
                            alt="Logo"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        <button
                          type="button"
                          className="flex items-center px-6 py-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:bg-gray-50 transition-all duration-300"
                        >
                          <Camera size={18} className="mr-2" />
                          Change Logo
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-4">
                        Favicon
                      </label>
                      <div className="flex items-center space-x-6">
                        <div className="relative h-16 w-16 rounded-xl overflow-hidden shadow-lg group">
                          <img
                            src={appearanceData.favicon}
                            alt="Favicon"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        <button
                          type="button"
                          className="flex items-center px-6 py-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:bg-gray-50 transition-all duration-300"
                        >
                          <Camera size={18} className="mr-2" />
                          Change Favicon
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Preview
                    </h3>
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <div className="flex items-center space-x-3 mb-3">
                        <img
                          src={appearanceData.favicon}
                          alt="Favicon"
                          className="w-6 h-6 rounded"
                        />
                        <span className="font-semibold text-gray-800">
                          {formData.siteName}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {formData.siteDescription}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <Save size={18} className="mr-2" />
                    {isLoading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            )}

            {activeTab === "email" && (
              <div className="space-y-8">
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 rounded-xl p-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <Mail className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-yellow-800">
                        Email Configuration
                      </h3>
                      <p className="mt-2 text-yellow-700">
                        Configure your SMTP settings to enable email
                        notifications and communications.
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {[
                      {
                        name: "smtpHost",
                        label: "SMTP Host",
                        type: "text",
                        placeholder: "smtp.example.com",
                      },
                      {
                        name: "smtpPort",
                        label: "SMTP Port",
                        type: "number",
                        placeholder: "587",
                      },
                      {
                        name: "smtpUsername",
                        label: "SMTP Username",
                        type: "text",
                        placeholder: "username@example.com",
                      },
                      {
                        name: "smtpPassword",
                        label: "SMTP Password",
                        type: "password",
                        placeholder: "••••••••",
                      },
                    ].map((field) => (
                      <div key={field.name} className="group">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          {field.label}
                        </label>
                        <input
                          type={field.type}
                          name={field.name}
                          value={emailData[field.name]}
                          onChange={(e) => handleChange(e, "email")}
                          placeholder={field.placeholder}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm group-hover:shadow-md"
                        />
                      </div>
                    ))}

                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Encryption
                      </label>
                      <select
                        name="smtpEncryption"
                        value={emailData.smtpEncryption}
                        onChange={(e) => handleChange(e, "email")}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm group-hover:shadow-md"
                      >
                        <option value="TLS">TLS</option>
                        <option value="SSL">SSL</option>
                        <option value="None">None</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      className="px-6 py-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:bg-gray-50 transition-all duration-300"
                    >
                      Test Connection
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      <Save size={18} className="mr-2" />
                      {isLoading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === "payment" && (
              <div className="space-y-8">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-400 rounded-xl p-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <CreditCard className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-green-800">
                        Payment Gateway Configuration
                      </h3>
                      <p className="mt-2 text-green-700">
                        Set up your Stripe integration to accept payments
                        securely.
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    {[
                      {
                        name: "stripePublicKey",
                        label: "Stripe Public Key",
                        type: "text",
                        placeholder: "pk_test_...",
                      },
                      {
                        name: "stripeSecretKey",
                        label: "Stripe Secret Key",
                        type: "password",
                        placeholder: "sk_test_...",
                      },
                      {
                        name: "webhookSecret",
                        label: "Webhook Secret",
                        type: "password",
                        placeholder: "whsec_...",
                      },
                    ].map((field) => (
                      <div key={field.name} className="group">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          {field.label}
                        </label>
                        <input
                          type={field.type}
                          name={field.name}
                          value={paymentData[field.name]}
                          onChange={(e) => handleChange(e, "payment")}
                          placeholder={field.placeholder}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm group-hover:shadow-md"
                        />
                      </div>
                    ))}

                    <div className="bg-gray-50 rounded-xl p-6">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="testMode"
                          checked={paymentData.testMode}
                          onChange={(e) => handleChange(e, "payment")}
                          className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="ml-3 block text-sm font-medium text-gray-900">
                          Enable test mode
                        </label>
                      </div>
                      <p className="mt-2 text-sm text-gray-600">
                        Test mode allows you to process test transactions
                        without charging real money.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      className="px-6 py-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:bg-gray-50 transition-all duration-300"
                    >
                      Test Connection
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      <Save size={18} className="mr-2" />
                      {isLoading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === "categories" && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                      <Globe className="mr-3 text-blue-600" size={24} />
                      Categories
                    </h3>

                    <form onSubmit={handleCategoryAdd} className="mb-6">
                      <div className="flex space-x-3">
                        <input
                          type="text"
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          className="flex-1 px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                          placeholder="Enter category name"
                        />
                        <button
                          type="submit"
                          className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                    </form>

                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {categories.map((category: string) => (
                        <div
                          key={category}
                          className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group"
                        >
                          <span className="font-medium text-gray-900">
                            {category}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCategoryDelete(category)}
                            className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-all duration-300"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                      <Settings className="mr-3 text-purple-600" size={24} />
                      Subcategories
                    </h3>

                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Select Category
                      </label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                      >
                        {categories.map((category: string) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>

                    <form onSubmit={handleSubCategoryAdd} className="mb-6">
                      <div className="flex space-x-3">
                        <input
                          type="text"
                          value={newSubCategory}
                          onChange={(e) => setNewSubCategory(e.target.value)}
                          className="flex-1 px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                          placeholder="Enter subcategory name"
                        />
                        <button
                          type="submit"
                          className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                    </form>

                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {subCategories[selectedCategory]?.map(
                        (subCategory: string) => (
                          <div
                            key={subCategory}
                            className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group"
                          >
                            <span className="font-medium text-gray-900">
                              {subCategory}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                handleSubCategoryDelete(subCategory)
                              }
                              className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-all duration-300"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        )
                      )}
                      {(!subCategories[selectedCategory] ||
                        subCategories[selectedCategory].length === 0) && (
                        <div className="text-center py-8 text-gray-500">
                          <Globe
                            size={48}
                            className="mx-auto mb-4 text-gray-300"
                          />
                          <p>No subcategories found for this category.</p>
                          <p className="text-sm">
                            Add your first subcategory above.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <Save size={18} className="mr-2" />
                    {isLoading ? "Saving..." : "Save Categories"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
