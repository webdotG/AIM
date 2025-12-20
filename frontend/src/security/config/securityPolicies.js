const securityPolicies = {
  rateLimit: {
    enabled: true,
    maxRequests: 100,
    windowMs: 60000
  },
  csrf: {
    enabled: true,
    tokenLength: 32
  },
  cors: {
    enabled: true,
    allowedOrigins: []
  }
};

export default securityPolicies;