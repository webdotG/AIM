import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import yaml from 'yaml';
import fs from 'fs';
import path from 'path';

import routes from './routes';

import { errorHandler } from './shared/middleware/errorHandler';
import { requestLogger } from './shared/middleware/requestLogger';
import { generalLimiter } from './shared/middleware/rateLimiter.middleware';
import { createSanitizerMiddleware } from './security/middleware/sanitizerMiddleware';

const app = express();
const PORT = process.env.PORT || 3003;

// Swagger — load spec, serve UI at /swagger and raw JSON at /swagger.json
const swaggerPath = path.join(__dirname, '..', 'swagger.yaml');
const swaggerDocument = yaml.parse(fs.readFileSync(swaggerPath, 'utf8'));
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customSiteTitle: 'AIM API',
  swaggerOptions: {
    persistAuthorization: true,
    tryItOutEnabled: true,
    filters: true,
  },
}));
app.get('/swagger.json', (_req, res) => {
  res.json(swaggerDocument);
});

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use(generalLimiter);

// Skip sanitization for health, swagger, favicon
app.use(createSanitizerMiddleware({
  preset: 'api',
  debug: process.env.NODE_ENV === 'development',
  maxLength: 10000,
  skipPaths: ['/health', '/favicon.ico', '/swagger.json'],
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
    console.log(`Swagger UI: http://localhost:${PORT}/swagger`);
    console.log(`Swagger JSON: http://localhost:${PORT}/swagger.json`);
    console.log(`Environment loaded:`, {
      port: PORT,
      nodeEnv: process.env.NODE_ENV,
      pepperLength: process.env.PASSWORD_PEPPER?.length || 0
    });
  });
}

export default app;