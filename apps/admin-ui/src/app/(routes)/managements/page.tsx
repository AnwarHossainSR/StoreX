"use client";

import { AdminFormModal } from "@/components/modal/AdminFormModal";
import { Pagination } from "@/packages/components/Pagination";
import { Table } from "@/packages/components/Table";
import { Edit, Plus, Search, Shield, Trash2, UserCheck } from "lucide-react";
import { useEffect, useState } from "react";

interface Admin {
  id: string;
  name: string;
  email: string;
  role: "superadmin" | "moderator";
  phone: string | null;
  country: string | null;
  avatar: string | null;
  status: "active" | "inactive" | "suspended";
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AdminFormData {
  name: string;
  email: string;
  role: "superadmin" | "moderator";
  phone: string;
  country: string;
  status: "active" | "inactive" | "suspended";
}

// Static data for demonstration
const staticAdmins: Admin[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@admin.com",
    role: "superadmin",
    phone: "+1234567890",
    country: "United States",
    avatar: null,
    status: "active",
    lastLogin: "2024-06-29T10:30:00Z",
    createdAt: "2024-01-15T08:00:00Z",
    updatedAt: "2024-06-29T10:30:00Z",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@admin.com",
    role: "moderator",
    phone: "+1987654321",
    country: "Canada",
    avatar: null,
    status: "active",
    lastLogin: "2024-06-28T14:20:00Z",
    createdAt: "2024-02-20T09:15:00Z",
    updatedAt: "2024-06-28T14:20:00Z",
  },
  {
    id: "3",
    name: "Mike Johnson",
    email: "mike.johnson@admin.com",
    role: "moderator",
    phone: "+44123456789",
    country: "United Kingdom",
    avatar: null,
    status: "inactive",
    lastLogin: "2024-06-25T16:45:00Z",
    createdAt: "2024-03-10T11:30:00Z",
    updatedAt: "2024-06-25T16:45:00Z",
  },
  {
    id: "4",
    name: "Sarah Wilson",
    email: "sarah.wilson@admin.com",
    role: "moderator",
    phone: "+61987654321",
    country: "Australia",
    avatar: null,
    status: "suspended",
    lastLogin: "2024-06-20T09:15:00Z",
    createdAt: "2024-04-05T13:20:00Z",
    updatedAt: "2024-06-20T09:15:00Z",
  },
  {
    id: "5",
    name: "David Brown",
    email: "david.brown@admin.com",
    role: "superadmin",
    phone: "+49123456789",
    country: "Germany",
    avatar: null,
    status: "active",
    lastLogin: "2024-06-29T08:00:00Z",
    createdAt: "2024-01-30T10:45:00Z",
    updatedAt: "2024-06-29T08:00:00Z",
  },
  {
    id: "6",
    name: "Lisa Anderson",
    email: "lisa.anderson@admin.com",
    role: "moderator",
    phone: "+33123456789",
    country: "France",
    avatar: null,
    status: "active",
    lastLogin: "2024-06-28T12:30:00Z",
    createdAt: "2024-05-15T14:10:00Z",
    updatedAt: "2024-06-28T12:30:00Z",
  },
];

export default function AdminManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const entriesPerPage = 10;

  useEffect(() => {
    const fetchAdmins = async () => {
      setLoading(true);

      // Simulate API call delay
      setTimeout(() => {
        let filteredAdmins = [...staticAdmins];

        // Apply search filter
        if (searchTerm) {
          filteredAdmins = filteredAdmins.filter(
            (admin) =>
              admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
              admin.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              admin.country?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }

        // Apply role filter
        if (selectedRole !== "all") {
          filteredAdmins = filteredAdmins.filter(
            (admin) => admin.role === selectedRole
          );
        }

        // Apply status filter
        if (selectedStatus !== "all") {
          filteredAdmins = filteredAdmins.filter(
            (admin) => admin.status === selectedStatus
          );
        }

        // Apply sorting
        filteredAdmins.sort((a, b) => {
          const aValue = a[sortField as keyof Admin];
          const bValue = b[sortField as keyof Admin];

          if (sortDirection === "asc") {
            return aValue > bValue ? 1 : -1;
          } else {
            return aValue < bValue ? 1 : -1;
          }
        });

        // Apply pagination
        const startIndex = (currentPage - 1) * entriesPerPage;
        const paginatedAdmins = filteredAdmins.slice(
          startIndex,
          startIndex + entriesPerPage
        );

        setAdmins(paginatedAdmins);
        setTotal(filteredAdmins.length);
        setLoading(false);
      }, 300);
    };

    fetchAdmins();
  }, [
    currentPage,
    searchTerm,
    selectedRole,
    selectedStatus,
    sortField,
    sortDirection,
  ]);

  const handleRoleChange = (newRole: string) => {
    setSelectedRole(newRole);
    setCurrentPage(1);
  };

  const handleStatusChange = (newStatus: string) => {
    setSelectedStatus(newStatus);
    setCurrentPage(1);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getStatusBadgeClasses = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleBadgeClasses = (role: string) => {
    switch (role) {
      case "superadmin":
        return "bg-purple-100 text-purple-800";
      case "moderator":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleIcon = (role: string) => {
    return role === "superadmin" ? (
      <Shield size={16} className="mr-2 text-purple-600" />
    ) : (
      <UserCheck size={16} className="mr-2 text-blue-600" />
    );
  };

  const handleEdit = (admin: Admin) => {
    setSelectedAdmin(admin);
    setShowEditModal(true);
  };

  const handleDelete = (adminId: string) => {
    if (confirm("Are you sure you want to delete this admin?")) {
      // In real implementation, make API call to delete
      console.log("Deleting admin:", adminId);
    }
  };

  const handleStatusUpdate = (adminId: string, newStatus: string) => {
    // In real implementation, make API call to update status
    console.log("Updating admin status:", adminId, newStatus);
  };

  const handleAddAdmin = async (formData: AdminFormData) => {
    setFormLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log("Adding new admin:", formData);

      // Close modal and show success message
      setShowAddModal(false);
      // In real implementation, refresh the admin list
    } catch (error) {
      console.error("Error adding admin:", error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateAdmin = async (formData: AdminFormData) => {
    if (!selectedAdmin) return;

    setFormLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log("Updating admin:", selectedAdmin.id, formData);

      // Close modal and show success message
      setShowEditModal(false);
      setSelectedAdmin(null);
      // In real implementation, refresh the admin list
    } catch (error) {
      console.error("Error updating admin:", error);
    } finally {
      setFormLoading(false);
    }
  };

  const columns = [
    {
      key: "name",
      header: "Admin",
      sortable: true,
      render: (admin: Admin) => (
        <div className="flex items-center">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3">
            <span className="text-sm font-medium text-primary">
              {admin.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="font-medium text-foreground">{admin.name}</div>
            <div className="text-sm text-muted-foreground">{admin.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      sortable: true,
      render: (admin: Admin) => (
        <div className="flex items-center">
          {getRoleIcon(admin.role)}
          <span
            className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeClasses(
              admin.role
            )}`}
          >
            {admin.role === "superadmin" ? "Super Admin" : "Moderator"}
          </span>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Contact",
      sortable: true,
      render: (admin: Admin) => (
        <div>
          <div className="text-sm text-foreground">{admin.phone || "N/A"}</div>
          <div className="text-xs text-muted-foreground">
            {admin.country || "N/A"}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (admin: Admin) => (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClasses(
            admin.status
          )}`}
        >
          {admin.status.charAt(0).toUpperCase() + admin.status.slice(1)}
        </span>
      ),
    },
    {
      key: "lastLogin",
      header: "Last Login",
      sortable: true,
      render: (admin: Admin) =>
        admin.lastLogin
          ? new Date(admin.lastLogin).toLocaleDateString()
          : "Never",
    },
    {
      key: "createdAt",
      header: "Created",
      sortable: true,
      render: (admin: Admin) => new Date(admin.createdAt).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "Actions",
      sortable: false,
      render: (admin: Admin) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleEdit(admin)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors duration-200"
            title="Edit Admin"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleDelete(admin.id)}
            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
            title="Delete Admin"
          >
            <Trash2 size={16} />
          </button>
          <select
            value={admin.status}
            onChange={(e) => handleStatusUpdate(admin.id, e.target.value)}
            className="text-xs px-2 py-1 border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">Admin Management</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors duration-200"
          >
            <Plus size={20} className="mr-2" />
            Add Admin
          </button>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow-sm">
        <div className="p-6 border-b border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">
                Search Admins
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search by name, email..."
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 bg-background hover:border-primary/50"
                />
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground group-hover:text-primary transition-colors duration-200"
                  size={18}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">
                Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => handleRoleChange(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 bg-background hover:border-primary/50"
              >
                <option value="all">All Roles</option>
                <option value="superadmin">Super Admin</option>
                <option value="moderator">Moderator</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 bg-background hover:border-primary/50"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">
                Quick Actions
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={() => console.log("Export admins")}
                  className="flex-1 px-3 py-2 text-sm border border-border rounded-md hover:bg-secondary/80 transition-colors duration-200"
                >
                  Export
                </button>
                <button
                  onClick={() => console.log("Bulk actions")}
                  className="flex-1 px-3 py-2 text-sm border border-border rounded-md hover:bg-secondary/80 transition-colors duration-200"
                >
                  Bulk
                </button>
              </div>
            </div>
          </div>
        </div>

        {loading && <p className="p-4 text-center">Loading...</p>}
        {!loading && (
          <Table
            columns={columns}
            data={admins}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
            emptyMessage="No admins found"
          />
        )}

        {total > 0 && (
          <Pagination
            totalEntries={total}
            currentPage={currentPage}
            entriesPerPage={entriesPerPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Add Admin Modal */}
      <AdminFormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddAdmin}
        loading={formLoading}
      />

      {/* Edit Admin Modal */}
      <AdminFormModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedAdmin(null);
        }}
        onSubmit={handleUpdateAdmin}
        admin={selectedAdmin}
        loading={formLoading}
      />
    </div>
  );
}
