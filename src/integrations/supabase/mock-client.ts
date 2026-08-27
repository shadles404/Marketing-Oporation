// Mock Supabase client with in-memory / local storage support for AI Studio preview
import {
  ROLE_PRESETS,
  getAllPossiblePermissions,
  type AppUser,
  type AuditLogEntry,
} from "@/lib/rbac";

const defaultInfluencers = [
  {
    id: "11111111-1111-1111-1111-111111111101",
    name: "Layla Hassan",
    handle: "@laylastyle",
    platform: "instagram",
    category: "Fashion",
    followers: 420000,
    contact_email: "layla@agency.com",
    country: "UAE",
    rate: 3500,
    status: "active",
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: "11111111-1111-1111-1111-111111111102",
    name: "Omar Nasser",
    handle: "@omareats",
    platform: "tiktok",
    category: "Food",
    followers: 780000,
    contact_email: "omar@creators.io",
    country: "UAE",
    rate: 5200,
    status: "active",
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
  {
    id: "11111111-1111-1111-1111-111111111103",
    name: "Sara Kim",
    handle: "@sarafit",
    platform: "youtube",
    category: "Fitness",
    followers: 260000,
    contact_email: "sara@fitmail.com",
    country: "Singapore",
    rate: 4100,
    status: "active",
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    id: "11111111-1111-1111-1111-111111111104",
    name: "Marco Rossi",
    handle: "@marcodrive",
    platform: "instagram",
    category: "Automotive",
    followers: 150000,
    contact_email: "marco@rossi.it",
    country: "Italy",
    rate: 2800,
    status: "paused",
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  {
    id: "11111111-1111-1111-1111-111111111105",
    name: "Aisha Rahman",
    handle: "@aishabeauty",
    platform: "tiktok",
    category: "Beauty",
    followers: 930000,
    contact_email: "aisha@glow.co",
    country: "UAE",
    rate: 6400,
    status: "active",
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
];

const today = new Date().toISOString().split("T")[0]!;
const currentMonth = today.slice(0, 7) + "-01";

const defaultTargets = [
  {
    id: "t1",
    influencer_id: "11111111-1111-1111-1111-111111111101",
    period: currentMonth,
    target_posts: 8,
    achieved_posts: 6,
    target_reach: 900000,
    achieved_reach: 740000,
    created_at: new Date().toISOString(),
  },
  {
    id: "t2",
    influencer_id: "11111111-1111-1111-1111-111111111102",
    period: currentMonth,
    target_posts: 6,
    achieved_posts: 6,
    target_reach: 1500000,
    achieved_reach: 1720000,
    created_at: new Date().toISOString(),
  },
  {
    id: "t3",
    influencer_id: "11111111-1111-1111-1111-111111111103",
    period: currentMonth,
    target_posts: 4,
    achieved_posts: 2,
    target_reach: 500000,
    achieved_reach: 240000,
    created_at: new Date().toISOString(),
  },
  {
    id: "t4",
    influencer_id: "11111111-1111-1111-1111-111111111105",
    period: currentMonth,
    target_posts: 10,
    achieved_posts: 9,
    target_reach: 2000000,
    achieved_reach: 2450000,
    created_at: new Date().toISOString(),
  },
];

const defaultDeliveries = [
  {
    id: "d1",
    influencer_id: "11111111-1111-1111-1111-111111111101",
    content_type: "reel",
    title: "Spring capsule haul",
    content_url: "https://instagram.com/p/spring1",
    delivery_date: today,
    views: 182000,
    engagement: 9400,
    status: "delivered",
    created_at: new Date().toISOString(),
  },
  {
    id: "d2",
    influencer_id: "11111111-1111-1111-1111-111111111102",
    content_type: "video",
    title: "Street food tour ep.4",
    content_url: "https://tiktok.com/@omareats/1",
    delivery_date: today,
    views: 640000,
    engagement: 51000,
    status: "delivered",
    created_at: new Date().toISOString(),
  },
  {
    id: "d3",
    influencer_id: "11111111-1111-1111-1111-111111111103",
    content_type: "video",
    title: "30 day challenge intro",
    content_url: "https://youtube.com/watch?v=abc",
    delivery_date: today,
    views: 96000,
    engagement: 5100,
    status: "pending_review",
    created_at: new Date().toISOString(),
  },
  {
    id: "d4",
    influencer_id: "11111111-1111-1111-1111-111111111105",
    content_type: "story",
    title: "Glow routine takeover",
    content_url: "https://tiktok.com/@aishabeauty/2",
    delivery_date: today,
    views: 410000,
    engagement: 33000,
    status: "delivered",
    created_at: new Date().toISOString(),
  },
  {
    id: "d5",
    influencer_id: "11111111-1111-1111-1111-111111111105",
    content_type: "post",
    title: "Summer product drop",
    content_url: "https://tiktok.com/@aishabeauty/3",
    delivery_date: today,
    views: 288000,
    engagement: 20500,
    status: "delivered",
    created_at: new Date().toISOString(),
  },
];

const defaultBillboards = [
  {
    id: "22222222-2222-2222-2222-222222222201",
    name: "SZR Gateway",
    location: "Sheikh Zayed Rd, Exit 41",
    city: "Dubai",
    size: "12x6m",
    vendor: "BrightMedia",
    monthly_rate: 48000,
    start_date: "2026-01-01",
    end_date: "2026-12-31",
    status: "active",
    created_at: new Date().toISOString(),
  },
  {
    id: "22222222-2222-2222-2222-222222222202",
    name: "Airport Approach",
    location: "Terminal 3 Access Rd",
    city: "Dubai",
    size: "9x4m",
    vendor: "SkyAds",
    monthly_rate: 32000,
    start_date: "2025-06-01",
    end_date: "2026-01-01",
    status: "expired",
    created_at: new Date().toISOString(),
  },
  {
    id: "22222222-2222-2222-2222-222222222203",
    name: "Corniche East",
    location: "Corniche Rd East",
    city: "Abu Dhabi",
    size: "15x5m",
    vendor: "BrightMedia",
    monthly_rate: 54000,
    start_date: "2026-03-01",
    end_date: "2026-10-31",
    status: "active",
    created_at: new Date().toISOString(),
  },
  {
    id: "22222222-2222-2222-2222-222222222204",
    name: "Ring Road North",
    location: "Ring Rd, Sector 7",
    city: "Riyadh",
    size: "10x5m",
    vendor: "Najd Outdoor",
    monthly_rate: 29000,
    start_date: "2025-01-01",
    end_date: "2025-12-31",
    status: "expired",
    created_at: new Date().toISOString(),
  },
];

const defaultScreens = [
  {
    id: "33333333-3333-3333-3333-333333333301",
    name: "Mall Atrium LED",
    location: "Dubai Mall, Atrium",
    city: "Dubai",
    resolution: "3840x2160",
    vendor: "ScreenWorks",
    monthly_rate: 26000,
    slot_seconds: 15,
    start_date: "2026-01-01",
    end_date: "2026-12-31",
    status: "active",
    created_at: new Date().toISOString(),
  },
  {
    id: "33333333-3333-3333-3333-333333333302",
    name: "Metro Concourse",
    location: "Union Metro Station",
    city: "Dubai",
    resolution: "1920x1080",
    vendor: "TransitVision",
    monthly_rate: 14500,
    slot_seconds: 10,
    start_date: "2026-01-01",
    end_date: "2026-12-31",
    status: "active",
    created_at: new Date().toISOString(),
  },
  {
    id: "33333333-3333-3333-3333-333333333303",
    name: "Marina Tower LCD",
    location: "Marina Walk Tower B",
    city: "Dubai",
    resolution: "2560x1440",
    vendor: "ScreenWorks",
    monthly_rate: 18000,
    slot_seconds: 20,
    start_date: "2025-01-01",
    end_date: "2025-12-31",
    status: "expired",
    created_at: new Date().toISOString(),
  },
];

const defaultVideos = [
  {
    id: "v1",
    screen_id: "33333333-3333-3333-3333-333333333301",
    title: "Summer Campaign 15s",
    duration_seconds: 15,
    start_date: "2026-06-01",
    end_date: "2026-09-01",
    daily_plays: 240,
    status: "running",
    created_at: new Date().toISOString(),
  },
  {
    id: "v2",
    screen_id: "33333333-3333-3333-3333-333333333301",
    title: "Brand Anthem 30s",
    duration_seconds: 30,
    start_date: "2026-06-01",
    end_date: "2026-10-01",
    daily_plays: 120,
    status: "running",
    created_at: new Date().toISOString(),
  },
  {
    id: "v3",
    screen_id: "33333333-3333-3333-3333-333333333302",
    title: "Commuter Promo 10s",
    duration_seconds: 10,
    start_date: "2026-01-01",
    end_date: "2026-04-01",
    daily_plays: 380,
    status: "ended",
    created_at: new Date().toISOString(),
  },
  {
    id: "v4",
    screen_id: "33333333-3333-3333-3333-333333333302",
    title: "Ramadan Special 20s",
    duration_seconds: 20,
    start_date: "2026-03-01",
    end_date: "2026-04-15",
    daily_plays: 200,
    status: "scheduled",
    created_at: new Date().toISOString(),
  },
];

const defaultBudgets = [
  {
    id: "44444444-4444-4444-4444-444444444401",
    name: "Local Influencers Q3",
    scope: "local",
    category: "Influencer",
    period: currentMonth,
    allocated: 180000,
    currency: "USD",
    created_at: new Date().toISOString(),
  },
  {
    id: "44444444-4444-4444-4444-444444444402",
    name: "Local OOH Q3",
    scope: "local",
    category: "Billboard",
    period: currentMonth,
    allocated: 260000,
    currency: "USD",
    created_at: new Date().toISOString(),
  },
  {
    id: "44444444-4444-4444-4444-444444444403",
    name: "International Digital",
    scope: "international",
    category: "LCD",
    period: currentMonth,
    allocated: 140000,
    currency: "USD",
    created_at: new Date().toISOString(),
  },
  {
    id: "44444444-4444-4444-4444-444444444404",
    name: "International Influencers",
    scope: "international",
    category: "Influencer",
    period: currentMonth,
    allocated: 95000,
    currency: "USD",
    created_at: new Date().toISOString(),
  },
];

const defaultExpenses = [
  {
    id: "e1",
    budget_id: "44444444-4444-4444-4444-444444444401",
    description: "Layla Hassan April package",
    category: "Influencer",
    amount: 3500,
    expense_date: today,
    vendor: "Layla Hassan",
    created_at: new Date().toISOString(),
  },
  {
    id: "e2",
    budget_id: "44444444-4444-4444-4444-444444444401",
    description: "Aisha Rahman takeover",
    category: "Influencer",
    amount: 6400,
    expense_date: today,
    vendor: "Aisha Rahman",
    created_at: new Date().toISOString(),
  },
  {
    id: "e3",
    budget_id: "44444444-4444-4444-4444-444444444402",
    description: "SZR Gateway monthly",
    category: "Billboard",
    amount: 48000,
    expense_date: today,
    vendor: "BrightMedia",
    created_at: new Date().toISOString(),
  },
  {
    id: "e4",
    budget_id: "44444444-4444-4444-4444-444444444402",
    description: "Corniche East install",
    category: "Billboard",
    amount: 12000,
    expense_date: today,
    vendor: "BrightMedia",
    created_at: new Date().toISOString(),
  },
  {
    id: "e5",
    budget_id: "44444444-4444-4444-4444-444444444403",
    description: "Mall Atrium LED monthly",
    category: "LCD",
    amount: 26000,
    expense_date: today,
    vendor: "ScreenWorks",
    created_at: new Date().toISOString(),
  },
  {
    id: "e6",
    budget_id: "44444444-4444-4444-4444-444444444404",
    description: "Marco Rossi production",
    category: "Influencer",
    amount: 2800,
    expense_date: today,
    vendor: "Marco Rossi",
    created_at: new Date().toISOString(),
  },
];

const defaultPayments = [
  {
    id: "p1",
    category: "influencer",
    payee: "Layla Hassan",
    influencer_id: "11111111-1111-1111-1111-111111111101",
    amount: 3500,
    currency: "USD",
    invoice_number: "INV-1041",
    due_date: "2026-09-01",
    paid_date: null,
    method: "bank_transfer",
    status: "pending",
    created_at: new Date().toISOString(),
  },
  {
    id: "p2",
    category: "influencer",
    payee: "Aisha Rahman",
    influencer_id: "11111111-1111-1111-1111-111111111105",
    amount: 6400,
    currency: "USD",
    invoice_number: "INV-1042",
    due_date: "2026-09-05",
    paid_date: null,
    method: "bank_transfer",
    status: "approved",
    created_at: new Date().toISOString(),
  },
  {
    id: "p3",
    category: "influencer",
    payee: "Omar Nasser",
    influencer_id: "11111111-1111-1111-1111-111111111102",
    amount: 5200,
    currency: "USD",
    invoice_number: "INV-1030",
    due_date: "2026-08-15",
    paid_date: "2026-08-18",
    method: "bank_transfer",
    status: "paid",
    created_at: new Date().toISOString(),
  },
  {
    id: "p4",
    category: "billboard",
    payee: "BrightMedia",
    billboard_id: "22222222-2222-2222-2222-222222222201",
    amount: 48000,
    currency: "USD",
    invoice_number: "BM-2211",
    due_date: "2026-09-10",
    paid_date: null,
    method: "bank_transfer",
    status: "approved",
    created_at: new Date().toISOString(),
  },
  {
    id: "p5",
    category: "billboard",
    payee: "BrightMedia",
    billboard_id: "22222222-2222-2222-2222-222222222203",
    amount: 54000,
    currency: "USD",
    invoice_number: "BM-2212",
    due_date: "2026-09-20",
    paid_date: null,
    method: "bank_transfer",
    status: "pending",
    created_at: new Date().toISOString(),
  },
  {
    id: "p6",
    category: "billboard",
    payee: "SkyAds",
    billboard_id: "22222222-2222-2222-2222-222222222202",
    amount: 32000,
    currency: "USD",
    invoice_number: "SA-9087",
    due_date: "2026-07-20",
    paid_date: "2026-07-25",
    method: "cheque",
    status: "paid",
    created_at: new Date().toISOString(),
  },
  {
    id: "p7",
    category: "lcd",
    payee: "ScreenWorks",
    screen_id: "33333333-3333-3333-3333-333333333301",
    amount: 26000,
    currency: "USD",
    invoice_number: "SW-5501",
    due_date: "2026-09-08",
    paid_date: null,
    method: "bank_transfer",
    status: "pending",
    created_at: new Date().toISOString(),
  },
  {
    id: "p8",
    category: "lcd",
    payee: "TransitVision",
    screen_id: "33333333-3333-3333-3333-333333333302",
    amount: 14500,
    currency: "USD",
    invoice_number: "TV-3320",
    due_date: "2026-08-10",
    paid_date: "2026-08-12",
    method: "bank_transfer",
    status: "paid",
    created_at: new Date().toISOString(),
  },
  {
    id: "p9",
    category: "other",
    payee: "Creative Studio LLC",
    amount: 9800,
    currency: "USD",
    invoice_number: "CS-118",
    due_date: "2026-09-15",
    paid_date: null,
    method: "bank_transfer",
    status: "pending",
    created_at: new Date().toISOString(),
  },
];

// Seed RBAC Users
const superAdminRole = ROLE_PRESETS.find((r) => r.id === "Super Admin")!;
const financeRole = ROLE_PRESETS.find((r) => r.id === "Finance Officer")!;
const influencerRole = ROLE_PRESETS.find((r) => r.id === "Influencer Coordinator")!;
const mediaRole = ROLE_PRESETS.find((r) => r.id === "Outdoor Media Buyer")!;
const auditorRole = ROLE_PRESETS.find((r) => r.id === "Auditor (Read-Only)")!;

const defaultUsers: AppUser[] = [
  {
    id: "u-001",
    full_name: "System Admin",
    username: "admin",
    email: "admin@marketing-ops.com",
    phone: "+971 50 123 4567",
    password: "Password123!",
    avatar_url:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    role_name: "Super Admin",
    is_primary_admin: true,
    status: "active",
    permissions: superAdminRole.getPermissions(),
    last_login_at: new Date().toISOString(),
    created_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "u-002",
    full_name: "Sarah Jenkins",
    username: "sjenkins",
    email: "sarah.finance@marketing-ops.com",
    phone: "+971 55 987 6543",
    password: "Password123!",
    avatar_url:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    role_name: "Finance Officer",
    is_primary_admin: false,
    status: "active",
    permissions: financeRole.getPermissions(),
    last_login_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    created_at: "2026-01-15T09:30:00.000Z",
  },
  {
    id: "u-003",
    full_name: "Karim Tarek",
    username: "karimt",
    email: "karim.creators@marketing-ops.com",
    phone: "+971 52 456 7890",
    password: "Password123!",
    avatar_url:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    role_name: "Influencer Coordinator",
    is_primary_admin: false,
    status: "active",
    permissions: influencerRole.getPermissions(),
    last_login_at: new Date(Date.now() - 5 * 3600000).toISOString(),
    created_at: "2026-02-01T11:00:00.000Z",
  },
  {
    id: "u-004",
    full_name: "Elena Rostova",
    username: "erostova",
    email: "elena.media@marketing-ops.com",
    phone: "+971 58 333 4444",
    password: "Password123!",
    avatar_url:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    role_name: "Outdoor Media Buyer",
    is_primary_admin: false,
    status: "active",
    permissions: mediaRole.getPermissions(),
    last_login_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    created_at: "2026-02-10T14:15:00.000Z",
  },
  {
    id: "u-005",
    full_name: "David Chen",
    username: "dchen",
    email: "david.auditor@marketing-ops.com",
    phone: "+971 54 222 1111",
    password: "Password123!",
    avatar_url:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    role_name: "Auditor (Read-Only)",
    is_primary_admin: false,
    status: "active",
    permissions: auditorRole.getPermissions(),
    last_login_at: new Date(Date.now() - 48 * 3600000).toISOString(),
    created_at: "2026-03-01T08:00:00.000Z",
  },
  {
    id: "u-006",
    full_name: "Tariq Qasim",
    username: "tariqq",
    email: "tariq.paused@marketing-ops.com",
    phone: "+971 50 777 8888",
    password: "Password123!",
    avatar_url:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    role_name: "Custom",
    is_primary_admin: false,
    status: "inactive",
    permissions: { "dashboard:view": true },
    last_login_at: null,
    created_at: "2026-03-10T16:20:00.000Z",
  },
];

// Seed Audit Logs
const defaultAuditLogs: AuditLogEntry[] = [
  {
    id: "log-1",
    user_id: "u-002",
    user_name: "Sarah Jenkins",
    user_email: "sarah.finance@marketing-ops.com",
    action: "APPROVE",
    module: "Payments",
    record_id: "p2",
    record_title: "INV-1042",
    details: "Approved payment PAY-0042 — $6,400 for Aisha Rahman (TikTok Glow Takeover)",
    previous_value: { status: "pending" },
    new_value: { status: "approved" },
    ip_address: "192.168.1.45",
    device: "Chrome 128 / macOS",
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: "log-2",
    user_id: "u-003",
    user_name: "Karim Tarek",
    user_email: "karim.creators@marketing-ops.com",
    action: "UPDATE",
    module: "Influencers",
    record_id: "11111111-1111-1111-1111-111111111101",
    record_title: "Layla Hassan",
    details: "Updated influencer 'Layla Hassan' — Monthly target changed from 6 to 8 posts",
    previous_value: { target_videos_month: 6 },
    new_value: { target_videos_month: 8 },
    ip_address: "192.168.1.82",
    device: "Safari 18 / iOS",
    created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
  },
  {
    id: "log-3",
    user_id: "u-001",
    user_name: "System Admin",
    user_email: "admin@marketing-ops.com",
    action: "PERMISSION_CHANGE",
    module: "Users & Roles",
    record_id: "u-003",
    record_title: "Karim Tarek",
    details:
      "Modified granular permissions for 'Karim Tarek' — Enabled influencer_deliveries:export",
    previous_value: { "influencer_deliveries:export": false },
    new_value: { "influencer_deliveries:export": true },
    ip_address: "10.0.0.1",
    device: "Chrome 128 / Windows",
    created_at: new Date(Date.now() - 12 * 3600000).toISOString(),
  },
  {
    id: "log-4",
    user_id: "u-004",
    user_name: "Elena Rostova",
    user_email: "elena.media@marketing-ops.com",
    action: "UPDATE",
    module: "Billboards",
    record_id: "22222222-2222-2222-2222-222222222201",
    record_title: "SZR Gateway",
    details: "Renewed billboard rental rate for 'SZR Gateway' — Monthly rate set to $48,000",
    previous_value: { monthly_rate: 45000 },
    new_value: { monthly_rate: 48000 },
    ip_address: "192.168.1.99",
    device: "Firefox 130 / macOS",
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
  {
    id: "log-5",
    user_id: "u-002",
    user_name: "Sarah Jenkins",
    user_email: "sarah.finance@marketing-ops.com",
    action: "EXPORT",
    module: "Payments",
    record_id: null,
    record_title: "All Payments",
    details: "Exported Full Payments Ledger CSV (9 records) for financial audit",
    ip_address: "192.168.1.45",
    device: "Chrome 128 / macOS",
    created_at: new Date(Date.now() - 36 * 3600000).toISOString(),
  },
  {
    id: "log-6",
    user_id: "u-001",
    user_name: "System Admin",
    user_email: "admin@marketing-ops.com",
    action: "STATUS_CHANGE",
    module: "Users & Roles",
    record_id: "u-006",
    record_title: "Tariq Qasim",
    details: "Deactivated sub-user account 'Tariq Qasim'",
    previous_value: { status: "active" },
    new_value: { status: "inactive" },
    ip_address: "10.0.0.1",
    device: "Chrome 128 / Windows",
    created_at: new Date(Date.now() - 48 * 3600000).toISOString(),
  },
];

const initialStores: Record<string, any[]> = {
  influencers: defaultInfluencers,
  influencer_targets: defaultTargets,
  influencer_deliveries: defaultDeliveries,
  billboards: defaultBillboards,
  lcd_screens: defaultScreens,
  lcd_videos: defaultVideos,
  budgets: defaultBudgets,
  expenses: defaultExpenses,
  payments: defaultPayments,
  users: defaultUsers,
  audit_logs: defaultAuditLogs,
  profiles: [],
};

export function getStorageStore(table: string): any[] {
  if (typeof window === "undefined") {
    return initialStores[table] ?? [];
  }
  const key = `mock_db_${table}`;
  const stored = localStorage.getItem(key);
  if (!stored) {
    const data = initialStores[table] ?? [];
    localStorage.setItem(key, JSON.stringify(data));
    return data;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return initialStores[table] ?? [];
  }
}

export function setStorageStore(table: string, data: any[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(`mock_db_${table}`, JSON.stringify(data));
  } else {
    initialStores[table] = data;
  }
}

export function getCurrentUser(): AppUser {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("mock_auth_user");
    if (stored) {
      try {
        const u = JSON.parse(stored);
        // Refresh with latest permissions and status from users table
        const allUsers = getStorageStore("users") as AppUser[];
        const fresh = allUsers.find(
          (x) =>
            (u.id && x.id === u.id) ||
            (u.email && x.email?.toLowerCase() === u.email?.toLowerCase()) ||
            (u.username && x.username?.toLowerCase() === u.username?.toLowerCase()),
        );
        if (fresh) return fresh;
        return u;
      } catch {
        // fallback
      }
    }
  }
  return defaultUsers[0]!;
}

export function getAuthenticatedUser(): AppUser | null {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("mock_auth_user");
    if (stored) {
      try {
        const u = JSON.parse(stored);
        const allUsers = getStorageStore("users") as AppUser[];
        const fresh = allUsers.find(
          (x) =>
            (u.id && x.id === u.id) ||
            (u.email && x.email?.toLowerCase() === u.email?.toLowerCase()) ||
            (u.username && x.username?.toLowerCase() === u.username?.toLowerCase()),
        );
        if (fresh) {
          if (fresh.status !== "active") {
            localStorage.removeItem("mock_auth_user");
            return null;
          }
          return fresh;
        }
        return u;
      } catch {
        return null;
      }
    }
    return null;
  }
  return defaultUsers[0]!;
}

export function setCurrentUser(user: AppUser | null) {
  if (typeof window !== "undefined") {
    if (user) {
      localStorage.setItem("mock_auth_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("mock_auth_user");
    }
  }
}

export function formatAppUserToSupabaseUser(user: AppUser) {
  return {
    id: user.id,
    email: user.email,
    user_metadata: {
      full_name: user.full_name,
      username: user.username,
      role_name: user.role_name,
      is_primary_admin: Boolean(user.is_primary_admin),
      permissions: user.permissions || {},
      status: user.status || "active",
      avatar_url: user.avatar_url,
      phone: user.phone,
    },
    app_metadata: {},
    aud: "authenticated",
    created_at: user.created_at || new Date().toISOString(),
  };
}

export function recordAuditLog(entry: Omit<AuditLogEntry, "id" | "created_at">) {
  const log: AuditLogEntry = {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    created_at: new Date().toISOString(),
    ...entry,
  };
  const logs = getStorageStore("audit_logs");
  logs.unshift(log);
  setStorageStore("audit_logs", logs);
}

export function createMockSupabase() {
  const auth = {
    getUser: async () => {
      const user = getAuthenticatedUser();
      if (!user) {
        return { data: { user: null }, error: null };
      }
      return {
        data: {
          user: formatAppUserToSupabaseUser(user),
        },
        error: null,
      };
    },
    getSession: async () => {
      const user = getAuthenticatedUser();
      if (!user) {
        return { data: { session: null }, error: null };
      }
      return {
        data: {
          session: {
            access_token: `mock-token-${user.id}`,
            token_type: "bearer",
            user: formatAppUserToSupabaseUser(user) as any,
          },
        },
        error: null,
      };
    },
    signInWithPassword: async ({ email, password }: { email: string; password?: string }) => {
      const allUsers = getStorageStore("users") as AppUser[];
      const query = (email || "").trim().toLowerCase();
      const enteredPassword = (password || "").trim();

      if (!query) {
        // Fall back to primary admin if no query given
        const adminUser =
          allUsers.find((u) => u.is_primary_admin || u.username === "admin") || allUsers[0]!;
        setCurrentUser(adminUser);
        const formattedUser = formatAppUserToSupabaseUser(adminUser);
        return {
          data: {
            user: formattedUser,
            session: {
              access_token: `mock-token-${adminUser.id}`,
              token_type: "bearer",
              user: formattedUser as any,
            },
          },
          error: null,
        };
      }

      let userMatch = allUsers.find(
        (u) =>
          u.email?.toLowerCase() === query ||
          u.username?.toLowerCase() === query ||
          (u.email && u.email.toLowerCase().startsWith(query)),
      );

      if (!userMatch) {
        // Auto-provision user if not found in default seed list
        const superAdminRole = ROLE_PRESETS.find((r) => r.id === "Super Admin") || ROLE_PRESETS[0]!;
        userMatch = {
          id: `u-${Date.now()}`,
          email: query.includes("@") ? query : `${query}@marketing-ops.com`,
          username: query.split("@")[0] || query,
          password: enteredPassword || "Password123!",
          full_name: (query.split("@")[0] || "Workspace User")
            .split(".")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" "),
          role_name: "Super Admin",
          is_primary_admin: true,
          status: "active",
          permissions: superAdminRole.getPermissions(),
          created_at: new Date().toISOString(),
          last_login_at: new Date().toISOString(),
        };
        allUsers.push(userMatch);
      }

      if (userMatch.status !== "active") {
        userMatch.status = "active";
      }

      // Update password if new one provided
      if (enteredPassword && userMatch.password !== enteredPassword) {
        userMatch.password = enteredPassword;
      }

      // Update last_login_at
      userMatch.last_login_at = new Date().toISOString();
      setStorageStore("users", allUsers);
      setCurrentUser(userMatch);

      // Record audit log
      recordAuditLog({
        user_id: userMatch.id,
        user_name: userMatch.full_name,
        user_email: userMatch.email,
        action: "LOGIN",
        module: "Auth",
        record_id: userMatch.id,
        record_title: userMatch.full_name,
        details: `Sub-user '${userMatch.full_name}' (${userMatch.role_name}) signed in successfully`,
        ip_address: "192.168.1.10",
        device: typeof navigator !== "undefined" ? navigator.userAgent : "Web Browser",
      });

      const formattedUser = formatAppUserToSupabaseUser(userMatch);

      return {
        data: {
          user: formattedUser,
          session: {
            access_token: `mock-token-${userMatch.id}`,
            token_type: "bearer",
            user: formattedUser as any,
          },
        },
        error: null,
      };
    },
    signUp: async ({
      email,
      password,
      options,
    }: {
      email: string;
      password?: string;
      options?: any;
    }) => {
      const allUsers = getStorageStore("users") as AppUser[];
      const defaultRole = ROLE_PRESETS.find((r) => r.id === "Influencer Coordinator")!;
      const newUser: AppUser = {
        id: `u-${Date.now()}`,
        email: email.trim().toLowerCase(),
        username: email.split("@")[0] || `user_${Date.now()}`,
        password: password || "Password123!",
        full_name: options?.data?.full_name ?? "New Team Member",
        role_name: defaultRole.name,
        is_primary_admin: false,
        status: "active",
        permissions: defaultRole.getPermissions(),
        created_at: new Date().toISOString(),
        last_login_at: new Date().toISOString(),
      };
      allUsers.push(newUser);
      setStorageStore("users", allUsers);
      setCurrentUser(newUser);

      const formattedUser = formatAppUserToSupabaseUser(newUser);

      return {
        data: {
          user: formattedUser,
          session: {
            access_token: `mock-token-${newUser.id}`,
            token_type: "bearer",
            user: formattedUser as any,
          },
        },
        error: null,
      };
    },
    signOut: async () => {
      const user = getAuthenticatedUser();
      if (user) {
        recordAuditLog({
          user_id: user.id,
          user_name: user.full_name,
          user_email: user.email,
          action: "LOGOUT",
          module: "Auth",
          record_id: user.id,
          record_title: user.full_name,
          details: `User '${user.full_name}' logged out`,
          ip_address: "192.168.1.10",
          device: typeof navigator !== "undefined" ? navigator.userAgent : "Web Browser",
        });
      }
      setCurrentUser(null);
      return { error: null };
    },
    setSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: (callback?: (event: string, session: any) => void) => {
      return {
        data: { subscription: { unsubscribe: () => {} } },
      };
    },
  };

  return {
    auth,
    from: (table: string) => {
      const filters: Array<(row: any) => boolean> = [];
      let orderCol: string | null = null;
      let orderAsc = false;
      let pendingInsert: any = null;
      let pendingUpdate: any = null;
      let isDelete = false;
      let limitCount: number | null = null;
      let isSingle = false;
      let isMaybeSingle = false;

      const builder: any = {
        select: (_columns = "*") => builder,
        eq: (col: string, val: any) => {
          filters.push((r) => String(r[col]) === String(val));
          return builder;
        },
        neq: (col: string, val: any) => {
          filters.push((r) => String(r[col]) !== String(val));
          return builder;
        },
        in: (col: string, vals: any[]) => {
          filters.push((r) => vals.map(String).includes(String(r[col])));
          return builder;
        },
        gt: (col: string, val: any) => {
          filters.push((r) => Number(r[col]) > Number(val));
          return builder;
        },
        gte: (col: string, val: any) => {
          filters.push((r) => Number(r[col]) >= Number(val));
          return builder;
        },
        lt: (col: string, val: any) => {
          filters.push((r) => Number(r[col]) < Number(val));
          return builder;
        },
        lte: (col: string, val: any) => {
          filters.push((r) => Number(r[col]) <= Number(val));
          return builder;
        },
        limit: (n: number) => {
          limitCount = n;
          return builder;
        },
        single: () => {
          isSingle = true;
          return builder;
        },
        maybeSingle: () => {
          isMaybeSingle = true;
          return builder;
        },
        is: (col: string, val: any) => {
          filters.push((r) => r[col] === val);
          return builder;
        },
        like: (col: string, val: string) => {
          const pattern = val.replace(/%/g, ".*");
          const regex = new RegExp(`^${pattern}$`);
          filters.push((r) => regex.test(String(r[col] ?? "")));
          return builder;
        },
        ilike: (col: string, val: string) => {
          const pattern = val.replace(/%/g, ".*");
          const regex = new RegExp(`^${pattern}$`, "i");
          filters.push((r) => regex.test(String(r[col] ?? "")));
          return builder;
        },
        order: (col: string, opts: { ascending?: boolean } = {}) => {
          orderCol = col;
          orderAsc = opts.ascending ?? false;
          return builder;
        },
        insert: (values: any) => {
          pendingInsert = Array.isArray(values) ? values : [values];
          return builder;
        },
        upsert: (values: any) => {
          pendingInsert = Array.isArray(values) ? values : [values];
          return builder;
        },
        update: (values: any) => {
          pendingUpdate = values;
          return builder;
        },
        delete: () => {
          isDelete = true;
          return builder;
        },
        then: (resolve: any, reject: any) => {
          try {
            let rows = [...getStorageStore(table)];

            if (pendingInsert) {
              const inserted = pendingInsert.map((item: any) => {
                const finalId =
                  item.id ||
                  (typeof crypto !== "undefined" && crypto.randomUUID
                    ? crypto.randomUUID()
                    : `rec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`);
                const cleanItem = { ...item };
                delete cleanItem.id;
                return {
                  ...cleanItem,
                  id: finalId,
                  created_at: item.created_at || new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                };
              });

              // Check if upserting existing rows
              for (const ins of inserted) {
                const existingIdx = rows.findIndex((r) => r.id === ins.id);
                if (existingIdx >= 0) {
                  rows[existingIdx] = { ...rows[existingIdx], ...ins };
                } else {
                  rows.unshift(ins);
                }
              }

              setStorageStore(table, rows);
              return Promise.resolve({ data: inserted, error: null }).then(resolve, reject);
            }

            if (pendingUpdate) {
              let updatedCount = 0;
              rows = rows.map((r) => {
                const matches = filters.length === 0 || filters.every((fn) => fn(r));
                if (matches) {
                  updatedCount++;
                  return { ...r, ...pendingUpdate, updated_at: new Date().toISOString() };
                }
                return r;
              });
              setStorageStore(table, rows);
              return Promise.resolve({ data: rows, error: null }).then(resolve, reject);
            }

            if (isDelete) {
              rows = rows.filter((r) => !filters.every((fn) => fn(r)));
              setStorageStore(table, rows);
              return Promise.resolve({ data: null, error: null }).then(resolve, reject);
            }

            let result = rows.filter((r) => filters.every((fn) => fn(r)));
            if (orderCol) {
              result.sort((a, b) => {
                const valA = a[orderCol!];
                const valB = b[orderCol!];
                if (valA === valB) return 0;
                if (valA === undefined || valA === null) return orderAsc ? -1 : 1;
                if (valB === undefined || valB === null) return orderAsc ? 1 : -1;
                if (typeof valA === "number" && typeof valB === "number") {
                  return orderAsc ? valA - valB : valB - valA;
                }
                const strA = String(valA);
                const strB = String(valB);
                return orderAsc ? strA.localeCompare(strB) : strB.localeCompare(strA);
              });
            }
            if (limitCount !== null) {
              result = result.slice(0, limitCount);
            }
            if (isSingle || isMaybeSingle) {
              const singleItem = result[0] || null;
              return Promise.resolve({ data: singleItem, error: null }).then(resolve, reject);
            }
            return Promise.resolve({ data: result, error: null }).then(resolve, reject);
          } catch (err) {
            return Promise.resolve({ data: [], error: err }).then(resolve, reject);
          }
        },
      };

      return builder;
    },
  };
}
