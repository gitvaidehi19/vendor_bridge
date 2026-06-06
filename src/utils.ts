/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Format a number as Indian Rupees with the Indian numbering system.
 * Example: 125000 → "₹1,25,000"
 * Example: 1050000 → "₹10,50,000"
 */
export function formatINR(amount: number): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const parts = absAmount.toFixed(2).split(".");
  let intPart = parts[0];
  const decPart = parts[1];

  // Indian number system: last 3 digits, then groups of 2
  if (intPart.length > 3) {
    const lastThree = intPart.slice(-3);
    const remaining = intPart.slice(0, -3);
    const formatted = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
    intPart = formatted + "," + lastThree;
  }

  // Remove trailing .00 for cleaner display
  const result = decPart === "00" ? `₹${intPart}` : `₹${intPart}.${decPart}`;
  return isNegative ? `-${result}` : result;
}

/**
 * Format INR compactly for dashboard cards.
 * Example: 4280000 → "₹42.8L"
 * Example: 10000000 → "₹1.0Cr"
 */
export function formatINRCompact(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)}Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`;
  }
  return formatINR(amount);
}

/**
 * Format an ISO date string to a readable format.
 * Example: "2026-06-01T09:15:00Z" → "01 Jun 2026"
 */
export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Format date with time.
 * Example: "2026-06-01T09:15:00Z" → "01 Jun 2026, 2:45 PM"
 */
export function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Auto-generate sequential IDs.
 * Example: generateId("RFQ", 3) → "RFQ-2026-0003"
 */
export function generateId(prefix: string, sequence: number): string {
  const year = new Date().getFullYear();
  return `${prefix}-${year}-${String(sequence).padStart(4, "0")}`;
}

/**
 * Validate Indian GSTIN (15 characters).
 * Format: 2 digits state code + 10 char PAN + 1 entity code + Z + 1 check digit
 * Example: "27AAAPL1234C1Z5"
 */
export function validateGSTIN(gstin: string): boolean {
  if (!gstin) return false;
  const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return regex.test(gstin.toUpperCase());
}

/**
 * Validate email address.
 */
export function validateEmail(email: string): boolean {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate phone number (Indian format preferred).
 */
export function validatePhone(phone: string): boolean {
  if (!phone) return false;
  return /^[+]?[\d\s()-]{7,15}$/.test(phone);
}

/**
 * Calculate password strength score (0-5).
 */
export function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const labels = ["", "Weak", "Fair", "Good", "Strong", "Excellent"];
  const colors = ["", "red", "orange", "amber", "green", "green"];

  return {
    score,
    label: labels[score] || "",
    color: colors[score] || "",
  };
}

/**
 * Merge class names, filtering out falsy values.
 */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Generate a simulated IP address for activity logs.
 */
export function generateIP(): string {
  const octets = [
    192,
    168,
    Math.floor(Math.random() * 255),
    Math.floor(Math.random() * 255) + 1,
  ];
  return octets.join(".");
}

/**
 * Module access map per role.
 */
export const ROLE_ACCESS: Record<string, string[]> = {
  Admin: [
    "Dashboard", "Vendors", "RFQs", "Quotes", "Approvals",
    "Purchase Orders", "Invoices", "Activity Logs", "Analytics & Reports", "Users",
    "Profile", "Settings"
  ],
  "Procurement Officer": [
    "Dashboard", "Vendors", "RFQs", "Quotes", "Approvals",
    "Purchase Orders", "Invoices", "Activity Logs", "Analytics & Reports",
    "Profile", "Settings"
  ],
  Manager: [
    "Dashboard", "Approvals", "Purchase Orders", "Invoices",
    "Activity Logs", "Analytics & Reports",
    "Profile", "Settings"
  ],
  Vendor: [
    "Dashboard", "RFQs", "Quotes", "Purchase Orders", "Invoices",
    "Profile", "Settings"
  ],
};

/**
 * Check if a role has access to a module.
 */
export function hasModuleAccess(role: string, module: string): boolean {
  const allowed = ROLE_ACCESS[role];
  if (!allowed) return false;
  return allowed.includes(module);
}

/**
 * Debounce a function call.
 */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Truncate text with ellipsis.
 */
export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + "...";
}

/**
 * CSV Export helper — convert array of objects to CSV string.
 */
export function toCSV(data: Record<string, unknown>[], columns: { key: string; header: string }[]): string {
  const header = columns.map((c) => `"${c.header}"`).join(",");
  const rows = data.map((row) =>
    columns.map((c) => {
      const val = row[c.key];
      return `"${String(val ?? "").replace(/"/g, '""')}"`;
    }).join(",")
  );
  return [header, ...rows].join("\n");
}

/**
 * Trigger a CSV download in the browser.
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
