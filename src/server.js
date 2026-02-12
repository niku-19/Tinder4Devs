import 'dotenv/config';
import express from 'express';
import { connectDB } from './config/database.init.js';
import UserRoutes from './routes/user.route.js';
import cookieParser from 'cookie-parser';

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to parse cookies
app.use(cookieParser());

// Registering routes
app.use('/v1/api', UserRoutes);

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
