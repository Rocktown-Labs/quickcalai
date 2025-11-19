// Simple logger utility for development logging
// Logs are only shown in development mode

export const logger = {
  log: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(...args);
    }
  },

  error: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(...args);
    }
  },

  warn: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(...args);
    }
  },

  info: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.info(...args);
    }
  },

  debug: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(...args);
    }
  },
};

// For server-side logging (API routes, etc.)
export const serverLogger = {
  log: (...args: any[]) => {
    if (typeof window === 'undefined' && process.env.NODE_ENV === 'development') {
      console.log(...args);
    }
  },

  error: (...args: any[]) => {
    if (typeof window === 'undefined' && process.env.NODE_ENV === 'development') {
      console.error(...args);
    }
  },

  warn: (...args: any[]) => {
    if (typeof window === 'undefined' && process.env.NODE_ENV === 'development') {
      console.warn(...args);
    }
  },

  info: (...args: any[]) => {
    if (typeof window === 'undefined' && process.env.NODE_ENV === 'development') {
      console.info(...args);
    }
  },

  debug: (...args: any[]) => {
    if (typeof window === 'undefined' && process.env.NODE_ENV === 'development') {
      console.debug(...args);
    }
  },
};