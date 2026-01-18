declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

const GA_MEASUREMENT_ID = process.env.GA_MEASUREMENT_ID;

export const initAnalytics = (): void => {
  if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID === 'G-XXXXXXXXXX') {
    console.warn('Google Analytics measurement ID not configured');
    return;
  }

  window.gtag('config', GA_MEASUREMENT_ID);
};

export const trackPageView = (pageName: string): void => {
  if (!window.gtag) return;

  window.gtag('event', 'page_view', {
    page_title: pageName,
    page_location: window.location.href,
  });
};

export const trackEvent = (action: string, category: string, label?: string): void => {
  if (!window.gtag) return;

  window.gtag('event', action, {
    event_category: category,
    event_label: label,
  });
};

export const setUserId = (uid: string): void => {
  if (!window.gtag || !GA_MEASUREMENT_ID) return;

  window.gtag('config', GA_MEASUREMENT_ID, {
    user_id: uid,
  });
};

export const trackSignIn = (): void => {
  trackEvent('sign_in', 'authentication', 'google');
};

export const trackGenerateConcept = (): void => {
  trackEvent('generate_concept', 'content_generation');
};

export const trackGenerateScript = (): void => {
  trackEvent('generate_script', 'content_generation');
};

export const trackGenerateImage = (): void => {
  trackEvent('generate_image', 'content_generation');
};

export const trackGenerateVideo = (): void => {
  trackEvent('generate_video', 'content_generation');
};

export const trackGenerateAudio = (): void => {
  trackEvent('generate_audio', 'content_generation');
};

export const trackExportVideo = (): void => {
  trackEvent('export_video', 'export');
};
