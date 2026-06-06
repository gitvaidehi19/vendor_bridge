import React, { useState, useEffect } from "react";
import { useERP } from "../state";
import { Invoice } from "../types";
import {
  CheckCircle,
  Mail,
  Printer,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Calculator,
  Building,
  CreditCard,
  FileSpreadsheet,
} from "lucide-react";
import { formatINR } from "../utils";

export const Invoices: React.FC = () => {
  const {
    currentUser,
    invoices,
    vendors,
    emailInvoiceVendor,
    payInvoice,
    searchQuery,
  } = useERP();

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Reset pagination on search
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Sync selected Invoice details if updated globally
  useEffect(() => {
    if (selectedInvoice) {
      const updated = invoices.find((inv) => inv.id === selectedInvoice.id);
      if (updated) setSelectedInvoice(updated);
    }
  }, [invoices, selectedInvoice]);

  // Filters search
  const filteredInvoiceList = invoices.filter((inv) => {
    const matchesSearch =
      inv.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.poId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.status.toLowerCase().includes(searchQuery.toLowerCase());

    if (currentUser.role === "Vendor") {
      return matchesSearch && inv.vendorId === currentUser.vendorId;
    }
    return matchesSearch;
  });

  const handleEmailInvoiceAction = (invId: string) => {
    emailInvoiceVendor(invId);
    alert(`Email remittance Copy sent successfully to invoicing channel.`);
  };

  const handlePayInvoiceAction = (invId: string) => {
    payInvoice(invId);
    alert(`Sourcing Payment Settle Success!\nTreasury cleared, ledger locked, and remittance processed.`);
  };

  const handlePrint = () => {
    window.print();
  };

  const isFinancialOfficer = currentUser.role === "Admin" || currentUser.role === "Manager";

  // Pagination calculation
  const totalPages = Math.ceil(filteredInvoiceList.length / itemsPerPage);
  const paginatedInvoiceList = filteredInvoiceList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Upper header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 font-display tracking-tight">
            Accounts Payable &amp; Invoice Remittances
          </h2>
          <p className="text-sm text-gray-500 font-sans">
            Oversee, reconcile, and settle commercial invoices filed against purchase contracts.
          </p>
        </div>
      </div>

      {/* Grid of invoice index lists */}
      {!selectedInvoice ? (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-mono font-bold text-gray-500">
              Accounts Payable Registry ({filteredInvoiceList.length} filings)
            </span>
          </div>

          <div className="divide-y divide-gray-100">
            {paginatedInvoiceList.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <FileSpreadsheet className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm">No Invoices compiled in corporate ledger database.</p>
              </div>
            ) : (
              paginatedInvoiceList.map((inv) => (
                <div
                  key={inv.id}
                  onClick={() => setSelectedInvoice(inv)}
                  className="p-5 hover:bg-gray-50/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer group"
                >
                  <div className="space-y-1.5 flex-1 pr-6 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-xs text-green-600">{inv.id}</span>
                      <span className="text-gray-300 text-xs">•</span>
                      <span className="text-xs text-gray-450 font-mono">Linked PO: {inv.poId}</span>
                    </div>

                    <h4 className="font-bold text-gray-955 text-sm tracking-tight leading-none">
                      Billed By: {inv.vendorName}
                    </h4>

                    <div className="text-[11px] text-gray-400">
                      Filed Stamp: {new Date(inv.timestamp).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-right shrink-0 self-end md:self-auto">
                    <div>
                      <span className="text-[10px] text-gray-400 block font-mono">Gross Total Billed</span>
                      <strong className="text-sm text-gray-900 font-bold font-mono">
                        {formatINR(inv.grandTotal)}
                      </strong>
                    </div>

                    <span
                      className={`inline-block px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded-lg font-mono text-center border ${
                        inv.status === "Paid"
                          ? "bg-green-50 text-green-700 border-green-100"
                          : inv.status === "Emailed"
                          ? "bg-purple-50 text-purple-700 border-purple-100"
                          : "bg-amber-50 text-amber-700 border-amber-100"
                      }`}
                    >
                      {inv.status}
                    </span>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-green-500 transition-colors" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* Detailed interactive invoice sheet design */
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden animate-in fade-in duration-200">
          <div className="px-8 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between no-print">
            <button
              onClick={() => setSelectedInvoice(null)}
              className="text-xs text-green-600 hover:text-green-700 font-bold inline-flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Return to directory index
            </button>
            <span className="text-[10px] font-mono font-bold text-gray-400">
              Audit Invoice Key: {selectedInvoice.id}
            </span>
          </div>

          <div className="p-8 space-y-6 print-card">
            {/* Tool selectors and triggers */}
            <div className="flex flex-wrap gap-2.5 justify-end border-b border-gray-100 pb-4 no-print">
              <button
                onClick={handlePrint}
                className="px-3.5 py-1.5 border border-gray-200 hover:bg-gray-50 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-gray-500" />
                Print Invoice
              </button>

              <button
                onClick={() => handleEmailInvoiceAction(selectedInvoice.id)}
                className="px-3.5 py-1.5 border border-gray-200 hover:bg-gray-50 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Mail className="w-4 h-4 text-gray-500" />
                Email Invoice Copy
              </button>

              {isFinancialOfficer && selectedInvoice.status !== "Paid" && (
                <button
                  onClick={() => handlePayInvoiceAction(selectedInvoice.id)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <CreditCard className="w-4 h-4 text-white" />
                  Approve Settlement Payment (Remittance Settle)
                </button>
              )}
            </div>

            {/* Document details header */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-gray-150 pb-6">
              <div className="space-y-3 text-left">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-gray-900 flex items-center justify-center text-white font-bold text-sm">
                    INV
                  </div>
                  <strong className="text-gray-900 font-display text-lg tracking-tight">Accounts Payable Clearing</strong>
                </div>
                <p className="text-xs text-gray-500 leading-normal max-w-xs font-sans">
                  VendorBridge India Pvt. Ltd.<br />
                  Bandra Kurla Complex, Mumbai, MH - 400051<br />
                  <strong>GSTIN: 27AAAVB1234C1Z5</strong> (Buyer)
                </p>
              </div>

              <div className="text-left md:text-right space-y-2">
                <span className="text-xs uppercase font-black font-mono tracking-wider text-green-700 block">
                  Tax Invoice / Receipt
                </span>
                <h1 className="text-2xl font-black font-mono text-gray-900 leading-none">
                  {selectedInvoice.id}
                </h1>
                <div className="text-xs text-gray-400 space-y-0.5 font-sans">
                  <p>Invoiced On: <strong className="text-gray-700 font-mono">{new Date(selectedInvoice.timestamp).toLocaleDateString("en-IN")}</strong></p>
                  <p>Linked PO ID: <strong className="text-green-700 font-mono">{selectedInvoice.poId}</strong></p>
                  <p>Campaign ref: <strong className="text-gray-700 font-mono">{selectedInvoice.rfqId}</strong></p>
                </div>
              </div>
            </div>

            {/* Addresses info boxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50 space-y-1.5 text-left">
                <span className="text-[10px] uppercase font-black font-mono tracking-wider text-gray-400 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5" />
                  Billed By Supplier Entity
                </span>
                <div>
                  <strong className="text-sm font-bold text-gray-900 block leading-tight">
                    {selectedInvoice.vendorName}
                  </strong>
                  <p className="text-[11px] text-gray-500 mt-1 leading-normal font-sans">
                    GSTIN: <strong className="text-gray-750 font-mono">{vendors.find(v => v.id === selectedInvoice.vendorId)?.gstNumber || "N/A"}</strong> (Supplier)<br />
                    Channel Contact: {vendors.find(v => v.id === selectedInvoice.vendorId)?.email || "billing@vendor.com"}<br />
                    Address: {vendors.find(v => v.id === selectedInvoice.vendorId)?.address || "Corporate HQ Address"}
                  </p>
                </div>
              </div>

              <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50 space-y-1.5 text-left">
                <span className="text-[10px] uppercase font-black font-mono tracking-wider text-gray-400 flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5" />
                  Remittance Settle Terms
                </span>
                <div className="text-xs text-gray-650 leading-relaxed font-sans">
                  <p>Settlement terms: <strong className="text-gray-800">Net 30 Settle terms</strong></p>
                  <p>Billing Account: <strong className="text-gray-800 font-mono">Treasury Clearing auto-logged</strong></p>
                  <p className="mt-1.5 text-gray-500 leading-normal">
                    This document serves as a financial clearance tax receipt upon invoice payment.
                  </p>
                </div>
              </div>
            </div>

            {/* Line items and taxes calculations */}
            <div className="border border-gray-200 rounded-xl overflow-hidden mt-4">
              <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 text-xs font-bold uppercase tracking-wider font-mono text-gray-500">
                Itemized Position pricing breakdown
              </div>
              <table className="w-full text-left text-xs text-gray-705">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/20 text-gray-400 uppercase font-mono">
                    <th className="py-2.5 px-4 font-bold">Billing Scope Description</th>
                    <th className="py-2.5 px-4 text-center font-bold">HSN</th>
                    <th className="py-2.5 px-4 text-center font-bold">Qty</th>
                    <th className="py-2.5 px-4 text-right font-bold">Unit Rate</th>
                    <th className="py-2.5 px-4 text-right font-bold">CGST (9%)</th>
                    <th className="py-2.5 px-4 text-right font-bold">SGST (9%)</th>
                    <th className="py-2.5 px-4 text-right font-bold">Total (Gross)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-mono">
                  {selectedInvoice.items.map((line, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 px-4 font-sans font-bold text-gray-900">{line.item}</td>
                      <td className="py-2.5 px-4 text-center font-bold text-gray-600">{line.hsn || "—"}</td>
                      <td className="py-2.5 px-4 text-center font-sans text-gray-500">{line.qty}</td>
                      <td className="py-2.5 px-4 text-right text-gray-500">{formatINR(line.unitPrice)}</td>
                      <td className="py-2.5 px-4 text-right text-gray-400">{formatINR(line.cgst)}</td>
                      <td className="py-2.5 px-4 text-right text-gray-400">{formatINR(line.sgst)}</td>
                      <td className="py-2.5 px-4 text-right font-bold text-gray-800">
                        {formatINR(line.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Taxation breakdown list */}
              <div className="p-5 bg-gray-50/70 border-t border-gray-200 flex justify-end">
                <div className="w-80 text-xs space-y-2 text-gray-600 font-sans">
                  <div className="flex justify-between">
                    <span>Sourcing Subtotal net:</span>
                    <span className="font-mono text-gray-800 font-semibold">{formatINR(selectedInvoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-1.5 text-gray-450">
                    <span>CGST portion (9.0%):</span>
                    <span className="font-mono text-gray-800">{formatINR(selectedInvoice.cgst)}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-1.5 text-gray-450">
                    <span>SGST portion (9.0%):</span>
                    <span className="font-mono text-gray-800">{formatINR(selectedInvoice.sgst)}</span>
                  </div>
                  <div className="flex justify-between text-gray-900 font-bold text-sm pt-1 bg-transparent">
                    <span className="text-green-700 uppercase tracking-wide font-mono font-bold">Total Gross Remittance:</span>
                    <span className="font-mono text-gray-900 font-black">
                      {formatINR(selectedInvoice.grandTotal)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Legal Status Notice */}
            <div className="bg-gray-50/70 border border-gray-150 p-4 rounded-lg flex items-center justify-between text-xs text-gray-500 font-sans no-print">
              <span>Remittance Status stamp indicator: </span>
              <strong className={`uppercase font-mono px-3 py-1 rounded text-[10px] font-black tracking-widest ${
                selectedInvoice.status === "Paid"
                  ? "bg-green-100 text-green-800 border border-green-200"
                  : "bg-amber-100 text-amber-800 border border-amber-200"
              }`}>
                {selectedInvoice.status}
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* Pagination controls */}
      {!selectedInvoice && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-100 pt-4 px-1">
          <div className="text-xs text-gray-500">
            Showing Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> (<strong>{filteredInvoiceList.length} total invoices</strong>)
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 disabled:opacity-50 transition-all cursor-pointer"
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
