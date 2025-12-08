// GA4 Tracking Utilities
export const trackPageView = (path) => {
  if (!window.gtag) return;
  window.gtag("event", "page_view", { page_path: path });
};

export const trackEvent = (eventName, parameters = {}) => {
  if (!window.gtag) return;
  window.gtag("event", eventName, parameters);
};

// CRM specific tracking events
export const trackLeadCreated = (leadData) => {
  trackEvent("lead_created", {
    lead_source: leadData.source,
    lead_status: leadData.status,
    value: leadData.value || 0
  });
};

export const trackUserLogin = (userRole) => {
  trackEvent("login", {
    method: "email",
    user_role: userRole
  });
};

export const trackUserSignup = (userRole) => {
  trackEvent("sign_up", {
    method: "email",
    user_role: userRole
  });
};

export const trackCustomerConverted = (customerData) => {
  trackEvent("customer_converted", {
    conversion_value: customerData.value || 0,
    source: customerData.source
  });
};