import React, { useState } from "react";
import { useERP } from "../state";
import {
  Settings,
  Bell,
  Eye,
  Globe,
  Shield,
  Download,
  LayoutDashboard,
  CheckCircle,
  AlertCircle,
  Laptop,
  Trash2,
} from "lucide-react";

export const SettingsPage: React.FC = () => {
  const {
    currentUser,
    userSettings,
    userSessions,
    updateUserSettings,
    terminateSession,
  } = useERP();

  // Load user settings
  const settings = userSettings.find((s) => s.userId === currentUser.id) || {
    theme: "system" as const,
    density: "comfortable" as const,
    sidebarBehavior: "expanded" as const,
    language: "English",
    currency: "Indian Rupee (₹)",
    dateFormat: "DD-MM-YYYY",
    timezone: "Asia/Kolkata",
    notificationPreferences: {
      rfqNotifications: true,
      quotationNotifications: true,
      approvalNotifications: true,
      invoiceNotifications: true,
      emailNotifications: true,
      inAppNotifications: true,
    },
    securityPreferences: {
      twoFactorEnabled: false,
      sessionTimeout: 30,
    },
  };

  // State forms
  const [rfqNotif, setRfqNotif] = useState(settings.notificationPreferences.rfqNotifications);
  const [quoteNotif, setQuoteNotif] = useState(settings.notificationPreferences.quotationNotifications);
  const [approvalNotif, setApprovalNotif] = useState(settings.notificationPreferences.approvalNotifications);
  const [invoiceNotif, setInvoiceNotif] = useState(settings.notificationPreferences.invoiceNotifications);
  const [emailNotif, setEmailNotif] = useState(settings.notificationPreferences.emailNotifications);
  const [inAppNotif, setInAppNotif] = useState(settings.notificationPreferences.inAppNotifications);

  const [theme, setTheme] = useState(settings.theme);
  const [density, setDensity] = useState(settings.density);
  const [sidebarBehavior, setSidebarBehavior] = useState(settings.sidebarBehavior);

  const [language, setLanguage] = useState(settings.language);
  const [currency, setCurrency] = useState(settings.currency);
  const [dateFormat, setDateFormat] = useState(settings.dateFormat);
  const [timezone, setTimezone] = useState(settings.timezone);

  const [twoFactor, setTwoFactor] = useState(settings.securityPreferences.twoFactorEnabled);
  const [sessionTimeout, setSessionTimeout] = useState(settings.securityPreferences.sessionTimeout);

  const [defaultDashboard, setDefaultDashboard] = useState("Dashboard");
  const [defaultLandingPage, setDefaultLandingPage] = useState("Dashboard");

  // Save Handlers
  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserSettings(currentUser.id, {
      notificationPreferences: {
        rfqNotifications: rfqNotif,
        quotationNotifications: quoteNotif,
        approvalNotifications: approvalNotif,
        invoiceNotifications: invoiceNotif,
        emailNotifications: emailNotif,
        inAppNotifications: inAppNotif,
      },
    });
    alert("Notification Preferences Saved Successfully");
  };

  const handleSaveAppearance = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserSettings(currentUser.id, {
      theme,
      density,
      sidebarBehavior,
    });
    alert("Appearance Preferences Saved Successfully");
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserSettings(currentUser.id, {
      language,
      currency,
      dateFormat,
      timezone,
    });
    alert("Account Localizations Saved Successfully");
  };

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserSettings(currentUser.id, {
      securityPreferences: {
        twoFactorEnabled: twoFactor,
        sessionTimeout,
      },
    });
    alert("Security Rules Saved Successfully");
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    alert("System Landing Preferences Saved Successfully");
  };

  // Sessions for this user
  const userActiveSessions = userSessions.filter((sess) => sess.userId === currentUser.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 font-display flex items-center gap-2">
          <Settings className="w-6 h-6 text-green-600 animate-pulse" />
          Settings
        </h2>
        <p className="text-sm text-gray-500 mt-1 font-sans">
          Configure your user account notifications, theme settings, regional formats, and operational timeouts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Notification Preferences */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-gray-900 font-display uppercase tracking-wider border-b border-gray-150 pb-2 flex items-center gap-2">
            <Bell className="w-4.5 h-4.5 text-green-600" />
            1. Notification Preferences
          </h3>
          <form onSubmit={handleSaveNotifications} className="space-y-4 text-xs font-medium text-gray-650">
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rfqNotif}
                  onChange={(e) => setRfqNotif(e.target.checked)}
                  className="rounded text-green-600 border-gray-300 focus:ring-green-500 w-4 h-4 cursor-pointer"
                />
                <span>RFQ Events Alert</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={quoteNotif}
                  onChange={(e) => setQuoteNotif(e.target.checked)}
                  className="rounded text-green-600 border-gray-300 focus:ring-green-500 w-4 h-4 cursor-pointer"
                />
                <span>Quotation Bids Alert</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={approvalNotif}
                  onChange={(e) => setApprovalNotif(e.target.checked)}
                  className="rounded text-green-600 border-gray-300 focus:ring-green-500 w-4 h-4 cursor-pointer"
                />
                <span>Approvals Pipeline Alert</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={invoiceNotif}
                  onChange={(e) => setInvoiceNotif(e.target.checked)}
                  className="rounded text-green-600 border-gray-300 focus:ring-green-500 w-4 h-4 cursor-pointer"
                />
                <span>Invoicing Receipts Alert</span>
              </label>
            </div>
            <div className="border-t border-gray-100 pt-3 flex items-center justify-between gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailNotif}
                  onChange={(e) => setEmailNotif(e.target.checked)}
                  className="rounded text-green-600 border-gray-300 focus:ring-green-500 w-3.5 h-3.5 cursor-pointer"
                />
                <span>Email Notifications Delivery</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inAppNotif}
                  onChange={(e) => setInAppNotif(e.target.checked)}
                  className="rounded text-green-600 border-gray-300 focus:ring-green-500 w-3.5 h-3.5 cursor-pointer"
                />
                <span>In-App Banner Notifications</span>
              </label>
            </div>
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer shadow-sm shadow-green-100"
            >
              Save Preferences
            </button>
          </form>
        </div>

        {/* Section 2: Appearance Settings */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-gray-900 font-display uppercase tracking-wider border-b border-gray-150 pb-2 flex items-center gap-2">
            <div className="p-1 bg-green-50 rounded text-green-600"><Eye className="w-4 h-4" /></div>
            2. Appearance Settings
          </h3>
          <form onSubmit={handleSaveAppearance} className="space-y-4 text-xs font-semibold text-gray-750">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-gray-400 font-medium uppercase tracking-wider text-[9px] mb-1 font-mono">Theme Mode</label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as any)}
                  className="w-full border border-gray-200 rounded-lg p-2 bg-white cursor-pointer hover:bg-gray-50 focus:ring-1 focus:ring-green-500"
                >
                  <option value="light">Light Mode</option>
                  <option value="dark">Dark Mode</option>
                  <option value="system">System Default</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 font-medium uppercase tracking-wider text-[9px] mb-1 font-mono">ERP Density</label>
                <select
                  value={density}
                  onChange={(e) => setDensity(e.target.value as any)}
                  className="w-full border border-gray-200 rounded-lg p-2 bg-white cursor-pointer hover:bg-gray-50 focus:ring-1 focus:ring-green-500"
                >
                  <option value="compact">Compact</option>
                  <option value="comfortable">Comfortable</option>
                  <option value="spacious">Spacious</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 font-medium uppercase tracking-wider text-[9px] mb-1 font-mono">Sidebar Behavior</label>
                <select
                  value={sidebarBehavior}
                  onChange={(e) => setSidebarBehavior(e.target.value as any)}
                  className="w-full border border-gray-200 rounded-lg p-2 bg-white cursor-pointer hover:bg-gray-50 focus:ring-1 focus:ring-green-500"
                >
                  <option value="expanded">Expanded</option>
                  <option value="collapsed">Collapsed</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer shadow-sm"
            >
              Save Appearance
            </button>
          </form>
        </div>

        {/* Section 3: Account & Localizations Settings */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-gray-900 font-display uppercase tracking-wider border-b border-gray-150 pb-2 flex items-center gap-2">
            <Globe className="w-4.5 h-4.5 text-green-600" />
            3. Account &amp; Localizations
          </h3>
          <form onSubmit={handleSaveAccount} className="space-y-4 text-xs font-semibold text-gray-750">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 font-medium uppercase tracking-wider text-[9px] mb-1 font-mono">System Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-2 bg-white cursor-pointer hover:bg-gray-50 focus:ring-1 focus:ring-green-500"
                >
                  <option value="English">English</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 font-medium uppercase tracking-wider text-[9px] mb-1 font-mono">Standard Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-2 bg-white cursor-pointer hover:bg-gray-50 focus:ring-1 focus:ring-green-500"
                >
                  <option value="Indian Rupee (₹)">Indian Rupee (₹)</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 font-medium uppercase tracking-wider text-[9px] mb-1 font-mono">Date Display Format</label>
                <select
                  value={dateFormat}
                  onChange={(e) => setDateFormat(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-2 bg-white cursor-pointer hover:bg-gray-50 focus:ring-1 focus:ring-green-500"
                >
                  <option value="DD-MM-YYYY">DD-MM-YYYY</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 font-medium uppercase tracking-wider text-[9px] mb-1 font-mono">System Timezone</label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-2 bg-white cursor-pointer hover:bg-gray-50 focus:ring-1 focus:ring-green-500"
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer shadow-sm"
            >
              Save Localizations
            </button>
          </form>
        </div>

        {/* Section 4: Security Settings & Timeout */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-gray-900 font-display uppercase tracking-wider border-b border-gray-150 pb-2 flex items-center gap-2">
            <Shield className="w-4.5 h-4.5 text-green-600" />
            4. Security Settings
          </h3>
          <form onSubmit={handleSaveSecurity} className="space-y-4 text-xs font-semibold text-gray-750">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 font-medium uppercase tracking-wider text-[9px] mb-1 font-mono">Two-Factor Authentication (2FA)</label>
                <div className="flex gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setTwoFactor(true)}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                      twoFactor
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    Enable
                  </button>
                  <button
                    type="button"
                    onClick={() => setTwoFactor(false)}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                      !twoFactor
                        ? "bg-gray-600 text-white border-gray-600"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    Disable
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-gray-400 font-medium uppercase tracking-wider text-[9px] mb-1 font-mono">Session Timeout Guard</label>
                <select
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-lg p-2 bg-white mt-1 cursor-pointer hover:bg-gray-50 focus:ring-1 focus:ring-green-500"
                >
                  <option value={15}>15 Minutes</option>
                  <option value={30}>30 Minutes</option>
                  <option value={60}>60 Minutes</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer shadow-sm"
            >
              Save Security Rules
            </button>
          </form>

          {/* Table active sessions in settings */}
          <div className="space-y-2 pt-2 text-[11px]">
            <span className="font-bold text-gray-500 block">Manage Active Connected Devices</span>
            <div className="border border-gray-150 rounded-lg overflow-hidden divide-y divide-gray-100 bg-gray-50/20">
              {userActiveSessions.map((sess) => (
                <div key={sess.id} className="p-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Laptop className="w-4 h-4 text-gray-400 shrink-0" />
                    <div>
                      <span className="font-semibold text-gray-800">
                        {sess.device} · {sess.browser}
                      </span>
                      {sess.isCurrent && (
                        <span className="ml-1.5 bg-green-100 text-green-800 text-[8px] font-bold px-1 py-0.5 rounded font-mono uppercase">
                          Active
                        </span>
                      )}
                    </div>
                  </div>
                  {!sess.isCurrent && (
                    <button
                      onClick={() => {
                        terminateSession(currentUser.id, sess.id);
                        alert("Device Session Terminated Successfully");
                      }}
                      className="text-red-500 hover:text-red-655 font-bold transition-all p-1 cursor-pointer"
                      title="Terminate Device Link"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 5: Data Export Settings */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-gray-900 font-display uppercase tracking-wider border-b border-gray-150 pb-2 flex items-center gap-2">
            <Download className="w-4.5 h-4.5 text-green-600" />
            5. Data Export Settings
          </h3>
          <div className="space-y-4 text-xs font-semibold text-gray-750">
            <p className="text-gray-400 font-sans leading-relaxed text-xs">
              Configure data synchronization schedules or export procurement entities (Reports, Invoices, Purchase Orders) directly in standard formats.
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => alert("Data Export: Preparing CSV dump...")}
                className="py-2 px-3 border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center justify-center gap-1 cursor-pointer font-bold"
              >
                Export CSV
              </button>
              <button
                onClick={() => alert("Data Export: Preparing Excel workbook...")}
                className="py-2 px-3 border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center justify-center gap-1 cursor-pointer font-bold"
              >
                Export Excel
              </button>
              <button
                onClick={() => alert("Data Export: Preparing PDF reports...")}
                className="py-2 px-3 border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center justify-center gap-1 cursor-pointer font-bold"
              >
                Export PDF
              </button>
            </div>
          </div>
        </div>

        {/* Section 6: System Preferences & Landing Dashboard */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-gray-900 font-display uppercase tracking-wider border-b border-gray-150 pb-2 flex items-center gap-2">
            <LayoutDashboard className="w-4.5 h-4.5 text-green-600" />
            6. System Preferences &amp; Landing
          </h3>
          <form onSubmit={handleSavePreferences} className="space-y-4 text-xs font-semibold text-gray-750">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 font-medium uppercase tracking-wider text-[9px] mb-1 font-mono">Default Workspace</label>
                <select
                  value={defaultDashboard}
                  onChange={(e) => setDefaultDashboard(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-2 bg-white cursor-pointer hover:bg-gray-50 focus:ring-1 focus:ring-green-500"
                >
                  <option value="Dashboard">Dashboard</option>
                  <option value="RFQs">RFQs</option>
                  <option value="Reports">Reports</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 font-medium uppercase tracking-wider text-[9px] mb-1 font-mono">Default Landing View</label>
                <select
                  value={defaultLandingPage}
                  onChange={(e) => setDefaultLandingPage(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-2 bg-white cursor-pointer hover:bg-gray-50 focus:ring-1 focus:ring-green-500"
                >
                  <option value="Dashboard">Dashboard</option>
                  <option value="RFQs">RFQs</option>
                  <option value="Invoices">Invoices</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer shadow-sm"
            >
              Save Preferences
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
