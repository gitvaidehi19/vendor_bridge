import React, { useState } from "react";
import { useERP } from "../state";
import {
  TrendingUp,
  TrendingDown,
  Building2,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowRight,
  FileDown,
  Award,
  ChevronRight,
  Plus,
  FileText,
  ShieldCheck,
  CheckCircle2,
  FileSpreadsheet,
  CheckSquare,
  ShoppingBag,
  AlertCircle,
  Activity,
} from "lucide-react";
import { formatINR, formatINRCompact } from "../utils";

export const Dashboard: React.FC = () => {
  const {
    vendors,
    rfqs,
    quotations,
    purchaseOrders,
    invoices,
    approvals,
    activityLogs,
    setTab,
    addNotification,
  } = useERP();

  const [insightApplied, setInsightApplied] = useState(false);

  // 1. KPI Cards Calculations
  // Active RFQs: count of RFQs that are Open, Vendor Responses Received, Vendor Selected, Pending Approval
  const activeRFQsCount = rfqs.filter(
    (r) =>
      r.status === "Open" ||
      r.status === "Vendor Responses Received" ||
      r.status === "Vendor Selected" ||
      r.status === "Pending Approval"
  ).length;

  // Pending Approvals count
  const pendingApprovalsCount = approvals.filter((a) => a.status === "Pending").length;

  // Monthly Spend calculation (seed with baseline ₹2.45Cr for realistic enterprise layout)
  const monthlySpend = invoices.reduce((acc, curr) => acc + curr.grandTotal, 0) + 24500000;
  const formattedMonthlySpend = formatINR(monthlySpend);

  // Open Invoices (unpaid or generated status)
  const openInvoicesCount = invoices.filter((i) => i.status !== "Paid").length;

  // 2. RFQ Overview Categories
  const openRFQs = rfqs.filter(
    (r) =>
      r.status === "Open" ||
      r.status === "Vendor Responses Received" ||
      r.status === "Vendor Selected" ||
      r.status === "Pending Approval" ||
      r.status === "Approved"
  ).length;
  const draftRFQs = rfqs.filter((r) => r.status === "Draft").length;
  const closedRFQs = rfqs.filter(
    (r) => r.status === "Closed" || r.status === "PO Generated" || r.status === "Invoice Generated"
  ).length;
  const expiredRFQs = rfqs.filter((r) => r.status === "Rejected").length || 1;

  const handleApplyInsight = () => {
    if (insightApplied) return;
    setInsightApplied(true);

    addNotification(
      "AI Recommendation Applied",
      "Consolidation of IT Hardware Regional Contracts has been approved. Unified Master Agreement has been mapped to Global Tech Solutions Pvt. Ltd.",
      "Admin"
    );
    alert(
      "AI Procurement Insight Successfully Resolved:\n\n1. Consolidating IT Hardware contracts.\n2. Formulating Master RFP Framework.\n3. Estimated saving of ₹12,0,000 has been logged."
    );
  };

  // Helper for timeline activity time description
  const timeAgo = (isoString: string) => {
    try {
      const diff = Date.now() - new Date(isoString).getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return "5 min ago";
      if (mins < 60) return `${mins} min ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
      const days = Math.floor(hours / 24);
      return `${days} day${days > 1 ? "s" : ""} ago`;
    } catch {
      return "5 min ago";
    }
  };

  return (
    <div className="space-y-6">
      {/* Upper Panel Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 font-display tracking-tight">
            Procurement Operations Center
          </h2>
          <p className="text-sm text-gray-500 font-sans">
            Welcome back. Monitor and dispatch key procurement workflows in real-time.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-white border border-gray-200 rounded-lg p-1 flex">
            <button className="px-3 py-1 bg-green-600 text-white text-[11px] font-bold rounded transition-colors shadow-xs cursor-pointer">
              Quarterly
            </button>
            <button className="px-3 py-1 text-gray-500 hover:text-gray-900 text-[11px] font-bold rounded transition-all cursor-pointer">
              Monthly
            </button>
            <button className="px-3 py-1 text-gray-500 hover:text-gray-900 text-[11px] font-bold rounded transition-all cursor-pointer">
              Weekly
            </button>
          </div>
          <button
            onClick={() => alert("Simulating PDF Executive Report compilation...")}
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all cursor-pointer"
          >
            <FileDown className="w-4 h-4 text-gray-500" />
            Export Operational Memo
          </button>
        </div>
      </div>

      {/* KPI Highlight grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric Card 1: Active RFQs */}
        <div
          onClick={() => setTab("RFQs")}
          className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-green-400 hover:shadow-md transition-all cursor-pointer group"
          title="Click to view Active RFQs"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 font-medium text-xs uppercase tracking-wider font-mono group-hover:text-green-600 transition-colors">
              Active RFQs
            </span>
            <span className="text-green-700 bg-green-50 px-2 py-0.5 rounded text-[10px] font-bold font-mono border border-green-100">
              OPERATIONAL
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900 font-display leading-tight group-hover:text-green-700 transition-colors">
            {activeRFQsCount}
          </div>
          <div className="mt-4 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-green-600 w-3/5 rounded-full" />
          </div>
          <p className="mt-2.5 text-[11px] text-gray-450 font-mono">
            {rfqs.filter((r) => r.status === "Open").length} Open for Bidding
          </p>
        </div>

        {/* Metric Card 2: Pending Approvals */}
        <div
          onClick={() => setTab("Approvals")}
          className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-green-400 hover:shadow-md transition-all cursor-pointer group"
          title="Click to view Approval requests"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 font-medium text-xs uppercase tracking-wider font-mono group-hover:text-green-600 transition-colors">
              Pending Approvals
            </span>
            {pendingApprovalsCount > 0 ? (
              <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[10px] font-bold font-mono border border-amber-100 animate-pulse">
                ACTION REQ
              </span>
            ) : (
              <span className="text-green-700 bg-green-50 px-2 py-0.5 rounded text-[10px] font-bold font-mono border border-green-100">
                CLEAR
              </span>
            )}
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900 font-display leading-tight group-hover:text-green-700 transition-colors">
            {pendingApprovalsCount}
          </div>
          <div className="mt-4 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${pendingApprovalsCount > 0 ? "bg-amber-500 w-2/3" : "bg-green-600 w-full"}`}
            />
          </div>
          <p className="mt-2.5 text-[11px] text-gray-450">
            Awaiting executive budget signature
          </p>
        </div>

        {/* Metric Card 3: Monthly Spend */}
        <div
          onClick={() => setTab("Invoices")}
          className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-green-400 hover:shadow-md transition-all cursor-pointer group"
          title="Click to view Invoices & Spend Ledger"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 font-medium text-xs uppercase tracking-wider font-mono group-hover:text-green-600 transition-colors">
              Monthly Spend
            </span>
            <span className="text-green-700 bg-green-50 px-2.5 py-0.5 rounded text-[11px] font-bold inline-flex items-center gap-0.5 border border-green-100">
              <TrendingUp className="w-3 h-3" />
              +8.4%
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900 font-display leading-tight group-hover:text-green-700 transition-colors">
            {formattedMonthlySpend}
          </div>
          <div className="mt-4 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-green-600 w-4/5 rounded-full" />
          </div>
          <p className="mt-2.5 text-[11px] text-gray-455 font-mono">
            Fiscal Target Cap: ₹4.50Cr FY26
          </p>
        </div>

        {/* Metric Card 4: Open Invoices */}
        <div
          onClick={() => setTab("Invoices")}
          className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-green-400 hover:shadow-md transition-all cursor-pointer group"
          title="Click to view unpaid Invoices"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 font-medium text-xs uppercase tracking-wider font-mono group-hover:text-green-600 transition-colors">
              Open Invoices
            </span>
            <span className="text-red-700 bg-red-50 px-2 py-0.5 rounded text-[11px] font-bold border border-red-100">
              DUE SOON
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900 font-display leading-tight group-hover:text-green-700 transition-colors">
            {openInvoicesCount}
          </div>
          <div className="mt-4 flex items-center gap-1 text-amber-600 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <span>Unpaid settlements pending</span>
          </div>
          <p className="mt-2.5 text-[11px] text-gray-450">
            Awaiting supplier settlement clearance
          </p>
        </div>
      </div>

      {/* Procurement Pipeline Lifecycle Widget */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider font-mono mb-5 flex items-center gap-2">
          <Activity className="w-4.5 h-4.5 text-green-600" />
          Procurement Pipeline Lifecycle
        </h3>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Stage 1: RFQ */}
          <div className="flex-1 bg-gray-50/70 p-4 rounded-xl border border-gray-150 text-center hover:border-green-300 transition-all">
            <span className="text-[10px] uppercase font-bold text-gray-400 font-mono tracking-wider block">
              RFQs Created
            </span>
            <div className="text-2xl font-black text-gray-800 my-1 font-display">
              {rfqs.length}
            </div>
            <span className="text-[10px] text-green-600 font-semibold uppercase tracking-wider">
              Stage 1: Sourcing
            </span>
          </div>
          <div className="hidden lg:block text-gray-300 self-center shrink-0">
            <ChevronRight className="w-5 h-5" />
          </div>

          {/* Stage 2: Quotations */}
          <div className="flex-1 bg-gray-50/70 p-4 rounded-xl border border-gray-150 text-center hover:border-green-300 transition-all">
            <span className="text-[10px] uppercase font-bold text-gray-400 font-mono tracking-wider block">
              Quotations
            </span>
            <div className="text-2xl font-black text-gray-800 my-1 font-display">
              {quotations.length}
            </div>
            <span className="text-[10px] text-green-600 font-semibold uppercase tracking-wider">
              Stage 2: Bidding
            </span>
          </div>
          <div className="hidden lg:block text-gray-300 self-center shrink-0">
            <ChevronRight className="w-5 h-5" />
          </div>

          {/* Stage 3: Pending Approval */}
          <div className="flex-1 bg-gray-50/70 p-4 rounded-xl border border-gray-150 text-center hover:border-green-300 transition-all">
            <span className="text-[10px] uppercase font-bold text-gray-400 font-mono tracking-wider block">
              Pending Approval
            </span>
            <div className="text-2xl font-black text-amber-600 my-1 font-display">
              {approvals.filter((a) => a.status === "Pending").length}
            </div>
            <span className="text-[10px] text-amber-600 font-semibold uppercase tracking-wider">
              Stage 3: Review
            </span>
          </div>
          <div className="hidden lg:block text-gray-300 self-center shrink-0">
            <ChevronRight className="w-5 h-5" />
          </div>

          {/* Stage 4: Approved */}
          <div className="flex-1 bg-gray-50/70 p-4 rounded-xl border border-gray-150 text-center hover:border-green-300 transition-all">
            <span className="text-[10px] uppercase font-bold text-gray-400 font-mono tracking-wider block">
              Approved
            </span>
            <div className="text-2xl font-black text-green-600 my-1 font-display">
              {approvals.filter((a) => a.status === "Approved").length}
            </div>
            <span className="text-[10px] text-green-600 font-semibold uppercase tracking-wider">
              Stage 4: Clearance
            </span>
          </div>
          <div className="hidden lg:block text-gray-300 self-center shrink-0">
            <ChevronRight className="w-5 h-5" />
          </div>

          {/* Stage 5: PO Generated */}
          <div className="flex-1 bg-gray-50/70 p-4 rounded-xl border border-gray-150 text-center hover:border-green-300 transition-all">
            <span className="text-[10px] uppercase font-bold text-gray-400 font-mono tracking-wider block">
              PO Generated
            </span>
            <div className="text-2xl font-black text-gray-800 my-1 font-display">
              {purchaseOrders.length}
            </div>
            <span className="text-[10px] text-green-600 font-semibold uppercase tracking-wider">
              Stage 5: PO Order
            </span>
          </div>
          <div className="hidden lg:block text-gray-300 self-center shrink-0">
            <ChevronRight className="w-5 h-5" />
          </div>

          {/* Stage 6: Invoices */}
          <div className="flex-1 bg-gray-50/70 p-4 rounded-xl border border-gray-150 text-center hover:border-green-300 transition-all">
            <span className="text-[10px] uppercase font-bold text-gray-400 font-mono tracking-wider block">
              Invoices
            </span>
            <div className="text-2xl font-black text-gray-800 my-1 font-display">
              {invoices.length}
            </div>
            <span className="text-[10px] text-green-600 font-semibold uppercase tracking-wider">
              Stage 6: Settlement
            </span>
          </div>
        </div>
      </div>

      {/* Spend Curve Trend Chart and Quick Sourcing Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        {/* Spend Curve Chart (70%) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col min-h-[350px]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider font-mono">
                Monthly Spend Trend (FY26)
              </h3>
              <p className="text-xs text-gray-400">
                Aggregated procurement activity under treasury clearance
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-xs text-gray-450">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
                Current Year
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-455">
                <span className="w-2.5 h-2.5 rounded-full bg-gray-300 inline-block" />
                Prior Year
              </span>
            </div>
          </div>
          <div className="flex-1 relative min-h-[180px] mt-4">
            <svg
              className="absolute inset-0 w-full h-full text-green-600 bg-transparent overflow-visible"
              viewBox="0 0 600 200"
              preserveAspectRatio="none"
            >
              <line x1="0" y1="50" x2="600" y2="50" stroke="#f3f4f6" strokeWidth="1" />
              <line x1="0" y1="100" x2="600" y2="100" stroke="#f3f4f6" strokeWidth="1" />
              <line x1="0" y1="150" x2="600" y2="150" stroke="#f3f4f6" strokeWidth="1" />

              <path
                d="M 0,160 Q 100,150 200,120 T 400,100 T 600,130"
                fill="none"
                stroke="#d1d5db"
                strokeWidth="2"
                strokeDasharray="4 4"
              />

              <defs>
                <linearGradient id="chart-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#16a34a" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#16a34a" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              <path
                d="M 0,130 C 80,110 120,40 200,80 C 280,120 320,130 400,60 C 480,10 520,70 600,30 L 600,200 L 0,200 Z"
                fill="url(#chart-grad)"
              />

              <path
                d="M 0,130 C 80,110 120,40 200,80 C 280,120 320,130 400,60 C 480,10 520,70 600,30"
                fill="none"
                stroke="#16a34a"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              <circle cx="200" cy="80" r="5" fill="#ffffff" stroke="#16a34a" strokeWidth="2.5" />
              <circle cx="400" cy="60" r="5" fill="#ffffff" stroke="#16a34a" strokeWidth="2.5" />
              <circle cx="600" cy="30" r="5" fill="#ffffff" stroke="#16a34a" strokeWidth="2.5" />
            </svg>
            <div className="absolute inset-x-0 bottom-[-24px] flex justify-between text-[11px] text-gray-400 font-mono tracking-wider">
              <span>JAN</span>
              <span>MAR</span>
              <span>MAY</span>
              <span>JUL</span>
              <span>SEP</span>
              <span>NOV</span>
            </div>
          </div>
        </div>

        {/* Quick Sourcing Actions (30%) */}
        <div className="lg:col-span-3 bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider font-mono mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => setTab("RFQs")}
                className="w-full flex items-center justify-between p-3.5 bg-gray-50 hover:bg-green-50/50 hover:text-green-700 border border-gray-100 hover:border-green-300 rounded-xl transition-all font-bold text-xs text-gray-700 cursor-pointer group"
              >
                <span className="flex items-center gap-2">
                  <Plus className="w-4 h-4 text-green-600 group-hover:text-green-600" />
                  + Create RFQ
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              </button>

              <button
                onClick={() => setTab("Vendors")}
                className="w-full flex items-center justify-between p-3.5 bg-gray-50 hover:bg-green-50/50 hover:text-green-700 border border-gray-100 hover:border-green-300 rounded-xl transition-all font-bold text-xs text-gray-700 cursor-pointer group"
              >
                <span className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-green-600 group-hover:text-green-600" />
                  + Add Vendor
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              </button>

              <button
                onClick={() => setTab("Quotes")}
                className="w-full flex items-center justify-between p-3.5 bg-gray-50 hover:bg-green-50/50 hover:text-green-700 border border-gray-100 hover:border-green-300 rounded-xl transition-all font-bold text-xs text-gray-700 cursor-pointer group"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-green-600 group-hover:text-green-600" />
                  + Compare Quotations
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              </button>

              <button
                onClick={() => setTab("Invoices")}
                className="w-full flex items-center justify-between p-3.5 bg-gray-50 hover:bg-green-50/50 hover:text-green-700 border border-gray-100 hover:border-green-300 rounded-xl transition-all font-bold text-xs text-gray-700 cursor-pointer group"
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-green-600 group-hover:text-green-600" />
                  + Generate Invoice
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              </button>
            </div>
          </div>
          <p className="text-[10px] text-gray-400 font-mono mt-4">
            Operational shortcuts dynamically linked.
          </p>
        </div>
      </div>

      {/* Side-by-side Recent POs and Recent Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Purchase Orders Table */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider font-mono">
              Recent Purchase Orders
            </h3>
            <button
              onClick={() => setTab("Purchase Orders")}
              className="text-xs text-green-600 hover:text-green-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              All Purchase Orders
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50 text-gray-400 uppercase tracking-wider font-mono">
                  <th className="py-3 px-4 font-bold">PO No</th>
                  <th className="py-3 px-4 font-bold">Vendor</th>
                  <th className="py-3 px-4 text-right font-bold">Amount</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {purchaseOrders.slice().reverse().slice(0, 4).map((po) => (
                  <tr key={po.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-gray-900">{po.id}</td>
                    <td className="py-3 px-4 font-medium text-gray-700">{po.vendorName}</td>
                    <td className="py-3 px-4 text-right font-bold text-gray-850">
                      {formatINR(po.approvedAmount)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono bg-green-50 text-green-700 border border-green-200">
                        🟢 Approved
                      </span>
                    </td>
                  </tr>
                ))}
                {purchaseOrders.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-400">
                      No purchase orders recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Invoices Table */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider font-mono">
              Recent Invoices
            </h3>
            <button
              onClick={() => setTab("Invoices")}
              className="text-xs text-green-600 hover:text-green-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              All Invoices
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50 text-gray-400 uppercase tracking-wider font-mono">
                  <th className="py-3 px-4 font-bold">Invoice</th>
                  <th className="py-3 px-4 font-bold">Vendor</th>
                  <th className="py-3 px-4 text-right font-bold">Amount</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoices.slice().reverse().slice(0, 4).map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-gray-900">{inv.id}</td>
                    <td className="py-3 px-4 font-medium text-gray-700">{inv.vendorName}</td>
                    <td className="py-3 px-4 text-right font-bold text-gray-850">
                      {formatINR(inv.grandTotal)}
                    </td>
                    <td className="py-3 px-4">
                      {inv.status === "Paid" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono bg-green-50 text-green-700 border border-green-200">
                          🟢 Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono bg-yellow-50 text-yellow-700 border border-yellow-200">
                          🟡 Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {invoices.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-400">
                      No invoices recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Side-by-side Pending Approval Queue and RFQ Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Approvals Table */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider font-mono">
              Pending Approvals
            </h3>
            <button
              onClick={() => setTab("Approvals")}
              className="text-xs text-green-600 hover:text-green-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              All Approvals
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50 text-gray-400 uppercase tracking-wider font-mono">
                  <th className="py-3 px-4 font-bold">RFQ</th>
                  <th className="py-3 px-4 font-bold">Vendor</th>
                  <th className="py-3 px-4 text-right font-bold">Amount</th>
                  <th className="py-3 px-4 text-center font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {approvals
                  .filter((a) => a.status === "Pending")
                  .slice(0, 4)
                  .map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-gray-900">{req.rfqId}</td>
                      <td className="py-3 px-4 font-medium text-gray-700">{req.vendorName}</td>
                      <td className="py-3 px-4 text-right font-bold text-gray-850">
                        {formatINR(req.amount)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setTab("Approvals")}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md text-[10px] font-bold shadow-xs hover:shadow active:scale-95 transition-all cursor-pointer"
                        >
                          Review Approval
                        </button>
                      </td>
                    </tr>
                  ))}
                {approvals.filter((a) => a.status === "Pending").length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-400">
                      No pending approval requests.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RFQ Status Overview */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider font-mono mb-4">
            RFQ Status Overview
          </h3>
          <div className="flex-1 flex flex-col sm:flex-row items-center justify-around gap-4 py-2">
            {/* Donut Chart */}
            <div className="relative w-36 h-36 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f3f4f6" strokeWidth="3.8" />
                {/* Segment 1: Open RFQs (green) */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="none"
                  stroke="#16a34a"
                  strokeWidth="4"
                  strokeDasharray="45 55"
                  strokeDashoffset="100"
                />
                {/* Segment 2: Closed RFQs (slate-900) */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="none"
                  stroke="#0f172a"
                  strokeWidth="4.2"
                  strokeDasharray="30 70"
                  strokeDashoffset="55"
                />
                {/* Segment 3: Draft RFQs (gray-500) */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="none"
                  stroke="#6b7280"
                  strokeWidth="4"
                  strokeDasharray="15 85"
                  strokeDashoffset="25"
                />
                {/* Segment 4: Expired/Rejected RFQs (red-500) */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="4"
                  strokeDasharray="10 90"
                  strokeDashoffset="10"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[10px] text-gray-400 uppercase font-mono tracking-wider font-semibold">
                  Total RFQs
                </span>
                <span className="text-base font-black text-gray-900 font-display">
                  {rfqs.length}
                </span>
              </div>
            </div>

            {/* Counts */}
            <div className="space-y-2 w-full text-xs max-w-[180px]">
              <div className="flex justify-between items-center text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#16a34a]" />
                  <span>Open RFQs</span>
                </div>
                <span className="font-bold text-gray-900">{openRFQs}</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#6b7280]" />
                  <span>Draft RFQs</span>
                </div>
                <span className="font-bold text-gray-900">{draftRFQs}</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0f172a]" />
                  <span>Closed RFQs</span>
                </div>
                <span className="font-bold text-gray-900">{closedRFQs}</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
                  <span>Expired RFQs</span>
                </div>
                <span className="font-bold text-gray-900">{expiredRFQs}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Feed Widget */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider font-mono mb-6 flex items-center gap-2">
          <Clock className="w-4.5 h-4.5 text-green-600" />
          Recent Activities Feed
        </h3>
        <div className="flow-root">
          <ul className="-mb-8">
            {activityLogs
              .slice()
              .reverse()
              .slice(0, 5)
              .map((log, idx) => {
                const isLast = idx === 4 || idx === activityLogs.length - 1;
                return (
                  <li key={log.id}>
                    <div className="relative pb-6">
                      {!isLast && (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      )}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-green-50 border border-green-200 flex items-center justify-center ring-8 ring-white">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          </span>
                        </div>
                        <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-xs text-gray-800 font-medium">
                              {log.details}{" "}
                              <span className="text-[10px] text-gray-400 font-mono">
                                ({log.user} · {log.module})
                              </span>
                            </p>
                          </div>
                          <div className="text-right text-[10px] whitespace-nowrap text-gray-400 font-mono">
                            {timeAgo(log.timestamp)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
          </ul>
        </div>
      </div>

      {/* AI Recommendation notification banner */}
      <div className="bg-green-50 border border-green-100 rounded-xl p-6 flex flex-col md:flex-row items-center gap-5 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center shrink-0">
          <Sparkles className="w-6 h-6 text-green-600 animate-pulse" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h4 className="text-sm font-bold text-green-950 font-display">
            AI Analytics Insights: IT Procurement Consolidation Opportunity
          </h4>
          <p className="text-xs text-green-800 mt-1 leading-relaxed">
            We've identified redundancy across your active IT vendors. By consolidating regional server fittings
            and cabling onto a master framework agreement with <strong>Global Tech Solutions Pvt. Ltd.</strong>,
            you can eliminate multi-route dispatch premiums. Expected annual spend reduction:{" "}
            <strong className="text-green-950">₹12,00,000</strong>.
          </p>
        </div>
        <div className="flex gap-2.5">
          <button
            onClick={handleApplyInsight}
            disabled={insightApplied}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              insightApplied
                ? "bg-green-100 text-green-400 cursor-not-allowed border border-green-200"
                : "bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow active:scale-98"
            }`}
          >
            {insightApplied ? "Optimized Consolidation Mapped" : "Consolidate Agreements"}
          </button>
          {!insightApplied && (
            <button
              onClick={() => alert("Insight dismissed. Will reappear on queue reboot.")}
              className="px-4 py-2 border border-green-200 text-green-700 hover:bg-green-100 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
