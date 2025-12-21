// utils/environment.js
export const isDevelopment = () => {
  return process.env.NODE_ENV === 'development' || 
         process.env.REACT_APP_ENV === 'development' ||
         window.location.hostname === 'localhost' ||
         window.location.hostname === '127.0.0.1';
};

export const isProduction = () => {
  return !isDevelopment();
};