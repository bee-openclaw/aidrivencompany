import { Router } from 'express';
import type Database from 'better-sqlite3';
import { getDecisions, createDecision } from '@aidrivencompany/db';

export const decisionsRouter = Router();

decisionsRouter.get('/companies/:companyId/decisions', (req, res) => {
  const db = req.app.locals.db as Database.Database;
  const decisions = getDecisions(db, req.params.companyId);
  res.json({ data: decisions });
});

decisionsRouter.post('/companies/:companyId/decisions', (req, res) => {
  const db = req.app.locals.db as Database.Database;
  const { nodeId, title, options, chosenOption, rationale, simulationId } = req.body as {
    nodeId?: string;
    title: string;
    options: { label: string; description: string }[];
    chosenOption?: string;
    rationale: string;
    simulationId?: string;
  };
  if (!title || !options || !rationale) {
    res.status(400).json({ error: { code: 'VALIDATION', message: 'Title, options, and rationale are required' } });
    return;
  }
  const decision = createDecision(db, {
    companyId: req.params.companyId,
    nodeId,
    title,
    options,
    chosenOption,
    rationale,
    simulationId,
  });
  res.status(201).json({ data: decision });
});
