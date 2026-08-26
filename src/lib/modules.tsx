import type { Column, Field } from "@/components/ops/resource-page";
import { StatusBadge } from "@/components/ops/primitives";
import { compact, currency, formatDate, monthLabel, type Row } from "@/lib/ops";

export const nameMap = (rows: Row[], key = "name") =>
  Object.fromEntries(rows.map((r) => [r["id"], r[key]])) as Record<string, string>;

/* ---------------- Influencers ---------------- */

export const influencerColumns: Column[] = [
  {
    key: "name",
    label: "Name",
    render: (r) => (
      <div>
        <p className="font-medium">{r["name"]}</p>
        <p className="text-xs text-muted-foreground">{r["handle"] ?? "—"}</p>
      </div>
    ),
  },
  { key: "category", label: "Category" },
  { key: "contact_phone", label: "Phone" },
  { key: "target_videos_month", label: "Target/mo", align: "right" },
  { key: "rate", label: "Salary", align: "right", render: (r) => currency(r["rate"]) },
  {
    key: "agreement",
    label: "Agreement",
    render: (r) =>
      r["agreement_start"] || r["agreement_end"]
        ? `${formatDate(r["agreement_start"])} → ${formatDate(r["agreement_end"])}`
        : "—",
  },
  { key: "status", label: "Status", render: (r) => <StatusBadge value={r["status"]} /> },
];

export const influencerFields: Field[] = [
  { key: "name", label: "Full Name", required: true },
  { key: "handle", label: "TikTok Username", placeholder: "@username" },
  { key: "contact_phone", label: "Phone" },
  { key: "category", label: "Category / Niche", placeholder: "e.g. Beauty, Food" },
  { key: "target_videos_month", label: "Target Videos/Month", type: "number", defaultValue: 0 },
  { key: "rate", label: "Salary", type: "number", defaultValue: 0 },
  { key: "agreement_start", label: "Agreement Start", type: "date" },
  { key: "agreement_end", label: "Agreement End", type: "date" },
  {
    key: "status",
    label: "Status",
    type: "select",
    defaultValue: "active",
    colSpan: 2,
    options: [
      { value: "active", label: "Active" },
      { value: "paused", label: "Paused" },
      { value: "inactive", label: "Inactive" },
    ],
  },
  { key: "notes", label: "Notes", type: "textarea" },
];

export const targetColumns = (names: Record<string, string>): Column[] => [
  { key: "influencer_id", label: "Influencer", render: (r) => names[r["influencer_id"]] ?? "—" },
  { key: "period", label: "Period", render: (r) => monthLabel(r["period"]) },
  {
    key: "posts",
    label: "Posts",
    align: "right",
    render: (r) => `${r["achieved_posts"]} / ${r["target_posts"]}`,
  },
  {
    key: "reach",
    label: "Reach",
    align: "right",
    render: (r) => `${compact(r["achieved_reach"])} / ${compact(r["target_reach"])}`,
  },
  {
    key: "progress",
    label: "Reach progress",
    render: (r) => {
      const pct = Number(r["target_reach"])
        ? Math.round((Number(r["achieved_reach"]) / Number(r["target_reach"])) * 100)
        : 0;
      return (
        <div className="flex items-center gap-2">
          <div className="h-2 w-28 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${Math.min(100, pct)}%` }}
            />
          </div>
          <span className="text-xs tabular-nums text-muted-foreground">{pct}%</span>
        </div>
      );
    },
  },
];

export const targetFields = (options: Array<{ value: string; label: string }>): Field[] => [
  { key: "influencer_id", label: "Influencer", type: "select", required: true, options },
  { key: "period", label: "Period (month)", type: "date", required: true },
  { key: "target_posts", label: "Target posts", type: "number" },
  { key: "achieved_posts", label: "Achieved posts", type: "number" },
  { key: "target_reach", label: "Target reach", type: "number" },
  { key: "achieved_reach", label: "Achieved reach", type: "number" },
];

export const deliveryColumns = (names: Record<string, string>): Column[] => [
  { key: "influencer_id", label: "Influencer", render: (r) => names[r["influencer_id"]] ?? "—" },
  {
    key: "title",
    label: "Content",
    render: (r) => (
      <div>
        <p className="font-medium">{r["title"] ?? "Untitled"}</p>
        <p className="text-xs capitalize text-muted-foreground">{r["content_type"]}</p>
      </div>
    ),
  },
  { key: "delivery_date", label: "Delivered", render: (r) => formatDate(r["delivery_date"]) },
  { key: "views", label: "Views", align: "right", render: (r) => compact(r["views"]) },
  {
    key: "engagement",
    label: "Engagement",
    align: "right",
    render: (r) => compact(r["engagement"]),
  },
  { key: "status", label: "Status", render: (r) => <StatusBadge value={r["status"]} /> },
];

export const deliveryFields = (options: Array<{ value: string; label: string }>): Field[] => [
  { key: "influencer_id", label: "Influencer", type: "select", required: true, options },
  { key: "title", label: "Title" },
  {
    key: "content_type",
    label: "Content type",
    type: "select",
    defaultValue: "post",
    options: [
      { value: "post", label: "Post" },
      { value: "reel", label: "Reel" },
      { value: "story", label: "Story" },
      { value: "video", label: "Video" },
    ],
  },
  { key: "content_url", label: "Content link" },
  { key: "delivery_date", label: "Delivery date", type: "date" },
  { key: "views", label: "Views", type: "number" },
  { key: "engagement", label: "Engagement", type: "number" },
  {
    key: "status",
    label: "Status",
    type: "select",
    defaultValue: "delivered",
    options: [
      { value: "delivered", label: "Delivered" },
      { value: "pending_review", label: "Pending review" },
      { value: "rejected", label: "Rejected" },
    ],
  },
];

/* ---------------- Billboards ---------------- */

export const billboardColumns: Column[] = [
  {
    key: "name",
    label: "Billboard",
    render: (r) => (
      <div>
        <p className="font-medium">{r["name"]}</p>
        <p className="text-xs text-muted-foreground">{r["location"]}</p>
      </div>
    ),
  },
  { key: "city", label: "City" },
  { key: "size", label: "Size" },
  { key: "vendor", label: "Vendor" },
  {
    key: "monthly_rate",
    label: "Monthly rate",
    align: "right",
    render: (r) => currency(r["monthly_rate"]),
  },
  { key: "end_date", label: "Ends", render: (r) => formatDate(r["end_date"]) },
  { key: "status", label: "Status", render: (r) => <StatusBadge value={r["status"]} /> },
];

export const billboardFields: Field[] = [
  { key: "name", label: "Billboard name", required: true },
  { key: "location", label: "Location", required: true },
  { key: "city", label: "City" },
  { key: "size", label: "Size" },
  { key: "vendor", label: "Vendor" },
  { key: "monthly_rate", label: "Monthly rate (USD)", type: "number" },
  { key: "start_date", label: "Start date", type: "date" },
  { key: "end_date", label: "End date", type: "date" },
  {
    key: "status",
    label: "Status",
    type: "select",
    defaultValue: "active",
    options: [
      { value: "active", label: "Active" },
      { value: "expired", label: "Expired" },
      { value: "planned", label: "Planned" },
    ],
  },
  { key: "notes", label: "Notes", type: "textarea" },
];

/* ---------------- LCD ---------------- */

export const screenColumns: Column[] = [
  {
    key: "name",
    label: "Screen",
    render: (r) => (
      <div>
        <p className="font-medium">{r["name"]}</p>
        <p className="text-xs text-muted-foreground">{r["location"]}</p>
      </div>
    ),
  },
  { key: "city", label: "City" },
  { key: "resolution", label: "Resolution" },
  { key: "slot_seconds", label: "Slot", align: "right", render: (r) => `${r["slot_seconds"]}s` },
  { key: "vendor", label: "Vendor" },
  {
    key: "monthly_rate",
    label: "Monthly rate",
    align: "right",
    render: (r) => currency(r["monthly_rate"]),
  },
  { key: "status", label: "Status", render: (r) => <StatusBadge value={r["status"]} /> },
];

export const screenFields: Field[] = [
  { key: "name", label: "Screen name", required: true },
  { key: "location", label: "Location", required: true },
  { key: "city", label: "City" },
  { key: "resolution", label: "Resolution" },
  { key: "vendor", label: "Vendor" },
  { key: "monthly_rate", label: "Monthly rate (USD)", type: "number" },
  { key: "slot_seconds", label: "Slot length (seconds)", type: "number", defaultValue: 15 },
  { key: "start_date", label: "Start date", type: "date" },
  { key: "end_date", label: "End date", type: "date" },
  {
    key: "status",
    label: "Status",
    type: "select",
    defaultValue: "active",
    options: [
      { value: "active", label: "Active" },
      { value: "expired", label: "Expired" },
      { value: "planned", label: "Planned" },
    ],
  },
];

export const videoColumns = (names: Record<string, string>): Column[] => [
  { key: "title", label: "Video" },
  { key: "screen_id", label: "Screen", render: (r) => names[r["screen_id"]] ?? "—" },
  {
    key: "duration_seconds",
    label: "Duration",
    align: "right",
    render: (r) => `${r["duration_seconds"]}s`,
  },
  { key: "start_date", label: "Start", render: (r) => formatDate(r["start_date"]) },
  { key: "end_date", label: "End", render: (r) => formatDate(r["end_date"]) },
  { key: "daily_plays", label: "Plays / day", align: "right" },
  { key: "status", label: "Status", render: (r) => <StatusBadge value={r["status"]} /> },
];

export const videoFields = (options: Array<{ value: string; label: string }>): Field[] => [
  { key: "screen_id", label: "Screen", type: "select", required: true, options },
  { key: "title", label: "Video title", required: true },
  { key: "duration_seconds", label: "Duration (seconds)", type: "number", defaultValue: 15 },
  { key: "start_date", label: "Start date", type: "date" },
  { key: "end_date", label: "End date", type: "date" },
  { key: "daily_plays", label: "Plays per day", type: "number" },
  {
    key: "status",
    label: "Status",
    type: "select",
    defaultValue: "running",
    options: [
      { value: "running", label: "Running" },
      { value: "scheduled", label: "Scheduled" },
      { value: "ended", label: "Ended" },
    ],
  },
];

/* ---------------- Budget ---------------- */

export const budgetColumns: Column[] = [
  { key: "name", label: "Budget line" },
  { key: "category", label: "Category" },
  { key: "period", label: "Period", render: (r) => monthLabel(r["period"]) },
  {
    key: "allocated",
    label: "Allocated",
    align: "right",
    render: (r) => currency(r["allocated"], r["currency"]),
  },
  { key: "currency", label: "Currency" },
];

export const budgetFields = (scope: string): Field[] => [
  { key: "name", label: "Budget name", required: true },
  {
    key: "scope",
    label: "Scope",
    type: "select",
    defaultValue: scope,
    options: [
      { value: "local", label: "Local" },
      { value: "international", label: "International" },
    ],
  },
  {
    key: "category",
    label: "Category",
    type: "select",
    defaultValue: "Influencer",
    options: [
      { value: "Influencer", label: "Influencer" },
      { value: "Billboard", label: "Billboard" },
      { value: "LCD", label: "LCD" },
      { value: "Other", label: "Other" },
    ],
  },
  { key: "period", label: "Period (month)", type: "date", required: true },
  { key: "allocated", label: "Allocated amount", type: "number" },
  { key: "currency", label: "Currency", defaultValue: "USD" },
  { key: "notes", label: "Notes", type: "textarea" },
];

export const expenseColumns = (names: Record<string, string>): Column[] => [
  { key: "description", label: "Description" },
  { key: "budget_id", label: "Budget", render: (r) => names[r["budget_id"]] ?? "Unassigned" },
  { key: "category", label: "Category" },
  { key: "vendor", label: "Vendor" },
  { key: "expense_date", label: "Date", render: (r) => formatDate(r["expense_date"]) },
  { key: "amount", label: "Amount", align: "right", render: (r) => currency(r["amount"]) },
];

export const expenseFields = (options: Array<{ value: string; label: string }>): Field[] => [
  { key: "description", label: "Description", required: true },
  { key: "budget_id", label: "Budget line", type: "select", options },
  { key: "category", label: "Category" },
  { key: "vendor", label: "Vendor" },
  { key: "amount", label: "Amount", type: "number" },
  { key: "expense_date", label: "Expense date", type: "date" },
];

/* ---------------- Payments ---------------- */

export const paymentColumns: Column[] = [
  {
    key: "payee",
    label: "Payee",
    render: (r) => (
      <div>
        <p className="font-medium">{r["payee"]}</p>
        <p className="text-xs capitalize text-muted-foreground">{r["category"]}</p>
      </div>
    ),
  },
  { key: "invoice_number", label: "Invoice" },
  { key: "due_date", label: "Due", render: (r) => formatDate(r["due_date"]) },
  { key: "paid_date", label: "Paid", render: (r) => formatDate(r["paid_date"]) },
  { key: "method", label: "Method", render: (r) => String(r["method"] ?? "—").replace(/_/g, " ") },
  {
    key: "amount",
    label: "Amount",
    align: "right",
    render: (r) => currency(r["amount"], r["currency"]),
  },
  { key: "status", label: "Status", render: (r) => <StatusBadge value={r["status"]} /> },
];

export const paymentFields = (category?: string): Field[] => [
  { key: "payee", label: "Payee", required: true },
  {
    key: "category",
    label: "Category",
    type: "select",
    defaultValue: category ?? "influencer",
    options: [
      { value: "influencer", label: "Influencer" },
      { value: "billboard", label: "Billboard" },
      { value: "lcd", label: "LCD screen" },
      { value: "other", label: "Other" },
    ],
  },
  { key: "amount", label: "Amount", type: "number" },
  { key: "currency", label: "Currency", defaultValue: "USD" },
  { key: "invoice_number", label: "Invoice number" },
  { key: "due_date", label: "Due date", type: "date" },
  { key: "paid_date", label: "Paid date", type: "date" },
  {
    key: "method",
    label: "Method",
    type: "select",
    defaultValue: "bank_transfer",
    options: [
      { value: "bank_transfer", label: "Bank transfer" },
      { value: "cheque", label: "Cheque" },
      { value: "card", label: "Card" },
      { value: "cash", label: "Cash" },
    ],
  },
  {
    key: "status",
    label: "Status",
    type: "select",
    defaultValue: "pending",
    options: [
      { value: "pending", label: "Pending" },
      { value: "approved", label: "Approved" },
      { value: "paid", label: "Paid" },
    ],
  },
  { key: "notes", label: "Notes", type: "textarea" },
];
