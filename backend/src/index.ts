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

// Health check endpoint with comprehensive status
app.get('/health', async (_req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: 'unknown',
      ai: 'unknown',
      domain_api: 'unknown'
    }
  };

  try {
    // Check database connection
    const { checkDatabaseConnection } = await import('./config/supabase');
    health.services.database = await checkDatabaseConnection() ? 'healthy' : 'unhealthy';
  } catch (error) {
    health.services.database = 'error';
  }

  // Check AI service
  try {
    health.services.ai = process.env['OPENAI_API_KEY'] ? 'configured' : 'not_configured';
  } catch (error) {
    health.services.ai = 'error';
  }

  // Check domain API
  try {
    health.services.domain_api = process.env['DOMAINR_API_KEY'] || process.env['RAPIDAPI_KEY'] ? 'configured' : 'not_configured';
  } catch (error) {
    health.services.domain_api = 'error';
  }

  // Determine overall status
  const hasErrors = Object.values(health.services).some(status => status === 'error' || status === 'unhealthy');
  health.status = hasErrors ? 'degraded' : 'ok';

  res.json(health);
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
