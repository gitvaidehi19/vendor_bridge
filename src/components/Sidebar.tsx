import React from "react";
import { useERP } from "../state";
import { UserRole } from "../types";
import {
  LayoutDashboard,
  Building2,
  FileSpreadsheet,
  FileText,
  CheckSquare,
  ShoppingBag,
  History,
  BarChart3,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  LogOut,
  X,
  Users,
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const {
    currentUser,
    currentTab,
    setTab,
    setRole,
    vendors,
    resetAllData,
    isSidebarOpen,
    closeSidebar,
    logout,
    hasAccess,
  } = useERP();

  const internalMenu = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Users", icon: Users },
    { name: "Vendors", icon: Building2 },
    { name: "RFQs", icon: FileSpreadsheet },
    { name: "Quotes", icon: FileText },
    { name: "Approvals", icon: CheckSquare },
    { name: "Purchase Orders", icon: ShoppingBag },
    { name: "Invoices", icon: ShieldCheck },
    { name: "Activity Logs", icon: History },
    { name: "Analytics & Reports", icon: BarChart3 },
  ];

  const vendorMenu = [
    { name: "Vendor Dashboard", icon: LayoutDashboard, tab: "Dashboard" },
    { name: "Assigned RFQs", icon: FileSpreadsheet, tab: "RFQs" },
    { name: "My Quotations", icon: FileText, tab: "Quotes" },
    { name: "My Purchase Orders", icon: ShoppingBag, tab: "Purchase Orders" },
    { name: "My Invoices", icon: ShieldCheck, tab: "Invoices" },
  ];

  const activeMenu = (currentUser.role === "Vendor" ? vendorMenu : internalMenu).filter((item) =>
    hasAccess("tab" in item ? item.tab : item.name)
  );

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val.startsWith("vendor-")) {
      const vId = val.split("-")[1];
      setRole("Vendor", vId);
    } else {
      setRole(val as UserRole);
    }
  };

  const getSelectValue = () => {
    if (currentUser.role === "Vendor") {
      return `vendor-${currentUser.vendorId || "v-1"}`;
    }
    return currentUser.role;
  };

  return (
    <>
      {/* Backdrop overlay (mobile only) */}
      {isSidebarOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-[#111827] text-gray-300 flex flex-col z-50 border-r border-[#1f2937] transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center text-white font-bold text-lg select-none">
              VB
            </div>
            <div>
              <h1 className="font-display font-bold text-lg leading-tight text-white tracking-tight">
                VendorBridge
              </h1>
              <p className="text-[10px] text-gray-500 font-mono tracking-wider uppercase">
                Enterprise ERP
              </p>
            </div>
          </div>
          {/* Close button (mobile only) */}
          <button
            onClick={closeSidebar}
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role State Indicator Panel */}
        <div className="px-4 py-3 mx-4 my-3 rounded-lg bg-gray-800/40 border border-gray-700/60">
          <label className="block text-[11px] font-semibold text-green-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-green-400 animate-pulse" />
            Acting Persona
          </label>
          <select
            value={getSelectValue()}
            onChange={handleRoleChange}
            className="w-full bg-gray-900 border border-gray-700 rounded-md px-2.5 py-1.5 text-xs text-white focus:ring-1 focus:ring-green-500 focus:outline-none font-sans"
          >
            <option value="Admin">Admin (Access All)</option>
            <option value="Procurement Officer">Procurement Officer</option>
            <option value="Manager">Manager / Approver</option>
            <optgroup label="Vendor Portals">
              {vendors
                .filter((v) => v.status === "Active")
                .map((v) => (
                  <option key={v.id} value={`vendor-${v.id}`}>
                    Vendor: {v.name.length > 20 ? `${v.name.slice(0, 18)}...` : v.name}
                  </option>
                ))}
            </optgroup>
          </select>
          <div className="mt-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
            <span className="text-[10px] text-gray-400 truncate">
              Level: <strong className="text-white">{currentUser.role}</strong>
            </span>
          </div>
        </div>

        {/* Nav Menu */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto pt-2">
          {activeMenu.map((item) => {
            const itemTab = "tab" in item ? item.tab : item.name;
            const isSelected = currentTab === itemTab;
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                onClick={() => setTab(itemTab)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer text-left ${
                  isSelected
                    ? "bg-green-600/15 text-green-400 border-l-4 border-green-500"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/60"
                }`}
              >
                <Icon className={`w-4.5 h-4.5 ${isSelected ? "text-green-400" : "text-gray-400"}`} />
                <span className="truncate">{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Database Reset, Logout & Footer */}
        <div className="p-4 border-t border-gray-800 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={resetAllData}
              className="flex items-center justify-center gap-1.5 px-2 py-2 bg-gray-800 hover:bg-red-950/20 hover:text-red-400 hover:border-red-950/40 border border-gray-700 text-[10px] rounded-lg transition-colors font-medium text-gray-400 text-center"
              title="Restore standard demonstration dataset"
            >
              <RotateCcw className="w-3 h-3" />
              Reset ERP
            </button>
            <button
              onClick={logout}
              className="flex items-center justify-center gap-1.5 px-2 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:text-white text-[10px] rounded-lg transition-colors font-medium text-gray-400 text-center"
              title="Log out from session"
            >
              <LogOut className="w-3 h-3" />
              Log Out
            </button>
          </div>
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-9 h-9 rounded-full border border-gray-700 object-cover"
            />
            <div className="flex-1 overflow-hidden">
              <h4 className="text-xs font-semibold text-white truncate">
                {currentUser.name}
              </h4>
              <p className="text-[10px] text-gray-500 truncate" title={currentUser.email}>
                {currentUser.email}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
