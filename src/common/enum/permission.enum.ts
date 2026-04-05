/**
 * Granular permission flags for the admin RBAC system.
 *
 * SUPER_ADMIN bypasses ALL permission checks.
 * ADMIN can only perform actions whose permission is listed in their `permissions` field.
 */
export enum PermissionEnum {
  // ── Dashboard ─────────────────────────────────────────────────
  DASHBOARD_VIEW = 'dashboard:view',

  // ── Settings ──────────────────────────────────────────────────
  SETTINGS_VIEW = 'settings:view',
  SETTINGS_UPDATE = 'settings:update',

  // ── User / Admin Management ───────────────────────────────────
  USER_VIEW = 'user:view',
  USER_CREATE = 'user:create',
  USER_DELETE = 'user:delete',
  USER_UPDATE_PERMISSIONS = 'user:update_permissions',

  // ── Daily Leads ───────────────────────────────────────────────
  LEADS_VIEW = 'leads:view',
  LEADS_CREATE = 'leads:create',
  LEADS_UPDATE = 'leads:update',
  LEADS_DELETE = 'leads:delete',
  LEADS_DISPATCH_REPORT = 'leads:dispatch_report',
  LEADS_ASSIGNMENT_MANAGE = 'leads:assignment_manage',

  // ── Yacht Listings ────────────────────────────────────────────
  LISTINGS_VIEW = 'listings:view',
  LISTINGS_CREATE = 'listings:create',
  LISTINGS_UPDATE = 'listings:update',
  LISTINGS_DELETE = 'listings:delete',

  // ── Boats Sync ────────────────────────────────────────────────
  BOATS_SYNC = 'boats:sync',

  // ── Categories ────────────────────────────────────────────────
  CATEGORY_MANAGE = 'category:manage',

  // ── Blogs ─────────────────────────────────────────────────────
  BLOG_MANAGE = 'blog:manage',

  // ── Page Banners ──────────────────────────────────────────────
  BANNER_MANAGE = 'banner:manage',

  // ── Featured Brands ───────────────────────────────────────────
  FEATURED_BRAND_MANAGE = 'featured_brand:manage',

  // ── AI Search Banner ──────────────────────────────────────────
  AI_SEARCH_BANNER_MANAGE = 'ai_search_banner:manage',

  // ── About Us ──────────────────────────────────────────────────
  ABOUT_US_MANAGE = 'about_us:manage',

  // ── Legal / Policy Content ────────────────────────────────────
  CONTENT_MANAGE = 'content:manage',

  // ── Footer ────────────────────────────────────────────────────
  FOOTER_MANAGE = 'footer:manage',

  // ── FAQ ───────────────────────────────────────────────────────
  FAQ_MANAGE = 'faq:manage',

  // ── Why Us ────────────────────────────────────────────────────
  WHY_US_MANAGE = 'why_us:manage',

  // ── Our Team ──────────────────────────────────────────────────
  OUR_TEAM_MANAGE = 'our_team:manage',

  // ── Contact Info (admin-managed content) ─────────────────────
  CONTACT_INFO_MANAGE = 'contact_info:manage',

  // ── Contact Submissions (form submissions from visitors) ──────
  CONTACT_VIEW = 'contact:view',
  CONTACT_UPDATE = 'contact:update',

  // ── Email Subscriptions ───────────────────────────────────────
  EMAIL_SUBSCRIBE_VIEW = 'email_subscribe:view',
}

/** All permission values as an array — used for the "list all permissions" endpoint */
export const ALL_PERMISSIONS = Object.values(PermissionEnum);
