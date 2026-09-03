import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { config } from './config';
import routes from './routes';
import { apiLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import { swaggerSpec } from './docs/swagger';
import { ApiError } from './utils/errors';

const app: Express = express();

// Security Headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Allow Swagger UI inline scripts
  })
);

// CORS
const frontendUrls = (config.frontendUrl || '')
  .split(',')
  .map((u) => u.trim().replace(/\/$/, ''))
  .filter(Boolean);

const allowedOrigins = [
  ...frontendUrls,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*') || config.nodeEnv === 'development') {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiter
app.use('/api/', apiLimiter);

// Swagger Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api/docs.json', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'FINORA REST API',
    environment: config.nodeEnv,
  });
});

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    name: 'FINORA Personal Finance API',
    tagline: 'Understand your money. Build your future.',
    version: '1.0.0',
    docs: '/api/docs',
    health: '/api/health',
  });
});

// API Routes
app.use('/api/v1', routes);

// 404 Route Handler
app.use((req: Request, res: Response, next) => {
  next(ApiError.notFound(`Cannot ${req.method} ${req.originalUrl}`));
});

// Global Error Handler
app.use(errorHandler);

export default app;
