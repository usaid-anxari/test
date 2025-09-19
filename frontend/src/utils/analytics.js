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

// Track analytics events
export const trackEvent = async (businessId, eventType, widgetId = null, eventData = {}) => {
  try {
    await axiosInstance.post(API_PATHS.ANALYTICS.TRACK_EVENT, {
      businessId,
      eventType,
      widgetId,
      eventData,
      referrerUrl: window.location.href
    });
  } catch (error) {
    console.log('Analytics tracking failed:', error);
    // Fail silently to not disrupt user experience
  }
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