import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { 
  CheckCircle2, 
  Circle, 
  ChevronDown, 
  ChevronRight, 
  Layout, 
  Server, 
  TestTube2, 
  ShieldCheck, 
  Trophy,
  Activity,
  Zap,
  Info
} from 'lucide-react';

const __firebase_config = {
  apiKey: "AIzaSyCQuhG5hhuEwK67mGgkzEBlyxNUTI6dLNQ",
  authDomain: "groove-tracker.firebaseapp.com",
  projectId: "groove-tracker",
  storageBucket: "groove-tracker.firebasestorage.app",
  messagingSenderId: "486609561559",
  appId: "1:486609561559:web:6a1f01dd720d8c7b864d92"
}

// --- Firebase Configuration ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'grove-timeline-tracker';

// --- Data Structure ---
const TIMELINE_DATA = [
  {
    week: 1,
    title: "Foundation & Multi-tenancy",
    goal: "A working tenant system where a provider can sign up, get a subdomain, add a client, and have that client accept an invite. Solid auth layer, role-routed, and plan-limited.",
    days: [
      {
        day: 1,
        title: "Project setup & architecture",
        tags: ["Django", "Docker", "React"],
        tasks: [
          { cat: "be", text: "Initialize Django project — 9 apps: tenants, accounts, clients, requests, chat, notifications, files, plans, ai" },
          { cat: "be", text: "Configure PostgreSQL database connection" },
          { cat: "be", text: "Set up Docker Compose — Django, PostgreSQL, Redis all running locally" },
          { cat: "be", text: "Install core dependencies — DRF, simplejwt, django-cors-headers, python-decouple, celery" },
          { cat: "be", text: "Create abstract TenantScopedModel with tenant FK — inherited by all future models" },
          { cat: "be", text: "Write TenantManager — overrides get_queryset() to auto-filter by current tenant on every ORM call" },
          { cat: "fe", text: "Initialize React project with Vite" },
          { cat: "fe", text: "Install React Router v6, Redux Toolkit, React Query, Axios" },
          { cat: "fe", text: "Set up folder structure — pages, components, hooks, store, api, utils" },
          { cat: "fe", text: "Configure Axios base URL and JWT interceptor — auto-attaches token, handles 401 redirects" }
        ]
      },
      {
        day: 2,
        title: "Tenant model & subdomain middleware",
        tags: ["Multi-tenancy", "Middleware"],
        tasks: [
          { cat: "be", text: "Tenant model — id, name, slug (unique), owner FK, plan (free/pro), is_active, created_at" },
          { cat: "be", text: "Write SubdomainMiddleware — extracts subdomain from every incoming request, looks up tenant by slug, attaches to request, returns 404 if not found" },
          { cat: "be", text: "Write get_current_tenant() utility — reads tenant from request context, used by TenantManager" },
          { cat: "be", text: "Register middleware in Django settings — runs on every request before any view" },
          { cat: "be", text: "Write tenant creation logic — creates slug, validates uniqueness" },
          { cat: "be", text: "Add Tenant to Django admin — list display: name, slug, plan, is_active, created_at" },
          { cat: "ts", text: "Unit test TenantManager — confirm queries are always tenant-scoped" },
          { cat: "ts", text: "Unit test SubdomainMiddleware — valid slug, invalid slug, missing slug" }
        ]
      },
      {
        day: 3,
        title: "Provider auth — signup & login",
        tags: ["JWT", "Auth"],
        tasks: [
          { cat: "be", text: "Build ProviderUser model — extends AbstractBaseUser, fields: email, business_name, logo, workspace_slug FK to Tenant, is_active, date_joined" },
          { cat: "be", text: "Provider signup API — POST /api/auth/signup/ — creates ProviderUser + Tenant in one transaction, returns JWT tokens" },
          { cat: "be", text: "Email verification — sends via Celery task, sets is_verified flag" },
          { cat: "be", text: "Provider login API — POST /api/auth/login/ — validates credentials, returns access + refresh tokens" },
          { cat: "be", text: "Token refresh API — POST /api/auth/token/refresh/" },
          { cat: "be", text: "Logout API — POST /api/auth/logout/ — blacklists token via simplejwt blacklist" },
          { cat: "fe", text: "Provider signup page — business name, email, workspace slug, password. Slug availability check on blur." },
          { cat: "fe", text: "Provider login page — email, password, remember me, forgot password link" },
          { cat: "fe", text: "JWT storage — access token in memory, refresh token in httpOnly cookie" },
          { cat: "fe", text: "Redux auth slice — stores user object, token, loading state" }
        ]
      },
      {
        day: 4,
        title: "Provider auth — password reset & route protection",
        tags: ["Auth", "Routes"],
        tasks: [
          { cat: "be", text: "Password reset request — POST /api/auth/password-reset/ — sends reset link via Celery" },
          { cat: "be", text: "Password reset confirm — POST /api/auth/password-reset/confirm/" },
          { cat: "be", text: "Provider profile update API — PATCH /api/provider/profile/ — business name, logo upload placeholder" },
          { cat: "fe", text: "Forgot password flow — email input, confirmation state, reset form" },
          { cat: "fe", text: "Protected route wrapper — redirects to login if no valid token" },
          { cat: "fe", text: "Role-aware routing — post-login redirect to /dashboard (provider) or /portal (client) based on JWT claims" },
          { cat: "fe", text: "Sidebar component — dark green #0A2E24, Grove logo, nav items, active state, provider profile footer" },
          { cat: "fe", text: "Topbar component — page title, live indicator, notification bell, action button slot" },
          { cat: "fe", text: "Provider layout wrapper — sidebar + topbar + content area" }
        ]
      },
      {
        day: 5,
        title: "Client auth & invite system",
        tags: ["Invites", "Permissions"],
        tasks: [
          { cat: "be", text: "Build ClientUser model — email, display_name, tenant FK, provider FK, is_active, joined_at" },
          { cat: "be", text: "Invite model — id, tenant FK, client_email, client_name, token (UUID), is_used, expires_at (48hr TTL), created_at" },
          { cat: "be", text: "Add client API — POST /api/clients/ — creates client + invite record, fires Celery task to send invite email" },
          { cat: "be", text: "Invite acceptance API — POST /api/auth/invite/accept/ — validates token, creates ClientUser, returns JWT" },
          { cat: "be", text: "Client login API — POST /api/auth/client-login/ — scoped to tenant subdomain" },
          { cat: "be", text: "Resend invite API — POST /api/clients/{id}/resend-invite/" },
          { cat: "fe", text: "Client invite acceptance page — centered card, provider-branded, name pre-filled, email locked, password fields" },
          { cat: "fe", text: "Invite expiry state — expired card with 'Email provider' CTA" },
          { cat: "fe", text: "Invite already used state — 'You're already set up' card with sign in CTA" },
          { cat: "fe", text: "Client login page — subdomain-aware" },
          { cat: "fe", text: "Success state — animated checkmark, 'You're in!' message, auto-redirect" }
        ]
      },
      {
        day: 6,
        title: "Role permissions & plan foundation",
        tags: ["RBAC", "Plans"],
        tasks: [
          { cat: "be", text: "Role resolution middleware — identifies Provider or Client for current tenant" },
          { cat: "be", text: "Role-based permission classes — IsProvider, IsClient, IsProviderOrClient" },
          { cat: "be", text: "Plan model — id, tenant FK, plan_type (free/pro), client_limit (3 for free), is_active" },
          { cat: "be", text: "Plan limit check utility — check_client_limit(tenant) — returns bool" },
          { cat: "be", text: "Free plan auto-assigned on tenant creation" },
          { cat: "be", text: "Client list API — GET /api/clients/ — all clients for current tenant" },
          { cat: "fe", text: "Client portal layout — topbar only, no sidebar" },
          { cat: "fe", text: "Client portal home shell — topbar with branding, hero section, notification bell" }
        ]
      },
      {
        day: 7,
        title: "Auth integration, testing & week review",
        tags: ["Testing", "Integration"],
        tasks: [
          { cat: "be", text: "Integration test — full signup → tenant creation → subdomain routing → login flow" },
          { cat: "be", text: "Integration test — client invite → acceptance → login → portal redirect" },
          { cat: "be", text: "Confirm TenantManager scopes all queries correctly end to end" },
          { cat: "be", text: "Confirm plan limit prevents adding a 4th client on free plan" },
          { cat: "ts", text: "Test all auth endpoints — signup, login, token refresh, logout, password reset" },
          { cat: "ts", text: "Test role permission classes — IsProvider, IsClient, IsProviderOrClient" },
          { cat: "ts", text: "Test invite lifecycle — create, accept, expire, resend" },
          { cat: "fe", text: "Manual walkthrough — sign up as provider, add client, accept invite, verify portals" },
          { cat: "fe", text: "Verify JWT interceptor handles token expiry and refresh correctly" },
          { cat: "fe", text: "Verify protected routes block unauthenticated access" }
        ]
      }
    ],
    checkpoint: "A provider can sign up, get a subdomain, and add a client who can then join the portal. All data is tenant-scoped.",
    modules: ["Auth & onboarding", "Client portal auth", "Client management", "Plan & billing"]
  },
  {
    week: 2,
    title: "Core Features & Request Pipeline",
    goal: "A fully functional request lifecycle. Provider and client can exchange requests — submit, track, update status, add notes, and deliver work.",
    days: [
      {
        day: 8,
        title: "Request model & core APIs",
        tags: ["Models", "APIs"],
        tasks: [
          { cat: "be", text: "Request model — id, tenant, client, title, description, status, is_urgent, due_date" },
          { cat: "be", text: "RequestActivity model — actor, event_type, description (audit log)" },
          { cat: "be", text: "Request creation API — POST /api/requests/ — client submits, creates activity entry" },
          { cat: "be", text: "Request list API — GET /api/requests/ — scoped viewing for provider and client" },
          { cat: "be", text: "Request detail API — GET /api/requests/{id}/ — full request with activities" },
          { cat: "be", text: "Request filter — by client, status, date range" },
          { cat: "fe", text: "Requests inbox page — unified list, filter bar, status pills" },
          { cat: "fe", text: "Request card component — title, client name, status, timestamp" },
          { cat: "fe", text: "Empty state — no requests yet illustration" }
        ]
      },
      {
        day: 9,
        title: "Status pipeline & activity log",
        tags: ["Pipeline", "Bulk actions"],
        tasks: [
          { cat: "be", text: "Status update API — PATCH /api/requests/{id}/status/ — validates transitions" },
          { cat: "be", text: "RequestActivity list API — GET /api/requests/{id}/activity/" },
          { cat: "be", text: "Bulk status update API — POST /api/requests/bulk-status/ — list of IDs + status" },
          { cat: "fe", text: "Request detail left column — status timeline with dots, activity log toggle" },
          { cat: "fe", text: "Status segmented control in topbar — 5 stage pills, optimistic UI update" },
          { cat: "fe", text: "Urgent/Due date badges — conditional display on request card" }
        ]
      },
      {
        day: 10,
        title: "Internal notes",
        tags: ["Notes", "Provider-only"],
        tasks: [
          { cat: "be", text: "InternalNote model — provider-only notes, never returned to client portal" },
          { cat: "be", text: "Internal note create API — POST /api/requests/{id}/notes/" },
          { cat: "be", text: "Internal note update/delete APIs" },
          { cat: "be", text: "Internal note list API — GET /api/requests/{id}/notes/ (Provider only)" },
          { cat: "fe", text: "Internal notes card — list, textarea, character count, amber styling" },
          { cat: "fe", text: "AI note variant — distinct border and icon branding" },
          { cat: "fe", text: "Request detail right column layout — chat thread + delivery placeholders" }
        ]
      },
      {
        day: 11,
        title: "Client request submission",
        tags: ["Client portal", "File upload"],
        tasks: [
          { cat: "be", text: "Install django-storages + Cloudinary/S3 SDK" },
          { cat: "be", text: "File model — request, tenant, uploaded_by, url, size, type, is_delivery" },
          { cat: "be", text: "File upload API — POST /api/files/upload/ — validates size (50MB/10MB limits)" },
          { cat: "fe", text: "Client portal submit form — title, description, file upload zone" },
          { cat: "fe", text: "Submit request modal — overlay with privacy notes" },
          { cat: "fe", text: "Success state — animated checkmark, auto-close" },
          { cat: "fe", text: "File chip component — icon, filename, upload progress, retry state" }
        ]
      },
      {
        day: 12,
        title: "File delivery",
        tags: ["Delivery", "Rework"],
        tasks: [
          { cat: "be", text: "Delivery model — request, files, links, message" },
          { cat: "be", text: "Deliver API — POST /api/requests/{id}/deliver/ — sets status to Delivered" },
          { cat: "be", text: "Delivery history API — GET /api/requests/{id}/deliveries/ (supports rework)" },
          { cat: "fe", text: "Deliver files modal — selector for Files/Link/Both, message textarea" },
          { cat: "fe", text: "Client portal request card — delivered files preview strip, green 'Ready' label" },
          { cat: "fe", text: "Download links and file type icons on delivered request cards" }
        ]
      },
      {
        day: 13,
        title: "Provider dashboard & client management",
        tags: ["Dashboard", "Client CRUD"],
        tasks: [
          { cat: "be", text: "Dashboard stats API — GET /api/provider/dashboard/ (clients, open requests, etc)" },
          { cat: "be", text: "Client detail API — lifetime stats and all requests for client" },
          { cat: "be", text: "Client update/deactivate/delete APIs (soft delete)" },
          { cat: "fe", text: "Provider dashboard — stat strip, client section, recent requests section" },
          { cat: "fe", text: "Client card component — avatar, name, business type, activity dot" },
          { cat: "fe", text: "Add client modal — email, name, invite preview strip" },
          { cat: "fe", text: "Edit client details — inline card transformation, danger zone strip" }
        ]
      },
      {
        day: 14,
        title: "Pipeline review & week integration",
        tags: ["Integration", "Testing"],
        tasks: [
          { cat: "be", text: "Integration test — full lifecycle: submit → update → note → deliver" },
          { cat: "be", text: "Test file upload limits (10MB vs 50MB)" },
          { cat: "be", text: "Test bulk status update and delivery rework cycles" },
          { cat: "ts", text: "Test all request APIs — creation, list, detail, filter" },
          { cat: "ts", text: "Test InternalNote never leaks to client-facing endpoints" },
          { cat: "fe", text: "Manual walkthrough — stage transitions and file delivery" },
          { cat: "fe", text: "Verify client isolation — never see another client's data" }
        ]
      }
    ],
    checkpoint: "Full request lifecycle from submission to delivery is functional and tested.",
    modules: ["Request management", "Client submission", "Client CRUD", "Analytics shell"]
  },
  {
    week: 3,
    title: "Real-time Layer",
    goal: "WebSocket push for status changes, messages, and notifications. Celery background processing. No manual refreshes required.",
    days: [
      {
        day: 15,
        title: "Django Channels & Redis setup",
        tags: ["ASGI", "WebSocket", "Daphne"],
        tasks: [
          { cat: "be", text: "Install channels, channels-redis, daphne" },
          { cat: "be", text: "Configure ASGI application and Redis channel layers" },
          { cat: "be", text: "Write base WebSocket consumer with JWT handshake" },
          { cat: "be", text: "Define channel groups: feed, per-request, portal" },
          { cat: "be", text: "Daphne server configuration and Docker setup" },
          { cat: "fe", text: "Write useWebSocket custom hook with exponential backoff" },
          { cat: "fe", text: "WebSocket connection manager in state (Redux/Store)" },
          { cat: "fe", text: "Live indicator pill — green pulse when connected" }
        ]
      },
      {
        day: 16,
        title: "Per-request chat",
        tags: ["Chat", "Read receipts"],
        tasks: [
          { cat: "be", text: "Message model — request, sender, role, content, read_status" },
          { cat: "be", text: "Message create API — saves and broadcasts to request group" },
          { cat: "be", text: "Message list API — interleaved with activity log events" },
          { cat: "be", text: "RequestChatConsumer — permission checks and broadcasting" },
          { cat: "fe", text: "Chat thread — bubbles, inline status events, auto-scroll" },
          { cat: "fe", text: "Chat input bar — attachment button, Shift+Enter logic" },
          { cat: "fe", text: "Closed request state — locked input with 'Reopen' link" }
        ]
      },
      {
        day: 17,
        title: "Live feed & provider notifications",
        tags: ["Notifications", "Live feed"],
        tasks: [
          { cat: "be", text: "Notification model — recipient, event_type, title, is_read" },
          { cat: "be", text: "ProviderFeedConsumer — broadcasts all workspace events" },
          { cat: "be", text: "Wire notifications to all events: requests, status, messages, invites" },
          { cat: "be", text: "Notification list and Mark Read APIs" },
          { cat: "fe", text: "Dashboard live feed — new items slide in with green highlight" },
          { cat: "fe", text: "Notification bell dropdown — unread indicators and pulses" },
          { cat: "fe", text: "Plan usage card — live progress against client limit" }
        ]
      },
      {
        day: 18,
        title: "Client portal real-time & email fallback",
        tags: ["Client WS", "Email", "Celery"],
        tasks: [
          { cat: "be", text: "ClientPortalConsumer — validates client membership before push" },
          { cat: "be", text: "Celery email tasks — status change, delivery, message, invite" },
          { cat: "be", text: "Email fallback logic: fire email only if user is offline" },
          { cat: "fe", text: "Client portal home — real-time card reordering and flashes" },
          { cat: "fe", text: "Client request detail — chat and status timeline wired to WS" },
          { cat: "fe", text: "Client notification bell wired to WebSocket" }
        ]
      },
      {
        day: 19,
        title: "Celery Beat scheduled jobs",
        tags: ["Celery Beat", "Scheduled tasks"],
        tasks: [
          { cat: "be", text: "Configure Celery Beat schedule" },
          { cat: "be", text: "Task: cleanup_expired_invites (midnight purge)" },
          { cat: "be", text: "Task: mark_inactive_clients (weekly audit)" },
          { cat: "be", text: "Task: weekly_summary_email for providers" },
          { cat: "be", text: "Redis caching for dashboard stats with invalidation logic" },
          { cat: "fe", text: "Progress summary strip updates live as status changes" }
        ]
      },
      {
        day: 20,
        title: "Activity log page",
        tags: ["Activity", "Export"],
        tasks: [
          { cat: "be", text: "Activity log API — combined view of RequestActivity + Notifications" },
          { cat: "be", text: "Activity export API — CSV generator" },
          { cat: "fe", text: "Activity page — filter by client, event type, date range" },
          { cat: "fe", text: "Event row variants — status visuals, message previews" },
          { cat: "fe", text: "Export CSV button with browser download trigger" }
        ]
      },
      {
        day: 21,
        title: "Real-time integration & week review",
        tags: ["Integration", "Testing"],
        tasks: [
          { cat: "be", text: "Integration test — dual browser status change sync" },
          { cat: "be", text: "Integration test — instant message delivery verification" },
          { cat: "be", text: "Test email fallback on WebSocket disconnection" },
          { cat: "ts", text: "Test WebSocket consumers — tenant isolation checks" },
          { cat: "fe", text: "Verify reconnection logic with exponential backoff" },
          { cat: "fe", text: "Fix real-time edge cases (concurrency, race conditions)" }
        ]
      }
    ],
    checkpoint: "Product feels 'live'. No refresh required for communication or pipeline updates.",
    modules: ["Real-time layer", "Chat system", "Notification engine", "Activity export"]
  },
  {
    week: 4,
    title: "AI Features, Admin & Polish",
    goal: "Layer AI features, build the Grove internal admin panel, enforce plan limits, and final polish for launch.",
    days: [
      {
        day: 22,
        title: "AI foundation & auto-categorisation",
        tags: ["OpenAI", "Celery"],
        tasks: [
          { cat: "be", text: "Create AIService wrapper with retries and failure logging" },
          { cat: "be", text: "Celery task: categorise_request (Design/Dev/Content/Bug)" },
          { cat: "be", text: "Categorise endpoint for synchronous preview during typing" },
          { cat: "fe", text: "AI category tags on request cards" },
          { cat: "fe", text: "Category filter pills in provider inbox" }
        ]
      },
      {
        day: 23,
        title: "Smart summary & AI triage note",
        tags: ["Summaries", "Triage"],
        tasks: [
          { cat: "be", text: "Celery task: generate_request_summary (1-2 sentences)" },
          { cat: "be", text: "Celery task: generate_triage_note (effort/similarity internal note)" },
          { cat: "be", text: "Regenerate summary API for manual overrides" },
          { cat: "fe", text: "AI Summary card with shimmer loading states" },
          { cat: "fe", text: "AI triage note styling (sparkle icons, distinct borders)" }
        ]
      },
      {
        day: 24,
        title: "Reply suggestions & delivery message",
        tags: ["Replies", "Insights"],
        tasks: [
          { cat: "be", text: "Reply suggestions API (context-aware, Redis cached)" },
          { cat: "be", text: "Celery task: generate_client_insight (nightly anomaly detection)" },
          { cat: "be", text: "AI delivery message API (contextual message generation)" },
          { cat: "fe", text: "AI reply suggestions strip in chat" },
          { cat: "fe", text: "AI insight strip on dashboard (at-risk clients)" },
          { cat: "fe", text: "AI insight tag on client cards" }
        ]
      },
      {
        day: 25,
        title: "Plan limits, settings & white-label",
        tags: ["Settings", "White-label", "Plans"],
        tasks: [
          { cat: "be", text: "Enforce plan limits at API level (403 plan_limit_reached)" },
          { cat: "be", text: "Settings update API — profile, workspace, notifications" },
          { cat: "be", text: "White-label flag logic — toggle 'Powered by Grove'" },
          { cat: "be", text: "Custom status labels API (JSON store for renaming stages)" },
          { cat: "fe", text: "Settings page — profile, billing, and customization sections" },
          { cat: "fe", text: "White-label behavior on client portal topbar" }
        ]
      },
      {
        day: 26,
        title: "Grove Admin — dashboard & tenants",
        tags: ["Admin module", "Page 1 & 2"],
        tasks: [
          { cat: "ad", text: "Isolated admin login route /grove-admin/login" },
          { cat: "ad", text: "Admin dashboard API — global stats and signup trends" },
          { cat: "ad", text: "Admin dashboard page — stat cards and recent tenants" },
          { cat: "ad", text: "Admin tenants page — search, filter, and plan badges" },
          { cat: "ad", text: "Tenant actions: upgrade/downgrade, suspend/unsuspend" }
        ]
      },
      {
        day: 27,
        title: "Grove Admin — users & plans",
        tags: ["Admin module", "Page 3 & 4"],
        tasks: [
          { cat: "ad", text: "Admin users API — search by email/name across all tenants" },
          { cat: "ad", text: "User actions: password reset, resend invite, deactivate" },
          { cat: "ad", text: "Admin plans page — visual usage bars per tenant" },
          { cat: "ad", text: "Plan override action: assign custom client limits" },
          { cat: "ad", text: "Register all models in Django admin as backup" }
        ]
      },
      {
        day: 28,
        title: "UI polish, README & final review",
        tags: ["Polish", "README", "Review"],
        tasks: [
          { cat: "fe", text: "Verify loading skeletons and shimmer across all pages" },
          { cat: "fe", text: "Mobile responsiveness audit for client portal" },
          { cat: "fe", text: "Discard confirmation modals for forms" },
          { cat: "be", text: "README documentation (setup, environment vars, architecture)" },
          { cat: "ts", text: "Final end-to-end walkthrough and data leak checks" }
        ]
      }
    ],
    checkpoint: "Grove is polished, AI-powered, and ready for launch with a central admin panel.",
    modules: ["AI features", "Customisation", "Admin Module", "Billing enforcement"]
  }
];

// --- Sub-components ---

const ProgressBar = ({ current, total, label, size = "md" }) => {
  const percentage = Math.round((current / total) * 100) || 0;
  const height = size === "sm" ? "h-1.5" : "h-3";
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{label}</span>
        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{percentage}%</span>
      </div>
      <div className={`w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden ${height}`}>
        <div 
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-700 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const CategoryIcon = ({ cat }) => {
  switch (cat) {
    case 'be': return <Server className="w-3.5 h-3.5 text-emerald-600" />;
    case 'fe': return <Layout className="w-3.5 h-3.5 text-blue-600" />;
    case 'ts': return <TestTube2 className="w-3.5 h-3.5 text-amber-600" />;
    case 'ad': return <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />;
    default: return null;
  }
};

const CategoryLabel = ({ cat }) => {
  switch (cat) {
    case 'be': return "Backend";
    case 'fe': return "Frontend";
    case 'ts': return "Tests";
    case 'ad': return "Admin";
    default: return "";
  }
};

// --- Main Application ---

export default function App() {
  const [user, setUser] = useState(null);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [activeWeek, setActiveWeek] = useState(1);
  const [expandedDays, setExpandedDays] = useState([1]);
  const [loading, setLoading] = useState(true);

  // Initialize Auth
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth error:", err);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // Fetch / Sync Data
  useEffect(() => {
    if (!user) return;
    
    const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'progress');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setCompletedTasks(docSnap.data().completed || []);
      }
      setLoading(false);
    }, (err) => {
      console.error("Firestore error:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Handle Toggle
  const toggleTask = async (taskId) => {
    if (!user) return;
    
    const newCompleted = completedTasks.includes(taskId)
      ? completedTasks.filter(id => id !== taskId)
      : [...completedTasks, taskId];
    
    setCompletedTasks(newCompleted); // Optimistic update

    const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'progress');
    await setDoc(docRef, { completed: newCompleted }, { merge: true });
  };

  const toggleDay = (day) => {
    setExpandedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  // Stats
  const stats = useMemo(() => {
    const totalTasks = TIMELINE_DATA.reduce((acc, week) => 
      acc + week.days.reduce((dAcc, day) => dAcc + day.tasks.length, 0), 0);
    
    const weekStats = TIMELINE_DATA.map(week => {
      const weekTasks = week.days.reduce((acc, day) => acc + day.tasks.length, 0);
      const weekCompleted = week.days.reduce((acc, day) => {
        return acc + day.tasks.filter((_, i) => completedTasks.includes(`w${week.week}-d${day.day}-t${i}`)).length;
      }, 0);
      return { week: week.week, total: weekTasks, completed: weekCompleted };
    });

    return { total: totalTasks, completedCount: completedTasks.length, weekStats };
  }, [completedTasks]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium animate-pulse">Syncing Grove Timeline...</p>
        </div>
      </div>
    );
  }

  const currentWeekData = TIMELINE_DATA.find(w => w.week === activeWeek);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans pb-24">
      {/* Header & Global Progress */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 p-4 md:p-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 p-2 rounded-xl">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Grove 28-Day Build</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Auto-saving to cloud
              </p>
            </div>
          </div>
          
          <div className="w-full md:w-64">
            <ProgressBar 
              current={stats.completedCount} 
              total={stats.total} 
              label="Overall Completion" 
            />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 md:p-6">
        {/* Week Selector */}
        <div className="flex overflow-x-auto gap-2 mb-8 no-scrollbar">
          {TIMELINE_DATA.map(week => (
            <button
              key={week.week}
              onClick={() => setActiveWeek(week.week)}
              className={`flex-shrink-0 px-5 py-3 rounded-2xl transition-all duration-200 flex flex-col items-start gap-1 min-w-[140px] border-2 ${
                activeWeek === week.week 
                ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 shadow-sm' 
                : 'bg-white dark:bg-slate-900 border-transparent hover:border-slate-200 dark:hover:border-slate-700'
              }`}
            >
              <span className={`text-[10px] font-bold uppercase tracking-wider ${activeWeek === week.week ? 'text-emerald-600' : 'text-slate-400'}`}>
                Week {week.week}
              </span>
              <span className="text-sm font-bold truncate w-full">{week.title.split('—')[0]}</span>
              <div className="w-full mt-2">
                <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-500" 
                    style={{ width: `${Math.round((stats.weekStats[week.week-1].completed / stats.weekStats[week.week-1].total) * 100)}%` }}
                  />
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Current Week Header */}
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Activity className="w-32 h-32" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest">
                  Active Sprint
                </span>
                <span className="text-slate-400 text-xs">•</span>
                <span className="text-slate-500 text-xs font-medium">Days {(activeWeek-1)*7 + 1} – {activeWeek*7}</span>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-black mb-4">{currentWeekData.title}</h2>
              <div className="flex gap-4 items-start mb-6">
                <Info className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" />
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed max-w-2xl">
                  {currentWeekData.goal}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {currentWeekData.modules.map(mod => (
                  <span key={mod} className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700">
                    {mod}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Days List */}
        <div className="space-y-4">
          {currentWeekData.days.map((day) => {
            const isExpanded = expandedDays.includes(day.day);
            const dayCompleted = day.tasks.filter((_, i) => completedTasks.includes(`w${activeWeek}-d${day.day}-t${i}`)).length;
            const isFullyDone = dayCompleted === day.tasks.length;

            return (
              <div 
                key={day.day} 
                className={`rounded-2xl border transition-all duration-300 ${
                  isFullyDone 
                  ? 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-950/10' 
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm'
                }`}
              >
                {/* Day Header */}
                <button 
                  onClick={() => toggleDay(day.day)}
                  className="w-full flex items-center justify-between p-4 md:p-5 text-left group"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-colors ${
                      isFullyDone 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}>
                      {isFullyDone ? <CheckCircle2 className="w-5 h-5" /> : `D${day.day}`}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1">
                        <h3 className={`font-bold transition-colors ${isFullyDone ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100'}`}>
                          {day.title}
                        </h3>
                        {day.tags.map(tag => (
                          <span key={tag} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="w-full max-w-[200px]">
                        <ProgressBar 
                          current={dayCompleted} 
                          total={day.tasks.length} 
                          label={`${dayCompleted}/${day.tasks.length} tasks`}
                          size="sm"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4 text-slate-400 group-hover:text-emerald-500 transition-colors">
                    {isExpanded ? <ChevronDown /> : <ChevronRight />}
                  </div>
                </button>

                {/* Day Content */}
                {isExpanded && (
                  <div className="px-5 pb-6 animate-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-1 gap-1">
                      {day.tasks.map((task, idx) => {
                        const taskId = `w${activeWeek}-d${day.day}-t${idx}`;
                        const isDone = completedTasks.includes(taskId);
                        
                        return (
                          <div 
                            key={taskId}
                            onClick={() => toggleTask(taskId)}
                            className={`flex items-start gap-4 p-3 rounded-xl cursor-pointer group transition-all ${
                              isDone 
                              ? 'bg-emerald-50/50 dark:bg-emerald-900/10 opacity-70' 
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                            }`}
                          >
                            <div className={`mt-0.5 transition-all duration-200 ${isDone ? 'text-emerald-500 scale-110' : 'text-slate-300 dark:text-slate-600 group-hover:text-slate-400'}`}>
                              {isDone ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                            </div>
                            
                            <div className="flex-1">
                              <p className={`text-sm leading-relaxed transition-all ${isDone ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                {task.text}
                              </p>
                              <div className="flex items-center gap-1.5 mt-2">
                                <CategoryIcon cat={task.cat} />
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                                  task.cat === 'be' ? 'text-emerald-600' : 
                                  task.cat === 'fe' ? 'text-blue-600' : 
                                  task.cat === 'ts' ? 'text-amber-600' : 
                                  'text-indigo-600'
                                }`}>
                                  {CategoryLabel(task.cat)}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Week Checkpoint */}
        <div className="mt-12 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden">
          <div className="absolute -bottom-8 -right-8 opacity-10">
            <Trophy className="w-48 h-48" />
          </div>
          <div className="relative z-10">
            <h4 className="text-lg font-bold flex items-center gap-2 mb-3">
              <Trophy className="w-5 h-5" />
              Week {activeWeek} Checkpoint
            </h4>
            <p className="text-indigo-100 text-sm leading-relaxed mb-6 font-medium">
              {currentWeekData.checkpoint}
            </p>
            <div className="flex items-center gap-3">
              <div className="h-2 flex-1 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white transition-all duration-1000" 
                  style={{ width: `${Math.round((stats.weekStats[activeWeek-1].completed / stats.weekStats[activeWeek-1].total) * 100)}%` }}
                />
              </div>
              <span className="text-xs font-black uppercase">{Math.round((stats.weekStats[activeWeek-1].completed / stats.weekStats[activeWeek-1].total) * 100)}% Ready</span>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Action / Legend */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 px-6 py-3 rounded-full shadow-2xl flex items-center gap-6">
        <div className="hidden md:flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Backend</div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Frontend</div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Tests</div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> Admin</div>
        </div>
        <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 hidden md:block"></div>
        <div className="flex items-center gap-2">
           <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Progress</div>
           <span className="text-sm font-black text-emerald-600">{stats.completedCount} / {stats.total}</span>
        </div>
      </div>
      
      {/* Visual Depth styles */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}