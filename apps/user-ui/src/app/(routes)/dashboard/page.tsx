import {
  Gift,
  HelpCircle,
  Medal,
  Pencil,
  Receipt,
  Settings,
} from "lucide-react";
import Image from "next/image";

export default function Dashboard() {
  return (
    <>
      {/* Profile Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-bold mb-6">Profile</h2>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Profile Photo */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-purple-500 flex items-center justify-center overflow-hidden">
                <Image
                  src="/avatar-placeholder.png"
                  alt="Profile"
                  width={96}
                  height={96}
                  className="object-cover"
                />
              </div>
              <button className="absolute bottom-0 right-0 bg-white p-1 rounded-full shadow-md border border-gray-200">
                <Pencil size={16} className="text-blue-500" />
              </button>
            </div>
            <button className="mt-2 text-blue-500 text-sm font-medium">
              Change Photo
            </button>
          </div>

          {/* Profile Info */}
          <div className="flex-1 space-y-4">
            <div>
              <p className="text-gray-500 mb-1">Name:</p>
              <p className="font-medium">Shahriar Sajeeb</p>
            </div>

            <div>
              <p className="text-gray-500 mb-1">Email:</p>
              <p className="font-medium">support@becodemy.com</p>
            </div>

            <div>
              <p className="text-gray-500 mb-1">Joined:</p>
              <p className="font-medium">07/04/2025</p>
            </div>

            <div>
              <p className="text-gray-500 mb-1">Earned Points:</p>
              <p className="font-medium">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Gift size={24} className="text-blue-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">Referral Program</h3>
              <p className="text-gray-600 text-sm">
                Invite friends and earn rewards.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Medal size={24} className="text-blue-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">Your Badges</h3>
              <p className="text-gray-600 text-sm">
                View your earned achievements.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Settings size={24} className="text-blue-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">Account Settings</h3>
              <p className="text-gray-600 text-sm">
                Manage preferences and security.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Receipt size={24} className="text-blue-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">Billing History</h3>
              <p className="text-gray-600 text-sm">
                Check your recent payments.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <HelpCircle size={24} className="text-blue-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">Support Center</h3>
              <p className="text-gray-600 text-sm">
                Get help with your orders.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
