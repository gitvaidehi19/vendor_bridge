import React, { useState } from "react";
import { useERP } from "../state";
import { ApprovalRequest, ApprovalStatus } from "../types";
import {
  CheckSquare,
  XSquare,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  AlertCircle,
  ClipboardList,
  Sparkles,
  Undo2,
  ChevronLeft,
  ChevronRight,
  User,
} from "lucide-react";
import { formatINR } from "../utils";

export const Approvals: React.FC = () => {
  const {
    currentUser,
    approvals,
    approveRFQ,
    rejectRFQ,
    requestChanges,
    searchQuery,
  } = useERP();

  const [remarks, setRemarks] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const pendingApprovals = approvals.filter((a) => a.status === "Pending");
  const completedApprovals = approvals.filter((a) => a.status !== "Pending");

  // Search filter
  const filteredPending = pendingApprovals.filter(
    (a) =>
      a.rfqTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCompleted = completedApprovals.filter(
    (a) =>
      a.rfqTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination for Completed Approvals
  const totalPages = Math.ceil(filteredCompleted.length / itemsPerPage);
  const paginatedCompleted = filteredCompleted.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const isApprover = currentUser.role === "Manager" || currentUser.role === "Admin";

  const handleApprove = (rfqId: string) => {
    approveRFQ(rfqId, remarks);
    setRemarks("");
    alert("Proposal Sanctioned!\nPurchase Order generated and invoice draft compiled automatically.");
  };

  const handleReject = (rfqId: string) => {
    if (!remarks.trim()) {
      alert("Please provide explanatory remarks before rejecting.");
      return;
    }
    rejectRFQ(rfqId, remarks);
    setRemarks("");
    alert("Proposal Rejected!\nStatus of sourcing campaign updated and logged.");
  };

  const handleRequestChanges = (rfqId: string) => {
    if (!remarks.trim()) {
      alert("Please provide specific remarks outlining the changes requested.");
      return;
    }
    requestChanges(rfqId, remarks);
    setRemarks("");
    alert("Changes Requested!\nRFQ status updated, and sourcing officer notified.");
  };

  const getStatusBadge = (status: ApprovalStatus) => {
    switch (status) {
      case "Approved":
        return "bg-green-50 text-green-700 border border-green-150";
      case "Rejected":
        return "bg-red-50 text-red-700 border border-red-150";
      case "Changes Requested" as ApprovalStatus:
        return "bg-amber-50 text-amber-700 border border-amber-150";
      default:
        return "bg-gray-105 text-gray-700 border border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Upper action header banner */}
      <div>
        <h2 className="text-2xl font-black text-gray-900 font-display tracking-tight">
          Treasury Clearance &amp; Sourcing Approvals
        </h2>
        <p className="text-sm text-gray-500 font-sans">
          Manager authorization dashboard for contracts, expenditures, and capital allocations.
        </p>
      </div>

      {/* Authority Shield Alert banner if not manager */}
      {!isApprover && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl flex items-start gap-3 text-xs leading-relaxed max-w-4xl">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
          <div>
            <strong>Read-Only Sourcing Buffer View:</strong> Your current persona level (
            <strong>{currentUser.role}</strong>) holds audit-only privileges inside this module. To simulate
            manager decisions and trigger automatic Purchase Orders alongside invoice compilations, switch acting personas to
            <strong> Manager</strong> in the left sidebar directory panel first.
          </div>
        </div>
      )}

      {/* Queue splitting: Pending tickets */}
      <div className="space-y-4">
        <h3 className="text-xs uppercase font-black tracking-wider text-gray-400 font-mono border-b border-gray-100 pb-2">
          Clearance queue ticket pipeline ({filteredPending.length})
        </h3>

        {filteredPending.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-10 text-center text-gray-400 text-xs">
            <ClipboardList className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            No pending approval requests in queue.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPending.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col lg:flex-row lg:items-start justify-between gap-6 transition-all"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono font-black text-xs text-amber-600">{ticket.id}</span>
                    <span className="text-gray-300 text-xs font-mono">•</span>
                    <span className="text-xs text-gray-400 font-mono">{ticket.rfqId}</span>
                    <span className="text-gray-300 text-xs font-mono">•</span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-500">
                      Officer: {ticket.officerName}
                    </span>
                  </div>

                  <h4 className="font-black text-gray-900 text-base tracking-tight leading-snug">
                    {ticket.rfqTitle}
                  </h4>

                  <div className="bg-green-50/15 border border-green-100 rounded-lg p-3 text-xs text-green-950 font-sans">
                    <span className="font-bold uppercase tracking-wider text-[9px] text-green-800 font-mono block mb-1">
                      Evaluation justification summary
                    </span>
                    "{ticket.justification}"
                  </div>

                  {/* Flow timeline representation */}
                  <div className="border-t border-gray-100 pt-3">
                    <span className="text-[10px] text-gray-400 uppercase font-mono font-bold block mb-2">Campaign Flow Timeline</span>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-gray-500">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span>Sourcing Campaign Initialized &amp; Bid Filed</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span>Vendor Selected: <strong className="text-gray-700">{ticket.vendorName}</strong></span>
                      </div>
                      <div className="flex items-center gap-2 text-amber-600 font-medium">
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                        <span>Awaiting Management Treasury Clearance Decision</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 pt-1">
                    <span>
                      Drafted Date:{" "}
                      <strong>
                        {new Date(ticket.timestamp).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Right: Sourcing controls for manager */}
                <div className="lg:w-80 shrink-0 bg-gray-50/70 p-4 border border-gray-200 rounded-xl flex flex-col justify-between">
                  <div className="text-left mb-3">
                    <span className="text-[10px] text-gray-400 font-mono uppercase block">Sanction gross Allocation</span>
                    <strong className="text-xl font-black font-mono text-gray-950 block">
                      {formatINR(ticket.amount)}
                    </strong>
                    <span className="text-[9px] text-gray-400 leading-none block font-semibold mt-0.5">Payment Terms: NET 30</span>
                  </div>

                  {isApprover ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Add decision remarks..."
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-green-500 focus:outline-none"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleReject(ticket.rfqId)}
                          className="py-1.5 px-3 bg-white border border-gray-200 text-red-700 hover:bg-red-50 text-xs font-bold rounded shadow-xs text-center transition-colors cursor-pointer"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleApprove(ticket.rfqId)}
                          className="py-1.5 px-3 bg-green-600 text-white hover:bg-green-700 text-xs font-bold rounded shadow-xs text-center transition-colors cursor-pointer"
                        >
                          Approve
                        </button>
                      </div>
                      <button
                        onClick={() => handleRequestChanges(ticket.rfqId)}
                        className="w-full py-1.5 px-3 bg-white border border-amber-300 text-amber-700 hover:bg-amber-50 text-xs font-bold rounded shadow-xs text-center transition-colors cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Undo2 className="w-3.5 h-3.5" /> Request Changes
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400 py-3 text-center italic border-t border-gray-200">
                      Access Restricted. Acting Manager persona required to authorize.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historical logs completed table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden pt-1">
        <div className="px-6 py-4 bg-gray-50/70 border-b border-gray-150">
          <h4 className="text-xs uppercase font-black tracking-wider text-gray-500 font-mono">
            Clearance Audit Journal history ({filteredCompleted.length})
          </h4>
        </div>

        <div className="divide-y divide-gray-100">
          {paginatedCompleted.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-xs">
              No historic logs found in archive.
            </div>
          ) : (
            paginatedCompleted.map((t) => (
              <div key={t.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-xs text-slate-800">{t.id}</span>
                    <span className="text-gray-300 text-xs">•</span>
                    <span className="text-xs text-gray-400 font-mono">{t.rfqId}</span>
                  </div>
                  <h4 className="font-bold text-gray-950 text-sm tracking-tight">{t.rfqTitle}</h4>
                  <p className="text-[10px] text-gray-400 block leading-normal font-sans">
                    Amount: <strong className="text-gray-700 font-mono">{formatINR(t.amount)}</strong> • Selection:{" "}
                    <strong>{t.vendorName}</strong>
                  </p>

                  {/* Flow timeline representation */}
                  <div className="pt-1 text-xs">
                    <span className="text-[9px] text-gray-400 uppercase font-mono block">Clearance Remarks Timeline</span>
                    <div className="flex items-center gap-2 text-gray-600 mt-0.5">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
                      <span>
                        Manager Decision: <strong className="capitalize">{t.status}</strong>
                        {t.remarks && <span className="text-gray-500 font-medium font-sans"> (Feedback: "{t.remarks}")</span>}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0 self-end md:self-auto">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-lg font-mono ${getStatusBadge(
                      t.status
                    )}`}
                  >
                    {t.status === "Approved" ? (
                      <CheckCircle className="w-3.5 h-3.5" />
                    ) : t.status === ("Changes Requested" as ApprovalStatus) ? (
                      <Undo2 className="w-3.5 h-3.5" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5" />
                    )}
                    {t.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-100 pt-4 px-1">
          <div className="text-xs text-gray-500">
            Showing Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> (<strong>{filteredCompleted.length} historic tickets</strong>)
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
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 disabled:opacity-50 transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
