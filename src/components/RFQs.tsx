import React, { useState, useEffect } from "react";
import { useERP } from "../state";
import { RFQItem, RFQ, RFQStatus, Vendor } from "../types";
import {
  FileText,
  FileSpreadsheet,
  Clock,
  Plus,
  Trash,
  Send,
  Users,
  Search,
  Upload,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  ShieldAlert,
  Edit2,
  Trash2,
  Copy,
  X,
  Award,
  CheckCircle,
  CheckCircle2,
} from "lucide-react";
import { formatINR } from "../utils";

export const RFQs: React.FC = () => {
  const {
    currentUser,
    rfqs,
    vendors,
    createRFQ,
    editRFQ,
    deleteRFQ,
    duplicateRFQ,
    assignVendorsToRFQ,
    searchQuery,
    setTab,
  } = useERP();

  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);
  const [showWizard, setShowWizard] = useState(false);
  const [selectedRfqToView, setSelectedRfqToView] = useState<RFQ | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Form states (Add Sourcing Campaign)
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("IT Hardware");
  const [priority, setPriority] = useState<RFQ["priority"]>("Medium");
  const [deadline, setDeadline] = useState("");
  const [items, setItems] = useState<Omit<RFQItem, "id">[]>([
    { item: "", qty: 1, unit: "Units", targetPrice: 0, hsn: "" },
  ]);
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [estimatedBudget, setEstimatedBudget] = useState<number>(500000);
  const [saveIndicator, setSaveIndicator] = useState("Draft saved 2 mins ago");

  // Edit States
  const [editingRfq, setEditingRfq] = useState<RFQ | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editPriority, setEditPriority] = useState<RFQ["priority"]>("Medium");
  const [editDeadline, setEditDeadline] = useState("");
  const [editItems, setEditItems] = useState<RFQItem[]>([]);
  const [editSelectedVendors, setEditSelectedVendors] = useState<string[]>([]);
  const [editEstimatedBudget, setEditEstimatedBudget] = useState<number>(0);

  // Delete Confirm State
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Reset pagination on search
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Sync selected RFQ details if updated globally
  useEffect(() => {
    if (selectedRfqToView) {
      const updated = rfqs.find((r) => r.id === selectedRfqToView.id);
      if (updated) setSelectedRfqToView(updated);
    }
  }, [rfqs, selectedRfqToView]);

  // Update save indicator dynamically when form values change
  useEffect(() => {
    if (title || items.length > 1 || selectedVendors.length > 0) {
      setSaveIndicator("Draft saved just now");
    }
  }, [title, description, category, priority, deadline, items, selectedVendors, estimatedBudget]);

  // Category Icons Map Helper
  const getCategoryEmoji = (cat: string) => {
    switch (cat) {
      case "IT Hardware":
        return "💻";
      case "IT Services & Cloud":
        return "☁";
      case "Electrical Equipment":
        return "⚡";
      case "Raw Materials":
        return "🧱";
      case "Logistics":
        return "🚚";
      case "Facilities":
        return "🏢";
      default:
        return "📦";
    }
  };

  // Timeline days remaining calculator
  const getDaysRemaining = (dl: string) => {
    if (!dl) return "Not set";
    const diff = new Date(dl).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days} Days` : "Expired";
  };

  // Line Item Handlers for Wizard
  const handleAddLineItem = () => {
    setItems([...items, { item: "", qty: 1, unit: "Units", targetPrice: 0, hsn: "" }]);
  };

  const handleRemoveLineItem = (index: number) => {
    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated);
  };

  const handleUpdateLineItem = (index: number, field: keyof Omit<RFQItem, "id">, value: any) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setItems(updated);
  };

  // Line Item Handlers for Edit Modal
  const handleAddEditLineItem = () => {
    setEditItems([
      ...editItems,
      { id: `item-${Date.now()}-${editItems.length}`, item: "", qty: 1, unit: "Units", targetPrice: 0, hsn: "" },
    ]);
  };

  const handleRemoveEditLineItem = (index: number) => {
    const updated = [...editItems];
    updated.splice(index, 1);
    setEditItems(updated);
  };

  const handleUpdateEditLineItem = (index: number, field: keyof RFQItem, value: any) => {
    const updated = [...editItems];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setEditItems(updated);
  };

  // Save RFQ as a Draft (from Wizard)
  const handleSaveDraft = () => {
    if (!title) {
      alert("Please provide an RFQ Sourcing Title to save a draft.");
      return;
    }
    const itemsWithIds: RFQItem[] = items.map((it, idx) => ({
      ...it,
      id: `item-${Date.now()}-${idx}`,
    }));

    const draftNumber = createRFQ({
      title,
      description,
      category,
      priority,
      deadline,
      items: itemsWithIds,
      attachments: ["SOW_Standard_Specification.pdf"],
      assignedVendors: [],
      estimatedBudget,
    });

    resetWizard();
    alert(`Success!\nRFQ Draft ${draftNumber} initialized successfully.`);
  };

  // Publish RFP & Invite Vendors (from Wizard)
  const handleLaunchRFP = () => {
    if (!title || !deadline) {
      alert("Please provide an RFQ Title and a target Submission Deadline.");
      return;
    }
    if (selectedVendors.length === 0) {
      alert("Please map at least one vendor to launch this campaign.");
      return;
    }

    const itemsWithIds: RFQItem[] = items.map((it, idx) => ({
      ...it,
      id: `item-${Date.now()}-${idx}`,
    }));

    const draftNumber = createRFQ({
      title,
      description,
      category,
      priority,
      deadline,
      items: itemsWithIds,
      attachments: ["SOW_Standard_Specification.pdf"],
      assignedVendors: [],
      estimatedBudget,
    });

    assignVendorsToRFQ(draftNumber, selectedVendors);
    resetWizard();
    alert(`Success!\nRFQ ${draftNumber} published successfully. Invited ${selectedVendors.length} active vendors.`);
  };

  const resetWizard = () => {
    setTitle("");
    setDescription("");
    setCategory("IT Hardware");
    setPriority("Medium");
    setDeadline("");
    setItems([{ item: "", qty: 1, unit: "Units", targetPrice: 0, hsn: "" }]);
    setSelectedVendors([]);
    setEstimatedBudget(500000);
    setActiveStep(1);
    setShowWizard(false);
  };

  // Submit Edit form
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRfq) return;
    if (!editTitle || !editDeadline) {
      alert("Title and Submission Deadline are required.");
      return;
    }

    editRFQ(editingRfq.id, {
      title: editTitle.trim(),
      description: editDescription.trim(),
      category: editCategory,
      priority: editPriority,
      deadline: editDeadline,
      items: editItems,
      assignedVendors: editSelectedVendors,
      estimatedBudget: editEstimatedBudget,
    });

    // If status is Draft and we assigned vendors during edit, we can automatically transition it to Open
    if (editingRfq.status === "Draft" && editSelectedVendors.length > 0) {
      assignVendorsToRFQ(editingRfq.id, editSelectedVendors);
    }

    setEditingRfq(null);
    setSelectedRfqToView(null);
  };

  const startEdit = (rfq: RFQ) => {
    setEditingRfq(rfq);
    setEditTitle(rfq.title);
    setEditDescription(rfq.description);
    setEditCategory(rfq.category);
    setEditPriority(rfq.priority);
    setEditDeadline(rfq.deadline);
    setEditItems(rfq.items);
    setEditSelectedVendors(rfq.assignedVendors);
    setEditEstimatedBudget(rfq.estimatedBudget || 0);
  };

  const handleDuplicate = (id: string) => {
    const newId = duplicateRFQ(id);
    if (newId) {
      alert(`RFQ ${id} duplicated as draft ${newId}.`);
      setSelectedRfqToView(null);
    }
  };

  const handleExecuteDelete = (id: string) => {
    deleteRFQ(id);
    setConfirmDeleteId(null);
    setSelectedRfqToView(null);
  };

  // Filter RFQs based on global search + roles
  const filteredRfqs = rfqs.filter((r) => {
    const matchesSearch =
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.status.toLowerCase().includes(searchQuery.toLowerCase());

    if (currentUser.role === "Vendor") {
      const isAssigned = r.assignedVendors.includes(currentUser.vendorId || "");
      const isPublished = r.status !== "Draft";
      return matchesSearch && isAssigned && isPublished;
    }

    return matchesSearch;
  });

  // Unique category active vendors list
  const categoryActiveVendors = vendors.filter(
    (v) => v.category === (editingRfq ? editCategory : category) && v.status === "Active"
  );

  const toggleVendorSelection = (vId: string) => {
    if (editingRfq) {
      setEditSelectedVendors((prev) =>
        prev.includes(vId) ? prev.filter((id) => id !== vId) : [...prev, vId]
      );
    } else {
      setSelectedVendors((prev) =>
        prev.includes(vId) ? prev.filter((id) => id !== vId) : [...prev, vId]
      );
    }
  };

  // Pagination calculation
  const totalPages = Math.ceil(filteredRfqs.length / itemsPerPage);
  const paginatedRfqs = filteredRfqs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusColor = (status: RFQStatus) => {
    switch (status) {
      case "Draft":
        return "bg-gray-100 text-gray-750 border-gray-200";
      case "Open":
        return "bg-green-50 text-green-700 border-green-100";
      case "Vendor Responses Received":
        return "bg-purple-50 text-purple-700 border-purple-150";
      case "Vendor Selected":
        return "bg-cyan-50 text-cyan-700 border-cyan-150";
      case "Pending Approval":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Approved":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "PO Generated":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "Invoice Generated":
        return "bg-teal-50 text-teal-800 border-teal-200";
      case "Closed":
        return "bg-slate-105 text-slate-700 border-slate-200";
      case "Rejected":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const isOfficer = currentUser.role === "Procurement Officer" || currentUser.role === "Admin";

  return (
    <div className="space-y-6">
      {/* Upper Action Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 font-display tracking-tight">
            Request for Quotation (RFQ) Engine
          </h2>
          <p className="text-sm text-gray-500 font-sans">
            Initiate, track, and coordinate sourcing requests with suppliers.
          </p>
        </div>
        {isOfficer && !showWizard && !selectedRfqToView && (
          <button
            onClick={() => {
              setEditingRfq(null);
              setShowWizard(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-all shadow-sm active:scale-98 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4.5 h-4.5" />
            Create Sourcing RFP
          </button>
        )}
      </div>

      {/* Multi-step RFP wizard layout split 70/30 */}
      {showWizard && (
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 animate-in fade-in duration-200">
          {/* Form Wizard Panel (70%) */}
          <div className="lg:col-span-7 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col justify-between">
            {/* Document Header panel */}
            <div className="p-6 border-b border-gray-100 bg-gray-50/25 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-black text-xs text-green-600 bg-green-50 border border-green-150 px-2.5 py-0.5 rounded-md">
                    RFQ-2026-{String(rfqs.length + 1).padStart(4, "0")}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono bg-yellow-50 text-yellow-700 border border-yellow-200">
                    🟡 Draft
                  </span>
                </div>
                <h3 className="text-base font-black text-gray-900 font-display tracking-tight">
                  {title || "New Request for Quotation"}
                </h3>
              </div>

              {/* Sourcing Timeline */}
              <div className="flex items-center gap-6 text-xs border-l-0 md:border-l border-gray-200 pl-0 md:pl-6 shrink-0">
                <div className="text-left">
                  <span className="text-gray-400 block text-[9px] uppercase font-mono">Created</span>
                  <span className="font-bold text-gray-800">06 Jun 2026</span>
                </div>
                <div className="text-left">
                  <span className="text-gray-400 block text-[9px] uppercase font-mono">Deadline</span>
                  <span className="font-bold text-gray-800">{deadline || "—"}</span>
                </div>
                <div className="text-left">
                  <span className="text-gray-400 block text-[9px] uppercase font-mono">Remaining</span>
                  <span className={`font-bold ${deadline ? "text-red-600 font-mono" : "text-gray-500"}`}>
                    {deadline ? getDaysRemaining(deadline) : "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Step Stepper navigation track */}
            <div className="flex items-center justify-between overflow-x-auto gap-4 text-xs text-gray-400 py-3.5 px-8 bg-gray-50/10 border-b border-gray-100 shrink-0">
              <span className={`flex items-center gap-1.5 font-bold ${activeStep === 1 ? "text-green-600 font-bold" : ""}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${activeStep === 1 ? "bg-green-600 text-white animate-pulse" : "bg-gray-200 text-gray-655"}`}>1</span>
                Details
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-300" />

              <span className={`flex items-center gap-1.5 font-bold ${activeStep === 2 ? "text-green-600 font-bold" : ""}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${activeStep === 2 ? "bg-green-600 text-white" : "bg-gray-200 text-gray-655"}`}>2</span>
                Items &amp; HSN
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-300" />

              <span className={`flex items-center gap-1.5 font-bold ${activeStep === 3 ? "text-green-600 font-bold" : ""}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${activeStep === 3 ? "bg-green-600 text-white" : "bg-gray-200 text-gray-655"}`}>3</span>
                Supplier Mapping
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-300" />

              <span className={`flex items-center gap-1.5 font-bold ${activeStep === 4 ? "text-green-600 font-bold" : ""}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${activeStep === 4 ? "bg-green-600 text-white" : "bg-gray-200 text-gray-655"}`}>4</span>
                Review &amp; Submit
              </span>
            </div>

            {/* Stepper forms */}
            <div className="p-8 flex-1">
              {/* Step 1: Details */}
              {activeStep === 1 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Title */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase font-mono tracking-wider">
                        RFP Sourcing Title *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Q4 Server Room UPS Batteries Upgrade"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 hover:bg-gray-100/60 focus:bg-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 transition-all font-sans text-gray-900 font-medium"
                      />
                    </div>

                    {/* Sourcing Category */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase font-mono tracking-wider">
                        Industry Category *
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 hover:bg-gray-100 focus:bg-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 transition-all"
                      >
                        <option value="IT Hardware">💻 IT Hardware</option>
                        <option value="IT Services & Cloud">☁ IT Services &amp; Cloud</option>
                        <option value="Electrical Equipment">⚡ Electrical Equipment</option>
                        <option value="Raw Materials">🧱 Raw Materials</option>
                        <option value="Logistics">🚚 Logistics</option>
                        <option value="Facilities">🏢 Facilities</option>
                      </select>
                    </div>

                    {/* Estimated Procurement Budget */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase font-mono tracking-wider">
                        Estimated Procurement Budget (₹) *
                      </label>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 500000"
                        value={estimatedBudget || ""}
                        onChange={(e) => setEstimatedBudget(parseFloat(e.target.value) || 0)}
                        className="w-full bg-gray-50 border border-gray-200 hover:bg-gray-100 focus:bg-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 transition-all font-mono text-gray-900 font-bold"
                      />
                    </div>

                    {/* Custom colored Priority selector */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase font-mono tracking-wider">
                        Priority Sourcing Class
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(["Low", "Medium", "High"] as const).map((lvl) => {
                          const getColors = () => {
                            if (lvl === "Low") {
                              return priority === lvl
                                ? "bg-gray-100 border-gray-400 text-gray-800 ring-2 ring-gray-200 font-black"
                                : "bg-white border-gray-200 text-gray-550 hover:bg-gray-50 font-semibold";
                            }
                            if (lvl === "Medium") {
                              return priority === lvl
                                ? "bg-orange-50 border-orange-400 text-orange-700 ring-2 ring-orange-100 font-black"
                                : "bg-white border-gray-200 text-gray-550 hover:bg-gray-50 font-semibold";
                            }
                            return priority === lvl
                              ? "bg-red-50 border-red-400 text-red-750 ring-2 ring-red-100 font-black"
                              : "bg-white border-gray-200 text-gray-550 hover:bg-gray-50 font-semibold";
                          };
                          return (
                            <button
                              key={lvl}
                              type="button"
                              onClick={() => setPriority(lvl)}
                              className={`py-2 px-3 text-xs rounded-lg border text-center transition-all cursor-pointer ${getColors()}`}
                            >
                              {lvl}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Deadline */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase font-mono tracking-wider">
                        Vendor Submission Deadline *
                      </label>
                      <input
                        type="date"
                        required
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 hover:bg-gray-100 focus:bg-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 transition-all font-mono"
                      />
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase font-mono tracking-wider">
                        Campaign Sourcing Scope Description
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Detailed explanation of requirements, compliance mandates, terms..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 hover:bg-gray-100 focus:bg-white rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 transition-all font-sans text-gray-800"
                      />
                    </div>

                    {/* Attachment Box */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase font-mono tracking-wider">
                        Attachments (SOW Specifications)
                      </label>
                      <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 flex items-center justify-center gap-3">
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                          <Upload className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <span className="text-xs font-bold text-gray-700 block">
                            SOW_Specifications_Standard.pdf
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">
                            Auto-attached baseline specification SOW
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Items & HSN */}
              {activeStep === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <span className="text-xs font-bold text-gray-500 uppercase font-mono tracking-wider">
                      Add Required Line Items &amp; HSN Codes
                    </span>
                    <button
                      type="button"
                      onClick={handleAddLineItem}
                      className="flex items-center gap-1.5 text-xs text-green-600 hover:text-green-700 font-bold cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Insert Item Row
                    </button>
                  </div>

                  <div className="space-y-3.5 max-h-80 overflow-y-auto pr-2">
                    {items.map((item, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-gray-50/50 p-4 rounded-xl border border-gray-200 relative animate-in fade-in duration-200"
                      >
                        {/* Name description */}
                        <div className="md:col-span-4">
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono mb-1">
                            Item Description *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Cisco L3 Managed Switches"
                            value={item.item}
                            onChange={(e) => handleUpdateLineItem(idx, "item", e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-green-500 text-gray-900 font-medium"
                          />
                        </div>

                        {/* HSN Code */}
                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-bold text-gray-400 tracking-widest uppercase font-mono mb-1">
                            HSN Code
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 847130"
                            value={item.hsn || ""}
                            onChange={(e) => handleUpdateLineItem(idx, "hsn", e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-green-500 font-mono text-center"
                          />
                        </div>

                        {/* Qty */}
                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-bold text-gray-400 tracking-widest uppercase font-mono mb-1">
                            Quantity
                          </label>
                          <input
                            type="number"
                            min={1}
                            required
                            value={item.qty}
                            onChange={(e) =>
                              handleUpdateLineItem(idx, "qty", parseInt(e.target.value) || 1)
                            }
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-green-500 font-mono text-center"
                          />
                        </div>

                        {/* Unit */}
                        <div className="md:col-span-1">
                          <label className="block text-[10px] font-bold text-gray-400 tracking-widest uppercase font-mono mb-1">
                            Unit
                          </label>
                          <input
                            type="text"
                            required
                            value={item.unit}
                            onChange={(e) => handleUpdateLineItem(idx, "unit", e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-green-500 text-center"
                          />
                        </div>

                        {/* Target Budget Price */}
                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-bold text-gray-400 tracking-widest uppercase font-mono mb-1">
                            Budget (₹)
                          </label>
                          <input
                            type="number"
                            placeholder="0"
                            value={item.targetPrice || ""}
                            onChange={(e) =>
                              handleUpdateLineItem(idx, "targetPrice", parseFloat(e.target.value) || 0)
                            }
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-green-500 font-mono text-right"
                          />
                        </div>

                        {/* Remove Row */}
                        <div className="md:col-span-1 flex items-end justify-center">
                          <button
                            type="button"
                            disabled={items.length === 1}
                            onClick={() => handleRemoveLineItem(idx)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Supplier Mapping */}
              {activeStep === 3 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="bg-green-50/75 border border-green-100 p-4 rounded-xl flex items-start gap-3">
                    <Users className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-green-900 leading-relaxed">
                      <strong>Supplier Coverage Mapping:</strong> The system identified{" "}
                      <strong>{categoryActiveVendors.length} active vendors</strong> registered in{" "}
                      <strong>{category}</strong>. Checking suppliers will invite them to submit quotation bids.
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-80 overflow-y-auto pr-1">
                    {categoryActiveVendors.length === 0 ? (
                      <div className="col-span-full border border-dashed border-gray-200 p-8 rounded-xl text-center text-gray-405">
                        <ShieldAlert className="w-10 h-10 text-gray-350 mx-auto mb-2" />
                        <p className="text-xs font-bold text-red-650">
                          Warning: No active suppliers found registered under "{category}".
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setShowWizard(false);
                            setTab("Vendors");
                          }}
                          className="mt-2 text-green-650 hover:underline font-semibold cursor-pointer"
                        >
                          Register new supplier in category
                        </button>
                      </div>
                    ) : (
                      categoryActiveVendors.map((vendor) => {
                        const isSelected = selectedVendors.includes(vendor.id);
                        return (
                          <div
                            key={vendor.id}
                            onClick={() => toggleVendorSelection(vendor.id)}
                            className={`p-4 border rounded-xl flex items-start gap-3.5 cursor-pointer hover:border-gray-300 transition-all ${
                              isSelected ? "border-green-500 bg-green-50/10" : "border-gray-200 bg-white"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              readOnly
                              className="mt-1 accent-green-600 cursor-pointer animate-pulse"
                            />
                            <div className="text-left">
                              <span className="font-bold text-gray-900 block leading-tight text-xs">
                                {vendor.name}
                              </span>
                              <span className="text-[10px] text-gray-400 font-mono">
                                GSTIN: {vendor.gstNumber} — Rating: ★ {vendor.rating.toFixed(1)}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: Review & Submit */}
              {activeStep === 4 && (
                <div className="space-y-6 animate-in fade-in duration-200 text-left">
                  <div className="bg-green-50/75 border border-green-100 p-4 rounded-xl flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5 animate-bounce" />
                    <div className="text-xs text-green-900 leading-relaxed">
                      <strong>Review &amp; Launch Campaign:</strong> Please review all RFQ details, line items, and supplier lists. Submit to publish this campaign to mapped vendor portals.
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Specs Summary */}
                    <div className="bg-gray-50/50 p-5 rounded-xl border border-gray-150 space-y-3">
                      <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider font-mono border-b border-gray-200 pb-2">
                        Campaign Specifications
                      </h4>
                      <div className="grid grid-cols-2 gap-y-2.5 text-xs text-gray-700">
                        <span className="text-gray-400">RFP Number</span>
                        <span className="font-mono font-bold text-green-600">RFQ-2026-{String(rfqs.length + 1).padStart(4, "0")}</span>

                        <span className="text-gray-400">Title</span>
                        <span className="font-bold text-gray-900">{title}</span>

                        <span className="text-gray-400">Category</span>
                        <span className="font-medium">{getCategoryEmoji(category)} {category}</span>

                        <span className="text-gray-400">Estimated Budget</span>
                        <span className="font-bold text-gray-900 font-mono">{formatINR(estimatedBudget)}</span>

                        <span className="text-gray-400">Priority</span>
                        <span className="font-bold text-gray-900">{priority}</span>

                        <span className="text-gray-400">Submission Deadline</span>
                        <span className="font-bold text-red-650 font-mono">{deadline}</span>

                        <span className="text-gray-400">Timeline Limit</span>
                        <span className="font-bold font-mono">{getDaysRemaining(deadline)}</span>
                      </div>
                    </div>

                    {/* Selected Suppliers */}
                    <div className="bg-gray-50/50 p-5 rounded-xl border border-gray-150 space-y-3">
                      <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider font-mono border-b border-gray-200 pb-2">
                        Assigned Suppliers ({selectedVendors.length})
                      </h4>
                      <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                        {selectedVendors.length === 0 ? (
                          <p className="text-xs text-gray-450 italic py-2">No suppliers selected.</p>
                        ) : (
                          selectedVendors.map((vId) => {
                            const v = vendors.find((vend) => vend.id === vId);
                            return (
                              <div key={vId} className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-gray-100 text-xs">
                                <span className="font-bold text-gray-850">{v?.name}</span>
                                <span className="text-gray-400 text-[10px] font-mono">★ {v?.rating.toFixed(1)}</span>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Line Items Summary */}
                    <div className="md:col-span-2 bg-gray-50/50 p-5 rounded-xl border border-gray-150 space-y-3">
                      <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider font-mono border-b border-gray-200 pb-2">
                        Line Item Details ({items.filter((i) => i.item).length} Positions)
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="text-gray-400 font-mono border-b border-gray-200 pb-1.5 uppercase tracking-wider text-[10px]">
                              <th className="pb-2">Description</th>
                              <th className="pb-2 text-center">HSN Code</th>
                              <th className="pb-2 text-center">Quantity</th>
                              <th className="pb-2 text-right">Target Price</th>
                              <th className="pb-2 text-right">Total Price</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {items
                              .filter((i) => i.item)
                              .map((item, idx) => (
                                <tr key={idx} className="text-gray-700">
                                  <td className="py-2.5 font-bold text-gray-900">{item.item}</td>
                                  <td className="py-2.5 text-center font-mono font-bold text-gray-600">{item.hsn || "—"}</td>
                                  <td className="py-2.5 text-center font-mono">
                                    {item.qty} {item.unit}
                                  </td>
                                  <td className="py-2.5 text-right font-mono">{formatINR(item.targetPrice || 0)}</td>
                                  <td className="py-2.5 text-right font-mono font-bold text-gray-900">
                                    {formatINR(item.qty * (item.targetPrice || 0))}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sourcing Actions bar footer */}
            <div className="px-8 py-4 border-t border-gray-100 bg-gray-50/60 flex items-center justify-between text-xs font-bold shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (activeStep === 1) {
                    resetWizard();
                  } else {
                    setActiveStep((activeStep - 1) as any);
                  }
                }}
                className="px-4 py-2 text-gray-655 hover:text-gray-950 inline-flex items-center gap-1 cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                {activeStep === 1 ? "Cancel & Close" : "Previous Stage"}
              </button>

              <div className="flex items-center gap-4">
                <span className="text-[11px] text-gray-400 font-mono font-semibold inline-flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                  {saveIndicator}
                </span>

                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="px-4 py-2 border border-gray-300 text-gray-750 bg-white hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                >
                  Save Draft
                </button>

                {activeStep < 4 ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (activeStep === 1 && !title) {
                        alert("Please provide Sourcing RFP Title.");
                        return;
                      }
                      if (activeStep === 3 && selectedVendors.length === 0) {
                        alert("Please select at least one vendor to continue.");
                        return;
                      }
                      setActiveStep((activeStep + 1) as any);
                    }}
                    className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
                  >
                    Continue
                    <ArrowRight className="w-4.5 h-4.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleLaunchRFP}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
                  >
                    <Send className="w-4 h-4" />
                    Submit RFQ
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Live RFQ Summary Panel (30%) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4 sticky top-20 text-left">
              <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-mono font-bold text-gray-500">Live RFQ Summary</span>
                <span className="px-2.5 py-0.5 bg-yellow-50 text-yellow-750 text-[9px] font-bold uppercase font-mono rounded border border-yellow-150">
                  🟡 Draft
                </span>
              </div>
              <div className="space-y-4 text-xs text-gray-650">
                <div>
                  <span className="text-gray-400 block text-[9px] uppercase font-mono">RFQ Number</span>
                  <span className="font-mono font-bold text-green-600 text-xs">RFQ-2026-{String(rfqs.length + 1).padStart(4, "0")}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[9px] uppercase font-mono">Title</span>
                  <span className="font-bold text-gray-800 line-clamp-2">{title || "Untitled Sourcing Campaign"}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[9px] uppercase font-mono">Category</span>
                  <span className="font-bold text-gray-850 flex items-center gap-1">
                    {getCategoryEmoji(category)} {category}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[9px] uppercase font-mono">Estimated Budget</span>
                  <span className="font-bold text-gray-900 text-sm font-mono">{formatINR(estimatedBudget)}</span>
                </div>
                
                {/* Item Summary Card details */}
                <div className="border-t border-b border-gray-50 py-3 my-2 bg-gray-50/50 p-2.5 rounded-lg space-y-1.5">
                  <span className="text-gray-400 block text-[9px] uppercase font-mono font-bold">Items Summary</span>
                  <div className="grid grid-cols-2 gap-y-1.5 text-[11px] text-gray-700">
                    <span>Products:</span>
                    <strong className="text-right text-gray-900">{items.filter((i) => i.item).length}</strong>
                    <span>Total Qty:</span>
                    <strong className="text-right text-gray-900">{items.reduce((sum, item) => sum + item.qty, 0)}</strong>
                    <span>Est Cost:</span>
                    <strong className="text-right text-gray-900 font-mono">
                      {formatINR(items.reduce((sum, item) => sum + item.qty * (item.targetPrice || 0), 0))}
                    </strong>
                  </div>
                </div>

                <div>
                  <span className="text-gray-400 block text-[9px] uppercase font-mono">Supplier Coverage</span>
                  <span className="font-bold text-gray-850">{selectedVendors.length} Vendors Mapped</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[9px] uppercase font-mono">Deadline Target</span>
                  <span className="font-bold text-red-650 font-mono inline-flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {deadline || "Not Specified"}{" "}
                    {deadline && (
                      <span className="text-[10px] text-gray-400 font-normal">
                        ({getDaysRemaining(deadline)})
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit RFQ Modal */}
      {editingRfq && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleEditSubmit}
            className="bg-white border border-gray-250 rounded-xl p-6 shadow-xl space-y-4 max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-fade-in"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider font-mono flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-green-600" />
                Edit Sourcing RFQ: {editingRfq.id}
              </h3>
              <button
                type="button"
                onClick={() => setEditingRfq(null)}
                className="text-gray-400 hover:text-gray-655 cursor-pointer animate-spin"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase font-mono tracking-wider">
                  RFP Sourcing Title *
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase font-mono tracking-wider">
                  Industry Category
                </label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                  <option value="IT Hardware">💻 IT Hardware</option>
                  <option value="IT Services & Cloud">☁ IT Services &amp; Cloud</option>
                  <option value="Electrical Equipment">⚡ Electrical Equipment</option>
                  <option value="Raw Materials">🧱 Raw Materials</option>
                  <option value="Logistics">🚚 Logistics</option>
                  <option value="Facilities">🏢 Facilities</option>
                </select>
              </div>

              {/* Edit Budget */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase font-mono tracking-wider">
                  Estimated Sourcing Budget (₹) *
                </label>
                <input
                  type="number"
                  required
                  value={editEstimatedBudget}
                  onChange={(e) => setEditEstimatedBudget(parseFloat(e.target.value) || 0)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase font-mono tracking-wider">
                  Submission Deadline *
                </label>
                <input
                  type="date"
                  required
                  value={editDeadline}
                  onChange={(e) => setEditDeadline(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase font-mono tracking-wider">
                  Priority
                </label>
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value as RFQ["priority"])}
                  className="w-full bg-gray-55/40 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase font-mono tracking-wider">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Line Items Edit Section */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                <span className="text-xs font-bold text-gray-500 uppercase font-mono">Line Items Specifications</span>
                <button
                  type="button"
                  onClick={handleAddEditLineItem}
                  className="text-xs text-green-600 hover:text-green-700 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Item
                </button>
              </div>

              <div className="space-y-2 max-h-52 overflow-y-auto pr-1 text-left">
                {editItems.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="md:col-span-4">
                      <input
                        type="text"
                        required
                        placeholder="Item Description"
                        value={item.item}
                        onChange={(e) => handleUpdateEditLineItem(idx, "item", e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-green-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <input
                        type="text"
                        placeholder="HSN Code"
                        value={item.hsn || ""}
                        onChange={(e) => handleUpdateEditLineItem(idx, "hsn", e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-green-500 font-mono text-center"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <input
                        type="number"
                        min={1}
                        required
                        value={item.qty}
                        onChange={(e) => handleUpdateEditLineItem(idx, "qty", parseInt(e.target.value) || 1)}
                        className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-green-500 font-mono text-center"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <input
                        type="text"
                        required
                        value={item.unit}
                        onChange={(e) => handleUpdateEditLineItem(idx, "unit", e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-green-500 text-center"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <input
                        type="number"
                        value={item.targetPrice || ""}
                        onChange={(e) => handleUpdateEditLineItem(idx, "targetPrice", parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-green-500 font-mono text-right"
                      />
                    </div>
                    <div className="md:col-span-1 flex items-center justify-center">
                      <button
                        type="button"
                        disabled={editItems.length === 1}
                        onClick={() => handleRemoveEditLineItem(idx)}
                        className="p-1 text-red-500 hover:bg-red-55 rounded disabled:opacity-30 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Vendor mappings edit section */}
            {editingRfq.status === "Draft" && (
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-gray-500 uppercase font-mono block">Assign Sourcing Suppliers</span>
                <div className="grid grid-cols-2 gap-2.5 max-h-40 overflow-y-auto pr-1">
                  {categoryActiveVendors.map((vendor) => {
                    const isSelected = editSelectedVendors.includes(vendor.id);
                    return (
                      <div
                        key={vendor.id}
                        onClick={() => toggleVendorSelection(vendor.id)}
                        className={`p-2 border rounded flex items-center gap-2 cursor-pointer transition-all text-left ${
                          isSelected ? "border-green-500 bg-green-50/10" : "border-gray-255 bg-white"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          readOnly
                          className="accent-green-600"
                        />
                        <div className="text-left text-xs leading-none">
                          <span className="font-bold text-gray-800 block">{vendor.name}</span>
                          <span className="text-[9px] text-gray-400 font-mono">Rating: ★ {vendor.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setEditingRfq(null)}
                className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xl max-w-md w-full text-center space-y-4 animate-fade-in">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-600 mx-auto animate-bounce">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Remove Sourcing RFQ?</h3>
              <p className="text-xs text-gray-555 mt-1 leading-relaxed">
                Are you sure you want to delete this procurement RFQ campaign ({confirmDeleteId})? This will discard the draft specifications, invited vendors, and any bids permanently.
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
                onClick={() => handleExecuteDelete(confirmDeleteId)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Sourcing List Panel */}
      {!showWizard && !selectedRfqToView && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden text-left">
          <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-mono font-bold text-gray-505">
              Active sourcing projects ({filteredRfqs.length})
            </span>
          </div>

          <div className="divide-y divide-gray-100">
            {paginatedRfqs.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <FileSpreadsheet className="w-12 h-12 text-gray-305 mx-auto mb-3" />
                <p className="text-sm">No sourcing RFQs found mapping the criteria.</p>
              </div>
            ) : (
              paginatedRfqs.map((rfq) => (
                <div
                  key={rfq.id}
                  className="p-6 hover:bg-gray-50/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 relative group"
                >
                  <div className="space-y-2 max-w-2xl flex-1 cursor-pointer" onClick={() => setSelectedRfqToView(rfq)}>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-mono font-black text-xs text-green-600 bg-green-50/50 px-2 py-0.5 rounded border border-green-100">
                        {rfq.id}
                      </span>
                      <span className="text-gray-300 font-mono text-xs">•</span>
                      <span className="text-xs text-gray-400 uppercase font-mono font-bold tracking-wider inline-flex items-center gap-1.5">
                        {getCategoryEmoji(rfq.category)} {rfq.category}
                      </span>
                      <span className="text-gray-300 font-mono text-xs">•</span>
                      <span
                        className={`text-[9px] uppercase tracking-widest font-mono font-bold px-1.5 py-0.5 rounded border ${
                          rfq.priority === "High"
                            ? "bg-red-50 text-red-700 border-red-100"
                            : rfq.priority === "Medium"
                            ? "bg-orange-50 text-orange-700 border-orange-100"
                            : "bg-gray-100 text-gray-650 border-gray-200"
                        }`}
                      >
                        {rfq.priority}
                      </span>
                      {rfq.estimatedBudget && (
                        <>
                          <span className="text-gray-300 font-mono text-xs">•</span>
                          <span className="text-[10px] text-gray-800 font-mono font-bold">
                            Budget: {formatINR(rfq.estimatedBudget)}
                          </span>
                        </>
                      )}
                    </div>

                    <h3 className="font-bold text-gray-900 group-hover:text-green-655 transition-colors tracking-tight text-base leading-tight">
                      {rfq.title}
                    </h3>

                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      {rfq.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-gray-400 pt-1 font-sans">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        Deadline: {rfq.deadline} ({getDaysRemaining(rfq.deadline)})
                      </span>
                      <span>Assigned: {rfq.assignedVendors.length} Suppliers</span>
                      <span>Items: {rfq.items.length} positions</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
                    <span
                      className={`inline-block px-3 py-1 border text-[10px] uppercase tracking-wider font-bold rounded-lg font-mono text-center ${getStatusColor(
                        rfq.status
                      )}`}
                    >
                      {rfq.status}
                    </span>

                    {/* Quick CRUD action keys */}
                    {isOfficer && (
                      <div className="flex items-center gap-1">
                        {(rfq.status === "Draft" || rfq.status === "Open") && (
                          <button
                            onClick={() => startEdit(rfq)}
                            className="p-1.5 bg-white border border-gray-200 text-gray-450 hover:text-green-600 hover:bg-gray-50 rounded transition-colors cursor-pointer"
                            title="Edit Campaign Details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDuplicate(rfq.id)}
                          className="p-1.5 bg-white border border-gray-200 text-gray-455 hover:text-blue-600 hover:bg-gray-50 rounded transition-colors cursor-pointer"
                          title="Duplicate RFQ (Create Draft Copy)"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        {(rfq.status === "Draft" || rfq.status === "Open" || rfq.status === "Rejected") && (
                          <button
                            onClick={() => setConfirmDeleteId(rfq.id)}
                            className="p-1.5 bg-white border border-gray-200 text-gray-455 hover:text-red-650 hover:bg-gray-50 rounded transition-colors cursor-pointer"
                            title="Delete Campaign"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-green-500 transition-colors cursor-pointer" onClick={() => setSelectedRfqToView(rfq)} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* RFQ detailed card view */}
      {selectedRfqToView && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden animate-in fade-in duration-200 text-left">
          <div className="px-8 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <button
              onClick={() => setSelectedRfqToView(null)}
              className="text-xs text-green-600 hover:text-green-700 font-bold inline-flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Return to directory
            </button>
            <div className="flex items-center gap-2">
              {isOfficer && (
                <>
                  {(selectedRfqToView.status === "Draft" || selectedRfqToView.status === "Open") && (
                    <button
                      onClick={() => startEdit(selectedRfqToView)}
                      className="px-3 py-1 bg-white border border-gray-200 text-gray-655 hover:text-green-600 hover:bg-gray-50 rounded font-bold text-xs cursor-pointer flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" /> Edit RFQ
                    </button>
                  )}
                  <button
                    onClick={() => handleDuplicate(selectedRfqToView.id)}
                    className="px-3 py-1 bg-white border border-gray-200 text-gray-655 hover:text-blue-600 hover:bg-gray-50 rounded font-bold text-xs cursor-pointer flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" /> Duplicate
                  </button>
                  {(selectedRfqToView.status === "Draft" || selectedRfqToView.status === "Open" || selectedRfqToView.status === "Rejected") && (
                    <button
                      onClick={() => setConfirmDeleteId(selectedRfqToView.id)}
                      className="px-3 py-1 bg-white border border-gray-200 text-gray-655 hover:text-red-600 hover:bg-gray-50 rounded font-bold text-xs cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  )}
                </>
              )}
              <span className="text-[11px] font-mono font-black text-gray-400">
                Session Ref: {selectedRfqToView.id}
              </span>
            </div>
          </div>

          <div className="p-8 space-y-6">
            {/* Header info */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-gray-150 pb-5">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="bg-green-50 border border-green-100 px-2.5 py-0.5 rounded-full text-[10px] text-green-700 uppercase font-mono font-black flex items-center gap-1">
                    {getCategoryEmoji(selectedRfqToView.category)} {selectedRfqToView.category}
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="text-xs text-gray-505 font-mono">
                    Created by: <strong>{selectedRfqToView.createdBy}</strong>
                  </span>
                </div>
                <h1 className="text-xl font-black text-gray-900 font-display">
                  {selectedRfqToView.title}
                </h1>
                <p className="text-xs text-gray-555 leading-relaxed font-sans">
                  {selectedRfqToView.description}
                </p>
                {selectedRfqToView.estimatedBudget && (
                  <div className="pt-1.5 text-xs text-gray-600">
                    Estimated Procurement Budget:{" "}
                    <strong className="text-gray-900 font-mono text-sm">{formatINR(selectedRfqToView.estimatedBudget)}</strong>
                  </div>
                )}
              </div>

              <div className="text-right">
                <span
                  className={`inline-block px-3 py-1 border text-xs uppercase font-bold rounded-lg font-mono text-center ${getStatusColor(
                    selectedRfqToView.status
                  )}`}
                >
                  {selectedRfqToView.status}
                </span>
                <span className="text-[11px] text-red-500 font-mono block mt-1.5 font-bold">
                  Deadline: {selectedRfqToView.deadline} ({getDaysRemaining(selectedRfqToView.deadline)})
                </span>
              </div>
            </div>

            {/* Comprehensive workflow trace */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider font-mono">
                Procurement Sourcing Progress Timeline
              </h3>
              <div className="relative flex items-center justify-between gap-2 overflow-x-auto py-2.5">
                {[
                  "Draft",
                  "Open",
                  "Vendor Responses Received",
                  "Vendor Selected",
                  "Pending Approval",
                  "Approved",
                  "PO Generated",
                  "Invoice Generated",
                ].map((st, idx) => {
                  const statusesList: RFQStatus[] = [
                    "Draft",
                    "Open",
                    "Vendor Responses Received",
                    "Vendor Selected",
                    "Pending Approval",
                    "Approved",
                    "PO Generated",
                    "Invoice Generated",
                  ];
                  const currentIdx = statusesList.indexOf(selectedRfqToView.status);
                  const isCompleted = idx <= currentIdx && selectedRfqToView.status !== "Rejected";
                  const isCurrent = selectedRfqToView.status === st;

                  return (
                    <div key={st} className="flex-1 min-w-[100px] text-center relative space-y-1 bg-transparent">
                      <div
                        className={`w-6 h-6 rounded-full mx-auto flex items-center justify-center font-bold text-[10px] leading-none border transition-all ${
                          isCurrent
                            ? "bg-slate-900 text-white border-slate-900 font-black animate-pulse"
                            : isCompleted
                            ? "bg-green-600 text-white border-green-600"
                            : "bg-white text-gray-300 border-gray-200"
                        }`}
                      >
                        {isCompleted && !isCurrent ? "✓" : idx + 1}
                      </div>
                      <span
                        className={`text-[9px] uppercase tracking-wider block font-bold leading-tight ${
                          isCurrent
                            ? "text-slate-900 font-black"
                            : isCompleted
                            ? "text-green-700"
                            : "text-gray-300"
                        }`}
                      >
                        {st.replace("Vendor ", "").replace("Received", "")}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Details and items list split */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Items Table */}
              <div className="border border-gray-200 rounded-xl overflow-hidden self-start">
                <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-205 text-xs font-bold uppercase font-mono text-gray-500">
                  Items within RFP specifications
                </div>
                <table className="w-full text-left text-xs text-gray-650">
                  <thead className="bg-gray-50/50">
                    <tr className="border-b border-gray-200 text-gray-400 font-mono">
                      <th className="py-2.5 px-4 font-bold">Scope Description</th>
                      <th className="py-2.5 px-4 text-center font-bold">HSN</th>
                      <th className="py-2.5 px-4 text-center font-bold">Qty</th>
                      <th className="py-2.5 px-4 text-right font-bold">Est Target Budget</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-105">
                    {selectedRfqToView.items.map((item) => (
                      <tr key={item.id}>
                        <td className="py-2.5 px-4 font-medium text-gray-900">
                          {item.item}
                        </td>
                        <td className="py-2.5 px-4 text-center font-mono font-bold text-gray-600">
                          {item.hsn || "—"}
                        </td>
                        <td className="py-2.5 px-4 text-center font-mono">
                          {item.qty} {item.unit}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono text-slate-700">
                          {item.targetPrice ? formatINR(item.targetPrice) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Vendors List */}
              <div className="border border-gray-200 rounded-xl overflow-hidden self-start">
                <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200 text-xs font-bold uppercase font-mono text-gray-500">
                  Suppliers invited to bid
                </div>
                <div className="p-4 space-y-3.5 bg-white">
                  {selectedRfqToView.assignedVendors.length === 0 ? (
                    <div className="text-center py-4 text-gray-400 text-xs">
                      No suppliers mapped yet. RFQ is in draft.
                    </div>
                  ) : (
                    selectedRfqToView.assignedVendors.map((vId) => {
                      const vendor = vendors.find((v) => v.id === vId);
                      return (
                        <div key={vId} className="flex items-center justify-between text-xs border-b border-gray-55 pb-2.5 last:border-0 last:pb-0">
                          <div className="space-y-0.5">
                            <strong className="text-gray-900 text-xs font-bold">
                              {vendor?.name || "Independent Partner"}
                            </strong>
                            <p className="text-[10px] text-gray-400 font-mono">
                              Focal Agent: {vendor?.contactPerson} — GSTIN: {vendor?.gstNumber}
                            </p>
                          </div>
                          <span className="font-bold text-slate-800 shrink-0 font-mono">★ {vendor?.rating.toFixed(1)}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Quick-routing Action box */}
            <div className="pt-4 border-t border-gray-150 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
              <span className="text-xs text-gray-505 font-sans">
                Next Stage:{" "}
                <strong className="text-gray-850">
                  {selectedRfqToView.status === "Draft"
                    ? "Assign vendors to publish campaign"
                    : selectedRfqToView.status === "Open"
                    ? "Vendor Quote submission"
                    : selectedRfqToView.status === "Vendor Responses Received"
                    ? "Officer comparison and vendor selection review"
                    : selectedRfqToView.status === "Vendor Selected"
                    ? "Publish recommendations to Manager approval"
                    : selectedRfqToView.status === "Pending Approval"
                    ? "Manager decision actions"
                    : "Procurement chain settled"}
                </strong>
              </span>

              <div className="flex gap-2">
                {selectedRfqToView.status === "Draft" && isOfficer && (
                  <button
                    onClick={() => startEdit(selectedRfqToView)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 font-bold max-h-10 text-white rounded-lg text-xs tracking-wide transition-colors cursor-pointer"
                  >
                    Assign Suppliers &amp; Publish
                  </button>
                )}

                {selectedRfqToView.status === "Open" && (
                  <button
                    onClick={() => setTab("Quotes")}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 font-bold max-h-10 text-white rounded-lg text-xs tracking-wide transition-colors cursor-pointer"
                  >
                    Act as Vendor: File Bid
                  </button>
                )}

                {selectedRfqToView.status === "Vendor Responses Received" && (
                  <button
                    onClick={() => setTab("Quotes")}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 font-bold text-white rounded-lg text-xs tracking-wide transition-colors cursor-pointer"
                  >
                    Review Comparison
                  </button>
                )}

                {selectedRfqToView.status === "Pending Approval" && (
                  <button
                    onClick={() => setTab("Approvals")}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 font-bold text-white rounded-lg text-xs tracking-wide transition-colors cursor-pointer"
                  >
                    Manage Approvals
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pagination controls */}
      {!showWizard && !selectedRfqToView && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-100 pt-4 px-1">
          <div className="text-xs text-gray-500">
            Showing Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> (<strong>{filteredRfqs.length} total RFQs</strong>)
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
