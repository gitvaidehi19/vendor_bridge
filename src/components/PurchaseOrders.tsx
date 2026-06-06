import React, { useState, useEffect } from "react";
import { useERP } from "../state";
import { PurchaseOrder } from "../types";
import {
  ShoppingBag,
  Printer,
  Mail,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Building,
  Briefcase,
  Layers,
} from "lucide-react";
import { formatINR } from "../utils";

export const PurchaseOrders: React.FC = () => {
  const {
    currentUser,
    purchaseOrders,
    emailPoVendor,
    searchQuery,
  } = useERP();

  const [selectedPo, setSelectedPo] = useState<PurchaseOrder | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Reset pagination on search queries
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Sync selected PO details if updated globally
  useEffect(() => {
    if (selectedPo) {
      const updated = purchaseOrders.find((po) => po.id === selectedPo.id);
      if (updated) setSelectedPo(updated);
    }
  }, [purchaseOrders, selectedPo]);

  // Filters
  const filteredPOList = purchaseOrders.filter((po) => {
    const matchesSearch =
      po.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.rfqId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.status.toLowerCase().includes(searchQuery.toLowerCase());

    if (currentUser.role === "Vendor") {
      return matchesSearch && po.vendorId === currentUser.vendorId;
    }
    return matchesSearch;
  });

  const handlePrint = (poId: string) => {
    window.print();
  };

  const handleEmail = (poId: string) => {
    emailPoVendor(poId);
    alert(`PDF Purchase Order finalized & transmitted successfully to supplier focal email inbox!`);
  };

  // Pagination calculation
  const totalPages = Math.ceil(filteredPOList.length / itemsPerPage);
  const paginatedPOList = filteredPOList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 font-display tracking-tight">
            Purchase Orders &amp; Vendor Procurements
          </h2>
          <p className="text-sm text-gray-500 font-sans">
            Oversee issued commercial authorizations released to external partner merchants.
          </p>
        </div>
      </div>

      {/* Main PO Grid Table */}
      {!selectedPo ? (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-mono font-bold text-gray-500">
              Active Authorized Purchase orders ({filteredPOList.length})
            </span>
          </div>

          <div className="divide-y divide-gray-100">
            {paginatedPOList.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm">No Purchase Orders registered in system index.</p>
              </div>
            ) : (
              paginatedPOList.map((po) => (
                <div
                  key={po.id}
                  onClick={() => setSelectedPo(po)}
                  className="p-5 hover:bg-gray-50/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer group"
                >
                  <div className="space-y-1.5 flex-1 pr-6">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-xs text-green-600">{po.id}</span>
                      <span className="text-gray-300 text-xs">•</span>
                      <span className="text-xs text-gray-450 font-mono font-bold">{po.rfqId}</span>
                    </div>

                    <h4 className="font-bold text-gray-900 text-sm tracking-tight leading-none">
                      To Supplier: {po.vendorName}
                    </h4>

                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-gray-400">
                      <span>Issue Date: {po.issueDate}</span>
                      <span>Delivery Term: {po.deliveryTerms}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-right shrink-0 self-end md:self-auto">
                    <div>
                      <span className="text-xs text-gray-400 block font-mono">Approved Gross</span>
                      <strong className="text-sm text-gray-900 font-bold font-mono">
                        {formatINR(po.approvedAmount)}
                      </strong>
                    </div>

                    <span
                      className={`inline-block px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded-lg font-mono text-center border ${
                        po.status === "Emailed To Vendor"
                          ? "bg-purple-50 text-purple-700 border-purple-100"
                          : "bg-green-50 text-green-700 border-green-100"
                      }`}
                    >
                      {po.status}
                    </span>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-green-500 transition-colors" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* Fully formatted legal Document Layout view */
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden animate-in fade-in duration-200">
          <div className="px-8 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between no-print">
            <button
              onClick={() => setSelectedPo(null)}
              className="text-xs text-green-600 hover:text-green-700 font-bold inline-flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Return to directory list
            </button>
            <span className="text-[10px] font-mono font-bold text-gray-400">
              Contract Session Record: {selectedPo.id}
            </span>
          </div>

          <div className="p-8 space-y-6 print-card">
            {/* Action Tools bar */}
            <div className="flex flex-wrap gap-2 justify-end border-b border-gray-100 pb-4 no-print">
              <button
                onClick={() => handlePrint(selectedPo.id)}
                className="px-3.5 py-1.5 border border-gray-200 hover:bg-gray-50 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-gray-500" />
                Print Purchase Order
              </button>
              {currentUser.role !== "Vendor" && (
                <button
                  onClick={() => handleEmail(selectedPo.id)}
                  className="px-3.5 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Mail className="w-4 h-4" />
                  Email Copy to Vendor Focus
                </button>
              )}
            </div>

            {/* Document Header Panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-gray-150 pb-6">
              <div className="space-y-3 text-left">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-green-600 flex items-center justify-center text-white font-bold text-sm">
                    VB
                  </div>
                  <strong className="text-gray-900 font-display text-lg">VendorBridge India Pvt. Ltd.</strong>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed max-w-xs font-sans">
                  Financial Hub Towers, Bandra Kurla Complex,<br />
                  Mumbai, Maharashtra - 400051<br />
                  <strong>GSTIN: 27AAAVB1234C1Z5</strong> (Buyer)
                </p>
              </div>

              <div className="text-left md:text-right space-y-2">
                <span className="text-xs uppercase font-black font-mono tracking-wider text-green-600 block">
                  Commercial Purchase Order
                </span>
                <h1 className="text-2xl font-black font-mono text-gray-900 leading-none">
                  {selectedPo.id}
                </h1>
                <div className="text-xs text-gray-400 space-y-0.5">
                  <p>Issue Date: <strong className="text-gray-700 font-mono">{selectedPo.issueDate}</strong></p>
                  <p>Due Date: <strong className="text-gray-700 font-mono">{selectedPo.dueDate}</strong></p>
                  <p>Status: <strong className="text-green-700 font-mono">{selectedPo.status}</strong></p>
                </div>
              </div>
            </div>

            {/* Sub-detail boxes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              {/* Issued To Sourcing Box */}
              <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50 space-y-2 text-left">
                <span className="text-[10px] uppercase font-black font-mono tracking-wider text-gray-400 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5" />
                  Sourced Vendor Entity
                </span>
                <div>
                  <strong className="text-sm font-bold text-gray-900 block leading-tight">
                    {selectedPo.vendorName}
                  </strong>
                  <p className="text-[11px] text-gray-500 mt-1 leading-normal font-sans">
                    Contact Focal: {selectedPo.vendorDetails.contactPerson}<br />
                    Address: {selectedPo.vendorDetails.address}<br />
                    GSTIN: <strong className="text-gray-700 font-mono">{selectedPo.vendorDetails.gstNumber || "N/A"}</strong> (Supplier)
                  </p>
                </div>
              </div>

              {/* Campaign connection box */}
              <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50 space-y-2 text-left">
                <span className="text-[10px] uppercase font-black font-mono tracking-wider text-gray-400 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" />
                  Sourcing Context ID
                </span>
                <div className="text-xs">
                  <p className="font-semibold text-gray-800">Campaign reference:</p>
                  <strong className="text-green-700 block mt-0.5 font-mono">{selectedPo.rfqId}</strong>
                  <p className="text-gray-500 leading-normal mt-1.5 font-sans">
                    Released automatically post Manager clearance verification.
                  </p>
                </div>
              </div>

              {/* Delivery / Payment terms */}
              <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50 space-y-2 text-left">
                <span className="text-[10px] uppercase font-black font-mono tracking-wider text-gray-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  Clearing Terms
                </span>
                <div className="text-xs">
                  <p>Incoterms: <strong className="text-gray-850">FOB Destination</strong></p>
                  <p className="mt-1">Handling Terms: <strong className="text-gray-855">{selectedPo.deliveryTerms}</strong></p>
                  <p className="mt-1.5 text-gray-500 leading-normal font-sans">
                    All deliveries are cleared through central receiving.
                  </p>
                </div>
              </div>
            </div>

            {/* Sourcing Itemized list Table breakdown */}
            <div className="border border-gray-200 rounded-xl overflow-hidden mt-4">
              <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 text-xs font-bold uppercase tracking-wider font-mono text-gray-500">
                Itemized authorized list within PO
              </div>
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/30 text-gray-400 uppercase font-mono">
                    <th className="py-2.5 px-4 font-bold">Line Category scope</th>
                    <th className="py-2.5 px-4 text-center font-bold">Quantity</th>
                    <th className="py-2.5 px-4 text-right font-bold">Unit rate (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-705 font-sans">
                  {selectedPo.items.map((line) => (
                    <tr key={line.id}>
                      <td className="py-2.5 px-4 font-bold text-gray-900">{line.item}</td>
                      <td className="py-2.5 px-4 text-center font-mono text-gray-500">
                        {line.qty} {line.unit}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono">
                        {formatINR(line.targetPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-450 uppercase font-mono tracking-wider font-semibold">
                  Approved financial release
                </span>
                <span className="text-base font-black font-mono text-gray-900">
                  {formatINR(selectedPo.approvedAmount)}
                </span>
              </div>
            </div>

            {/* Signatures block */}
            <div className="grid grid-cols-2 gap-12 pt-12 text-center text-xs text-gray-400">
              <div className="space-y-4">
                <div className="border-b border-gray-205 h-10 w-44 mx-auto" />
                <p>Authorized Signature (VendorBridge Corporate Hub)</p>
              </div>

              <div className="space-y-4">
                <div className="border-b border-gray-205 h-10 w-44 mx-auto" />
                <p>Receiving Clearance Sign-off (Vendor Partner representative)</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pagination controls */}
      {!selectedPo && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-100 pt-4 px-1">
          <div className="text-xs text-gray-500">
            Showing Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> (<strong>{filteredPOList.length} total POs</strong>)
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-605 disabled:opacity-50 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-655 disabled:opacity-50 transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
