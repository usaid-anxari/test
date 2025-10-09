export const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:4000';

// API Paths for TrueTestify MVP - Aligned with Backend
export const API_PATHS = {
  AUTH: {
    CHECK_USER: "/users/me",
    REGISTER: "/api/auth/register",
    PROFILE: "/auth/profile",
    SYNC: "/auth/sync",
    RESEND_VERIFICATION: "/auth/resend-verification",
  },
  BUSINESSES: {
    GET_PRIVATE_PROFILE: "/api/business/me",
    UPDATE_PRIVATE_PROFILE: "/api/business/me",
    GET_PUBLIC_PROFILE: (slug) => `/business/${slug}`,
    CREATE_BUSINESS: "/api/business",
    TOGGLE_TEXT_REVIEWS: "/api/business/settings/text-reviews",
    TOGGLE_GOOGLE_REVIEWS: "/api/business/settings/google-reviews",
  },
  REVIEWS: {
    LIST: '/api/reviews',
    GET_PUBLIC_REVIEWS: (slug) => `/public/${slug}/reviews`,
    CREATE_REVIEW: (slug) => `/api/public/${slug}/reviews`,
    GET_REVIEWS: (slug) => `/api/admin/${slug}/reviews`,
    GET_REVIEW: (slug, id) => `/api/admin/${slug}/reviews/${id}`,
    UPDATE_REVIEW_STATUS: (slug, id) => `/api/admin/${slug}/reviews/${id}/status`,
  },
  WIDGETS: {
    CREATE_WIDGET: "/api/widgets",
    UPDATE_WIDGET: (id) => `/api/widgets/${id}`,
    GET_WIDGETS: "/api/widgets",
    DELETE_WIDGET: (id) => `/api/widgets/${id}`,
    GET_EMBED_CODE: (id) => `/api/widgets/${id}/embed-code`,
  },
  ANALYTICS: {
    GET_DASHBOARD: "/api/analytics/dashboard",
    GET_WIDGET_PERFORMANCE: (widgetId) => `/api/analytics/widgets/${widgetId}/performance`,
    GET_REVIEW_TRENDS: "/api/analytics/reviews/trends",
    GET_STORAGE_USAGE: "/api/analytics/storage/usage",
    TRACK_EVENT: "/api/analytics/events",
  },
  BILLING: {
    GET_PRICING_PLANS: "/api/billing/plans",
    GET_BILLING_ACCOUNT: "/api/billing/info",
    CREATE_CHECKOUT_SESSION: "/api/billing/checkout",
    CREATE_PORTAL_SESSION: "/api/billing/portal",
    GET_STORAGE_STATUS: "/api/billing/status",
    GET_INVOICES: "/api/billing/invoices",
    DOWNLOAD_INVOICE: (invoiceId) => `/api/billing/invoices/${invoiceId}/download`,
  },
  GOOGLE:{
    CONNECT_GOOGLE_ACCOUNT:'/api/google/auth-url',
    CONNECTION_STATUS:'/api/google/status',
    CONNECTION_PROGRESS:'/api/google/connection-progress',
    BUSINESS_PROFILES:'/api/google/business-profiles',
    IMPORT_REVIEWS:'/api/google/import-reviews',
    FETCH_REVIEWS:'/api/google/reviews',
    DISCONNECT_GOOGLE_ACCOUNT:'/api/google/disconnect'
  },
  COMPLIANCE: {
    DELETE_REVIEW_PERMANENTLY: (id) => `/api/reviews/${id}/delete-permanently`,
    GET_CONSENT_LOGS: '/api/compliance/consent-logs'
  },
  VALIDATION: {
    CHECK_SLUG_AVAILABILITY: (slug) => `/api/validation/slug/${slug}`,
    SUGGEST_SLUG: (name) => `/api/validation/suggest-slug?name=${encodeURIComponent(name)}`
  }
};
