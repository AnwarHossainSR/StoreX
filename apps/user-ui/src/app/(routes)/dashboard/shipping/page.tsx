"use client";
import CreateShippingAddressModal from "@/components/modal/CreateShippingAddressModal";
import UpdateShippingAddressModal from "@/components/modal/UpdateShippingAddressModal";
import Loading from "@/components/ui/loading";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ShippingAddress } from "@/services/authService";
import { Edit, MapPin, Plus, Trash } from "lucide-react";
import { useState } from "react";

export default function ShippingAddressPage() {
  const {
    shippingAddress: addresses,
    isLoadingShippingAddress,
    isFetchingShippingAddress,
    createShippingAddress,
    updateShippingAddress,
    deleteShippingAddress,
  } = useCurrentUser({ enabled: true, refetchOnMount: true });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] =
    useState<ShippingAddress | null>(null);
  console.log("addresses", addresses);
  const handleCreateAddress = async (
    newAddress: Omit<ShippingAddress, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      await createShippingAddress(newAddress);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Failed to create address:", error);
    }
  };

  const handleUpdateAddress = async (updatedAddress: ShippingAddress) => {
    try {
      await updateShippingAddress(updatedAddress.id, {
        name: updatedAddress.name,
        address: updatedAddress.address,
        city: updatedAddress.city,
        state: updatedAddress.state,
        country: updatedAddress.country,
        pincode: updatedAddress.pincode,
        phone: updatedAddress.phone,
      });
      setIsUpdateModalOpen(false);
      setSelectedAddress(null);
    } catch (error) {
      console.error("Failed to update address:", error);
      // TODO: Add user-friendly error handling
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await deleteShippingAddress(id);
    } catch (error) {
      console.error("Failed to delete address:", error);
      // TODO: Add user-friendly error handling
    }
  };

  if (isLoadingShippingAddress || isFetchingShippingAddress) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loading size="md" className="mt-6" />
      </div>
    );
  }

  return (
    <>
      {/* Add New Address Button */}
      <div className="mb-6">
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-5 py-2.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          <span>Add New Address</span>
        </button>
      </div>

      {/* Addresses Grid */}
      {addresses && addresses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="bg-white rounded-lg shadow-sm p-6 border relative"
            >
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
                <p>{`${address.city}, ${address.state} ${address.pincode}`}</p>
                <p>{address.country}</p>
                <p className="mt-2">{address.phone}</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedAddress(address);
                    setIsUpdateModalOpen(true);
                  }}
                  className="flex items-center gap-1 text-blue-500 hover:text-blue-700"
                >
                  <Edit size={16} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDeleteAddress(address.id)}
                  className="flex items-center gap-1 text-red-500 hover:text-red-700"
                >
                  <Trash size={16} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex justify-center items-center min-h-[50vh] text-gray-600">
          No addresses found.
        </div>
      )}

      {/* Modals */}
      <CreateShippingAddressModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateAddress}
      />
      <UpdateShippingAddressModal
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setSelectedAddress(null);
        }}
        address={selectedAddress}
        onUpdate={handleUpdateAddress}
      />
    </>
  );
}
