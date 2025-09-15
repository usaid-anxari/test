export const BASE_URL = process.env.VITE_BASE_URL;

// API Paths for TrueTestify MVP
export const API_PATHS = {
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
  },
  BUSINESSES: {
    GET_PRIVATE_PROFILE: "/api/business/me",
    GET_PUBLIC_PROFILE: (slug) => `/business/${slug}`,
    CREATE_TENANTS: "/api/v1/tenants",
    GET_TENANT_BY_SLUG: (slug) => `/api/v1/tenants/slug/${slug}`,
  },
  REVIEWS: {
    CREATE_REVIEW: (slug) => `/api/public/${slug}/reviews`,
    GET_REVIEWS: (tenantId) => `/api/v1/reviews/${tenantId}/list`,
    GET_REVIEW: (id) => `/api/v1/reviews/${id}`,
    UPDATE_REVIEW: (id) => `/api/v1/reviews/${id}`,
    DELETE_REVIEW: (id) => `/api/v1/reviews/${id}`,
    APPROVE_REVIEW: (id) => `/api/v1/reviews/${id}/approve`,
    REJECT_REVIEW: (id) => `/api/v1/reviews/${id}/reject`,
    HIDE_REVIEW: (id) => `/api/v1/reviews/${id}/hide`,
    UPLOAD_VIDEO: "/api/v1/reviews/upload-video",
    UPLOAD_AUDIO: "/api/v1/reviews/upload-audio",
  },
  WIDGETS: {
    CREATE_WIDGET: (tenantId) => `/widgets/${tenantId}`,
    UPDATE_WIDGET: (widgetId) => `/widgets/${widgetId}`,
    LIST_WIDGETS: (tenantId) => `/widgets/tenant/${tenantId}`,
    FEED: (widgetId) => `/widgets/feed/${widgetId}`,
    TOGGLE_WIDGET: (widgetId) => `/widgets/${widgetId}/toggle`,
  },
  ANALYTICS: {
    GET_USAGE: (tenantId) => `/usage/${tenantId}/snapshot`,
    VIEWS: (reviewId) => `/usage/reviews/${reviewId}/view`,
  },
  BILLING: {
    GET_BILLING_ACCOUNT: (tenantId) => `/api/v1/billing/tenant/${tenantId}`,
    CREATE_SUBSCRIPTION: "/api/v1/billing/subscriptions",
    GET_SUBSCRIPTIONS: (tenantId) =>
      `/api/v1/billing/tenant/${tenantId}/subscriptions`,
    GET_INVOICES: (tenantId) => `/api/v1/billing/tenant/${tenantId}/invoices`,
    GET_USAGE: (tenantId) => `/api/v1/billing/tenant/${tenantId}/usage`,
    CREATE_CHECKOUT_SESSION: "/api/v1/billing/checkout",
    CREATE_PORTAL_SESSION: "/api/v1/billing/portal",
    STRIPE_WEBHOOK: "/api/v1/billing/webhook",
  },
  STORAGE: {
    GET_UPLOAD_URL: "/api/v1/storage/upload-url",
    GET_DOWNLOAD_URL: (key) => `/api/v1/storage/download-url/${key}`,
    DELETE_FILE: (key) => `/api/v1/storage/delete/${key}`,
  },
  API_KEYS: {
    CREATE_API_KEY: "/api/v1/api-keys",
    GET_API_KEYS: (tenantId) => `/api/v1/api-keys/tenant/${tenantId}`,
    DELETE_API_KEY: (id) => `/api/v1/api-keys/${id}`,
  },
  INTEGRATIONS: {
    SHOPIFY: {
      CONNECT: "/api/v1/integrations/shopify/connect",
      DISCONNECT: "/api/v1/integrations/shopify/disconnect",
      GET_STATUS: (tenantId) =>
        `/api/v1/integrations/shopify/tenant/${tenantId}`,
    },
    WORDPRESS: {
      CONNECT: "/api/v1/integrations/wordpress/connect",
      DISCONNECT: "/api/v1/integrations/wordpress/disconnect",
      GET_STATUS: (tenantId) =>
        `/api/v1/integrations/wordpress/tenant/${tenantId}`,
    },
  },
  EMBEDS: {
    GET_PUBLIC_REVIEWS: (slug) => `/api/v1/embeds/reviews/${slug}`,
    GET_WIDGET_DATA: (widgetId) => `/api/v1/embeds/widget/${widgetId}`,
  },
};
