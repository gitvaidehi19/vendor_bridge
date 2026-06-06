/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  User,
  Vendor,
  RFQ,
  Quotation,
  ApprovalRequest,
  PurchaseOrder,
  Invoice,
  ActivityLog,
  Notification,
  UserRole,
  RFQStatus,
  RFQItem,
  ApprovalStatus,
  UserProfile,
  UserSettings,
  UserSession,
} from "./types";
import {
  initialUsers,
  initialVendors,
  initialRFQs,
  initialQuotations,
  initialPurchaseOrders,
  initialInvoices,
  initialActivityLogs,
  initialNotifications,
} from "./data";
import { generateIP, hasModuleAccess, formatINR } from "./utils";

interface ERPContextType {
  currentUser: User;
  users: User[];
  vendors: Vendor[];
  rfqs: RFQ[];
  quotations: Quotation[];
  approvals: ApprovalRequest[];
  purchaseOrders: PurchaseOrder[];
  invoices: Invoice[];
  activityLogs: ActivityLog[];
  notifications: Notification[];
  userProfiles: UserProfile[];
  userSettings: UserSettings[];
  userSessions: UserSession[];
  currentTab: string;
  searchQuery: string;
  unreadNotificationsCount: number;
  isSidebarOpen: boolean;
  
  // Navigation & Role Control
  setTab: (tab: string) => void;
  setRole: (role: UserRole, vendorId?: string) => void;
  setSearchQuery: (query: string) => void;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  logout: () => void;
  hasAccess: (module: string) => boolean;
  
  // Vendor CRUD
  addVendor: (vendor: Omit<Vendor, "id" | "rating">) => void;
  editVendor: (id: string, updates: Partial<Omit<Vendor, "id">>) => void;
  deleteVendor: (id: string) => void;
  updateVendorStatus: (id: string, status: Vendor["status"]) => void;
  
  // RFQ CRUD
  createRFQ: (rfq: Omit<RFQ, "id" | "status" | "createdAt" | "createdBy">) => string;
  editRFQ: (id: string, updates: Partial<Omit<RFQ, "id" | "createdAt" | "createdBy">>) => void;
  deleteRFQ: (id: string) => void;
  duplicateRFQ: (id: string) => string;
  updateRFQStatus: (id: string, status: RFQStatus) => void;
  assignVendorsToRFQ: (rfqId: string, vendorIds: string[]) => void;
  
  // Quotation
  submitQuotation: (rfqId: string, vendorId: string, deliveryTimeline: string, warranty: string, notes: string, lines: { item: string; unitPrice: number; qty: number }[]) => void;
  editQuotation: (quotationId: string, updates: { deliveryTimeline?: string; warranty?: string; notes?: string; lineItems?: { item: string; unitPrice: number; qty: number; totalPrice: number }[] }) => void;
  selectVendorForRFQ: (rfqId: string, vendorId: string) => void;
  
  // Approval Workflow
  sendRFQForApproval: (rfqId: string, vendorId: string, justification: string) => void;
  approveRFQ: (rfqId: string, remarks?: string) => void;
  rejectRFQ: (rfqId: string, remarks?: string) => void;
  requestChanges: (rfqId: string, remarks: string) => void;
  
  // PO & Invoice
  triggerPOAndInvoice: (rfqId: string, vendorId: string) => void;
  emailPoVendor: (poId: string) => void;
  emailInvoiceVendor: (invoiceId: string) => void;
  payInvoice: (invoiceId: string) => void;
  
  // Notifications
  addNotification: (title: string, description: string, recipientRole: string) => void;
  clearNotifications: () => void;
  markNotificationsAsRead: () => void;
  
  // User Management
  addUser: (user: Omit<User, "id" | "status">) => void;
  editUser: (id: string, updates: Partial<Omit<User, "id">>) => void;
  toggleUserStatus: (id: string) => void;

  // Profile & Settings
  updateUserProfile: (userId: string, updates: Partial<Omit<UserProfile, "id" | "userId" | "createdAt">>) => void;
  updateUserSettings: (userId: string, updates: Partial<Omit<UserSettings, "id" | "userId" | "createdAt">>) => void;
  changePassword: (userId: string, currentPassword: string, newPassword: string) => { success: boolean; error?: string };
  logoutAllDevices: (userId: string) => void;
  terminateSession: (userId: string, sessionId: string) => void;

  // System
  resetAllData: () => void;
}

const ERPContext = createContext<ERPContextType | undefined>(undefined);

export const ERPProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Try to load from localStorage, otherwise fallback to high-fidelity mocks
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem("vb_user");
    return saved ? JSON.parse(saved) : initialUsers[1]; // Default to Procurement Officer
  });
  
  const [vendors, setVendors] = useState<Vendor[]>(() => {
    const saved = localStorage.getItem("vb_vendors");
    return saved ? JSON.parse(saved) : initialVendors;
  });

  const [rfqs, setRfqs] = useState<RFQ[]>(() => {
    const saved = localStorage.getItem("vb_rfqs");
    return saved ? JSON.parse(saved) : initialRFQs;
  });

  const [quotations, setQuotations] = useState<Quotation[]>(() => {
    const saved = localStorage.getItem("vb_quotes");
    return saved ? JSON.parse(saved) : initialQuotations;
  });

  const [approvals, setApprovals] = useState<ApprovalRequest[]>(() => {
    const saved = localStorage.getItem("vb_approvals");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: "APR-2026-0001",
        rfqId: "RFQ-2026-0001",
        rfqTitle: "High-Density Server Infrastructure Refresh",
        vendorId: "v-1",
        vendorName: "Global Tech Solutions Pvt. Ltd.",
        officerName: "Priya Sharma",
        amount: 551950,
        justification: "Lowest pricing (₹5,51,950) with stellar 4.8 Rating and shortest lead time.",
        status: "Approved" as ApprovalStatus,
        remarks: "Approved as per IT steering committee guidelines. Top tier rating match verified.",
        timestamp: "2026-06-02T15:00:00Z"
      }
    ];
  });

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => {
    const saved = localStorage.getItem("vb_pos");
    return saved ? JSON.parse(saved) : initialPurchaseOrders;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem("vb_invoices");
    return saved ? JSON.parse(saved) : initialInvoices;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem("vb_logs");
    return saved ? JSON.parse(saved) : initialActivityLogs;
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem("vb_notifs");
    return saved ? JSON.parse(saved) : initialNotifications;
  });

  const [currentTab, setCurrentTab] = useState<string>(() => {
    return localStorage.getItem("vb_tab") || "Dashboard";
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem("vb_users");
    if (saved) return JSON.parse(saved);
    const registeredStr = localStorage.getItem("vb_registered_users");
    const registered = registeredStr ? JSON.parse(registeredStr) : [];
    const combined = [...initialUsers, ...registered];
    return combined.map((u) => ({
      ...u,
      status: u.status || "Active",
    }));
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [userProfiles, setUserProfiles] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem("vb_profiles");
    if (saved) return JSON.parse(saved);
    
    return users.map((u) => {
      const existing = [
        {
          userId: "u-admin",
          phone: "+91 98765 43210",
          location: "Mumbai HQ",
          department: "Administration",
          employeeId: "EMP-2026-0001",
        },
        {
          userId: "u-officer",
          phone: "+91 98201 45678",
          location: "Pune Office",
          department: "Procurement & Sourcing",
          employeeId: "EMP-2026-0002",
        },
        {
          userId: "u-manager",
          phone: "+91 98300 12345",
          location: "Bengaluru HQ",
          department: "Finance & Operations",
          employeeId: "EMP-2026-0003",
        },
        {
          userId: "u-vendor-global",
          phone: "+91 98201 22222",
          location: "Pune Hinjewadi",
          department: "Client Services",
          employeeId: "VND-2026-0001",
        },
        {
          userId: "u-vendor-starlight",
          phone: "+91 80234 11111",
          location: "Bengaluru Peenya",
          department: "Sales Operations",
          employeeId: "VND-2026-0002",
        },
        {
          userId: "u-vendor-techflow",
          phone: "+91 11456 33333",
          location: "Gurugram DLF",
          department: "Cloud Engineering",
          employeeId: "VND-2026-0003",
        }
      ].find(p => p.userId === u.id);

      return {
        id: `prof-${u.id}`,
        userId: u.id,
        phone: existing?.phone || "+91 99999 88888",
        location: existing?.location || "Delhi Office",
        department: existing?.department || "Operations",
        profileImage: u.avatar || "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=120",
        employeeId: existing?.employeeId || `EMP-2026-${Math.floor(Math.random() * 9000 + 1000)}`,
        joinedDate: "2024-06-01T09:00:00Z",
        lastLogin: new Date().toISOString(),
        lastPasswordChange: "2026-01-01T09:00:00Z",
        createdAt: "2024-06-01T09:00:00Z",
        updatedAt: new Date().toISOString()
      };
    });
  });

  const [userSettings, setUserSettings] = useState<UserSettings[]>(() => {
    const saved = localStorage.getItem("vb_settings");
    if (saved) return JSON.parse(saved);

    return users.map((u) => ({
      id: `set-${u.id}`,
      userId: u.id,
      theme: "system",
      density: "comfortable",
      sidebarBehavior: "expanded",
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
  });

  const [userSessions, setUserSessions] = useState<UserSession[]>(() => {
    const saved = localStorage.getItem("vb_sessions");
    if (saved) return JSON.parse(saved);

    const list: UserSession[] = [];
    users.forEach((u) => {
      list.push(
        {
          id: `sess-${u.id}-1`,
          userId: u.id,
          device: "Windows Desktop",
          browser: "Chrome (v125.0.0)",
          ipAddress: "192.168.1.45",
          loginTime: "06 Jun 2026, 4:30 PM",
          isCurrent: true,
        },
        {
          id: `sess-${u.id}-2`,
          userId: u.id,
          device: "iPhone 15 Pro",
          browser: "Safari Mobile (v17.4)",
          ipAddress: "103.88.22.41",
          loginTime: "05 Jun 2026, 09:12 AM",
          isCurrent: false,
        },
        {
          id: `sess-${u.id}-3`,
          userId: u.id,
          device: "MacBook Air M2",
          browser: "Firefox (v126.0)",
          ipAddress: "192.168.1.108",
          loginTime: "03 Jun 2026, 11:22 AM",
          isCurrent: false,
        }
      );
    });
    return list;
  });

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  // Persists states in LocalStorage
  useEffect(() => { localStorage.setItem("vb_user", JSON.stringify(currentUser)); }, [currentUser]);
  useEffect(() => { localStorage.setItem("vb_users", JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem("vb_profiles", JSON.stringify(userProfiles)); }, [userProfiles]);
  useEffect(() => { localStorage.setItem("vb_settings", JSON.stringify(userSettings)); }, [userSettings]);
  useEffect(() => { localStorage.setItem("vb_sessions", JSON.stringify(userSessions)); }, [userSessions]);
  useEffect(() => { localStorage.setItem("vb_vendors", JSON.stringify(vendors)); }, [vendors]);
  useEffect(() => { localStorage.setItem("vb_rfqs", JSON.stringify(rfqs)); }, [rfqs]);
  useEffect(() => { localStorage.setItem("vb_quotes", JSON.stringify(quotations)); }, [quotations]);
  useEffect(() => { localStorage.setItem("vb_approvals", JSON.stringify(approvals)); }, [approvals]);
  useEffect(() => { localStorage.setItem("vb_pos", JSON.stringify(purchaseOrders)); }, [purchaseOrders]);
  useEffect(() => { localStorage.setItem("vb_invoices", JSON.stringify(invoices)); }, [invoices]);
  useEffect(() => { localStorage.setItem("vb_logs", JSON.stringify(activityLogs)); }, [activityLogs]);
  useEffect(() => { localStorage.setItem("vb_notifs", JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem("vb_tab", currentTab); }, [currentTab]);

  // ─── Logging and Notification helpers (Audit Logs are Write-Once/Immutable) ───
  // CRITICAL AUDIT COMPLIANCE RULE: Logs are write-only. No edit, no delete, no soft delete. Only append.
  const logActivity = useCallback((action: string, module: string, details: string) => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      user: currentUser.name + (currentUser.role === "Vendor" ? " (Vendor)" : ""),
      action,
      module,
      details,
      timestamp: new Date().toISOString(),
      ipAddress: generateIP(),
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  }, [currentUser]);

  const addNotification = useCallback((title: string, description: string, recipientRole: string) => {
    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      title,
      description,
      read: false,
      timestamp: new Date().toISOString(),
      recipientRole,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  }, []);

  // ─── Navigation & Role Control ───

  const setTab = (tab: string) => {
    setCurrentTab(tab);
    setIsSidebarOpen(false); // Auto-close on mobile
  };

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  const hasAccess = (module: string): boolean => {
    return hasModuleAccess(currentUser.role, module);
  };

  const logout = () => {
    localStorage.removeItem("vb_auth_state");
    window.location.reload();
  };

  const setRole = (role: UserRole, vendorId?: string) => {
    const selectedUser = users.find((u) => u.role === role && (!vendorId || u.vendorId === vendorId));
    if (selectedUser) {
      if (selectedUser.status === "Inactive") {
        alert(`Governance Block: The account for ${selectedUser.name} (${role}) has been deactivated and cannot be selected.`);
        return;
      }
      setCurrentUser(selectedUser);
      logActivity("User Switch", "Audit Logs", `Switched acting session role to ${role}.`);
    } else {
      const tempUser: User = {
        id: `u-${role.toLowerCase()}-${vendorId || "v-1"}`,
        name: vendorId ? (vendors.find((v) => v.id === vendorId)?.contactPerson || "Vendor Representative") : "User Account",
        email: vendorId ? (vendors.find((v) => v.id === vendorId)?.email || "vendor@email.com") : "user@email.com",
        role,
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120",
        vendorId,
        status: "Active"
      };
      setCurrentUser(tempUser);
      logActivity("User Switch", "Audit Logs", `Switched session role dynamically to ${role}.`);
    }
  };

  // ─── User CRUD ───

  const addUser = (u: Omit<User, "id" | "status">) => {
    const newId = `u-${Date.now()}`;
    const newUser: User = { ...u, id: newId, status: "Active" };
    setUsers((prev) => {
      const updated = [...prev, newUser];
      localStorage.setItem("vb_users", JSON.stringify(updated));
      return updated;
    });
    logActivity("User Created", "Admin", `Created new user account: ${u.name} (${u.role}).`);
    addNotification("New User Account Created", `${u.name} has been added as ${u.role}.`, "Admin");
  };

  const editUser = (id: string, updates: Partial<Omit<User, "id">>) => {
    setUsers((prev) => {
      const updated = prev.map((u) => (u.id === id ? { ...u, ...updates } : u));
      localStorage.setItem("vb_users", JSON.stringify(updated));
      return updated;
    });
    if (currentUser.id === id) {
      setCurrentUser((prev) => ({ ...prev, ...updates }));
    }
    const targetUser = users.find((u) => u.id === id);
    logActivity("User Updated", "Admin", `Updated account details for ${targetUser?.name || id}.`);
  };

  const toggleUserStatus = (id: string) => {
    let nextStatus: "Active" | "Inactive" = "Active";
    setUsers((prev) => {
      const updated = prev.map((u) => {
        if (u.id === id) {
          nextStatus = u.status === "Inactive" ? "Active" : "Inactive";
          return { ...u, status: nextStatus };
        }
        return u;
      });
      localStorage.setItem("vb_users", JSON.stringify(updated));
      return updated;
    });
    const targetUser = users.find((u) => u.id === id);
    logActivity("User Status Toggled", "Admin", `Changed status for user ${targetUser?.name || id} to: ${nextStatus}.`);
    addNotification("User Account Status Changed", `User ${targetUser?.name || "Account"} status set to ${nextStatus}.`, "Admin");
  };

  // ─── Profile & Settings CRUD ───

  const updateUserProfile = (
    userId: string,
    updates: Partial<Omit<UserProfile, "id" | "userId" | "createdAt">> & { name?: string }
  ) => {
    setUserProfiles((prev) => {
      const updated = prev.map((p) => {
        if (p.userId === userId) {
          const { name, ...profileFields } = updates;
          return { ...p, ...profileFields, updatedAt: new Date().toISOString() };
        }
        return p;
      });
      localStorage.setItem("vb_profiles", JSON.stringify(updated));
      return updated;
    });

    if (updates.name || updates.profileImage) {
      setUsers((prev) => {
        const updatedUsers = prev.map((u) => {
          if (u.id === userId) {
            return {
              ...u,
              name: updates.name !== undefined ? updates.name : u.name,
              avatar: updates.profileImage !== undefined ? updates.profileImage : u.avatar,
            };
          }
          return u;
        });
        localStorage.setItem("vb_users", JSON.stringify(updatedUsers));
        return updatedUsers;
      });

      if (currentUser.id === userId) {
        setCurrentUser((prev) => ({
          ...prev,
          name: updates.name !== undefined ? updates.name : prev.name,
          avatar: updates.profileImage !== undefined ? updates.profileImage : prev.avatar,
        }));
      }
    }

    logActivity("Profile Updated", "Profile", "User updated profile details.");
  };

  const updateUserSettings = (
    userId: string,
    updates: Partial<Omit<UserSettings, "id" | "userId" | "createdAt">>
  ) => {
    setUserSettings((prev) => {
      const updated = prev.map((s) => {
        if (s.userId === userId) {
          return { ...s, ...updates, updatedAt: new Date().toISOString() };
        }
        return s;
      });
      localStorage.setItem("vb_settings", JSON.stringify(updated));
      return updated;
    });

    if (updates.theme) {
      logActivity("Theme Changed", "Settings", `Appearance theme set to ${updates.theme}.`);
    } else {
      logActivity("Notification Settings Updated", "Settings", "Updated notification delivery rules.");
    }
  };

  const changePassword = (userId: string, currentPassword: string, newPassword: string) => {
    setUserProfiles((prev) => {
      const updated = prev.map((p) => {
        if (p.userId === userId) {
          return { ...p, lastPasswordChange: new Date().toISOString(), updatedAt: new Date().toISOString() };
        }
        return p;
      });
      localStorage.setItem("vb_profiles", JSON.stringify(updated));
      return updated;
    });

    logActivity("Password Changed", "Security", "Successfully updated account password.");
    return { success: true };
  };

  const logoutAllDevices = (userId: string) => {
    setUserSessions((prev) => {
      const filtered = prev.filter((sess) => sess.userId !== userId || sess.isCurrent);
      localStorage.setItem("vb_sessions", JSON.stringify(filtered));
      return filtered;
    });
    logActivity("Sessions Terminated", "Security", "Terminated all sessions except the active one.");
    addNotification("Sessions Terminated", "All other active device sessions have been logged out.", currentUser.role);
  };

  const terminateSession = (userId: string, sessionId: string) => {
    setUserSessions((prev) => {
      const filtered = prev.filter((sess) => sess.id !== sessionId);
      localStorage.setItem("vb_sessions", JSON.stringify(filtered));
      return filtered;
    });
    logActivity("Session Terminated", "Security", "Terminated device session.");
  };

  // ─── Vendor CRUD ───

  const addVendor = (v: Omit<Vendor, "id" | "rating">) => {
    const newId = `v-${vendors.length + 1}`;
    const newVendor: Vendor = { ...v, id: newId, rating: 5.0 };
    setVendors((prev) => [...prev, newVendor]);
    logActivity("Vendor Created", "Vendors", `Registered new vendor entity: ${v.name} (${v.category}).`);
    addNotification("New Vendor Registered", `${v.name} added under GSTIN: ${v.gstNumber}`, "Admin");
  };

  const editVendor = (id: string, updates: Partial<Omit<Vendor, "id">>) => {
    setVendors((prev) => prev.map((v) => (v.id === id ? { ...v, ...updates } : v)));
    const vendor = vendors.find((v) => v.id === id);
    logActivity("Vendor Updated", "Vendors", `Updated details for ${vendor?.name || id}.`);
  };

  const deleteVendor = (id: string) => {
    const vendor = vendors.find((v) => v.id === id);
    setVendors((prev) => prev.filter((v) => v.id !== id));
    logActivity("Vendor Deleted", "Vendors", `Removed vendor: ${vendor?.name || id} from the system.`);
    addNotification("Vendor Removed", `${vendor?.name || "Vendor"} has been removed from the system.`, "Admin");
  };

  const updateVendorStatus = (id: string, status: Vendor["status"]) => {
    setVendors((prev) => prev.map((v) => (v.id === id ? { ...v, status } : v)));
    const targetVendor = vendors.find((v) => v.id === id);
    logActivity("Vendor Updated", "Vendors", `Updated status for ${targetVendor?.name || id} to: ${status}.`);
  };

  // ─── RFQ CRUD ───

  const createRFQ = (rfqData: Omit<RFQ, "id" | "status" | "createdAt" | "createdBy">) => {
    const nextNum = rfqs.length + 1;
    const rfqNumber = `RFQ-2026-${String(nextNum).padStart(4, "0")}`;
    const newRFQ: RFQ = {
      ...rfqData,
      id: rfqNumber,
      status: "Draft",
      createdAt: new Date().toISOString(),
      createdBy: currentUser.name,
    };
    setRfqs((prev) => [newRFQ, ...prev]);
    logActivity("RFQ Draft Created", "RFQ Engine", `Initialized RFQ draft ${rfqNumber}: "${rfqData.title}".`);
    return rfqNumber;
  };

  const editRFQ = (id: string, updates: Partial<Omit<RFQ, "id" | "createdAt" | "createdBy">>) => {
    setRfqs((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
    logActivity("RFQ Updated", "RFQ Engine", `Updated RFQ ${id} with new details.`);
  };

  const deleteRFQ = (id: string) => {
    const rfq = rfqs.find((r) => r.id === id);
    setRfqs((prev) => prev.filter((r) => r.id !== id));
    logActivity("RFQ Deleted", "RFQ Engine", `Deleted RFQ ${id}: "${rfq?.title || ""}".`);
  };

  const duplicateRFQ = (id: string) => {
    const original = rfqs.find((r) => r.id === id);
    if (!original) return "";
    const nextNum = rfqs.length + 1;
    const rfqNumber = `RFQ-2026-${String(nextNum).padStart(4, "0")}`;
    const duplicated: RFQ = {
      ...original,
      id: rfqNumber,
      title: `${original.title} (Copy)`,
      status: "Draft",
      assignedVendors: [],
      createdAt: new Date().toISOString(),
      createdBy: currentUser.name,
    };
    setRfqs((prev) => [duplicated, ...prev]);
    logActivity("RFQ Duplicated", "RFQ Engine", `Duplicated RFQ ${id} as ${rfqNumber}.`);
    return rfqNumber;
  };

  const updateRFQStatus = (id: string, status: RFQStatus) => {
    setRfqs((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  const assignVendorsToRFQ = (rfqId: string, vendorIds: string[]) => {
    setRfqs((prev) =>
      prev.map((r) =>
        r.id === rfqId ? { ...r, assignedVendors: vendorIds, status: "Open" as RFQStatus } : r
      )
    );
    const rfq = rfqs.find((r) => r.id === rfqId);
    logActivity("Assigned Vendors", "RFQ Engine", `Assigned ${vendorIds.length} vendors to RFQ ${rfqId} and marked status Open.`);
    vendorIds.forEach((vId) => {
      addNotification(
        "Procurement RFQ Invitation",
        `You have been invited to submit a quote for: "${rfq?.title || "Project"}" before deadline.`,
        vId
      );
    });
  };

  // ─── Quotation ───

  const submitQuotation = (
    rfqId: string, vendorId: string, deliveryTimeline: string,
    warranty: string, notes: string,
    lines: { item: string; unitPrice: number; qty: number }[]
  ) => {
    const rfq = rfqs.find((r) => r.id === rfqId);
    const vendor = vendors.find((v) => v.id === vendorId);
    const nextNum = quotations.length + 1;
    const qtId = `QT-2026-${String(nextNum).padStart(4, "0")}`;
    const lineItemsWithTotal = lines.map((l) => ({ ...l, totalPrice: l.qty * l.unitPrice }));
    const newQuote: Quotation = {
      id: qtId, rfqId,
      rfqTitle: rfq?.title || "Enterprise Procurement Request",
      vendorId, vendorName: vendor?.name || "Independent Supplier",
      lineItems: lineItemsWithTotal, deliveryTimeline, warranty, notes,
      attachmentName: `QuotationDoc_${vendorId}.pdf`,
      status: "Submitted",
      timestamp: new Date().toISOString(),
    };
    setQuotations((prev) => [newQuote, ...prev]);
    setRfqs((prev) =>
      prev.map((r) =>
        r.id === rfqId && r.status === "Open"
          ? { ...r, status: "Vendor Responses Received" as RFQStatus } : r
      )
    );
    logActivity("Quotation Submitted", "Vendor Portal", `Vendor "${vendor?.name || vendorId}" filed bid ${qtId} for ${rfqId}.`);
    addNotification("New Quotation Submitted", `${vendor?.name || "Vendor"} placed proposal for ${rfqId}.`, "Procurement Officer");
  };

  const editQuotation = (quotationId: string, updates: {
    deliveryTimeline?: string; warranty?: string; notes?: string;
    lineItems?: { item: string; unitPrice: number; qty: number; totalPrice: number }[];
  }) => {
    setQuotations((prev) =>
      prev.map((q) => (q.id === quotationId ? { ...q, ...updates } : q))
    );
    logActivity("Quotation Updated", "Vendor Portal", `Updated quotation ${quotationId}.`);
  };

  const selectVendorForRFQ = (rfqId: string, vendorId: string) => {
    setQuotations((prev) =>
      prev.map((q) =>
        q.rfqId === rfqId
          ? { ...q, status: q.vendorId === vendorId ? ("Selected" as const) : ("Rejected" as const) }
          : q
      )
    );
    setRfqs((prev) =>
      prev.map((r) => (r.id === rfqId ? { ...r, status: "Vendor Selected" as RFQStatus } : r))
    );
    const vendor = vendors.find((v) => v.id === vendorId);
    logActivity("Vendor Pre-Selected", "RFQ Engine", `Officer selected vendor "${vendor?.name || vendorId}" for ${rfqId}.`);
  };

  // ─── Approval Workflow ───

  const sendRFQForApproval = (rfqId: string, vendorId: string, justification: string) => {
    const rfq = rfqs.find((r) => r.id === rfqId);
    const vendor = vendors.find((v) => v.id === vendorId);
    const quote = quotations.find((q) => q.rfqId === rfqId && q.vendorId === vendorId);
    const amount = quote ? quote.lineItems.reduce((acc, c) => acc + c.totalPrice, 0) : 0;
    const nextNum = approvals.length + 1;
    const aprId = `APR-2026-${String(nextNum).padStart(4, "0")}`;
    const newApproval: ApprovalRequest = {
      id: aprId, rfqId,
      rfqTitle: rfq?.title || "Procurement Contract",
      vendorId, vendorName: vendor?.name || "Selected Partner",
      officerName: currentUser.name, amount, justification,
      status: "Pending", timestamp: new Date().toISOString(),
    };
    setApprovals((prev) => [newApproval, ...prev]);
    setRfqs((prev) => prev.map((r) => (r.id === rfqId ? { ...r, status: "Pending Approval" as RFQStatus } : r)));
    logActivity("Approval Requested", "Approvals", `Forwarded selection of ${vendor?.name} (${formatINR(amount)}) on ${rfqId} to Manager approval.`);
    addNotification("Manager Approval Action Requested", `Verify proposal spend ${formatINR(amount)} for "${rfq?.title}" submitted by ${currentUser.name}.`, "Manager");
  };

  const approveRFQ = (rfqId: string, remarks?: string) => {
    let targetApproval: ApprovalRequest | undefined;
    setApprovals((prev) =>
      prev.map((ap) => {
        if (ap.rfqId === rfqId && ap.status === "Pending") {
          targetApproval = ap;
          return { ...ap, status: "Approved" as ApprovalStatus, remarks };
        }
        return ap;
      })
    );
    setRfqs((prev) => prev.map((r) => (r.id === rfqId ? { ...r, status: "Approved" as RFQStatus } : r)));
    if (targetApproval) {
      logActivity("Approval Granted", "Approvals", `Manager approved transaction selection on ${rfqId}. Auto-triggering PO instantiation.`);
      addNotification("Approval Request Sanctioned", `Selected quotation for ${targetApproval.vendorName} is approved. Remits generated.`, "Procurement Officer");
      triggerPOAndInvoice(rfqId, targetApproval.vendorId);
    }
  };

  const rejectRFQ = (rfqId: string, remarks?: string) => {
    let targetApproval: ApprovalRequest | undefined;
    setApprovals((prev) =>
      prev.map((ap) => {
        if (ap.rfqId === rfqId && ap.status === "Pending") {
          targetApproval = ap;
          return { ...ap, status: "Rejected" as ApprovalStatus, remarks };
        }
        return ap;
      })
    );
    setRfqs((prev) => prev.map((r) => (r.id === rfqId ? { ...r, status: "Rejected" as RFQStatus } : r)));
    if (targetApproval) {
      logActivity("RFQ Choice Rejected", "Approvals", `Manager rejected RFQ recommendation. Remarks: "${remarks || "No remarks"}".`);
      addNotification("Selection Request Rejected", `RFQ proposal request for ${targetApproval.vendorName} rejected: ${remarks || "Review terms required."}`, "Procurement Officer");
    }
  };

  const requestChanges = (rfqId: string, remarks: string) => {
    let targetApproval: ApprovalRequest | undefined;
    setApprovals((prev) =>
      prev.map((ap) => {
        if (ap.rfqId === rfqId && ap.status === "Pending") {
          targetApproval = ap;
          return { ...ap, status: "Changes Requested" as ApprovalStatus, remarks };
        }
        return ap;
      })
    );
    // Reset RFQ status back to Vendor Selected so officer can re-submit
    setRfqs((prev) => prev.map((r) => (r.id === rfqId ? { ...r, status: "Vendor Selected" as RFQStatus } : r)));
    if (targetApproval) {
      logActivity("Changes Requested", "Approvals", `Manager requested changes on ${rfqId}. Remarks: "${remarks}".`);
      addNotification("Changes Requested on Approval", `Manager has requested changes for "${targetApproval.rfqTitle}": ${remarks}`, "Procurement Officer");
    }
  };

  // ─── PO & Invoice ───

  const triggerPOAndInvoice = (rfqId: string, vendorId: string) => {
    const rfq = rfqs.find((r) => r.id === rfqId);
    const vendor = vendors.find((v) => v.id === vendorId);
    const quote = quotations.find((q) => q.rfqId === rfqId && q.vendorId === vendorId);
    const approvedAmount = quote ? quote.lineItems.reduce((acc, curr) => acc + curr.totalPrice, 0) : 0;

    // Generate PO
    const nextPoNum = purchaseOrders.length + 1;
    const poNumber = `PO-2026-${String(nextPoNum).padStart(4, "0")}`;
    const rfqItems: RFQItem[] = rfq?.items || [];
    const newPO: PurchaseOrder = {
      id: poNumber, rfqId, vendorId,
      vendorName: vendor?.name || "Global Solutions",
      vendorDetails: {
        address: vendor?.address || "Enterprise Area",
        contactPerson: vendor?.contactPerson || "Lead Manager",
        email: vendor?.email || "vendor@email.com",
        gstNumber: vendor?.gstNumber || "",
      },
      approvedAmount, items: rfqItems, deliveryTerms: "Net 30 Days",
      status: "PO Generated", timestamp: new Date().toISOString(),
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    };
    setPurchaseOrders((prev) => [newPO, ...prev]);

    // Generate Invoice with 9% CGST + 9% SGST
    const nextInvNum = invoices.length + 1;
    const invNumber = `INV-2026-${String(nextInvNum).padStart(4, "0")}`;
    const invoiceItems = quote
      ? quote.lineItems.map((item) => {
          const sub = item.totalPrice;
          const tax = Math.round(sub * 0.09);
          return {
            item: item.item, qty: item.qty, unitPrice: item.unitPrice,
            hsn: rfqItems.find((ri) => ri.item === item.item)?.hsn || "",
            cgst: tax, sgst: tax, total: sub + tax * 2,
          };
        })
      : [];
    const subtotal = quote ? quote.lineItems.reduce((acc, c) => acc + c.totalPrice, 0) : 0;
    const totalCgst = invoiceItems.reduce((acc, c) => acc + c.cgst, 0);
    const totalSgst = invoiceItems.reduce((acc, c) => acc + c.sgst, 0);
    const grandTotal = subtotal + totalCgst + totalSgst;
    const newInvoice: Invoice = {
      id: invNumber, poId: poNumber, rfqId, vendorId,
      vendorName: vendor?.name || "Global Solutions",
      items: invoiceItems, subtotal, cgst: totalCgst, sgst: totalSgst, grandTotal,
      status: "Invoice Generated", timestamp: new Date().toISOString(),
    };
    setInvoices((prev) => [newInvoice, ...prev]);
    setRfqs((prev) => prev.map((r) => (r.id === rfqId ? { ...r, status: "Invoice Generated" as RFQStatus } : r)));

    const loggerLogs: ActivityLog[] = [
      {
        id: `log-po-${Date.now()}`, user: "System Automator", action: "PO Generated",
        module: "Purchasing", details: `Automated Purchase Order ${poNumber} generated against sanctioned RFQ ${rfqId}.`,
        timestamp: new Date().toISOString(), ipAddress: "10.0.0.1",
      },
      {
        id: `log-inv-${Date.now() + 1}`, user: "System Automator", action: "Invoice Generated",
        module: "Invoicing", details: `Automated invoice ${invNumber} compiled against PO ${poNumber} for vendor ${vendor?.name}.`,
        timestamp: new Date().toISOString(), ipAddress: "10.0.0.1",
      },
    ];
    setActivityLogs((prev) => [...loggerLogs, ...prev]);
    addNotification("Purchase Order Released", `Document ${poNumber} finalized and sent to ERP queue. Invoice draft generated.`, "Procurement Officer");
    addNotification("New Invoice Compiled", `Payment Invoice ${invNumber} is prepared for execution. Approved amount: ${formatINR(grandTotal)}.`, vendorId);
  };

  const emailPoVendor = (poId: string) => {
    setPurchaseOrders((prev) => prev.map((po) => (po.id === poId ? { ...po, status: "Emailed To Vendor" as const } : po)));
    const po = purchaseOrders.find((p) => p.id === poId);
    logActivity("PO Emailed", "Purchasing", `Emailed copy of Purchase Order ${poId} directly to vendor ${po?.vendorDetails.email || "vendor@email.com"}.`);
    addNotification("Purchase Order Emailed", `PO PDF transmission copy sent to ${po?.vendorName}.`, "Procurement Officer");
  };

  const emailInvoiceVendor = (invoiceId: string) => {
    setInvoices((prev) => prev.map((inv) => (inv.id === invoiceId ? { ...inv, status: "Emailed" as const } : inv)));
    const inv = invoices.find((i) => i.id === invoiceId);
    logActivity("Invoice Emailed", "Invoicing", `Emailed computed Invoice receipt ${invoiceId} directly to vendor billing.`);
    addNotification("Invoice Receipt Dispatched", `Emailed invoice receipt copy of ${invoiceId} to organization billing contacts.`, inv?.vendorId || "v-1");
  };

  const payInvoice = (invoiceId: string) => {
    setInvoices((prev) => prev.map((inv) => (inv.id === invoiceId ? { ...inv, status: "Paid" as const } : inv)));
    const invoice = invoices.find((inv) => inv.id === invoiceId);
    logActivity("Invoice Cleared", "Invoicing", `Approved treasury payment of ${formatINR(invoice?.grandTotal || 0)} for Invoice ${invoiceId}.`);
    addNotification("Invoice Remittance Processed", `Invoice ${invoiceId} has been successfully paid and settled. Status updated to Paid.`, invoice?.vendorId || "v-1");
  };

  const clearNotifications = () => setNotifications([]);
  const markNotificationsAsRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const resetAllData = () => {
    setCurrentUser(initialUsers[1]);
    setUsers(initialUsers.map(u => ({ ...u, status: "Active" })));
    localStorage.removeItem("vb_users");
    localStorage.removeItem("vb_profiles");
    localStorage.removeItem("vb_settings");
    localStorage.removeItem("vb_sessions");
    setVendors(initialVendors);
    setRfqs(initialRFQs);
    setQuotations(initialQuotations);
    setApprovals([{
      id: "APR-2026-0001", rfqId: "RFQ-2026-0001",
      rfqTitle: "High-Density Server Infrastructure Refresh",
      vendorId: "v-1", vendorName: "Global Tech Solutions Pvt. Ltd.",
      officerName: "Priya Sharma", amount: 551950,
      justification: "Lowest pricing (₹5,51,950) with stellar 4.8 Rating and shortest lead time.",
      status: "Approved" as ApprovalStatus,
      remarks: "Approved as per IT steering committee guidelines. Top tier rating match verified.",
      timestamp: "2026-06-02T15:00:00Z"
    }]);
    setPurchaseOrders(initialPurchaseOrders);
    setInvoices(initialInvoices);
    setActivityLogs(initialActivityLogs);
    setNotifications(initialNotifications);
    setCurrentTab("Dashboard");
    setSearchQuery("");
    logActivity("Database Reset", "System", "ERP database has been reset to baseline installation defaults.");
  };

  return (
    <ERPContext.Provider
      value={{
        currentUser, users, vendors, rfqs, quotations, approvals,
        purchaseOrders, invoices, activityLogs, notifications, currentTab,
        searchQuery, unreadNotificationsCount, isSidebarOpen,
        userProfiles, userSettings, userSessions,
        setTab, setRole, setSearchQuery, toggleSidebar, closeSidebar, logout, hasAccess,
        addVendor, editVendor, deleteVendor, updateVendorStatus,
        createRFQ, editRFQ, deleteRFQ, duplicateRFQ, updateRFQStatus, assignVendorsToRFQ,
        submitQuotation, editQuotation, selectVendorForRFQ,
        sendRFQForApproval, approveRFQ, rejectRFQ, requestChanges,
        triggerPOAndInvoice, emailPoVendor, emailInvoiceVendor, payInvoice,
        addNotification, clearNotifications, markNotificationsAsRead, resetAllData,
        addUser, editUser, toggleUserStatus,
        updateUserProfile, updateUserSettings, changePassword, logoutAllDevices, terminateSession,
      }}
    >
      {children}
    </ERPContext.Provider>
  );
};

export const useERP = () => {
  const context = useContext(ERPContext);
  if (context === undefined) {
    throw new Error("useERP must be used within an ERPProvider");
  }
  return context;
};
