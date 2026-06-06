/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Vendor, RFQ, Quotation, PurchaseOrder, Invoice, ActivityLog, Notification, User } from "./types";

export const initialUsers: User[] = [
  { id: "u-admin", name: "Vikram Mehta", email: "vikram.mehta@vendorbridge.in", role: "Admin", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=120" },
  { id: "u-officer", name: "Priya Sharma", email: "priya.sharma@vendorbridge.in", role: "Procurement Officer", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120" },
  { id: "u-manager", name: "Rajesh Iyer", email: "rajesh.iyer@vendorbridge.in", role: "Manager", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120" },
  { id: "u-vendor-global", name: "Amit Patel", email: "amit.patel@globaltech.in", role: "Vendor", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120", vendorId: "v-1" },
  { id: "u-vendor-starlight", name: "Kavitha Reddy", email: "kavitha@starlightindustrial.in", role: "Vendor", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120", vendorId: "v-2" },
  { id: "u-vendor-techflow", name: "Arjun Nair", email: "arjun@techflow.in", role: "Vendor", avatar: "https://images.unsplash.com/photo-1547037579-f0fc020ac3be?auto=format&fit=crop&q=80&w=120", vendorId: "v-3" }
];

export const initialVendors: Vendor[] = [
  {
    id: "v-1",
    name: "Global Tech Solutions Pvt. Ltd.",
    category: "IT Hardware",
    gstNumber: "27AABCG1234M1Z5",
    contactPerson: "Amit Patel",
    email: "amit.patel@globaltech.in",
    phone: "+91 98201 45678",
    address: "Plot 42, Hinjewadi IT Park, Phase 2, Pune, Maharashtra 411057",
    status: "Active",
    rating: 4.8
  },
  {
    id: "v-2",
    name: "Starlight Industrial Pvt. Ltd.",
    category: "Electrical Equipment",
    gstNumber: "29BBPCS5678K2Z8",
    contactPerson: "Kavitha Reddy",
    email: "kavitha@starlightindustrial.in",
    phone: "+91 80234 56789",
    address: "No. 18, Peenya Industrial Area, Stage 3, Bengaluru, Karnataka 560058",
    status: "Active",
    rating: 4.5
  },
  {
    id: "v-3",
    name: "TechFlow Systems India Ltd.",
    category: "IT Services & Cloud",
    gstNumber: "07CDFTS9012N3Z1",
    contactPerson: "Arjun Nair",
    email: "arjun@techflow.in",
    phone: "+91 11 4567 8901",
    address: "Tower B, DLF Cyber City, Sector 25A, Gurugram, Haryana 122002",
    status: "Active",
    rating: 4.2
  },
  {
    id: "v-4",
    name: "Apex Components India Pvt. Ltd.",
    category: "Raw Materials",
    gstNumber: "24EAPCA3456P4Z6",
    contactPerson: "Suresh Joshi",
    email: "suresh@apexcomponents.in",
    phone: "+91 79 2345 6789",
    address: "Survey No. 88, GIDC Estate, Vatva, Ahmedabad, Gujarat 382445",
    status: "Active",
    rating: 4.0
  },
  {
    id: "v-5",
    name: "Swift Logistics Solutions",
    category: "Logistics",
    gstNumber: "33FGSLS7890Q5Z3",
    contactPerson: "Deepak Kumar",
    email: "deepak@swiftlogistics.in",
    phone: "+91 44 2890 1234",
    address: "42, Ambattur Industrial Estate, Chennai, Tamil Nadu 600058",
    status: "Inactive",
    rating: 3.7
  },
  {
    id: "v-6",
    name: "Nexus Electronics India",
    category: "IT Hardware",
    gstNumber: "36HNXEL2345R6Z9",
    contactPerson: "Ravi Teja",
    email: "ravi@nexuselectronics.in",
    phone: "+91 40 2345 6789",
    address: "Plot 15, HITEC City, Madhapur, Hyderabad, Telangana 500081",
    status: "Blacklisted",
    rating: 2.1
  }
];

export const initialRFQs: RFQ[] = [
  {
    id: "RFQ-2026-0001",
    title: "High-Density Server Infrastructure Refresh",
    description: "Procurement of high-density server racks, switching modules, and support packages to expand our regional data center in Pune. Target delivery date by middle of Q3.",
    category: "IT Hardware",
    priority: "High",
    deadline: "2026-07-15",
    items: [
      { id: "item-1-1", item: "Enterprise Server Rack v2 (Model: SRV-200-X)", qty: 4, unit: "Units", targetPrice: 108000, hsn: "8471" },
      { id: "item-1-2", item: "Core Infrastructure Cabling (Cat6e High-Shielded)", qty: 2, unit: "Bundles", targetPrice: 41500, hsn: "8544" },
      { id: "item-1-3", item: "Technical Onboarding Support", qty: 1, unit: "Service Package", targetPrice: 66500, hsn: "9983" }
    ],
    attachments: ["SOW_DataCenter.pdf", "DataCenterSpecs_V4.xlsx"],
    status: "PO Generated",
    assignedVendors: ["v-1", "v-2", "v-3"],
    createdAt: "2026-06-01T09:15:00Z",
    createdBy: "Priya Sharma"
  },
  {
    id: "RFQ-2026-0002",
    title: "Primary Office Electrical Panel Upgrade",
    description: "Installation and wiring of high-voltage industrial electrical panels and control systems for BIS safety standards compliance at Bengaluru HQ.",
    category: "Electrical Equipment",
    priority: "Medium",
    deadline: "2026-07-20",
    items: [
      { id: "item-2-1", item: "Industrial Main Control Panel (3-Phase)", qty: 1, unit: "Unit", targetPrice: 348600, hsn: "8537" },
      { id: "item-2-2", item: "Copper Bus Bar Extension Pack", qty: 3, unit: "Packs", targetPrice: 37350, hsn: "7407" }
    ],
    attachments: ["LineDiagram_HQ.pdf"],
    status: "Open",
    assignedVendors: ["v-2", "v-4"],
    createdAt: "2026-06-04T10:30:00Z",
    createdBy: "Priya Sharma"
  },
  {
    id: "RFQ-2026-0003",
    title: "Cloud Migration Consulting Service",
    description: "Professional consulting services for migrating legacy database structures to modern serverless schemas on AWS/Azure, focusing on low latency for Indian markets.",
    category: "IT Services & Cloud",
    priority: "High",
    deadline: "2026-06-30",
    items: [
      { id: "item-3-1", item: "Database Refactoring Workshop", qty: 3, unit: "Sessions", targetPrice: 124500, hsn: "9983" },
      { id: "item-3-2", item: "Post-Migration Production Monitoring", qty: 1, unit: "Month", targetPrice: 166000, hsn: "9983" }
    ],
    attachments: ["MigrationSOW_Cloud.pdf"],
    status: "Vendor Responses Received",
    assignedVendors: ["v-1", "v-3"],
    createdAt: "2026-06-05T08:00:00Z",
    createdBy: "Priya Sharma"
  }
];

export const initialQuotations: Quotation[] = [
  {
    id: "QT-2026-0001",
    rfqId: "RFQ-2026-0001",
    rfqTitle: "High-Density Server Infrastructure Refresh",
    vendorId: "v-1",
    vendorName: "Global Tech Solutions Pvt. Ltd.",
    lineItems: [
      { item: "Enterprise Server Rack v2 (Model: SRV-200-X)", qty: 4, unitPrice: 103750, totalPrice: 415000 },
      { item: "Core Infrastructure Cabling (Cat6e High-Shielded)", qty: 2, unitPrice: 37350, totalPrice: 74700 },
      { item: "Technical Onboarding Support", qty: 1, unitPrice: 62250, totalPrice: 62250 }
    ],
    deliveryTimeline: "5 Days",
    warranty: "3 Years",
    notes: "We can prioritize shipping and bundle custom on-site cables. Delivery with full warranty certificates. GST included as applicable.",
    attachmentName: "GlobalTechQuote_0892.pdf",
    status: "Approved",
    timestamp: "2026-06-02T14:30:00Z"
  },
  {
    id: "QT-2026-0002",
    rfqId: "RFQ-2026-0001",
    rfqTitle: "High-Density Server Infrastructure Refresh",
    vendorId: "v-2",
    vendorName: "Starlight Industrial Pvt. Ltd.",
    lineItems: [
      { item: "Enterprise Server Rack v2 (Model: SRV-200-X)", qty: 4, unitPrice: 112050, totalPrice: 448200 },
      { item: "Core Infrastructure Cabling (Cat6e High-Shielded)", qty: 2, unitPrice: 39840, totalPrice: 79680 },
      { item: "Technical Onboarding Support", qty: 1, unitPrice: 70550, totalPrice: 70550 }
    ],
    deliveryTimeline: "12 Days",
    warranty: "2 Years",
    notes: "Standard components with quality hardware. BIS safety ratings guaranteed.",
    attachmentName: "Starlight_ServerQuote.pdf",
    status: "Rejected",
    timestamp: "2026-06-03T11:20:00Z"
  },
  {
    id: "QT-2026-0003",
    rfqId: "RFQ-2026-0001",
    rfqTitle: "High-Density Server Infrastructure Refresh",
    vendorId: "v-3",
    vendorName: "TechFlow Systems India Ltd.",
    lineItems: [
      { item: "Enterprise Server Rack v2 (Model: SRV-200-X)", qty: 4, unitPrice: 106240, totalPrice: 424960 },
      { item: "Core Infrastructure Cabling (Cat6e High-Shielded)", qty: 2, unitPrice: 36520, totalPrice: 73040 },
      { item: "Technical Onboarding Support", qty: 1, unitPrice: 66400, totalPrice: 66400 }
    ],
    deliveryTimeline: "8 Days",
    warranty: "1 Year",
    notes: "Subject to core component availability. Cabling is highly insulated per IS standards.",
    attachmentName: "TechFlowServersQuote.pdf",
    status: "Rejected",
    timestamp: "2026-06-03T15:45:00Z"
  },
  {
    id: "QT-2026-0004",
    rfqId: "RFQ-2026-0003",
    rfqTitle: "Cloud Migration Consulting Service",
    vendorId: "v-3",
    vendorName: "TechFlow Systems India Ltd.",
    lineItems: [
      { item: "Database Refactoring Workshop", qty: 3, unitPrice: 116200, totalPrice: 348600 },
      { item: "Post-Migration Production Monitoring", qty: 1, unitPrice: 149400, totalPrice: 149400 }
    ],
    deliveryTimeline: "30 Days",
    warranty: "None",
    notes: "Experienced database architects will lead all workshops. 24/7 post-deployment monitoring support included.",
    attachmentName: "TechFlowCloudMigration.pdf",
    status: "Submitted",
    timestamp: "2026-06-05T16:10:00Z"
  },
  {
    id: "QT-2026-0005",
    rfqId: "RFQ-2026-0003",
    rfqTitle: "Cloud Migration Consulting Service",
    vendorId: "v-1",
    vendorName: "Global Tech Solutions Pvt. Ltd.",
    lineItems: [
      { item: "Database Refactoring Workshop", qty: 3, unitPrice: 132800, totalPrice: 398400 },
      { item: "Post-Migration Production Monitoring", qty: 1, unitPrice: 124500, totalPrice: 124500 }
    ],
    deliveryTimeline: "45 Days",
    warranty: "6 Months Support",
    notes: "Complete security compliance check alongside workshops. CERT-In standards included.",
    attachmentName: "GlobalTechCloudQuote.pdf",
    status: "Submitted",
    timestamp: "2026-06-05T18:30:00Z"
  }
];

export const initialPurchaseOrders: PurchaseOrder[] = [
  {
    id: "PO-2026-0001",
    rfqId: "RFQ-2026-0001",
    vendorId: "v-1",
    vendorName: "Global Tech Solutions Pvt. Ltd.",
    vendorDetails: {
      address: "Plot 42, Hinjewadi IT Park, Phase 2, Pune, Maharashtra 411057",
      contactPerson: "Amit Patel",
      email: "amit.patel@globaltech.in",
      gstNumber: "27AABCG1234M1Z5"
    },
    approvedAmount: 551950,
    items: [
      { id: "item-1-1", item: "Enterprise Server Rack v2 (Model: SRV-200-X)", qty: 4, unit: "Units", hsn: "8471" },
      { id: "item-1-2", item: "Core Infrastructure Cabling (Cat6e High-Shielded)", qty: 2, unit: "Bundles", hsn: "8544" },
      { id: "item-1-3", item: "Technical Onboarding Support", qty: 1, unit: "Service Package", hsn: "9983" }
    ],
    deliveryTerms: "Net 30 Days",
    status: "Emailed To Vendor",
    timestamp: "2026-06-02T15:00:00Z",
    issueDate: "2026-06-02",
    dueDate: "2026-07-02"
  }
];

export const initialInvoices: Invoice[] = [
  {
    id: "INV-2026-0001",
    poId: "PO-2026-0001",
    rfqId: "RFQ-2026-0001",
    vendorId: "v-1",
    vendorName: "Global Tech Solutions Pvt. Ltd.",
    items: [
      { item: "Enterprise Server Rack v2 (Model: SRV-200-X)", qty: 4, unitPrice: 103750, hsn: "8471", cgst: 37350, sgst: 37350, total: 489700 },
      { item: "Core Infrastructure Cabling (Cat6e High-Shielded)", qty: 2, unitPrice: 37350, hsn: "8544", cgst: 6723, sgst: 6723, total: 88146 },
      { item: "Technical Onboarding Support", qty: 1, unitPrice: 62250, hsn: "9983", cgst: 5603, sgst: 5603, total: 73456 }
    ],
    subtotal: 551950,
    cgst: 49676,
    sgst: 49676,
    grandTotal: 651302,
    status: "Emailed",
    timestamp: "2026-06-03T09:30:00Z"
  }
];

export const initialActivityLogs: ActivityLog[] = [
  {
    id: "log-1",
    user: "Priya Sharma",
    action: "RFQ Created",
    module: "RFQ Engine",
    details: "Created and formulated High-Density Server Infrastructure Refresh (RFQ-2026-0001).",
    timestamp: "2026-06-01T09:15:00Z",
    ipAddress: "192.168.1.45"
  },
  {
    id: "log-2",
    user: "Amit Patel (Vendor)",
    action: "Quotation Submitted",
    module: "Vendor Portal",
    details: "Submitted bid for Server Racks (QT-2026-0001) for ₹5,51,950.",
    timestamp: "2026-06-02T14:30:00Z",
    ipAddress: "192.168.2.102"
  },
  {
    id: "log-3",
    user: "Priya Sharma",
    action: "Vendor Selected",
    module: "RFQ Engine",
    details: "Initiated quotation comparison and selected Global Tech Solutions Pvt. Ltd. for Server Refresh.",
    timestamp: "2026-06-02T14:50:00Z",
    ipAddress: "192.168.1.45"
  },
  {
    id: "log-4",
    user: "Rajesh Iyer (Manager)",
    action: "Approval Granted",
    module: "Approvals",
    details: "Approved RFQ-2026-0001 for amount of ₹5,51,950 with justification: Best rate, outstanding rating.",
    timestamp: "2026-06-02T15:00:00Z",
    ipAddress: "192.168.1.12"
  },
  {
    id: "log-5",
    user: "System Automator",
    action: "PO Generated",
    module: "Purchasing",
    details: "Automated Purchase Order PO-2026-0001 creation for Global Tech Solutions Pvt. Ltd.",
    timestamp: "2026-06-02T15:10:00Z",
    ipAddress: "10.0.0.1"
  },
  {
    id: "log-6",
    user: "System Automator",
    action: "Invoice Generated",
    module: "Invoicing",
    details: "Automated Invoice INV-2026-0001 generation against PO-2026-0001.",
    timestamp: "2026-06-03T09:30:00Z",
    ipAddress: "10.0.0.1"
  },
  {
    id: "log-7",
    user: "Priya Sharma",
    action: "Invoice Emailed",
    module: "Invoicing",
    details: "Emailed Invoice INV-2026-0001 to Global Tech Solutions Pvt. Ltd.",
    timestamp: "2026-06-03T10:05:00Z",
    ipAddress: "192.168.1.45"
  },
  {
    id: "log-8",
    user: "System Automator",
    action: "Notification Sent",
    module: "RFQ Engine",
    details: "RFQ Assigned to Vendor (RFQ-2026-0001). Notification triggered for Global Tech Solutions Pvt. Ltd.",
    timestamp: "2026-06-01T09:20:00Z",
    ipAddress: "10.0.0.1"
  },
  {
    id: "log-9",
    user: "System Automator",
    action: "Approval Alert Generated",
    module: "Approvals",
    details: "Approval Alert Generated. Notification sent to Manager (Rajesh Iyer) for RFQ-2026-0001 clearance.",
    timestamp: "2026-06-02T14:55:00Z",
    ipAddress: "10.0.0.1"
  },
  {
    id: "log-10",
    user: "System Automator",
    action: "Invoice Email Delivered",
    module: "Invoicing",
    details: "Invoice Email Delivered. Notification of invoice settlement receipt sent to Global Tech Solutions Pvt. Ltd.",
    timestamp: "2026-06-03T10:10:00Z",
    ipAddress: "10.0.0.1"
  }
];

export const initialNotifications: Notification[] = [
  {
    id: "notif-1",
    title: "New RFQ Invitation",
    description: "You have been assigned to submit a quotation for Electrical Panel Upgrade (RFQ-2026-0002).",
    read: false,
    timestamp: "2026-06-04T10:30:00Z",
    recipientRole: "v-2"
  },
  {
    id: "notif-2",
    title: "Quotation Submission",
    description: "Global Tech Solutions Pvt. Ltd. submitted a quotation for Migration workshop (QT-2026-0005).",
    read: false,
    timestamp: "2026-06-05T18:30:00Z",
    recipientRole: "Procurement Officer"
  },
  {
    id: "notif-3",
    title: "Approval Requested",
    description: "Pending verification approval is requested for Server Infrastructure Refresh.",
    read: false,
    timestamp: "2026-06-02T14:55:00Z",
    recipientRole: "Manager"
  }
];
