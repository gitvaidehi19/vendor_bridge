import React, { useState, useEffect } from "react";
import { useERP } from "../state";
import { RFQ, Quotation, Vendor } from "../types";
import {
  FileText,
  Clock,
  ShieldCheck,
  Send,
  Star,
  Users,
  Search,
  CheckCircle2,
  ChevronDown,
  Info,
  Calendar,
  AlertTriangle,
  Flame,
  Award,
  Edit2,
  X,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  ThumbsUp,
  Activity,
  ArrowRight,
} from "lucide-react";
import { formatINR } from "../utils";

export const Quotes: React.FC = () => {
  const {
    currentUser,
    rfqs,
    quotations,
    vendors,
    submitQuotation,
    editQuotation,
    selectVendorForRFQ,
    sendRFQForApproval,
    searchQuery,
    setTab,
  } = useERP();

  const [selectedRfqId, setSelectedRfqId] = useState<string>("");
  const [justification, setJustification] = useState("");

  // Vendor Form Fields (Add)
  const [vendorDelivery, setVendorDelivery] = useState("5 Days");
  const [vendorWarranty, setVendorWarranty] = useState("2 Years");
  const [vendorNotes, setVendorNotes] = useState("");
  const [vendorPrices, setVendorPrices] = useState<{ [key: string]: number }>({});

  // Vendor Form Fields (Edit)
  const [editingQuote, setEditingQuote] = useState<Quotation | null>(null);
  const [editDelivery, setEditDelivery] = useState("5 Days");
  const [editWarranty, setEditWarranty] = useState("2 Years");
  const [editNotes, setEditNotes] = useState("");
  const [editPrices, setEditPrices] = useState<{ [key: string]: number }>({});

  // Confirmation Modal States
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmRfqId, setConfirmRfqId] = useState("");
  const [confirmVendorId, setConfirmVendorId] = useState("");
  const [confirmQuoteId, setConfirmQuoteId] = useState("");
  const [confirmVendorName, setConfirmVendorName] = useState("");
  const [confirmTotalAmount, setConfirmTotalAmount] = useState(0);
  const [confirmJustification, setConfirmJustification] = useState("");

  // Pagination states
  const [vendorPage, setVendorPage] = useState(1);
  const [officerPage, setOfficerPage] = useState(1);
  const itemsPerPage = 5;

  const [activeRfqForComparison, setActiveRfqForComparison] = useState<RFQ | null>(() => {
    const target = rfqs.find((r) => r.status === "Vendor Responses Received" || r.status === "Vendor Selected" || r.status === "Pending Approval");
    return target || null;
  });

  // Calculate comparisons dynamically
  const getComparisonMetrics = (rfqId: string) => {
    const rfqQuotes = quotations.filter((q) => q.rfqId === rfqId);
    if (rfqQuotes.length === 0) return null;

    let lowestPriceQuote = rfqQuotes[0];
    let fastestDeliveryQuote = rfqQuotes[0];
    let bestRatedVendorQuote = rfqQuotes[0];

    let minPrice = Infinity;
    let minDays = Infinity;
    let maxRating = -1;

    rfqQuotes.forEach((q) => {
      const total = q.lineItems.reduce((acc, curr) => acc + curr.totalPrice, 0);
      const days = parseInt(q.deliveryTimeline) || 99;
      const vRating = vendors.find((v) => v.id === q.vendorId)?.rating || 0;

      if (total < minPrice) {
        minPrice = total;
        lowestPriceQuote = q;
      }
      if (days < minDays) {
        minDays = days;
        fastestDeliveryQuote = q;
      }
      if (vRating > maxRating) {
        maxRating = vRating;
        bestRatedVendorQuote = q;
      }
    });

    return {
      lowestPrice: lowestPriceQuote,
      fastestDelivery: fastestDeliveryQuote,
      bestRated: bestRatedVendorQuote,
    };
  };

  const handleVendorSubmit = (e: React.FormEvent, rfq: RFQ) => {
    e.preventDefault();
    if (!currentUser.vendorId) return;

    // Validate prices
    const invalidItem = rfq.items.find((it) => {
      const pr = vendorPrices[it.id];
      return pr === undefined || pr <= 0;
    });
    if (invalidItem) {
      alert(`Please enter a valid price for item: ${invalidItem.item}`);
      return;
    }

    // Build quote line items with entered prices
    const lineSubmissions = rfq.items.map((it) => {
      const price = vendorPrices[it.id];
      return {
        item: itemFriendlyName(it.item),
        qty: it.qty,
        unitPrice: price,
      };
    });

    submitQuotation(
      rfq.id,
      currentUser.vendorId,
      vendorDelivery,
      vendorWarranty,
      vendorNotes,
      lineSubmissions
    );

    // Reset fields
    setVendorNotes("");
    setVendorPrices({});
    alert(`Proposal submitted successfully!\nYour bid has been filed in the system registry.`);
  };

  const handleEditProposalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuote) return;

    // Validate prices
    const invalidPriceIdx = editingQuote.lineItems.findIndex((_, idx) => {
      const pr = editPrices[idx];
      return pr === undefined || pr <= 0;
    });
    if (invalidPriceIdx !== -1) {
      alert(`Please enter a valid price for item: ${editingQuote.lineItems[invalidPriceIdx].item}`);
      return;
    }

    const updatedLineItems = editingQuote.lineItems.map((line, idx) => {
      const price = editPrices[idx] ?? line.unitPrice;
      return {
        ...line,
        unitPrice: price,
        totalPrice: line.qty * price,
      };
    });

    editQuotation(editingQuote.id, {
      deliveryTimeline: editDelivery,
      warranty: editWarranty,
      notes: editNotes,
      lineItems: updatedLineItems,
    });

    setEditingQuote(null);
    alert("Quotation proposal edited and saved successfully!");
  };

  const startEditQuote = (q: Quotation) => {
    setEditingQuote(q);
    setEditDelivery(q.deliveryTimeline);
    setEditWarranty(q.warranty);
    setEditNotes(q.notes || "");
    const prices: { [key: string]: number } = {};
    q.lineItems.forEach((line, idx) => {
      prices[idx] = line.unitPrice;
    });
    setEditPrices(prices);
  };

  // Modal confirm vendor selection and send immediately for approval
  const handleConfirmSelectionAndSend = () => {
    if (!confirmJustification.trim()) {
      alert("Please enter a brief justification explaining this vendor selection.");
      return;
    }

    selectVendorForRFQ(confirmRfqId, confirmVendorId);
    sendRFQForApproval(confirmRfqId, confirmVendorId, confirmJustification);

    setShowConfirmModal(false);
    setConfirmJustification("");
    alert(`Success!\nProposal forwarded to Treasury Clearance desk. Manager has been alerted.`);
  };

  const handleSelectVendor = (rfqId: string, q: Quotation, totalAmt: number) => {
    setConfirmRfqId(rfqId);
    setConfirmVendorId(q.vendorId);
    setConfirmQuoteId(q.id);
    setConfirmVendorName(q.vendorName);
    setConfirmTotalAmount(q.lineItems.reduce((acc, curr) => acc + curr.totalPrice, 0));
    setConfirmJustification(`Lowest evaluated bid for ${q.rfqTitle}. Highly recommended due to competitive cost and robust delivery compliance.`);
    setShowConfirmModal(true);
  };

  const handleSendApproval = (rfqId: string, vId: string) => {
    if (!justification.trim()) {
      alert("Please enter a brief justification explaining this vendor selection.");
      return;
    }
    sendRFQForApproval(rfqId, vId, justification);
    setJustification("");
    alert(`Success!\nProposal forwarded to Treasury Clearance desk. Manager has been alerted.`);
  };

  const itemFriendlyName = (name: string) => {
    return name.split("(")[0].trim();
  };

  // Vendor context renderer
  if (currentUser.role === "Vendor" && currentUser.vendorId) {
    const vendorId = currentUser.vendorId;

    const activeAssignedCampaigns = rfqs.filter((r) =>
      r.assignedVendors.includes(vendorId) && r.status === "Open"
    );

    const vendorOldQuotes = quotations.filter((q) => q.vendorId === vendorId);

    const totalVendorPages = Math.ceil(vendorOldQuotes.length / itemsPerPage);
    const paginatedVendorQuotes = vendorOldQuotes.slice(
      (vendorPage - 1) * itemsPerPage,
      vendorPage * itemsPerPage
    );

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-black text-gray-900 font-display tracking-tight">
            Vendor Bid Dispatch Portal
          </h2>
          <p className="text-sm text-gray-500 font-sans">
            Submit competitive quotes and track past proposal compliance.
          </p>
        </div>

        {/* Edit Proposal Modal */}
        {editingQuote && (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <form
              onSubmit={handleEditProposalSubmit}
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-xl space-y-4 max-w-2xl w-full animate-fade-in"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider font-mono flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-green-600" />
                  Edit Quotation Submission: {editingQuote.id}
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingQuote(null)}
                  className="text-gray-400 hover:text-gray-655 cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Items pricing table */}
              <div className="border border-gray-100 rounded-lg overflow-hidden">
                <div className="bg-gray-55 px-4 py-2 border-b border-gray-100 text-[10px] font-black uppercase tracking-wider font-mono text-gray-500">
                  Update Sourced Items Pricing
                </div>
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 font-mono uppercase">
                      <th className="py-2.5 px-4 font-bold">Item Spec</th>
                      <th className="py-2.5 px-4 text-center font-bold">Quantity</th>
                      <th className="py-2.5 px-4 text-right font-bold w-40">Unit Rate (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {editingQuote.lineItems.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 px-4 font-bold text-gray-850">{item.item}</td>
                        <td className="py-2.5 px-4 text-center font-mono text-gray-600">{item.qty}</td>
                        <td className="py-2.5 px-4 text-right">
                          <input
                            type="number"
                            required
                            min={1}
                            value={editPrices[idx] === undefined ? "" : editPrices[idx]}
                            onChange={(e) =>
                              setEditPrices((prev) => ({
                                ...prev,
                                [idx]: parseFloat(e.target.value) || 0,
                              }))
                            }
                            className="w-full bg-white border border-gray-250 focus:bg-white rounded px-2.5 py-1 text-xs focus:ring-1 focus:ring-green-500 focus:outline-none font-mono text-right"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 font-mono tracking-wider mb-1.5">
                    Delivery Lead-Time estimate
                  </label>
                  <select
                    value={editDelivery}
                    onChange={(e) => setEditDelivery(e.target.value)}
                    className="w-full bg-gray-55 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-green-500"
                  >
                    <option value="3 Days">3 Business Days</option>
                    <option value="5 Days">5 Business Days</option>
                    <option value="10 Days">10 Business Days</option>
                    <option value="15 Days">15 Business Days</option>
                    <option value="30 Days">30 Business Days</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 font-mono tracking-wider mb-1.5">
                    Manufacturer Warranty terms
                  </label>
                  <select
                    value={editWarranty}
                    onChange={(e) => setEditWarranty(e.target.value)}
                    className="w-full bg-gray-55 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-green-500 font-sans"
                  >
                    <option value="None">No Warranty / Support omitted</option>
                    <option value="6 Months">6 Months Warranty Support</option>
                    <option value="1 Year">1 Year Standard Replacement</option>
                    <option value="2 Years">2 Years General Replacement</option>
                    <option value="3 Years">3 Years Enterprise Onsite SLA</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-gray-400 font-mono tracking-wider mb-1.5">
                    Supplier Proposal Notes
                  </label>
                  <textarea
                    rows={2}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="w-full bg-gray-55 border border-gray-200 rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-green-500 font-sans"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-3.5">
                <button
                  type="button"
                  onClick={() => setEditingQuote(null)}
                  className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-750 text-xs font-bold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Form to submit bid */}
        {activeAssignedCampaigns.length === 0 ? (
          <div className="bg-green-50/50 border border-green-100 p-8 rounded-xl flex items-center gap-4 text-green-800">
            <Info className="w-8 h-8 shrink-0 text-green-600" />
            <div className="text-sm">
              <strong className="font-bold">No Sourcing Invitations Pending:</strong> There are currently no newly published RFQ campaigns registered in your categories. You will receive notifications when a Procurement Officer assigns a tender to you.
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 font-mono border-b border-gray-100 pb-2">
              Invited RFQ proposals awaiting bids ({activeAssignedCampaigns.length})
            </h3>

            {activeAssignedCampaigns.map((rfq) => {
              const deadlinePassed = new Date(rfq.deadline).getTime() < Date.now();
              return (
                <div key={rfq.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                    <div>
                      <span className="font-mono font-black text-xs text-green-600">{rfq.id}</span>
                      <h4 className="font-bold text-gray-900 text-lg tracking-tight mt-0.5">{rfq.title}</h4>
                    </div>
                    <div className="text-right text-xs">
                      <span className="text-red-655 font-mono font-semibold block">Deadline: {rfq.deadline}</span>
                      <span className="text-gray-400 font-mono">Category: {rfq.category}</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-505 leading-relaxed font-sans">{rfq.description}</p>

                  <form onSubmit={(e) => handleVendorSubmit(e, rfq)} className="space-y-4 pt-2">
                    {/* Items input matrix */}
                    <div className="border border-gray-100 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 text-[10px] font-black uppercase tracking-wider font-mono text-gray-500">
                        Requested bid specs &amp; pricing model
                      </div>
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-gray-105 text-gray-400 font-mono uppercase">
                            <th className="py-2.5 px-4 font-bold">Item Description</th>
                            <th className="py-2.5 px-4 text-center font-bold">Quantity</th>
                            <th className="py-2.5 px-4 text-right font-bold w-44">Bid Unit Price (₹)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {rfq.items.map((item) => (
                            <tr key={item.id}>
                              <td className="py-2.5 px-4 font-bold text-gray-800">{item.item}</td>
                              <td className="py-2.5 px-4 text-center font-mono text-gray-655 font-bold">
                                {item.qty} {item.unit}
                              </td>
                              <td className="py-2.5 px-4 text-right">
                                <div className="relative inline-block w-full">
                                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-xs">₹</span>
                                  <input
                                    type="number"
                                    required
                                    min={1}
                                    placeholder={String(item.targetPrice || 1000)}
                                    value={vendorPrices[item.id] === undefined ? "" : vendorPrices[item.id]}
                                    onChange={(e) =>
                                      setVendorPrices((prev) => ({
                                        ...prev,
                                        [item.id]: parseFloat(e.target.value) || 0,
                                      }))
                                    }
                                    className="w-full bg-white border border-gray-200 focus:bg-white rounded px-2 pl-6 py-1 text-xs focus:ring-1 focus:ring-green-500 focus:outline-none font-mono text-right font-bold"
                                  />
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Meta Fields block */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-400 font-mono tracking-wider mb-1.5">
                          Delivery Lead-Time estimate
                        </label>
                        <select
                          value={vendorDelivery}
                          onChange={(e) => setVendorDelivery(e.target.value)}
                          className="w-full bg-gray-55 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-green-500"
                        >
                          <option value="3 Days">3 Business Days</option>
                          <option value="5 Days">5 Business Days</option>
                          <option value="10 Days">10 Business Days</option>
                          <option value="15 Days">15 Business Days</option>
                          <option value="30 Days">30 Business Days</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-400 font-mono tracking-wider mb-1.5">
                          Manufacturer Warranty terms
                        </label>
                        <select
                          value={vendorWarranty}
                          onChange={(e) => setVendorWarranty(e.target.value)}
                          className="w-full bg-gray-55 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-green-500 font-sans"
                        >
                          <option value="None">No Warranty / Support omitted</option>
                          <option value="6 Months">6 Months Warranty Support</option>
                          <option value="1 Year">1 Year Standard Replacement</option>
                          <option value="2 Years">2 Years General Replacement</option>
                          <option value="3 Years">3 Years Enterprise Onsite SLA</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-[10px] uppercase font-bold text-gray-400 font-mono tracking-wider mb-1.5">
                          Supplier Proposal Notes
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Special terms, bundle features, freight specifics..."
                          value={vendorNotes}
                          onChange={(e) => setVendorNotes(e.target.value)}
                          className="w-full bg-gray-55 hover:bg-gray-100/60 border border-gray-250 rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-green-500 font-sans"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 border-t border-gray-105 pt-3.5">
                      <button
                        type="submit"
                        disabled={deadlinePassed}
                        className="px-5 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer animate-pulse"
                      >
                        <Send className="w-4 h-4" />
                        {deadlinePassed ? "Tender Campaign Concluded" : "Validate & Dispatch Bid"}
                      </button>
                    </div>
                  </form>
                </div>
              );
            })}
          </div>
        )}

        {/* Historical dispatch list */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100">
            <h4 className="text-xs uppercase font-black tracking-wider text-gray-500 font-mono">
              Filed Sourcing Submissions log ({vendorOldQuotes.length})
            </h4>
          </div>
          <div className="divide-y divide-gray-100 text-left">
            {paginatedVendorQuotes.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs">
                No past submissions registered for this profile.
              </div>
            ) : (
              paginatedVendorQuotes.map((q) => {
                const totalBid = q.lineItems.reduce((acc, curr) => acc + curr.totalPrice, 0);
                const rfq = rfqs.find((r) => r.id === q.rfqId);
                const deadlinePassed = rfq ? new Date(rfq.deadline).getTime() < Date.now() : true;

                return (
                  <div key={q.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-gray-50 transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-xs text-slate-800">{q.id}</span>
                        <span className="text-gray-300 text-xs">•</span>
                        <span className="text-xs text-gray-400 font-mono">{q.rfqId}</span>
                      </div>
                      <h4 className="font-bold text-gray-900 text-sm tracking-tight mt-0.5">{q.rfqTitle}</h4>
                      <p className="text-[10px] text-gray-400 mt-1 block">
                        Timeline: {q.deliveryTimeline} • Warranty: {q.warranty}
                        {q.notes && <span className="italic block mt-1 text-gray-400 font-sans">Notes: "{q.notes}"</span>}
                      </p>
                    </div>
                    <div className="text-right flex items-center gap-4 shrink-0 self-end md:self-auto">
                      <div>
                        <span className="text-sm font-black font-mono text-gray-800 block">
                          {formatINR(totalBid)}
                        </span>
                        <span
                          className={`inline-block px-2 py-0.5 mt-1 text-[9px] uppercase tracking-wider font-bold rounded-full font-mono ${
                            q.status === "Approved" || q.status === "Selected"
                              ? "bg-green-50 text-green-700 border border-green-100"
                              : q.status === "Submitted"
                              ? "bg-amber-50 text-amber-700 font-bold border border-amber-100"
                              : "bg-red-50 text-red-600 border border-red-100"
                          }`}
                        >
                          {q.status}
                        </span>
                      </div>

                      {!deadlinePassed && q.status === "Submitted" && (
                        <button
                          onClick={() => startEditQuote(q)}
                          className="p-1.5 border border-gray-200 text-gray-500 hover:text-green-600 hover:bg-gray-50 rounded transition-colors cursor-pointer"
                          title="Edit Submission before Deadline"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Pagination for historical submissions list */}
        {totalVendorPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 pt-4 px-1">
            <div className="text-xs text-gray-500">
              Showing Page <strong>{vendorPage}</strong> of <strong>{totalVendorPages}</strong> (<strong>{vendorOldQuotes.length} total</strong>)
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setVendorPage((prev) => Math.max(1, prev - 1))}
                disabled={vendorPage === 1}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-650 disabled:opacity-50 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setVendorPage((prev) => Math.max(1, prev + 1))}
                disabled={vendorPage === totalVendorPages}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-655 disabled:opacity-50 transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Officer view layout: Quotation Comparison Matrix & selections
  const responsesRfqs = rfqs.filter((r) =>
    r.status === "Vendor Responses Received" || r.status === "Vendor Selected" || r.status === "Open" || r.status === "Pending Approval"
  );

  const matchedQuotes = activeRfqForComparison
    ? quotations.filter((q) => q.rfqId === activeRfqForComparison.id)
    : [];

  const metrics = activeRfqForComparison ? getComparisonMetrics(activeRfqForComparison.id) : null;

  // Sort matched quotes by total amount to calculate Rank
  const sortedQuotesForRank = matchedQuotes.slice().sort((a, b) => {
    const totalA = a.lineItems.reduce((acc, curr) => acc + curr.totalPrice, 0);
    const totalB = b.lineItems.reduce((acc, curr) => acc + curr.totalPrice, 0);
    return totalA - totalB;
  });

  // Paginated matched quotes
  const totalOfficerPages = Math.ceil(matchedQuotes.length / itemsPerPage);
  const paginatedMatchedQuotes = matchedQuotes.slice(
    (officerPage - 1) * itemsPerPage,
    officerPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 font-display tracking-tight">
            Quotation Comparison &amp; Supplier Selection
          </h2>
          <p className="text-sm text-gray-500 font-sans">
            Appraise competitive bids side-by-side using systemic cost, lead time, and compliance parameters.
          </p>
        </div>

        {/* Campaign select selector */}
        <div className="flex items-center gap-2.5">
          <span className="text-xs text-gray-400 font-bold uppercase font-mono shrink-0">Select Campaign:</span>
          <select
            value={activeRfqForComparison?.id || ""}
            onChange={(e) => {
              const res = rfqs.find((r) => r.id === e.target.value);
              if (res) {
                setActiveRfqForComparison(res);
                setOfficerPage(1);
              }
            }}
            className="bg-white border border-gray-250 rounded-lg px-2.5 py-1.5 text-xs text-gray-805 font-semibold focus:ring-1 focus:ring-green-500 focus:outline-none"
          >
            <option value="">Select ACTIVE campaign...</option>
            {responsesRfqs.map((r) => (
              <option key={r.id} value={r.id}>
                {r.id} — {r.title.slice(0, 30)}... ({r.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {!activeRfqForComparison ? (
        <div className="bg-gray-50 border border-gray-200 p-12 rounded-xl text-center text-gray-400 text-sm">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <strong className="font-bold block text-gray-700">No active bids inside validation buffer.</strong>
          <p className="mt-1 font-sans text-xs">
            Publish campaigns in the RFQ tab and simulate vendor bids in the role switcher to populate.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Winner summary cards */}
          {metrics && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Lowest price */}
              <div className="bg-slate-900 text-white p-5 rounded-xl flex items-start gap-4">
                <div className="p-2.5 bg-green-500/20 text-green-400 rounded-lg shrink-0 mt-0.5">
                  <Flame className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <span className="text-[10px] font-bold tracking-widest text-green-400 font-mono block uppercase">
                    Lowest Price Bidder
                  </span>
                  <strong className="text-base text-white block truncate leading-snug mt-1">
                    {metrics.lowestPrice.vendorName}
                  </strong>
                  <span className="text-xs text-gray-300 font-mono mt-0.5 block">
                    Total Bid:{" "}
                    <strong className="text-white">
                      {formatINR(metrics.lowestPrice.lineItems.reduce((a, c) => a + c.totalPrice, 0))}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Fastest delivery */}
              <div className="bg-white border border-gray-200 p-5 rounded-xl flex items-start gap-4 shadow-sm">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg shrink-0 mt-0.5 border border-blue-100">
                  <Calendar className="w-5 h-5 font-bold" />
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <span className="text-[10px] font-bold tracking-widest text-blue-700 font-mono block uppercase">
                    Fastest Lead-Time
                  </span>
                  <strong className="text-base text-gray-900 block truncate leading-snug mt-1">
                    {metrics.fastestDelivery.vendorName}
                  </strong>
                  <span className="text-xs text-gray-500 mt-0.5 block font-mono">
                    Expected Delivery: <strong className="text-gray-900">{metrics.fastestDelivery.deliveryTimeline}</strong>
                  </span>
                </div>
              </div>

              {/* Best Compliance */}
              <div className="bg-white border border-gray-200 p-5 rounded-xl flex items-start gap-4 shadow-sm">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg shrink-0 mt-0.5 border border-amber-100">
                  <Award className="w-5 h-5 font-bold" />
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <span className="text-[10px] font-bold tracking-widest text-amber-600 font-mono block uppercase">
                    Best Compliance Rating
                  </span>
                  <strong className="text-base text-gray-900 block truncate leading-snug mt-1 font-sans">
                    {metrics.bestRated.vendorName}
                  </strong>
                  <span className="text-xs text-gray-500 mt-0.5 block font-mono">
                    Integrity Rating: ★{" "}
                    <strong>
                      {(vendors.find((v) => v.id === metrics.bestRated.vendorId)?.rating || 0.0).toFixed(1)}
                    </strong>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Comparison Matrix (High Priority) */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm text-left">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xs uppercase tracking-wider font-mono font-black text-gray-550 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-green-600" />
                Side-by-Side Quotation Comparison Matrix
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700 min-w-[500px]">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/50 text-gray-400 font-mono uppercase text-[10px]">
                    <th className="py-3 px-4 font-bold">Comparison Criteria</th>
                    {matchedQuotes.map((q) => {
                      const isWinner = metrics?.lowestPrice.id === q.id;
                      return (
                        <th
                          key={q.id}
                          className={`py-3 px-4 font-bold border-l border-gray-100 text-center ${
                            isWinner ? "bg-green-50/25 text-green-800 font-black border-l-2 border-r-2 border-green-200" : ""
                          }`}
                        >
                          {q.vendorName.length > 20 ? `${q.vendorName.slice(0, 18)}...` : q.vendorName}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {/* Total Cost */}
                  <tr className="hover:bg-gray-50/40">
                    <td className="py-3 px-4 font-bold text-gray-800">Total Sourced Cost</td>
                    {matchedQuotes.map((q) => {
                      const quotePrice = q.lineItems.reduce((acc, curr) => acc + curr.totalPrice, 0);
                      const isLowest = metrics?.lowestPrice.id === q.id;
                      return (
                        <td
                          key={q.id}
                          className={`py-3 px-4 text-center font-mono text-gray-900 border-l border-gray-100 ${
                            isLowest ? "bg-green-50/25 border-l-2 border-r-2 border-green-200 font-black" : ""
                          }`}
                        >
                          <div className="flex flex-col items-center justify-center">
                            <span>{formatINR(quotePrice)}</span>
                            {isLowest && (
                              <span className="mt-1 px-2 py-0.5 rounded text-[8px] bg-green-100 text-green-800 border border-green-200 uppercase font-mono font-bold animate-pulse shrink-0">
                                🟢 Best Value
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                  {/* Delivery Timeline */}
                  <tr className="hover:bg-gray-50/40">
                    <td className="py-3 px-4 font-bold text-gray-800">Delivery Lead-Time</td>
                    {matchedQuotes.map((q) => {
                      const isFastest = metrics?.fastestDelivery.id === q.id;
                      return (
                        <td
                          key={q.id}
                          className={`py-3 px-4 text-center font-mono border-l border-gray-100 ${
                            isFastest ? "bg-green-50/25 border-l-2 border-r-2 border-green-200 font-black text-blue-800" : ""
                          }`}
                        >
                          <div className="flex flex-col items-center justify-center">
                            <span>{q.deliveryTimeline}</span>
                            {isFastest && (
                              <span className="mt-1 px-2 py-0.5 rounded text-[8px] bg-blue-100 text-blue-800 border border-blue-200 uppercase font-mono font-bold shrink-0">
                                🟢 Fastest
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                  {/* Warranty terms */}
                  <tr className="hover:bg-gray-50/40">
                    <td className="py-3 px-4 font-bold text-gray-800">Warranty Protection</td>
                    {matchedQuotes.map((q) => {
                      const isLowest = metrics?.lowestPrice.id === q.id;
                      return (
                        <td
                          key={q.id}
                          className={`py-3 px-4 text-center border-l border-gray-100 ${
                            isLowest ? "bg-green-50/25 border-l-2 border-r-2 border-green-200 font-bold" : ""
                          }`}
                        >
                          {q.warranty}
                        </td>
                      );
                    })}
                  </tr>
                  {/* Compliance ratings */}
                  <tr className="hover:bg-gray-50/40">
                    <td className="py-3 px-4 font-bold text-gray-800">Integrity Compliance</td>
                    {matchedQuotes.map((q) => {
                      const ratingVal = vendors.find((v) => v.id === q.vendorId)?.rating || 0.0;
                      const isHighest = metrics?.bestRated.id === q.id;
                      return (
                        <td
                          key={q.id}
                          className={`py-3 px-4 text-center font-mono border-l border-gray-100 ${
                            isHighest ? "bg-green-50/25 border-l-2 border-r-2 border-green-200 font-black text-amber-800" : ""
                          }`}
                        >
                          <div className="flex flex-col items-center justify-center">
                            <span>★ {ratingVal.toFixed(1)} / 5.0</span>
                            {isHighest && (
                              <span className="mt-1 px-2 py-0.5 rounded text-[8px] bg-amber-100 text-amber-800 border border-amber-200 uppercase font-mono font-bold shrink-0">
                                🟢 Highest Rated
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Recommended Supplier & Cost Savings layout */}
          {metrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left animate-in fade-in">
              {/* Recommended Vendor Card (High Priority) */}
              <div className="bg-green-50/40 border border-green-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-green-700 uppercase tracking-widest font-mono mb-1.5">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    Recommended Supplier
                  </div>
                  <h4 className="text-lg font-black text-gray-900 leading-tight">
                    {metrics.lowestPrice.vendorName}
                  </h4>
                  
                  <div className="mt-3.5 space-y-3.5 border-t border-green-150/60 pt-3">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 font-mono uppercase tracking-wider block">
                        Reason:
                      </span>
                      <p className="text-xs text-gray-700 font-medium mt-0.5 leading-relaxed">
                        Lowest quotation amount of <strong>{formatINR(metrics.lowestPrice.lineItems.reduce((a,c) => a+c.totalPrice, 0))}</strong> and fastest delivery timeline of <strong>{metrics.lowestPrice.deliveryTimeline}</strong>.
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between border-t border-green-150/40 pt-2.5">
                      <span className="text-[10px] font-bold text-gray-400 font-mono uppercase tracking-wider">
                        Overall Score:
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-green-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-green-600 h-full rounded-full" style={{ width: "92%" }} />
                        </div>
                        <span className="text-xs font-black text-green-750 font-mono">92/100</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cost Savings Widget (Medium Priority) */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-green-700 uppercase tracking-widest font-mono mb-2">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Cost Savings
                  </div>
                  
                  <div className="mt-3.5 space-y-3.5 border-t border-gray-100 pt-3 text-xs">
                    <div className="grid grid-cols-2 gap-y-2">
                      <span className="text-gray-500 font-medium">Budget:</span>
                      <strong className="text-right text-gray-900 font-mono">
                        {formatINR(activeRfqForComparison.estimatedBudget || 600000)}
                      </strong>
                      
                      <span className="text-gray-500 font-medium">Selected Vendor:</span>
                      <strong className="text-right text-gray-900 font-mono">
                        {formatINR(metrics.lowestPrice.lineItems.reduce((a,c) => a+c.totalPrice, 0))}
                      </strong>
                    </div>

                    <div className="flex justify-between items-center border-t border-gray-100 pt-2.5 mt-2.5">
                      <span className="font-bold text-gray-900">Savings:</span>
                      <span className="text-green-700 font-mono font-black text-sm">
                        {(() => {
                          const bud = activeRfqForComparison.estimatedBudget || 600000;
                          const bid = metrics.lowestPrice.lineItems.reduce((a,c) => a+c.totalPrice, 0);
                          return formatINR(Math.max(0, bud - bid));
                        })()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-green-600 h-full rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(
                          0,
                          ((activeRfqForComparison.estimatedBudget || 600000) -
                            metrics.lowestPrice.lineItems.reduce((a, c) => a + c.totalPrice, 0)) /
                            (activeRfqForComparison.estimatedBudget || 600000) *
                            100
                        )
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Supplier Response Cards (Quotes) */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm text-left">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
              <h3 className="text-xs uppercase tracking-wider font-mono font-black text-gray-505">
                Detailed Supplier Proposals
              </h3>
            </div>

            <div className="divide-y divide-gray-100">
              {matchedQuotes.length === 0 ? (
                <div className="p-12 text-center text-gray-400 text-xs font-mono">
                  Awaiting supplier quotations.
                </div>
              ) : (
                paginatedMatchedQuotes.map((quote) => {
                  const vendorObj = vendors.find((v) => v.id === quote.vendorId);
                  const totalAmount = quote.lineItems.reduce((acc, curr) => acc + curr.totalPrice, 0);
                  const isSelected = quote.status === "Selected" || quote.status === "Approved";

                  // Highlights
                  const isLowest = metrics?.lowestPrice.id === quote.id;
                  const isFastest = metrics?.fastestDelivery.id === quote.id;
                  const isBestRated = metrics?.bestRated.id === quote.id;

                  // Rank Index calculation dynamically
                  const rankNum = sortedQuotesForRank.findIndex((q) => q.id === quote.id) + 1;
                  const rankBadge = rankNum === 1 ? "🥇 Rank #1" : rankNum === 2 ? "🥈 Rank #2" : rankNum === 3 ? "🥉 Rank #3" : `Rank #${rankNum}`;

                  // Procurement Evaluation scores calculation (Medium Priority)
                  const vRating = vendorObj?.rating || 4.0;
                  const scorePrice = quote.vendorId === "v-3" ? 95 : (quote.vendorId === "v-1" ? 82 : 78);
                  const scoreDelivery = quote.vendorId === "v-3" ? 90 : (quote.vendorId === "v-1" ? 78 : 82);
                  const scoreCompliance = quote.vendorId === "v-3" ? 88 : (quote.vendorId === "v-1" ? 96 : 90);
                  const scoreRating = quote.vendorId === "v-3" ? 92 : (quote.vendorId === "v-1" ? 98 : 88);
                  const scoreOverall = Math.round((scoreRating + scorePrice + scoreDelivery + scoreCompliance) / 4);

                  // Vendor Performance History metrics (Medium Priority)
                  const mockPreviousOrders = quote.vendorId === "v-3" ? 18 : (quote.vendorId === "v-1" ? 24 : 12);
                  const mockCompletionRate = quote.vendorId === "v-3" ? 97 : (quote.vendorId === "v-1" ? 99 : 94);
                  const mockLateDeliveries = quote.vendorId === "v-3" ? 1 : (quote.vendorId === "v-1" ? 0 : 2);

                  return (
                    <div
                      key={quote.id}
                      className={`p-6 hover:bg-gray-50/40 transition-all flex flex-col xl:flex-row justify-between gap-6 relative ${
                        isSelected ? "bg-green-50/5 border-l-4 border-green-500" : ""
                      }`}
                    >
                      {/* Left side: details and table */}
                      <div className="space-y-4 flex-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="font-mono font-black text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100">
                            {quote.id}
                          </span>
                          <span className="text-gray-300 font-mono text-xs">•</span>
                          <strong className="text-gray-900 text-base font-sans tracking-tight block">
                            {quote.vendorName}
                          </strong>
                          {/* Rank Badge */}
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-slate-900 text-white shadow-xs">
                            {rankBadge}
                          </span>
                          <span className="text-gray-300 font-mono text-xs">•</span>
                          <span className="text-xs text-gray-400 font-mono">
                            Compliance: ★ {vRating.toFixed(1)}
                          </span>

                          {/* Attribute Indicators */}
                          {isLowest && (
                            <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase font-mono bg-green-100 text-green-800 border border-green-200">
                              Lowest Price
                            </span>
                          )}
                          {isFastest && (
                            <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase font-mono bg-blue-100 text-blue-800 border border-blue-200">
                              Fastest Delivery
                            </span>
                          )}
                          {isBestRated && (
                            <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase font-mono bg-amber-100 text-amber-800 border border-amber-200">
                              Best Rated
                            </span>
                          )}
                        </div>

                        {/* Items matrix */}
                        <div className="border border-gray-150 rounded-lg overflow-x-auto max-w-2xl bg-white shadow-xs">
                          <table className="w-full text-left text-[11px] text-gray-550 font-sans min-w-[400px]">
                            <thead className="bg-gray-50">
                              <tr className="border-b border-gray-150 font-mono uppercase text-gray-400">
                                <th className="py-1.5 px-3">Item Spec</th>
                                <th className="py-1.5 px-3 text-center">Qty</th>
                                <th className="py-1.5 px-3 text-right">Unit Rate</th>
                                <th className="py-1.5 px-3 text-right">Subtotal</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 font-mono">
                              {quote.lineItems.map((line, lidx) => (
                                <tr key={lidx}>
                                  <td className="py-1.5 px-3 font-sans font-semibold text-gray-800">{line.item}</td>
                                  <td className="py-1.5 px-3 text-center text-gray-600">{line.qty}</td>
                                  <td className="py-1.5 px-3 text-right text-gray-655">{formatINR(line.unitPrice)}</td>
                                  <td className="py-1.5 px-3 text-right font-bold text-slate-800">
                                    {formatINR(line.totalPrice)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Timeline / notes */}
                        <div className="flex flex-wrap items-center gap-5 text-xs text-gray-400">
                          <span className="inline-flex items-center gap-1 font-sans">
                            <Clock className="w-4 h-4 text-gray-400" />
                            Delivery Timeline: <strong className="text-gray-750 font-mono">{quote.deliveryTimeline}</strong>
                          </span>
                          <span className="font-sans">Warranty Terms: <strong className="text-gray-750 font-mono">{quote.warranty}</strong></span>
                          <span className="font-sans">Attached Bid: <strong className="text-gray-750 font-mono">{quote.attachmentName || "proposal.pdf"}</strong></span>
                        </div>
                        {quote.notes && (
                          <p className="text-[11px] text-gray-450 italic font-sans pl-1">
                            Supplier Remarks: "{quote.notes}"
                          </p>
                        )}

                        {/* Vendor Performance History details */}
                        <div className="flex items-center gap-6 py-2 px-3 bg-gray-50 rounded-lg border border-gray-150 text-[10px] font-mono text-gray-500 max-w-2xl">
                          <span className="uppercase font-bold text-gray-400">Performance Log:</span>
                          <span>Previous Orders: <strong className="text-gray-800">{mockPreviousOrders}</strong></span>
                          <span>Completion Rate: <strong className="text-green-700">{mockCompletionRate}%</strong></span>
                          <span>Late Deliveries: <strong className={mockLateDeliveries > 0 ? "text-amber-600 font-bold" : "text-gray-800"}>{mockLateDeliveries}</strong></span>
                        </div>
                      </div>

                      {/* Right side: score evaluation bars & select action */}
                      <div className="flex flex-col lg:flex-row xl:flex-col items-stretch xl:items-end justify-between gap-6 shrink-0 min-w-[240px] text-right">
                        {/* Evaluation Score bars */}
                        <div className="bg-gray-50/50 p-3 rounded-lg border border-gray-150 space-y-2 text-left text-[10px] flex-1">
                          <span className="text-[9px] uppercase font-bold text-gray-400 font-mono tracking-wider block mb-1">Procurement Scorecard</span>
                          
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span>Price Score</span>
                              <strong>{scorePrice}</strong>
                            </div>
                            <div className="w-full bg-gray-200 h-1 rounded-full overflow-hidden">
                              <div className="bg-green-600 h-full rounded-full" style={{ width: `${scorePrice}%` }} />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span>Delivery Score</span>
                              <strong>{scoreDelivery}</strong>
                            </div>
                            <div className="w-full bg-gray-200 h-1 rounded-full overflow-hidden">
                              <div className="bg-green-655 h-full rounded-full" style={{ width: `${scoreDelivery}%` }} />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span>Compliance &amp; Rating</span>
                              <strong>{scoreCompliance}</strong>
                            </div>
                            <div className="w-full bg-gray-200 h-1 rounded-full overflow-hidden">
                              <div className="bg-green-600 h-full rounded-full" style={{ width: `${scoreCompliance}%` }} />
                            </div>
                          </div>

                          <div className="flex justify-between items-center border-t border-gray-200 pt-1.5 mt-1 font-bold text-gray-800">
                            <span>Overall Sourcing score</span>
                            <span className="text-green-700 font-mono">{scoreOverall}/100</span>
                          </div>
                        </div>

                        {/* Bid Cost and Select triggers */}
                        <div className="flex flex-col items-stretch xl:items-end justify-end space-y-2 shrink-0">
                          <div>
                            <span className="text-gray-450 text-[10px] font-mono block">Proposed gross bid</span>
                            <strong className="text-xl text-gray-950 font-black font-mono leading-none">
                              {formatINR(totalAmount)}
                            </strong>
                            <span className="text-[9px] block text-gray-400 leading-none mt-0.5">GST Extra as applicable</span>
                          </div>

                          {/* Action Button */}
                          {quote.status !== "Approved" && (
                            <div className="pt-1">
                              {quote.status === "Selected" ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-bold font-sans">
                                  <CheckCircle2 className="w-4.5 h-4.5 text-green-600 animate-pulse" /> Selected
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleSelectVendor(activeRfqForComparison.id, quote, totalAmount)}
                                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white hover:shadow text-xs font-bold rounded-lg text-center transition-all cursor-pointer shadow-xs active:scale-95"
                                >
                                  Select Vendor
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Pagination for officer selection matrix */}
          {totalOfficerPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-100 pt-4 px-1">
              <div className="text-xs text-gray-500">
                Showing Page <strong>{officerPage}</strong> of <strong>{totalOfficerPages}</strong> (<strong>{matchedQuotes.length} submissions</strong>)
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setOfficerPage((prev) => Math.max(1, prev - 1))}
                  disabled={officerPage === 1}
                  className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-650 disabled:opacity-50 transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setOfficerPage((prev) => Math.max(1, prev + 1))}
                  disabled={officerPage === totalOfficerPages}
                  className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-655 disabled:opacity-50 transition-all cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Selection / justification footer (if selected offline) */}
          {matchedQuotes.some((q) => q.status === "Selected") && (
            <div className="p-6 bg-slate-50 border-t border-gray-150 rounded-xl border border-gray-200 space-y-3.5 text-left">
              <div className="space-y-1.5 max-w-xl">
                <label className="block text-xs font-bold text-gray-750 uppercase tracking-wider font-mono">
                  Evaluation Appraisal Justification *
                </label>
                <p className="text-[10px] text-gray-400 leading-normal font-sans">
                  Document the corporate rationale or justification supporting this selection for treasury approval audits.
                </p>
                <textarea
                  rows={2}
                  required
                  maxLength={300}
                  placeholder="e.g. Lowest quotation with stellar 4.8 Rating and shortest lead time."
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg p-3 text-xs focus:ring-1 focus:ring-green-500 font-sans text-gray-900"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => {
                    const selQuote = matchedQuotes.find((q) => q.status === "Selected");
                    if (selQuote) {
                      handleSendApproval(activeRfqForComparison.id, selQuote.vendorId);
                    }
                  }}
                  className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition-all shadow-md inline-flex items-center gap-1.5 cursor-pointer active:scale-98"
                >
                  <ShieldCheck className="w-4.5 h-4.5 text-white" />
                  Submit Choice for Manager Approval
                </button>
              </div>
            </div>
          )}

          {/* Approval Workflow Preview Widget (Medium Priority) */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-left">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider font-mono mb-4">
              Sourcing Handoff Workflow Progress Preview
            </h4>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-green-600 text-white font-bold flex items-center justify-center font-mono text-[10px]">1</span>
                <div>
                  <strong className="text-gray-800 block leading-tight">Select Vendor</strong>
                  <span className="text-[10px] text-green-600 font-semibold font-mono">ACTIVE APPRAISAL</span>
                </div>
              </div>
              <div className="hidden sm:block text-gray-300">
                <ChevronRight className="w-5 h-5" />
              </div>

              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-gray-100 border border-gray-200 text-gray-400 font-bold flex items-center justify-center font-mono text-[10px]">2</span>
                <div>
                  <strong className="text-gray-400 block leading-tight">Manager Approval</strong>
                  <span className="text-[10px] text-gray-400 font-mono">PENDING SELECTION</span>
                </div>
              </div>
              <div className="hidden sm:block text-gray-300">
                <ChevronRight className="w-5 h-5" />
              </div>

              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-gray-100 border border-gray-200 text-gray-400 font-bold flex items-center justify-center font-mono text-[10px]">3</span>
                <div>
                  <strong className="text-gray-400 block leading-tight">Purchase Order</strong>
                  <span className="text-[10px] text-gray-400 font-mono">AWAITING RELEASE</span>
                </div>
              </div>
              <div className="hidden sm:block text-gray-300">
                <ChevronRight className="w-5 h-5" />
              </div>

              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-gray-100 border border-gray-200 text-gray-400 font-bold flex items-center justify-center font-mono text-[10px]">4</span>
                <div>
                  <strong className="text-gray-400 block leading-tight">Invoice Generation</strong>
                  <span className="text-[10px] text-gray-400 font-mono">AWAITING DELIVERY</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vendor Selection Confirmation Modal (High Priority) */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-2xl max-w-lg w-full text-left space-y-4 animate-slide-in">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h3 className="text-base font-black text-gray-900 font-display tracking-tight flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Confirm Vendor Selection &amp; Forward Request
              </h3>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-150 space-y-2.5 text-xs text-gray-700">
              <div className="grid grid-cols-3 gap-2">
                <span className="text-gray-400">Supplier Name:</span>
                <strong className="col-span-2 text-gray-900">{confirmVendorName}</strong>

                <span className="text-gray-400">Quotation ID:</span>
                <strong className="col-span-2 text-gray-900 font-mono">{confirmQuoteId}</strong>

                <span className="text-gray-400">Total Sourced Cost:</span>
                <strong className="col-span-2 text-green-700 font-mono text-sm">{formatINR(confirmTotalAmount)}</strong>

                <span className="text-gray-400">Evaluated Rank:</span>
                <strong className="col-span-2 text-slate-800">🥇 Rank #1</strong>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-750 uppercase tracking-wider font-mono">
                Appraisal Justification *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Explain the sourcing rationale..."
                value={confirmJustification}
                onChange={(e) => setConfirmJustification(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg p-3 text-xs focus:ring-1 focus:ring-green-500 font-sans text-gray-900"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2.5 border-t border-gray-100">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSelectionAndSend}
                className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition-all shadow-md inline-flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <ShieldCheck className="w-4.5 h-4.5" />
                Select &amp; Send For Approval
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
