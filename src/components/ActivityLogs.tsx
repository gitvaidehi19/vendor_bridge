import React, { useState, useEffect } from "react";
import { useERP } from "../state";
import { ActivityLog } from "../types";
import { initialUsers } from "../data";
import {
  History,
  Database,
  Calendar,
  Activity,
  FileDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
  X,
  User,
  ShieldCheck,
} from "lucide-react";
import { toCSV, downloadCSV, formatDateTime } from "../utils";

export const ActivityLogs: React.FC = () => {
  const { activityLogs, searchQuery, setTab } = useERP();
  const [selectedModule, setSelectedModule] = useState<string>("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [localSearch, setLocalSearch] = useState("");
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Reset pagination when filters or searches change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedModule, searchQuery, localSearch, startDate, endDate]);

  // Derive unique modules
  const modules = ["All", ...Array.from(new Set(activityLogs.map((log) => log.module)))];

  // Helper to determine log severity dynamically based on keywords
  const getSeverity = (log: ActivityLog): "SUCCESS" | "INFO" | "WARNING" | "ERROR" => {
    const actionLower = log.action.toLowerCase();
    const detailsLower = log.details.toLowerCase();

    if (
      actionLower.includes("fail") ||
      detailsLower.includes("fail") ||
      actionLower.includes("error") ||
      detailsLower.includes("error")
    ) {
      return "ERROR";
    }

    if (
      actionLower.includes("reject") ||
      detailsLower.includes("reject") ||
      actionLower.includes("warn") ||
      detailsLower.includes("warn") ||
      actionLower.includes("deny") ||
      detailsLower.includes("deny")
    ) {
      return "WARNING";
    }

    if (
      actionLower.includes("create") ||
      actionLower.includes("submit") ||
      actionLower.includes("grant") ||
      actionLower.includes("approve") ||
      actionLower.includes("select") ||
      actionLower.includes("generate") ||
      actionLower.includes("pay") ||
      actionLower.includes("email") ||
      actionLower.includes("sent") ||
      actionLower.includes("reset") ||
      actionLower.includes("deliver") ||
      detailsLower.includes("success")
    ) {
      return "SUCCESS";
    }

    return "INFO";
  };

  // Helper to get user avatar
  const getUserAvatar = (userName: string) => {
    const shortName = userName.replace(" (Vendor)", "").trim();
    const userObj = initialUsers.find((u) => u.name === shortName);
    if (userObj?.avatar) return userObj.avatar;

    if (userName.includes("Vendor") || userName.includes("Patel") || userName.includes("Reddy") || userName.includes("Nair")) {
      return "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=60";
    }
    if (userName.includes("Priya") || userName.includes("Sharma")) {
      return "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=60";
    }
    if (userName.includes("Rajesh") || userName.includes("Iyer")) {
      return "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=60";
    }
    if (userName.includes("System") || userName.includes("Automator")) {
      return "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=60";
    }
    return "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=60";
  };

  // Helper to get user role
  const getUserRole = (userName: string) => {
    const shortName = userName.replace(" (Vendor)", "").trim();
    const userObj = initialUsers.find((u) => u.name === shortName);
    if (userObj?.role) return userObj.role;

    if (userName.includes("Vendor")) return "Vendor Partner";
    if (userName.includes("Priya") || userName.includes("Sharma")) return "Procurement Officer";
    if (userName.includes("Rajesh") || userName.includes("Iyer")) return "Manager";
    if (userName.includes("System") || userName.includes("Automator")) return "System Process";
    return "Operator";
  };

  // Parse reference IDs
  const extractReference = (details: string) => {
    const match = details.match(/(RFQ-\d{4}-\d{4}|QT-\d{4}-\d{4}|PO-\d{4}-\d{4}|INV-\d{4}-\d{4})/);
    return match ? match[0] : "None";
  };

  // Render clickable links for entity references
  const renderDetailsWithLinks = (text: string) => {
    const regex = /(RFQ-\d{4}-\d{4}|QT-\d{4}-\d{4}|PO-\d{4}-\d{4}|INV-\d{4}-\d{4})/g;
    const parts = text.split(regex);
    return parts.map((part, i) => {
      if (part.match(/^(RFQ-\d{4}-\d{4})$/)) {
        return (
          <button
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              setTab("RFQs");
            }}
            className="text-green-600 hover:text-green-700 hover:underline font-mono font-bold cursor-pointer inline"
          >
            {part}
          </button>
        );
      } else if (part.match(/^(QT-\d{4}-\d{4})$/)) {
        return (
          <button
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              setTab("Quotes");
            }}
            className="text-green-600 hover:text-green-700 hover:underline font-mono font-bold cursor-pointer inline"
          >
            {part}
          </button>
        );
      } else if (part.match(/^(PO-\d{4}-\d{4})$/)) {
        return (
          <button
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              setTab("Purchase Orders");
            }}
            className="text-green-600 hover:text-green-700 hover:underline font-mono font-bold cursor-pointer inline"
          >
            {part}
          </button>
        );
      } else if (part.match(/^(INV-\d{4}-\d{4})$/)) {
        return (
          <button
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              setTab("Invoices");
            }}
            className="text-green-600 hover:text-green-700 hover:underline font-mono font-bold cursor-pointer inline"
          >
            {part}
          </button>
        );
      }
      return part;
    });
  };

  // Filter based on search query, selected module, and date range
  const filteredLogs = activityLogs.filter((log) => {
    const query = localSearch || searchQuery;
    const matchesSearch =
      !query ||
      log.user.toLowerCase().includes(query.toLowerCase()) ||
      log.action.toLowerCase().includes(query.toLowerCase()) ||
      log.details.toLowerCase().includes(query.toLowerCase()) ||
      log.module.toLowerCase().includes(query.toLowerCase());

    const matchesModule = selectedModule === "All" || log.module === selectedModule;

    const logDateStr = log.timestamp.split("T")[0]; // YYYY-MM-DD
    const matchesStartDate = !startDate || logDateStr >= startDate;
    const matchesEndDate = !endDate || logDateStr <= endDate;

    return matchesSearch && matchesModule && matchesStartDate && matchesEndDate;
  });

  const handleExportCSV = () => {
    const columns = [
      { key: "id", header: "Log ID" },
      { key: "timestamp", header: "Timestamp" },
      { key: "user", header: "Acting User/Portal" },
      { key: "module", header: "Module" },
      { key: "action", header: "Action" },
      { key: "details", header: "Activity Details" },
      { key: "ipAddress", header: "IP Address" },
    ];
    const csvContent = toCSV(filteredLogs as any, columns);
    downloadCSV(csvContent, `VendorBridge_Audit_Logs_${new Date().toISOString().split("T")[0]}.csv`);
  };

  // Pagination calculation
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Statistics calculations
  const totalLogsCount = activityLogs.length;
  const rfqLogsCount = activityLogs.filter((log) => log.module === "RFQ Engine" || log.module === "RFQ").length;
  const approvalLogsCount = activityLogs.filter((log) => log.module === "Approvals" || log.module === "Approval").length;
  const invoiceLogsCount = activityLogs.filter((log) => log.module === "Invoicing" || log.module === "Invoice").length;

  return (
    <div className="space-y-6">
      {/* Upper action header banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 font-display tracking-tight">
            Activity &amp; Logs
          </h2>
          <p className="text-sm text-gray-500 font-sans">
            Procurement audit trail
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Audit Integrity Banner */}
          <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-1.5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse shrink-0" />
            <div className="text-left select-none">
              <strong className="text-[10px] uppercase font-bold text-green-800 tracking-wider block font-mono">
                Audit Integrity Enabled
              </strong>
              <span className="text-[9px] text-green-655 font-semibold block leading-none mt-0.5">
                Logs are immutable and cannot be edited or deleted.
              </span>
            </div>
          </div>

          {/* Export options dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportDropdown(!showExportDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg text-sm font-bold transition-all shadow-xs cursor-pointer"
            >
              <FileDown className="w-4 h-4" />
              Export Options
            </button>
            {showExportDropdown && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setShowExportDropdown(false)} />
                <div className="absolute right-0 mt-1.5 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-40 z-30 text-left text-xs font-bold text-gray-700 animate-fade-in">
                  <button
                    onClick={() => {
                      handleExportCSV();
                      setShowExportDropdown(false);
                    }}
                    className="w-full px-4 py-2.5 hover:bg-gray-50 flex items-center gap-2 text-left cursor-pointer transition-colors"
                  >
                    📄 Export CSV
                  </button>
                  <button
                    onClick={() => {
                      alert("Generating Microsoft Excel workbook (XLSX) audit logs report...");
                      setShowExportDropdown(false);
                    }}
                    className="w-full px-4 py-2.5 hover:bg-gray-50 flex items-center gap-2 text-left cursor-pointer transition-colors"
                  >
                    📊 Export Excel
                  </button>
                  <button
                    onClick={() => {
                      alert("Compiling Adobe PDF print-ready audit journal...");
                      setShowExportDropdown(false);
                    }}
                    className="w-full px-4 py-2.5 hover:bg-gray-50 flex items-center gap-2 text-left cursor-pointer transition-colors"
                  >
                    📕 Export PDF
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Search Logs, Module Filters, Date Range */}
      <div className="bg-white p-5 border border-gray-200 rounded-xl shadow-sm space-y-4">
        {/* Global Local Search */}
        <div className="relative text-left">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-gray-400" />
          </span>
          <input
            type="text"
            placeholder="Search Activity Logs (e.g. RFQ-2026-0001, Invoice, Priya Sharma, Vendor portal...)"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-xs font-semibold text-gray-800 placeholder:text-gray-400 focus:bg-white focus:ring-1 focus:ring-green-500 focus:outline-none transition-all"
          />
        </div>

        {/* Module buttons row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-t border-gray-100 pt-3 text-left">
          <div className="flex flex-wrap items-center gap-2">
            {modules.map((m) => (
              <button
                key={m}
                onClick={() => setSelectedModule(m)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  selectedModule === m
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-gray-50 hover:bg-gray-100 text-gray-500"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <div className="text-xs text-gray-400 font-mono flex items-center gap-1.5 shrink-0 select-none">
            <Database className="w-4 h-4 text-gray-300" />
            <span>Matched: <strong>{filteredLogs.length}</strong> / {totalLogsCount} logs</span>
          </div>
        </div>

        {/* Date Inputs row */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-600 border-t border-gray-100 pt-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-450" />
            <span>Filter by Range:</span>
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
              className="text-red-600 hover:underline cursor-pointer font-bold"
            >
              Clear dates
            </button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
        <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-gray-400 font-mono uppercase tracking-wider block">
            Today's Activities
          </span>
          <strong className="text-xl font-black text-slate-800 block mt-1 font-mono">
            {totalLogsCount}
          </strong>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-gray-400 font-mono uppercase tracking-wider block">
            RFQ Events
          </span>
          <strong className="text-xl font-black text-green-700 block mt-1 font-mono">
            {rfqLogsCount}
          </strong>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-gray-400 font-mono uppercase tracking-wider block">
            Approval Events
          </span>
          <strong className="text-xl font-black text-amber-700 block mt-1 font-mono">
            {approvalLogsCount}
          </strong>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-xs">
          <span className="text-[10px] font-bold text-gray-400 font-mono uppercase tracking-wider block">
            Invoice Events
          </span>
          <strong className="text-xl font-black text-blue-700 block mt-1 font-mono">
            {invoiceLogsCount}
          </strong>
        </div>
      </div>

      {/* Main logs timeline wrapper */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden p-6 relative">
        {paginatedLogs.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-xs">
            <History className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            No chronological activities found matching the query criteria.
          </div>
        ) : (
          <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-3.5 before:w-0.5 before:bg-gray-100 pl-1">
            {paginatedLogs.map((log) => {
              const severity = getSeverity(log);
              const isLast = false;
              return (
                <div
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className="flex items-start gap-4 relative animate-in fade-in duration-200 cursor-pointer group"
                >
                  {/* Bullet center Node */}
                  <div className={`w-7.5 h-7.5 rounded-full bg-white border flex items-center justify-center shrink-0 z-10 shadow-xs transition-transform group-hover:scale-110 ${
                    severity === "SUCCESS"
                      ? "border-green-200 text-green-600"
                      : severity === "WARNING"
                      ? "border-amber-200 text-amber-600"
                      : severity === "ERROR"
                      ? "border-red-200 text-red-600"
                      : "border-blue-200 text-blue-600"
                  }`}>
                    {severity === "SUCCESS" && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {severity === "WARNING" && <AlertTriangle className="w-3.5 h-3.5" />}
                    {severity === "ERROR" && <AlertCircle className="w-3.5 h-3.5" />}
                    {severity === "INFO" && <Info className="w-3.5 h-3.5" />}
                  </div>

                  {/* Body block */}
                  <div className="flex-1 bg-gray-50/50 hover:bg-slate-50 p-4 rounded-xl border border-gray-100 text-left text-xs space-y-2 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Module Indicator */}
                        <span className="font-mono font-black text-[10px] text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded uppercase">
                          {log.module}
                        </span>

                        {/* Severity Badge */}
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-bold font-mono border ${
                          severity === "SUCCESS"
                            ? "bg-green-50 text-green-700 border-green-250/50"
                            : severity === "WARNING"
                            ? "bg-amber-50 text-amber-700 border-amber-250/50"
                            : severity === "ERROR"
                            ? "bg-red-50 text-red-700 border-red-250/50"
                            : "bg-blue-50 text-blue-700 border-blue-250/50"
                        }`}>
                          {severity === "SUCCESS" ? "🟢" : severity === "WARNING" ? "🟡" : severity === "ERROR" ? "🔴" : "🔵"} {severity}
                        </span>

                        <strong className="text-gray-900 font-bold group-hover:text-green-700 transition-colors">
                          {log.action}
                        </strong>

                        <span className="text-gray-300 font-mono">•</span>

                        {/* User with avatar */}
                        <div className="inline-flex items-center gap-1.5 font-semibold text-gray-500 font-sans">
                          <img
                            src={getUserAvatar(log.user)}
                            alt={log.user}
                            className="w-4 h-4 rounded-full object-cover border border-gray-200"
                          />
                          <span>{log.user}</span>
                        </div>

                        {log.ipAddress && (
                          <>
                            <span className="text-gray-300 font-mono">•</span>
                            <span className="text-gray-400 font-mono text-[10px]">IP: {log.ipAddress}</span>
                          </>
                        )}
                      </div>

                      <div className="text-[10px] text-gray-400 font-mono flex items-center gap-1 select-none shrink-0">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span>{formatDateTime(log.timestamp)}</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed font-sans pr-2">
                      {renderDetailsWithLinks(log.details)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-100 pt-4 px-1">
          <div className="text-xs text-gray-500">
            Showing Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> (<strong>{filteredLogs.length} total logs</strong>)
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

      {/* Activity Details Drawer */}
      {selectedLog && (
        <>
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 transition-all duration-300"
            onClick={() => setSelectedLog(null)}
          />
          {/* Drawer content */}
          <div className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white border-l border-gray-200 shadow-2xl z-50 flex flex-col animate-slide-in">
            {/* Drawer Header */}
            <div className="px-6 py-5 border-b border-gray-150 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-green-600" />
                <h3 className="text-base font-black text-gray-900 font-display">Activity Details</h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 p-6 space-y-6 overflow-y-auto text-left">
              {/* Severity & Action */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {(() => {
                    const sev = getSeverity(selectedLog);
                    return (
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${
                        sev === "SUCCESS"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : sev === "WARNING"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : sev === "ERROR"
                          ? "bg-red-50 text-red-700 border-red-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      }`}>
                        {sev === "SUCCESS" ? "🟢" : sev === "WARNING" ? "🟡" : sev === "ERROR" ? "🔴" : "🔵"} {sev}
                      </span>
                    );
                  })()}
                  <span className="text-xs text-gray-450 font-mono">Log ID: {selectedLog.id}</span>
                </div>
                <h4 className="text-lg font-black text-gray-900 leading-tight mt-1">
                  {selectedLog.action}
                </h4>
              </div>

              {/* Details table / grid */}
              <div className="bg-slate-50 p-4 border border-gray-200 rounded-xl space-y-3.5 text-xs text-gray-700">
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-455 font-medium font-sans">Module:</span>
                  <strong className="col-span-2 text-gray-900">{selectedLog.module}</strong>

                  <span className="text-gray-455 font-medium font-sans">Action:</span>
                  <strong className="col-span-2 text-gray-900">{selectedLog.action}</strong>

                  <span className="text-gray-455 font-medium font-sans">User:</span>
                  <div className="col-span-2 flex items-center gap-2">
                    <img
                      src={getUserAvatar(selectedLog.user)}
                      alt={selectedLog.user}
                      className="w-5 h-5 rounded-full object-cover border border-gray-200"
                    />
                    <strong className="text-gray-900">{selectedLog.user}</strong>
                  </div>

                  <span className="text-gray-455 font-medium font-sans">Role:</span>
                  <strong className="col-span-2 text-gray-800">{getUserRole(selectedLog.user)}</strong>

                  <span className="text-gray-455 font-medium font-sans">IP Address:</span>
                  <strong className="col-span-2 text-gray-800 font-mono">{selectedLog.ipAddress || "10.0.0.1"}</strong>

                  <span className="text-gray-455 font-medium font-sans">Timestamp:</span>
                  <strong className="col-span-2 text-gray-800 font-mono">{formatDateTime(selectedLog.timestamp)}</strong>

                  <span className="text-gray-455 font-medium font-sans">Reference:</span>
                  <strong className="col-span-2 text-gray-900 font-mono">
                    {(() => {
                      const ref = extractReference(selectedLog.details);
                      if (ref !== "None") {
                        return (
                          <button
                            onClick={() => {
                              setSelectedLog(null);
                              if (ref.startsWith("RFQ")) setTab("RFQs");
                              else if (ref.startsWith("QT")) setTab("Quotes");
                              else if (ref.startsWith("PO")) setTab("Purchase Orders");
                              else if (ref.startsWith("INV")) setTab("Invoices");
                            }}
                            className="text-green-600 hover:text-green-700 hover:underline font-bold font-mono cursor-pointer"
                          >
                            {ref}
                          </button>
                        );
                      }
                      return "None";
                    })()}
                  </strong>
                </div>
              </div>

              {/* Activity Description details */}
              <div className="space-y-1.5">
                <span className="block text-[10px] font-bold text-gray-400 font-mono uppercase tracking-wider">
                  Telemetry Details:
                </span>
                <div className="bg-slate-50 p-4 border border-gray-200 rounded-xl font-mono text-[11px] leading-relaxed text-gray-700 select-all whitespace-pre-wrap break-all">
                  {renderDetailsWithLinks(selectedLog.details)}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

