# VendorBridge ERP — Enterprise Procurement & Sourcing Suite

VendorBridge is a production-grade, enterprise-class Procurement ERP system designed to streamline and automate the entire procurement lifecycle. The platform supports role-based workspaces, side-by-side quotation comparison matrices, manager treasury clearance, automatic purchase order releases, Indian GST/SGST tax invoices, identity governance, immutable activity audits, and extensive account localization features.

---

## 🚀 Key Modules & Capabilities

### 1. Procurement Operations Dashboard
- **Operational KPI Cards**: Tracks Active RFQs, Pending Approvals, Monthly Procurement Spend (localized target cap formatting), and Open Invoices with quick click-through navigation.
- **Sourcing Pipeline Lifecycle**: A visual stage progression tracking documents from RFQ Draft → Quotation → Review → Approved → PO Generated → settled Invoice.
- ** spend Trend Analytics**: High-fidelity SVG vector chart displaying current year spend curves against prior fiscal periods.
- **Shortcuts & Widgets**: Quick-action links to instantiate RFQs, onboard vendors, compare bids, or compile invoices.

### 2. Vendor Management Directory
- **Onboarding & Profiling**: Comprehensive corporate directory tracking Sourcing Domains, Primary focal contacts, and billing details.
- **GSTIN & Compliance Validation**: Strict format checks for corporate Indian GSTIN tax IDs (15 characters) next to email and telephone verification.
- **Status Governance**: Active, Inactive, and Blacklisted status options. The RFQ engine restricts assignments to **Active** vendors only.

### 3. Request For Quotation (RFQ) Engine
- **Sequential Document Keying**: Auto-generates unique, standard ERP identifiers (e.g. `RFQ-2026-0004`).
- **Multi-Step Creation Wizard**: Guided workflow specifying Title, Category, Deadline date, estimated Budget, Priority SLA, target rate specs, HSN codes, and supplier mappings.
- **Workflow Drafts**: Saves drafts to the database, allowing officers to resume compilation before publishing.

### 4. Vendor Bid Dispatch Portal
- **Invitations Feed**: Restricted workspace showing only campaigns assigned to the active vendor.
- **Proposal Forms**: Input matrix for unit price bids, delivery timelines, warranty SLA selections, and file attachments.
- **Compliance Lock**: Bids can be modified at any time prior to the deadline, and are locked immediately once the deadline passes.

### 5. Side-by-Side Quotation Comparison Matrix
- **Winner Evaluation**: High-fidelity highlights identifying the Lowest Cost Bidder, Fastest Delivery Lead-Time, and Best rated vendor.
- **Comparison Table Grid**: Side-by-side mapping of pricing, warranty terms, and compliance ratings.
- **Justification Dialog**: Selects a vendor and prompts for a written justification before forwarding the selection to the treasury queue.

### 6. Treasury Clearance & Manager Approvals
- **Clearance Queue**: Actionable cards detailing officer justifications and expenditure limits.
- **Approve, Reject, or Request Changes**:
  - *Approve*: Generates Purchase Orders and Invoices automatically.
  - *Reject*: Cancels the campaign selection and logs reasons.
  - *Request Changes*: Returns the RFQ back to the officer's selection step with feedback remarks.

### 7. Purchase Orders & Invoices (Accounts Payable)
- **Automatic Releases**: Generates `PO-2026-XXXX` and `INV-2026-XXXX` documents instantly upon approval.
- **Indian Tax Compliant Invoicing**: Compiles subtotal lines and automatically calculates **9% CGST** and **9% SGST** with correct HSN references.
- **Remittance Settle**: Financial Officers can clear invoices, marking them "Paid" in the ledger.
- **Actions**: Supports standard Print Layout stylesheets (`window.print()`) and email dispatch simulations.

### 8. Identity Governance & Admin Dashboard
- **Admin CRUD Control**: Manage accounts, system roles, linked vendor entities, and profile avatars.
- **Account Lockout deactivation**: Deactivating an account immediately sets it to `Inactive`. Deactivated users are blocked from logging in or switching roles.

### 9. Account Profile & Preferences
- **Profile Workspace**: Displays personal card details (employee ID, location, department, joined date) and recent user activity logs.
- **Password Strength Tracker**: Enforces 8-character minimum, uppercase, lowercase, number, and special character check.
- **Active Sessions Drawer**: Details device logins, enabling individual session termination or bulk logout with confirmation modals.

### 10. System Settings & Localizations
- **Notification Preferences**: Toggles for RFQ, Quotation, Approval, Invoice, Email, and In-App notification templates.
- **Appearance Styles**: Supports Light, Dark, or System mode, compact/spacious layout density, and sidebar behaviors.
- **Localization Controls**: Locked to standard Indian Rupee (₹), DD-MM-YYYY dates, and Asia/Kolkata (IST) timezone.

### 11. Immutable Timeline Journal (Audit Logs)
- **Search & Filters**: Global filter and module categories (System, RFQ, Portal, Approvals, Invoicing) matching range-bound dates.
- **Severity Badges**: Node highlights (🟢 SUCCESS, 🔵 INFO, 🟡 WARNING, 🔴 ERROR) based on action telemetry.
- **Navigate-to-Entity Links**: Clicking document IDs in logs automatically opens the respective tab.
- **Write-Once Constraint**: Audit entries are append-only. Edit or delete options are excluded from the codebase.

---

## 🔐 Role-Based Access Control (RBAC) Matrix

| Module / Screen | Administrator | Procurement Officer | Manager (Approver) | Vendor Partner |
| :--- | :---: | :---: | :---: | :---: |
| **Dashboard** | View | View | View | View (Vendor Dashboard) |
| **Users Control** | Manage (CRUD) | Access Denied | Access Denied | Access Denied |
| **Vendors Directory** | Manage | Manage | Access Denied | Access Denied |
| **RFQ Engine** | Manage | Manage | Access Denied | View Assigned |
| **Quotes & Bids** | Compare Bids | Compare / Select Bids | Access Denied | Submit / Edit Proposals |
| **Treasury Approvals** | Approve / Reject | View Queue Only | Approve / Reject | Access Denied |
| **Purchase Orders** | View | Manage | View | View Assigned POs |
| **Invoices Ledger** | Pay / Manage | Manage | Pay / Manage | View Assigned Invoices |
| **Activity logs** | View | View | View | Access Denied |
| **Reports & Analytics**| View | View | View | Access Denied |
| **Profile & Settings** | Manage Own | Manage Own | Manage Own | Manage Own |

---

## 🛠️ Technology Stack & Architecture
- **Framework**: React 19 SPA (Single Page Application)
- **Build System**: Vite 6
- **Styling**: Vanilla TailwindCSS v4 (`@tailwindcss/vite` configuration)
- **Icons**: Lucide React
- **Data Persistence**: Synchronized state hooks backed by LocalStorage, maintaining state persistence across page refreshes.

---

## ⚙️ Local Development & Setup

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (v9 or higher)

### Setup Steps
1. **Clone & Navigate to Project**:
   ```bash
   cd vendor_bridge
   ```
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment Variables**:
   Create a `.env.local` file in the root directory and specify your key configuration:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
4. **Start Local Development Server**:
   ```bash
   npm run dev
   ```
   *Note: Open [http://localhost:3000](http://localhost:3000) (or the next available port indicated in the terminal) in your browser.*
5. **Verify Types**:
   Ensure all TypeScript files typecheck successfully:
   ```bash
   npm run lint
   ```
6. **Compile Production Bundle**:
   Bundle and minify files for production deployment:
   ```bash
   npm run build
   ```
