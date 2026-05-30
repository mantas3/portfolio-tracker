import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Add middleware to parse JSON bodies up to 10MB
  app.use(express.json({ limit: '10mb' }));

  const DB_FILE = path.join(process.cwd(), 'db.json');

  // Database API: load data (Guarded)
  app.get('/api/db', (req, res) => {
    try {
      if (fs.existsSync(DB_FILE)) {
        const data = fs.readFileSync(DB_FILE, 'utf8');
        return res.json(JSON.parse(data));
      } else {
        const initialDb = { assets: [], transactions: [], valuations: [] };
        fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf8');
        return res.json(initialDb);
      }
    } catch (err) {
      console.error('[Local DB Load Error]:', err);
      return res.status(500).json({ error: 'Failed to access database storage' });
    }
  });

  // Database API: save data (Guarded)
  app.post('/api/db', (req, res) => {
    try {
      const { assets, transactions, valuations } = req.body;
      const dbContent = {
        assets: assets || [],
        transactions: transactions || [],
        valuations: valuations || [],
        lastSaved: new Date().toISOString()
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(dbContent, null, 2), 'utf8');
      return res.json({ success: true });
    } catch (err) {
      console.error('[Local DB Save Error]:', err);
      return res.status(500).json({ error: 'Failed to persist updates to database' });
    }
  });

  // Simple API health route
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', environment: process.env.NODE_ENV || 'production' });
  });

  // Client static assets & developer hot fallbacks
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Connected. Application live at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server Run Failure]:', err);
});
