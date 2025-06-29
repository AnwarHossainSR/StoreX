"use client";

import { Camera, Plus, Save, Trash2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [formData, setFormData] = useState({
    siteName: "E-Shop",
    siteDescription: "Your one-stop shopping destination",
    adminEmail: "admin@example.com",
    supportEmail: "support@example.com",
    phoneNumber: "+1 234 567 890",
    address: "123 E-commerce Street, Digital City, 10001",
    currency: "USD",
    timezone: "UTC",
    logo: "https://images.pexels.com/photos/1005638/pexels-photo-1005638.jpeg",
    favicon:
      "https://images.pexels.com/photos/1005638/pexels-photo-1005638.jpeg",
  });
  const [categories, setCategories] = useState<string[]>([
    "Electronics",
    "Fashion",
    "Home & Kitchen",
    "Sports & Fitness",
    "Health & Beauty",
  ]);
  const [subCategories, setSubCategories] = useState<{
    [key: string]: string[];
  }>({
    Electronics: ["Laptops", "Mobiles", "Tablets"],
    Fashion: ["Mens", "Womens", "Kids"],
    "Home & Kitchen": ["Kitchen", "Dining", "Bedroom"],
    "Sports & Fitness": ["Fitness", "Gym", "Outdoor"],
    "Health & Beauty": ["Skin Care", "Hair Care", "Body Care"],
  });
  const [newCategory, setNewCategory] = useState("");
  const [newSubCategory, setNewSubCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(categories[0] || "");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      setSubCategories({ ...subCategories, [newCategory]: [] });
      setNewCategory("");
    }
  };

  const handleSubCategoryAdd = (e: React.FormEvent) => {
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
    setCategories(categories.filter((cat) => cat !== category));
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
        (sub) => sub !== subCategory
      ),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission, including categories and subcategories
    console.log("Settings updated:", {
      ...formData,
      categories,
      subCategories,
    });
  };

  useEffect(() => {
    if (categories.length > 0 && !categories.includes(selectedCategory)) {
      setSelectedCategory(categories[0]);
    }
  }, [categories, selectedCategory]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
      </div>

      {/* Settings Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === "general"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("general")}
            >
              General
            </button>
            <button
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === "appearance"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("appearance")}
            >
              Appearance
            </button>
            <button
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === "email"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("email")}
            >
              Email
            </button>
            <button
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === "payment"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("payment")}
            >
              Payment
            </button>
            <button
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === "categories"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setActiveTab("categories")}
            >
              Categories
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "general" && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="siteName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Site Name
                  </label>
                  <input
                    type="text"
                    id="siteName"
                    name="siteName"
                    value={formData.siteName}
                    onChange={handleChange}
                    className="px-3 py-2 mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="siteDescription"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Site Description
                  </label>
                  <input
                    type="text"
                    id="siteDescription"
                    name="siteDescription"
                    value={formData.siteDescription}
                    onChange={handleChange}
                    className="px-3 py-2 mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="adminEmail"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Admin Email
                  </label>
                  <input
                    type="email"
                    id="adminEmail"
                    name="adminEmail"
                    value={formData.adminEmail}
                    onChange={handleChange}
                    className="px-3 py-2 mt–

1 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="supportEmail"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Support Email
                  </label>
                  <input
                    type="email"
                    id="supportEmail"
                    name="supportEmail"
                    value={formData.supportEmail}
                    onChange={handleChange}
                    className="px-3 py-2 mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phoneNumber"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="px-3 py-2 mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="px-3 py-2 mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

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
                    onChange={handleChange}
                    className="px-3 py-2 mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="JPY">JPY - Japanese Yen</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="timezone"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Timezone
                  </label>
                  <select
                    id="timezone"
                    name="timezone"
                    value={formData.timezone}
                    onChange={handleChange}
                    className="px-3 py-2 mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New_York</option>
                    <option value="Europe/London">Europe/London</option>
                    <option value="Asia/Tokyo">Asia/Tokyo</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Save size={16} className="mr-2" />
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          )}

          {activeTab === "appearance" && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Logo
                  </label>
                  <div className="mt-1 flex items-center">
                    <div className="relative h-32 w-32 rounded-lg overflow-hidden">
                      <Image
                        src={formData.logo}
                        alt="Logo"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      className="ml-5 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Camera size={16} className="mr-2 inline-block" />
                      Change
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Favicon
                  </label>
                  <div className="mt-1 flex items-center">
                    <div className="relative h-16 w-16 rounded-lg overflow-hidden">
                      <Image
                        src={formData.favicon}
                        alt="Favicon"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      className="ml-5 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Camera size={16} className="mr-2 inline-block" />
                      Change
                    </button>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Save size={16} className="mr-2" />
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          )}

          {activeTab === "email" && (
            <div className="space-y-6">
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-yellow-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Email Configuration
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        Configure your email settings to enable sending emails
                        from your application.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <form className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      SMTP Host
                    </label>
                    <input
                      type="text"
                      className="px-3 py-2 mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="smtp.example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      SMTP Port
                    </label>
                    <input
                      type="number"
                      className="px-3 py-2 mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="587"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      SMTP Username
                    </label>
                    <input
                      type="text"
                      className="px-3 py-2 mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="username@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      SMTP Password
                    </label>
                    <input
                      type="password"
                      className="px-3 py-2 mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Encryption
                    </label>
                    <select className="px-3 py-2 mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                      <option>TLS</option>
                      <option>SSL</option>
                      <option>None</option>
                    </select>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <div className="flex justify-between">
                    <button
                      type="button"
                      className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Test Connection
                    </button>
                    <button
                      type="submit"
                      className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Save size={16} className="mr-2" />
                      Save Changes
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {activeTab === "payment" && (
            <div className="space-y-6">
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-yellow-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Payment Gateway Configuration
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        Configure your payment gateway settings to enable
                        accepting payments.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <form className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Stripe Public Key
                    </label>
                    <input
                      type="text"
                      className="px-3 py-2 mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="pk_test_..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Stripe Secret Key
                    </label>
                    <input
                      type="password"
                      className="px-3 py-2 mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="sk_test_..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Webhook Secret
                    </label>
                    <input
                      type="password"
                      className="px-3 py-2 mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="whsec_..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Test Mode
                    </label>
                    <div className="mt-2">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-900">
                          Enable test mode
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <div className="flex justify-between">
                    <button
                      type="button"
                      className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Test Connection
                    </button>
                    <button
                      type="submit"
                      className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Save size={16} className="mr-2" />
                      Save Changes
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {activeTab === "categories" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Categories
                  </h3>
                  <form onSubmit={handleCategoryAdd} className="mt-4 space-y-4">
                    <div>
                      <label
                        htmlFor="newCategory"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Add New Category
                      </label>
                      <div className="flex mt-1">
                        <input
                          type="text"
                          id="newCategory"
                          name="newCategory"
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          className="px-3 py-2 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter category name"
                        />
                        <button
                          type="submit"
                          className="ml-2 flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <Plus size={16} className="mr-2" />
                          Add
                        </button>
                      </div>
                    </div>
                  </form>
                  <div className="mt-4">
                    <ul className="divide-y divide-gray-200">
                      {categories.map((category) => (
                        <li
                          key={category}
                          className="py-2 flex justify-between items-center"
                        >
                          <span className="text-sm text-gray-900">
                            {category}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCategoryDelete(category)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={16} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Subcategories
                  </h3>
                  <form
                    onSubmit={handleSubCategoryAdd}
                    className="mt-4 space-y-4"
                  >
                    <div>
                      <label
                        htmlFor="selectedCategory"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Select Category
                      </label>
                      <select
                        id="selectedCategory"
                        name="selectedCategory"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-3 py-2 mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="newSubCategory"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Add New Subcategory
                      </label>
                      <div className="flex mt-1">
                        <input
                          type="text"
                          id="newSubCategory"
                          name="newSubCategory"
                          value={newSubCategory}
                          onChange={(e) => setNewSubCategory(e.target.value)}
                          className="px-3 py-2 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter subcategory name"
                        />
                        <button
                          type="submit"
                          className="ml-2 flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <Plus size={16} className="mr-2" />
                          Add
                        </button>
                      </div>
                    </div>
                  </form>
                  <div className="mt-4">
                    <ul className="divide-y divide-gray-200">
                      {subCategories[selectedCategory]?.map((subCategory) => (
                        <li
                          key={subCategory}
                          className="py-2 flex justify-between items-center"
                        >
                          <span className="text-sm text-gray-900">
                            {subCategory}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleSubCategoryDelete(subCategory)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={16} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Save size={16} className="mr-2" />
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
