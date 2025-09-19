export const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:4000';

// API Paths for TrueTestify MVP - Aligned with Backend
export const API_PATHS = {
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
  },
  BUSINESSES: {
    GET_PRIVATE_PROFILE: "/api/business/me",
    UPDATE_PRIVATE_PROFILE: "/api/business/me",
    GET_PUBLIC_PROFILE: (slug) => `/business/${slug}`,
    CREATE_BUSINESS: "/api/business",
    TOGGLE_TEXT_REVIEWS: "/api/business/settings/text-reviews",
  },
  REVIEWS: {
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
    GET_PRICING_PLANS: "/api/billing/pricing-plans",
    GET_BILLING_ACCOUNT: "/api/billing/account",
    CREATE_CHECKOUT_SESSION: "/api/billing/checkout",
    CREATE_PORTAL_SESSION: "/api/billing/portal",
    GET_STORAGE_STATUS: "/api/billing/storage/status",
    CHECK_FEATURE_ACCESS: (feature) => `/api/billing/features/${feature}/access`,
  },
  EMAIL: {
    GET_PREFERENCES: "/api/email/preferences",
    UPDATE_PREFERENCES: "/api/email/preferences",
    UNSUBSCRIBE: (token) => `/api/email/unsubscribe/${token}`,
  },
  GOOGLE: {
    CONNECT: "/api/google/connect",
    GET_STATUS: "/api/google/status",
    IMPORT_REVIEWS: "/api/google/import-reviews",
    GET_REVIEWS: "/api/google/reviews",
    DISCONNECT: "/api/google/disconnect",
  },
};
