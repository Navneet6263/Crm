// Performance optimization utilities for mobile CRM

//  Debounce function for search inputs
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function for scroll events
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Virtual scrolling helper for large lists
export const getVisibleItems = (items, containerHeight, itemHeight, scrollTop) => {
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );
  
  return {
    startIndex: Math.max(0, startIndex),
    endIndex,
    visibleItems: items.slice(Math.max(0, startIndex), endIndex)
  };
};

// Lazy loading helper
export const createIntersectionObserver = (callback, options = {}) => {
  const defaultOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  };

  return new IntersectionObserver(callback, defaultOptions);
};

// Memory optimization - cleanup unused objects
export const cleanupMemory = () => {
  if (window.gc) {
    window.gc();
  }
};

// Check if device is mobile
export const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Check if device has touch capability
export const isTouchDevice = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

// Optimize images for mobile
export const optimizeImageForMobile = (imageUrl, maxWidth = 800) => {
  if (!imageUrl) return '';
  
  // If it's a data URL or already optimized, return as is
  if (imageUrl.startsWith('data:') || imageUrl.includes('w_' + maxWidth)) {
    return imageUrl;
  }
  
  // Add optimization parameters (works with services like Cloudinary)
  const separator = imageUrl.includes('?') ? '&' : '?';
  return `${imageUrl}${separator}w_${maxWidth}&q_auto&f_auto`;
};

// Batch DOM updates
export const batchDOMUpdates = (updates) => {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      updates.forEach(update => update());
      resolve();
    });
  });
};

// Preload critical resources
export const preloadResource = (url, type = 'fetch') => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = url;
  
  switch (type) {
    case 'image':
      link.as = 'image';
      break;
    case 'script':
      link.as = 'script';
      break;
    case 'style':
      link.as = 'style';
      break;
    default:
      link.as = 'fetch';
      link.crossOrigin = 'anonymous';
  }
  
  document.head.appendChild(link);
};

// Service Worker registration for offline support
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }
  return null;
};

// Cache management
export const cacheManager = {
  set: (key, data, ttl = 3600000) => { // 1 hour default
    const item = {
      data,
      timestamp: Date.now(),
      ttl
    };
    localStorage.setItem(`cache_${key}`, JSON.stringify(item));
  },
  
  get: (key) => {
    try {
      const item = JSON.parse(localStorage.getItem(`cache_${key}`));
      if (!item) return null;
      
      if (Date.now() - item.timestamp > item.ttl) {
        localStorage.removeItem(`cache_${key}`);
        return null;
      }
      
      return item.data;
    } catch (error) {
      return null;
    }
  },
  
  clear: (pattern) => {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('cache_') && (!pattern || key.includes(pattern))) {
        localStorage.removeItem(key);
      }
    });
  }
};

// Network status monitoring
export const networkMonitor = {
  isOnline: () => navigator.onLine,
  
  onStatusChange: (callback) => {
    window.addEventListener('online', () => callback(true));
    window.addEventListener('offline', () => callback(false));
  },
  
  getConnectionType: () => {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    return connection ? connection.effectiveType : 'unknown';
  }
};

// Performance metrics
export const performanceMetrics = {
  measureRenderTime: (componentName) => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      console.log(`${componentName} render time: ${renderTime.toFixed(2)}ms`);
      return renderTime;
    };
  },
  
  measureMemoryUsage: () => {
    if (performance.memory) {
      return {
        used: Math.round(performance.memory.usedJSHeapSize / 1048576), // MB
        total: Math.round(performance.memory.totalJSHeapSize / 1048576), // MB
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576) // MB
      };
    }
    return null;
  }
};