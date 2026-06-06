import React, { useState, useRef, useEffect } from "react";
import { useERP } from "../state";
import { Search, Bell, HelpCircle, Check, X, ShieldAlert, Award, Menu, ChevronRight, LogOut, User as UserIcon, Settings } from "lucide-react";

export const Header: React.FC = () => {
  const {
    currentUser,
    searchQuery,
    setSearchQuery,
    notifications,
    markNotificationsAsRead,
    clearNotifications,
    setTab,
    toggleSidebar,
    logout,
    currentTab,
  } = useERP();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  
  const popoverRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Filter notifications relevant to current role
  const relevantNotifications = notifications.filter((notif) => {
    if (currentUser.role === "Vendor") {
      return notif.recipientRole === currentUser.vendorId;
    }
    return notif.recipientRole === currentUser.role;
  });

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleNotifications = () => {
    if (!showNotifications) {
      markNotificationsAsRead();
    }
    setShowNotifications(!showNotifications);
  };

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-white border-b border-gray-200 z-30 flex items-center justify-between px-4 sm:px-8">
      {/* Left items: Mobile toggle + Breadcrumbs */}
      <div className="flex items-center gap-3">
        {/* Hamburger trigger (mobile only) */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-md hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumbs (desktop only) */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-gray-500 font-medium">
          <span
            className="hover:text-green-600 cursor-pointer transition-colors"
            onClick={() => setTab("Dashboard")}
          >
            VendorBridge
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-900 font-semibold">{currentTab}</span>
        </div>
      </div>

      {/* Search Bar - Proxied to global filter */}
      <div className="flex-1 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-2 sm:mx-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 bg-transparent" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="w-full bg-gray-50 hover:bg-gray-100/85 focus:bg-white border-none rounded-lg pl-10 pr-4 py-2 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all font-sans"
          />
        </div>
      </div>

      {/* Auxiliary Global Controls */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Support Grounding Tag (desktop only) */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 bg-green-50 border border-green-100 rounded-full">
          <Award className="w-4 h-4 text-green-600" />
          <span className="text-xs font-semibold text-green-700 font-sans">
            Enterprise Grade
          </span>
        </div>

        {/* Notifications Trigger */}
        <div className="relative" ref={popoverRef}>
          <button
            onClick={handleToggleNotifications}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors relative cursor-pointer"
            title="System Alert Dispatch"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            {relevantNotifications.some((n) => !n.read) && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full flex items-center justify-center animate-bounce" />
            )}
          </button>

          {/* Popover Module */}
          {showNotifications && (
            <div className="absolute right-0 mt-2.5 w-72 sm:w-96 bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden z-50">
              <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 font-mono">
                  Alerts ({relevantNotifications.length})
                </span>
                {relevantNotifications.length > 0 && (
                  <button
                    onClick={clearNotifications}
                    className="text-[11px] text-red-500 hover:underline font-medium cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                {relevantNotifications.length === 0 ? (
                  <div className="px-5 py-8 text-center text-gray-400">
                    <ShieldAlert className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs">No pending notifications in queue.</p>
                  </div>
                ) : (
                  relevantNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-4 hover:bg-gray-50/80 transition-colors flex items-start gap-3 ${
                        !notif.read ? "bg-green-50/10" : ""
                      }`}
                    >
                      <div className="p-1 rounded-full bg-green-100/50 mt-0.5">
                        <Check className="w-3.5 h-3.5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-bold text-gray-800 leading-tight">
                          {notif.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-0.5 leading-normal">
                          {notif.description}
                        </p>
                        <span className="text-[9px] text-gray-400 font-mono mt-1 block">
                          {new Date(notif.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="bg-gray-50 p-2.5 text-center border-t border-gray-100">
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    setTab("Activity Logs");
                  }}
                  className="text-xs text-green-600 hover:text-green-700 font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  View full chronological logs
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Documentation Trigger */}
        <button
          onClick={() => {
            alert(
              "VendorBridge ERP Help Desk:\n\nUse the 'Acting Persona' dropdown in the sidebar to simulate different user accounts (Admin, Procurement Officer, Manager, Vendor) and trace the automatic status handoffs."
            );
          }}
          className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors cursor-pointer"
          title="Workflow Documentation"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        {/* Vertical Divider */}
        <div className="w-px h-8 bg-gray-200" />

        {/* Profile Dropdown Frame */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex items-center gap-3 focus:outline-none hover:opacity-90 transition-opacity cursor-pointer text-left"
          >
            <div className="text-right hidden sm:block">
              <span className="text-xs font-bold text-gray-800 block leading-tight">
                {currentUser.name}
              </span>
              <span className="text-[10px] uppercase font-bold text-green-600 tracking-wider font-mono">
                {currentUser.role}
              </span>
            </div>
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-9 h-9 rounded-full border border-gray-200 shadow-sm object-cover"
            />
          </button>

          {/* Profile Dropdown Menu */}
          {showProfileDropdown && (
            <div className="absolute right-0 mt-2.5 w-48 bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden z-50 py-1">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-800 truncate">{currentUser.name}</p>
                <p className="text-[10px] text-gray-500 truncate">{currentUser.email}</p>
              </div>
              <button
                onClick={() => {
                  setShowProfileDropdown(false);
                  setTab("Profile");
                }}
                className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
              >
                <UserIcon className="w-4 h-4 text-gray-400" />
                My Profile
              </button>
              <button
                onClick={() => {
                  setShowProfileDropdown(false);
                  setTab("Settings");
                }}
                className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
              >
                <Settings className="w-4 h-4 text-gray-400" />
                Settings
              </button>
              <div className="border-t border-gray-100 my-1" />
              <button
                onClick={() => {
                  setShowProfileDropdown(false);
                  logout();
                }}
                className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
