"use client";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { format } from "date-fns";
import {
  Award,
  Calendar,
  Camera,
  Check,
  Edit3,
  Gift,
  Globe,
  HelpCircle,
  Mail,
  Medal,
  Phone,
  Receipt,
  Settings,
  Trash2,
  Upload,
  User,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function Dashboard() {
  const { user, updateUserProfile, uploadProfileImage, deleteProfileImage } =
    useCurrentUser();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        country: user.country || "",
      });
    }
  }, [user]);

  const handleEditToggle = () => {
    if (isEditing) {
      // Reset form data when canceling
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        country: user.country || "",
      });
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveProfile = async () => {
    try {
      await updateUserProfile(profileData);
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setIsUploading(true);
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64String = e.target?.result as string;
        await uploadProfileImage(base64String);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!user.avatar?.file_id) {
      toast.error("No image to delete");
      return;
    }

    try {
      await deleteProfileImage(user.avatar.file_id);
      toast.success("Profile image deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete image");
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            My Dashboard
          </h1>
          <p className="text-gray-600">
            Manage your profile and account settings
          </p>
        </div>

        {/* Profile Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <User className="text-white" size={18} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
            </div>
            <div className="flex gap-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSaveProfile}
                    className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Check size={18} />
                    Save Changes
                  </button>
                  <button
                    onClick={handleEditToggle}
                    className="flex items-center gap-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <X size={18} />
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={handleEditToggle}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Edit3 size={18} />
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Profile Photo */}
            <div className="flex flex-col items-center lg:items-start">
              <div className="relative group">
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden shadow-2xl">
                  {user.avatar?.url ? (
                    <Image
                      src={user.avatar.url}
                      alt="Profile"
                      width={128}
                      height={128}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold">
                      {user.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-2xl">
                      <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>

                {isEditing && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                    <button
                      onClick={triggerFileInput}
                      className="text-white p-3 rounded-xl hover:bg-white hover:bg-opacity-20 transition-colors"
                      disabled={isUploading}
                    >
                      <Camera size={24} />
                    </button>
                  </div>
                )}
              </div>

              {isEditing && (
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={triggerFileInput}
                    className="text-blue-500 text-sm font-semibold hover:text-blue-600 transition-colors flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-50"
                    disabled={isUploading}
                  >
                    <Upload size={16} />
                    Upload
                  </button>
                  {user.avatar?.url && (
                    <button
                      onClick={handleDeleteImage}
                      className="text-red-500 text-sm font-semibold hover:text-red-600 transition-colors flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  )}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* Profile Info */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <User size={16} />
                  <span className="text-sm font-medium">Name</span>
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all duration-200"
                    placeholder="Enter your name"
                  />
                ) : (
                  <p className="font-semibold text-gray-900 text-lg">
                    {user.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <Mail size={16} />
                  <span className="text-sm font-medium">Email</span>
                </div>
                {isEditing ? (
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all duration-200"
                    placeholder="Enter your email"
                    disabled
                    readOnly
                  />
                ) : (
                  <p className="font-semibold text-gray-900 text-lg">
                    {user.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <Phone size={16} />
                  <span className="text-sm font-medium">Phone</span>
                </div>
                {isEditing ? (
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all duration-200"
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <p className="font-semibold text-gray-900 text-lg">
                    {user.phone || "Not provided"}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <Globe size={16} />
                  <span className="text-sm font-medium">Country</span>
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.country}
                    onChange={(e) =>
                      handleInputChange("country", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all duration-200"
                    placeholder="Enter your country"
                  />
                ) : (
                  <p className="font-semibold text-gray-900 text-lg">
                    {user.country || "Not provided"}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <Calendar size={16} />
                  <span className="text-sm font-medium">Joined</span>
                </div>
                <p className="font-semibold text-gray-900 text-lg">
                  {format(new Date(user.createdAt), "PPP")}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <Award size={16} />
                  <span className="text-sm font-medium">Points</span>
                </div>
                <p className="font-semibold text-gray-900 text-lg">
                  {user.points || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Gift,
              title: "Referral Program",
              description: "Invite friends and earn rewards",
              gradient: "from-pink-500 to-rose-500",
              bgGradient: "from-pink-50 to-rose-50",
            },
            {
              icon: Medal,
              title: "Your Badges",
              description: "View your earned achievements",
              gradient: "from-yellow-500 to-orange-500",
              bgGradient: "from-yellow-50 to-orange-50",
            },
            {
              icon: Settings,
              title: "Account Settings",
              description: "Manage preferences and security",
              gradient: "from-blue-500 to-indigo-500",
              bgGradient: "from-blue-50 to-indigo-50",
            },
            {
              icon: Receipt,
              title: "Billing History",
              description: "Check your recent payments",
              gradient: "from-green-500 to-emerald-500",
              bgGradient: "from-green-50 to-emerald-50",
            },
            {
              icon: HelpCircle,
              title: "Support Center",
              description: "Get help with your orders",
              gradient: "from-purple-500 to-violet-500",
              bgGradient: "from-purple-50 to-violet-50",
            },
          ].map((item, index) => (
            <div
              key={index}
              className={`bg-gradient-to-br ${item.bgGradient} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group border border-white/50 hover:scale-105`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`bg-gradient-to-r ${item.gradient} p-4 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  <item.icon size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
