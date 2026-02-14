import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';
import { setupCentralSwagger } from './swagger/swagger';

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

const createServiceProxy = (target: string) => createProxyMiddleware({
  target,
  changeOrigin: true,
  pathRewrite: (path, req: any) => req.originalUrl,
});

// 1. AUTH SERVICE (/api/auth, /api/profile)
// Public & Token Routes
app.use('/api/auth/api-docs.json', createServiceProxy(PROXY_CONFIG.auth));
app.use('/api/auth/request-otp', createServiceProxy(PROXY_CONFIG.auth));
app.use('/api/auth/verify-otp', createServiceProxy(PROXY_CONFIG.auth));
app.use('/api/auth/health', createServiceProxy(PROXY_CONFIG.auth));
app.use('/api/profile/admin', createServiceProxy(PROXY_CONFIG.auth));
app.use('/api/verify-token', createServiceProxy(PROXY_CONFIG.auth));
app.use('/api/refresh-token', createServiceProxy(PROXY_CONFIG.auth));

// Profile and Logout (Auth handled by Auth Service)
app.use('/api/auth/logout', createServiceProxy(PROXY_CONFIG.auth));
app.use('/api/profile', createServiceProxy(PROXY_CONFIG.auth));

// 2. TRIP SERVICE (/api/trips, /api/driver/trip, /api/passenger/trip)
app.use('/api/trips/api-docs.json', createServiceProxy(PROXY_CONFIG.trip));
app.use('/api/trips', createServiceProxy(PROXY_CONFIG.trip));
app.use('/api/driver/trip', createServiceProxy(PROXY_CONFIG.trip));
app.use('/api/passenger/trip', createServiceProxy(PROXY_CONFIG.trip));

// 3. DRIVER SERVICE (/api/driver/kyc, /api/admin/kyc, /api/presence, /api/reviews)
app.use('/api/driver/api-docs.json', createServiceProxy(PROXY_CONFIG.driver));
app.use('/api/driver/kyc', createServiceProxy(PROXY_CONFIG.driver));
app.use('/api/admin/kyc', createServiceProxy(PROXY_CONFIG.driver));
app.use('/api/presence', createServiceProxy(PROXY_CONFIG.driver));
app.use('/api/reviews', createServiceProxy(PROXY_CONFIG.driver));

// 4. MAP SERVICE (/api/maps, /api/driver/location, /api/passenger/location)
app.use('/api/maps/api-docs.json', createServiceProxy(PROXY_CONFIG.map));
app.use('/api/maps', createServiceProxy(PROXY_CONFIG.map));
app.use('/api/driver/location', createServiceProxy(PROXY_CONFIG.map));
app.use('/api/driver/nearby', createServiceProxy(PROXY_CONFIG.map));
app.use('/api/passenger/location', createServiceProxy(PROXY_CONFIG.map));

// 5. NOTIFICATION SERVICE (/api/notifications)
app.use('/api/notifications/api-docs.json', createServiceProxy(PROXY_CONFIG.notification));
app.use('/api/notifications', createServiceProxy(PROXY_CONFIG.notification));

// 6. MESSAGE SERVICE (/api/messages)
app.use('/api/messages/api-docs.json', createServiceProxy(PROXY_CONFIG.message));
app.use('/api/messages', createServiceProxy(PROXY_CONFIG.message));

app.get('/', (req, res) => {
  res.send({ message: 'GoPillion API Gateway is Running' });
});

app.listen(port, host, () => {
  console.log(`[ ready ] API Gateway running at http://${host}:${port}`);
});
