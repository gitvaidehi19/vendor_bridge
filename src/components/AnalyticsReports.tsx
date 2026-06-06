import React, { useState } from "react";
import { useERP } from "../state";
import {
  Download,
  Calendar,
  TrendingUp,
  Award,
  ChevronRight,
  FileText,
  Printer,
  ChevronLeft,
  BarChart2,
  PieChart,
  TrendingDown,
  ChevronDown,
  Activity,
  CheckCircle2,
  AlertCircle,
  Building2,
} from "lucide-react";
import { formatINR, toCSV, downloadCSV } from "../utils";

export const AnalyticsReports: React.FC = () => {
  const { invoices, purchaseOrders, vendors, approvals, rfqs } = useERP();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("May 2025");
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter invoices based on date range
  const filteredInvoices = invoices.filter((inv) => {
    const invDateStr = inv.timestamp.split("T")[0]; // YYYY-MM-DD
    const matchesStartDate = !startDate || invDateStr >= startDate;
    const matchesEndDate = !endDate || invDateStr <= endDate;
    return matchesStartDate && matchesEndDate;
  });

  // Dynamic calculations based on state
  const totalValueApproved = approvals
    .filter((a) => a.status === "Approved")
    .reduce((acc, curr) => acc + curr.amount, 0) + 15000000; // Seeded with ₹1.5Cr baseline

  const totalInvoicesClearedValue = invoices
    .filter((v) => v.status === "Paid")
    .reduce((acc, curr) => acc + curr.grandTotal, 0) + 35000000; // Seeded with ₹3.5Cr baseline

  // Sourcing efficiency statistics calculated from actual RFQ and invoice data
  const categoriesList = ["IT Hardware", "IT Services & Cloud", "Electrical Equipment", "Raw Materials", "Logistics", "Facilities"];

  const categoryStats = categoriesList.map((cat, index) => {
    const catRfqs = rfqs.filter((r) => r.category === cat);
    const budget = catRfqs.reduce((sum, r) => sum + r.items.reduce((s, i) => s + (i.targetPrice * i.qty), 0), 0);

    const catInvoices = invoices.filter((inv) => {
      const matchingRfq = rfqs.find((r) => r.id === inv.rfqId);
      return matchingRfq?.category === cat;
    });
    const finalSpend = catInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);

    // Realistic baselines for demonstration
    const baselineBudgets = [4500000, 8500000, 3500000, 1500000, 2500000, 1200000];
    const displayBudget = budget * 83 || baselineBudgets[index] || 1500000;

    // Simulate savings if no actual spend is logged
    const displaySpend = finalSpend * 83 || (displayBudget * (0.85 + (index * 0.02) % 0.12));
    const savingsPercent = (((displayBudget - displaySpend) / displayBudget) * 100).toFixed(1);

    return {
      category: cat,
      budget: displayBudget,
      finalSpend: displaySpend,
      savings: `${savingsPercent}%`
    };
  });

  const handleExportCSV = () => {
    const columns = [
      { key: "id", header: "Clearance Ticket ID" },
      { key: "vendorName", header: "Supplier Entity" },
      { key: "poId", header: "Purchase Order ID" },
      { key: "grandTotal", header: "Amount Cleared (₹)" },
      { key: "timestamp", header: "Cleared Date" },
    ];

    const csvData = filteredInvoices.map((inv) => ({
      ...inv,
      grandTotal: inv.grandTotal.toFixed(2),
      timestamp: inv.timestamp.split("T")[0]
    }));

    const csvContent = toCSV(csvData as any, columns);
    downloadCSV(csvContent, `VendorBridge_Remittance_Audit_Ledger_${new Date().toISOString().split("T")[0]}.csv`);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  // Pagination for Invoice Ledger list
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Mockup visualizations data structures
  const spendByCategoryData = [
    { category: "IT Hardware", spend: 480000, color: "bg-blue-600", barColor: "#2563eb", ratio: 68 },
    { category: "Furniture", spend: 320000, color: "bg-green-600", barColor: "#16a34a", ratio: 45 },
    { category: "Stationery", spend: 210000, color: "bg-orange-500", barColor: "#f97316", ratio: 30 },
    { category: "Logistics", spend: 230000, color: "bg-red-500", barColor: "#dc2626", ratio: 32 }
  ];

  const topVendorsBySpendData = [
    { vendor: "TechCore Ltd", spend: 420000, pos: 6 },
    { vendor: "Infra Supplies", spend: 310000, pos: 4 },
    { vendor: "FastLog", spend: 190000, pos: 3 }
  ];

  const monthlyTrendData = [
    { month: "Dec", spend: 900000, height: "45%" },
    { month: "Jan", spend: 1200000, height: "60%" },
    { month: "Feb", spend: 1000000, height: "50%" },
    { month: "Mar", spend: 1800000, height: "80%" },
    { month: "Apr", spend: 1500000, height: "70%" },
    { month: "May", spend: 2200000, height: "100%" }
  ];

  const vendorPerformanceData = [
    { vendor: "TechFlow Systems India Ltd.", rating: 4.8, success: "98%" },
    { vendor: "Global Tech Solutions Pvt. Ltd.", rating: 4.7, success: "95%" },
    { vendor: "Starlight Industrial Pvt. Ltd.", rating: 4.5, success: "92%" }
  ];

  const procurementStatsData = [
    { metric: "RFQs Created", count: 45 },
    { metric: "Quotations Received", count: 128 },
    { metric: "Approvals Completed", count: 32 },
    { metric: "Purchase Orders Generated", count: 28 },
    { metric: "Invoices Generated", count: 26 }
  ];

  return (
    <div className="space-y-6">
      {/* Upper Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print border-b border-gray-100 pb-4">
        <div className="text-left">
          <h2 className="text-2xl font-black text-gray-900 font-display tracking-tight">
            Reports &amp; analytics
          </h2>
          <p className="text-sm text-gray-500 font-sans">
            Procurement Insights- {selectedMonth}
          </p>
        </div>
        
        {/* Dropdown selectors */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Month Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowMonthDropdown(!showMonthDropdown)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-250 hover:bg-gray-50 text-xs font-bold text-gray-800 rounded-lg shadow-xs cursor-pointer focus:outline-none"
            >
              {selectedMonth}
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>
            {showMonthDropdown && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setShowMonthDropdown(false)} />
                <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-32 z-30 text-left text-xs font-semibold text-gray-750 animate-fade-in">
                  {["May 2025", "June 2025", "Q3 2025", "FY26"].map((m) => (
                    <button
                      key={m}
                      onClick={() => {
                        setSelectedMonth(m);
                        setShowMonthDropdown(false);
                      }}
                      className="w-full px-3 py-2 hover:bg-gray-50 text-left cursor-pointer transition-colors"
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportDropdown(!showExportDropdown)}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer focus:outline-none"
            >
              <Download className="w-3.5 h-3.5 text-white" />
              Export
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            {showExportDropdown && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setShowExportDropdown(false)} />
                <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-40 z-30 text-left text-xs font-bold text-gray-700 animate-fade-in">
                  <button
                    onClick={() => {
                      handleExportCSV();
                      setShowExportDropdown(false);
                    }}
                    className="w-full px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-left cursor-pointer transition-colors"
                  >
                    📄 Export CSV
                  </button>
                  <button
                    onClick={() => {
                      alert("Generating Microsoft Excel audit logs report...");
                      setShowExportDropdown(false);
                    }}
                    className="w-full px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-left cursor-pointer transition-colors"
                  >
                    📊 Export Excel
                  </button>
                  <button
                    onClick={() => {
                      alert("Compiling Adobe PDF print-ready audit journal...");
                      setShowExportDropdown(false);
                    }}
                    className="w-full px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-left cursor-pointer transition-colors"
                  >
                    📕 Export PDF
                  </button>
                  <button
                    onClick={() => {
                      handlePrintPDF();
                      setShowExportDropdown(false);
                    }}
                    className="w-full px-4 py-2 border-t border-gray-100 hover:bg-gray-50 flex items-center gap-2 text-left cursor-pointer transition-colors"
                  >
                    🖨️ Print Report
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Grid KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Spend */}
        <div className="bg-slate-900 text-white p-5 rounded-xl flex flex-col justify-between text-left shadow-sm">
          <span className="text-blue-400 font-bold text-[10px] uppercase tracking-wider font-mono">
            Total Spend
          </span>
          <strong className="text-2xl sm:text-3xl font-black text-white font-display mt-2 block leading-none">
            12.4 L
          </strong>
          <span className="text-[10px] text-gray-400 font-mono mt-3.5 block">
            Cleared outlay for selected month
          </span>
        </div>

        {/* KPI 2: Active Vendors */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 flex flex-col justify-between text-left shadow-sm">
          <span className="text-green-700 font-bold text-[10px] uppercase tracking-wider font-mono">
            Active Vendors
          </span>
          <strong className="text-2xl sm:text-3xl font-black text-gray-900 font-display mt-2 block leading-none">
            28
          </strong>
          <span className="text-[10px] text-gray-400 mt-3.5 block">
            Onboarded compliant supply nodes
          </span>
        </div>

        {/* KPI 3: PO Fulfillment (or Approval Rate) */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 flex flex-col justify-between text-left shadow-sm">
          <span className="text-amber-700 font-bold text-[10px] uppercase tracking-wider font-mono">
            PO Fulfillment
          </span>
          <strong className="text-2xl sm:text-3xl font-black text-amber-600 font-display mt-2 block leading-none">
            94%
          </strong>
          <span className="text-[10px] text-gray-400 mt-3.5 block">
            Order lifecycle execution SLA
          </span>
        </div>

        {/* KPI 4: Overdue Invoices */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 flex flex-col justify-between text-left shadow-sm">
          <span className="text-red-700 font-bold text-[10px] uppercase tracking-wider font-mono">
            Overdue Invoices
          </span>
          <strong className="text-2xl sm:text-3xl font-black text-red-600 font-display mt-2 block leading-none">
            3
          </strong>
          <span className="text-[10px] text-gray-400 mt-3.5 block">
            Remittances pending clearing
          </span>
        </div>
      </div>

      {/* Main Mockup Visualizations Container */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Spend By Category */}
          <div className="lg:col-span-5 text-left space-y-5 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest font-mono border-b border-gray-100 pb-2">
                Spend by Category
              </h3>
              
              {/* Category Progress Bars */}
              <div className="space-y-4 pt-3">
                {spendByCategoryData.map((itm, index) => {
                  return (
                    <div key={index} className="space-y-1 text-xs text-gray-650">
                      <div className="flex justify-between items-center font-medium">
                        <span className="text-gray-900">{itm.category}</span>
                        <strong className="text-gray-900 font-mono">
                          {formatINR(itm.spend)}
                        </strong>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`${itm.color} h-full rounded-full`}
                          style={{ width: `${itm.ratio}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Donut Chart visual */}
            <div className="border-t border-gray-100 pt-5 flex items-center justify-center">
              <div className="relative w-36 h-36">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f3f4f6" strokeWidth="4.2" />
                  {/* Segment 1: IT Hardware (38.7%) */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="4.2"
                    strokeDasharray="38.7 61.3"
                    strokeDashoffset="100"
                  />
                  {/* Segment 2: Furniture (25.8%) */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="none"
                    stroke="#16a34a"
                    strokeWidth="4.2"
                    strokeDasharray="25.8 74.2"
                    strokeDashoffset="61.3"
                  />
                  {/* Segment 3: Logistics (18.5%) */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="none"
                    stroke="#dc2626"
                    strokeWidth="4.2"
                    strokeDasharray="18.5 81.5"
                    strokeDashoffset="35.5"
                  />
                  {/* Segment 4: Stationery (17%) */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="none"
                    stroke="#f97316"
                    strokeWidth="4.2"
                    strokeDasharray="17 83"
                    strokeDashoffset="17"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
                  <span className="text-[8px] text-gray-400 uppercase font-mono tracking-wider font-semibold">
                    Category Outlay
                  </span>
                  <span className="text-sm font-black text-gray-900 font-display">
                    ₹12.4 L
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Top Vendors & Monthly Trend */}
          <div className="lg:col-span-7 space-y-6 flex flex-col justify-between">
            {/* Top Vendors by Spend */}
            <div className="text-left">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest font-mono border-b border-gray-100 pb-2">
                Top Vendors by Spend
              </h3>
              
              <div className="overflow-x-auto pt-2">
                <table className="w-full text-left text-xs font-sans text-gray-650 min-w-[280px]">
                  <thead>
                    <tr className="text-gray-400 font-mono uppercase border-b border-gray-100 text-[10px]">
                      <th className="py-2 px-1">Vendor</th>
                      <th className="py-2 px-1 text-right">Spend (₹)</th>
                      <th className="py-2 px-1 text-center">POs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 font-medium">
                    {topVendorsBySpendData.map((itm, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50">
                        <td className="py-2 px-1 text-gray-900 font-semibold">{itm.vendor}</td>
                        <td className="py-2 px-1 text-right font-mono text-gray-800">{formatINR(itm.spend)}</td>
                        <td className="py-2 px-1 text-center font-mono text-gray-600">{itm.pos}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Monthly Trend bar chart */}
            <div className="text-left pt-4 border-t border-gray-100">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest font-mono border-b border-gray-100 pb-2">
                Monthly Trend
              </h3>
              
              {/* Dynamic Bar graph */}
              <div className="h-28 flex items-end justify-between gap-4 pt-4 px-2">
                {monthlyTrendData.map((item, index) => {
                  const isHighlight = item.month === "May";
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-1 group cursor-pointer">
                      <div className="w-full relative flex flex-col items-center justify-end h-20">
                        {/* Tooltip */}
                        <span className="absolute top-[-18px] bg-slate-900 text-white text-[9px] font-mono px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none select-none z-10 whitespace-nowrap">
                          {formatINR(item.spend)}
                        </span>
                        {/* Bar */}
                        <div
                          className={`w-full rounded-t transition-all duration-300 group-hover:opacity-90 ${
                            isHighlight ? "bg-slate-900 shadow-sm" : "bg-blue-150"
                          }`}
                          style={{ height: item.height }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 font-mono mt-1 leading-none">
                        {item.month}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sourcing Efficiency Indices (Existing Savings & Compliance Sector Metrics) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* KPI: category ratings matrix */}
        <div className="lg:col-span-7 bg-white p-6 border border-gray-200 rounded-xl shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider font-mono text-left">
            Sourcing efficiency metric indices (Estimated Savings vs. Budget targets)
          </h3>
          <div className="space-y-4 pt-2">
            {categoryStats.map((itm, index) => {
              const budgetRatio = (itm.finalSpend / itm.budget) * 100;
              return (
                <div key={index} className="space-y-1.5 text-left text-xs text-gray-600">
                  <div className="flex justify-between items-center">
                    <strong className="text-gray-900">{itm.category}</strong>
                    <span className="text-green-700 font-bold font-mono">Saved {itm.savings}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-green-600 h-full rounded-full" style={{ width: `${budgetRatio}%` }} />
                    </div>
                    <span className="shrink-0 text-[10px] text-gray-400 font-mono">
                      {formatINR(itm.finalSpend)} / {formatINR(itm.budget)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quality SLA Breakdown */}
        <div className="lg:col-span-5 bg-white p-6 border border-gray-200 rounded-xl shadow-sm space-y-4 flex flex-col justify-between">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider font-mono text-left">
            Supplier compliance quality metrics (By sector category)
          </h3>
          <div className="flex-1 flex flex-col justify-center space-y-4.5 pt-2">
            {[
              { category: "IT Hardware", rating: "4.8 / 5.0", status: "Outstanding" },
              { category: "IT Services & Cloud", rating: "4.7 / 5.0", status: "Outstanding" },
              { category: "Logistics", rating: "4.5 / 5.0", status: "Strategic" },
              { category: "Facilities Management", rating: "4.2 / 5.0", status: "Adequate" },
              { category: "Electrical equipment", rating: "3.9 / 5.0", status: "Compliance Watch" },
            ].map((itm, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs border-b border-gray-50 pb-2 flex-wrap gap-2 animate-in fade-in duration-200">
                <span className="text-gray-855 font-medium">{itm.category}</span>
                <div className="flex items-center gap-3 font-semibold font-mono">
                  <span className="text-gray-900">{itm.rating}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider ${
                      itm.status === "Outstanding" || itm.status === "Strategic"
                        ? "bg-green-50 text-green-700 border border-green-100"
                        : "bg-amber-50 text-amber-600 border border-amber-100"
                    }`}
                  >
                    {itm.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Vendor Performance Analytics & Procurement Statistics row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
        {/* Vendor Performance Analytics */}
        <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm space-y-4">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest font-mono border-b border-gray-100 pb-2">
            Top Vendor Performance
          </h3>
          <div className="overflow-x-auto pt-1">
            <table className="w-full text-left text-xs font-sans text-gray-700 min-w-[280px]">
              <thead>
                <tr className="text-gray-450 font-mono uppercase border-b border-gray-100 text-[10px]">
                  <th className="py-2 px-1">Vendor</th>
                  <th className="py-2 px-1 text-center">Rating</th>
                  <th className="py-2 px-1 text-right">PO Success</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-medium">
                {vendorPerformanceData.map((itm, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/40">
                    <td className="py-2.5 px-1 text-gray-900 font-semibold">{itm.vendor}</td>
                    <td className="py-2.5 px-1 text-center font-mono text-amber-600">★ {itm.rating}</td>
                    <td className="py-2.5 px-1 text-right font-mono text-green-700 font-bold">{itm.success}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Procurement Statistics Widget */}
        <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm space-y-4">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest font-mono border-b border-gray-100 pb-2">
            Procurement Statistics
          </h3>
          <div className="divide-y divide-gray-100 pt-1 text-xs">
            {procurementStatsData.map((itm, idx) => (
              <div key={idx} className="flex justify-between items-center py-2.5">
                <span className="text-gray-650 font-medium">{itm.metric}</span>
                <strong className="text-gray-900 font-mono text-sm bg-gray-50 px-2.5 py-0.5 rounded border border-gray-200">
                  {itm.count}
                </strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Savings Analysis & Average Vendor Rating Trend line chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
        {/* Savings Analysis */}
        <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm space-y-4">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest font-mono border-b border-gray-100 pb-2">
            Savings Analysis
          </h3>
          
          <div className="space-y-4 pt-2 text-xs">
            <div className="grid grid-cols-2 gap-y-2.5 text-gray-600">
              <span>Budget Allocated:</span>
              <strong className="text-right text-gray-805 font-mono text-sm">₹5.2 Cr</strong>

              <span>Actual Spend:</span>
              <strong className="text-right text-gray-805 font-mono text-sm">₹4.8 Cr</strong>
            </div>

            <div className="flex justify-between items-center border-t border-gray-100 pt-3 font-bold text-gray-800">
              <span>Savings Achieved:</span>
              <span className="text-green-700 font-mono font-black text-base">₹40 Lakhs</span>
            </div>

            <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
              <div className="bg-green-600 h-full rounded-full" style={{ width: "92.3%" }} />
            </div>
            <div className="flex justify-between text-[9px] font-mono text-gray-400 uppercase font-semibold">
              <span>Actual Outlay: 92.3%</span>
              <span>Total Sourced Savings: 7.7%</span>
            </div>
          </div>
        </div>

        {/* Average Vendor Rating Trend */}
        <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm space-y-4">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest font-mono border-b border-gray-100 pb-2">
            Average Vendor Rating Trend
          </h3>

          {/* SVG line chart */}
          <div className="h-28 relative pt-2">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 300 75">
              <line x1="0" y1="55" x2="300" y2="55" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="20" x2="300" y2="20" stroke="#f1f5f9" strokeWidth="1" />

              {/* Line path */}
              <path
                d="M 20,60 L 80,52 L 140,44 L 200,28 L 260,18"
                fill="none"
                stroke="#16a34a"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Dot markers */}
              <circle cx="20" cy="60" r="3.5" fill="#ffffff" stroke="#16a34a" strokeWidth="2.5" />
              <circle cx="80" cy="52" r="3.5" fill="#ffffff" stroke="#16a34a" strokeWidth="2.5" />
              <circle cx="140" cy="44" r="3.5" fill="#ffffff" stroke="#16a34a" strokeWidth="2.5" />
              <circle cx="200" cy="28" r="3.5" fill="#ffffff" stroke="#16a34a" strokeWidth="2.5" />
              <circle cx="260" cy="18" r="3.5" fill="#ffffff" stroke="#16a34a" strokeWidth="2.5" />

              {/* Month Labels */}
              <text x="20" y="73" textAnchor="middle" className="text-[9px] font-mono fill-gray-400 font-bold">Jan</text>
              <text x="80" y="73" textAnchor="middle" className="text-[9px] font-mono fill-gray-400 font-bold">Feb</text>
              <text x="140" y="73" textAnchor="middle" className="text-[9px] font-mono fill-gray-400 font-bold">Mar</text>
              <text x="200" y="73" textAnchor="middle" className="text-[9px] font-mono fill-gray-400 font-bold">Apr</text>
              <text x="260" y="73" textAnchor="middle" className="text-[9px] font-mono fill-gray-400 font-bold">May</text>

              {/* Score Value Tooltips */}
              <text x="20" y="50" textAnchor="middle" className="text-[9px] font-mono fill-gray-800 font-black">4.1</text>
              <text x="80" y="42" textAnchor="middle" className="text-[9px] font-mono fill-gray-800 font-black">4.2</text>
              <text x="140" y="34" textAnchor="middle" className="text-[9px] font-mono fill-gray-800 font-black">4.3</text>
              <text x="200" y="18" textAnchor="middle" className="text-[9px] font-mono fill-gray-800 font-black">4.5</text>
              <text x="260" y="8" textAnchor="middle" className="text-[9px] font-mono fill-gray-800 font-black">4.6</text>
            </svg>
          </div>
        </div>
      </div>

      {/* Date Range filters (ledger specific) */}
      <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-sm flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-655 no-print text-left">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>Ledger Date Filters:</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-[10px] uppercase font-mono text-gray-400">From</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-md px-2.5 py-1 focus:ring-1 focus:ring-green-500 focus:outline-none font-mono text-xs"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-[10px] uppercase font-mono text-gray-400">To</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-md px-2.5 py-1 focus:ring-1 focus:ring-green-500 focus:outline-none font-mono text-xs"
          />
        </div>
        {(startDate || endDate) && (
          <button
            onClick={() => {
              setStartDate("");
              setEndDate("");
            }}
            className="text-red-600 hover:underline cursor-pointer"
          >
            Clear dates
          </button>
        )}
      </div>

      {/* Sourcing reports listing details */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden pt-1">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-150 flex items-center justify-between">
          <h4 className="text-xs uppercase font-black tracking-wider text-gray-500 font-mono text-left">
            Released capital remittance audit ledger ({filteredInvoices.length} entries)
          </h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600 min-w-[500px]">
            <thead className="bg-gray-50/50">
              <tr className="border-b border-gray-150 text-gray-400 font-mono uppercase">
                <th className="py-3 px-4 font-bold">Clearance Ticket</th>
                <th className="py-3 px-4 font-bold">Vendor Entity</th>
                <th className="py-3 px-4 font-bold">Linked Purchase Order ID</th>
                <th className="py-3 px-4 text-right font-bold">Amount Cleared</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-sans">
              {paginatedInvoices.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-400">
                    No historic ledger records found mapping the date range.
                  </td>
                </tr>
              ) : (
                paginatedInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-gray-900">{inv.id}</td>
                    <td className="py-3.5 px-4">{inv.vendorName}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-green-700">{inv.poId}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-gray-900 font-mono">
                      {formatINR(inv.grandTotal)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-100 pt-4 px-1 no-print">
          <div className="text-xs text-gray-500">
            Showing Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> (<strong>{filteredInvoices.length} ledger entries</strong>)
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-655 disabled:opacity-50 transition-all cursor-pointer"
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
