import axiosInstance from '../service/axiosInstanse';
import { API_PATHS } from '../service/apiPaths';

// Event types matching backend enum
export const EVENT_TYPES = {
  VIEW: 'view',
  CLICK: 'click',
  SUBMISSION: 'submission',
  WIDGET_VIEW: 'widget_view',
  WIDGET_CLICK: 'widget_click',
  REVIEW_SUBMISSION: 'review_submission'
};

// Track analytics events (non-blocking)
export const trackEvent = (businessId, eventType, widgetId = null, eventData = {}) => {
  // Use setTimeout to make it non-blocking
  setTimeout(async () => {
    try {
      await axiosInstance.post(API_PATHS.ANALYTICS.TRACK_EVENT, {
        businessId,
        eventType,
        widgetId,
        eventData,
        referrerUrl: window.location.href
      });
    } catch (error) {
      // Fail silently to not disrupt user experience
    }
  }, 0);
};

// Track widget view
export const trackWidgetView = (businessId, widgetId) => {
  trackEvent(businessId, EVENT_TYPES.WIDGET_VIEW, widgetId);
};

// Track widget click
export const trackWidgetClick = (businessId, widgetId) => {
  trackEvent(businessId, EVENT_TYPES.WIDGET_CLICK, widgetId);
};

// Track review submission
export const trackReviewSubmission = (businessId, widgetId = null, reviewData = {}) => {
  trackEvent(businessId, EVENT_TYPES.REVIEW_SUBMISSION, widgetId, reviewData);
};