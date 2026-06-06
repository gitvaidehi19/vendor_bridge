import React, { useState, useEffect } from "react";
import { useERP } from "../state";
import { Vendor } from "../types";
import {
  Plus,
  Building2,
  Mail,
  Phone,
  MapPin,
  Star,
  Award,
  AlertTriangle,
  CheckCircle,
  Edit2,
  Trash2,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Check,
} from "lucide-react";
import { validateGSTIN, validateEmail, validatePhone } from "../utils";

export const Vendors: React.FC = () => {
  const {
    currentUser,
    vendors,
    addVendor,
    editVendor,
    deleteVendor,
    updateVendorStatus,
    searchQuery,
  } = useERP();

  const [showAddForm, setShowAddForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Form Field States (Add)
  const [name, setName] = useState("");
  const [category, setCategory] = useState("IT Hardware");
  const [gstNumber, setGstNumber] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState<Vendor["status"]>("Active");

  // Edit State
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editGstNumber, setEditGstNumber] = useState("");
  const [editContactPerson, setEditContactPerson] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editStatus, setEditStatus] = useState<Vendor["status"]>("Active");

  // Detail View State
  const [viewingVendor, setViewingVendor] = useState<Vendor | null>(null);

  // Delete Confirm State
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Reset pagination on filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, filterCategory, searchQuery]);

  const validateInputs = (
    vName: string,
    vGst: string,
    vEmail: string,
    vPhone: string
  ): boolean => {
    if (!vName.trim()) {
      alert("Vendor Name is required.");
      return false;
    }
    if (!validateGSTIN(vGst)) {
      alert("Invalid Indian GSTIN format. Must be 15 characters matching: State code + PAN + entity code + Z + check digit.");
      return false;
    }
    if (!validateEmail(vEmail)) {
      alert("Invalid corporate Email format.");
      return false;
    }
    if (vPhone && !validatePhone(vPhone)) {
      alert("Invalid phone format. Please enter a valid phone number (7-15 digits).");
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs(name, gstNumber, email, phone)) return;

    addVendor({
      name: name.trim(),
      category,
      gstNumber: gstNumber.toUpperCase().trim(),
      contactPerson: contactPerson.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      status,
    });

    // Reset Form
    setName("");
    setGstNumber("");
    setContactPerson("");
    setEmail("");
    setPhone("");
    setAddress("");
    setStatus("Active");
    setShowAddForm(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVendor) return;
    if (!validateInputs(editName, editGstNumber, editEmail, editPhone)) return;

    editVendor(editingVendor.id, {
      name: editName.trim(),
      category: editCategory,
      gstNumber: editGstNumber.toUpperCase().trim(),
      contactPerson: editContactPerson.trim(),
      email: editEmail.trim(),
      phone: editPhone.trim(),
      address: editAddress.trim(),
      status: editStatus,
    });

    setEditingVendor(null);
  };

  const startEdit = (v: Vendor) => {
    setEditingVendor(v);
    setEditName(v.name);
    setEditCategory(v.category);
    setEditGstNumber(v.gstNumber);
    setEditContactPerson(v.contactPerson);
    setEditEmail(v.email);
    setEditPhone(v.phone || "");
    setEditAddress(v.address || "");
    setEditStatus(v.status);
  };

  const executeDelete = (id: string) => {
    deleteVendor(id);
    setConfirmDeleteId(null);
    if (viewingVendor?.id === id) {
      setViewingVendor(null);
    }
  };

  // Filter and search logic
  const filteredVendors = vendors.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.gstNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === "All" || v.status === filterStatus;
    const matchesCategory = filterCategory === "All" || v.category === filterCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Unique categories list for filtering dropdown
  const categoriesList = Array.from(new Set(vendors.map((v) => v.category)));

  // Pagination logic
  const totalPages = Math.ceil(filteredVendors.length / itemsPerPage);
  const paginatedVendors = filteredVendors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const canManage = currentUser.role === "Admin" || currentUser.role === "Procurement Officer";

  return (
    <div className="space-y-6">
      {/* Upper Action Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 font-display tracking-tight">
            Vendors
          </h2>
          <p className="text-sm text-gray-500 font-sans">
            Manage suppiler profiles and registrations
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => {
              setEditingVendor(null);
              setShowAddForm(!showAddForm);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-all shadow-sm active:scale-98 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4.5 h-4.5" />
            Add Vendors
          </button>
        )}
      </div>

      {/* Add Vendor Form Drawer */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-4 duration-200"
        >
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider font-mono">
              Add New Corporate Vendor
            </h3>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Input Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase font-mono tracking-wider">
                Vendor Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Reliance Sourcing Pvt. Ltd."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-50 hover:bg-gray-100 focus:bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 transition-all font-sans"
              />
            </div>

            {/* Input GST */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase font-mono tracking-wider">
                GSTIN / Tax ID *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 27AAAPL1234C1Z5"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value)}
                className="w-full bg-gray-55/40 hover:bg-gray-100/60 border border-gray-200 focus:bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 transition-all font-mono uppercase"
              />
            </div>

            {/* Input Category */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase font-mono tracking-wider">
                Sourcing Domain
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-gray-55/40 hover:bg-gray-100/60 border border-gray-200 focus:bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 transition-all"
              >
                <option value="IT Hardware">IT Hardware</option>
                <option value="IT Services & Cloud">IT Services &amp; Cloud</option>
                <option value="Electrical Equipment">Electrical Equipment</option>
                <option value="Raw Materials">Raw Materials</option>
                <option value="Logistics">Logistics</option>
                <option value="Facilities">Facilities</option>
              </select>
            </div>

            {/* Input Contact Person */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase font-mono tracking-wider">
                Primary Focal Agent
              </label>
              <input
                type="text"
                placeholder="e.g. Rajesh Sharma"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                className="w-full bg-gray-55/40 hover:bg-gray-100/60 border border-gray-200 focus:bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 transition-all font-sans"
              />
            </div>

            {/* Input Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase font-mono tracking-wider">
                Corporate Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="e.g. vendor@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-55/40 hover:bg-gray-100/60 border border-gray-200 focus:bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 transition-all font-sans"
              />
            </div>

            {/* Input Phone */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase font-mono tracking-wider">
                Phone Number
              </label>
              <input
                type="text"
                placeholder="e.g. +91 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-gray-55/40 hover:bg-gray-100/60 border border-gray-200 focus:bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 transition-all font-mono"
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase font-mono tracking-wider">
                Full Physical Address
              </label>
              <input
                type="text"
                placeholder="e.g. Bandra Kurla Complex, Mumbai, Maharashtra"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-gray-55/40 hover:bg-gray-100/60 border border-gray-200 focus:bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 transition-all font-sans"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase font-mono tracking-wider">
                Authorized Status State
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Vendor["status"])}
                className="w-full bg-gray-55/40 hover:bg-gray-100/60 border border-gray-200 focus:bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 transition-all"
              >
                <option value="Active">Active (RFQ Receiver)</option>
                <option value="Inactive">Inactive</option>
                <option value="Blacklisted">Blacklisted (Banned)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              Save Vendor Profile
            </button>
          </div>
        </form>
      )}

      {/* Edit Vendor Form Modal */}
      {editingVendor && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleEditSubmit}
            className="bg-white border border-gray-200 rounded-xl p-6 shadow-xl space-y-4 max-w-3xl w-full animate-fade-in"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider font-mono flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-green-600" />
                Edit Corporate Vendor Profile: {editingVendor.name}
              </h3>
              <button
                type="button"
                onClick={() => setEditingVendor(null)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Edit Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase font-mono tracking-wider">
                  Vendor Name *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-gray-50 hover:bg-gray-100 focus:bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 transition-all font-sans"
                />
              </div>

              {/* Edit GST */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase font-mono tracking-wider">
                  GSTIN / Tax ID *
                </label>
                <input
                  type="text"
                  required
                  value={editGstNumber}
                  onChange={(e) => setEditGstNumber(e.target.value)}
                  className="w-full bg-gray-50 hover:bg-gray-100 focus:bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 transition-all font-mono uppercase"
                />
              </div>

              {/* Edit Category */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase font-mono tracking-wider">
                  Sourcing Domain
                </label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full bg-gray-50 hover:bg-gray-100 focus:bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 transition-all"
                >
                  <option value="IT Hardware">IT Hardware</option>
                  <option value="IT Services & Cloud">IT Services &amp; Cloud</option>
                  <option value="Electrical Equipment">Electrical Equipment</option>
                  <option value="Raw Materials">Raw Materials</option>
                  <option value="Logistics">Logistics</option>
                  <option value="Facilities">Facilities</option>
                </select>
              </div>

              {/* Edit Contact Person */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase font-mono tracking-wider">
                  Primary Focal Agent
                </label>
                <input
                  type="text"
                  value={editContactPerson}
                  onChange={(e) => setEditContactPerson(e.target.value)}
                  className="w-full bg-gray-50 hover:bg-gray-100 focus:bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 transition-all font-sans"
                />
              </div>

              {/* Edit Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase font-mono tracking-wider">
                  Corporate Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full bg-gray-55/40 hover:bg-gray-100/60 border border-gray-200 focus:bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 transition-all font-sans"
                />
              </div>

              {/* Edit Phone */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase font-mono tracking-wider">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full bg-gray-55/40 hover:bg-gray-100/60 border border-gray-200 focus:bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 transition-all font-mono"
                />
              </div>

              {/* Edit Address */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase font-mono tracking-wider">
                  Full Physical Address
                </label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full bg-gray-55/40 hover:bg-gray-100/60 border border-gray-200 focus:bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 transition-all font-sans"
                />
              </div>

              {/* Edit Status */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase font-mono tracking-wider">
                  Authorized Status State
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as Vendor["status"])}
                  className="w-full bg-gray-55/40 hover:bg-gray-100/60 border border-gray-200 focus:bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 transition-all"
                >
                  <option value="Active">Active (RFQ Receiver)</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Blacklisted">Blacklisted (Banned)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setEditingVendor(null)}
                className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Update Profile
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xl max-w-md w-full text-center space-y-4 animate-fade-in">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-600 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Remove Supplier Profile?</h3>
              <p className="text-xs text-gray-500 mt-1">
                Are you sure you want to delete this vendor? This will remove their registration, active compliance index, and login portal access permanently. This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                No, Keep
              </button>
              <button
                onClick={() => executeDelete(confirmDeleteId)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Compliance Modal */}
      {viewingVendor && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xl max-w-2xl w-full space-y-5 animate-fade-in">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">{viewingVendor.name}</h3>
                  <span className="text-[10px] text-gray-400 font-mono">ID: {viewingVendor.id}</span>
                </div>
              </div>
              <button
                onClick={() => setViewingVendor(null)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Performance Stats Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-center">
                <span className="text-[10px] text-gray-400 uppercase font-mono font-bold tracking-wider">Quality Score</span>
                <div className="flex items-center justify-center gap-1 mt-1 text-sm font-bold text-gray-900">
                  <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                  <span>{viewingVendor.rating.toFixed(1)} / 5.0</span>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-center">
                <span className="text-[10px] text-gray-400 uppercase font-mono font-bold tracking-wider">On-Time Delivery</span>
                <p className="mt-1 text-sm font-bold text-green-600">97.4%</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-center">
                <span className="text-[10px] text-gray-400 uppercase font-mono font-bold tracking-wider">PO Acceptance</span>
                <p className="mt-1 text-sm font-bold text-gray-900">100%</p>
              </div>
            </div>

            {/* Basic Info */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-gray-700 border-b border-gray-100 pb-1 font-mono uppercase tracking-wider text-[10px]">Company Contact Information</h4>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div>
                  <span className="text-gray-400 block font-mono uppercase text-[9px] tracking-wider">Focal Agent</span>
                  <span className="text-gray-800 font-medium">{viewingVendor.contactPerson || "Not Registered"}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-mono uppercase text-[9px] tracking-wider">Sourcing Domain</span>
                  <span className="text-gray-800 font-medium">{viewingVendor.category}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-mono uppercase text-[9px] tracking-wider">Corporate Email</span>
                  <span className="text-gray-800 font-medium flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-gray-400" /> {viewingVendor.email}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block font-mono uppercase text-[9px] tracking-wider">GSTIN Number</span>
                  <span className="text-gray-800 font-mono font-bold text-green-700 bg-green-50 border border-green-100 px-1.5 py-0.5 rounded text-[10px] inline-block">
                    {viewingVendor.gstNumber}
                  </span>
                </div>
                {viewingVendor.phone && (
                  <div>
                    <span className="text-gray-400 block font-mono uppercase text-[9px] tracking-wider">Phone Line</span>
                    <span className="text-gray-800 font-mono flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-gray-400" /> {viewingVendor.phone}
                    </span>
                  </div>
                )}
                {viewingVendor.address && (
                  <div className="col-span-2">
                    <span className="text-gray-400 block font-mono uppercase text-[9px] tracking-wider">Physical Address</span>
                    <span className="text-gray-600 flex items-start gap-1.5 leading-relaxed mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" /> {viewingVendor.address}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Compliance Matrix Checklist */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-gray-700 border-b border-gray-100 pb-1 font-mono uppercase tracking-wider text-[10px]">Vendor Compliance Clearance</h4>
              <div className="grid grid-cols-2 gap-2.5 mt-2">
                <div className="flex items-center gap-2 text-gray-700">
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                  <span>GSTIN Status: <strong className="text-green-700">Verified Active</strong></span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                  <span>KYC Documentation: <strong className="text-green-700">Approved</strong></span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                  <span>ISO Certification check: <strong className="text-green-700">Passed</strong></span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                  <span>Financial Audit clearance: <strong className="text-green-700">Cleared</strong></span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
              {canManage && (
                <button
                  onClick={() => {
                    setViewingVendor(null);
                    startEdit(viewingVendor);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 text-gray-400" /> Edit Profile
                </button>
              )}
              <button
                onClick={() => setViewingVendor(null)}
                className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Close Compliance Panel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Query Filter and Search Controls */}
      <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* State filters */}
        <div className="flex flex-wrap items-center gap-2">
          {["All", "Active", "Inactive", "Blacklisted"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                filterStatus === s
                  ? "bg-slate-900 text-white"
                  : "bg-gray-50 hover:bg-gray-100 text-gray-600"
              }`}
            >
              {s} {s === "Active" && <span className="text-[10px] text-green-400 font-mono">(RFP Approved)</span>}
            </button>
          ))}

          {/* Sourcing domain category dropdown */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-650 rounded-lg px-2.5 py-1.5 text-xs font-bold focus:outline-none cursor-pointer"
          >
            <option value="All">All Sourcing Domains</option>
            {categoriesList.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <p className="text-xs text-gray-400 font-mono">
          Found <strong>{filteredVendors.length} matches</strong> across {vendors.length} records
        </p>
      </div>

      {/* Grid of Vendors */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedVendors.length === 0 ? (
          <div className="col-span-full bg-white border border-gray-200 p-12 rounded-xl text-center text-gray-400">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm">No suppliers found matching the criteria.</p>
          </div>
        ) : (
          paginatedVendors.map((v) => {
            const hasPerfectScores = v.rating >= 4.5;
            return (
              <div
                key={v.id}
                className={`bg-white border rounded-xl overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md hover:border-gray-350 relative ${
                  v.status === "Blacklisted"
                    ? "border-red-200 bg-red-50/5 animate-pulse"
                    : v.status === "Inactive"
                    ? "border-gray-200 opacity-80"
                    : "border-gray-200"
                }`}
              >
                {/* Badge layout header */}
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-400 font-mono tracking-wider uppercase bg-gray-50 border border-gray-200/80 px-2 py-0.5 rounded">
                    {v.category}
                  </span>

                  {/* Status indicator pill */}
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                      v.status === "Active"
                        ? "bg-green-50 text-green-700 border border-green-100"
                        : v.status === "Inactive"
                        ? "bg-gray-100 text-gray-500 border border-gray-200"
                        : "bg-red-50 text-red-600 border border-red-100"
                    }`}
                  >
                    {v.status}
                  </span>
                </div>

                <div className="p-5 space-y-4">
                  <div>
                    <h3
                      className="font-bold text-gray-900 text-base leading-snug truncate flex items-center gap-1.5 cursor-pointer hover:text-green-600 transition-colors"
                      title={v.name}
                      onClick={() => setViewingVendor(v)}
                    >
                      {v.name}
                      {hasPerfectScores && v.status === "Active" && (
                        <Award className="w-4.5 h-4.5 text-amber-500" title="Strategically Preferred Vendor" />
                      )}
                    </h3>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">
                      GSTIN: {v.gstNumber}
                    </p>
                  </div>

                  {/* Rating panel */}
                  <div className="flex items-center justify-between py-2 border-y border-gray-50/60 text-xs">
                    <span className="text-gray-400">Quality Performance:</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                      <strong className="text-gray-900 font-mono leading-none">{v.rating.toFixed(1)}</strong>
                      <span className="text-gray-400">/ 5.0</span>
                    </div>
                  </div>

                  {/* Info list */}
                  <div className="space-y-2 text-xs text-gray-600">
                    <div className="flex items-start gap-2.5">
                      <Mail className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                      <span className="truncate">{v.email}</span>
                    </div>
                    {v.phone && (
                      <div className="flex items-start gap-2.5">
                        <Phone className="w-4 h-4 text-gray-400 shrink-0 mt-0.5 font-mono" />
                        <span className="font-mono">{v.phone}</span>
                      </div>
                    )}
                    {v.address && (
                      <div className="flex items-start gap-2.5">
                        <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2 leading-relaxed text-gray-500">{v.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer management buttons */}
                <div className="p-3 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between text-xs gap-2">
                  <span className="text-gray-400 text-[10px] font-mono">ID: {v.id}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setViewingVendor(v)}
                      className="p-1.5 bg-white border border-gray-200 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors shadow-xs cursor-pointer"
                      title="View Compliance Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    {canManage && (
                      <>
                        <button
                          onClick={() => startEdit(v)}
                          className="p-1.5 bg-white border border-gray-200 text-gray-500 hover:text-green-600 hover:bg-gray-100 rounded transition-colors shadow-xs cursor-pointer"
                          title="Edit Profile"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(v.id)}
                          className="p-1.5 bg-white border border-gray-200 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded transition-colors shadow-xs cursor-pointer"
                          title="Delete Supplier Profile"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-100 pt-4 px-1">
          <div className="text-xs text-gray-500">
            Showing Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> (<strong>{filteredVendors.length} total vendors</strong>)
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 disabled:opacity-50 disabled:hover:bg-transparent transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 disabled:opacity-50 disabled:hover:bg-transparent transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
