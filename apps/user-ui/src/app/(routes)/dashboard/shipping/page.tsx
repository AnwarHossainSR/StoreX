// app/dashboard/shipping/page.tsx
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Edit, MapPin, Plus, Trash } from "lucide-react";

export default function ShippingAddressPage() {
  // Sample addresses - in a real app you'd fetch this from an API
  const addresses = [
    {
      id: 1,
      name: "Shahriar Sajeeb",
      address: "123 Main Street",
      city: "New York",
      state: "NY",
      postalCode: "10001",
      country: "United States",
      phone: "+1 (555) 123-4567",
      isDefault: true,
    },
    {
      id: 2,
      name: "Shahriar Sajeeb",
      address: "456 Oak Avenue",
      city: "Los Angeles",
      state: "CA",
      postalCode: "90001",
      country: "United States",
      phone: "+1 (555) 987-6543",
      isDefault: false,
    },
  ];

  return (
    <DashboardLayout>
      {/* Add New Address Button */}
      <div className="mb-6">
        <button className="px-5 py-2.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2">
          <Plus size={18} />
          <span>Add New Address</span>
        </button>
      </div>

      {/* Addresses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {addresses.map((address) => (
          <div
            key={address.id}
            className="bg-white rounded-lg shadow-sm p-6 border relative"
          >
            {address.isDefault && (
              <span className="absolute top-4 right-4 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                Default
              </span>
            )}
            <div className="flex items-start mb-4">
              <div className="bg-blue-100 p-2 rounded-full mr-3">
                <MapPin size={20} className="text-blue-500" />
              </div>
              <div>
                <h3 className="font-medium">{address.name}</h3>
              </div>
            </div>

            <div className="text-gray-600 space-y-1 mb-6">
              <p>{address.address}</p>
              <p>{`${address.city}, ${address.state} ${address.postalCode}`}</p>
              <p>{address.country}</p>
              <p className="mt-2">{address.phone}</p>
            </div>

            <div className="flex gap-3">
              <button className="flex items-center gap-1 text-blue-500 hover:text-blue-700">
                <Edit size={16} />
                <span>Edit</span>
              </button>
              <button className="flex items-center gap-1 text-red-500 hover:text-red-700">
                <Trash size={16} />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
