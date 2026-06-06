import React, { useState, useEffect } from "react";
import { ERPProvider, useERP } from "./state";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { Dashboard } from "./components/Dashboard";
import { Vendors } from "./components/Vendors";
import { RFQs } from "./components/RFQs";
import { Quotes } from "./components/Quotes";
import { Approvals } from "./components/Approvals";
import { PurchaseOrders } from "./components/PurchaseOrders";
import { Invoices } from "./components/Invoices";
import { ActivityLogs } from "./components/ActivityLogs";
import { AnalyticsReports } from "./components/AnalyticsReports";
import { Users } from "./components/Users";
import { ProfilePage } from "./components/ProfilePage";
import { SettingsPage } from "./components/SettingsPage";
import { LoginPage } from "./components/LoginPage";
import { RegisterPage } from "./components/RegisterPage";
import { ShieldX, Clock } from "lucide-react";

type AuthView = "login" | "register" | "authenticated";

const AccessDenied: React.FC = () => {
  const { currentUser, setTab } = useERP();

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-xl border border-gray-200 shadow-sm max-w-2xl mx-auto mt-8 animate-fade-in">
      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-600 mb-6">
        <ShieldX className="w-8 h-8" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2 font-display">Access Restricted</h2>
      <p className="text-sm text-gray-500 max-w-md mb-6 font-sans">
        Your current session persona (<strong>{currentUser.role}</strong>) does not have authorization to view the requested page.
      </p>
      <button
        onClick={() => setTab("Dashboard")}
        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
      >
        Return to Dashboard
      </button>
    </div>
  );
};

const SessionTimeoutGuard: React.FC = () => {
  const { logout } = useERP();
  const [isWarningVisible, setIsWarningVisible] = useState(false);
  const [countdown, setCountdown] = useState(30);

  const TIMEOUT_LIMIT = 180 * 1000; // 3 minutes idle time
  const WARNING_COUNTDOWN_START = 30;

  useEffect(() => {
    let idleTimer: NodeJS.Timeout;
    let lastActivity = Date.now();

    const resetIdleTimer = () => {
      lastActivity = Date.now();
      if (isWarningVisible) {
        setIsWarningVisible(false);
        setCountdown(WARNING_COUNTDOWN_START);
      }
    };

    const checkIdle = () => {
      const now = Date.now();
      if (now - lastActivity >= TIMEOUT_LIMIT && !isWarningVisible) {
        setIsWarningVisible(true);
        setCountdown(WARNING_COUNTDOWN_START);
      }
    };

    const events = ["mousemove", "keydown", "mousedown", "scroll", "touchstart"];
    events.forEach((event) => window.addEventListener(event, resetIdleTimer));

    const interval = setInterval(checkIdle, 1000);

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetIdleTimer));
      clearInterval(interval);
    };
  }, [isWarningVisible]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isWarningVisible) {
      if (countdown > 0) {
        timer = setTimeout(() => {
          setCountdown((prev) => prev - 1);
        }, 1000);
      } else {
        logout();
      }
    }
    return () => clearTimeout(timer);
  }, [isWarningVisible, countdown, logout]);

  if (!isWarningVisible) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xl max-w-md w-full p-8 text-center relative animate-slide-in">
        <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 mx-auto mb-6">
          <Clock className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-black text-gray-900 font-display tracking-tight mb-2">
          Session Inactivity Warning
        </h3>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          You have been inactive for a while. For security reasons, you will be signed out in{" "}
          <strong className="text-amber-600 font-mono text-base">{countdown}</strong> seconds.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              setIsWarningVisible(false);
              setCountdown(WARNING_COUNTDOWN_START);
            }}
            className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-green-200 cursor-pointer"
          >
            Stay Signed In
          </button>
          <button
            onClick={logout}
            className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-705 rounded-xl text-sm font-bold transition-all cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

const MainContent: React.FC = () => {
  const { currentTab, hasAccess } = useERP();

  const renderActiveScreen = () => {
    if (!hasAccess(currentTab)) {
      return <AccessDenied />;
    }

    switch (currentTab) {
      case "Dashboard":
        return <Dashboard />;
      case "Users":
        return <Users />;
      case "Vendors":
        return <Vendors />;
      case "RFQs":
        return <RFQs />;
      case "Quotes":
        return <Quotes />;
      case "Approvals":
        return <Approvals />;
      case "Purchase Orders":
        return <PurchaseOrders />;
      case "Invoices":
        return <Invoices />;
      case "Activity Logs":
        return <ActivityLogs />;
      case "Analytics & Reports":
        return <AnalyticsReports />;
      case "Profile":
        return <ProfilePage />;
      case "Settings":
        return <SettingsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div id="vb-app-layout" className="min-h-screen bg-gray-50/50 text-gray-800 antialiased selection:bg-green-500 selection:text-white font-sans">
      <SessionTimeoutGuard />
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main body wrapper */}
      <div className="lg:pl-64 pl-0 flex flex-col min-h-screen transition-all duration-300">
        {/* Top Header */}
        <Header />

        {/* Outer view frame content */}
        <main className="flex-1 pt-20 px-4 sm:px-8 pb-12 overflow-y-auto max-w-7xl w-full mx-auto">
          {renderActiveScreen()}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  const [authView, setAuthView] = useState<AuthView>(() => {
    const saved = localStorage.getItem("vb_auth_state");
    return (saved as AuthView) || "login";
  });

  useEffect(() => {
    localStorage.setItem("vb_auth_state", authView);
  }, [authView]);

  const handleLogin = () => {
    setAuthView("authenticated");
  };

  const handleRegister = () => {
    setAuthView("authenticated");
  };

  const handleNavigateToRegister = () => {
    setAuthView("register");
  };

  const handleNavigateToLogin = () => {
    setAuthView("login");
  };

  if (authView === "login") {
    return (
      <LoginPage
        onLogin={handleLogin}
        onNavigateToRegister={handleNavigateToRegister}
      />
    );
  }

  if (authView === "register") {
    return (
      <RegisterPage
        onRegister={handleRegister}
        onNavigateToLogin={handleNavigateToLogin}
      />
    );
  }

  return (
    <ERPProvider>
      <MainContent />
    </ERPProvider>
  );
}
