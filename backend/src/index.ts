import dotenv from 'dotenv';
// Only load .env for non-test environments.
// In tests, .env.test is loaded by setup.ts before any other imports.
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import routes from './routes';

import { errorHandler } from './shared/middleware/errorHandler';
import { requestLogger } from './shared/middleware/requestLogger';
import { generalLimiter } from './shared/middleware/rateLimiter.middleware';
import { createSanitizerMiddleware } from './security/middleware/sanitizerMiddleware';

const app = express();
const PORT = process.env.PORT || 3003;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use(generalLimiter);

// Security sanitization middleware - runs before business logic
// Sanitizes all incoming request data (body, query, params, headers)
app.use(createSanitizerMiddleware({
  preset: 'api',
  debug: process.env.NODE_ENV === 'development',
  maxLength: 10000,
  skipPaths: ['/health', '/favicon.ico'],
}));

app.use(routes);

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API: http://localhost:${PORT}/api/v1`);
    console.log(`Environment loaded:`, {
      port: PORT,
      nodeEnv: process.env.NODE_ENV,
      pepperLength: process.env.PASSWORD_PEPPER?.length || 0
    });
  });
}

export default app;