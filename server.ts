import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = process.env.NODE_ENV === 'production'
    ? (process.env.PORT ? parseInt(process.env.PORT, 10) : 3000)
    : 3000;

  app.use(express.json());

  // API health check route for container health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Vite middleware for dev or static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
  server.on('error', (err: NodeJS.ErrnoException) => {
    console.error(`Server error on port ${PORT}:`, err.message);
  });

  if (process.env.NODE_ENV === 'production' && PORT !== 3000) {
    const secondaryServer = app.listen(3000, '0.0.0.0', () => {
      console.log(`Server also listening on http://0.0.0.0:3000`);
    });
    secondaryServer.on('error', () => {
      // Optional fallback port already bound or unavailable
    });
  }
}

startServer();
