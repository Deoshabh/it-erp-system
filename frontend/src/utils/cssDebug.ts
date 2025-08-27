/**
 * CSS Diagnostic Utility
 * Use this to quickly identify and fix common CSS issues
 */

// Check if Tailwind CSS is loaded
export const checkTailwindLoaded = (): boolean => {
  if (typeof document === 'undefined') return false;
  
  // Create a test element with Tailwind classes
  const testEl = document.createElement('div');
  testEl.className = 'bg-red-500 hidden';
  document.body.appendChild(testEl);
  
  const styles = window.getComputedStyle(testEl);
  const hasRedBackground = styles.backgroundColor === 'rgb(239, 68, 68)'; // red-500
  
  document.body.removeChild(testEl);
  return hasRedBackground;
};

// Check if custom CSS is loaded
export const checkCustomCSSLoaded = (): boolean => {
  if (typeof document === 'undefined') return false;
  
  // Check if our custom btn-primary class works
  const testEl = document.createElement('button');
  testEl.className = 'btn-primary hidden';
  document.body.appendChild(testEl);
  
  const styles = window.getComputedStyle(testEl);
  const hasBlueBackground = styles.backgroundColor.includes('59, 130, 246'); // blue-600
  
  document.body.removeChild(testEl);
  return hasBlueBackground;
};

// Force reload CSS (useful for development)
export const reloadCSS = (): void => {
  if (typeof document === 'undefined') return;
  
  const links = document.querySelectorAll('link[rel="stylesheet"]');
  links.forEach((link) => {
    const href = link.getAttribute('href');
    if (href) {
      const newLink = document.createElement('link');
      newLink.rel = 'stylesheet';
      newLink.href = href + '?reload=' + Date.now();
      link.parentNode?.insertBefore(newLink, link);
      link.remove();
    }
  });
};

// CSS Debug Information
export const getCSSDebugInfo = () => {
  return {
    tailwindLoaded: checkTailwindLoaded(),
    customCSSLoaded: checkCustomCSSLoaded(),
    viewport: typeof window !== 'undefined' ? {
      width: window.innerWidth,
      height: window.innerHeight,
    } : null,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    timestamp: new Date().toISOString(),
  };
};

// Console CSS diagnostics
export const logCSSDebugInfo = (): void => {
  const info = getCSSDebugInfo();
  console.group('🎨 CSS Debug Information');
  console.log('Tailwind CSS Loaded:', info.tailwindLoaded ? '✅' : '❌');
  console.log('Custom CSS Loaded:', info.customCSSLoaded ? '✅' : '❌');
  if (info.viewport) {
    console.log('Viewport:', `${info.viewport.width}x${info.viewport.height}`);
  }
  console.log('Timestamp:', info.timestamp);
  console.groupEnd();
  
  if (!info.tailwindLoaded) {
    console.warn('⚠️ Tailwind CSS might not be loaded properly. Check your _app.tsx imports.');
  }
  
  if (!info.customCSSLoaded) {
    console.warn('⚠️ Custom CSS might not be loaded properly. Check your globals.css file.');
  }
};

// CSS Classes Validation
export const validateCSSClasses = (element: HTMLElement): string[] => {
  const issues: string[] = [];
  const classes = element.className.split(' ');
  
  // Check for common Tailwind classes that might not be working
  const commonTailwindClasses = [
    'bg-blue-500', 'text-white', 'p-4', 'rounded', 'shadow',
    'hover:bg-blue-600', 'focus:outline-none', 'transition'
  ];
  
  const styles = window.getComputedStyle(element);
  
  classes.forEach(className => {
    if (commonTailwindClasses.includes(className)) {
      // Basic validation for common classes
      if (className.startsWith('bg-blue-') && !styles.backgroundColor.includes('blue')) {
        issues.push(`Class ${className} doesn't seem to apply blue background`);
      }
      if (className === 'text-white' && styles.color !== 'rgb(255, 255, 255)') {
        issues.push(`Class ${className} doesn't apply white text color`);
      }
    }
  });
  
  return issues;
};

// Export all utilities
export const cssUtils = {
  checkTailwindLoaded,
  checkCustomCSSLoaded,
  reloadCSS,
  getCSSDebugInfo,
  logCSSDebugInfo,
  validateCSSClasses,
};
