import { Router } from 'express';
import type Database from 'better-sqlite3';
import { getProofItems, createProofItem } from '@aidrivencompany/db';

export const proofRouter = Router();

proofRouter.get('/companies/:companyId/proof', (req, res) => {
  const db = req.app.locals.db as Database.Database;
  const items = getProofItems(db, req.params.companyId);
  res.json({ data: items });
});

proofRouter.post('/companies/:companyId/proof', (req, res) => {
  const db = req.app.locals.db as Database.Database;
  const { nodeId, type, source, content, impactScore } = req.body as {
    nodeId?: string;
    type: string;
    source: string;
    content: string;
    impactScore?: number;
  };
  if (!type || !source || !content) {
    res.status(400).json({ error: { code: 'VALIDATION', message: 'Type, source, and content are required' } });
    return;
  }
  const item = createProofItem(db, {
    companyId: req.params.companyId,
    nodeId,
    type,
    source,
    content,
    impactScore,
  });
  res.status(201).json({ data: item });
});
