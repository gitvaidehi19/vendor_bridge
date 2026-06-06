/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = "Admin" | "Procurement Officer" | "Manager" | "Vendor";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  vendorId?: string; // If role is Vendor, maps to a specific vendor
  status?: "Active" | "Inactive";
}

export interface Vendor {
  id: string;
  name: string;
  category: string;
  gstNumber: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  status: "Active" | "Inactive" | "Blacklisted";
  rating: number; // 0 to 5
}

export interface RFQItem {
  id: string;
  item: string;
  qty: number;
  unit: string;
  targetPrice?: number;
  hsn?: string; // HSN Code for Indian tax classification
}

export type RFQStatus =
  | "Draft"
  | "Open"
  | "Vendor Responses Received"
  | "Vendor Selected"
  | "Pending Approval"
  | "Approved"
  | "PO Generated"
  | "Invoice Generated"
  | "Closed"
  | "Rejected";

export interface RFQ {
  id: string; // e.g. RFQ-2026-0001
  title: string;
  description: string;
  category: string;
  priority: "Low" | "Medium" | "High";
  deadline: string;
  items: RFQItem[];
  attachments: string[];
  status: RFQStatus;
  assignedVendors: string[]; // Vendor IDs
  createdAt: string;
  createdBy: string; // User Name
  estimatedBudget?: number; // Estimated budget in INR
}

export interface QuotationLineItem {
  item: string;
  qty: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Quotation {
  id: string; // e.g. QT-2026-0001
  rfqId: string;
  rfqTitle: string;
  vendorId: string;
  vendorName: string;
  lineItems: QuotationLineItem[];
  deliveryTimeline: string; // e.g. "5 Days", "10 Days"
  warranty: string; // e.g. "1 Year", "3 Years"
  notes: string;
  attachmentName?: string;
  status: "Submitted" | "Selected" | "Approved" | "Rejected";
  timestamp: string;
}

export type ApprovalStatus = "Pending" | "Approved" | "Rejected" | "Changes Requested";

export interface ApprovalRequest {
  id: string; // APR-YYYY-0001
  rfqId: string;
  rfqTitle: string;
  vendorId: string;
  vendorName: string;
  officerName: string;
  amount: number;
  justification: string;
  status: ApprovalStatus;
  remarks?: string;
  timestamp: string;
}

export interface PurchaseOrder {
  id: string; // e.g. PO-2026-0001
  rfqId: string;
  vendorId: string;
  vendorName: string;
  vendorDetails: Partial<Vendor>;
  approvedAmount: number;
  items: RFQItem[];
  deliveryTerms: string;
  status: "PO Generated" | "Emailed To Vendor";
  timestamp: string;
  issueDate: string;
  dueDate: string;
}

export interface Invoice {
  id: string; // e.g. INV-2026-0001
  poId: string;
  rfqId: string;
  vendorId: string;
  vendorName: string;
  items: {
    item: string;
    qty: number;
    unitPrice: number;
    hsn?: string;
    cgst: number;
    sgst: number;
    total: number;
  }[];
  subtotal: number;
  cgst: number;
  sgst: number;
  grandTotal: number;
  status: "Invoice Generated" | "Emailed" | "Paid";
  timestamp: string;
}

export interface ActivityLog {
  id: string;
  user: string;
  action: string;
  module: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  read: boolean;
  timestamp: string;
  recipientRole: UserRole | string; // Role name or specific Vendor ID
}

export interface UserProfile {
  id: string;
  userId: string;
  phone: string;
  location: string;
  department: string;
  profileImage: string;
  employeeId: string;
  joinedDate: string;
  lastLogin: string;
  lastPasswordChange: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserSettings {
  id: string;
  userId: string;
  theme: "light" | "dark" | "system";
  density: "compact" | "comfortable" | "spacious";
  sidebarBehavior: "expanded" | "collapsed";
  language: string;
  currency: string;
  dateFormat: string;
  timezone: string;
  notificationPreferences: {
    rfqNotifications: boolean;
    quotationNotifications: boolean;
    approvalNotifications: boolean;
    invoiceNotifications: boolean;
    emailNotifications: boolean;
    inAppNotifications: boolean;
  };
  securityPreferences: {
    twoFactorEnabled: boolean;
    sessionTimeout: number; // in minutes
  };
  createdAt: string;
  updatedAt: string;
}

export interface UserSession {
  id: string;
  userId: string;
  device: string;
  browser: string;
  ipAddress: string;
  loginTime: string;
  isCurrent?: boolean;
}
