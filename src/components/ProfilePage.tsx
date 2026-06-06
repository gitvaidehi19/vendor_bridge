import React, { useState } from "react";
import { useERP } from "../state";
import { UserRole } from "../types";
import {
  User as UserIcon,
  Mail,
  Shield,
  Briefcase,
  Hash,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Edit,
  Lock,
  LogOut,
  Laptop,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Activity,
  Trash2,
  Settings,
  X,
} from "lucide-react";
import { getPasswordStrength, validatePhone, formatDate, formatDateTime } from "../utils";

export const ProfilePage: React.FC = () => {
  const {
    currentUser,
    userProfiles,
    userSessions,
    activityLogs,
    updateUserProfile,
    changePassword,
    logoutAllDevices,
    terminateSession,
  } = useERP();

  // Load profile details
  const profile = userProfiles.find((p) => p.userId === currentUser.id) || {
    phone: "+91 99999 88888",
    location: "Mumbai Office",
    department: "Procurement",
    employeeId: "EMP-2026-9999",
    joinedDate: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    lastPasswordChange: new Date().toISOString(),
  };

  // State controls
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Edit fields
  const [editName, setEditName] = useState(currentUser.name);
  const [editPhone, setEditPhone] = useState(profile.phone);
  const [editLocation, setEditLocation] = useState(profile.location);
  const [editDepartment, setEditDepartment] = useState(profile.department);
  const [editImage, setEditImage] = useState(currentUser.avatar);

  // Password fields
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [passError, setPassError] = useState("");

  const presetAvatars = [
    "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=120",
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120",
    "https://images.unsplash.com/photo-1547037579-f0fc020ac3be?auto=format&fit=crop&q=80&w=120",
  ];

  // Activities for this user
  const userLogsName = currentUser.name + (currentUser.role === "Vendor" ? " (Vendor)" : "");
  const userActivities = activityLogs
    .filter((log) => log.user === userLogsName)
    .slice(0, 10);

  // Active sessions for this user
  const userActiveSessions = userSessions.filter((sess) => sess.userId === currentUser.id);

  // Handlers
  const handleEditProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      alert("Name is required.");
      return;
    }
    if (!validatePhone(editPhone)) {
      alert("Please enter a valid phone number (7-15 digits).");
      return;
    }

    updateUserProfile(currentUser.id, {
      name: editName.trim(),
      phone: editPhone.trim(),
      location: editLocation.trim(),
      department: editDepartment.trim(),
      profileImage: editImage,
    });

    setShowEditModal(false);
    alert("Profile Updated Successfully");
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPass) {
      setPassError("Current password is required.");
      return;
    }

    const strength = getPasswordStrength(newPass);
    if (strength.score < 4) {
      setPassError("New password must meet all the security strength requirements below.");
      return;
    }

    if (newPass !== confirmPass) {
      setPassError("Confirm password does not match the new password.");
      return;
    }

    changePassword(currentUser.id, currentPass, newPass);
    setCurrentPass("");
    setNewPass("");
    setConfirmPass("");
    setPassError("");
    setShowPasswordModal(false);
    alert("Password Changed Successfully");
  };

  const handleLogoutAll = () => {
    logoutAllDevices(currentUser.id);
    setShowLogoutConfirm(false);
    alert("Logged out of all other devices successfully.");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 font-display flex items-center gap-2">
            <UserIcon className="w-6 h-6 text-green-600 animate-pulse" />
            My Profile
          </h2>
          <p className="text-sm text-gray-500 mt-1 font-sans">
            Manage your account information, security credentials, and active sessions.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditName(currentUser.name);
              setEditPhone(profile.phone);
              setEditLocation(profile.location);
              setEditDepartment(profile.department);
              setEditImage(currentUser.avatar);
              setShowEditModal(true);
            }}
            className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit Profile
          </button>
          <button
            onClick={() => {
              setCurrentPass("");
              setNewPass("");
              setConfirmPass("");
              setPassError("");
              setShowPasswordModal(true);
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-md shadow-green-100 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            Change Password
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Personal info Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm space-y-6 h-fit">
          <div className="flex flex-col items-center text-center">
            <div className="relative group">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-24 h-24 rounded-full border-4 border-gray-50 shadow-md object-cover"
              />
              <span className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                <span className="w-2 h-2 bg-white rounded-full animate-ping" />
              </span>
            </div>
            <h3 className="text-lg font-black text-gray-900 font-display mt-4 leading-tight">
              {currentUser.name}
            </h3>
            <span className="text-xs font-bold text-green-600 font-mono uppercase tracking-wider mt-1 bg-green-50 px-2 py-0.5 rounded">
              {currentUser.role}
            </span>
          </div>

          <div className="border-t border-gray-100 pt-5 space-y-4 text-sm">
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-400 font-medium flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-gray-300" /> Email
              </span>
              <span className="text-gray-800 font-semibold truncate max-w-[200px]" title={currentUser.email}>
                {currentUser.email}
              </span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-gray-400 font-medium flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-gray-300" /> Department
              </span>
              <span className="text-gray-800 font-semibold">{profile.department}</span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-gray-400 font-medium flex items-center gap-1.5">
                <Hash className="w-4 h-4 text-gray-300" /> Employee ID
              </span>
              <span className="text-gray-800 font-mono font-bold text-xs">{profile.employeeId}</span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-gray-400 font-medium flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-gray-300" /> Phone Number
              </span>
              <span className="text-gray-800 font-semibold">{profile.phone}</span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-gray-400 font-medium flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-gray-300" /> Location
              </span>
              <span className="text-gray-800 font-semibold">{profile.location}</span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-gray-400 font-medium flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-gray-300" /> Joined Date
              </span>
              <span className="text-gray-850 font-medium">{formatDate(profile.joinedDate)}</span>
            </div>
          </div>
        </div>

        {/* Center/Right Columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Security & Sessions Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-gray-150 pb-3">
              <h3 className="text-sm uppercase font-black tracking-wider text-gray-400 font-mono flex items-center gap-2">
                <Shield className="w-4.5 h-4.5 text-green-600" />
                Account Security &amp; Active Sessions
              </h3>
              {userActiveSessions.length > 1 && (
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="text-xs font-bold text-red-600 hover:text-red-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout All Devices
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div>
                <span className="text-gray-400 block uppercase font-mono tracking-wider font-bold">Last Login Timestamp</span>
                <span className="font-semibold text-gray-800 mt-1 block">
                  {formatDateTime(profile.lastLogin)}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block uppercase font-mono tracking-wider font-bold">Last Password Change</span>
                <span className="font-semibold text-gray-800 mt-1 block">
                  {formatDateTime(profile.lastPasswordChange)}
                </span>
              </div>
            </div>

            {/* Sessions list */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-gray-500 block">Active Connected Sessions ({userActiveSessions.length})</span>
              <div className="divide-y divide-gray-100 border border-gray-150 rounded-xl overflow-hidden bg-white">
                {userActiveSessions.map((session) => (
                  <div key={session.id} className="p-4 flex items-center justify-between gap-4 text-xs hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl shrink-0 ${session.isCurrent ? "bg-green-50 text-green-600" : "bg-gray-50 text-gray-400"}`}>
                        <Laptop className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800 flex items-center gap-2">
                          {session.device} ({session.browser})
                          {session.isCurrent && (
                            <span className="bg-green-100 text-green-800 text-[8px] font-bold px-1.5 py-0.5 rounded font-mono uppercase">
                              Current Session
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-400 mt-0.5 font-mono">
                          IP: {session.ipAddress} · Logged in: {session.loginTime}
                        </div>
                      </div>
                    </div>

                    {!session.isCurrent && (
                      <button
                        onClick={() => {
                          terminateSession(currentUser.id, session.id);
                          alert("Session Terminated Successfully");
                        }}
                        className="p-1 rounded-lg border border-red-200 hover:border-red-400 text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Terminate Session"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Sourcing Activities logs */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm space-y-4">
            <h3 className="text-sm uppercase font-black tracking-wider text-gray-400 font-mono border-b border-gray-150 pb-3 flex items-center gap-2">
              <Activity className="w-4.5 h-4.5 text-green-600" />
              My Recent Activities Journal (Latest 10)
            </h3>

            {userActivities.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-xs">
                No recent activity records registered for this profile account.
              </div>
            ) : (
              <div className="relative border-l-2 border-gray-100 pl-4 ml-2.5 space-y-5 py-2">
                {userActivities.map((log) => (
                  <div key={log.id} className="relative group text-xs">
                    {/* Circle Node */}
                    <div className="absolute -left-[23px] top-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-white ring-2 ring-green-100 group-hover:scale-110 transition-transform" />
                    
                    <div className="flex items-center justify-between gap-4 font-mono text-[10px] text-gray-400 mb-1">
                      <span>{log.module} · {log.action}</span>
                      <span>{formatDateTime(log.timestamp)}</span>
                    </div>
                    <p className="text-gray-750 font-medium font-sans leading-relaxed">
                      {log.details}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xl max-w-md w-full p-6 relative animate-slide-in">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-655 hover:bg-gray-100 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-5 flex items-center gap-2 border-b border-gray-150 pb-3">
              <Edit className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-bold text-gray-900 font-display">Edit Profile Details</h3>
            </div>

            <form onSubmit={handleEditProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 transition-all"
                  />
                </div>
              </div>

              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Upload Photo (Select Avatar)
                </label>
                <div className="flex items-center gap-3 overflow-x-auto py-1">
                  {presetAvatars.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setEditImage(url)}
                      className={`relative rounded-full shrink-0 border-2 transition-all p-0.5 cursor-pointer ${
                        editImage === url
                          ? "border-green-600 scale-105 shadow-sm"
                          : "border-transparent hover:border-gray-300"
                      }`}
                    >
                      <img src={url} alt="Preset avatar" className="w-10 h-10 rounded-full object-cover" />
                      {editImage === url && (
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-600 text-white rounded-full flex items-center justify-center border border-white">
                          <CheckCircle className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 border-t border-gray-100 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-705 rounded-xl text-xs font-bold transition-all hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-green-200 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CHANGE PASSWORD MODAL */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xl max-w-md w-full p-6 relative animate-slide-in">
            <button
              onClick={() => setShowPasswordModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-655 hover:bg-gray-100 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4 flex items-center gap-2 border-b border-gray-150 pb-3">
              <Lock className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-bold text-gray-900 font-display">Update Password</h3>
            </div>

            {passError && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl flex items-start gap-2 text-xs mb-4">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                <span>{passError}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-gray-55 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    required
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    className="w-full pl-3 pr-10 py-2 text-sm bg-gray-55 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Confirm Password
                </label>
                <input
                  type={showPass ? "text" : "password"}
                  required
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-gray-55 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 transition-all"
                />
              </div>

              {/* Password strength tracker */}
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-150 space-y-2 text-xs">
                <span className="font-bold text-gray-500 uppercase tracking-wider text-[9px] font-mono block">Password Strength Metrics</span>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className={`flex-1 h-full rounded-full transition-colors ${
                          i < getPasswordStrength(newPass).score
                            ? getPasswordStrength(newPass).score >= 4
                              ? "bg-green-500"
                              : getPasswordStrength(newPass).score >= 2
                              ? "bg-amber-500"
                              : "bg-red-500"
                            : "bg-transparent"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold font-mono min-w-[50px] text-right text-gray-600">
                    {getPasswordStrength(newPass).label || "None"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] font-medium text-gray-500 pt-1">
                  <div className="flex items-center gap-1">
                    <CheckCircle className={`w-3.5 h-3.5 shrink-0 ${newPass.length >= 8 ? "text-green-500" : "text-gray-300"}`} />
                    <span>Min 8 characters</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className={`w-3.5 h-3.5 shrink-0 ${/[A-Z]/.test(newPass) ? "text-green-500" : "text-gray-300"}`} />
                    <span>1 Upper case</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className={`w-3.5 h-3.5 shrink-0 ${/[0-9]/.test(newPass) ? "text-green-500" : "text-gray-300"}`} />
                    <span>1 Number</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className={`w-3.5 h-3.5 shrink-0 ${/[^A-Za-z0-9]/.test(newPass) ? "text-green-500" : "text-gray-300"}`} />
                    <span>1 Special char</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 border-t border-gray-100 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-green-200 cursor-pointer"
                >
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LOGOUT CONFIRM MODAL */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xl max-w-sm w-full p-6 text-center relative animate-slide-in">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogOut className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-gray-950 font-display">Confirm Logout All Devices</h3>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              Are you sure you want to terminate all other active sessions for your account? You will remain signed in only on this device.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 border border-gray-250 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleLogoutAll}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-red-200 cursor-pointer"
              >
                Logout Others
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
