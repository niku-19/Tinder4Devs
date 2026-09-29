import 'dotenv/config';
import express from 'express';
import { connectDB } from './config/database.init.js';
import AuthRoutes from './routes/auth.route.js';
import UploadFile from './routes/uploadFile.route.js';
import ProfileRoutes from './routes/profile.route.js';
import ConnectionRoutes from './routes/connection.route.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import cluster from 'cluster';
import os from 'os';
import {
  MAX_REQUESTS_ALLOWED,
  rateLimiterMiddleware,
  WINDOW_MS,
} from './middleware/rateLimit.middleware.js';

const app = express();
const PORT = process.env.PORT || 8000;

// Adds headers: Access-Control-Allow-Origin: *
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to parse cookies
app.use(cookieParser());

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true })); // access files

// Middleware to rate limit requests to prevent abuse
const limiter = rateLimiterMiddleware({
  maxRequestsAllowed: MAX_REQUESTS_ALLOWED,
  windowMs: WINDOW_MS,
});
app.use(limiter);

// Registering routes

// Auth Routes
app.use('/v1/api/auth', AuthRoutes);

// File Upload
app.use('/v1/api/upload', UploadFile);

// Profile Route
app.use('/v1/api/profile', ProfileRoutes);

//connection Route
app.use('/v1/api/connection', ConnectionRoutes);

app.use('/health', (req, res) => {
  res.sendFile(new URL('../public/html/health.html', import.meta.url).pathname);
});

app.use('/', (request, response) => {
  response.send(`Welcome to Tinder for Devs API ${process.pid}`);
});

if (cluster.isPrimary) {
  for (let i = 0; i < os.cpus().length; i++) {
    cluster.fork();
  }

  cluster.on('exit', () => {
    console.log(`Worker ${process.pid} died. Forking a new worker...`);
    cluster.fork();
  });
} else {
  (async () => {
    try {
      await connectDB();
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}...`);
      });
    } catch (error) {
      console.error('Error initializing the server...');
      process.exit(1);
    }
  })();
}
