import dotenv from 'dotenv';

// Load environment variables FIRST before any other imports
dotenv.config();

import express from 'express';
import cors from 'cors';

// Import routes (now that env vars are loaded)
import domainRoutes from './routes/domainRoutes';
import authRoutes from './routes/authRoutes';

const app = express();
const PORT = process.env['PORT'] || 3000;

// Basic middleware
app.use(cors({
  origin: process.env['CORS_ORIGIN'] || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/domains', domainRoutes);
app.use('/auth', authRoutes);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Basic error handling
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
  console.log(`API endpoints:`);
  console.log(`  - POST /api/domains/generate`);
  console.log(`  - POST /api/domains/check-availability`);
  console.log(`  - GET /auth/user`);
});
