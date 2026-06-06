import React, { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Loader2,
  Building2,
  ShieldCheck,
  TrendingUp,
  FileSpreadsheet,
  Sparkles,
  X,
} from "lucide-react";
import { initialUsers } from "../data";

interface LoginPageProps {
  onLogin: () => void;
  onNavigateToRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onNavigateToRegister }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Forgot password states
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const validateEmail = (val: string) => {
    if (!val) return "Email address is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return "Please enter a valid email address";
    return undefined;
  };

  const validatePassword = (val: string) => {
    if (!val) return "Password is required";
    if (val.length < 6) return "Password must be at least 6 characters";
    return undefined;
  };

  const handleBlur = (field: "email" | "password") => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (field === "email") {
      setErrors((prev) => ({ ...prev, email: validateEmail(email) }));
    } else {
      setErrors((prev) => ({ ...prev, password: validatePassword(password) }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    setErrors({ email: emailError, password: passwordError });
    setTouched({ email: true, password: true });

    if (emailError || passwordError) return;

    setIsLoading(true);

    // Load all users from vb_users
    const usersStr = localStorage.getItem("vb_users");
    const allUsers = usersStr ? JSON.parse(usersStr) : [...initialUsers];

    // Dynamic matched user role detection
    const matchedUser = allUsers.find(
      (u: any) => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (matchedUser && matchedUser.status === "Inactive") {
      setIsLoading(false);
      setErrors({ email: "This account has been deactivated. Please contact your administrator." });
      return;
    }

    const userToSave = matchedUser || {
      id: `u-${Date.now()}`,
      name: email.split("@")[0].replace(/[._-]/g, " "),
      email: email.trim(),
      role: "Procurement Officer", // Default role
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120",
      status: "Active"
    };

    localStorage.setItem("vb_user", JSON.stringify(userToSave));

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    setLoginSuccess(true);
    await new Promise((resolve) => setTimeout(resolve, 650));
    onLogin();
  };

  const getFieldStatus = (field: "email" | "password") => {
    if (!touched[field]) return "idle";
    const val = field === "email" ? email : password;
    const error = field === "email" ? validateEmail(val) : validatePassword(val);
    return error ? "error" : "success";
  };

  return (
    <div className="min-h-screen bg-[#f8fafb] flex font-sans antialiased selection:bg-green-500 selection:text-white">
      {/* Left column - Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-16">
        <div
          className={`w-full max-w-[460px] transition-all duration-700 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-xl bg-green-600 flex items-center justify-center text-white font-bold text-lg select-none shadow-lg shadow-green-200">
              VB
            </div>
            <div>
              <h1 className="font-display font-bold text-xl leading-tight text-gray-900 tracking-tight">
                VendorBridge
              </h1>
              <p className="text-[10px] text-gray-400 font-mono tracking-[0.2em] uppercase">
                Enterprise ERP
              </p>
            </div>
          </div>

          {/* Auth Card */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xl shadow-gray-100/50 p-8 lg:p-10">
            {/* Welcome Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-black text-gray-900 font-display tracking-tight">
                Welcome Back
              </h2>
              <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
                Manage Procurement Efficiently. Sign in to continue to your dashboard.
              </p>
            </div>

            {/* Quick Demo Selector */}
            <div className="mb-6 bg-green-50/50 p-4 rounded-xl border border-green-100 text-left">
              <label className="block text-[10px] font-bold text-green-700 uppercase tracking-widest font-mono mb-2 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-green-600 animate-pulse" />
                Select Demo Persona (Auto-Fill)
              </label>
              <select
                value=""
                onChange={(e) => {
                  const selectedId = e.target.value;
                  if (selectedId) {
                    const usersStr = localStorage.getItem("vb_users");
                    const allUsers = usersStr ? JSON.parse(usersStr) : [...initialUsers];
                    const u = allUsers.find((usr: any) => usr.id === selectedId);
                    if (u) {
                      setEmail(u.email);
                      setPassword("password123");
                      // Reset touched & errors
                      setErrors({});
                      setTouched({});
                    }
                  }
                }}
                className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-green-500 font-sans cursor-pointer"
              >
                <option value="">Choose a demonstration profile...</option>
                {(() => {
                  try {
                    const usersStr = localStorage.getItem("vb_users");
                    const allUsers = usersStr ? JSON.parse(usersStr) : [...initialUsers];
                    
                    const coreUsers = allUsers.filter((u: any) => 
                      ["u-admin", "u-officer", "u-manager", "u-vendor-global", "u-vendor-starlight", "u-vendor-techflow"].includes(u.id)
                    );
                    const customUsers = allUsers.filter((u: any) => 
                      !["u-admin", "u-officer", "u-manager", "u-vendor-global", "u-vendor-starlight", "u-vendor-techflow"].includes(u.id)
                    );
                    
                    return (
                      <>
                        <optgroup label="Standard Profiles">
                          {coreUsers.map((u: any) => (
                            <option key={u.id} value={u.id}>
                              {u.name} ({u.role}){u.status === "Inactive" ? " - [DEACTIVATED]" : ""}
                            </option>
                          ))}
                        </optgroup>
                        {customUsers.length > 0 && (
                          <optgroup label="Custom & Registered Profiles">
                            {customUsers.map((u: any) => (
                              <option key={u.id} value={u.id}>
                                {u.name} ({u.role}){u.status === "Inactive" ? " - [DEACTIVATED]" : ""}
                              </option>
                            ))}
                          </optgroup>
                        )}
                      </>
                    );
                  } catch {
                    return null;
                  }
                })()}
              </select>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Email Field */}
              <div>
                <label
                  htmlFor="login-email"
                  className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 pointer-events-none" />
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (touched.email) {
                        setErrors((prev) => ({ ...prev, email: validateEmail(e.target.value) }));
                      }
                    }}
                    onBlur={() => handleBlur("email")}
                    placeholder="you@company.com"
                    className={`w-full pl-11 pr-10 py-3 rounded-xl text-sm font-sans bg-gray-50 border transition-all duration-200 focus:outline-none focus:ring-2 placeholder:text-gray-400 ${
                      getFieldStatus("email") === "error"
                        ? "border-red-300 focus:ring-red-200 focus:border-red-400 bg-red-50/30"
                        : getFieldStatus("email") === "success"
                        ? "border-green-300 focus:ring-green-200 focus:border-green-400"
                        : "border-gray-200 focus:ring-green-200 focus:border-green-400 hover:border-gray-300"
                    }`}
                    disabled={isLoading || loginSuccess}
                    autoComplete="email"
                  />
                  {getFieldStatus("email") === "success" && (
                    <CheckCircle className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-green-600" />
                  )}
                  {getFieldStatus("email") === "error" && (
                    <AlertCircle className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-red-400" />
                  )}
                </div>
                {touched.email && errors.email && (
                  <p className="mt-1.5 text-xs text-red-500 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="login-password"
                    className="block text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-xs font-semibold text-green-600 hover:text-green-700 transition-colors cursor-pointer"
                    onClick={() => setShowForgotModal(true)}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 pointer-events-none" />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (touched.password) {
                        setErrors((prev) => ({
                          ...prev,
                          password: validatePassword(e.target.value),
                        }));
                      }
                    }}
                    onBlur={() => handleBlur("password")}
                    placeholder="Enter your password"
                    className={`w-full pl-11 pr-12 py-3 rounded-xl text-sm font-sans bg-gray-50 border transition-all duration-200 focus:outline-none focus:ring-2 placeholder:text-gray-400 ${
                      getFieldStatus("password") === "error"
                        ? "border-red-300 focus:ring-red-200 focus:border-red-400 bg-red-50/30"
                        : getFieldStatus("password") === "success"
                        ? "border-green-300 focus:ring-green-200 focus:border-green-400"
                        : "border-gray-200 focus:ring-green-200 focus:border-green-400 hover:border-gray-300"
                    }`}
                    disabled={isLoading || loginSuccess}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-655 transition-colors p-0.5 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
                {touched.password && errors.password && (
                  <p className="mt-1.5 text-xs text-red-500 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  id="remember-me-toggle"
                  onClick={() => setRememberMe(!rememberMe)}
                  className={`w-4.5 h-4.5 rounded border-2 flex items-center justify-center transition-all duration-200 cursor-pointer ${
                    rememberMe
                      ? "bg-green-600 border-green-600"
                      : "bg-white border-gray-300 hover:border-gray-400"
                  }`}
                >
                  {rememberMe && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                <label
                  htmlFor="remember-me-toggle"
                  className="text-sm text-gray-600 cursor-pointer select-none"
                >
                  Remember me for 30 days
                </label>
              </div>

              {/* Submit Button */}
              <button
                id="login-submit"
                type="submit"
                disabled={isLoading || loginSuccess}
                className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all duration-305 flex items-center justify-center gap-2.5 cursor-pointer ${
                  loginSuccess
                    ? "bg-green-500 text-white shadow-lg shadow-green-200"
                    : isLoading
                    ? "bg-green-600 text-white/80 cursor-wait"
                    : "bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200/50 hover:shadow-xl hover:shadow-green-200/60 active:scale-[0.98]"
                }`}
              >
                {loginSuccess ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Authentication Successful</span>
                  </>
                ) : isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4.5 h-4.5" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* SSO Placeholder */}
            <button
              type="button"
              className="w-full py-3 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer"
              onClick={() => alert("SSO Identity federation is available on Business and Enterprise tiers.")}
            >
              <ShieldCheck className="w-4.5 h-4.5 text-gray-500" />
              Sign in with Enterprise SSO
            </button>

            {/* Sign Up Link */}
            <p className="text-center text-sm text-gray-500 mt-6">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={onNavigateToRegister}
                className="font-semibold text-green-600 hover:text-green-700 transition-colors cursor-pointer"
              >
                Create an account
              </button>
            </p>
          </div>

          {/* Trust Badges */}
          <div className="mt-6 flex items-center justify-center gap-6">
            <div className="flex items-center gap-1.5 text-gray-405">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="text-[10px] font-semibold uppercase tracking-wider">256-bit SSL</span>
            </div>
            <div className="w-px h-3 bg-gray-300" />
            <div className="flex items-center gap-1.5 text-gray-405">
              <Lock className="w-3.5 h-3.5" />
              <span className="text-[10px] font-semibold uppercase tracking-wider">SOC 2 Compliant</span>
            </div>
            <div className="w-px h-3 bg-gray-300" />
            <div className="flex items-center gap-1.5 text-gray-405">
              <CheckCircle className="w-3.5 h-3.5" />
              <span className="text-[10px] font-semibold uppercase tracking-wider">GDPR Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right column - Enterprise Illustration Panel */}
      <div className="hidden lg:flex w-[480px] xl:w-[540px] bg-[#111827] relative overflow-hidden flex-col items-center justify-center p-12 xl:p-16">
        {/* Background animated gradient overlay */}
        <div className="absolute inset-0 opacity-30">
          <div
            className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(22,163,74,0.25) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute bottom-[-15%] left-[-10%] w-[400px] h-[400px] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(22,163,74,0.15) 0%, transparent 70%)",
            }}
          />
        </div>

        {/* Floating grid pattern */}
        <div className="absolute inset-0 opacity-[0.04]">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="login-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#login-grid)" />
          </svg>
        </div>

        <div className="relative z-10 text-center space-y-10">
          {/* Sourcing Illustration */}
          <div className="relative mx-auto w-64 h-64">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-2xl bg-green-600/20 border border-green-500/30 backdrop-blur-xs flex items-center justify-center shadow-2xl shadow-green-900/20">
                <Building2 className="w-10 h-10 text-green-400" />
              </div>
            </div>

            <div className="absolute top-2 left-1/2 -translate-x-1/2 animate-pulse">
              <div className="w-14 h-14 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center shadow-lg">
                <FileSpreadsheet className="w-6 h-6 text-green-400" />
              </div>
            </div>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 animate-pulse" style={{ animationDelay: "0.5s" }}>
              <div className="w-14 h-14 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center shadow-lg">
                <ShieldCheck className="w-6 h-6 text-green-400" />
              </div>
            </div>
            <div className="absolute left-2 top-1/2 -translate-y-1/2 animate-pulse" style={{ animationDelay: "1s" }}>
              <div className="w-14 h-14 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
            </div>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 animate-pulse" style={{ animationDelay: "1.5s" }}>
              <div className="w-14 h-14 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-green-400" />
              </div>
            </div>

            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 256 256">
              <line x1="128" y1="66" x2="128" y2="100" stroke="rgba(22,163,74,0.3)" strokeWidth="1.5" strokeDasharray="4 3" />
              <line x1="128" y1="156" x2="128" y2="190" stroke="rgba(22,163,74,0.3)" strokeWidth="1.5" strokeDasharray="4 3" />
              <line x1="66" y1="128" x2="100" y2="128" stroke="rgba(22,163,74,0.3)" strokeWidth="1.5" strokeDasharray="4 3" />
              <line x1="156" y1="128" x2="190" y2="128" stroke="rgba(22,163,74,0.3)" strokeWidth="1.5" strokeDasharray="4 3" />
            </svg>
          </div>

          <div className="space-y-3">
            <h3 className="text-2xl font-black text-white font-display tracking-tight">
              Streamline Your Procurement
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs mx-auto">
              End-to-end vendor management, automated approvals, and real-time procurement analytics—all in one platform.
            </p>
          </div>

          {/* Stats Row */}
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <div className="text-xl font-black text-green-400 font-display">2.4K+</div>
              <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mt-0.5">Enterprises</div>
            </div>
            <div className="w-px h-8 bg-gray-700" />
            <div className="text-center">
              <div className="text-xl font-black text-green-400 font-display">₹1,500Cr+</div>
              <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mt-0.5">Cleared</div>
            </div>
            <div className="w-px h-8 bg-gray-700" />
            <div className="text-center">
              <div className="text-xl font-black text-green-400 font-display">99.9%</div>
              <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mt-0.5">Uptime</div>
            </div>
          </div>
        </div>

        {/* Bottom brand watermark */}
        <div className="absolute bottom-6 left-0 right-0 text-center">
          <span className="text-[10px] text-gray-600 font-mono tracking-widest uppercase">
            © 2026 VendorBridge · Enterprise Procurement Suite
          </span>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xl max-w-md w-full p-8 relative animate-slide-in">
            <button
              onClick={() => {
                setShowForgotModal(false);
                setForgotEmail("");
                setForgotError("");
                setForgotSuccess(false);
              }}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="mb-6">
              <h3 className="text-xl font-black text-gray-900 font-display tracking-tight">
                Reset Your Password
              </h3>
              <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
                Enter your work email and we'll send you instructions to reset your password.
              </p>
            </div>
            {forgotSuccess ? (
              <div className="space-y-6 text-center py-4">
                <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center text-green-600 mx-auto">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-gray-900">Email Dispatched</h4>
                  <p className="text-sm text-gray-500 mt-1.5 max-w-xs mx-auto">
                    We've sent reset instructions to <strong className="text-gray-800">{forgotEmail}</strong>. Please check your inbox.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotEmail("");
                    setForgotError("");
                    setForgotSuccess(false);
                  }}
                  className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-green-200 cursor-pointer"
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!forgotEmail) {
                    setForgotError("Email address is required");
                    return;
                  }
                  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) {
                    setForgotError("Please enter a valid email address");
                    return;
                  }
                  setForgotError("");
                  setIsForgotLoading(true);
                  // Simulate API dispatch
                  await new Promise((resolve) => setTimeout(resolve, 1500));
                  setIsForgotLoading(false);
                  setForgotSuccess(true);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="you@company.com"
                    className={`w-full px-4 py-3 rounded-xl text-sm font-sans bg-gray-50 border focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 hover:border-gray-300 transition-all duration-200 ${
                      forgotError ? "border-red-300 bg-red-50/20" : "border-gray-200"
                    }`}
                    disabled={isForgotLoading}
                  />
                  {forgotError && (
                    <p className="mt-1.5 text-xs text-red-500 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {forgotError}
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isForgotLoading}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-600/70 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-green-200/50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isForgotLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending Instructions...</span>
                    </>
                  ) : (
                    <span>Send Reset Link</span>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
