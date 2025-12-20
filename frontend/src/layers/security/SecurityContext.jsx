import React from 'react';

const SecurityContext = React.createContext({
  sanitizeText: async (text) => text,
  sanitizeImage: async (file) => file,
  validateInput: async (input, schema) => true,
  logSecurityEvent: (event) => {},
  isSecurityEnabled: true
});

export default SecurityContext;