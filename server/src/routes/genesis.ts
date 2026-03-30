import { Router } from 'express';
import type Database from 'better-sqlite3';
import { getCompany, getNodes } from '@aidrivencompany/db';
import { runGenesis } from '../services/genesis.js';

export const genesisRouter = Router();

genesisRouter.post('/companies/:companyId/genesis', async (req, res) => {
  const db = req.app.locals.db as Database.Database;
  const { companyId } = req.params;
  const { vision } = req.body as { vision: string };

  if (!vision || vision.trim().length === 0) {
    res.status(400).json({ error: { code: 'VALIDATION', message: 'vision is required' } });
    return;
  }

  const company = getCompany(db, companyId);
  if (!company) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Company not found' } });
    return;
  }

  try {
    const result = await runGenesis(db, { vision, companyId });
    res.status(201).json({ data: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Genesis failed';
    res.status(422).json({ error: { code: 'GENESIS_FAILED', message } });
  }
});

genesisRouter.get('/companies/:companyId/genesis/status', (req, res) => {
  const db = req.app.locals.db as Database.Database;
  const { companyId } = req.params;

  const company = getCompany(db, companyId);
  if (!company) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Company not found' } });
    return;
  }

  const nodes = getNodes(db, companyId);
  const hasRun = nodes.length > 0;
  const ideaNode = nodes.find((n) => n.type === 'idea');

  res.json({
    data: {
      hasRun,
      nodeCount: nodes.length,
      ideaTitle: ideaNode?.title || null,
    },
  });
});
