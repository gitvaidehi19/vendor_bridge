import React, { useState, useEffect } from "react";
import { useERP } from "../state";
import { User, UserRole } from "../types";
import {
  Plus,
  Search,
  UserPlus,
  Edit2,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Building,
  Briefcase,
  UserCog,
  Lock,
  Unlock,
  Users as UsersIcon,
  Mail,
  User as UserIcon,
} from "lucide-react";
import { validateEmail } from "../utils";

export const Users: React.FC = () => {
  const {
    users,
    vendors,
    addUser,
    editUser,
    toggleUserStatus,
    currentUser,
    searchQuery: globalSearchQuery,
  } = useERP();

  const [localSearch, setLocalSearch] = useState("");
  const [filterRole, setFilterRole] = useState<string>("All");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("Procurement Officer");
  const [vendorId, setVendorId] = useState("");
  const [avatar, setAvatar] = useState("");

  // Preset Avatars for selection
  const presetAvatars = [
    "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=120",
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120",
    "https://images.unsplash.com/photo-1547037579-f0fc020ac3be?auto=format&fit=crop&q=80&w=120",
  ];

  // Auto-set first avatar as default
  useEffect(() => {
    if (!avatar) setAvatar(presetAvatars[0]);
  }, [avatar]);

  // Handle Edit Prep
  const handleStartEdit = (u: User) => {
    setEditingUser(u);
    setName(u.name);
    setEmail(u.email);
    setRole(u.role);
    setVendorId(u.vendorId || "");
    setAvatar(u.avatar || presetAvatars[0]);
  };

  const validateInputs = (userName: string, userEmail: string): boolean => {
    if (!userName.trim()) {
      alert("Name is required.");
      return false;
    }
    if (!validateEmail(userEmail)) {
      alert("Invalid email format.");
      return false;
    }
    return true;
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs(name, email)) return;

    addUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      avatar,
      vendorId: role === "Vendor" ? vendorId : undefined,
    });

    // Reset Form & Close
    setName("");
    setEmail("");
    setRole("Procurement Officer");
    setVendorId("");
    setAvatar(presetAvatars[0]);
    setShowAddModal(false);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (!validateInputs(name, email)) return;

    editUser(editingUser.id, {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      avatar,
      vendorId: role === "Vendor" ? vendorId : undefined,
    });

    // Close
    setEditingUser(null);
  };

  // Filter & Search Logic
  const filteredUsers = users.filter((u) => {
    const searchMatch =
      u.name.toLowerCase().includes(localSearch.toLowerCase()) ||
      u.name.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(localSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(globalSearchQuery.toLowerCase());

    const roleMatch = filterRole === "All" || u.role === filterRole;
    const statusMatch =
      filterStatus === "All" ||
      (filterStatus === "Active" && u.status !== "Inactive") ||
      (filterStatus === "Inactive" && u.status === "Inactive");

    return searchMatch && roleMatch && statusMatch;
  });

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [localSearch, filterRole, filterStatus, globalSearchQuery]);

  // Statistics
  const totalCount = users.length;
  const activeCount = users.filter((u) => u.status !== "Inactive").length;
  const adminCount = users.filter((u) => u.role === "Admin").length;
  const officerCount = users.filter((u) => u.role === "Procurement Officer").length;

  const getRoleBadgeClass = (uRole: UserRole) => {
    switch (uRole) {
      case "Admin":
        return "bg-rose-50 text-rose-700 border border-rose-200";
      case "Manager":
        return "bg-purple-50 text-purple-700 border border-purple-200";
      case "Procurement Officer":
        return "bg-blue-50 text-blue-700 border border-blue-200";
      case "Vendor":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      default:
        return "bg-gray-50 text-gray-750 border border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900 font-display flex items-center gap-2">
            <UsersIcon className="w-6 h-6 text-green-600 animate-pulse" />
            Identity Governance & Role Permissions
          </h2>
          <p className="text-sm text-gray-500 mt-1 font-sans">
            Manage enterprise user access, credentials, linked vendors, and operational status.
          </p>
        </div>
        <button
          onClick={() => {
            setName("");
            setEmail("");
            setRole("Procurement Officer");
            setVendorId("");
            setAvatar(presetAvatars[0]);
            setShowAddModal(true);
          }}
          className="bg-green-600 hover:bg-green-700 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-all shadow-md shadow-green-200 hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer self-start md:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          Create User
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
            <UsersIcon className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider text-gray-400 font-mono">
              Total Accounts
            </span>
            <span className="text-2xl font-black text-gray-900 font-display mt-0.5 block">
              {totalCount}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider text-gray-400 font-mono">
              Active Accounts
            </span>
            <span className="text-2xl font-black text-gray-900 font-display mt-0.5 block">
              {activeCount}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <UserCog className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider text-gray-400 font-mono">
              Administrators
            </span>
            <span className="text-2xl font-black text-gray-900 font-display mt-0.5 block">
              {adminCount}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider text-gray-400 font-mono">
              Sourcing Officers
            </span>
            <span className="text-2xl font-black text-gray-900 font-display mt-0.5 block">
              {officerCount}
            </span>
          </div>
        </div>
      </div>

      {/* Filter / Actions Bar */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search user name or email..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-gray-55 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 hover:border-gray-300 transition-all placeholder:text-gray-400"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="text-[10px] font-bold text-gray-450 uppercase tracking-wider block mb-1">
                Filter Role
              </label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-750 focus:outline-none focus:ring-1 focus:ring-green-500 font-sans cursor-pointer hover:bg-gray-50"
              >
                <option value="All">All Roles</option>
                <option value="Admin">Admin</option>
                <option value="Procurement Officer">Procurement Officer</option>
                <option value="Manager">Manager</option>
                <option value="Vendor">Vendor</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-450 uppercase tracking-wider block mb-1">
                Filter Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-750 focus:outline-none focus:ring-1 focus:ring-green-500 font-sans cursor-pointer hover:bg-gray-50"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active Only</option>
                <option value="Inactive">Deactivated Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto border border-gray-150 rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-150">
                <th className="px-6 py-4">User Details</th>
                <th className="px-6 py-4">Role Badge</th>
                <th className="px-6 py-4">Linked Entity</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150 text-sm">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-sans">
                    <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    No user accounts match the selected filters.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => {
                  const isCurrentUser = currentUser.id === user.id;
                  const isDeactivated = user.status === "Inactive";

                  return (
                    <tr
                      key={user.id}
                      className={`hover:bg-gray-50/50 transition-colors ${
                        isDeactivated ? "bg-gray-50/30 opacity-70" : ""
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-10 h-10 rounded-full border border-gray-200 object-cover bg-gray-50 shrink-0"
                          />
                          <div>
                            <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                              {user.name}
                              {isCurrentUser && (
                                <span className="bg-green-100 text-green-800 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase font-mono">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-400 truncate max-w-[200px]" title={user.email}>
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getRoleBadgeClass(
                            user.role
                          )}`}
                        >
                          {user.role}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-xs">
                        {user.role === "Vendor" ? (
                          <span className="flex items-center gap-1 text-gray-700 font-medium">
                            <Building className="w-3.5 h-3.5 text-green-500 shrink-0" />
                            {vendors.find((v) => v.id === user.vendorId)?.name || "Unassigned"}
                          </span>
                        ) : (
                          <span className="text-gray-400 font-mono italic">Internal HQ</span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                            isDeactivated
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : "bg-green-50 text-green-700 border border-green-200"
                          }`}
                        >
                          {isDeactivated ? "Deactivated" : "Active"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleStartEdit(user)}
                            className="p-1.5 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-colors cursor-pointer"
                            title="Edit User Details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              if (isCurrentUser) {
                                alert("Governance Error: Deactivating your own active session account is disallowed.");
                                return;
                              }
                              toggleUserStatus(user.id);
                            }}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              isDeactivated
                                ? "border-green-200 hover:border-green-400 hover:bg-green-50 text-green-500 hover:text-green-600"
                                : "border-red-200 hover:border-red-400 hover:bg-red-50 text-red-500 hover:text-red-655"
                            }`}
                            title={isDeactivated ? "Activate Account" : "Deactivate Account"}
                            disabled={isCurrentUser}
                          >
                            {isDeactivated ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 pt-4">
            <span className="text-xs text-gray-500 font-sans">
              Showing <strong className="text-gray-800">{startIndex + 1}</strong> to{" "}
              <strong className="text-gray-800">
                {Math.min(startIndex + itemsPerPage, filteredUsers.length)}
              </strong>{" "}
              of <strong className="text-gray-800">{filteredUsers.length}</strong> records
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    currentPage === i + 1
                      ? "bg-green-600 text-white shadow-sm shadow-green-200"
                      : "border border-gray-200 hover:bg-gray-50 text-gray-600"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xl max-w-md w-full p-6 relative animate-slide-in">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-5 flex items-center gap-2 border-b border-gray-100 pb-3">
              <UserPlus className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-bold text-gray-900 font-display">Create User Account</h3>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter user name"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    System Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => {
                      const newRole = e.target.value as UserRole;
                      setRole(newRole);
                      if (newRole === "Vendor" && vendors.length > 0 && !vendorId) {
                        setVendorId(vendors[0].id);
                      }
                    }}
                    className="w-full bg-gray-55 border border-gray-200 rounded-xl px-2.5 py-2 text-xs text-gray-850 focus:outline-none focus:ring-1 focus:ring-green-500 font-sans cursor-pointer hover:bg-gray-50"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Procurement Officer">Procurement Officer</option>
                    <option value="Manager">Manager</option>
                    <option value="Vendor">Vendor</option>
                  </select>
                </div>

                {role === "Vendor" && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Link Vendor
                    </label>
                    <select
                      value={vendorId}
                      onChange={(e) => setVendorId(e.target.value)}
                      className="w-full bg-gray-55 border border-gray-200 rounded-xl px-2.5 py-2 text-xs text-gray-855 focus:outline-none focus:ring-1 focus:ring-green-500 font-sans cursor-pointer hover:bg-gray-50"
                    >
                      {vendors.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name.length > 20 ? `${v.name.slice(0, 18)}...` : v.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Avatar Preset Select */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Select User Avatar
                </label>
                <div className="flex items-center gap-3 overflow-x-auto py-1">
                  {presetAvatars.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setAvatar(url)}
                      className={`relative rounded-full shrink-0 border-2 transition-all p-0.5 cursor-pointer ${
                        avatar === url
                          ? "border-green-600 scale-105 shadow-sm"
                          : "border-transparent hover:border-gray-300"
                      }`}
                    >
                      <img src={url} alt="Preset avatar" className="w-10 h-10 rounded-full object-cover" />
                      {avatar === url && (
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-600 text-white rounded-full flex items-center justify-center border border-white">
                          <CheckCircle className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 border-t border-gray-100 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-green-200 cursor-pointer"
                >
                  Confirm Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingUser && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xl max-w-md w-full p-6 relative animate-slide-in">
            <button
              onClick={() => setEditingUser(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-5 flex items-center gap-2 border-b border-gray-100 pb-3">
              <Edit2 className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900 font-display">Edit User Account</h3>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter user name"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-gray-55 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-gray-55 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    System Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => {
                      const newRole = e.target.value as UserRole;
                      setRole(newRole);
                      if (newRole === "Vendor" && vendors.length > 0 && !vendorId) {
                        setVendorId(vendors[0].id);
                      }
                    }}
                    className="w-full bg-gray-55 border border-gray-200 rounded-xl px-2.5 py-2 text-xs text-gray-850 focus:outline-none focus:ring-1 focus:ring-green-500 font-sans cursor-pointer hover:bg-gray-50"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Procurement Officer">Procurement Officer</option>
                    <option value="Manager">Manager</option>
                    <option value="Vendor">Vendor</option>
                  </select>
                </div>

                {role === "Vendor" && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                      Link Vendor
                    </label>
                    <select
                      value={vendorId}
                      onChange={(e) => setVendorId(e.target.value)}
                      className="w-full bg-gray-55 border border-gray-200 rounded-xl px-2.5 py-2 text-xs text-gray-855 focus:outline-none focus:ring-1 focus:ring-green-500 font-sans cursor-pointer hover:bg-gray-50"
                    >
                      {vendors.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name.length > 20 ? `${v.name.slice(0, 18)}...` : v.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Avatar Preset Select */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Select User Avatar
                </label>
                <div className="flex items-center gap-3 overflow-x-auto py-1">
                  {presetAvatars.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setAvatar(url)}
                      className={`relative rounded-full shrink-0 border-2 transition-all p-0.5 cursor-pointer ${
                        avatar === url
                          ? "border-blue-600 scale-105 shadow-sm"
                          : "border-transparent hover:border-gray-300"
                      }`}
                    >
                      <img src={url} alt="Preset avatar" className="w-10 h-10 rounded-full object-cover" />
                      {avatar === url && (
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-blue-600 text-white rounded-full flex items-center justify-center border border-white">
                          <CheckCircle className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 border-t border-gray-100 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-200 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
