import express from 'express';
import cors from 'cors';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';
import { initDatabase } from '@aidrivencompany/db';
import { companiesRouter } from './routes/companies.js';
import { graphRouter } from './routes/graph.js';
import { simulationsRouter } from './routes/simulations.js';
import { campaignsRouter } from './routes/campaigns.js';
import { dashboardRouter } from './routes/dashboard.js';
import { proofRouter } from './routes/proof.js';
import { decisionsRouter } from './routes/decisions.js';
import { settingsRouter } from './routes/settings.js';
import { genesisRouter } from './routes/genesis.js';

const PORT = process.env.PORT ? Number(process.env.PORT) : 7100;
const DB_DIR = path.join(os.homedir(), '.aidrivencompany');
const DB_PATH = process.env.DB_PATH ?? path.join(DB_DIR, 'dev.db');

// Ensure data directory exists
fs.mkdirSync(DB_DIR, { recursive: true });

// Initialize database
const db = initDatabase(DB_PATH);
console.log(`Database initialized at ${DB_PATH}`);

const app = express();

// Store db in app.locals so routes can access it
app.locals.db = db;

// Middleware
app.use(express.json());
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4000', 'http://127.0.0.1:5173'] }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount routes
app.use('/api', companiesRouter);
app.use('/api', graphRouter);
app.use('/api', simulationsRouter);
app.use('/api', campaignsRouter);
app.use('/api', dashboardRouter);
app.use('/api', proofRouter);
app.use('/api', decisionsRouter);
app.use('/api', settingsRouter);
app.use('/api', genesisRouter);

app.listen(PORT, () => {
  console.log(`AIDrivenCompany server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  db.close();
  process.exit(0);
});
