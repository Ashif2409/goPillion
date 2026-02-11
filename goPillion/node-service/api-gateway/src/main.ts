import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';
import { setupCentralSwagger } from './swagger/swagger';
import { authMiddleware } from './middleware/auth.middleware';

dotenv.config();

const host = process.env.HOST ?? '0.0.0.0';
const port = process.env.PORT ? Number(process.env.PORT) : 8000;

const app = express();

// 1. Trust Proxy (Important for rate limiting behind Nginx)
app.set('trust proxy', 1);

// 2. Security Headers
app.use(helmet());

// 2. Logging
app.use(morgan('combined'));

// 3. CORS
app.use(cors());

// 4. Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." }
});
app.use(limiter);

// 5. Swagger
setupCentralSwagger(app);

// 6. Proxy Configuration
const PROXY_CONFIG = {
  auth: process.env.AUTH_SERVICE_URL || 'http://auth-service:3000',
  trip: process.env.TRIP_SERVICE_URL || 'http://trip-service:3005',
  driver: process.env.DRIVER_SERVICE_URL || 'http://driver-service:3004',
  notification: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3003',
  map: process.env.MAP_SERVICE_URL || 'http://map-service:3006',
  message: process.env.MESSAGE_SERVICE_URL || 'http://message-service:3333',
};

// --- SERVICE PROXYING ---

// --- SERVICE PROXYING ---

const createServiceProxy = (target: string) => createProxyMiddleware({
  target,
  changeOrigin: true,
  pathRewrite: (path, req: any) => req.originalUrl,
});

// Helper for protected routes
const protectedRoutes = (target: string) => [authMiddleware, createServiceProxy(target)];

// 1. AUTH SERVICE (/api/auth, /api/profile)
// Public
app.use('/api/auth/api-docs.json', createServiceProxy(PROXY_CONFIG.auth));
app.use('/api/auth/request-otp', createServiceProxy(PROXY_CONFIG.auth));
app.use('/api/auth/verify-otp', createServiceProxy(PROXY_CONFIG.auth));
app.use('/api/auth/health', createServiceProxy(PROXY_CONFIG.auth));
// Protected
app.use('/api/auth/logout', ...protectedRoutes(PROXY_CONFIG.auth));
app.use('/api/profile', ...protectedRoutes(PROXY_CONFIG.auth));

// 2. TRIP SERVICE (/api/trips, /api/driver/trip, /api/passenger/trip)
// Public
app.use('/api/trips/api-docs.json', createServiceProxy(PROXY_CONFIG.trip));
// Protected
app.use('/api/trips', ...protectedRoutes(PROXY_CONFIG.trip));
app.use('/api/driver/trip', ...protectedRoutes(PROXY_CONFIG.trip));
app.use('/api/passenger/trip', ...protectedRoutes(PROXY_CONFIG.trip));

// 3. DRIVER SERVICE (/api/driver/kyc, /api/admin/kyc, /api/presence, /api/reviews)
// Public
app.use('/api/driver/api-docs.json', createServiceProxy(PROXY_CONFIG.driver));
// Protected
app.use('/api/driver/kyc', ...protectedRoutes(PROXY_CONFIG.driver));
app.use('/api/admin/kyc', ...protectedRoutes(PROXY_CONFIG.driver));
app.use('/api/presence', ...protectedRoutes(PROXY_CONFIG.driver));
app.use('/api/reviews', ...protectedRoutes(PROXY_CONFIG.driver));

// 4. MAP SERVICE (/api/maps, /api/driver/location, /api/passenger/location)
// Public
app.use('/api/maps/api-docs.json', createServiceProxy(PROXY_CONFIG.map));
// Protected
app.use('/api/maps', ...protectedRoutes(PROXY_CONFIG.map));
app.use('/api/driver/location', ...protectedRoutes(PROXY_CONFIG.map));
app.use('/api/driver/nearby', ...protectedRoutes(PROXY_CONFIG.map));
app.use('/api/passenger/location', ...protectedRoutes(PROXY_CONFIG.map));

// 5. NOTIFICATION SERVICE (/api/notifications)
// Public
app.use('/api/notifications/api-docs.json', createServiceProxy(PROXY_CONFIG.notification));
// Protected
app.use('/api/notifications', ...protectedRoutes(PROXY_CONFIG.notification));

// 6. MESSAGE SERVICE (/api/messages)
// Public
app.use('/api/messages/api-docs.json', createServiceProxy(PROXY_CONFIG.message));
// Protected
app.use('/api/messages', ...protectedRoutes(PROXY_CONFIG.message));

app.get('/', (req, res) => {
  res.send({ message: 'GoPillion API Gateway is Running' });
});

app.listen(port, host, () => {
  console.log(`[ ready ] API Gateway running at http://${host}:${port}`);
});
