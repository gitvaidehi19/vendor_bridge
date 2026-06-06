/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import {
  User,
  Mail,
  Phone,
  Building2,
  Globe,
  Lock,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  ShieldCheck,
  FileText,
  ArrowRight,
  Sparkles,
  Users,
  Briefcase,
  UserCog,
} from "lucide-react";

import { initialUsers } from "../data";

interface RegisterPageProps {
  onRegister: () => void;
  onNavigateToLogin: () => void;
}

// Country list for the dropdown
const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany",
  "France", "India", "Japan", "Singapore", "United Arab Emirates",
  "Saudi Arabia", "Brazil", "Mexico", "Netherlands", "South Korea",
  "Sweden", "Switzerland", "Norway", "Denmark", "Spain",
  "Italy", "China", "Indonesia", "Malaysia", "Thailand",
  "South Africa", "Nigeria", "Egypt", "Kenya", "New Zealand",
];

const ROLE_OPTIONS = [
  {
    value: "Vendor",
    label: "Vendor",
    description: "Submit quotations & manage orders",
    icon: Building2,
    color: "green",
  },
  {
    value: "Procurement Officer",
    label: "Procurement Officer",
    description: "Create RFQs & manage sourcing",
    icon: Briefcase,
    color: "blue",
  },
  {
    value: "Manager",
    label: "Manager",
    description: "Approve procurement decisions",
    icon: UserCog,
    color: "purple",
  },
];

const STEPS = [
  { id: 1, title: "Personal Info", description: "Your details" },
  { id: 2, title: "Organization", description: "Company & role" },
  { id: 3, title: "Security", description: "Set password" },
];

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onRegister,
  onNavigateToLogin,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [country, setCountry] = useState("");
  const [userRole, setUserRole] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Touched state
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  // Validators
  const validators: Record<string, (val: string) => string | undefined> = {
    firstName: (v) => (!v.trim() ? "First name is required" : undefined),
    lastName: (v) => (!v.trim() ? "Last name is required" : undefined),
    email: (v) => {
      if (!v) return "Email is required";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Invalid email format";
      return undefined;
    },
    phone: (v) => {
      if (!v) return "Phone number is required";
      if (!/^[+]?[\d\s()-]{7,}$/.test(v)) return "Invalid phone number";
      return undefined;
    },
    companyName: (v) => (!v.trim() ? "Company name is required" : undefined),
    country: (v) => (!v ? "Please select a country" : undefined),
    userRole: (v) => (!v ? "Please select a role" : undefined),
    password: (v) => {
      if (!v) return "Password is required";
      if (v.length < 8) return "Minimum 8 characters";
      if (!/[A-Z]/.test(v)) return "Include an uppercase letter";
      if (!/[0-9]/.test(v)) return "Include a number";
      if (!/[^A-Za-z0-9]/.test(v)) return "Include a special character";
      return undefined;
    },
    confirmPassword: (v) => {
      if (!v) return "Please confirm your password";
      if (v !== password) return "Passwords do not match";
      return undefined;
    },
  };

  const getError = (field: string): string | undefined => {
    const val = {
      firstName, lastName, email, phone, companyName, country,
      userRole, password, confirmPassword,
    }[field] || "";
    return validators[field]?.(val);
  };

  const getFieldStatus = (field: string): "idle" | "error" | "success" => {
    if (!touched[field]) return "idle";
    return getError(field) ? "error" : "success";
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Password strength
  const passwordStrength = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  }, [password]);

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong", "Excellent"][passwordStrength] || "";
  const strengthColor = [
    "",
    "bg-red-500",
    "bg-orange-400",
    "bg-amber-400",
    "bg-green-400",
    "bg-green-600",
  ][passwordStrength] || "";
  const strengthTextColor = [
    "",
    "text-red-500",
    "text-orange-500",
    "text-amber-500",
    "text-green-500",
    "text-green-600",
  ][passwordStrength] || "";

  // Step validation
  const isStep1Valid = !getError("firstName") && !getError("lastName") && !getError("email") && !getError("phone") &&
    firstName && lastName && email && phone;
  const isStep2Valid = !getError("companyName") && !getError("country") && !getError("userRole") &&
    companyName && country && userRole;
  const isStep3Valid = !getError("password") && !getError("confirmPassword") &&
    password && confirmPassword && agreeTerms;

  const canProceed = () => {
    switch (currentStep) {
      case 1: return isStep1Valid;
      case 2: return isStep2Valid;
      case 3: return isStep3Valid;
      default: return false;
    }
  };

  const handleNext = () => {
    // Mark all current step fields as touched
    if (currentStep === 1) {
      setTouched((p) => ({ ...p, firstName: true, lastName: true, email: true, phone: true }));
      if (!isStep1Valid) return;
    } else if (currentStep === 2) {
      setTouched((p) => ({ ...p, companyName: true, country: true, userRole: true }));
      if (!isStep2Valid) return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched((p) => ({ ...p, password: true, confirmPassword: true }));
    if (!isStep3Valid) return;

    setIsLoading(true);

    // Create custom user entry
    const newUser = {
      id: `u-reg-${Date.now()}`,
      name: `${firstName} ${lastName}`,
      email: email.trim(),
      role: userRole,
      avatar: `https://images.unsplash.com/photo-${
        userRole === "Vendor" ? "1560179707-f14e90ef3623" : "1573496359142-b8d87734a5a2"
      }?auto=format&fit=crop&q=80&w=120`,
      companyName,
      country,
      phone,
    };

    try {
      const registeredStr = localStorage.getItem("vb_registered_users");
      const registered = registeredStr ? JSON.parse(registeredStr) : [];
      // Prevent duplicate email address registration
      const filtered = registered.filter((u: any) => u.email.toLowerCase() !== email.trim().toLowerCase());
      filtered.push(newUser);
      localStorage.setItem("vb_registered_users", JSON.stringify(filtered));

      // Also save to vb_users
      const usersStr = localStorage.getItem("vb_users");
      const currentUsersList = usersStr ? JSON.parse(usersStr) : [...initialUsers];
      const filteredUsersList = currentUsersList.filter((u: any) => u.email.toLowerCase() !== email.trim().toLowerCase());
      filteredUsersList.push({ ...newUser, status: "Active" });
      localStorage.setItem("vb_users", JSON.stringify(filteredUsersList));

      // Auto-set the logged-in session user details
      localStorage.setItem("vb_user", JSON.stringify(newUser));
    } catch (err) {
      console.error("Failed to persist registration data", err);
    }

    await new Promise((resolve) => setTimeout(resolve, 1800));
    setIsLoading(false);
    setRegisterSuccess(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    onRegister();
  };

  const inputClasses = (field: string) =>
    `w-full py-3 rounded-xl text-sm font-sans bg-gray-50 border transition-all duration-200 focus:outline-none focus:ring-2 placeholder:text-gray-400 ${
      getFieldStatus(field) === "error"
        ? "border-red-300 focus:ring-red-200 focus:border-red-400 bg-red-50/30"
        : getFieldStatus(field) === "success"
        ? "border-green-300 focus:ring-green-200 focus:border-green-400"
        : "border-gray-200 focus:ring-green-200 focus:border-green-400 hover:border-gray-300"
    }`;

  const renderFieldError = (field: string) => {
    if (!touched[field] || !getError(field)) return null;
    return (
      <p className="mt-1.5 text-xs text-red-500 font-medium flex items-center gap-1">
        <AlertCircle className="w-3 h-3 shrink-0" />
        {getError(field)}
      </p>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fafb] flex font-sans antialiased selection:bg-green-500 selection:text-white">
      {/* Left Panel - Enterprise Branding (hidden on tablet and below) */}
      <div className="hidden lg:flex w-[460px] xl:w-[520px] bg-[#111827] relative overflow-hidden flex-col justify-between p-12 xl:p-16">
        {/* Background effects */}
        <div className="absolute inset-0 opacity-30">
          <div
            className="absolute top-[-15%] left-[-10%] w-[450px] h-[450px] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)",
            }}
          />
        </div>

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.04]">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="reg-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#reg-grid)" />
          </svg>
        </div>

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div className="w-11 h-11 rounded-xl bg-green-600 flex items-center justify-center text-white font-bold text-lg select-none shadow-lg shadow-green-900/30">
              VB
            </div>
            <div>
              <h1 className="font-display font-bold text-xl leading-tight text-white tracking-tight">
                VendorBridge
              </h1>
              <p className="text-[10px] text-gray-500 font-mono tracking-[0.2em] uppercase">
                Enterprise ERP
              </p>
            </div>
          </div>

          {/* Main Heading */}
          <div className="space-y-4">
            <h2 className="text-3xl font-black text-white font-display tracking-tight leading-tight">
              Join 2,400+
              <br />
              <span className="text-green-400">enterprises</span> using
              <br />
              VendorBridge
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
              The all-in-one procurement management platform that helps enterprises streamline vendor relationships, automate approvals, and optimize spend.
            </p>
          </div>
        </div>

        {/* Feature list */}
        <div className="relative z-10 space-y-4">
          <FeatureItem
            icon={FileText}
            title="Automated RFQ Management"
            description="Create, assign, and track RFQs in real-time"
          />
          <FeatureItem
            icon={ShieldCheck}
            title="Multi-level Approvals"
            description="Role-based approval workflows with full audit trails"
          />
          <FeatureItem
            icon={Sparkles}
            title="AI-Powered Insights"
            description="Smart vendor recommendations and spend analytics"
          />
        </div>

        {/* Bottom */}
        <div className="relative z-10 mt-8">
          <div className="h-px bg-gray-800 mb-4" />
          <span className="text-[10px] text-gray-600 font-mono tracking-widest uppercase">
            © 2026 VendorBridge · Enterprise Procurement Suite
          </span>
        </div>
      </div>

      {/* Right Column - Registration Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-8 lg:px-12 overflow-y-auto">
        <div
          className={`w-full max-w-[580px] transition-all duration-700 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          {/* Mobile Logo (hidden on desktop) */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center text-white font-bold text-lg select-none shadow-lg shadow-green-200">
              VB
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-gray-900 tracking-tight">VendorBridge</h1>
              <p className="text-[10px] text-gray-400 font-mono tracking-[0.2em] uppercase">Enterprise ERP</p>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {STEPS.map((step, idx) => (
                <React.Fragment key={step.id}>
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                        currentStep > step.id
                          ? "bg-green-600 text-white shadow-md shadow-green-200"
                          : currentStep === step.id
                          ? "bg-green-600 text-white shadow-lg shadow-green-200 ring-4 ring-green-100"
                          : "bg-gray-100 text-gray-400 border border-gray-200"
                      }`}
                    >
                      {currentStep > step.id ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        step.id
                      )}
                    </div>
                    <div className="hidden sm:block">
                      <p
                        className={`text-xs font-bold leading-tight ${
                          currentStep >= step.id ? "text-gray-900" : "text-gray-400"
                        }`}
                      >
                        {step.title}
                      </p>
                      <p className="text-[10px] text-gray-400">{step.description}</p>
                    </div>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div className="flex-1 mx-3 sm:mx-4">
                      <div className="h-0.5 rounded-full bg-gray-200 overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full transition-all duration-500"
                          style={{
                            width: currentStep > step.id ? "100%" : "0%",
                          }}
                        />
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xl shadow-gray-100/50 p-8 lg:p-10">
            {/* Step Header */}
            <div className="mb-7">
              <h2 className="text-xl font-black text-gray-900 font-display tracking-tight">
                {currentStep === 1 && "Create Your Account"}
                {currentStep === 2 && "Organization Details"}
                {currentStep === 3 && "Set Your Password"}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {currentStep === 1 && "Tell us about yourself to get started."}
                {currentStep === 2 && "Help us understand your organization and role."}
                {currentStep === 3 && "Secure your account with a strong password."}
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              {/* ─── Step 1: Personal Info ─── */}
              {currentStep === 1 && (
                <div className="space-y-5">
                  {/* Name Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* First Name */}
                    <div>
                      <label htmlFor="reg-firstname" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                        First Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <input
                          id="reg-firstname"
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          onBlur={() => handleBlur("firstName")}
                          placeholder="John"
                          className={`${inputClasses("firstName")} pl-10 pr-4`}
                          disabled={isLoading}
                        />
                      </div>
                      {renderFieldError("firstName")}
                    </div>
                    {/* Last Name */}
                    <div>
                      <label htmlFor="reg-lastname" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                        Last Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <input
                          id="reg-lastname"
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          onBlur={() => handleBlur("lastName")}
                          placeholder="Doe"
                          className={`${inputClasses("lastName")} pl-10 pr-4`}
                          disabled={isLoading}
                        />
                      </div>
                      {renderFieldError("lastName")}
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="reg-email" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                      Work Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <input
                        id="reg-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onBlur={() => handleBlur("email")}
                        placeholder="john.doe@company.com"
                        className={`${inputClasses("email")} pl-10 pr-10`}
                        disabled={isLoading}
                        autoComplete="email"
                      />
                      {getFieldStatus("email") === "success" && (
                        <CheckCircle className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                      )}
                    </div>
                    {renderFieldError("email")}
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="reg-phone" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <input
                        id="reg-phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        onBlur={() => handleBlur("phone")}
                        placeholder="+1 (555) 000-0000"
                        className={`${inputClasses("phone")} pl-10 pr-4`}
                        disabled={isLoading}
                      />
                    </div>
                    {renderFieldError("phone")}
                  </div>
                </div>
              )}

              {/* ─── Step 2: Organization Details ─── */}
              {currentStep === 2 && (
                <div className="space-y-5">
                  {/* Company & Country Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Company Name */}
                    <div>
                      <label htmlFor="reg-company" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                        Company Name
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <input
                          id="reg-company"
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          onBlur={() => handleBlur("companyName")}
                          placeholder="Acme Corporation"
                          className={`${inputClasses("companyName")} pl-10 pr-4`}
                          disabled={isLoading}
                        />
                      </div>
                      {renderFieldError("companyName")}
                    </div>

                    {/* Country */}
                    <div>
                      <label htmlFor="reg-country" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                        Country
                      </label>
                      <div className="relative">
                        <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <select
                          id="reg-country"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          onBlur={() => handleBlur("country")}
                          className={`${inputClasses("country")} pl-10 pr-4 appearance-none cursor-pointer`}
                          disabled={isLoading}
                        >
                          <option value="">Select country</option>
                          {COUNTRIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                        <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 rotate-90 pointer-events-none" />
                      </div>
                      {renderFieldError("country")}
                    </div>
                  </div>

                  {/* User Role - Card selector */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">
                      Your Role
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {ROLE_OPTIONS.map((role) => {
                        const Icon = role.icon;
                        const isSelected = userRole === role.value;
                        return (
                          <button
                            key={role.value}
                            type="button"
                            onClick={() => {
                              setUserRole(role.value);
                              setTouched((p) => ({ ...p, userRole: true }));
                            }}
                            className={`p-4 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer group ${
                              isSelected
                                ? "border-green-500 bg-green-50/50 shadow-md shadow-green-100"
                                : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50"
                            }`}
                            disabled={isLoading}
                          >
                            <div
                              className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2.5 transition-colors ${
                                isSelected
                                  ? "bg-green-100 text-green-600"
                                  : "bg-gray-100 text-gray-400 group-hover:bg-gray-200 group-hover:text-gray-500"
                              }`}
                            >
                              <Icon className="w-4.5 h-4.5" />
                            </div>
                            <h4
                              className={`text-sm font-bold leading-tight ${
                                isSelected ? "text-green-900" : "text-gray-800"
                              }`}
                            >
                              {role.label}
                            </h4>
                            <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">
                              {role.description}
                            </p>
                            {isSelected && (
                              <div className="mt-2 flex items-center gap-1 text-green-600">
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Selected</span>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {renderFieldError("userRole")}
                  </div>

                  {/* Additional Information */}
                  <div>
                    <label htmlFor="reg-additional" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                      Additional Information <span className="text-gray-400 font-normal normal-case">(Optional)</span>
                    </label>
                    <textarea
                      id="reg-additional"
                      value={additionalInfo}
                      onChange={(e) => setAdditionalInfo(e.target.value)}
                      placeholder="Tell us about your procurement needs, expected volume, or any specific requirements..."
                      rows={3}
                      className="w-full py-3 px-4 rounded-xl text-sm font-sans bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-green-200 focus:border-green-400 hover:border-gray-300 transition-all duration-200 focus:outline-none placeholder:text-gray-400 resize-none"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              )}

              {/* ─── Step 3: Password ─── */}
              {currentStep === 3 && (
                <div className="space-y-5">
                  {/* Password */}
                  <div>
                    <label htmlFor="reg-password" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <input
                        id="reg-password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onBlur={() => handleBlur("password")}
                        placeholder="Create a strong password"
                        className={`${inputClasses("password")} pl-10 pr-12`}
                        disabled={isLoading || registerSuccess}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-0.5"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {renderFieldError("password")}

                    {/* Password Strength Meter */}
                    {password && (
                      <div className="mt-3">
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="flex-1 flex gap-1">
                            {[1, 2, 3, 4, 5].map((level) => (
                              <div
                                key={level}
                                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                                  level <= passwordStrength ? strengthColor : "bg-gray-200"
                                }`}
                              />
                            ))}
                          </div>
                          <span className={`text-xs font-bold ${strengthTextColor}`}>
                            {strengthLabel}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1">
                          <PasswordCriteria met={password.length >= 8} label="8+ characters" />
                          <PasswordCriteria met={/[A-Z]/.test(password)} label="Uppercase" />
                          <PasswordCriteria met={/[0-9]/.test(password)} label="Number" />
                          <PasswordCriteria met={/[^A-Za-z0-9]/.test(password)} label="Special char" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="reg-confirm-password" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <input
                        id="reg-confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onBlur={() => handleBlur("confirmPassword")}
                        placeholder="Re-enter your password"
                        className={`${inputClasses("confirmPassword")} pl-10 pr-12`}
                        disabled={isLoading || registerSuccess}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-0.5"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {renderFieldError("confirmPassword")}
                  </div>

                  {/* Terms & Conditions */}
                  <div className="flex items-start gap-2.5 mt-2">
                    <button
                      type="button"
                      id="agree-terms-toggle"
                      onClick={() => setAgreeTerms(!agreeTerms)}
                      className={`w-4.5 h-4.5 rounded border-2 flex items-center justify-center transition-all duration-200 shrink-0 mt-0.5 ${
                        agreeTerms
                          ? "bg-green-600 border-green-600"
                          : "bg-white border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      {agreeTerms && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <label htmlFor="agree-terms-toggle" className="text-xs text-gray-500 leading-relaxed cursor-pointer select-none">
                      I agree to the{" "}
                      <button type="button" className="text-green-600 font-semibold hover:underline">
                        Terms of Service
                      </button>{" "}
                      and{" "}
                      <button type="button" className="text-green-600 font-semibold hover:underline">
                        Privacy Policy
                      </button>
                    </label>
                  </div>

                  {/* Summary Preview */}
                  <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-green-600" />
                      Account Summary
                    </h4>
                    <div className="grid grid-cols-2 gap-y-1.5 text-xs">
                      <span className="text-gray-400">Name</span>
                      <span className="text-gray-700 font-medium">{firstName} {lastName}</span>
                      <span className="text-gray-400">Email</span>
                      <span className="text-gray-700 font-medium truncate">{email}</span>
                      <span className="text-gray-400">Company</span>
                      <span className="text-gray-700 font-medium">{companyName}</span>
                      <span className="text-gray-400">Role</span>
                      <span className="text-gray-700 font-medium">{userRole}</span>
                      <span className="text-gray-400">Country</span>
                      <span className="text-gray-700 font-medium">{country}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── Navigation Buttons ─── */}
              <div className="flex items-center justify-between mt-8 gap-4">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={isLoading || registerSuccess}
                    className="flex items-center gap-1.5 px-5 py-3 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </button>
                )}

                <div className={currentStep === 1 ? "ml-auto" : ""}>
                  {currentStep < 3 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer ${
                        canProceed()
                          ? "bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200/50 hover:shadow-xl active:scale-[0.98]"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      Continue
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      id="register-submit"
                      type="submit"
                      disabled={isLoading || registerSuccess || !canProceed()}
                      className={`flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer ${
                        registerSuccess
                          ? "bg-green-500 text-white shadow-lg shadow-green-200"
                          : isLoading
                          ? "bg-green-600 text-white/80 cursor-wait"
                          : canProceed()
                          ? "bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200/50 hover:shadow-xl active:scale-[0.98]"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {registerSuccess ? (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Account Created Successfully
                        </>
                      ) : isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        <>
                          Create Account
                          <ArrowRight className="w-4.5 h-4.5" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </form>

            {/* Login Link */}
            <p className="text-center text-sm text-gray-500 mt-7 pt-6 border-t border-gray-100">
              Already have an account?{" "}
              <button
                type="button"
                onClick={onNavigateToLogin}
                className="font-semibold text-green-600 hover:text-green-700 transition-colors"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Sub-Components ───

const FeatureItem: React.FC<{
  icon: React.FC<{ className?: string }>;
  title: string;
  description: string;
}> = ({ icon: Icon, title, description }) => (
  <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-gray-800/30 border border-gray-700/50 hover:border-gray-600/50 transition-colors">
    <div className="w-9 h-9 rounded-lg bg-green-600/15 flex items-center justify-center shrink-0">
      <Icon className="w-4.5 h-4.5 text-green-400" />
    </div>
    <div>
      <h4 className="text-sm font-bold text-white leading-tight">{title}</h4>
      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{description}</p>
    </div>
  </div>
);

const PasswordCriteria: React.FC<{ met: boolean; label: string }> = ({ met, label }) => (
  <div className="flex items-center gap-1">
    <div
      className={`w-3 h-3 rounded-full flex items-center justify-center transition-all duration-200 ${
        met ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-300"
      }`}
    >
      {met ? (
        <CheckCircle className="w-2.5 h-2.5" />
      ) : (
        <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
      )}
    </div>
    <span className={`text-[10px] font-medium ${met ? "text-green-600" : "text-gray-400"}`}>
      {label}
    </span>
  </div>
);
