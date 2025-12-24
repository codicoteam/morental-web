// UsersPage.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  fetchAllUsers,
  deleteUser,
  getCurrentUserRoles,
  getErrorDisplay,
} from "../../../Services/adminAndManager/admi_users_service";
import Sidebar from "../../../components/Sidebar";
import {
  Search,
  Edit,
  Trash2,
  Eye,
  User,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  AlertCircle,
  CheckCircle,
  Clock,
  MoreVertical,
} from "lucide-react";

const UsersPage: React.FC = () => {
  // State
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  
  // Modal states
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  
  // Snackbar
  const [snackbar, setSnackbar] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | "info";
  }>({ show: false, message: "", type: "info" });
  
  // Sidebar state for mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Load users
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response: IUsersResponse = await fetchAllUsers(
        pagination.page,
        pagination.limit,
        searchTerm || undefined
      );
      
      setUsers(response.data.users);
      setPagination({
        page: response.data.page,
        limit: response.data.limit,
        total: response.data.total,
        totalPages: response.data.totalPages,
      });
    } catch (err) {
      const errorDisplay = getErrorDisplay(err);
      setError(errorDisplay.message || "Failed to load users");
      showSnackbar(errorDisplay.message, "error");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm]);

  // Initial load
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Snackbar helper
  const showSnackbar = (message: string, type: "success" | "error" | "info") => {
    setSnackbar({ show: true, message, type });
    setTimeout(() => {
      setSnackbar(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  // Delete user
  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId);
      showSnackbar("User deleted successfully", "success");
      setUserToDelete(null);
      loadUsers();
    } catch (err) {
      const errorDisplay = getErrorDisplay(err);
      showSnackbar(errorDisplay.message, "error");
    }
  };

  // View profile (except for drivers)
  const handleViewProfile = (user: IUser) => {
    const currentRoles = getCurrentUserRoles();
    const isDriver = user.roles?.includes("driver");
    
    if (isDriver && currentRoles.includes("driver")) {
      showSnackbar("Driver profiles are not accessible", "error");
      return;
    }
    
    showSnackbar(`Profile viewed: ${user.full_name}`, "info");
    // Here you would typically navigate to a profile page
    // For now, we'll open the details modal
    setSelectedUser(user);
    setIsDetailsModalOpen(true);
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    if (statusFilter !== "all" && user.status !== statusFilter) return false;
    if (roleFilter !== "all" && !user.roles?.includes(roleFilter)) return false;
    return true;
  });

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "suspended": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Get role badge color
  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-purple-100 text-purple-800";
      case "driver": return "bg-blue-100 text-blue-800";
      case "agent": return "bg-indigo-100 text-indigo-800";
      case "customer": return "bg-cyan-100 text-cyan-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden mr-4 p-2 rounded-lg hover:bg-gray-100"
              >
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-2xl font-semibold text-gray-800">Users Management</h1>
            </div>
            <div className="text-sm text-gray-600">
              Total: {pagination.total} users
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="p-6 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1EA2E4] focus:border-transparent"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1EA2E4] bg-white appearance-none pr-10"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                </select>
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1EA2E4] bg-white appearance-none pr-10"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="agent">Agent</option>
                  <option value="driver">Driver</option>
                  <option value="customer">Customer</option>
                </select>
                <User className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="px-6 pb-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1EA2E4]"></div>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-64 text-red-600">
                <AlertCircle className="w-12 h-12 mb-3" />
                <p>{error}</p>
                <button
                  onClick={loadUsers}
                  className="mt-4 px-4 py-2 bg-[#1EA2E4] text-white rounded-lg hover:bg-[#1A8BC9]"
                >
                  Retry
                </button>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <User className="w-16 h-16 mb-3" />
                <p className="text-lg">No users found</p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Roles</th>
                        <th className="px6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Joined</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
                        <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0">
                                <div className="w-10 h-10 rounded-full bg-[#1EA2E4] flex items-center justify-center text-white font-semibold">
                                  {user.full_name.charAt(0)}
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                                <div className="text-sm text-gray-500">ID: {user._id.slice(-8)}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{user.email}</div>
                            <div className="text-sm text-gray-500">{user.phone}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {user.roles?.map((role) => (
                                <span
                                  key={role}
                                  className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(role)}`}
                                >
                                  {role}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(user.status || "pending")}`}>
                              {user.status?.toUpperCase()}
                            </span>
                            {user.email_verified && (
                              <CheckCircle className="inline ml-2 w-4 h-4 text-green-500" />
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {formatDate(user.created_at)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => handleViewProfile(user)}
                                className="p-2 text-gray-600 hover:text-[#1EA2E4] hover:bg-[#1EA2E4]/10 rounded-lg transition-colors"
                                title="View Profile"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setIsEditModalOpen(true);
                                }}
                                className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Edit User"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setUserToDelete(user._id)}
                                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete User"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden">
                  {filteredUsers.map((user) => (
                    <div key={user._id} className="p-4 border-b border-gray-200">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          <div className="w-12 h-12 rounded-full bg-[#1EA2E4] flex items-center justify-center text-white font-semibold text-lg">
                            {user.full_name.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <h3 className="text-sm font-semibold text-gray-900">{user.full_name}</h3>
                            <p className="text-xs text-gray-500">{user.email}</p>
                            <div className="flex items-center mt-1 space-x-2">
                              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(user.status || "pending")}`}>
                                {user.status}
                              </span>
                              {user.roles?.map((role) => (
                                <span
                                  key={role}
                                  className={`px-2 py-0.5 text-xs font-medium rounded-full ${getRoleColor(role)}`}
                                >
                                  {role}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewProfile(user)}
                            className="p-2 text-gray-600 hover:text-[#1EA2E4]"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setIsEditModalOpen(true);
                            }}
                            className="p-2 text-gray-600 hover:text-green-600"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-between">
                        <div className="text-xs text-gray-500">
                          <div>Phone: {user.phone}</div>
                          <div>Joined: {formatDate(user.created_at)}</div>
                        </div>
                        <button
                          onClick={() => setUserToDelete(user._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{" "}
                    <span className="font-medium">
                      {Math.min(pagination.page * pagination.limit, pagination.total)}
                    </span>{" "}
                    of <span className="font-medium">{pagination.total}</span> users
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                      disabled={pagination.page === 1}
                      className={`px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium ${
                        pagination.page === 1
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-gray-700">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                      disabled={pagination.page >= pagination.totalPages}
                      className={`px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium ${
                        pagination.page >= pagination.totalPages
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      {isDetailsModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsDetailsModalOpen(false)} />
          <div className="absolute inset-y-0 right-0 max-w-2xl w-full bg-white shadow-xl transform transition-transform">
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">User Details</h2>
                <button
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="flex items-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-[#1EA2E4] flex items-center justify-center text-white font-semibold text-2xl">
                    {selectedUser.full_name.charAt(0)}
                  </div>
                  <div className="ml-6">
                    <h3 className="text-2xl font-semibold text-gray-900">{selectedUser.full_name}</h3>
                    <p className="text-gray-600">{selectedUser.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Contact Information</h4>
                      <p className="text-gray-900">Phone: {selectedUser.phone || "N/A"}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Status</h4>
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedUser.status || "pending")}`}>
                        {selectedUser.status?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Roles</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedUser.roles?.map((role) => (
                          <span
                            key={role}
                            className={`px-3 py-1 text-sm font-medium rounded-full ${getRoleColor(role)}`}
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Email Verification</h4>
                      <div className="flex items-center">
                        {selectedUser.email_verified ? (
                          <>
                            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                            <span className="text-green-600">Verified</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-5 h-5 text-yellow-500 mr-2" />
                            <span className="text-yellow-600">Pending</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Account Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">User ID</p>
                      <p className="text-sm font-medium text-gray-900">{selectedUser._id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Created</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(selectedUser.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Last Updated</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(selectedUser.updated_at)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setIsDetailsModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setIsDetailsModalOpen(false);
                      setIsEditModalOpen(true);
                    }}
                    className="px-4 py-2 bg-[#1EA2E4] text-white rounded-lg hover:bg-[#1A8BC9]"
                  >
                    Edit User
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setUserToDelete(null)} />
          <div className="relative bg-white rounded-xl shadow-lg max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <AlertCircle className="w-6 h-6 text-red-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Delete User</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this user? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setUserToDelete(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteUser(userToDelete)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Snackbar */}
      {snackbar.show && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className={`px-4 py-3 rounded-lg shadow-lg flex items-center ${
            snackbar.type === "success" ? "bg-green-100 text-green-800 border border-green-200" :
            snackbar.type === "error" ? "bg-red-100 text-red-800 border border-red-200" :
            "bg-blue-100 text-blue-800 border border-blue-200"
          }`}>
            {snackbar.type === "success" && <CheckCircle className="w-5 h-5 mr-2" />}
            {snackbar.type === "error" && <AlertCircle className="w-5 h-5 mr-2" />}
            {snackbar.type === "info" && <Eye className="w-5 h-5 mr-2" />}
            <span className="text-sm font-medium">{snackbar.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;